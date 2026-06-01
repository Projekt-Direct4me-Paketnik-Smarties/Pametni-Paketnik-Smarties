from flask import Flask, request, jsonify
from image_recognition import image

app = Flask(__name__)

@app.route('/detect', methods=['POST'])
def detect():
    data = request.get_json()
    print("Data recieved")
    image_path = data['image_path']

    match = image(image_path)
    print("Data handled: ", match)

    return jsonify({ 'match': match })

if __name__ == '__main__':
    app.run(port=5001, debug=True)