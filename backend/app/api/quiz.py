from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel

from app.db.database import get_db
from app.models.quiz import Question, QuizAttempt
from app.models.users import User


router = APIRouter(
    prefix="/quiz",
    tags=["Quiz"]
)


# ============================================================
# QUIZ ANSWER MODEL
# ============================================================

class QuizAnswer(BaseModel):
    question_id: int
    answer: str


# ============================================================
# QUIZ SUBMISSION MODEL
# ============================================================

class QuizSubmission(BaseModel):
    username: str
    category: str
    subject: str
    level: str
    answers: list[QuizAnswer]


# ============================================================
# ADD QUESTION
# ============================================================

@router.post("/questions")
def add_question(
    category: str,
    subject: str,
    level: str,
    question: str,
    option_a: str,
    option_b: str,
    option_c: str,
    option_d: str,
    correct_answer: str,
    explanation: str = None,
    db: Session = Depends(get_db)
):

    if level not in [
        "Basic",
        "Intermediate",
        "Advanced"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Level must be Basic, Intermediate, or Advanced"
        )

    correct_answer = correct_answer.upper()

    if correct_answer not in [
        "A",
        "B",
        "C",
        "D"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Correct answer must be A, B, C, or D"
        )

    new_question = Question(
        category=category,
        subject=subject,
        level=level,
        question=question,
        option_a=option_a,
        option_b=option_b,
        option_c=option_c,
        option_d=option_d,
        correct_answer=correct_answer,
        explanation=explanation
    )

    db.add(new_question)
    db.commit()
    db.refresh(new_question)

    return {
        "message": "Question added successfully",
        "question_id": new_question.id
    }


# ============================================================
# GET QUESTIONS - ADMIN / TESTING
# ============================================================

@router.get("/questions")
def get_questions(
    category: str = None,
    subject: str = None,
    level: str = None,
    db: Session = Depends(get_db)
):

    query = db.query(Question)

    if category:
        query = query.filter(
            Question.category == category
        )

    if subject:
        query = query.filter(
            Question.subject == subject
        )

    if level:
        query = query.filter(
            Question.level == level
        )

    questions = query.all()

    return [
        {
            "id": q.id,
            "category": q.category,
            "subject": q.subject,
            "level": q.level,
            "question": q.question,
            "option_a": q.option_a,
            "option_b": q.option_b,
            "option_c": q.option_c,
            "option_d": q.option_d,
            "correct_answer": q.correct_answer,
            "explanation": q.explanation
        }
        for q in questions
    ]


# ============================================================
# START STUDENT QUIZ
# ============================================================

@router.get("/start")
def start_quiz(
    category: str,
    subject: str,
    level: str,
    db: Session = Depends(get_db)
):

    if level not in [
        "Basic",
        "Intermediate",
        "Advanced"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Level must be Basic, Intermediate, or Advanced"
        )

    # ========================================================
    # GET 50 RANDOM QUESTIONS
    # ========================================================

    questions = db.query(Question).filter(
        Question.category == category,
        Question.subject == subject,
        Question.level == level
    ).order_by(
        func.rand()
    ).limit(50).all()

    if not questions:

        raise HTTPException(
            status_code=404,
            detail="No questions found for this category, subject, and level"
        )

    return {
        "category": category,
        "subject": subject,
        "level": level,
        "total_questions": len(questions),

        "questions": [

            {
                "id": q.id,
                "question": q.question,
                "option_a": q.option_a,
                "option_b": q.option_b,
                "option_c": q.option_c,
                "option_d": q.option_d
            }

            for q in questions
        ]
    }


# ============================================================
# SUBMIT / QUIT QUIZ
#
# This endpoint handles BOTH:
#
# 1. Normal final submission
# 2. Early quit submission
#
# The frontend sends only the answers the user has selected.
# ============================================================

@router.post("/submit")
def submit_quiz(
    submission: QuizSubmission,
    db: Session = Depends(get_db)
):

    # ========================================================
    # FIND USER
    # ========================================================

    user = db.query(User).filter(
        User.username == submission.username
    ).first()

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # ========================================================
    # VALIDATE LEVEL
    # ========================================================

    if submission.level not in [
        "Basic",
        "Intermediate",
        "Advanced"
    ]:

        raise HTTPException(
            status_code=400,
            detail="Invalid level"
        )

    # ========================================================
    # VALIDATE ANSWERS
    # ========================================================

    if not submission.answers:

        raise HTTPException(
            status_code=400,
            detail="No answers submitted"
        )

    # ========================================================
    # CHECK ANSWERS
    # ========================================================

    correct_answers = 0
    results = []

    for submitted in submission.answers:

        question = db.query(Question).filter(
            Question.id == submitted.question_id
        ).first()

        if not question:
            continue

        user_answer = submitted.answer.upper()

        if user_answer not in [
            "A",
            "B",
            "C",
            "D"
        ]:
            continue

        is_correct = (
            user_answer ==
            question.correct_answer
        )

        if is_correct:
            correct_answers += 1

        results.append({

            "question_id":
                question.id,

            "your_answer":
                user_answer,

            "correct_answer":
                question.correct_answer,

            "is_correct":
                is_correct,

            "explanation":
                question.explanation

        })

    # ========================================================
    # TOTAL ANSWERED QUESTIONS
    #
    # Important:
    # When user quits early, only answered questions are counted.
    # ========================================================

    total_questions = len(results)

    if total_questions == 0:

        raise HTTPException(
            status_code=400,
            detail="No valid questions were answered"
        )

    # ========================================================
    # CALCULATE SCORE
    # ========================================================

    score = round(
        (correct_answers / total_questions) * 100
    )

    # ========================================================
    # CALCULATE POINTS
    # ========================================================

    points = correct_answers * 10

    # ========================================================
    # SAVE QUIZ ATTEMPT
    # ========================================================

    attempt = QuizAttempt(

        user_id=user.id,

        category=submission.category,

        subject=submission.subject,

        level=submission.level,

        total_questions=total_questions,

        correct_answers=correct_answers,

        score=score,

        points=points

    )

    db.add(attempt)

    db.commit()

    db.refresh(attempt)

    # ========================================================
    # RETURN RESULT
    # ========================================================

    return {

        "message":
            "Quiz submitted successfully",

        "total_questions":
            total_questions,

        "correct_answers":
            correct_answers,

        "score":
            score,

        "points":
            points,

        "results":
            results

    }