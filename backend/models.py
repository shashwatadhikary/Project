from app import users_collection
from bson import ObjectId
import math

class Profile:
    def __init__(self, name, subjects, availability, location, _id=None):
        self._id = _id
        self.name = name
        self.subjects = self._ensure_list(subjects)  # Stored in lowercase
        self.availability = self._ensure_list(availability)  # Stored in lowercase
        self.location = location

    def _ensure_list(self, field):
        """Convert a field to a list if it's not already one and make it case insensitive"""
        if isinstance(field, str):
            return [field.strip().lower()]
        if isinstance(field, list):
            return [item.strip().lower() for item in field if item.strip()]
        return []

    def _capitalize_list(self, items):
        """Capitalize first letter of each item in the list"""
        return [item.capitalize() for item in items]

    def display(self):
        print(f"\nProfile of {self.name}:")
        print(f"Subjects: {', '.join(self._capitalize_list(self.subjects))}")
        print(f"Availability: {', '.join(self._capitalize_list(self.availability))}")
        print(f"Location: (Latitude: {self.location['lat']}, Longitude: {self.location['lon']})")

    def match_subjects(self, other_profile):
        return len(set(self.subjects) & set(other_profile.subjects)) > 0

    def match_availability(self, other_profile):
        return len(set(self.availability) & set(other_profile.availability)) > 0

    def calculate_distance(self, other_profile):
        try:
            return math.sqrt((self.location['lat'] - other_profile.location['lat'])**2 + 
                           (self.location['lon'] - other_profile.location['lon'])**2)
        except (KeyError, TypeError):
            return float('inf')

    def match_location(self, other_profile, max_distance=10):
        distance = self.calculate_distance(other_profile)
        return distance <= max_distance

    def to_json(self):
        """Return JSON with capitalized subjects and availability"""
        return {
            '_id': str(self._id),
            'name': self.name,
            'subjects': self._capitalize_list(self.subjects),
            'availability': self._capitalize_list(self.availability),
            'location': self.location
        }

def find_match(profile1, profile2):
    if profile1.match_subjects(profile2):
        if profile1.match_availability(profile2):
            if profile1.match_location(profile2):
                return "Matched"
    return "Not Matched"