import os
import time

from dotenv import load_dotenv
from google import genai
from google.genai import errors

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=API_KEY) if API_KEY else None


def _fallback_workout(name, age, weight, goal, intensity):
    return f"""FITBUDDY 7-DAY WORKOUT PLAN

User: {name}
Age: {age}
Weight: {weight} kg
Goal: {goal}
Intensity: {intensity}

Note: Gemini is temporarily unavailable or the API quota has been reached.
FitBuddy has provided a safe local plan so the website continues working.

DAY 1 - FULL BODY

Warm-up: 5-10 minutes walking and mobility

- Bodyweight Squats: 3 x 10
- Wall/Incline Push-ups: 3 x 8
- Glute Bridges: 3 x 12
- Bird Dog: 2 x 10 each side

Cooldown: 5 minutes easy stretching


DAY 2 - CARDIO + CORE

Warm-up: 5 minutes easy movement

- Brisk Walk: 20 minutes
- Dead Bug: 3 x 8 each side
- Plank: 3 x 20 seconds

Cooldown: 5 minutes stretching


DAY 3 - RECOVERY

- Easy walk: 15-20 minutes
- Gentle full-body stretching: 10 minutes

Focus on hydration and recovery.


DAY 4 - FULL BODY

Warm-up: 5-10 minutes

- Reverse Lunges: 3 x 8 each leg
- Incline Push-ups: 3 x 8
- Hip Hinge/Good Morning: 3 x 10
- Shoulder Taps: 2 x 10 each side

Cooldown: 5 minutes


DAY 5 - CARDIO + CORE

- Brisk Walk or easy cycling: 20-25 minutes
- Glute Bridge: 3 x 12
- Side Plank: 2 x 15-20 seconds each side

Cooldown: 5 minutes


DAY 6 - LIGHT STRENGTH

- Chair Squats: 3 x 10
- Wall Push-ups: 3 x 10
- Calf Raises: 3 x 12
- Standing Knee Raises: 2 x 10 each side

Cooldown: 5 minutes


DAY 7 - REST / ACTIVE RECOVERY

- Easy walking: 15-20 minutes if comfortable
- Gentle stretching: 10 minutes


SAFETY

Start gradually, use good form, stay hydrated, and stop if you experience pain, dizziness, or unusual symptoms.
"""


def generate_workout_gemini(name, age, weight, goal, intensity):

    prompt = f"""
You are FitBuddy, an AI fitness assistant.

Create a personalized 7-day workout plan for this user.

User details:
Name: {name}
Age: {age}
Weight: {weight} kg
Goal: {goal}
Workout intensity: {intensity}

Requirements:
- Create Day 1 through Day 7.
- Include exercises, sets, repetitions or duration.
- Include rest/recovery days when appropriate.
- Keep the plan practical and beginner-friendly.
- Do not provide dangerous or extreme instructions.
- Use clear headings for each day.
"""

    if client is None:
        return _fallback_workout(
            name,
            age,
            weight,
            goal,
            intensity
        )

    for attempt in range(2):

        try:

            response = client.models.generate_content(
                model="gemini-3.8-flash",
                contents=prompt
            )

            if response and response.text:
                return response.text

            break

        except (errors.ServerError, errors.ClientError) as e:

            status = getattr(e, "status_code", None)

            if status == 429:
                print(
                    "Gemini quota reached. "
                    "Using local workout fallback."
                )
                break

            if attempt == 0:
                print(
                    "Gemini temporarily unavailable. "
                    "Retrying once..."
                )
                time.sleep(3)

            else:
                print(
                    "Gemini unavailable. "
                    "Using local workout fallback."
                )

        except Exception as e:

            print(
                f"Gemini workout error: {type(e).__name__}. "
                "Using local fallback."
            )
            break

    return _fallback_workout(
        name,
        age,
        weight,
        goal,
        intensity
    )