from cmd import IDENTCHARS
from tarfile import data_filter
from xml.dom.xmlbuilder import DocumentLS

from flask import Flask, jsonify, request
import os, secrets, pymongo, string
from flask_socketio import SocketIO, emit
from datetime import datetime
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials 
from firebase_admin import auth 
import os
import json

# load the environmnet variables before using
from dotenv import load_dotenv
load_dotenv()


firebase_cred = os.environ.get("FIREBASE_SERVICE_ACCOUNT_KEY")
print("firebase_cred is", firebase_cred)
cred = credentials.Certificate(json.loads(firebase_cred))
firebase_admin.initialize_app(cred)

# create client to accept the connection
MONGODB_URI = os.environ.get("MONGODB_URI")
client = pymongo.MongoClient(MONGODB_URI)
db = client["Grow2gether"]
app = Flask(__name__)
socket = SocketIO(app, cors_allowed_origins="*")
CORS(app, origins=["https://grow2gether-omega.vercel.app", "https://grow2gether.onrender.com", "http://localhost:5173"], supports_credentials=True)
# path for generating data format 
# ask firebase for authentication
# show the link with the button

def generatePairID():
    character_pool = string.ascii_letters + string.digits
    return "".join(secrets.choice(character_pool) for _ in range(20));

@socket.on('connect')
def handle_connect():
    user_id = request.args.get("userID")
    return(user_id, "is connected to the console")

@app.route('/')
def welcome():
    return client.list_database_names()

@app.route('/api/invite', methods = ['POST'])
# @firebase_authentication_needed
def createInvite(): 
    # userID = request.json.get("uid")
    # dataForInvite =  db.invites.find_one({"senderID": userID, "isUsed": "false"})
    # if not dataForInvite: 
        auth_header = request.headers.get("Authorization")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Invalid authorization header"}), 401
    
        id_token = auth_header.split("Bearer ")[1]
    
        try: 
            decoded_token = firebase_admin.auth.verify_id_token(id_token)
        except Exception:
            return jsonify({"error": "Invalid ID token"}), 401
    
        
        userID = decoded_token.get("uid")
        # userID = request.json.get("uid")
        character_pool = string.ascii_letters + string.digits
        unique_code = "".join(secrets.choice(character_pool) for _ in range(6))
        # client.invite.create()
        db.invites.insert_one({
            "senderID": userID,
            "unique_code": unique_code, 
            "createdAt": datetime.now(),
            "isUsed": "false",
        })
        return jsonify(db.invites.find_one({"unique_code": unique_code}, {"_id": 0}))
    # else:
    #     print("user already has an invite link")
    #     return jsonify("user already has an invite link")
    
@app.route('/api/user/<uid>', methods = ['GET'])
def getUser(uid):
    result = db.pairs.find_one({"$or": [{"senderID": uid}, {"receiverID": uid}]}, {"_id": 0})
    print("result is", result)
    return jsonify({
        "pairID": result["pairID"] if result else None,
    })
    
#     take the code that is passed in the request and look for the exact code in the invite documents
@app.route('/api/invite/accept/<code>', methods = ['POST'])
def acceptInvite(code):
    print("accepting the invite")
    print("self authentication is started")
    auth_header = request.headers.get("Authorization")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Invalid authorization header"}), 401
    
    id_token = auth_header.split("Bearer ")[1]
    
    try: 
        decoded_token = firebase_admin.auth.verify_id_token(id_token)
    except Exception:
        return jsonify({"error": "Invalid ID token"}), 401
    
    uid = decoded_token.get("uid")
    
    print("self authentication is ended")
    
    print("another person authentication is started")
    anotherPerson = db.invites.find_one({"unique_code": code}, {"_id": 0})
    if not anotherPerson:
        return jsonify({"error": "Invalid invite code"}), 400
    anotherPersonUID = anotherPerson["senderID"]
    print(anotherPersonUID)
    print("another person authentication is ended")
    
    pairID = generatePairID();
    db.invites.update_one({"unique_code": code}, {"$set": {"pairID": pairID,"isUsed": True}} ,upsert = False)
    print("the pair is added")
    db.accepts.insert_one({
        "receiverID": uid, 
        "createdAt": datetime.now(),
        "pairID": pairID,
    })
    db.pairs.insert_one({
        "pairID": pairID,
        "senderID": anotherPersonUID, 
        "receiverID": uid
    })
    return "pair adding is successful"

@app.route('/sendThought', methods = ['POST'])
def sendThought():
    print("sending thought started")
    auth_header = request.headers.get("Authorization")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Invalid authorization header"}), 401
    
    id_token = auth_header.split("Bearer ")[1]
    
    try: 
        decoded_token = auth.verify_id_token(id_token)
        print(decoded_token)
    except Exception as e:
        return jsonify({"error": "Invalid ID token", "message": str(e)}), 401
    
    # get user id and thought
    uid = decoded_token.get("uid")
    # fetch the actual user using the id
    user_record = auth.get_user(uid)
    
    user = db.pairs.find_one({"$or": [{"senderID": uid}, {"receiverID": uid}]})
    print("pairID in python is: ", user["pairID"] if user else None)
    pairID = user["pairID"] if user else None
    data = request.get_json()
    thought = data.get("thought")
    
    new_thought = {
        "senderID": uid,
        "pairID": pairID,
        "name": user_record.display_name,
        "photoUrl": user_record.photo_url,
        "thought": thought,
        "createdAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    
    db.thoughts.insert_one(new_thought)
    del new_thought["_id"]  # Remove the _id field if it exists
    socket.emit('new_thought', new_thought , room = pairID)
    return jsonify({"message": "Thought sent successfully", "thought": new_thought})

@app.route('/getThoughts', methods = ['GET'])
def getThoughts():
    auth_header = request.headers.get("Authorization")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Invalid authorization header"}), 401
    
    id_token = auth_header.split("Bearer ")[1]
    
    try: 
        decoded_token = auth.verify_id_token(id_token)
        print(decoded_token)
    except Exception as e:
        return jsonify({"error": "Invalid ID token", "message": str(e)}), 401
    
    # get user id and thought
    uid = decoded_token.get("uid")
    user = db.pairs.find_one({"$or": [{"senderID": uid}, {"receiverID": uid}]})
    pairID = user["pairID"] if user else None
    thoughts = list(db.thoughts.find({"pairID": pairID}, {"_id": 0}).sort("createdAt", pymongo.ASCENDING))
    return jsonify(thoughts)

@app.route("/api/sendImage", methods=["POST"])
def uploadImage(): 
    content = request.files.get("image")
    caption = request.form.get("caption")
    print("caption is", caption)
    return jsonify({"caption": caption, "content-type": content.content_type, "filename": content.filename})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 3000))
    socket.run(app, debug=True, host='0.0.0.0', port=port)

