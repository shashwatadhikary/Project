from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
import os
from dotenv import load_dotenv
import certifi

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB connection with certifi for SSL certificate handling
MONGODB_URI = os.getenv('MONGODB_URI')
ca = certifi.where()
client = MongoClient(MONGODB_URI, tlsCAFile=ca)
db = client['StudyGroupMatcher']
users_collection = db['users']
meetings_collection = db['meetings']  # Added collection for meetings
groups_collection = db['groups']  # Added collection for groups


@app.route("/")
def hello_world():
    return "<p>Hello World!</p>"

# Sign-up endpoint
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Check if user already exists
    if users_collection.find_one({"username": username}):
        return jsonify({"error": "Username already exists"}), 400

    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Create a new user
    user = {
        "username": username,
        "email": email,
        "password": hashed_password
    }
    users_collection.insert_one(user)

    return jsonify({"message": "User created successfully"}), 201

# Login endpoint
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Find the user by username
    user = users_collection.find_one({"username": username})
    if not user:
        return jsonify({"error": "Invalid username or password"}), 401

    # Check password
    if bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 401

# Fetch all meetings
@app.route('/api/meetings', methods=['GET'])
def get_meetings():
    try:
        meetings = list(meetings_collection.find())  # Retrieve all documents from the collection
        for meeting in meetings:
            meeting['_id'] = str(meeting['_id'])  # Convert ObjectId to string for JSON compatibility
        return jsonify(meetings), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Create a new meeting
@app.route('/api/meetings', methods=['POST'])
def create_meeting():
    try:
        data = request.json
        required_fields = ['location', 'date', 'time', 'description']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400

        # Create the meeting document
        meeting = {
            "location": data['location'],
            "date": data['date'],
            "time": data['time'],
            "description": data['description']
        }
        result = meetings_collection.insert_one(meeting)  # Save meeting to MongoDB
        return jsonify({"_id": str(result.inserted_id), "message": "Meeting created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Create a new study group
@app.route('/api/groups', methods=['POST'])
def create_group():
    try:
        data = request.json
        required_fields = ['name', 'department', 'course_number', 'description']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400

        # Create the group document
        group = {
            "name": data['name'],
            "department": data['department'],
            "course_number": data['course_number'],
            "description": data['description']
        }
        result = groups_collection.insert_one(group)  # Save group to MongoDB
        return jsonify({"_id": str(result.inserted_id), "message": "Group created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Fetch all study groups
@app.route('/api/groups', methods=['GET'])
def get_groups():
    try:
        groups = list(groups_collection.find())  # Retrieve all documents from the collection
        for group in groups:
            group['_id'] = str(group['_id'])  # Convert ObjectId to string for JSON compatibility
        return jsonify(groups), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5001)
