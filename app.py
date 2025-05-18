from flask import Flask, render_template, request, jsonify
import joblib
import os
import re
import nltk
from nltk.corpus import stopwords
import numpy as np

app = Flask(__name__)

# Cargar modelo y vectorizador
model_path = r"C:\Users\mynor\OneDrive\Documents\UMG\Inteligencia Artificial\Proyecto\sentiment_model.pkl"
vectorizer_path = r"C:\Users\mynor\OneDrive\Documents\UMG\Inteligencia Artificial\Proyecto\vectorizer.pkl"

model = joblib.load(model_path)
vectorizer = joblib.load(vectorizer_path)

# Función de limpieza
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'[^a-z\s]', '', text)
    words = text.split()
    stops = set(stopwords.words('english'))
    words = [w for w in words if w not in stops and len(w) > 2]
    return ' '.join(words)

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    reviews = request.form.getlist('review_text[]')
    results = []
    
    for review in reviews:
        if review.strip():  # Solo procesar reseñas no vacías
            cleaned_text = clean_text(review)
            X = vectorizer.transform([cleaned_text])
            prediction = model.predict(X)[0]
            confidence = np.max(model.predict_proba(X)) * 100
            
            results.append({
                'text': review,
                'prediction': prediction,
                'confidence': confidence
            })
        else:
            results.append(None)
    
    return jsonify(results=results)

if __name__ == '__main__':
    app.run(debug=True)