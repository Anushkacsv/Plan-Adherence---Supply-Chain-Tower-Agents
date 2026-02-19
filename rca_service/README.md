# Supply Chain RCA Prediction Service

This is a FastAPI-based microservice that exposes a machine learning model for Root Cause Analysis (RCA) in supply chain logistics.

## Project Structure
```
rca_service/
├── main.py              # FastAPI application logic
├── requirements.txt     # Python dependencies
├── models/              # Pre-trained ML artifacts (pickles)
│   ├── rca_model.pkl
│   ├── label_encoder.pkl
│   ├── imputer.pkl
│   └── features.pkl
└── test_request.json    # Example JSON for prediction
```

## Setup and Running Locally

1. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the server:**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 10000
   ```

## API Documentation

- **Swagger UI**: [http://localhost:10000/docs](http://localhost:10000/docs)
- **POST `/predict`**: Submit logistics features to get the predicted RCA class and confidence score.

### Example Request using cURL:
```bash
curl -X POST "http://localhost:10000/predict" \
     -H "Content-Type: application/json" \
     -d @test_request.json
```

### Response Format:
```json
{
  "rca_class": "Weather Conditions",
  "confidence": 0.89
}
```

## Deployment
This service is configured to run on Render or similar platforms using the provided uvicorn command.
