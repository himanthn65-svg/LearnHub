from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
import base64

from app.db.database import get_db
from app.models.users import User


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# ============================================================
# REGISTER
# ============================================================

@router.post("/register")
def register_user(
    username: str,
    email: str,
    password: str,
    db: Session = Depends(get_db)
):

    existing_username = db.query(User).filter(
        User.username == username
    ).first()

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    existing_email = db.query(User).filter(
        User.email == email
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    new_user = User(
        username=username,
        email=email,
        password=password,
        is_verified=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "username": new_user.username,
        "email": new_user.email
    }


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
def login_user(
    username: str,
    password: str,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.username == username
    ).first()

    if not user or user.password != password:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    return {
        "message": "Login successful",
        "username": user.username,
        "email": user.email
    }


# ============================================================
# GET USER PROFILE
# ============================================================

@router.get("/profile/{username}")
def get_user_profile(
    username: str,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.username == username
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "profile_picture": user.profile_picture,
        "about": user.about
    }


# ============================================================
# UPDATE USER PROFILE
#
# Username       -> Can change
# Email          -> Cannot change
# About          -> Can change
# Profile photo  -> Add / Change / Remove
# ============================================================

@router.put("/profile/{username}")
async def update_user_profile(
    username: str,

    new_username: str = Form(...),

    about: Optional[str] = Form(None),

    profile_picture: Optional[UploadFile] = File(None),

    remove_profile_picture: bool = Form(False),

    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Find current user
    # --------------------------------------------------------

    user = db.query(User).filter(
        User.username == username
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    # --------------------------------------------------------
    # Validate new username
    # --------------------------------------------------------

    new_username = new_username.strip()

    if not new_username:
        raise HTTPException(
            status_code=400,
            detail="Username cannot be empty"
        )


    # --------------------------------------------------------
    # Check username availability
    # --------------------------------------------------------

    if new_username != user.username:

        existing_user = db.query(User).filter(
            User.username == new_username
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Username already exists"
            )

        user.username = new_username


    # --------------------------------------------------------
    # Update About
    # --------------------------------------------------------

    if about is not None:

        user.about = about.strip()


    # --------------------------------------------------------
    # Remove profile picture
    # --------------------------------------------------------

    if remove_profile_picture:

        user.profile_picture = None


    # --------------------------------------------------------
    # Add / Change profile picture
    # --------------------------------------------------------

    if profile_picture is not None:

        if not profile_picture.filename:
            raise HTTPException(
                status_code=400,
                detail="Invalid profile picture."
            )

        if not profile_picture.content_type:
            raise HTTPException(
                status_code=400,
                detail="Invalid profile picture type."
            )

        if not profile_picture.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="Only image files are allowed."
            )

        image_bytes = await profile_picture.read()

        # Maximum 5 MB
        if len(image_bytes) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="Profile picture must be smaller than 5 MB."
            )

        encoded_image = base64.b64encode(
            image_bytes
        ).decode("utf-8")

        user.profile_picture = (
            f"data:{profile_picture.content_type};base64,"
            f"{encoded_image}"
        )


    # --------------------------------------------------------
    # IMPORTANT
    # Email is NEVER changed here.
    # --------------------------------------------------------

    db.commit()
    db.refresh(user)


    # --------------------------------------------------------
    # Return updated profile
    # --------------------------------------------------------

    return {
        "message": "Profile updated successfully",
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "profile_picture": user.profile_picture,
        "about": user.about
    }