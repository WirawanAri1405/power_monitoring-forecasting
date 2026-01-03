from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from pyspark.sql import SparkSession
from pyspark.ml.feature import VectorAssembler
from pyspark.ml.regression import RandomForestRegressor, GBTRegressor, LinearRegression
from pyspark.ml.evaluation import RegressionEvaluator
from pyspark.ml import Pipeline
import sys
sys.path.append('..')
from monitoring.models import Device

# === Indonesian Electricity Tariff (PLN) ===
TARIFF_PLN = {
    '450VA': 415,      # Subsidi
    '900VA': 1352,     # R1 900VA
    '1300VA': 1444,    # R1 1300VA
    '2200VA': 1444     # R1 2200VA+
}

# === SparkSession Global (dibuat sekali saja) ===
try:
    spark = SparkSession.builder \
        .appName("PowerPredictionMultiAlgo") \
        .master("local[*]") \
        .config("spark.jars.packages", "org.mongodb.spark:mongo-spark-connector_2.12:10.5.0") \
        .config("spark.mongodb.read.connection.uri", "mongodb://localhost:27017") \
        .config("spark.mongodb.write.connection.uri", "mongodb://localhost:27017") \
        .getOrCreate()
    
    # Set log level to reduce verbosity
    spark.sparkContext.setLogLevel("WARN")
except Exception as e:
    spark = None
    print(f"Failed to initialize Spark Session: {e}")


def get_model_by_algorithm(algo):
    """
    Factory function untuk memilih model berdasarkan algoritma
    
    Args:
        algo (str): Algorithm identifier ('rf', 'gbt', 'lr')
    
    Returns:
        tuple: (model_instance, model_name)
    """
    algo = algo.lower()
    
    if algo == 'gbt':
        model = GBTRegressor(
            featuresCol="features",
            labelCol="power",
            maxIter=50,
            maxDepth=5
        )
        return model, "Gradient Boosted Trees"
    
    elif algo == 'lr':
        model = LinearRegression(
            featuresCol="features",
            labelCol="power",
            maxIter=100,
            regParam=0.1
        )
        return model, "Linear Regression"
    
    else:  # default: 'rf'
        model = RandomForestRegressor(
            featuresCol="features",
            labelCol="power",
            numTrees=50,
            maxDepth=10
        )
        return model, "Random Forest"


