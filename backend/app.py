from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from flask_socketio import SocketIO, send, emit
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
meetings_collection = db['meetings']
groups_collection = db['groups']
chats_collection = db['chats']  # Added collection for chats

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
# Fetch all chat messages
@app.route('/api/chats', methods=['GET'])
def get_chats():
    try:
        chats = list(chats_collection.find())
        for chat in chats:
            chat['_id'] = str(chat['_id'])
        return jsonify(chats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# WebSocket chat and signaling for video calls
@socketio.on('message')
def handle_message(data):
    # Save the chat message to the database
    chat_message = {
        "username": data["username"],
        "text": data["text"]
    }
    chats_collection.insert_one(chat_message)

    # Broadcast the message to all connected clients
    send(data, broadcast=True)

@socketio.on('offer')
def handle_offer(data):
    emit('offer', data, broadcast=True, include_self=False)

@socketio.on('answer')
def handle_answer(data):
    emit('answer', data, broadcast=True, include_self=False)

@socketio.on('ice-candidate')
def handle_ice_candidate(data):
    emit('ice-candidate', data, broadcast=True, include_self=False)

if __name__ == "__main__":
    socketio.run(app, port=5001)
