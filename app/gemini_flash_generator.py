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


def _fallback_nutrition(goal, age, weight):

    return f"""NUTRITION & RECOVERY TIP

For your {goal} goal, focus on balanced meals containing:

- A high-quality protein source such as eggs, chicken, fish, beans, paneer, tofu, or Greek yogurt.
- Vegetables and fresh fruit for vital micronutrients and digestive fiber.
- Whole grains, sweet potatoes, or oats for sustained energy.
- Healthy unsaturated fats (olive oil, nuts, avocados) in moderate portions.

Hydration Target:
Drink at least 2.5 to 3.5 Liters of water daily, especially around training sessions.

Recovery:
Aim for 7.5 to 8.5 hours of quality sleep to optimize muscle recovery and hormonal balance.

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
                model="gemini-2.0-flash",
                contents=prompt
            )

            if response and response.text:
                return response.text

            break

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