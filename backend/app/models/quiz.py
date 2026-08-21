from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)

    category = Column(String(50), nullable=False)
    subject = Column(String(50), nullable=False)
    level = Column(String(20), nullable=False)

    question = Column(Text, nullable=False)

    option_a = Column(String(500), nullable=False)
    option_b = Column(String(500), nullable=False)
    option_c = Column(String(500), nullable=False)
    option_d = Column(String(500), nullable=False)

    correct_answer = Column(String(1), nullable=False)

    explanation = Column(Text, nullable=True)


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    category = Column(String(50), nullable=False)
    subject = Column(String(50), nullable=False)
    level = Column(String(20), nullable=False)

    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    score = Column(Integer, nullable=False)
    points = Column(Integer, nullable=False)

    attempted_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")