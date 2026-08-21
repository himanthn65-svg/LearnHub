from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.users import User
from app.models.quiz import QuizAttempt


router = APIRouter(
    prefix="/admin/users",
    tags=["Admin User Management"]
)


# ============================================================
# ADD USER REQUEST MODEL
# ============================================================

class AdminCreateUser(BaseModel):

    username: str
    email: EmailStr
    password: str


# ============================================================
# ADD USER
# ============================================================

@router.post("/add")
def add_user(
    user_data: AdminCreateUser,
    db: Session = Depends(get_db)
):

    # Check whether username already exists
    existing_username = db.query(User).filter(
        User.username == user_data.username
    ).first()

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    # Check whether email already exists
    existing_email = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    # Create new user
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password=user_data.password,
        profile_picture=None,
        about=None,
        is_verified=False
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email
        }
    }


# ============================================================
# DELETE USER
# ============================================================

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):

    # Find user
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Never allow deletion of the main admin account
    if user.username == "Lohitha14":
        raise HTTPException(
            status_code=403,
            detail="Main admin account cannot be deleted"
        )

    # ========================================================
    # DELETE USER'S QUIZ ATTEMPTS FIRST
    # ========================================================

    db.query(QuizAttempt).filter(
        QuizAttempt.user_id == user_id
    ).delete(
        synchronize_session=False
    )

    # ========================================================
    # DELETE USER
    # ========================================================

    db.delete(user)

    db.commit()

    return {
        "message": "User and related quiz attempts deleted successfully",
        "user_id": user_id
    }