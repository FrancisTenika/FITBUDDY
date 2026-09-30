import os
import time
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
client = None

try:
    from google import genai
    from google.genai import errors
    if API_KEY:
        client = genai.Client(api_key=API_KEY)
except Exception:
    client = None


def _fallback_workout(name, age, weight, goal, intensity):
    return f"""FITBUDDY 7-DAY WORKOUT PLAN

User: {name}
Age: {age}
Weight: {weight} kg
Goal: {goal}
Intensity: {intensity}


DAY 1 - FULL BODY

Warm-up: 5-10 minutes walking and dynamic mobility

- Bodyweight / Goblet Squats: 3 x 12
- Wall/Incline Push-ups: 3 x 10
- Glute Bridges: 3 x 12
- Bird Dog: 2 x 10 each side

Cooldown: 5 minutes easy stretching


DAY 2 - CARDIO + CORE

Warm-up: 5 minutes easy movement

- Brisk Walk / Jog: 20-25 minutes
- Dead Bug: 3 x 8 each side
- Forearm Plank: 3 x 25 seconds

Cooldown: 5 minutes stretching


DAY 3 - RECOVERY & MOBILITY

- Easy walk: 15-20 minutes
- Gentle full-body stretching: 10 minutes

Focus on hydration and restorative sleep.


DAY 4 - FULL BODY STRENGTH

Warm-up: 5-10 minutes

- Reverse Lunges: 3 x 10 each leg
- Incline Push-ups: 3 x 10
- Hip Hinge / Good Morning: 3 x 12
- Shoulder Taps: 2 x 12 each side

Cooldown: 5 minutes


DAY 5 - CARDIO + CORE

- Brisk Walk or cycling: 20-30 minutes
- Glute Bridge: 3 x 15
- Side Plank: 2 x 20 seconds each side

Cooldown: 5 minutes


DAY 6 - FUNCTIONAL STRENGTH

- Chair / Air Squats: 3 x 12
- Wall Push-ups / Dips: 3 x 12
- Standing Calf Raises: 3 x 15
- Standing Knee Raises: 2 x 12 each side

Cooldown: 5 minutes


DAY 7 - REST / ACTIVE RECOVERY

- Relaxing outdoor walk: 15-20 minutes
- Gentle yoga / stretching: 10 minutes


SAFETY & TIPS

Start gradually, prioritize good form, stay hydrated, and adjust intensity as needed.
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
                model="gemini-2.0-flash",
                contents=prompt
            )

            if response and response.text:
                return response.text

            break

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