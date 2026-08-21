from fastapi import APIRouter

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)


CATEGORIES = {
    "Programming": [
        "C",
        "Java",
        "Python"
    ],
    "Web Development": [
        "HTML",
        "CSS",
        "JavaScript",
        "React"
    ],
    "AI & ML": [
        "Machine Learning",
        "Deep Learning",
        "NLP"
    ],
    "Database": [
        "MySQL",
        "MongoDB"
    ],
    "Aptitude": [
        "Aptitude"
    ]
}


LEVELS = [
    "Basic",
    "Intermediate",
    "Advanced"
]


@router.get("/")
def get_categories():
    return {
        "categories": CATEGORIES,
        "levels": LEVELS
    }


@router.get("/{category}")
def get_category(category: str):

    if category not in CATEGORIES:
        return {
            "message": "Category not found"
        }

    return {
        "category": category,
        "subjects": CATEGORIES[category],
        "levels": LEVELS
    }