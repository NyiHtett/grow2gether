from cmd import IDENTCHARS
from tarfile import data_filter
from xml.dom.xmlbuilder import DocumentLS

from flask import Flask, jsonify, request
import os, secrets, pymongo, string
from datetime import datetime
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials 
from firebase_admin import auth 
import os
import json

firebase_cred = os.environ.get("FIREBASE_SERVICE_ACCOUNT_KEY")
cred = credentials.Certificate(json.loads(firebase_cred))
firebase_admin.initialize_app(cred)
# get database connection link
from dotenv import load_dotenv
load_dotenv()

# create client to accept the connection
MONGODB_URI = os.environ.get("MONGODB_URI")
client = pymongo.MongoClient(MONGODB_URI)
db = client["Grow2gether"]
app = Flask(__name__)
CORS(app, origins=["https://grow2gether-omega.vercel.app", "https://grow2gether.onrender.com", "http://localhost:5173"], supports_credentials=True)
# path for generating data format 
# ask firebase for authentication
# show the link with the button

def generatePairID():
    character_pool = string.ascii_letters + string.digits
    return "".join(secrets.choice(character_pool) for _ in range(20));

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
    data = request.get_json()
    thought = data("thought")
    
    db.thoughts.insert_one({
        "senderID": uid,
        "thought": thought,
        "createdAt": datetime.now()
    })
    return jsonify({"message": "Thought sent successfully"})

#     # mongoDB doesn't know how to jsonify the _id field, we will exclude it
#     anotherPersonIndex = db.invites.find_one({"unique_code": code}, {"_id": 0})
#     if anotherPersonIndex: 
#         return jsonify({"found the code": anotherPersonIndex})
#     else:
#         return jsonify({"code not found": code})
    
    
#     # sign in the user
#     # create a record in the invite 
    
# #     once found delete both invite code and replace with mutual unique paired Id 
# #@app.route('/test/addPairID', methods = ['POST'])
# def addPairID():
#     code = code
#     pairID = generatePairID()
#     db.invites.update_one({"unique_code": code}, {"$set": {"pairID": pairID,"isUsed": True}} ,upsert = False)
#     return "the pair is added"

# #     pair them in the pairs collection
# # @app.route('/test/addPairs', methods = ['POST'])
# def addPairCollection(): 
#     db.pairs.insert_one({"user1": "kyaw", "user2": "nyi"})
#     return "pair adding is successful"
    
# #     if there is pairId in their data, there should be image of the other person next to them (frontend)
# #     and once you look into the pages, you will store the data specifically for you two. 

# # @app.route('/api/invite/<code>', methods = ['GET'])
# # def getInviteLink(code): 
    

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 3000))
    app.run(debug=True, host='0.0.0.0', port=port)

