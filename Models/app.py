from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# --- Config ---
MODEL_SAVE_PATH = "best_multiclass_eye_disease_resnet152_model.pth"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# --- Preprocessing (must match your training transforms) ---
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

# Global variables for model and class names
model = None
class_names = None

# --- Load model from checkpoint ---
def load_model_from_checkpoint(checkpoint_path, device=DEVICE):
    """Load the ResNet152 model from checkpoint"""
    try:
        # Load checkpoint dict
        checkpoint = torch.load(
            checkpoint_path, 
            map_location=device, 
            weights_only=False
        )
        
        # Get num_classes from checkpoint
        num_classes = checkpoint.get('num_classes', None)
        class_names = checkpoint.get('class_names', None)
        
        if num_classes is None and class_names is not None:
            num_classes = len(class_names)
        
        if num_classes is None:
            raise RuntimeError(
                "Could not determine num_classes from checkpoint. "
                "Make sure 'num_classes' or 'class_names' is saved in the checkpoint."
            )
        
        # Instantiate ResNet152 architecture
        model = models.resnet152(weights=None)
        in_features = model.fc.in_features
        model.fc = nn.Linear(in_features, num_classes)
        
        # Load state dict
        state_dict = checkpoint.get('model_state_dict', checkpoint)
        model.load_state_dict(state_dict)
        model.to(device)
        model.eval()
        
        # If class_names not saved, create numeric labels
        if class_names is None:
            class_names = [str(i) for i in range(num_classes)]
        
        print(f"✓ Model loaded successfully from {checkpoint_path}")
        print(f"✓ Number of classes: {num_classes}")
        print(f"✓ Class names: {class_names}")
        
        return model, class_names
        
    except Exception as e:
        print(f"✗ Error loading model: {str(e)}")
        raise e

# --- Class name mapping ---
CLASS_NAME_MAPPING = {
    'normal': 'Normal',
    'diabetic_retinopathy': 'Diabetic Retinopathy',
    'cataract': 'Cataract',
    'glaucoma': 'Glaucoma'
}

def format_class_name(class_name):
    """Convert model output class name to display format"""
    # Convert to lowercase for matching
    class_lower = class_name.lower().strip()
    
    # Return mapped name or original with title case
    return CLASS_NAME_MAPPING.get(class_lower, class_name.replace('_', ' ').title())

# --- Predict on PIL image ---
def predict_image(pil_img, model, class_names, preprocess, device=DEVICE):
    """Make prediction on a PIL image"""
    # Preprocess
    x = preprocess(pil_img).unsqueeze(0).to(device)  # shape [1, C, H, W]
    
    with torch.no_grad():
        logits = model(x)  # raw logits
        probs = torch.softmax(logits, dim=1).cpu().numpy()[0]
    
    # Get top prediction
    top_idx = probs.argmax()
    top_class = class_names[top_idx]
    top_prob = float(probs[top_idx])
    
    # Format class name for display
    formatted_class = format_class_name(top_class)
    
    # Get all probabilities
    all_probs = {class_names[i]: float(probs[i]) for i in range(len(class_names))}
    
    return formatted_class, top_prob, all_probs

# Load model on startup
try:
    model, class_names = load_model_from_checkpoint(MODEL_SAVE_PATH, device=DEVICE)
except Exception as e:
    print(f"Failed to load model on startup: {str(e)}")
    model = None
    class_names = None

@app.route('/api/diagnose', methods=['POST'])
def diagnose():
    """Diagnose eye disease from uploaded image"""
    try:
        # Check if model is loaded
        if model is None or class_names is None:
            return jsonify({
                'error': 'Model not loaded. Please check server logs and model path.'
            }), 500
        
        # Check if image is in request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        
        # Check if file is empty
        if file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        # Read and process image
        img_bytes = file.read()
        pil_img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        
        # Make prediction
        top_class, top_prob, all_probs = predict_image(
            pil_img, model, class_names, preprocess, device=DEVICE
        )
        
        # Return result - only the top prediction
        return jsonify({
            'prediction': top_class,
            'confidence': top_prob
        }), 200
        
    except Exception as e:
        print(f"Error during diagnosis: {str(e)}")
        return jsonify({
            'error': f'Error processing image: {str(e)}'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'device': str(DEVICE),
        'classes': class_names if class_names else []
    }), 200

@app.route('/api/classes', methods=['GET'])
def get_classes():
    """Get all available class names"""
    if class_names is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    return jsonify({
        'classes': class_names,
        'num_classes': len(class_names)
    }), 200

if __name__ == '__main__':
    print("=" * 60)
    print("Starting Flask API Server for Eye Disease Diagnosis")
    print("=" * 60)
    print(f"Device: {DEVICE}")
    print(f"Model path: {MODEL_SAVE_PATH}")
    print(f"Model loaded: {model is not None}")
    if class_names:
        print(f"Classes: {class_names}")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)