# 🔍 VisionAid - Eye Disease Diagnosis & Rehabilitation Platform

## 📋 Overview

VisionAid is a comprehensive web-based platform designed to help users diagnose and manage common eye diseases through AI-powered analysis and personalized rehabilitation exercises.

| Feature | Description |
|---------|-------------|
| **AI Diagnosis** | Upload retinal images for instant disease detection using ResNet152 CNN model |
| **Supported Conditions** | Diabetic Retinopathy, Glaucoma, Cataract, Normal (Healthy) |
| **Personalized Games** | Disease-specific rehabilitation exercises tailored to each condition |
| **Progress Tracking** | Monitor your performance with weekly challenges and consistency tracking |
| **Gamification** | Earn badges for completing consecutive 7-day streaks |
| **User Dashboard** | View scores, activity heatmaps, and average accuracy metrics |

---

## 🚀 Local Setup Guide

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for image storage)

---

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Aryan-Maniyar/VisionAid.git
cd VisionAid
```

---

### 2️⃣ Frontend Setup

Navigate to the frontend folder and install dependencies:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder:
```env
VITE_BACKEND_URL=http://localhost:4000
```

---

### 3️⃣ Backend Setup

Navigate to the backend folder and install dependencies:
```bash
cd ../backend
npm install
```

Create a `.env` file in the `backend` folder:
```env
MONGODB_URI=
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_SECRET_KEY=
JWT_SECRET=
```

---

### 4️⃣ AI Model Setup (Flask API)

Navigate to the Models folder and install Python dependencies:
```bash
cd ../Models
pip install flask flask-cors torch torchvision pillow
pip install scikit-learn matplotlib numpy
```

#### Download Model & Dataset

The CNN model was trained using this Kaggle notebook:  
📌 **[CSE465-v3-Multiclass Notebook](https://www.kaggle.com/code/rayeedaabir/cse465-v3-multiclass)**

**Steps to get the model:**
1. Visit the Kaggle notebook link above
2. Download the **dataset** from the **Input** tab (as ZIP)
3. Download the trained **`.pth` model weights** from the **Output** tab
4. Place the `.pth` file in the `Models` folder as `best_multiclass_eye_disease_resnet152_model.pth`

**Model Architecture:** ResNet152 (Transfer Learning)  
**Classes:** Diabetic Retinopathy, Glaucoma, Cataract, Normal

---

## ▶️ Running the Project

Open **3 separate terminals** and run the following commands:

### Terminal 1: Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on: `http://localhost:5173`

### Terminal 2: Backend (Node.js)
```bash
cd backend
node server.js
# OR for auto-reload during development:
npx nodemon server.js
```
Backend will run on: `http://localhost:4000`

### Terminal 3: AI Model (Flask)
```bash
cd Models
python -u app.py
```
Flask API will run on: `http://localhost:5000`

---

## 🎉 Voila! Project is Ready

Visit `http://localhost:5173` in your browser to access VisionAid.

---

## 🛠️ Tech Stack

### Frontend
- React.js + Vite
- Redux Toolkit (State Management)
- Tailwind CSS
- Chart.js (Data Visualization)
- React Router DOM

### Backend
- Node.js + Express.js
- MongoDB (Database)
- Cloudinary (Image Storage)
- JWT Authentication
- Mongoose ODM

### AI Model
- Python + Flask
- PyTorch + torchvision
- ResNet152 (Pre-trained CNN)
- PIL (Image Processing)

---

## 📊 Features

### 🔬 AI-Powered Diagnosis
- Upload retinal fundus images
- Instant disease classification with confidence scores
- Supports 4 classes: Diabetic Retinopathy, Glaucoma, Cataract, Normal

### 🎮 Personalized Rehabilitation Games
- **Diabetic Retinopathy**: MicroSpot Eliminator, Contrast Precision Grid, Dynamic Blur Detection, and more
- **Glaucoma**: Peripheral Target Catch, Tunnel Vision Escape, Blind Spot Maze, and more
- **Cataract**: Glare Adaptation, Focus Switch, Foggy Vision Object Match, and more

### 📈 Progress Tracking
- Weekly challenge system (4 weeks × 7 challenges)
- Score-based progression (80% required to unlock next challenge)
- Activity heatmap showing consistency
- Badges for completing 7 consecutive days

### 👤 User Dashboard
- Profile management
- Performance charts (Bar graphs for weekly scores)
- Average accuracy metrics
- Badge showcase

---

## 📝 Project Structure
```
visionaid/
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── pages/                # All page-level components (Home, Diagnosis, Exercises, Profile, etc.)
│   │   ├── components/           # Reusable UI components
│   │   ├── redux/                # Redux slices, store configuration
│   │   └── games/                # Cognitive/Rehabilitation games
│   ├── public/
│   ├── package.json
│   └── .env                      # Frontend environment variables
│
├── backend/                      # Node.js + Express backend
│   ├── controllers/              # Logic for each API route
│   ├── models/                   # MongoDB Mongoose schemas
│   ├── routes/                   # API route definitions
│   ├── middlewares/              # Authentication, error handling, uploads
│   ├── config/                   # DB connection & other configurations
│   ├── package.json
│   └── .env                      # Backend environment variables
│
└── Models/                       # Flask AI Inference Server (Eye Disease CNN)
    ├── app.py                    # Flask API entrypoint for model inference
    ├── best_multiclass_eye_disease_resnet152_model.pth   # Trained model weights
    ├── cse465-v3-multiclass.ipynb                        # Kaggle training notebook
    ├── testing_from_image.ipynb                          # Notebook for testing predictions
    └── archive.zip                # (Optional) Dataset/model archive

```


**Happy Coding! 🚀**