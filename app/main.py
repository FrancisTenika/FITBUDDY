from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

from app.database import (
    save_user,
    get_all_users,
    get_user,
    update_workout_plan,
    save_feedback,
)

app = FastAPI(title="FitBuddy - AI Fitness Plan Generator")

templates = Jinja2Templates(directory="templates")

app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={"request": request}
    )


@app.post("/generate-workout", response_class=HTMLResponse)
async def generate_workout(
    request: Request,
    name: str = Form(...),
    age: int = Form(...),
    weight: str = Form(...),
    goal: str = Form(...),
    intensity: str = Form(...)
):
    from app.gemini_generator import generate_workout_gemini
    from app.gemini_flash_generator import generate_nutrition_tip_with_flash

    workout_plan = generate_workout_gemini(
        name=name,
        age=age,
        weight=weight,
        goal=goal,
        intensity=intensity
    )

    nutrition_tip = generate_nutrition_tip_with_flash(
        goal=goal,
        age=age,
        weight=weight
    )

    user = save_user(
        name=name,
        age=age,
        weight=weight,
        goal=goal,
        intensity=intensity,
        workout_plan=workout_plan,
        nutrition_tip=nutrition_tip
    )

    return templates.TemplateResponse(
        request=request,
        name="result.html",
        context={
            "request": request,
            "user": user,
            "workout_plan": workout_plan,
            "nutrition_tip": nutrition_tip
        }
    )


@app.post("/submit-feedback", response_class=HTMLResponse)
async def submit_feedback(
    request: Request,
    user_id: int = Form(...),
    feedback: str = Form(...)
):
    from app.updated_plan import update_workout_plan_with_feedback

    user = get_user(user_id)

    if not user:
        return HTMLResponse(
            content="User not found. Please check the User ID.",
            status_code=404
        )

    feedback = feedback.strip()

    if not feedback:
        return templates.TemplateResponse(
            request=request,
            name="result.html",
            context={
                "request": request,
                "user": user,
                "workout_plan": user.workout_plan,
                "nutrition_tip": user.nutrition_tip,
                "feedback_message": "Please enter some feedback before submitting."
            }
        )

    save_feedback(
        user_id=user_id,
        feedback=feedback
    )

    new_plan = update_workout_plan_with_feedback(
        original_plan=user.workout_plan,
        feedback=feedback
    )

    updated_user = update_workout_plan(
        user_id=user_id,
        new_plan=new_plan
    )

    return templates.TemplateResponse(
        request=request,
        name="result.html",
        context={
            "request": request,
            "user": updated_user,
            "workout_plan": new_plan,
            "nutrition_tip": updated_user.nutrition_tip,
            "feedback_message": "Your workout plan has been updated successfully."
        }
    )


@app.get("/view-all-users", response_class=HTMLResponse)
async def view_all_users(request: Request):
    users = get_all_users()

    return templates.TemplateResponse(
        request=request,
        name="all_users.html",
        context={
            "request": request,
            "users": users
        }
    )