from flask import Flask
import os

app = Flask(__name__)
@app.route('/')
def imageSave():
    return "Our Memories together through the calender"

@app.route('/diet')
def diet():
    return "Track your calories"

@app.route('/appreciate')
def appreciate():
    return "One thing you appreciate for today"

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 3000))
    app.run(debug=True, host='0.0.0.0', port=port)

