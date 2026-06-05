"""
Orange Detection CNN Classifier
================================
Member 2: Model development and training

This script trains a custom CNN to classify images as "orange" or "not orange" (background).
The model uses the augmented and split dataset prepared by Member 1.

Dataset structure (from Member 1):
  - dataset/final/train/{orange, ozadje}/
  - dataset/final/val/{orange, ozadje}/
  - dataset/final/test/{orange, ozadje}/
  
Image size: 224x224 (prepared by Member 1)

Hyperparameters:
  - Learning rate: 0.001
  - Batch size: 16
  - Epochs: 50
  - Optimizer: Adam
  - Loss: CrossEntropyLoss
  - Image normalization: ImageNet stats (mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
"""

import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset, ConcatDataset
import torchvision.transforms as transforms
from torchvision.models import resnet18, ResNet18_Weights
import numpy as np
import cv2
import matplotlib.pyplot as plt
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report
import json
from datetime import datetime


# =====================================================
# CONFIGURATION
# =====================================================
DATASET_DIR1 = "../dataset/augmented"
DATASET_DIR2 = "../dataset/final"
DATASET_DIR3 = "../dataset/processed"
DATASET_DIR4 = "../dataset/raw"
MODEL_SAVE_PATH = "models/orange_classifier.pth"
RESULTS_SAVE_PATH = "models/training_results.json"

# Create models directory if it doesn't exist
os.makedirs("models", exist_ok=True)

# Device configuration
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
torch.backends.cudnn.benchmark = True

print(f"Using device: {DEVICE}")

# Hyperparameters
LEARNING_RATE = 0.001
BATCH_SIZE = 16+32
EPOCHS = 50
NUM_CLASSES = 4  # orange, ozadje (background), banana, jabolko
IMG_SIZE = 224

