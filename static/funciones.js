function initializeApp() {
    const reviewsContainer = document.getElementById('reviews-container');
    const errorElement = document.getElementById('error-message');
    const form = document.getElementById('reviews-form');
    
    // Agregar nuevo campo de reseña
    document.getElementById('add-review-btn').addEventListener('click', function() {
        const newRow = document.createElement('div');
        newRow.className = 'review-row';
        newRow.innerHTML = `
            <div class="input-column">
                <textarea name="review_text[]" placeholder="Escribe otra reseña aquí..."></textarea>
                <button type="button" class="remove-review-btn">Eliminar esta reseña</button>
            </div>
            <div class="result-column">
                <div class="empty-result">El resultado aparecerá aquí</div>
            </div>
        `;
        reviewsContainer.appendChild(newRow);
        
        // Agregar evento al botón de eliminar
        newRow.querySelector('.remove-review-btn').addEventListener('click', function() {
            reviewsContainer.removeChild(newRow);
        });
    });
    
    // Eliminar campo de reseña (para el campo inicial)
    document.querySelector('.remove-review-btn')?.addEventListener('click', function() {
        const row = this.closest('.review-row');
        if (document.querySelectorAll('.review-row').length > 1) {
            reviewsContainer.removeChild(row);
        } else {
            row.querySelector('textarea').value = '';
            row.querySelector('.result-column').innerHTML = '<div class="empty-result">El resultado aparecerá aquí</div>';
        }
    });
    
    // Limpiar todo
    document.getElementById('clear-btn').addEventListener('click', function() {
        const rows = document.querySelectorAll('.review-row');
        rows.forEach((row, index) => {
            if (index === 0) {
                // Limpiar el primer campo pero no eliminarlo
                row.querySelector('textarea').value = '';
                row.querySelector('.result-column').innerHTML = '<div class="empty-result">El resultado aparecerá aquí</div>';
            } else {
                // Eliminar campos adicionales
                reviewsContainer.removeChild(row);
            }
        });
        errorElement.classList.add('hidden');
    });
    
    // Analizar reseñas
    document.getElementById('analyze-btn').addEventListener('click', analyzeReviews);
}

function analyzeReviews() {
    const textareas = document.querySelectorAll('textarea[name="review_text[]"]');
    const rows = document.querySelectorAll('.review-row');
    const errorElement = document.getElementById('error-message');
    let hasContent = false;
    
    // Validar campos
    textareas.forEach(textarea => {
        if (textarea.value.trim() !== '') {
            hasContent = true;
        }
    });
    
    if (!hasContent) {
        errorElement.textContent = 'Por favor ingresa al menos una reseña para analizar.';
        errorElement.classList.remove('hidden');
        return;
    }
    
    errorElement.classList.add('hidden');
    
    // Mostrar "Analizando..." en cada campo no vacío
    rows.forEach((row, index) => {
        const resultColumn = row.querySelector('.result-column');
        const text = textareas[index]?.value.trim();
        
        if (!text || text === '') {
            resultColumn.innerHTML = '<div class="empty-result">Campo vacío - no analizado</div>';
            return;
        }
        
        resultColumn.innerHTML = `
            <div class="empty-result">
                <span class="loading"></span>Analizando...
            </div>
        `;
    });
    
    // Preparar datos para enviar
    const formData = new FormData();
    textareas.forEach(textarea => {
        formData.append('review_text[]', textarea.value);
    });
    
    // Enviar solicitud AJAX
    fetch('/analyze', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        return response.json();
    })
    .then(data => {
        // Procesar resultados
        const rows = document.querySelectorAll('.review-row');
        const textareas = document.querySelectorAll('textarea[name="review_text[]"]');
        
        rows.forEach((row, index) => {
            const resultColumn = row.querySelector('.result-column');
            const text = textareas[index]?.value.trim();
            
            if (!text || text === '') {
                resultColumn.innerHTML = '<div class="empty-result">Campo vacío - no analizado</div>';
                return;
            }
            
            if (data.results && data.results[index]) {
                const result = data.results[index];
                const resultDiv = document.createElement('div');
                resultDiv.className = `result ${result.prediction}`;
                resultDiv.innerHTML = `                                                
                    <p><strong>Sentimiento:</strong> ${result.prediction.charAt(0).toUpperCase() + result.prediction.slice(1)}</p>
                    <p><strong>Confianza:</strong> ${result.confidence.toFixed(2)}%</p>
                `;
                resultColumn.innerHTML = '';
                resultColumn.appendChild(resultDiv);
            }
        });
    })
    .catch(error => {
        console.error('Error:', error);
        errorElement.textContent = 'Ocurrió un error al analizar las reseñas. Por favor, inténtalo de nuevo.';
        errorElement.classList.remove('hidden');
        
        // Restablecer los estados de carga
        document.querySelectorAll('.result-column').forEach(col => {
            if (col.innerHTML.includes('Analizando...')) {
                col.innerHTML = '<div class="empty-result">Error en el análisis</div>';
            }
        });
    });
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeApp);