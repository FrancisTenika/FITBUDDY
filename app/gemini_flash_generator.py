import os
import time

from dotenv import load_dotenv
from google import genai
from google.genai import errors

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=API_KEY) if API_KEY else None


def _fallback_nutrition(goal, age, weight):

    return f"""NUTRITION & RECOVERY TIP

For your {goal} goal, focus on balanced meals containing:

- A protein source such as eggs, chicken, fish, beans, paneer, or Greek yogurt.
- Vegetables and fruit for vitamins and fiber.
- Whole grains or other practical carbohydrate sources for energy.
- Healthy fats in moderate portions.

Hydration:

Drink water regularly throughout the day and around your workouts.

Recovery:

Aim for consistent sleep and give your body enough recovery time between harder sessions.

This is general wellness guidance, not medical advice.
"""


def generate_nutrition_tip_with_flash(goal, age, weight):

    prompt = f"""
You are FitBuddy, an AI fitness assistant.

Create a concise nutrition and recovery tip.

Age: {age}
Weight: {weight} kg
Fitness goal: {goal}

Requirements:
- Practical nutrition advice.
- Hydration advice.
- Recovery advice.
- Simple and beginner-friendly.
- No extreme diets or dangerous medical advice.
"""

    if client is None:
        return _fallback_nutrition(
            goal,
            age,
            weight
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
                    "Using local nutrition fallback."
                )

                break

            if attempt == 0:

                print(
                    "Gemini nutrition request temporarily "
                    "unavailable. Retrying once..."
                )

                time.sleep(3)

            else:

                print(
                    "Gemini nutrition unavailable. "
                    "Using local fallback."
                )

        except Exception as e:

            print(
                f"Gemini nutrition error: {type(e).__name__}. "
                "Using local fallback."
            )

            break

    return _fallback_nutrition(
        goal,
        age,
        weight
    )