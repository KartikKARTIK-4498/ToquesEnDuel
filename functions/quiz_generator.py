from firebase_functions import https_fn, scheduler_fn
from firebase_admin import initialize_app, firestore
import json
import os
from flask import Flask, jsonify, request
from dotenv import load_dotenv
from openai import OpenAI
from flask_cors import CORS
from datetime import datetime
import random

# Load environment variables
load_dotenv()

# Initialize Firebase Admin
initialize_app()

# Initialize OpenAI client
API_KEY = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=API_KEY)

app = Flask(__name__)
CORS(app)

# List of cuisines and their regions for variety
CUISINES = {
    'asian': ['japanese', 'chinese', 'korean', 'thai', 'vietnamese', 'indian'],
    'european': ['italian', 'french', 'spanish', 'greek', 'german'],
    'american': ['mexican', 'brazilian', 'peruvian', 'argentine'],
    'middle_eastern': ['turkish', 'lebanese', 'persian', 'moroccan']
}

def select_weekly_cuisines():
    """Select a diverse mix of cuisines for weekly quizzes"""
    selected = []
    # Select one from each region
    for region_cuisines in CUISINES.values():
        selected.append(random.choice(region_cuisines))
    return selected

def generate_quiz_prompt(cuisine_type, difficulty):
    return f"""Create a culinary quiz about {cuisine_type} cuisine with {difficulty} difficulty level. 
    The quiz should test knowledge about ingredients, cooking techniques, cultural significance, and history.
    Format the response as a JSON object with the following structure:
    {{
        "title": "string",
        "description": "string",
        "cuisine": "{cuisine_type}",
        "difficulty": "{difficulty}",
        "timeLimit": number (in minutes),
        "totalPoints": number,
        "questions": [
            {{
                "id": "string",
                "question": "string",
                "options": ["string", "string", "string", "string"],
                "correctAnswer": number (0-3),
                "points": number,
                "explanation": "string"
            }}
        ]
    }}
    Include 5 questions for easy, 8 for medium, and 10 for hard difficulty.
    Make sure explanations are educational and reference cultural context.
    """

def generate_quiz_image_prompt(cuisine_type, quiz_title):
    return f"""Create a visually appealing illustration for a culinary quiz about {cuisine_type} cuisine titled '{quiz_title}'.
    The image should include traditional ingredients, cooking utensils, and cultural elements specific to {cuisine_type} cuisine.
    Make it educational and culturally authentic, with a clean and modern design suitable for a quiz interface.
    """

