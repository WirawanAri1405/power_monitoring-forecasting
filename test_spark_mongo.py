from pyspark.sql import SparkSession
import pymongo

def main():
    print("Memulai tes koneksi PySpark ke MongoDB...")

    # --- 1. Masukkan data dummy ---
    client = pymongo.MongoClient("mongodb://localhost:27017/")
    db = client["spark_test_db"]
    collection = db["test_collection"]
    collection.delete_many({})
    collection.insert_many([
        {"nama": "Produk A", "harga": 1500, "kategori": "Elektronik"},
        {"nama": "Produk B", "harga": 2500, "kategori": "Buku"}
    ])
    print(">>> Data dummy berhasil dimasukkan.")

    # --- 2. Inisialisasi SparkSession ---
    # ganti versi sesuai Spark kamu
    spark = SparkSession.builder \
        .appName("MongoConnectionTest") \
        .master("local[*]") \
        .config("spark.jars.packages", "org.mongodb.spark:mongo-spark-connector_2.12:10.5.0") \
        .getOrCreate()

    print(">>> SparkSession berhasil dibuat.")

    # --- 3. Baca data dari MongoDB --
    df = spark.read.format("mongodb") \
        .option("uri", "mongodb://localhost:27017/") \
        .option("database", "spark_test_db") \
        .option("collection", "test_collection") \
        .load()

    print(">>> Berhasil membaca data! Menampilkan isi DataFrame:")
    df.show()

    spark.stop()
    print("Sesi Spark dihentikan.")

if __name__ == "__main__":
    main()
