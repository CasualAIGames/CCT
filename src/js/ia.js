// ia.js
const API_KEY = 'AIzaSyDAoHWaIurBS8vXiaVm7tgNqUp2SHt5rGI';

async function generateMoneyNews(gameData, countryName) {
    const { bandName, leaderName } = gameData;

    const prompt = `Genera un titular y una noticia muy corta, estilo El Mundo Today, sobre la banda criminal "${bandName}" liderada por "${leaderName}" que acaba de encontrar una gran suma de dinero en ${countryName}. La noticia debe ser satírica y graciosa, de no más de 70 palabras.`;

    return await generateContent(prompt);
}

async function generateEsbirrosNews(gameData, countryName) {
    const { bandName, leaderName } = gameData;

    const prompt = `Genera un titular y una noticia muy corta, estilo El Mundo Today, sobre la banda criminal "${bandName}" liderada por "${leaderName}" que ha reclutado muchos nuevos esbirros en ${countryName}. La noticia debe ser satírica y graciosa, de no más de 70 palabras.`;

    return await generateContent(prompt);
}

async function generatePoliceNews(gameData, countryName) {
    const { bandName, leaderName } = gameData;

    const prompt = `Genera un titular y una noticia muy corta, estilo El Mundo Today, sobre la banda criminal "${bandName}" liderada por "${leaderName}" que ha conseguido reducir la presión policial en ${countryName}. La noticia debe ser satírica y graciosa, de no más de 70 palabras.`;

    return await generateContent(prompt);
}


async function generateContent(prompt) {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }],
                        },
                    ],
                }),
            }
        );
        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "No se pudo generar la noticia";
        }
    } catch (error) {
        console.error('Error al generar la noticia:', error);
        return 'Error al generar la noticia, prueba otra vez';
    }
}
function generateWelcomeMessage(gameData) {
    const { leaderName, bandName, startCountry } = gameData;
    return {
        title: "<span class='welcome-title'>Bienvenid@</span>",
        message: `<div class='welcome-message-container'>
                    <p>¡Bienvenido, <b>${leaderName}</b> de la banda <b>${bandName}</b>!</p>
                    <p>Has comenzado tu imperio criminal en <b>${startCountry}</b>.</p>
                    <p>Haz clic en el botón de dinero para empezar a generar ingresos, mejora tus esbirros para expandir tu influencia y domina el mundo. ¡Buena suerte, vas a necesitarla!</p>
                  </div>`
    };
}


export { generateMoneyNews, generateEsbirrosNews, generatePoliceNews, generateWelcomeMessage };