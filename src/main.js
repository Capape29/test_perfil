/**
 * main.js
 * Punto de entrada principal de la aplicación test Likert
 * Maneja la navegación entre pantallas y coordinación de módulos
 */

import './style.css';
import questions from './data/questions.json';
import {
  getResponses,
  saveResponse,
  getCurrentQuestion,
  saveCurrentQuestion,
  getResults,
  saveResults,
  hasInProgress
} from './lib/storage.js';
import {
  renderStartScreen,
  renderQuestion,
  renderResults,
  renderLoading
} from './ui/render.js';
import { generateResults } from './lib/scoring.js';

// Elemento raíz de la aplicación
const appElement = document.getElementById('app');

// Variables de estado
let currentScreen = 'start'; // 'start', 'question', 'results'
let currentQuestionIndex = 0; // 0-36

/**
 * Inicia la aplicación
 * Verifica si hay un test en progreso o muestra pantalla de inicio
 */
function init() {
  try {
    // Verificar si hay resultados ya completados
    const completedResults = getResults();
    if (completedResults) {
      // Mostrar resultados
      currentScreen = 'results';
      showResults();
    } else if (hasInProgress()) {
      // Hay un test en progreso, continuar desde donde se quedó
      currentScreen = 'question';
      currentQuestionIndex = getCurrentQuestion() - 1;
      showQuestion();
    } else {
      // Nuevo test, mostrar pantalla de inicio
      currentScreen = 'start';
      showStart();
    }
  } catch (error) {
    console.error('Error inicializando app:', error);
    showStart();
  }
}

/**
 * Muestra la pantalla de inicio
 */
function showStart() {
  renderStartScreen(appElement, () => {
    currentScreen = 'question';
    currentQuestionIndex = 0;
    showQuestion();
  });
}

/**
 * Muestra la pregunta actual
 */
function showQuestion() {
  if (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) {
    console.error('Índice de pregunta inválido');
    showStart();
    return;
  }

  const question = questions[currentQuestionIndex];
  
  renderQuestion(
    appElement,
    question,
    currentQuestionIndex + 1, // Número de pregunta (1-37)
    questions.length, // Total de preguntas
    handleResponse, // Callback para guardar respuesta
    handleNext, // Callback para siguiente pregunta
    handlePrevious, // Callback para pregunta anterior
    handleFinish, // Callback para finalizar test
    questions // Pasar todas las preguntas
  );
}

/**
 * Maneja la respuesta a una pregunta
 * @param {number} questionId - ID de la pregunta
 * @param {number} score - Puntuación (1-5)
 */
function handleResponse(questionId, score) {
  try {
    saveResponse(questionId, score);
  } catch (error) {
    console.error('Error guardando respuesta:', error);
  }
}

/**
 * Avanza a la siguiente pregunta
 */
function handleNext() {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    saveCurrentQuestion(currentQuestionIndex + 1);
    showQuestion();
  }
}

/**
 * Retrocede a la pregunta anterior
 */
function handlePrevious() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    saveCurrentQuestion(currentQuestionIndex + 1);
    showQuestion();
  }
}

/**
 * Finaliza el test y muestra resultados
 * @param {array} allQuestions - Array de todas las preguntas
 */
function handleFinish(allQuestions) {
  try {
    const responses = getResponses();
    const results = generateResults(responses, allQuestions);
    saveResults(results);
    currentScreen = 'results';
    showResults();
  } catch (error) {
    console.error('Error finalizando test:', error);
    alert('Error al procesar resultados. Intenta nuevamente.');
  }
}

/**
 * Muestra la pantalla de resultados
 */
function showResults() {
  const responses = getResponses();
  renderResults(appElement, questions, responses, () => {
    // Callback para reiniciar test
    init();
  });
}

// Iniciar la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
