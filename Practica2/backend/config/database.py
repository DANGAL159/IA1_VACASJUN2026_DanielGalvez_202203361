from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# La URL apunta al nombre del servicio en docker-compose ('db')
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:adminpassword@db:5432/smartbotdb"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()