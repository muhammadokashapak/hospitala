from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# To configure PostgreSQL locally, replace with actual credentials
# format: postgresql://user:password@localhost/dbname
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hospital_db.sqlite3")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
