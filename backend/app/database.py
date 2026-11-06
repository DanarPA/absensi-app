from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Host 'db' dipakai jika via Docker, 'localhost' jika API di-run langsung di terminal OS
# Cukup tambahkan +psycopg
SQLALCHEMY_DATABASE_URL = "postgresql+psycopg://postgres:secretpassword@localhost:5432/absensi_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency DB session untuk FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()