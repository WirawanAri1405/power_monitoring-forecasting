from django.http import JsonResponse
from pyspark.sql import SparkSession
from pyspark.ml.feature import VectorAssembler
from pyspark.ml.regression import RandomForestRegressor
from pyspark.ml.evaluation import RegressionEvaluator
from pyspark.ml import Pipeline

# === SparkSession Global (dibuat sekali saja) ===
spark = SparkSession.builder \
    .appName("PowerPredictionRF") \
    .master("local[*]") \
    .config("spark.jars.packages", "org.mongodb.spark:mongo-spark-connector_2.12:10.5.0") \
    .config("spark.mongodb.read.connection.uri", "mongodb://localhost:27017") \
    .config("spark.mongodb.write.connection.uri", "mongodb://localhost:27017") \
    .getOrCreate()


def run_prediction(request):
    try:
        # === Baca data dari MongoDB (wajib set database & collection) ===
        df = spark.read.format("mongodb") \
            .option("database", "iot_db") \
            .option("collection", "pzem_data1") \
            .load()

        if df.count() == 0:
            return JsonResponse({
                "predicted_power": 0,
                "error": "No data in MongoDB collection."
            })

        # === Siapkan fitur ===
        feature_cols = ["voltage", "current", "pf"]

        # buang baris null di fitur atau target
        df = df.na.drop(subset=feature_cols + ["power"])

        assembler = VectorAssembler(inputCols=feature_cols, outputCol="features")

        # Random Forest Regressor
        rf = RandomForestRegressor(
            featuresCol="features",
            labelCol="power",
            numTrees=50
        )

        # Pipeline
        pipeline = Pipeline(stages=[assembler, rf])

        # Split train & test
        train_data, test_data = df.randomSplit([0.8, 0.2], seed=42)

        # Training model
        model = pipeline.fit(train_data)

        # Prediksi di test set
        predictions = model.transform(test_data)

        # Evaluasi dengan RMSE
        evaluator = RegressionEvaluator(
            labelCol="power",
            predictionCol="prediction",
            metricName="rmse"
        )
        rmse = evaluator.evaluate(predictions)

        # Ambil rata-rata hasil prediksi
        avg_prediction = predictions.selectExpr("avg(prediction)").first()[0]

        return JsonResponse({
            "predicted_power": avg_prediction,
            "rmse": rmse,
            "message": "Prediction using Random Forest completed."
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def prediction_home(request):
    return JsonResponse({
        "message": "This is the prediction home. Use /prediction/run/ to get prediction."
    })
