// ia.js
const API_KEY = 'AIzaSyDAoHWaIurBS8vXiaVm7tgNqUp2SHt5rGI'; // tu key aquí

async function generateMoneyNews(gameData, countryName) {
  const { bandName, leaderName } = gameData;

  const prompt = `
Eres un generador de titulares y noticias satíricas muy breves. 
Debes devolver el resultado en formato JSON con dos campos: "headline" y "body".
Máximo 50 palabras entre ambos textos (titular + noticia).
Usa un estilo de parodia tipo "El Mundo Today", mencionando a la banda criminal "${bandName}" 
liderada por "${leaderName}" que ha encontrado una suma de dinero en ${countryName}. 
Céntrate en que la noticia sea sobre un hallazgo, sin especificar la cantidad exacta y siempre en ${countryName}.
Incluye referencias irónicas o estereotipadas de ${countryName}.
No añadas nada más que el JSON. 
Ejemplo de respuesta:
{
  "headline": "Titular gracioso",
  "body": "Texto satírico"
}
`;

  return await generateContent(prompt);
}

async function generateEsbirrosNews(gameData, countryName) {
  const { bandName, leaderName } = gameData;

  const prompt = `
Eres un generador de titulares y noticias satíricas muy breves. 
Devuelve el resultado en formato JSON con "headline" y "body".
Máximo 50 palabras entre ambos textos.
Estilo parodia "El Mundo Today".
Banda criminal "${bandName}" liderada por "${leaderName}" 
que ha reclutado un número de esbirros en ${countryName}.
Céntrate en el reclutamiento en ${countryName}, sin inventar expansiones a otros países.
Usa ironía y estereotipos del país ${countryName}.
No añadas nada más que el JSON.
`;

  return await generateContent(prompt);
}


async function generatePoliceNews(gameData, countryName) {
  const { bandName, leaderName } = gameData;

  const prompt = `
Eres un generador de titulares y noticias satíricas muy breves. 
Devuelve el resultado en formato JSON con "headline" y "body".
Máximo 50 palabras en total.
Estilo parodia "El Mundo Today".
Banda criminal "${bandName}" liderada por "${leaderName}" 
que ha logrado reducir la presión policial en ${countryName}.
Céntrate en la reducción de la presión policial en ${countryName}.
Incluye referencias irónicas de ${countryName}.
No añadas nada más que el JSON.
`;

  return await generateContent(prompt);
}


async function generateContent(prompt) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );
    const data = await response.json();

    if (data.candidates && data.candidates[0].content.parts[0].text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      return '{"headline":"Error","body":"No se pudo generar la noticia"}';
    }
  } catch (error) {
    console.error('Error al generar la noticia:', error);
    return '{"headline":"Error","body":"Problemas con la API, inténtalo de nuevo."}';
  }
}


function generateWelcomeMessage(gameData) {
  const { leaderName, bandName, startCountry } = gameData;
  return {
    title: "<span class='welcome-title'>Bienvenid@</span>",
    message: `
      <div class='welcome-message-container'>
        <p>¡Bienvenido, <b>${leaderName}</b> de la banda <b>${bandName}</b>!</p>
        <p>Has comenzado tu imperio criminal en <b>${startCountry}</b>.</p>
        <p>Haz clic en el botón de dinero para empezar a generar ingresos, 
        mejora tus esbirros para expandir tu influencia y domina el mundo. 
        ¡Buena suerte, vas a necesitarla!</p>
      </div>`
  };
}

export { generateMoneyNews, generateEsbirrosNews, generatePoliceNews, generateWelcomeMessage };