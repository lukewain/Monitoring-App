import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


def _get_database_url() -> str:
    return os.getenv("DATABASE_URL", "postgresql+psycopg2://logs:logs@localhost:5432/logs")


engine = create_engine(_get_database_url(), pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)