# python -m pip install "pymongo[srv]==3.12"
from python_packages.service_repository.mongo_db import MongoDB
from python_packages.config import ProductionConfig

config = ProductionConfig

if __name__ == "__main__":
    mongodb = MongoDB(
        config.MONGO_DB_NAME,
        config.MONGO_DB_USER,
        config.MONGO_DB_PASS,
        config.MONGO_DB_REST_URL)
    query = {
        "name": "Oleg"
    }
    mongodb.insert_document("main", query)