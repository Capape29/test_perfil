/**
 * storage.js
 * Módulo para guardar y recuperar datos del test en localStorage
 * Sin librerías externas, solo JavaScript puro
 */

//  Definición de la estructura del almacenamiento local
const STORAGE_KEYS = {
  RESPONSES: 'likert_responses',
  CURRENT_QUESTION: 'likert_current_question',
  USER_NAME: 'likert_user_name',
  COMPLETION_DATE: 'likert_completion_date',
  RESULTS: 'likert_results'
};

/**
 * Guarda las respuestas a las preguntas
 * @param {number} questionId - ID de la pregunta
 * @param {number} score - Puntuación (1-5)
 */
export function saveResponse(questionId, score) {
  try {
    let responses = getResponses();
    responses[questionId] = score;
    localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(responses));
  } catch (error) {
    console.error('Error guardando respuesta:', error);
  }
}

/**
 * Obtiene todas las respuestas guardadas
 * @returns {object} Objeto con respuestas {questionId: score}
 */
export function getResponses() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RESPONSES);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error leyendo respuestas:', error);
    return {};
  }
}

/**
 * Obtiene la respuesta de una pregunta específica
 * @param {number} questionId - ID de la pregunta
 * @returns {number|null} Puntuación o null si no existe
 */
export function getResponse(questionId) {
  const responses = getResponses();
  return responses[questionId] || null;
}

/**
 * Guarda el número de pregunta actual
 * @param {number} questionNumber - Número de pregunta (1-37)
 */
export function saveCurrentQuestion(questionNumber) {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_QUESTION, String(questionNumber));
  } catch (error) {
    console.error('Error guardando pregunta actual:', error);
  }
}

/**
 * Obtiene el número de pregunta actual
 * @returns {number} Número de pregunta (default 1)
 */
export function getCurrentQuestion() {
  try {
    const num = localStorage.getItem(STORAGE_KEYS.CURRENT_QUESTION);
    return num ? parseInt(num, 10) : 1;
  } catch (error) {
    console.error('Error leyendo pregunta actual:', error);
    return 1;
  }
}

/**
 * Guarda el nombre del usuario
 * @param {string} name - Nombre del usuario
 */
export function saveName(name) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
  } catch (error) {
    console.error('Error guardando nombre:', error);
  }
}

/**
 * Obtiene el nombre del usuario
 * @returns {string} Nombre del usuario o vacío
 */
export function getName() {
  try {
    return localStorage.getItem(STORAGE_KEYS.USER_NAME) || '';
  } catch (error) {
    console.error('Error leyendo nombre:', error);
    return '';
  }
}

/**
 * Guarda la fecha de finalización del test
 */
export function saveCompletionDate() {
  try {
    const now = new Date().toLocaleString('es-ES');
    localStorage.setItem(STORAGE_KEYS.COMPLETION_DATE, now);
  } catch (error) {
    console.error('Error guardando fecha:', error);
  }
}

/**
 * Obtiene la fecha de finalización
 * @returns {string} Fecha de finalización o vacío
 */
export function getCompletionDate() {
  try {
    return localStorage.getItem(STORAGE_KEYS.COMPLETION_DATE) || '';
  } catch (error) {
    console.error('Error leyendo fecha:', error);
    return '';
  }
}

/**
 * Guarda los resultados finales del test
 * @param {object} results - Objeto con puntajes por categoría {A: n, B: n, ...}
 */
export function saveResults(results) {
  try {
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
  } catch (error) {
    console.error('Error guardando resultados:', error);
  }
}

/**
 * Obtiene los resultados guardados
 * @returns {object|null} Resultados o null si no existen
 */
export function getResults() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RESULTS);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error leyendo resultados:', error);
    return null;
  }
}

/**
 * Limpia todo: respuestas, progreso, nombre y resultados
 * (Útil para el botón "Reiniciar test")
 */
export function clearAll() {
  try {
    localStorage.removeItem(STORAGE_KEYS.RESPONSES);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_QUESTION);
    localStorage.removeItem(STORAGE_KEYS.USER_NAME);
    localStorage.removeItem(STORAGE_KEYS.RESULTS);
    localStorage.removeItem(STORAGE_KEYS.COMPLETION_DATE);
  } catch (error) {
    console.error('Error limpiando almacenamiento:', error);
  }
}

/**
 * Verifica si hay un test en progreso
 * @returns {boolean} true si hay respuestas guardadas
 */
export function hasInProgress() {
  const responses = getResponses();
  return Object.keys(responses).length > 0;
}
