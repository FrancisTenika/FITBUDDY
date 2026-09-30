import os
import tempfile
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.orm import declarative_base, sessionmaker

# SQLite database path configuration (handles Vercel read-only serverless environment)
if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
    db_path = os.path.join(tempfile.gettempdir(), "fitbuddy.db")
    DATABASE_URL = f"sqlite:///{db_path}"
else:
    DATABASE_URL = "sqlite:///./fitbuddy.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


# User table
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    weight = Column(String, nullable=False)
    goal = Column(String, nullable=False)
    intensity = Column(String, nullable=False)
    workout_plan = Column(Text, nullable=True)
    nutrition_tip = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)


# Create database tables safely
Base.metadata.create_all(bind=engine)


# Save a new user and workout plan
def save_user(
    name,
    age,
    weight,
    goal,
    intensity,
    workout_plan,
    nutrition_tip
):
    db = SessionLocal()

    try:
        user = User(
            name=name,
            age=age,
            weight=weight,
            goal=goal,
            intensity=intensity,
            workout_plan=workout_plan,
            nutrition_tip=nutrition_tip
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user
    except Exception as e:
        db.rollback()
        # In-memory mock fallback object if DB error occurs
        class MockUser:
            def __init__(self):
                self.id = 1
                self.name = name
                self.age = age
                self.weight = weight
                self.goal = goal
                self.intensity = intensity
                self.workout_plan = workout_plan
                self.nutrition_tip = nutrition_tip
                self.feedback = None
        return MockUser()
    finally:
        db.close()


# Get all users
def get_all_users():
    db = SessionLocal()

    try:
        return db.query(User).all()
    except Exception:
        return []
    finally:
        db.close()


# Get one user by ID
def get_user(user_id):
    db = SessionLocal()

    try:
        return db.query(User).filter(User.id == user_id).first()
    except Exception:
        return None
    finally:
        db.close()


# Update a user's workout plan
def update_workout_plan(user_id, new_plan):
    db = SessionLocal()

    try:
        user = db.query(User).filter(User.id == user_id).first()

        if user:
            user.workout_plan = new_plan
            db.commit()
            db.refresh(user)

        return user
    except Exception:
        db.rollback()
        return None
    finally:
        db.close()


# Save user feedback
def save_feedback(user_id, feedback):
    db = SessionLocal()

    try:
        user = db.query(User).filter(User.id == user_id).first()

        if user:
            user.feedback = feedback
            db.commit()
            db.refresh(user)

        return user
    except Exception:
        db.rollback()
        return None
    finally:
        db.close()