from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.models.users import User
from app.models.quiz import QuizAttempt

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


# GET USER DASHBOARD STATISTICS
@router.get("/{username}")
def get_dashboard(
    username: str,
    db: Session = Depends(get_db)
):
    # Find user
    user = db.query(User).filter(
        User.username == username
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Get all quiz attempts of this user
    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == user.id
    ).all()

    # No quizzes attempted yet
    if not attempts:
        return {
            "username": user.username,
            "email": user.email,
            "profile_picture": user.profile_picture,
            "about": user.about,
            "total_quizzes_attempted": 0,
            "average_score": 0,
            "best_score": 0,
            "accuracy": 0,
            "total_points": 0
        }

    # Total quizzes
    total_quizzes = len(attempts)

    # Average score
    average_score = round(
        sum(attempt.score for attempt in attempts) / total_quizzes,
        2
    )

    # Best score
    best_score = max(
        attempt.score for attempt in attempts
    )

    # Total questions and correct answers
    total_questions = sum(
        attempt.total_questions for attempt in attempts
    )

    total_correct = sum(
        attempt.correct_answers for attempt in attempts
    )

    # Accuracy
    if total_questions > 0:
        accuracy = round(
            (total_correct / total_questions) * 100,
            2
        )
    else:
        accuracy = 0

    # Total points
    total_points = sum(
        attempt.points for attempt in attempts
    )

    return {
        "username": user.username,
        "email": user.email,
        "profile_picture": user.profile_picture,
        "about": user.about,
        "total_quizzes_attempted": total_quizzes,
        "average_score": average_score,
        "best_score": best_score,
        "accuracy": accuracy,
        "total_points": total_points
    }