# Data augmentation and normalization
TRAIN_TRANSFORMS = transforms.Compose([
    transforms.RandomResizedCrop(IMG_SIZE, scale=(0.7, 1.0)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(25),
    transforms.ColorJitter(
        brightness=0.3,
        contrast=0.3,
        saturation=0.3,
        hue=0.05
    ),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


VAL_TEST_TRANSFORMS = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# =====================================================
# CUSTOM DATASET CLASS
# =====================================================
class OrangeDataset(Dataset):
    """Custom dataset loader for orange classification."""
    
    def __init__(self, data_dir, transforms=None):
        """
        Args:
            data_dir: Path to train/val/test directory containing class folders
            transforms: Image transformation pipeline
        """
        self.data = []
        self.labels = []
        self.transforms = transforms
        
        # Class mapping
        self.class_to_idx = {"ozadje": 0, "pomaranca": 1, "banana": 2, "jabolko": 3}  # ozadje=background, pomaranca=orange, banana, jabolko
        
        # Load all images from class folders
        for class_name, class_idx in self.class_to_idx.items():
            class_dir = os.path.join(data_dir, class_name)
            
            if not os.path.isdir(class_dir):
                print(f"Warning: {class_dir} not found")
                continue
            
            for img_name in os.listdir(class_dir):
                img_path = os.path.join(class_dir, img_name)
                if os.path.isfile(img_path) and img_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                    self.data.append(img_path)
                    self.labels.append(class_idx)
        
        print(f"Loaded {len(self.data)} images from {data_dir}")
        print(f"  Orange (pomaranca): {self.labels.count(1)}")
        print(f"  Background (ozadje): {self.labels.count(0)}")
        print(f"  Banana: {self.labels.count(2)}")
        print(f"  Jabolko: {self.labels.count(3)}")
    
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        img_path = self.data[idx]
        label = self.labels[idx]
        
        # Read image with OpenCV
        img = cv2.imread(img_path)
        if img is None:
            raise RuntimeError(f"Failed to load image: {img_path}")
        
        # Convert BGR to RGB
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Resize if necessary
        if img.shape[0] != IMG_SIZE or img.shape[1] != IMG_SIZE:
            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
        
        # Convert to PIL Image for transforms
        from PIL import Image
        img = Image.fromarray(img)
        
        # Apply transforms
        if self.transforms:
            img = self.transforms(img)
        
        return img, label


# =====================================================
# TRAINING LOOP
# =====================================================
def train_epoch(model, train_loader, criterion, optimizer, device):
    """Train for one epoch."""
    model.train()
    total_loss = 0.0
    correct = 0
    total = 0
    
    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)
        
        # Forward pass
        outputs = model(images)
        loss = criterion(outputs, labels)
        
        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        # Statistics
        total_loss += loss.item()
        _, predicted = torch.max(outputs.data, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()
    
    avg_loss = total_loss / len(train_loader)
    accuracy = correct / total
    
    return avg_loss, accuracy


def validate(model, val_loader, criterion, device):
    """Validate the model."""
    model.eval()
    total_loss = 0.0
    correct = 0
    total = 0
    
    with torch.no_grad():
        for images, labels in val_loader:
            images, labels = images.to(device), labels.to(device)
            
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            total_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
    
    avg_loss = total_loss / len(val_loader)
    accuracy = correct / total
    
    return avg_loss, accuracy


def test_model(model, test_loader, device):
    """Evaluate model on test set with detailed metrics."""
    model.eval()
    
    all_predictions = []
    all_labels = []
    
    with torch.no_grad():
        for images, labels in test_loader:
            images, labels = images.to(device), labels.to(device)
            
            outputs = model(images)
            _, predicted = torch.max(outputs.data, 1)
            
            all_predictions.extend(predicted.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
    
    all_predictions = np.array(all_predictions)
    all_labels = np.array(all_labels)
    
    # Calculate metrics
    accuracy = accuracy_score(all_labels, all_predictions)
    precision = precision_score(all_labels, all_predictions, average='weighted', zero_division=0)
    recall = recall_score(all_labels, all_predictions, average='weighted', zero_division=0)
    f1 = f1_score(all_labels, all_predictions, average='weighted', zero_division=0)
    
    # Confusion matrix
    cm = confusion_matrix(all_labels, all_predictions)
    
    # Classification report
    class_names = ["Background (ozadje)", "Orange (pomaranca)", "Banana", "Jabolko"]
    class_report = classification_report(all_labels, all_predictions, target_names=class_names)
    
    return {
        "accuracy": float(accuracy),
        "precision": float(precision),
        "recall": float(recall),
        "f1": float(f1),
        "confusion_matrix": cm.tolist(),
        "detailed_report": class_report,
        "predictions": all_predictions.tolist(),
        "labels": all_labels.tolist()
    }


# =====================================================
# MAIN TRAINING SCRIPT
# =====================================================
def main():
    print("=" * 60)
    print("Orange Classifier - Training Script")
    print("=" * 60)
    print(f"Device: {DEVICE}")
    print(f"Learning rate: {LEARNING_RATE}")
    print(f"Batch size: {BATCH_SIZE}")
    print(f"Epochs: {EPOCHS}")
    print(f"Image size: {IMG_SIZE}x{IMG_SIZE}")
    print()
    
    # Load datasets
    print("Loading datasets...")
    
    # Load from DATASET_DIR2 (final) with train/val/test splits
    train_dataset_final = OrangeDataset(os.path.join(DATASET_DIR2, "train"), transforms=TRAIN_TRANSFORMS)
    val_dataset_final = OrangeDataset(os.path.join(DATASET_DIR2, "val"), transforms=VAL_TEST_TRANSFORMS)
    test_dataset_final = OrangeDataset(os.path.join(DATASET_DIR2, "test"), transforms=VAL_TEST_TRANSFORMS)

    # Load full datasets from DATASET_DIR1 (augmented), DATASET_DIR3 (processed), DATASET_DIR4 (raw)
    # These will be added to the training set
    train_dataset_augmented = OrangeDataset(DATASET_DIR1, transforms=TRAIN_TRANSFORMS)
    train_dataset_processed = OrangeDataset(os.path.join(DATASET_DIR3, "all"), transforms=TRAIN_TRANSFORMS)
    train_dataset_raw = OrangeDataset(DATASET_DIR4, transforms=TRAIN_TRANSFORMS)

    # Combine datasets
    train_dataset = ConcatDataset([
        train_dataset_final,
        train_dataset_augmented,
        train_dataset_processed
    ])
    val_dataset = val_dataset_final
    test_dataset = test_dataset_final

    # Calculate class weights for imbalanced dataset
    class_counts = [0] * NUM_CLASSES
    for _, label in train_dataset: # Use the combined train_dataset
        class_counts[label] += 1

    total_samples = sum(class_counts)
    # Inverse frequency weighting: higher weight for less frequent classes
    class_weights = [total_samples / (NUM_CLASSES * count) for count in class_counts]
    class_weights_tensor = torch.tensor(class_weights, dtype=torch.float).to(DEVICE)
    print(f"Calculated class weights: {class_weights_tensor.tolist()}")
    
    # Create data loaders
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=2)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=2)
    
    print(f"Train samples: {len(train_dataset)}")
    print(f"Val samples: {len(val_dataset)}")
    print(f"Test samples: {len(test_dataset)}")
    print()
    
    # Initialize model, loss, and optimizer
    print("Initializing model...")
    model = resnet18(weights=ResNet18_Weights.IMAGENET1K_V1)
    model.fc = nn.Linear(model.fc.in_features, NUM_CLASSES)

    model = model.to(DEVICE)
    criterion = nn.CrossEntropyLoss(weight=class_weights_tensor) # Pass weights here
    optimizer = optim.Adam(model.parameters(), lr=1e-4, weight_decay=1e-5)
    
    print(f"Model architecture:")
    print(model)
    print()
    
    # Training loop
    print("=" * 60)
    print("Starting training...")
    print("=" * 60)
    print(class_counts)

    train_losses = []
    train_accuracies = []
    val_losses = []
    val_accuracies = []
    best_val_accuracy = 0.0
    best_model_state = None
    
    for epoch in range(EPOCHS):
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, DEVICE)
        val_loss, val_acc = validate(model, val_loader, criterion, DEVICE)
        
        train_losses.append(train_loss)
        train_accuracies.append(train_acc)
        val_losses.append(val_loss)
        val_accuracies.append(val_acc)
        
        # Save best model
        if val_acc > best_val_accuracy:
            best_val_accuracy = val_acc
            best_model_state = model.state_dict()
        
        if (epoch + 1) % 5 == 0 or epoch == 0:
            print(f"Epoch [{epoch+1}/{EPOCHS}] "
                  f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.4f} | "
                  f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.4f}")
    
    # Load best model
    if best_model_state is not None:
        model.load_state_dict(best_model_state)
        print(f"\nLoaded best model with validation accuracy: {best_val_accuracy:.4f}")
    
    # Test on test set
    print("\n" + "=" * 60)
    print("Evaluating on test set...")
    print("=" * 60)
    
    test_results = test_model(model, test_loader, DEVICE)
    
    print(f"Test Accuracy:  {test_results['accuracy']:.4f}")
    print(f"Test Precision: {test_results['precision']:.4f}")
    print(f"Test Recall:    {test_results['recall']:.4f}")
    print(f"Test F1-Score:  {test_results['f1']:.4f}")
    print()
    print("Confusion Matrix:")
    print(test_results['confusion_matrix'])
    print()
    print("Detailed Classification Report:")
    print(test_results['detailed_report'])
    
    # Save model
    print("\n" + "=" * 60)
    print("Saving model...")
    torch.save(model.state_dict(), MODEL_SAVE_PATH)
    print(f"Model saved to: {MODEL_SAVE_PATH}")
    
    # Save results
    results = {
        "timestamp": datetime.now().isoformat(),
        "hyperparameters": {
            "learning_rate": LEARNING_RATE,
            "batch_size": BATCH_SIZE,
            "epochs": EPOCHS,
            "optimizer": "Adam",
            "loss_function": "CrossEntropyLoss"
        },
        "architecture": {
            "name": "ResNet18",
            "pretrained": True,
            "input_size": IMG_SIZE
        },
        "training_history": {
            "train_losses": train_losses,
            "train_accuracies": train_accuracies,
            "val_losses": val_losses,
            "val_accuracies": val_accuracies,
            "best_val_accuracy": float(best_val_accuracy)
        },
        "test_results": test_results
    }
    
    with open(RESULTS_SAVE_PATH, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"Results saved to: {RESULTS_SAVE_PATH}")
    
    # Plot training history
    print("\nGenerating training plots...")
    plt.figure(figsize=(12, 4))
    
    plt.subplot(1, 2, 1)
    plt.plot(train_losses, label='Train Loss')
    plt.plot(val_losses, label='Val Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    plt.title('Loss Over Epochs')
    plt.grid(True)
    
    plt.subplot(1, 2, 2)
    plt.plot(train_accuracies, label='Train Accuracy')
    plt.plot(val_accuracies, label='Val Accuracy')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.legend()
    plt.title('Accuracy Over Epochs')
    plt.grid(True)
    
    plt.tight_layout()
    plt.savefig('models/training_history.png', dpi=100)
    print("Training history plot saved to: models/training_history.png")
    
    print("\n" + "=" * 60)
    print("Training complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()