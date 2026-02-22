/**
 * scoring.js
 * Módulo para calcular puntuaciones del test Likert
 * Mapea respuestas a 4 categorías: A, B, C, D
 */

/**
 * Nombres descriptivos de cada categoría
 * EDITABLE: Cambia estos nombres según necesites
 */
const CATEGORY_NAMES = {
  A: 'Clarificador',
  B: 'Creativo',
  C: 'Analítico',
  D: 'Implementador'
};

/**
 * Calcula los puntajes de todas las categorías
 * @param {object} responses - Respuestas del usuario {questionId: score}
 * @param {array} questions - Array de preguntas con su categoría
 * @returns {object} Puntajes por categoría {A: n, B: n, C: n, D: n}
 */
export function calculateScores(responses, questions) {
  // Inicializar contadores
  const scores = { A: 0, B: 0, C: 0, D: 0 };

  // Sumar puntuaciones por categoría
  questions.forEach(question => {
    const responseScore = responses[question.id];
    if (responseScore !== undefined && responseScore !== null) {
      scores[question.category] += responseScore;
    }
  });

  return scores;
}

/**
 * Encuentra la categoría dominante (con mayor puntuación)
 * @param {object} scores - Puntajes por categoría
 * @returns {string} Letra de la categoría dominante (A, B, C o D)
 */
export function getDominantCategory(scores) {
  let dominant = 'A';
  let maxScore = scores.A;

  ['B', 'C', 'D'].forEach(category => {
    if (scores[category] > maxScore) {
      maxScore = scores[category];
      dominant = category;
    }
  });

  return dominant;
}

/**
 * Obtiene el nombre descriptivo de una categoría
 * @param {string} categoryKey - A, B, C o D
 * @returns {string} Nombre de la categoría
 */
export function getCategoryName(categoryKey) {
  return CATEGORY_NAMES[categoryKey] || 'Desconocido';
}

/**
 * Crea un objeto con puntuaciones y detalles
 * @param {object} responses - Respuestas del usuario
 * @param {array} questions - Array de preguntas
 * @returns {object} Objeto con scores, dominant, name, etc.
 */
export function generateResults(responses, questions) {
  const scores = calculateScores(responses, questions);
  const dominant = getDominantCategory(scores);
  const name = getCategoryName(dominant);

  return {
    scores,          // {A: 45, B: 38, C: 52, D: 41}
    dominant,        // "C"
    name,            // "Analítico"
    totalResponses: Object.keys(responses).length,
    timestamp: new Date().toISOString()
  };
}
