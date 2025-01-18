// ia.js
const API_KEY = 'AIzaSyDAoHWaIurBS8vXiaVm7tgNqUp2SHt5rGI';

async function generateNews(gameData, eventType) {
  const {
    bandName,
    leaderName,
    leaderGender,
    startYear,
    currentCountry,
    countryStatus,
    policeStars,
    money,
    esbirros,
  } = gameData;

  let countryInfo = null;
  let countryName = "";
  let esbirrosCount = 0;
  let arrestedCount = 0;
  let population = 0;

  if (currentCountry && countryStatus[currentCountry]) {
    countryInfo = countryStatus[currentCountry];
    countryName = countryInfo.countryName || currentCountry;
    esbirrosCount = countryInfo.esbirros || 0;
    arrestedCount = countryInfo.arrestedTotal || 0;
    population = countryInfo.popReal || 0;
  }

  const moneyFormatted = formatNumber(money);
  const leaderPronoun = leaderGender === 'man' ? 'el' : 'la';

  // Puedes añadir más texto si deseas que la IA sepa que el máximo de estrellas es 5, etc.
  const prompt = `Genera una noticia al estilo "Mundo Today" sobre la banda de criminales "${bandName}", liderada por ${leaderPronoun} "${leaderName}", formada en el año ${startYear}.
  La banda opera actualmente en ${countryName}, donde tienen ${esbirrosCount} esbirros y ${arrestedCount} detenidos, con una población de ${population}.
  La policía en esa zona tiene ${policeStars} de un máximo de 5 estrellas de vigilancia. La banda tiene ${moneyFormatted} de dinero.
  Ajusta la noticia para que sea graciosa y satírica, del estilo de El Mundo Today. No inventes datos que no estén en el prompt, pero puedes dar pistas sobre el estado de la partida.

  La noticia debe tener un titular y un pequeño desarrollo de la noticia de entre 50 y 100 palabras.
  Elige un tipo de evento como: ${eventType}. No uses enumeraciones o puntos, siempre en un estilo corrido.
  Usa detalles locales si el país es conocido (ciudades, barrios, etc.). Si hay mucho dinero, di que se van de vacaciones; si hay muchos detenidos, di que están en el calabozo; si hay muchos esbirros, di que montan un festejo, etc.
  `;

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

function formatNumber(num) {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B $";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M $";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K $";
  return num.toFixed(2) + " $";
}

export { generateNews };
