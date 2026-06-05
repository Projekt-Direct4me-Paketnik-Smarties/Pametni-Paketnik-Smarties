import torch
import torch.nn as nn
import torchvision.transforms as transforms
import cv2
import argparse
import os
import json
from PIL import Image
import sys
from torchvision.models import resnet18, ResNet18_Weights

IMG_SIZE = 224
NUM_CLASSES = 4

_DIR = os.path.dirname(os.path.abspath(__file__))

class OrangeDetector:
    """Wrapper class for orange detection inference."""

    def __init__(self, model_path=None, device=None):
        if model_path is None:
            model_path = os.path.join(_DIR, "models", "orange_classifier.pth")
        
        # device setup must always run
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu") if device is None else device

        # Load ResNet18 architecture
        self.model = resnet18(weights=None)
        self.model.fc = nn.Linear(self.model.fc.in_features, NUM_CLASSES)
        self.model = self.model.to(self.device)

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found at {model_path}")

        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.eval()

        # Same transforms as training
        self.transforms = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

        self.class_names = ["Background (ozadje)", "Orange (pomaranca)", "Banana", "Jabolko"]

    def live_webcam_detection(self, confidence_threshold=0.7):
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            raise RuntimeError("Could not open webcam")

        print("Live Orange Detection started. Press ESC to exit.")

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            img_resized = cv2.resize(img_rgb, (IMG_SIZE, IMG_SIZE))
            img_pil = Image.fromarray(img_resized)
            img_tensor = self.transforms(img_pil).unsqueeze(0).to(self.device)

            with torch.no_grad():
                outputs = self.model(img_tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)

            orange_idx = 1
            confidence = probabilities[0, orange_idx].item()
            predicted_class = torch.argmax(probabilities).item()

            is_orange = (predicted_class == orange_idx) and (confidence >= confidence_threshold)

            label = f"Orange: {is_orange} ({confidence:.2f})"
            color = (0, 255, 0) if is_orange else (0, 0, 255)

            cv2.putText(frame, label, (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

            cv2.imshow("Live Orange Detection", frame)

            if cv2.waitKey(1) & 0xFF == 27:
                break

        cap.release()
        cv2.destroyAllWindows()

    def detect(self, image_path, confidence_threshold=0.7, return_details=False):
        print("before image: " + image_path)
        img = cv2.imread(image_path)
        if img is None:
            raise FileNotFoundError(f"Image not found: {image_path}")
        print("got past image")
        original_size = img.shape[:2]
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img_resized = cv2.resize(img_rgb, (IMG_SIZE, IMG_SIZE))
        img_pil = Image.fromarray(img_resized)
        img_tensor = self.transforms(img_pil).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(img_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)

        orange_idx = 1
        confidence_orange = probabilities[0, orange_idx].item()
        predicted_class_idx = torch.argmax(probabilities).item()

        is_orange = (predicted_class_idx == orange_idx) and (confidence_orange >= confidence_threshold)

        details = {
            "image_path": image_path,
            "original_size": original_size,
            "model_input_size": (IMG_SIZE, IMG_SIZE),
            "probabilities": {name: float(probabilities[0, i].item()) for i, name in enumerate(self.class_names)},
            "confidence_orange": float(confidence_orange),
            "threshold": confidence_threshold,
            "predicted_class": self.class_names[predicted_class_idx],
            "decision": "ORANGE DETECTED - LOGIN APPROVED" if is_orange else "NOT ORANGE - LOGIN REJECTED"
        }

        if return_details:
            return is_orange, confidence_orange, details
        else:
            return is_orange, confidence_orange


def two_factor_authentication(image_path, detector, confidence_threshold=0.8):
    try:
        is_orange, confidence, details = detector.detect(
            image_path,
            confidence_threshold=confidence_threshold,
            return_details=True
        )

        return {
            "success": True,
            "authenticated": is_orange,
            "message": details["decision"],
            "confidence": confidence,
            "details": details
        }

    except Exception as e:
        return {
            "success": False,
            "authenticated": False,
            "message": f"Error during verification: {str(e)}",
            "error": str(e)
        }


def main():
    parser = argparse.ArgumentParser(description="Orange Detection for 2FA Authentication")
    parser.add_argument("image", nargs="?", help="Path to image file for orange detection")
    parser.add_argument("--threshold", type=float, default=0.8)
    parser.add_argument("--camera", action="store_true")
    parser.add_argument("--model", type=str, default="models/orange_classifier.pth")
    parser.add_argument("--details", action="store_true")
    parser.add_argument("--live", action="store_true")

    args = parser.parse_args()

    if not args.live and not args.camera and not args.image:
        parser.print_help()
        sys.exit(1)

    detector = OrangeDetector(model_path=args.model)

    if args.live:
        detector.live_webcam_detection(confidence_threshold=args.threshold)
        sys.exit(0)

    if args.camera:
        is_orange, confidence = detector.detect_from_camera(confidence_threshold=args.threshold)
        print(f"Orange detected: {is_orange}, confidence: {confidence:.4f}")
        sys.exit(0)

    is_orange, confidence, details = detector.detect(
        args.image,
        confidence_threshold=args.threshold,
        return_details=True
    )

    print(json.dumps(details, indent=2))
    sys.exit(0 if is_orange else 1)


if __name__ == "__main__":
    main()
