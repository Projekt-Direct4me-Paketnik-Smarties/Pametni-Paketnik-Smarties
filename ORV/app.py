from flask import Flask, request, jsonify
from scripts.detect_orange import OrangeDetector

app = Flask(__name__)


# OR if scripts/ has __init__.py:
from scripts.detect_orange import OrangeDetector


@app.route("/detect", methods=["POST"])
def detect():
    try:
        data = request.get_json()

        if not data or "image_path" not in data:
            return jsonify({
                "success": False,
                "error": "Missing required field: image_path"
            }), 400

        image_path = data["image_path"]
        threshold = data.get("threshold", 0.8)

        print("Data received:", image_path)
        detector = OrangeDetector()

        is_orange, confidence, details = detector.detect(
            image_path=image_path,
            confidence_threshold=threshold,
            return_details=True
        )

        print("Data handled:", is_orange)

        return jsonify({
            "success": True,
            "match": is_orange,
            "confidence": confidence,
            "details": details
        }), 200

    except FileNotFoundError as error:
        print("FileNotFound error")
        return jsonify({
            "success": False,
            "error": str(error)
        }), 404

    except Exception as error:
        print("Exception error")
        return jsonify({
            "success": False,
            "error": str(error)
        }), 500


if __name__ == "__main__":
    app.run(port=5001, debug=True, host="0.0.0.0")