@app.route("/generatequiz", methods=['POST'])
def generate_quiz_route():
    try:
        data = request.get_json()
        cuisine_type = data.get('cuisine')
        difficulty = data.get('difficulty', 'medium')

        # Generate quiz content using OpenAI
        completion = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a culinary expert and educator specializing in world cuisines."},
                {"role": "user", "content": generate_quiz_prompt(cuisine_type, difficulty)}
            ],
            response_format={"type": "json_object"}
        )

        quiz_data = json.loads(completion.choices[0].message.content)

        # Generate an image for the quiz
        image_response = client.images.generate(
            model="dall-e-3",
            prompt=generate_quiz_image_prompt(cuisine_type, quiz_data['title']),
            size="1024x1024",
            quality="standard",
            n=1,
        )
        quiz_data['imageUrl'] = image_response.data[0].url

        # Add additional fields
        quiz_data['completions'] = 0
        quiz_data['averageScore'] = 0
        quiz_data['createdAt'] = datetime.now().isoformat()

        # Store in Firestore
        db = firestore.client()
        quiz_ref = db.collection('quizzes').add(quiz_data)

        return jsonify({
            'status': 'success',
            'message': 'Quiz generated and stored successfully',
            'quizId': quiz_ref[1].id,
            'quiz': quiz_data
        }), 200

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route("/generatequizzes", methods=['POST'])
def generate_multiple_quizzes():
    try:
        data = request.get_json()
        cuisines = data.get('cuisines', ['italian', 'japanese', 'indian', 'mexican', 'chinese'])
        difficulties = data.get('difficulties', ['easy', 'medium', 'hard'])
        
        generated_quizzes = []

        for cuisine in cuisines:
            for difficulty in difficulties:
                # Generate quiz
                completion = client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "You are a culinary expert and educator specializing in world cuisines."},
                        {"role": "user", "content": generate_quiz_prompt(cuisine, difficulty)}
                    ],
                    response_format={"type": "json_object"}
                )

                quiz_data = json.loads(completion.choices[0].message.content)

                # Generate image
                image_response = client.images.generate(
                    model="dall-e-3",
                    prompt=generate_quiz_image_prompt(cuisine, quiz_data['title']),
                    size="1024x1024",
                    quality="standard",
                    n=1,
                )
                quiz_data['imageUrl'] = image_response.data[0].url

                # Add additional fields
                quiz_data['completions'] = 0
                quiz_data['averageScore'] = 0
                quiz_data['createdAt'] = datetime.now().isoformat()

                # Store in Firestore
                db = firestore.client()
                quiz_ref = db.collection('quizzes').add(quiz_data)
                
                generated_quizzes.append({
                    'quizId': quiz_ref[1].id,
                    'cuisine': cuisine,
                    'difficulty': difficulty
                })

        return jsonify({
            'status': 'success',
            'message': f'Generated {len(generated_quizzes)} quizzes',
            'quizzes': generated_quizzes
        }), 200

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@scheduler_fn.on_schedule(schedule="every monday 00:00")
def weekly_quiz_generator(event: scheduler_fn.ScheduledEvent) -> None:
    """Generate new quizzes every week"""
    try:
        # Select cuisines for this week
        weekly_cuisines = select_weekly_cuisines()
        difficulties = ['easy', 'medium', 'hard']
        
        db = firestore.client()
        generated_quizzes = []

        # Generate quizzes for each cuisine and difficulty
        for cuisine in weekly_cuisines:
            for difficulty in difficulties:
                # Generate quiz content
                completion = client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "You are a culinary expert and educator specializing in world cuisines."},
                        {"role": "user", "content": generate_quiz_prompt(cuisine, difficulty)}
                    ],
                    response_format={"type": "json_object"}
                )

                quiz_data = json.loads(completion.choices[0].message.content)

                # Generate quiz image
                image_response = client.images.generate(
                    model="dall-e-3",
                    prompt=generate_quiz_image_prompt(cuisine, quiz_data['title']),
                    size="1024x1024",
                    quality="standard",
                    n=1,
                )
                quiz_data['imageUrl'] = image_response.data[0].url

                # Add metadata
                quiz_data['completions'] = 0
                quiz_data['averageScore'] = 0
                quiz_data['createdAt'] = datetime.now().isoformat()
                quiz_data['weekOf'] = datetime.now().strftime('%Y-%m-%d')

                # Store in Firestore
                quiz_ref = db.collection('quizzes').add(quiz_data)
                
                generated_quizzes.append({
                    'quizId': quiz_ref[1].id,
                    'cuisine': cuisine,
                    'difficulty': difficulty
                })

        # Log the generation
        db.collection('quiz_generation_logs').add({
            'timestamp': datetime.now().isoformat(),
            'quizzes': generated_quizzes,
            'status': 'success'
        })

    except Exception as e:
        # Log error if generation fails
        db.collection('quiz_generation_logs').add({
            'timestamp': datetime.now().isoformat(),
            'error': str(e),
            'status': 'error'
        })
        raise e

@app.route("/triggerweeklyquizzes", methods=['POST'])
def trigger_weekly_quizzes():
    """Test endpoint to manually trigger weekly quiz generation"""
    try:
        # Get authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or auth_header != f"Bearer {os.getenv('ADMIN_API_KEY')}":
            return jsonify({
                'status': 'error',
                'message': 'Unauthorized'
            }), 401

        # Call the weekly quiz generator
        weekly_quiz_generator(None)

        return jsonify({
            'status': 'success',
            'message': 'Weekly quizzes generated successfully'
ADMIN_API_KEY=your_secure_api_key        }), 200

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# Convert Flask app to a Firebase Function
@https_fn.on_request(max_instances=1)
def quizgenerator(req: https_fn.Request) -> https_fn.Response:
    with app.request_context(req.environ):
        return app.full_dispatch_request()

if __name__ == "__main__":
    app.run(debug=True)
