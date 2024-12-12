from app import app, users_collection, meetings_collection
from flask import request, jsonify
from bson import ObjectId, errors
from models import Profile, find_match

# Route to add a new profile
@app.route('/api/profiles', methods=['GET'])
def get_profiles():
    try:
        profiles = []
        for doc in users_collection.find():
            profile = Profile(
                doc['name'],
                doc['subjects'],
                doc['availability'],
                doc['location'],
                str(doc['_id'])
            )
            profiles.append(profile.to_json())
        return jsonify(profiles)
    except Exception as e:
        print(f"Error retrieving profiles from database: {e}")
        return []

# Route to add a new profile
@app.route('/api/profiles', methods=['POST'])
def create_profile():
    try:
        data = request.json
        
        required_fields = ['name', 'subjects', 'availability', 'location']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400

        # Create Profile object
        new_profile = Profile(
            name=data.get('name'),
            subjects=data.get('subjects'),
            availability=data.get('availability'),
            location=data.get('location')
        )

        # Manually create a dictionary for the new profile
        profile_dict = {
            'name': data.get('name'),
            'subjects': data.get('subjects'),
            'availability': data.get('availability'),
            'location': data.get('location')
        }
        
        # Insert into MongoDB
        result = users_collection.insert_one(profile_dict)
        
        if result.inserted_id:
            return jsonify({
                "message": "Profile added successfully",
                "_id": str(result.inserted_id)
            }), 201
        else:
            return jsonify({"error": "Failed to add profile"}), 500

    except Exception as e:
        print(f"Error adding profile to database: {e}")
        return jsonify({"error": str(e)}), 500

# Route to delete a profile
@app.route('/api/profiles/<profile_id>', methods=['DELETE'])
def delete_profile(profile_id):
    try:
        if profile_id == 'null':
            return jsonify({"error": "Profile ID cannot be null"}), 400

        try:
            object_id = ObjectId(profile_id)
        except errors.InvalidId:
            return jsonify({"error": "Invalid profile ID"}), 400

        profile = users_collection.find_one({'_id': object_id})
        if profile is None:
            return jsonify({"error": "Profile not found"}), 404

        users_collection.delete_one({'_id': object_id})
        return jsonify({"message": "Profile deleted successfully", "id": profile_id}), 200
    except Exception as e:
        print(f"Error deleting profile from database: {e}")
        return jsonify({"error": str(e)}), 500

# Route to update a profile
@app.route('/api/profiles/<profile_id>', methods=['PATCH'])
def update_profile(profile_id):
    try:
        if profile_id == 'null':
            return jsonify({"error": "Profile ID cannot be null"}), 400

        try:
            object_id = ObjectId(profile_id)
        except errors.InvalidId:
            return jsonify({"error": "Invalid profile ID"}), 400

        profile = users_collection.find_one({'_id': object_id})
        if profile is None:
            return jsonify({"error": "Profile not found"}), 404

        data = request.json
        update_data = {
            'name': data.get('name', profile['name']),
            'subjects': data.get('subjects', profile['subjects']),
            'availability': data.get('availability', profile['availability']),
            'location': data.get('location', profile['location'])
        }

        users_collection.update_one({'_id': object_id}, {'$set': update_data})
        updated_profile = users_collection.find_one({'_id': object_id})
        updated_profile['_id'] = str(updated_profile['_id'])
        return jsonify({"message": "Profile updated", "profile": updated_profile}), 200
    except Exception as e:
        print(f"Error updating profile in database: {e}")
        return jsonify({"error": str(e)}), 500

# Route to get a specific profile
@app.route('/api/profiles/<profile_id>', methods=['GET'])
def get_profile(profile_id):
    try:
        object_id = ObjectId(profile_id)
        profile = users_collection.find_one({'_id': object_id})
        if profile:
            profile['_id'] = str(profile['_id'])
            return jsonify(profile)
        return jsonify({"error": "Profile not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/matches/<profile_id>', methods=['GET'])
def find_matches(profile_id):
    try:
        # Get the profile we want to match
        object_id = ObjectId(profile_id)
        source_doc = users_collection.find_one({'_id': object_id})
        
        if not source_doc:
            return jsonify({"error": "Profile not found"}), 404

        # Create Profile object for source profile
        source_profile = Profile(
            name=source_doc['name'],
            subjects=source_doc['subjects'],
            availability=source_doc['availability'],
            location=source_doc['location'],
            _id=str(source_doc['_id'])
        )

        matches = []
        all_profiles = users_collection.find({'_id': {'$ne': object_id}})
        
        for doc in all_profiles:
            potential_match = Profile(
                name=doc['name'],
                subjects=doc['subjects'],
                availability=doc['availability'],
                location=doc['location'],
                _id=str(doc['_id'])
            )
            
            match_result = find_match(source_profile, potential_match)
            
            if match_result == "Matched":
                # Get matched items
                matched_subjects = list(set(source_profile.subjects) & set(potential_match.subjects))
                matched_availability = list(set(source_profile.availability) & set(potential_match.availability))
                
                matches.append({
                    "_id": potential_match._id,
                    "name": potential_match.name,
                    "subjects": potential_match._capitalize_list(potential_match.subjects),
                    "availability": potential_match._capitalize_list(potential_match.availability),
                    "distance": round(source_profile.calculate_distance(potential_match), 2),
                    "matched_subjects": potential_match._capitalize_list(matched_subjects),
                    "matched_availability": potential_match._capitalize_list(matched_availability)
                })

        if matches:
            return jsonify({
                "profile_id": profile_id,
                "matches": matches,
                "match_count": len(matches)
            }), 200
        else:
            return jsonify({
                "profile_id": profile_id,
                "matches": [],
                "message": "No matches found"
            }), 200

    except Exception as e:
        print(f"Error finding matches: {e}")
        return jsonify({"error": str(e)}), 500

# Search profiles by subject and availability
@app.route('/api/profiles/search', methods=['GET'])
def search_profiles():
    try:
        # Get subjects and availability from query parameters
        subjects_param = request.args.get('subjects') or request.args.get('subject')
        availability_param = request.args.get('availability')
        
        # Convert parameters to lists, handling both string and array cases
        def parse_param(param):
            if not param:
                return []
            # If it's a comma-separated string, split it
            if isinstance(param, str):
                return [item.strip() for item in param.split(',') if item.strip()]
            # If it's already a list, use it as is
            return param if isinstance(param, list) else [param]

        subjects = parse_param(subjects_param)
        availabilities = parse_param(availability_param)
        
        # Build query
        query = {}
        if subjects:
            query['subjects'] = {'$in': subjects}
        if availabilities:
            query['availability'] = {'$in': availabilities}
            
        # Find matching profiles
        profiles = list(users_collection.find(query))
        for profile in profiles:
            profile['_id'] = str(profile['_id'])
            
        return jsonify(profiles)
    except Exception as e:
        print(f"Error searching profiles: {e}")
        return jsonify({"error": str(e)}), 500
