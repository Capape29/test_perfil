/**
 * render.js
 * Módulo para renderizar la interfaz de usuario del test Likert
 * Contiene funciones para mostrar cada pantalla de la app
 */

import { getResponse, saveResponse, saveName, getName, getCurrentQuestion, 
         saveCurrentQuestion, clearAll, saveCompletionDate } from '../lib/storage.js';
import { calculateScores, getDominantCategory, getCategoryName, generateResults } from '../lib/scoring.js';

/**
 * Renderiza la pantalla de inicio con input de nombre y botón de comenzar
 * @param {HTMLElement} appElement - Elemento raíz donde renderizar
 * @param {function} onStart - Callback cuando se presiona "Iniciar test"
 */
export function renderStartScreen(appElement, onStart) {
  const savedName = getName();

  appElement.innerHTML = `
    <div class="container">
      <div class="card">
        <h1>Test Likert</h1>
        <p class="subtitle">Descubre tu perfil de resolución de problemas</p>
        
        <div class="form-group">
          <label for="nameInput">Tu nombre (opcional):</label>
          <input 
            type="text" 
            id="nameInput" 
            placeholder="ej: Juan" 
            value="${savedName}"
            maxlength="50"
          />
        </div>
        
        <p class="info-text">
          Este test contiene 37 enunciados. Responde según tu honrada opinión.
        </p>
        
        <button id="startBtn" class="btn btn-primary">Iniciar Test</button>
      </div>
    </div>
  `;

  document.getElementById('startBtn').addEventListener('click', () => {
    const nameInput = document.getElementById('nameInput');
    const name = nameInput.value.trim();
    if (name) {
      saveName(name);
    }
    onStart();
  });
}

/**
 * Renderiza una pregunta del test
 * @param {HTMLElement} appElement - Elemento raíz
 * @param {object} question - Objeto pregunta {id, text, category}
 * @param {number} currentIndex - Número actual (1-37)
 * @param {number} totalQuestions - Total de preguntas
 * @param {function} onResponse - Callback cuando se selecciona respuesta
 * @param {function} onNext - Callback para siguiente pregunta
 * @param {function} onPrevious - Callback para pregunta anterior
 * @param {function} onFinish - Callback para finalizar test
 * @param {array} allQuestions - Array de todas las preguntas
 */
export function renderQuestion(
  appElement,
  question,
  currentIndex,
  totalQuestions,
  onResponse,
  onNext,
  onPrevious,
  onFinish,
  allQuestions
) {
  const currentResponse = getResponse(question.id);

  appElement.innerHTML = `
    <div class="container">
      <div class="card">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${(currentIndex / totalQuestions) * 100}%"></div>
        </div>
        <p class="progress-text">Pregunta ${currentIndex} de ${totalQuestions}</p>
        
        <h2 class="question-text">${question.text}</h2>
        
        <p class="scale-label">¿Qué tan de acuerdo estás?</p>
        
        <div class="likert-scale">
          <div class="scale-option">
            <input 
              type="radio" 
              name="likert" 
              id="opt1" 
              value="1"
              ${currentResponse === 1 ? 'checked' : ''}
            />
            <label for="opt1">
              <span class="number">1</span>
              <span class="text">Poco se parece a mí</span>
            </label>
          </div>
          
          <div class="scale-option">
            <input 
              type="radio" 
              name="likert" 
              id="opt2" 
              value="2"
              ${currentResponse === 2 ? 'checked' : ''}
            />
            <label for="opt2">
              <span class="number">2</span>
              <span class="text">Algo se parece a mí</span>
            </label>
          </div>
          
          <div class="scale-option">
            <input 
              type="radio" 
              name="likert" 
              id="opt3" 
              value="3"
              ${currentResponse === 3 ? 'checked' : ''}
            />
            <label for="opt3">
              <span class="number">3</span>
              <span class="text">Neutro</span>
            </label>
          </div>
          
          <div class="scale-option">
            <input 
              type="radio" 
              name="likert" 
              id="opt4" 
              value="4"
              ${currentResponse === 4 ? 'checked' : ''}
            />
            <label for="opt4">
              <span class="number">4</span>
              <span class="text">Se parece a mí</span>
            </label>
          </div>
          
          <div class="scale-option">
            <input 
              type="radio" 
              name="likert" 
              id="opt5" 
              value="5"
              ${currentResponse === 5 ? 'checked' : ''}
            />
            <label for="opt5">
              <span class="number">5</span>
              <span class="text">Se parece mucho a mí</span>
            </label>
          </div>
        </div>
        
        <div class="button-group">
          <button 
            id="prevBtn" 
            class="btn btn-secondary"
            ${currentIndex === 1 ? 'disabled' : ''}
          >
            ← Anterior
          </button>
          
          <span id="warningMsg" class="warning-text" style="display: none;">
            Debes responder antes de continuar
          </span>
          
          <button 
            id="nextBtn" 
            class="btn btn-primary"
          >
            ${currentIndex === totalQuestions ? 'Finalizar' : 'Siguiente →'}
          </button>
        </div>
      </div>
    </div>
  `;

  // Agregar listeners para cambios de radio
  document.querySelectorAll('input[name="likert"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const score = parseInt(e.target.value, 10);
      onResponse(question.id, score);
      document.getElementById('warningMsg').style.display = 'none';
    });
  });

  // Botón Siguiente o Finalizar
  document.getElementById('nextBtn').addEventListener('click', () => {
    if (!getResponse(question.id)) {
      document.getElementById('warningMsg').style.display = 'block';
      return;
    }
    document.getElementById('warningMsg').style.display = 'none';
    
    if (currentIndex === totalQuestions) {
      saveCompletionDate();
      onFinish(allQuestions);
    } else {
      onNext();
    }
  });

  // Botón Anterior
  if (currentIndex > 1) {
    document.getElementById('prevBtn').addEventListener('click', onPrevious);
  }
}

