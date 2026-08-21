import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the .env file")


# Remove Aiven's ssl_mode URL parameter because
# PyMySQL does not accept ssl_mode as a connection argument.
if "ssl_mode=" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.split("?")[0]


engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={
        "ssl": {}
    }
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()