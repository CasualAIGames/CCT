// ia.js
const API_KEY = 'AIzaSyDAoHWaIurBS8vXiaVm7tgNqUp2SHt5rGI'; // tu key aquí

async function generateMoneyNews(gameData, countryName) {
  const { bandName, leaderName } = gameData;

  const prompt = `
Genera una noticia satírica breve en formato JSON con dos campos: "headline" y "body".
Máximo 50 palabras en total.
Estilo parodia tipo "El Mundo Today".
La noticia debe ser sobre la banda "${bandName}" de ${leaderName} que ha encontrado dinero en ${countryName}.
Incluye referencias irónicas o estereotipos de ${countryName}.
Ejemplo de formato:
{
  "headline": "Titular gracioso",
  "body": "Texto satírico"
}`;

  return await generateContent(prompt);
}

async function generateEsbirrosNews(gameData, countryName) {
  const { bandName, leaderName } = gameData;

  const prompt = `
Genera una noticia satírica breve en formato JSON con dos campos: "headline" y "body".
Máximo 50 palabras en total.
Estilo parodia tipo "El Mundo Today".
La noticia debe ser sobre la banda "${bandName}" de ${leaderName} que ha reclutado esbirros en ${countryName}.
Incluye referencias irónicas o estereotipos de ${countryName}.
Ejemplo de formato:
{
  "headline": "Titular gracioso",
  "body": "Texto satírico"
}`;

  return await generateContent(prompt);
}

async function generatePoliceNews(gameData, countryName) {
  const { bandName, leaderName } = gameData;

  const prompt = `
Genera una noticia satírica breve en formato JSON con dos campos: "headline" y "body".
Máximo 50 palabras en total.
Estilo parodia tipo "El Mundo Today".
La noticia debe ser sobre la banda "${bandName}" de ${leaderName} que ha reducido la presión policial en ${countryName}.
Incluye referencias irónicas o estereotipos de ${countryName}.
Ejemplo de formato:
{
  "headline": "Titular gracioso",
  "body": "Texto satírico"
}`;

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
    
    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("Respuesta de la API incompleta:", data);
      return JSON.stringify({
        headline: "Error de Comunicación",
        body: "No se pudo generar la noticia. Inténtalo de nuevo."
      });
    }

    const text = data.candidates[0].content.parts[0].text.trim();
    
    try {
      // Intenta parsear el JSON para validarlo
      JSON.parse(text);
      return text;
    } catch (e) {
      console.error("Error al parsear JSON de la API:", e);
      console.log("Texto recibido:", text);
      
      // Si no es JSON válido, intenta extraer el contenido y formatearlo
      const headlineMatch = text.match(/"headline":\s*"([^"]+)"/);
      const bodyMatch = text.match(/"body":\s*"([^"]+)"/);
      
      if (headlineMatch && bodyMatch) {
        return JSON.stringify({
          headline: headlineMatch[1],
          body: bodyMatch[1]
        });
      }
      
      return JSON.stringify({
        headline: "Error de Formato",
        body: "La noticia no tiene el formato correcto. Inténtalo de nuevo."
      });
    }
  } catch (error) {
    console.error('Error al generar la noticia:', error);
    return JSON.stringify({
      headline: "Error de Conexión",
      body: "Hubo un problema al conectar con el servicio. Inténtalo de nuevo."
    });
  }
}

function generateWelcomeMessage(gameData) {
  const { leaderName, bandName, startCountry } = gameData;
  return {
    title: "Bienvenid@ maleant@",
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