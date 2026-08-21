import json

from app.db.database import SessionLocal
from app.models.quiz import Question


def import_questions():
    db = SessionLocal()

    try:
        with open("data/questions.json", "r", encoding="utf-8") as file:
            questions = json.load(file)

        if not isinstance(questions, list):
            print("Import failed: questions.json must contain a top-level JSON array.")
            return

        added = 0
        skipped = 0

        # Load existing questions once instead of querying MySQL
        # for every question individually.
        existing_questions = db.query(
            Question.category,
            Question.subject,
            Question.level,
            Question.question
        ).all()

        existing_keys = {
            (
                row.category,
                row.subject,
                row.level,
                row.question
            )
            for row in existing_questions
        }

        # Also prevent duplicate questions inside questions.json itself.
        seen_in_json = set()

        total = len(questions)

        print(f"Found {total} question(s) in questions.json.")
        print("Starting import...\n")

        for index, item in enumerate(questions, start=1):

            key = (
                item["category"],
                item["subject"],
                item["level"],
                item["question"]
            )

            # Skip duplicates already in the database
            if key in existing_keys:
                skipped += 1
                continue

            # Skip duplicates inside the JSON file
            if key in seen_in_json:
                skipped += 1
                continue

            new_question = Question(
                category=item["category"],
                subject=item["subject"],
                level=item["level"],
                question=item["question"],
                option_a=item["option_a"],
                option_b=item["option_b"],
                option_c=item["option_c"],
                option_d=item["option_d"],
                correct_answer=item["correct_answer"].upper(),
                explanation=item.get("explanation")
            )

            db.add(new_question)

            # Remember it so it won't be imported twice
            existing_keys.add(key)
            seen_in_json.add(key)

            added += 1

            # Show progress every 25 questions
            if index % 25 == 0 or index == total:
                print(f"Processed {index}/{total} questions...")

        db.commit()

        print("\n----------------------------------------")
        print("IMPORT COMPLETED")
        print("----------------------------------------")
        print(f"Successfully imported: {added} new question(s).")
        print(f"Skipped: {skipped} duplicate question(s).")
        print("----------------------------------------")

    except Exception as error:
        db.rollback()

        print("\nImport failed:")
        print(error)

    finally:
        db.close()


if __name__ == "__main__":
    import_questions()