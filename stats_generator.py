import random
from datetime import datetime, timedelta

ENERGY_RANGE = [60, 80]
ENERGY_CHANGE = 5
PULSE_RANGE = [70, 180]
PULSE_CHANGE = 10
TEMP_RANGE = [25.7, 32.9]
TEMP_CHANGE = 0.2
# nastrój jest ustalany na podstawie energii
MOODS = (
    (20, "Bardzo zmęczony"),
    (40, "Zmęczony"),
    (60, "OK"),
    (80, "Dobrze"),
    (100, "Super")
)

UPDATE_COOLDOWN = 2.8


class Stats:
    def __init__(self):
        self.energy = None
        self.pulse = None
        self.temperature = None
        self.mood = None
        self.timer = datetime.now()

        self.generate_stats()

    def generate_stats(self):
        self.energy = random.randint(*ENERGY_RANGE)
        self.pulse = random.randint(*PULSE_RANGE)
        self.temperature = random.uniform(*TEMP_RANGE)
        self.mood = "Dobry"

    def update_stats(self):
        new_time = datetime.now()
        if new_time - self.timer > timedelta(seconds=UPDATE_COOLDOWN):
            self.timer = new_time

            self.energy += random.randint(-ENERGY_CHANGE, ENERGY_CHANGE)
            self.energy = max(1, min(
                ENERGY_RANGE[1], self.energy))

            self.pulse += random.randint(-PULSE_CHANGE, PULSE_CHANGE)
            self.pulse = max(PULSE_RANGE[0], min(PULSE_RANGE[1], self.pulse))

            self.temperature += random.uniform(-TEMP_CHANGE, TEMP_CHANGE)
            self.temperature = max(TEMP_RANGE[0], min(
                TEMP_RANGE[1], self.temperature))

            self.mood = next((mood for threshold,
                              mood in MOODS if self.energy < threshold), "")

    def get_stats(self):
        return {
            "energy": self.energy,
            "pulse": self.pulse,
            "temperature": round(self.temperature, 2),
            "mood": self.mood
        }