/**
 * Renderiza la pantalla de resultados finales
 * @param {HTMLElement} appElement - Elemento raíz
 * @param {array} questions - Array de todas las preguntas
 * @param {object} responses - Respuestas del usuario
 * @param {function} onRestart - Callback para reiniciar el test
 */
export function renderResults(appElement, questions, responses, onRestart) {
  const results = generateResults(responses, questions);
  const { scores, dominant, name } = results;
  const userName = getName();

  // Encontrar max y min para escalar la visualización
  const maxScore = Math.max(...Object.values(scores));

  appElement.innerHTML = `
    <div class="container">
      <div class="card">
        <h1>¡Test Completado!</h1>
        ${userName ? `<p class="user-greeting">¡Gracias, ${userName}!</p>` : ''}
        
        <div class="results-section">
          <h2>Tu Categoría Dominante:</h2>
          <div class="dominant-badge">
            <span class="category-letter">${dominant}</span>
            <span class="category-name">${name}</span>
          </div>
        </div>
        
        <div class="scores-section">
          <h3>Puntuaciones por Categoría:</h3>
          <table class="scores-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Nombre</th>
                <th>Puntuación</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>A</td>
                <td>Clarificador</td>
                <td><strong>${scores.A}</strong></td>
              </tr>
              <tr>
                <td>B</td>
                <td>Creativo</td>
                <td><strong>${scores.B}</strong></td>
              </tr>
              <tr>
                <td>C</td>
                <td>Analítico</td>
                <td><strong>${scores.C}</strong></td>
              </tr>
              <tr>
                <td>D</td>
                <td>Implementador</td>
                <td><strong>${scores.D}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="chart-section">
          <h3>Visualización:</h3>
          <div class="bar-chart">
            ${['A', 'B', 'C', 'D'].map(cat => `
              <div class="bar-item">
                <div class="bar-label">${cat}</div>
                <div class="bar-container">
                  <div class="bar-fill" style="width: ${(scores[cat] / maxScore) * 100}%;" title="${scores[cat]}"></div>
                </div>
                <div class="bar-value">${scores[cat]}</div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <button id="restartBtn" class="btn btn-primary">Reiniciar Test</button>
      </div>
    </div>
  `;

  document.getElementById('restartBtn').addEventListener('click', () => {
    clearAll();
    onRestart();
  });
}

/**
 * Renderiza una pantalla de carga (opcional)
 * @param {HTMLElement} appElement - Elemento raíz
 */
export function renderLoading(appElement) {
  appElement.innerHTML = `
    <div class="container">
      <div class="card">
        <p class="loading-text">Cargando test...</p>
      </div>
    </div>
  `;
}
