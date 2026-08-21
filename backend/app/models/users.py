from sqlalchemy import Column, Integer, String, Text, Boolean
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    username = Column(String(50), unique=True, nullable=False, index=True)

    email = Column(String(100), unique=True, nullable=False, index=True)

    password = Column(String(255), nullable=False)

    profile_picture = Column(String(500), nullable=True)

    about = Column(Text, nullable=True)

    is_verified = Column(Boolean, nullable=False, default=False)