def calculate_electricity_cost(predicted_power_watt, meter_type):
    """
    Menghitung estimasi biaya listrik per jam berdasarkan tarif PLN Indonesia
    
    Args:
        predicted_power_watt (float): Predicted power in Watts
        meter_type (str): Meter type (e.g., '900VA', '1300VA')
    
    Returns:
        float: Estimated hourly cost in Rupiah
    """
    # Validasi meter type
    if meter_type not in TARIFF_PLN:
        # Default ke 900VA jika tidak valid
        meter_type = '900VA'
    
    # Konversi Watt ke kWh (untuk 1 jam)
    power_kwh = predicted_power_watt / 1000.0
    
    # Hitung biaya
    tariff = TARIFF_PLN[meter_type]
    estimated_cost = power_kwh * tariff
    
    return round(estimated_cost, 2)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def run_prediction(request):
    """
    Main prediction endpoint dengan multi-algorithm support dan cost calculator
    
    Query Parameters:
        - device_id (required): Device ID to run prediction for
        - algo: Algorithm to use ('rf', 'gbt', 'lr'). Default: 'rf'
        - meter_type: PLN meter type ('450VA', '900VA', '1300VA', '2200VA'). Default: '900VA'
    
    Returns:
        JsonResponse with prediction results, RMSE, algorithm used, and estimated cost
    """
    try:
        # === Validasi Spark Session ===
        if spark is None:
            return JsonResponse({
                "error": "Spark Session not initialized. Please check server configuration."
            }, status=500)
        
        # === Get Query Parameters ===
        device_id = request.GET.get('device_id')
        
        if not device_id:
            return JsonResponse({
                "error": "device_id parameter is required"
            }, status=400)
        
        # Validate device ownership
        try:
            device = Device.objects.get(device_id=device_id, user=request.user)
        except Device.DoesNotExist:
            return JsonResponse({
                "error": "Device not found or you do not have permission to access it"
            }, status=403)
        
        algo = request.GET.get('algo', 'rf').lower()
        meter_type = request.GET.get('meter_type', '900VA').upper()
        
        # Validasi meter_type
        if meter_type not in TARIFF_PLN:
            return JsonResponse({
                "error": f"Invalid meter_type. Valid options: {list(TARIFF_PLN.keys())}"
            }, status=400)
        
        # === Baca data dari MongoDB ===
        try:
            df = spark.read.format("mongodb") \
                .option("database", "iot_db") \
                .option("collection", "pzem_data1") \
                .load()
            
            # Filter by device_id
            df = df.filter(df.device_id == device_id)
            
        except Exception as mongo_error:
            return JsonResponse({
                "error": f"MongoDB connection failed: {str(mongo_error)}",
                "hint": "Please ensure MongoDB is running and accessible at localhost:27017"
            }, status=500)
        
        # === Validasi Data ===
        if df.count() == 0:
            return JsonResponse({
                "predicted_power": 0,
                "rmse": 0,
                "algo_used": "N/A",
                "estimated_hourly_cost": 0,
                "device_id": device_id,
                "device_name": device.name,
                "error": f"No data in MongoDB for device '{device.name}'."
            }, status=404)
        
        # === Siapkan fitur ===
        feature_cols = ["voltage", "current", "pf"]
        
        # Buang baris null di fitur atau target
        df_clean = df.na.drop(subset=feature_cols + ["power"])
        
        if df_clean.count() == 0:
            return JsonResponse({
                "error": "No valid data after removing null values. Please check data quality."
            }, status=400)
        
        # === Vector Assembler ===
        assembler = VectorAssembler(inputCols=feature_cols, outputCol="features")
        
        # === Pilih Model berdasarkan Algorithm ===
        model, model_name = get_model_by_algorithm(algo)
        
        # === Pipeline ===
        pipeline = Pipeline(stages=[assembler, model])
        
        # === Split train & test ===
        train_data, test_data = df_clean.randomSplit([0.8, 0.2], seed=42)
        
        # Validasi test data
        if test_data.count() == 0:
            return JsonResponse({
                "error": "Insufficient data for train/test split. Need more records."
            }, status=400)
        
        # === Training model ===
        try:
            trained_model = pipeline.fit(train_data)
        except Exception as train_error:
            return JsonResponse({
                "error": f"Model training failed: {str(train_error)}"
            }, status=500)
        
        # === Prediksi di test set ===
        predictions = trained_model.transform(test_data)
        
        # === Evaluasi dengan RMSE ===
        evaluator = RegressionEvaluator(
            labelCol="power",
            predictionCol="prediction",
            metricName="rmse"
        )
        rmse = evaluator.evaluate(predictions)
        
        # === Ambil rata-rata hasil prediksi ===
        avg_prediction = predictions.selectExpr("avg(prediction)").first()[0]
        
        # === Hitung Estimasi Biaya Listrik ===
        estimated_cost = calculate_electricity_cost(avg_prediction, meter_type)
        
        # === Return Response ===
        return JsonResponse({
            "device_id": device_id,
            "device_name": device.name,
            "predicted_power": round(avg_prediction, 2),
            "rmse": round(rmse, 2),
            "algo_used": model_name,
            "meter_type": meter_type,
            "tariff_per_kwh": TARIFF_PLN[meter_type],
            "estimated_hourly_cost": estimated_cost,
            "message": f"Prediction using {model_name} completed successfully.",
            "data_stats": {
                "total_records": df.count(),
                "clean_records": df_clean.count(),
                "train_records": train_data.count(),
                "test_records": test_data.count()
            }
        })
    
    except Exception as e:
        return JsonResponse({
            "error": f"Unexpected error: {str(e)}",
            "type": type(e).__name__
        }, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def prediction_home(request):
    """
    API Home endpoint dengan dokumentasi
    """
    return JsonResponse({
        "message": "Power Monitoring - Prediction API",
        "version": "3.0",
        "endpoints": {
            "/prediction/": "This documentation page",
            "/prediction/run/": "Run prediction with multi-algorithm support (requires authentication)"
        },
        "usage": {
            "endpoint": "/prediction/run/",
            "method": "GET",
            "authentication": "Required (Bearer token)",
            "parameters": {
                "device_id": {
                    "type": "string",
                    "required": True,
                    "description": "Device ID to run prediction for"
                },
                "algo": {
                    "type": "string",
                    "options": ["rf", "gbt", "lr"],
                    "default": "rf",
                    "description": "Algorithm to use (rf=Random Forest, gbt=Gradient Boosted Trees, lr=Linear Regression)"
                },
                "meter_type": {
                    "type": "string",
                    "options": ["450VA", "900VA", "1300VA", "2200VA"],
                    "default": "900VA",
                    "description": "PLN meter type for cost calculation"
                }
            },
            "example": "/prediction/run/?device_id=<device_id>&algo=gbt&meter_type=1300VA"
        },
        "tariff_info": TARIFF_PLN
    })
