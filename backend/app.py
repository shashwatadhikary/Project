from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from flask_socketio import SocketIO, send
import bcrypt
import os
from dotenv import load_dotenv
import certifi
from bson.objectid import ObjectId  # Import ObjectId

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

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

    if users_collection.find_one({"username": username}):
        return jsonify({"error": "Username already exists"}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    user = {"username": username, "email": email, "password": hashed_password}
    users_collection.insert_one(user)

    return jsonify({"message": "User created successfully"}), 201

# Login endpoint
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = users_collection.find_one({"username": username})
    if not user:
        return jsonify({"error": "Invalid username or password"}), 401

    if bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 401

# Fetch all meetings
@app.route('/api/meetings', methods=['GET'])
def get_meetings():
    try:
        meetings = list(meetings_collection.find())
        for meeting in meetings:
            meeting['_id'] = str(meeting['_id'])
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

        meeting = {
            "location": data['location'],
            "date": data['date'],
            "time": data['time'],
            "description": data['description']
        }
        result = meetings_collection.insert_one(meeting)
        return jsonify({"_id": str(result.inserted_id), "message": "Meeting created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Delete a meeting
@app.route('/api/meetings/<meeting_id>', methods=['DELETE'])
def delete_meeting(meeting_id):
    try:
        result = meetings_collection.delete_one({"_id": ObjectId(meeting_id)})
        if result.deleted_count > 0:
            return jsonify({"message": "Meeting deleted successfully"}), 200
        else:
            return jsonify({"error": "Meeting not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# WebSocket chat
@socketio.on('message')
def handle_message(data):
    send(data, broadcast=True)  # Broadcast the message to all connected clients

if __name__ == "__main__":
    socketio.run(app, port=5001)
