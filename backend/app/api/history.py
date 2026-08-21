from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.quiz import QuizAttempt
from app.models.users import User


router = APIRouter(
    prefix="/history",
    tags=["Quiz History"]
)


@router.get("/{username}")
def get_quiz_history(
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

    # Get user's quiz attempts
    attempts = (
        db.query(QuizAttempt)
        .filter(
            QuizAttempt.user_id == user.id
        )
        .order_by(
            QuizAttempt.id.desc()
        )
        .all()
    )

    history = []

    for attempt in attempts:

        history.append({
            "id": attempt.id,
            "category": attempt.category,
            "subject": attempt.subject,
            "level": attempt.level,
            "total_questions": attempt.total_questions,
            "correct_answers": attempt.correct_answers,
            "score": attempt.score,
            "points": attempt.points
        })

    # Summary
    total_attempts = len(attempts)

    if total_attempts > 0:

        average_score = round(
            sum(attempt.score for attempt in attempts)
            / total_attempts,
            2
        )

        best_score = max(
            attempt.score for attempt in attempts
        )

        total_points = sum(
            attempt.points for attempt in attempts
        )

    else:

        average_score = 0
        best_score = 0
        total_points = 0

    return {
        "username": user.username,
        "total_attempts": total_attempts,
        "average_score": average_score,
        "best_score": best_score,
        "total_points": total_points,
        "history": history
    }