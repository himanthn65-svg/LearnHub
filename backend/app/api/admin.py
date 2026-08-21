from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.users import User
from app.models.quiz import Question, QuizAttempt


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# ============================================================
# ADMIN LOGIN
# ============================================================

@router.post("/login")
def admin_login(
    username: str,
    password: str,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.username == username
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid admin username or password"
        )

    if user.password != password:
        raise HTTPException(
            status_code=401,
            detail="Invalid admin username or password"
        )

    # Only Lohitha14 can access the admin dashboard
    if user.username != "Lohitha14":
        raise HTTPException(
            status_code=403,
            detail="Admin access denied"
        )

    return {
        "message": "Admin login successful",
        "username": user.username,
        "email": user.email,
        "is_admin": True
    }


# ============================================================
# GET ALL USERS
# ============================================================

@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db)
):

    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "profile_picture": user.profile_picture,
            "about": user.about
        }
        for user in users
    ]


# ============================================================
# GET ALL QUESTIONS
# ============================================================

@router.get("/questions")
def get_all_questions(
    db: Session = Depends(get_db)
):

    questions = db.query(Question).all()

    return [
        {
            "id": question.id,
            "category": question.category,
            "subject": question.subject,
            "level": question.level,
            "question": question.question,
            "option_a": question.option_a,
            "option_b": question.option_b,
            "option_c": question.option_c,
            "option_d": question.option_d,
            "correct_answer": question.correct_answer,
            "explanation": question.explanation
        }
        for question in questions
    ]


# ============================================================
# DELETE QUESTION
# ============================================================

@router.delete("/questions/{question_id}")
def delete_question(
    question_id: int,
    db: Session = Depends(get_db)
):

    question = db.query(Question).filter(
        Question.id == question_id
    ).first()

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found"
        )

    db.delete(question)
    db.commit()

    return {
        "message": "Question deleted successfully",
        "question_id": question_id
    }


# ============================================================
# GET ALL QUIZ ATTEMPTS
# ============================================================

@router.get("/attempts")
def get_all_attempts(
    db: Session = Depends(get_db)
):

    attempts = db.query(QuizAttempt).all()

    results = []

    for attempt in attempts:

        user = db.query(User).filter(
            User.id == attempt.user_id
        ).first()

        results.append({
            "id": attempt.id,
            "user_id": attempt.user_id,
            "username": user.username if user else "Unknown",
            "category": attempt.category,
            "subject": attempt.subject,
            "level": attempt.level,
            "total_questions": attempt.total_questions,
            "correct_answers": attempt.correct_answers,
            "score": attempt.score,
            "points": attempt.points
        })

    return results


# ============================================================
# ADMIN STATISTICS
# ============================================================

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db)
):

    total_users = db.query(User).count()
    total_questions = db.query(Question).count()
    total_attempts = db.query(QuizAttempt).count()

    return {
        "total_users": total_users,
        "total_questions": total_questions,
        "total_quiz_attempts": total_attempts
    }