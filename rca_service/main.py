from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict
import pandas as pd
import joblib
import os
import uvicorn
from typing import List, Dict

# Initialize FastAPI app
app = FastAPI(title="Supply Chain RCA Prediction Service")

# Define file paths for models
MODEL_PATH = "models/rca_model.pkl"
ENCODER_PATH = "models/label_encoder.pkl"
IMPUTER_PATH = "models/imputer.pkl"
FEATURES_PATH = "models/features.pkl"

# Global variables to hold loaded artifacts
model = None
label_encoder = None
imputer = None
feature_names = None

@app.on_event("startup")
def load_models():
    """Load all machine learning artifacts at application startup."""
    global model, label_encoder, imputer, feature_names
    
    try:
        if not all(os.path.exists(p) for p in [MODEL_PATH, ENCODER_PATH, IMPUTER_PATH, FEATURES_PATH]):
            raise FileNotFoundError("One or more model artifact files are missing in the 'models/' directory.")

        # Using joblib as it is more robust for sklearn models and handles the STACK_GLOBAL error
        model = joblib.load(MODEL_PATH)
        label_encoder = joblib.load(ENCODER_PATH)
        imputer = joblib.load(IMPUTER_PATH)
        feature_names = joblib.load(FEATURES_PATH)
            
        print("✅ All ML artifacts loaded successfully.")
    except Exception as e:
        print(f"❌ Error loading models: {e}")
        raise e

class PredictionInput(BaseModel):
    # Flexible input validation using Pydantic
    # Using a dict to allow any of the feature names
    data: List[Dict[str, float]]

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "data": [
                    {
                        "delay_minutes": 85.0,
                        "detention_cost": 120.0,
                        "congestion_score_x": 0.8,
                        "weather_risk_score": 0.4,
                        "distance_km": 450.0,
                        "avg_delay_minutes": 45.0,
                        "ontime_percentage": 0.75,
                        "rejection_rate": 0.05,
                        "delay_per_km": 0.18,
                        "cost_per_delay": 1.4,
                        "carrier_risk_score": 0.6,
                        "total_risk_score": 1.2,
                        "congestion_weather_interaction": 0.32,
                        "carrier_delay_ratio": 1.1,
                        "detention_intensity": 0.26,
                        "risk_pressure": 0.85
                    }
                ]
            }
        }
    )

@app.post("/predict")
async def predict(input_data: PredictionInput):
    """
    Perform RCA prediction on the input data.
    """
    if model is None or label_encoder is None or imputer is None or feature_names is None:
        raise HTTPException(status_code=500, detail="Model not loaded. Please check server logs.")

    try:
        # 1. Convert input JSON to DataFrame
        df = pd.DataFrame(input_data.data)

        # 2. Check for missing columns and fill with NaN
        # This allows the imputer to fill them with learned statistics (mean/median)
        # instead of a hardcoded 0.
        for col in feature_names:
            if col not in df.columns:
                df[col] = None # Will be treated as NaN by pandas

        # 3. Reorder columns strictly as per training (features.pkl)
        df = df[feature_names]

        # 4. Apply Imputer (Pre-processing)
        # This will fill the missing/NaN values using the saved model strategy
        imputed_data = imputer.transform(df)

        # 5. Run Prediction
        predictions = model.predict(imputed_data)
        
        # 6. Get Confidence (Probabilities)
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(imputed_data)
            # Get the probability of the predicted class
            predicted_idx = predictions[0] # The numeric predicted class
            # XGBoost/Sklearn index might differ if using custom encoder, 
            # but usually predict returns the index for predict_proba
            confidence = float(max(probs[0]))
        else:
            confidence = 1.0

        # 7. Decode prediction label using the label encoder
        predicted_label = label_encoder.inverse_transform(predictions)[0]

        return {
            "rca_class": predicted_label,
            "confidence": confidence,
            "status": "success"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=10000)
