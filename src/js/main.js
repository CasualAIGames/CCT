// src/js/main.js
import { moneyUpgrades, esbirrosUpgrades, policeUpgrades, clickInvestments, militaryInvestments, socialInvestments } from "./upgrades.js"
import { generateWelcomeMessage, generateMoneyNews, generateEsbirrosNews, generatePoliceNews } from "./ia.js"
import { initializeAuth, logout, register, login } from "./auth.js"
import { database, ref, set, get } from "./firebase-config.js"
import { generateMoneyParticles } from "./particles.js"
// Import SoundManager
import SoundManager from "./sounds.js"

// Importar Turf.js desde CDN
const turf = window.turf;

SoundManager.init(); // Initialize SoundManager immediately after import

const mapElement = document.getElementById("map")
const notificationContainer = document.getElementById("notificationContainer")
const statsBanner = document.getElementById("statsBanner")
const authContainer = document.getElementById("auth-container")
const registerFormContainer = document.getElementById("register-form-container")
const loginFormContainer = document.getElementById("login-form-container")
const bannerMoneyElement = document.getElementById("bannerMoney")
const bannerArrestedElement = document.getElementById("bannerArrested")
const bannerEsbirrosElement = document.getElementById("bannerEsbirros")
const moneyPerSecondElement = document.getElementById("moneyPerSecond")
const esbirrosPerSecondElement = document.getElementById("esbirrosPerSecond")
const arrestedPerSecondElement = document.getElementById("arrestedPerSecond")
const playerStarsElements = document.querySelectorAll("#playerStars .star")
const bandInfoBandElement = document.getElementById("bandInfoBand")
const bandInfoLeaderElement = document.getElementById("bandInfoLeader")
const bandInfoCountryElement = document.getElementById("bandInfoCountry")
const leaderImgElement = document.getElementById("leaderImage")
const moneyUpgradesContainer = document.getElementById("moneyUpgrades")
const esbirrosUpgradesContainer = document.getElementById("esbirrosUpgrades")
const policeUpgradesContainer = document.getElementById("policeUpgrades")
const clickInvestmentsContainer = document.getElementById("clickInvestments")
const socialInvestmentsContainer = document.getElementById("socialInvestments")
const militaryInvestmentsContainer = document.getElementById("militaryInvestments")
const countryListElement = document.getElementById("country-list")
const detailCountryNameElement = document.getElementById("detailCountryName")
const detailPopulationElement = document.getElementById("detailPopulation")
const detailEsbirrosElement = document.getElementById("detailEsbirros")
const detailArrestedElement = document.getElementById("detailArrested")
const btnMoneyClickElement = document.getElementById("btnMoneyClick")
const registerEmailInput = document.getElementById("register-email")
const registerPasswordInput = document.getElementById("register-password")
const registerPasswordConfirmInput = document.getElementById("register-password-confirm")
const registerBandNameInput = document.getElementById("register-band-name")
const registerStartCountryInput = document.getElementById("register-start-country")
const registerLeaderNameInput = document.getElementById("register-leader-name")
const loginEmailInput = document.getElementById("login-email")
const loginPasswordInput = document.getElementById("login-password")
const showRegisterButton = document.getElementById("show-register")
const showLoginButton = document.getElementById("show-login")
const registerForm = document.getElementById("register-form")
const loginForm = document.getElementById("login-form")
const leaderCards = document.querySelectorAll(".leader-card")
const tabButtons = document.querySelectorAll(".tab-button")
const tabContents = document.querySelectorAll(".tab-content")
const gameTitles = document.querySelectorAll(".section h3.game-title")
const countryProgressModalCloseButton = document.querySelector("#country-progress-modal .close-modal-btn")
const countryProgressModal = document.getElementById("country-progress-modal")
const menuToggleButton = document.getElementById("menu-toggle-button")
const sidebar = document.getElementById("sidebar")
const newsPopupTitle = document.getElementById("popupNewsTitle")
const newsPopupDescription = document.getElementById("newsPopupDescription")
const newsPopupElement = document.getElementById("newsPopup")
const newsOverlay = document.getElementById("newsOverlay")
const closeNewsButton = document.querySelector(".close-news-btn")
const startCountrySelect = document.getElementById("register-start-country")
const iconMoneyInfo = document.getElementById("iconMoneyInfo")
const iconEsbirrosInfo = document.getElementById("iconEsbirrosInfo")
const iconPoliceInfo = document.getElementById("iconPoliceInfo")
const appContainer = document.getElementById("app-container")
const registerButton = registerForm.querySelector('button[type="submit"]');

const map = L.map(mapElement, { noWrap: true, minZoom: 2, maxZoom: 18 }).setView([40, -3], 5)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{noWrap:true}).addTo(map)

let geojsonLayer = null
let countriesData = null
let esbirroMarker = null
let newsInterval
let conqueredCountriesNotification = null
let activeIcons = []
let iconsEnabled = false
let moneyIconsEnabled = false
let esbirrosIconsEnabled = false
let policeIconsEnabled = false
let lastMoneySpawn = 0
let lastEsbirrosSpawn = 0
let lastPoliceSpawn = 0
const NOT_ENOUGH_MONEY_COOLDOWN = 10000
let BASE_EXPANSION_PROBABILITY = 0.005
const EXPANSION_DIFFICULTY_FACTOR = 0.1
const ARRESTS_COUNTRY_INCREASE = 0.002
const UPGRADE_COST_MULTIPLIER = 1.15
const NOTIFICATION_DURATION = 10000
const CENTER_POPUP_DURATION = 1500
const ANIMATION_DURATION = 500
const SLIDEOUT_ANIMATION_DURATION = 400
const ICON_ANIMATION_DURATION = 300
const MONEY_ICON_SPAWN_INTERVAL = 30000
const ESBIRROS_ICON_SPAWN_INTERVAL = 40000
const POLICE_ICON_SPAWN_INTERVAL = 45000
const POPULATION_CONTROL_GAME_OVER_THRESHOLD = 51
const EXPANSION_ANIMATION_CIRCLE_RADIUS_INCREMENT = 1
const EXPANSION_ANIMATION_CIRCLE_MAX_RADIUS = 100
const EXPANSION_ANIMATION_INTERVAL_MS = 10
const RECONQUIST_EVENT_DURATION = 60000
const BASE_TENSION_EXPANSION = 15
const BASE_TENSION_UPGRADE = 2
const MIN_POLICE_RESISTANCE_EFFECT = 0.1
const DOMINANCE_FACTOR_MULTIPLIER = 2

const defaultGameState = {
  playerMoney: 100,
  totalArrested: 0,
  policeStars: 0,
  baseMoneyClick: 100,
  totalMoneyUpgrades: 0,
  totalMoneyUpgradesSec: 0,
  totalEsbirrosUpgrades: 0,
  bandName: "",
  leaderName: "",
  leaderImage: "",
  startCountry: "",
  gameActive: false,
  countryStatus: {},
  clickMultiplierPercentage: 0,
  esbirrosMultiplierPercentage: 0,
  moneyPerSecond: 0,
  arrestedPerSecond: 0,
  lastArrestIncrement: 0,
  lastNotEnoughMoneyNotification: 0,
  currentUser: null,
  displayedArrested: 0,
  displayedEsbirros: 0,
  expansionProbabilityMultiplier: 1,
  policeResistance: 0,
  esbirrosPerTickMultiplier: 1,
  policeNotification: null,
  currentIso: null,
  gameStartTime: 0,
  moneyUpgrades: moneyUpgrades.map(u => ({ times: 0 })),
  esbirrosUpgrades: esbirrosUpgrades.map(u => ({ times: 0 })),
  policeUpgrades: policeUpgrades.map(u => ({ times: 0 })),
  clickInvestments: clickInvestments.map(u => ({ times: 0 })),
  militaryInvestments: militaryInvestments.map(u => ({ times: 0 })),
  socialInvestments: socialInvestments.map(u => ({ times: 0 })),
  socialArrestReductionPercentage: 0,
  firstSession: false,
  startingCountryExpansionMultiplier: 1,
  lastHeatDecrease: 0,
  lastStarsValue: 0
}
let gameState = { ...defaultGameState }

const moneyIcon = L.icon({ iconUrl: "assets/images/iconodinero.webp", iconSize: [48,48], iconAnchor: [24,48], popupAnchor: [0,-48] })
const esbirrosIcon = L.icon({ iconUrl: "assets/images/iconoesbirro.webp", iconSize: [48,48], iconAnchor: [24,48], popupAnchor: [0,-48] })
const policeIcon = L.icon({ iconUrl: "assets/images/iconopolicia.webp", iconSize: [48,48], iconAnchor: [24,48], popupAnchor: [0,-48] })
const welcomeIcon = L.icon({ iconUrl: "assets/images/iconoinfo.webp", iconSize: [64,64], iconAnchor: [32,64], className: "esbirro-marker" })

function formatNumber(num) {
  if(isNaN(num)) return "NaN"
  const s = ["","K","M","B","T","P","E"]
  const d = 1000
  for(let i = s.length-1; i > 0; i--){
    if(num >= Math.pow(d, i)){
      const f = (num / Math.pow(d, i)).toFixed(2)
      return f + s[i]
    }
  }
  return num.toFixed(2)
}

function removeNotificationElement(nd, cont){
  nd.classList.add("slideOutNotification")
  setTimeout(() => {
    if(cont.contains(nd)){
      cont.removeChild(nd)
    }
  }, SLIDEOUT_ANIMATION_DURATION)
}

function createNotificationCloseButton(div, cont){
  const c = document.createElement("span")
  c.classList.add("close-btn")
  c.innerText = "X"
  c.onclick = () => {
    removeNotificationElement(div, cont)
    SoundManager.playButtonClick() // Play sound on close notification
  }
  return c
}

function createNotificationElement(msg, type, cont, countryName = null){
  const d = document.createElement("div")
  d.classList.add("notification", type)
  let icon = ""
  switch(type){
    case "searchStars": icon = '<i class="fas fa-shield-alt"></i> '; break
    case "gameResult": icon = '<i class="fas fa-trophy"></i> '; break
    case "expansion": icon = '<i class="fas fa-globe"></i> '; break
    case "notEnoughMoney": icon = '<i class="fas fa-exclamation-triangle"></i> '; break
    case "countryConquered": icon = '<i class="fas fa-flag-checkered"></i> '; break
    case "auth": icon = '<i class="fas fa-exclamation-circle"></i> '; break
    case "loading": icon = '<i class="fas fa-spinner fa-spin"></i> '; break;
  }
  const cl = createNotificationCloseButton(d, cont)
  d.appendChild(cl)
  const t = document.createElement("div")
  t.classList.add("notification-text")
  t.innerHTML = icon + msg + (countryName ? ` ${countryName}!` : "")
  d.appendChild(t)
  cont.appendChild(d)
  SoundManager.playNotification() // Play notification sound
  return d
}

function addNotification(msg, type="general", countryName=null){
  const now = Date.now()
  if(type === "notEnoughMoney" && now - gameState.lastNotEnoughMoneyNotification < NOTIFICATION_DURATION) return
  if(type === "notEnoughMoney") gameState.lastNotEnoughMoneyNotification = now

  const c = statsBanner.classList.contains("hidden") ? notificationContainer : notificationContainer

  if(type === "countryConquered"){
    if(conqueredCountriesNotification){
      conqueredCountriesNotification.querySelector(".notification-text").innerHTML += `<br>¡Has dominado ${countryName}!`
      return
    } else {
      const dv = createNotificationElement(msg, type, c, countryName)
      conqueredCountriesNotification = dv
      setTimeout(() => {
        removeNotificationElement(dv, c)
        conqueredCountriesNotification = null
      }, 15000)
      return
    }
  }

  const div = createNotificationElement(msg, type, c, countryName)
  setTimeout(() => removeNotificationElement(div, c), NOTIFICATION_DURATION)
}

function createAnimation(el, val, t){
  if(!el) return
  const r = el.getBoundingClientRect()
  const a = document.createElement("div")
  a.classList.add(`${t}-animation`)
  a.style.left = `${r.left + r.width/2}px`
  a.style.top = `${r.top + r.height/2}px`
  a.textContent = `${t === "arrested" ? "-" : "+"}${formatNumber(val)}`
  document.body.appendChild(a)
  requestAnimationFrame(() => {
    a.style.transform = "translateY(-20px)"
    a.style.opacity = 0
    a.style.fontFamily = "Pricedown"
    a.style.color = (t==="money"||t==="esbirros") ? "green" : "#ff0000"
  })
  el.classList.add(`${t}-flash`)

  setTimeout(() => {
    if(document.body.contains(a)){
      document.body.removeChild(a)
    }
    el.classList.remove(`${t}-flash`)
  }, ANIMATION_DURATION)
}

function easeOutQuad(t, b, c, d) {
  t /= d;
  return -c * t * (t - 2) + b;
}

function animateBonusRewardInNews(finalValue, iconType, duration = 2000, onClaim) {
  let container = document.getElementById("bonusRewardContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "bonusRewardContainer";
    container.classList.add("bonus-reward-container");
    newsPopupDescription.appendChild(container);
  }
  container.innerHTML = "";

  const iconImg = document.createElement("img");
  iconImg.classList.add("bonus-reward-icon");
  if (iconType === "money") {
    iconImg.src = "assets/images/dinero.webp";
  } else if (iconType === "esbirros") {
    iconImg.src = "assets/images/esbirro.webp";
  } else if (iconType === "police") {
    iconImg.src = "assets/images/policia.webp";
  }
  container.appendChild(iconImg);

  const numberDisplay = document.createElement("span");
  numberDisplay.classList.add("bonus-reward-number");
  numberDisplay.textContent = "0";
  container.appendChild(numberDisplay);

  const claimBtn = document.createElement("button");
  claimBtn.classList.add("claim-bonus-button");
  claimBtn.textContent = "Reclamar";
  container.appendChild(claimBtn);

  claimBtn.onclick = () => {
    if (onClaim) {
      onClaim();
    }
    claimBtn.disabled = true;
    claimBtn.textContent = "Reclamado";
    SoundManager.playButtonClick() // Play sound on claim button click
  };


  let startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = timestamp - startTime;
    const currentVal = Math.min(finalValue, easeOutQuad(progress, 0, finalValue, duration));

    if (iconType === "police") {
      numberDisplay.textContent = "-" + Math.floor(currentVal);
    } else {
      numberDisplay.textContent = "+" + formatNumber(Math.floor(currentVal));
    }
    if (progress < duration) {
      requestAnimationFrame(step);
    } else {
      if (iconType === "police") {
        numberDisplay.textContent = "-" + formatNumber(finalValue);
      } else {
        numberDisplay.textContent = "+" + formatNumber(finalValue);
      }
    }
  }
  requestAnimationFrame(step);
}

function updateHeatUI(){}
function recalcPoliceStarsFromValue(stars){
  gameState.policeStars = Math.min(5, Math.max(0, stars))
  updatePoliceNotification()
}
function updatePoliceNotification(){
  if(gameState.policeStars === gameState.lastStarsValue) return
  gameState.lastStarsValue = gameState.policeStars
  const msg = `Nivel de Alerta Policial: ${gameState.policeStars} <i class="fas fa-shield-alt"></i>`
  if(gameState.policeNotification && gameState.policeNotification.element){
    const text = gameState.policeNotification.element.querySelector(".notification-text")
    if(text) text.innerHTML = msg
    clearTimeout(gameState.policeNotification.timeout)
    gameState.policeNotification.timeout = setTimeout(() => {
      if(gameState.policeNotification?.element){
        removeNotificationElement(gameState.policeNotification.element, notificationContainer)
        gameState.policeNotification = null
      }
    }, NOTIFICATION_DURATION)
  } else {
    const div = createNotificationElement(msg, "searchStars", notificationContainer)
    gameState.policeNotification = { element: div }
    gameState.policeNotification.timeout = setTimeout(() => {
      if(gameState.policeNotification?.element){
        removeNotificationElement(gameState.policeNotification.element, notificationContainer)
        gameState.policeNotification = null
      }
    }, NOTIFICATION_DURATION)
  }
}

let handleAuthStateChangedTimeout;
function handleAuthStateChanged(u) {
  if (handleAuthStateChangedTimeout) {
    clearTimeout(handleAuthStateChangedTimeout);
  }
  handleAuthStateChangedTimeout = setTimeout(() => {
    gameState.currentUser = u;
    if (u) {
      document.body.classList.remove("auth-active");
      authContainer.classList.add("hidden");
      statsBanner.classList.remove("hidden");
      sidebar.classList.remove("active");
      sidebar.style.transition = "none";
      setTimeout(() => {
        sidebar.style.transition = "";
      }, 50);
      loadGame(u.uid);
    } else {
      document.body.classList.add("auth-active");
      authContainer.classList.remove("hidden");
      statsBanner.classList.add("hidden");
      sidebar.classList.remove("active");
    }
  }, 200);
}

initializeAuth(handleAuthStateChanged)
window.addEventListener("beforeunload", () => {
  if(gameState.currentUser){
    saveGame()
    logout().catch(() => {})
  }
})

registerForm.addEventListener("submit", async e => {
  e.preventDefault();
  registerButton.disabled = true;
  addNotification("Registrando y comenzando partida...", "loading");

  const email = registerEmailInput.value;
  const pass = registerPasswordInput.value;
  const conf = registerPasswordConfirmInput.value;
  const bName = registerBandNameInput.value;
  const sCountry = registerStartCountryInput.value;
  const lName = registerLeaderNameInput.value;
  const lImg = document.querySelector(".leader-card.selected .leader-card-image")?.getAttribute("src");

  if (pass !== conf) {
    addNotification("Las contraseñas no coinciden.", "auth");
    registerButton.disabled = false;
    return;
  }
  if (!lImg) {
    addNotification("Selecciona un líder.", "auth");
    registerButton.disabled = false;
    return;
  }
  if (!sCountry) {
    addNotification("Selecciona un país de inicio.", "auth");
    registerButton.disabled = false;
    return;
  }

  gameState.bandName = bName;
  gameState.startCountry = countriesData.features.find(f => f.id === sCountry)?.properties?.name || sCountry;
  gameState.leaderName = lName;
  gameState.leaderImage = lImg;

  try {
    const u = await register(email, pass);
    const initGame = { ...defaultGameState };
    Object.assign(initGame, {
      bandName: bName,
      startCountry: gameState.startCountry,
      leaderName: lName,
      leaderImage: lImg,
      currentIso: sCountry,
      gameActive: true,
      firstSession: true,
      countryStatus: {
        [sCountry]: {
          countryName: gameState.startCountry,
          popReal: getPopulationFromFeature(sCountry),
          control: 100,
          dominated: true,
          arrestedTotal: 0,
          esbirros: 1
        }
      }
    });
    await set(ref(database, `users/${u.uid}/gameState`), initGame);
    await loadGame(u.uid);
    SoundManager.startBackgroundMusic(); // Start background music after registration and game load
    addNotification(`Registro exitoso para: ${email}`, "general");
    authContainer.classList.add("hidden");
    sidebar.classList.remove("active");
    sidebar.style.transition = "none";
    document.body.classList.remove("auth-active");
    statsBanner.classList.remove("hidden");
    setTimeout(() => {
      sidebar.style.transition = "";
    }, 50);
    displayInitialMinion(sCountry);
  } catch (e){
    addNotification(`Error de registro: ${e.message}`, "auth");
    console.error("Error de registro:", e);
    registerButton.disabled = false;
  } finally {
    registerButton.disabled = false;
  }
});

loginForm.addEventListener("submit", e => {
  e.preventDefault();
  const email = loginEmailInput.value;
  const pass = loginPasswordInput.value;
  login(email, pass)
  .then(u => {
    sidebar.classList.remove("active");
    sidebar.style.transition = "none";
    document.body.classList.remove("auth-active");
    authContainer.classList.add("hidden");
    statsBanner.classList.remove("hidden");
    loadGame(u.uid).then(() => {
      SoundManager.startBackgroundMusic(); // Start background music after login and game load
      setTimeout(() => {
        sidebar.style.transition = "";
      }, 50);
    });
    addNotification(`Inicio de sesión exitoso para: ${email}`, "general");
  })
  .catch(e => {
    addNotification(`Error de inicio de sesión: ${e.message}`, "auth");
  });
});

document.querySelectorAll("form").forEach(f => {
  f.addEventListener("keydown", e => {
    if(e.key === "Enter") {
      e.preventDefault()
    }
  })
})

showRegisterButton.addEventListener("click", () => {
  loginFormContainer.classList.add("hidden")
  registerFormContainer.classList.remove("hidden")
  SoundManager.playButtonClick() // Play sound on show register
})
showLoginButton.addEventListener("click", () => {
  loginFormContainer.classList.remove("hidden")
  registerFormContainer.classList.add("hidden")
  SoundManager.playButtonClick() // Play sound on show login
})

function renderStats(){
  let netEsb = 0
  if(gameState.totalEsbirrosUpgrades>0 || gameState.lastArrestIncrement>0){
    netEsb = (gameState.totalEsbirrosUpgrades * gameState.esbirrosPerTickMultiplier * (1 + gameState.esbirrosMultiplierPercentage)) - gameState.arrestedPerSecond
    netEsb = Math.max(0, netEsb)
  }
  moneyPerSecondElement.innerText = `${formatNumber(gameState.moneyPerSecond)}`
  esbirrosPerSecondElement.innerText = `${formatNumber(netEsb)} `
  arrestedPerSecondElement.innerText = `${formatNumber(gameState.arrestedPerSecond)}`

  playerStarsElements.forEach((s,i) => {
    s.style.opacity = i < gameState.policeStars ? 1 : 0
  })

  const totEsb = Object.values(gameState.countryStatus).reduce((a,c) => a + (c.esbirros || 0), 0)

  bannerMoneyElement.innerText = `$${formatNumber(gameState.playerMoney)}`
  bannerArrestedElement.innerText = formatNumber(Math.floor(gameState.totalArrested))
  bannerEsbirrosElement.innerText = formatNumber(Math.floor(totEsb))

  bandInfoBandElement.textContent = gameState.bandName
  bandInfoLeaderElement.textContent = gameState.leaderName
  bandInfoCountryElement.textContent = gameState.startCountry
  leaderImgElement.src = gameState.leaderImage || "images/placeholder.webp"

  statsBanner.classList.toggle("active", !statsBanner.classList.contains("hidden"))
  statsBanner.classList.add("subtle-banner")
  updateHeatUI()
}

function updatePerSecondStats(){
  gameState.totalMoneyUpgradesSec = moneyUpgrades.reduce((acc,u) => acc + (u.effectMoneySec || 0)*u.times, 0)
  gameState.moneyPerSecond = Math.max(0, gameState.totalMoneyUpgradesSec)
  gameState.arrestedPerSecond = (gameState.lastArrestIncrement / 5) * (1 - gameState.socialArrestReductionPercentage);
  gameState.esbirrosPerSecond = (gameState.totalEsbirrosUpgrades * gameState.esbirrosPerTickMultiplier * (1 + gameState.esbirrosMultiplierPercentage))
}

function displayInitialMinion(iso){
  if(!iso || !geojsonLayer){
    startNewsGeneration();
    return;
  }
  let tLayer;
  geojsonLayer.eachLayer(l => {
    if(l.feature?.id === iso) tLayer = l;
  });
  if(!tLayer){
    startNewsGeneration();
    return;
  }
  const b = tLayer.getBounds();
  map.fitBounds(b);
  const c = b.getCenter();
  esbirroMarker = L.marker(c, { icon: welcomeIcon }).addTo(map);
  esbirroMarker._icon.classList.add("marker-appear-animation");
  
  esbirroMarker.on("click", () => {
    if(esbirroMarker && esbirroMarker._icon){
      esbirroMarker._icon.classList.add("marker-disappear-animation");
      setTimeout(() => {
        if(map.hasLayer(esbirroMarker)){
          map.removeLayer(esbirroMarker);
          const w = generateWelcomeMessage(gameState);
          showNewsPopup(w.message, w.title, "welcome");
          gameState.firstSession = false;
          gameState.gameStartTime = Date.now();
          iconsEnabled = true;
          moneyIconsEnabled = true;
          esbirrosIconsEnabled = true;
          policeIconsEnabled = true;
          iconMoneyInfo.classList.remove("hidden");
          iconEsbirrosInfo.classList.remove("hidden");
          iconPoliceInfo.classList.remove("hidden");
          saveGame();
          startNewsGeneration();
          SoundManager.playPopup();
        }
      }, ICON_ANIMATION_DURATION);
    }
  });
}

function costOf(u){
  return Math.floor(u.baseCost * Math.pow(UPGRADE_COST_MULTIPLIER, u.times))
}

function getPurchasesRemainingForUnlock(up, arr){
  if(up.rank <= 1) return 0
  const prev = arr.filter(x => x.rank===up.rank - 1)
  if(prev.length === 0) return 10
  const sum = prev.reduce((a,g) => a + g.times,0)
  return Math.max(0, prev.length*10 - sum)
}

function isUnlocked(up, arr){
  if(up.rank === 1) return true
  return getPurchasesRemainingForUnlock(up, arr) <= 0
}

function createUpgradeElement(u, c, canBuy, bFunc, type, locked, pRem){
  const d = document.createElement("div")
  d.classList.add("upgrade-item")
  if(locked){
    d.classList.add("upgrade-locked")
  } else if(!canBuy){
    d.classList.add("upgrade-unavailable")
  }
  const lockedOverlay = locked ? `<div class="locked-overlay"><i class="fas fa-lock lock-icon"></i><div class="purchases-remaining">Compras de la mejora anterior restantes: <span class="remaining-count">${pRem}</span></div></div>` : ""

  let effTxt = ""
  if(type === "money"){
    effTxt = `<div class="effect"><span class="value green-value">+${formatNumber(u.effectMoneySec)}</span> <span class="unit">$/seg</span></div>`
  } else if(type === "esbirros"){
    effTxt = `<div class="effect">+<span class="value green-value">${formatNumber(u.effectEsb)}</span> esb/seg</div>`
  } else if(type === "police"){
    if(u.effectStarsReduction){
      effTxt += `<div class="effect">Reduce Estrellas: <span class="value">-${u.effectStarsReduction}</span></div>`
    }
    if(u.effectPoliceResistance){
      effTxt += `<div class="effect">Reduce prob. policía: <span class="value">${Math.floor(u.effectPoliceResistance*100)}%</span></div>`
    }
  } else if (type === "clickInvestments") {
    effTxt += `<div class="effect sub-effect">+<span class="value green-value">${(u.effect*100).toFixed(1)}</span>% ingresos/click</div>`
  } else if(type === "militaryInvestments"){
    effTxt += `<div class="effect sub-effect">+<span class="value green-value">${(u.effect*100).toFixed(1)}</span>% efectividad esbirros</div>`
  } else if(type === "socialInvestments"){
    effTxt += `<div class="effect sub-effect">Reduce arrestos: <span class="value">${(u.effect*100).toFixed(1)}</span>%</div>`
  }

  const imgClass = `upgrade-image ${locked ? "upgrade-image-locked" : ""}`
  const iH = u.image ? `<img src="${u.image}" alt="${u.name}" class="${imgClass}">` : ""

  const upgradeDetailsDiv = document.createElement('div');
  upgradeDetailsDiv.classList.add('upgrade-details');
  upgradeDetailsDiv.innerHTML = `<p class="upgrade-description">${u.desc}</p>${effTxt}`;

  d.innerHTML = `${lockedOverlay}
    <h5 class="upgrade-title"><span class="name">${u.name}</span></h5>
    <div class="upgrade-row">
      <div class="upgrade-image-container">
        ${iH}
        ${(!locked && u.times>0) ? `<span class="upgrade-times-overlay">x${u.times}</span>` : ""}
      </div>
      <div class="upgrade-info-container">
      </div>
      <div class="upgrade-buy-container">
        <button class="upgrade-buy-button ${!canBuy ? "upgrade-buy-unavailable" : ""} ${locked ? "upgrade-buy-locked" : ""}">
          ${locked ? "BLOQUEADO" : `BUY ${formatNumber(c)}$`}
        </button>
      </div>
    </div>`

  d.querySelector('.upgrade-info-container').appendChild(upgradeDetailsDiv);

  const bB = d.querySelector(".upgrade-buy-button")
  const purchaseHandler = e => {
    e.stopPropagation()
    if(locked) return
    if(canBuy){
      bFunc(u)
    } else {
      addNotification("No tienes suficiente dinero.","notEnoughMoney")
      SoundManager.playInsufficientFunds() // Play sound on insufficient funds
    }
  }
  bB.addEventListener("pointerdown", e => {
    e.stopPropagation()
    bB.classList.add("active")
  })
  bB.addEventListener("pointerup", e => {
    e.stopPropagation()
    bB.classList.remove("active")
    purchaseHandler(e)
    SoundManager.playButtonClick() // Play sound on upgrade button click
  })

  d.addEventListener("pointerdown", e => {
    e.stopPropagation()
    bB.classList.add("active")
  })
  d.addEventListener("pointerup", e => {
    e.stopPropagation()
    bB.classList.remove("active")
    purchaseHandler(e)
    SoundManager.playButtonClick() // Play sound on upgrade item click
  })

  return d
}

function renderUpgradesList(cont, arr, bFunc, type){
  if(!cont) return
  cont.innerHTML = ""
  arr.sort((a,b) => a.rank - b.rank)
  let lockedOnce = false
  for(const up of arr){
    if(type==="militaryInvestments" && up.rank>5 && !Object.values(gameState.countryStatus).some(x => x.control>=50)){
      continue
    }
    const c = costOf(up)
    const canBuy = gameState.playerMoney>=c
    const locked = !isUnlocked(up, arr) && up.rank>1
    const pRem = getPurchasesRemainingForUnlock(up, arr)
    if(locked && lockedOnce) continue
    if(locked) lockedOnce = true
    const el = createUpgradeElement(up, c, canBuy, bFunc, type, locked, pRem)
    cont.appendChild(el)
  }
}

function renderInvestments(){
  renderUpgradesList(clickInvestmentsContainer, clickInvestments, buyWeaponUpgrade, "clickInvestments")
  renderUpgradesList(socialInvestmentsContainer, socialInvestments, buyWeaponUpgrade, "socialInvestments")
  renderUpgradesList(militaryInvestmentsContainer, militaryInvestments, buyWeaponUpgrade, "militaryInvestments")
}

function renderUpgrades(){
  renderUpgradesList(moneyUpgradesContainer, moneyUpgrades, buyMoneyUpgrade, "money")
  renderUpgradesList(esbirrosUpgradesContainer, esbirrosUpgrades, buyEsbirrosUpgrade, "esbirros")
  renderUpgradesList(policeUpgradesContainer, policeUpgrades, buyPoliceUpgrade, "police")
}

async function buyMoneyUpgrade(u){
  const c = costOf(u)
  if(gameState.playerMoney < c) return addNotification("No tienes suficiente dinero.","notEnoughMoney")
  gameState.playerMoney -= c
  u.times++
  gameState.totalMoneyUpgradesSec += (u.effectMoneySec || 0)
  updatePerSecondStats()
  renderStats()
  renderUpgrades()
  await saveGame()
  SoundManager.playUpgradePurchase() // Play sound on upgrade purchase
}

async function buyEsbirrosUpgrade(u){
  const c = costOf(u)
  if(gameState.playerMoney < c) return addNotification("No tienes suficiente dinero.","notEnoughMoney")
  gameState.playerMoney -= c
  u.times++
  gameState.totalEsbirrosUpgrades += (u.effectEsb || 0)
  createAnimation(document.getElementById("bannerEsbirros"), u.effectEsb, "esbirros")
  updatePerSecondStats()
  renderStats()
  renderUpgrades()
  await saveGame()
  SoundManager.playUpgradePurchase() // Play sound on upgrade purchase
}

async function buyPoliceUpgrade(u){
  const c = costOf(u)
  if(gameState.playerMoney < c) return addNotification("No tienes suficiente dinero.","notEnoughMoney")
  gameState.playerMoney -= c
  u.times++
  if(u.effectStarsReduction){
    recalcPoliceStarsFromValue(gameState.policeStars - u.effectStarsReduction)
  }
  if(u.effectPoliceResistance){
    gameState.policeResistance += u.effectPoliceResistance
  }
  renderStats()
  renderUpgrades()
  await saveGame()
  SoundManager.playUpgradePurchase() // Play sound on upgrade purchase
}

async function buyWeaponUpgrade(u){
  const c = costOf(u)
  if(gameState.playerMoney < c) return addNotification("No tienes suficiente dinero.","notEnoughMoney")
  gameState.playerMoney -= c
  u.times++
  if(u.id.startsWith("economic-boost")){
    gameState.clickMultiplierPercentage += u.effect
  } else if(u.id.startsWith("military-boost")){
    gameState.esbirrosMultiplierPercentage += u.effect
  } else if(u.id.startsWith("social-boost")){
    gameState.socialArrestReductionPercentage += u.effect;
  }
  updatePerSecondStats()
  renderStats()
  renderInvestments()
  renderUpgrades()
  await saveGame()
  SoundManager.playUpgradePurchase() // Play sound on upgrade purchase
}

function triggerPoliceActions(){
  if (!gameState.gameActive || !countriesData || Date.now() - gameState.lastPoliceEventCheck < 5000) return;
  gameState.lastPoliceEventCheck = Date.now();

  // Calcular probabilidad base de obtener estrellas basada en dominación
  const dominatedCountries = Object.keys(gameState.countryStatus).filter(i => gameState.countryStatus[i].dominated);
  const totalCountries = Object.keys(gameState.countryStatus).length || 1;
  const dominationRatio = dominatedCountries.length / totalCountries;

  // Reducir la probabilidad base significativamente
  const baseStarProbability = 0.02 + (dominationRatio * 0.05);

  // Aplicar resistencia policial (nunca llega a 0)
  const effectiveStarProbability = Math.max(0.01, baseStarProbability * (1 - gameState.policeResistance));

  // Añadir un retraso mínimo entre aumentos de estrellas
  const timeSinceLastIncrease = Date.now() - (gameState.lastStarIncrease || 0);
  const minTimeBetweenIncreases = 60000; // 1 minuto mínimo entre aumentos

  if(timeSinceLastIncrease >= minTimeBetweenIncreases && Math.random() < effectiveStarProbability) {
    const currentStars = gameState.policeStars;
    
    // Limitar el máximo de estrellas según la dominación
    let maxPossibleStars;
    if (dominationRatio < 0.2) maxPossibleStars = 2;
    else if (dominationRatio < 0.4) maxPossibleStars = 3;
    else if (dominationRatio < 0.6) maxPossibleStars = 4;
    else maxPossibleStars = 5;

    // Solo incrementar si no hemos alcanzado el máximo para el nivel actual de dominación
    if (currentStars < maxPossibleStars) {
      const maxIncrease = Math.min(maxPossibleStars - currentStars, 1); // Solo incrementar de 1 en 1
      if(maxIncrease > 0) {
        recalcPoliceStarsFromValue(currentStars + 1);
        gameState.lastStarIncrease = Date.now();
      }
    }
  }
}

function increaseStarsWithResistance(base, rank = 1) {
  const resistanceEffect = Math.max(MIN_POLICE_RESISTANCE_EFFECT, (1 - gameState.policeResistance));
  const effective = base * resistanceEffect;
  const controlledCount = Object.values(gameState.countryStatus).filter(st => st.control >= 50).length;
  const totalCount = Object.keys(gameState.countryStatus).length || 1;
  const dominanceFactor = controlledCount / totalCount;
  const adjustedEffective = effective * (1 + dominanceFactor * DOMINANCE_FACTOR_MULTIPLIER);

  // Reducir la cantidad de estrellas que se añaden
  let starIncrease = 1;
  if (adjustedEffective >= 15) starIncrease = 2;
  else if (adjustedEffective >= 10) starIncrease = 1;
  
  // Limitar el aumento según el rango
  if (rank >= 4) starIncrease = Math.min(starIncrease + 1, 2);
  if (rank >= 5) starIncrease = Math.min(starIncrease + 1, 3);

  // Limitar en el primer país
  if(totalCount === 1) {
    starIncrease = Math.min(starIncrease, 1);
  }

  // Añadir un retraso mínimo entre aumentos
  const timeSinceLastIncrease = Date.now() - (gameState.lastStarIncrease || 0);
  if (timeSinceLastIncrease < 30000) { // 30 segundos mínimo entre aumentos
    starIncrease = Math.min(starIncrease, 1);
  }

  const newStars = gameState.policeStars + starIncrease;
  recalcPoliceStarsFromValue(newStars);
  gameState.lastStarIncrease = Date.now();
  SoundManager.playPolice();
}

let clickTimes = []
btnMoneyClickElement.addEventListener("click", async e => {
  if(!gameState.gameActive) return
  const earn = (gameState.baseMoneyClick + gameState.totalMoneyUpgrades) * (1 + gameState.clickMultiplierPercentage)
  gameState.playerMoney += earn
  createAnimation(bannerMoneyElement, earn, "money")
  renderStats()
  renderUpgrades()
  e.target.classList.add("clicked")
  setTimeout(() => e.target.classList.remove("clicked"), 200)
  await saveGame()
  SoundManager.playMoneyEarned() // Play sound on money click

  const currentTime = Date.now()
  clickTimes.push(currentTime)
  clickTimes = clickTimes.filter(time => currentTime - time < 1000)
  let clickSpeed = clickTimes.length
  generateMoneyParticles(clickSpeed, btnMoneyClickElement)
  if (SoundManager.audioCtx.state === 'suspended') {
    SoundManager.audioCtx.resume(); // Resume audio context on first click
    SoundManager.startBackgroundMusic(); // Ensure music starts if it was suspended
  }
})

function onCountryClick(e){
  const countryId = e.target.feature.id;
  document.querySelector('.tab-button[data-tab="world"]').click();
  if(gameState.countryStatus[countryId] && gameState.countryStatus[countryId].esbirros > 0){
    showCountryDetail(countryId)
  } else {
    document.getElementById("detailCountryName").innerText = "Este país aún no tiene presencia tu banda";
    document.getElementById("detailPopulation").innerText = "";
    document.getElementById("detailEsbirros").innerText = "";
    document.getElementById("detailArrested").innerText = "";
  }
  geojsonLayer.eachLayer(layer => {
    if(layer.feature?.id === countryId){
      map.fitBounds(layer.getBounds())
    }
  });
  if(window.innerWidth <= 768 && !sidebar.classList.contains("active")){
    sidebar.classList.add("active")
    setMenuIcon()
  }
  SoundManager.playButtonClick() // Play sound on country click
}

function refreshGeoStyle(){
  if(!geojsonLayer) return
  geojsonLayer.setStyle(f => {
    const i = f.id
    const st = gameState.countryStatus[i]
    if(!st) return { color: "#555", weight: 1, fillColor: "#f0f0f0", fillOpacity: 0.2 }
    if(st.dominated) return { color:"#555", weight:1, fillColor:"#008000", fillOpacity:0.7 }
    if((st.arrestedTotal||0) >= (st.popReal||1)) return { color:"#555", weight: 1, fillColor: "#000000", fillOpacity:0.8 }
    if((st.arrestedTotal||0) > st.esbirros) return { color:"#555", weight:1, fillColor:"#0000FF", fillOpacity:0.4 }
    if(st.control >= 50 && st.control<100) return { color:"#555", weight:1, fillColor:"#800080", fillOpacity:0.5 }
    return { color:"#555", weight:1, fillColor:"#FF0000", fillOpacity:(st.control/100)*0.6 + 0.1 }
  })
}

function getPopulationFromFeature(iso){
  return countriesData?.features.find(f => f.id===iso)?.properties?.population || 0
}

async function saveGame(){
  if(!gameState.currentUser) return
  const toSave = { ...gameState }
  toSave.moneyUpgrades = moneyUpgrades.map(u => ({ times: u.times }))
  toSave.esbirrosUpgrades = esbirrosUpgrades.map(u => ({ times: u.times }))
  toSave.policeUpgrades = policeUpgrades.map(u => ({ times: u.times }))
  toSave.clickInvestments = clickInvestments.map(u => ({ times: u.times }))
  toSave.militaryInvestments = militaryInvestments.map(u => ({ times: u.times }))
  toSave.socialInvestments = socialInvestments.map(u => ({ times: u.times }))

  delete toSave.currentUser
  delete toSave.policeNotification
  delete toSave.activeIcons

  try {
    for(const k in toSave.countryStatus){
      const st = toSave.countryStatus[k]
      if(!isFinite(st.esbirros) || isNaN(st.esbirros)){
        st.esbirros = 0
      }
    }
    await set(ref(database, `users/${gameState.currentUser.uid}/gameState`), toSave)
  } catch(e){
    console.error("Error saving game:", e);
  }
}

async function loadGame(uid){
  if(!uid) {
    return;
  }
  try {
    const s = await get(ref(database, `users/${uid}/gameState`));

    if(!s.exists()) {
      return;
    }

    const saved = s.val();

    gameState = { ...defaultGameState, ...saved, currentUser: gameState.currentUser };
    gameState.policeNotification = null;

    moneyUpgrades.forEach((u,i) => u.times = saved.moneyUpgrades?.[i]?.times || 0);
    esbirrosUpgrades.forEach((u,i) => u.times = saved.esbirrosUpgrades?.[i]?.times || 0);
    policeUpgrades.forEach((u,i) => u.times = saved.policeUpgrades?.[i]?.times || 0);
    clickInvestments.forEach((u,i) => u.times = saved.clickInvestments?.[i]?.times || 0);
    militaryInvestments.forEach((u,i) => u.times = saved.militaryInvestments?.[i]?.times || 0);
    socialInvestments.forEach((u,i) => u.times = saved.socialInvestments?.[i]?.times || 0);

    gameState.totalMoneyUpgrades = moneyUpgrades.reduce((acc,u) => acc + (u.effectMoney||0)*u.times,0);
    gameState.totalMoneyUpgradesSec = moneyUpgrades.reduce((acc,u) => acc + (u.effectMoneySec||0)*u.times,0);
    gameState.totalEsbirrosUpgrades = esbirrosUpgrades.reduce((acc,u) => acc + (u.effectEsb||0)*u.times,0);

    recalcPoliceStarsFromValue(gameState.policeStars);
    updatePerSecondStats();
    renderStats();
    renderUpgrades();
    renderInvestments();
    refreshGeoStyle();
    startGame();
    notificationContainer.innerHTML = '';
    SoundManager.startBackgroundMusic(); // Start background music after loading game

    if(gameState.firstSession && gameState.startCountry){
      displayInitialMinion(gameState.startCountry);
    } else {
      iconsEnabled = true;
      moneyIconsEnabled = true;
      esbirrosIconsEnabled = true;
      policeIconsEnabled = true;
      iconMoneyInfo.classList.remove("hidden");
      iconEsbirrosInfo.classList.remove("hidden");
      iconPoliceInfo.classList.remove("hidden");
    }
    authContainer.classList.add("hidden");
    statsBanner.classList.remove("hidden");

  } catch (error) {
    console.error("Error loading game:", error);
    addNotification("Error al cargar partida.","auth");
  }
}

function getNeighbors(i){
  const f = countriesData.features.find(o => o.id===i)
  if(!f) return []
  const arr = []
  countriesData.features.forEach(ff => {
    if(ff.id === i) return
    const b1 = L.geoJSON(f).getBounds()
    const b2 = L.geoJSON(ff).getBounds()
    if(b1.intersects(b2)) arr.push(ff.id)
  })
  return arr
}

function expandFromCountry(i){
  const st = gameState.countryStatus[i]
  if(!st || st.control < 20) return
  let prob = BASE_EXPANSION_PROBABILITY * (1 + (st.esbirros / st.popReal)) * gameState.expansionProbabilityMultiplier

  if(st.control >= 20){
    prob *= 1
  }
  if(st.control >= 50){
    prob *= 3
  }
  if(st.control >= 90){
    prob *= 5
  }
  if(st.control === 100) prob = 0.05

  prob = gameState.startingCountryExpansionMultiplier
  const dominatedCount = Object.keys(gameState.countryStatus).filter(k => gameState.countryStatus[k].dominated || gameState.countryStatus[k].control>=50).length
  const penaltyFactor = 1 + (Math.max(0, dominatedCount-2) * EXPANSION_DIFFICULTY_FACTOR)
  prob /= penaltyFactor
  if(prob < 0.0005) prob = 0.0005
  if(prob > 0.1) prob = 0.1

  if(Math.random() < prob){
    const exp = Math.random() < 0.7 ? 1 : 2
    let possible = getNeighbors(i).filter(x => !gameState.countryStatus[x])
    possible.sort(() => Math.random() - 0.5)

    const n = Math.min(exp, possible.length)
    for(let k=0; k<n; k++){
      const newIso = possible[k]
      const nf = countriesData.features.find(ff => ff.id===newIso)
      if(nf){
        gameState.countryStatus[newIso] = {
          countryName: nf.properties.name || newIso,
          popReal: nf.properties.population || 0,
          control: 0,
          dominated: false,
          arrestedTotal: 0,
          esbirros: 1
        }
        addNotification(`¡Te has expandido a ${nf.properties.name || newIso}!`,"expansion")
        animateExpansion(newIso)
        renderWorldList()
        SoundManager.playExpansion() // Play sound on expansion
      }
    }
  }
}

function animateExpansion(i){
  if(!geojsonLayer) return
  geojsonLayer.eachLayer(l => {
    if(l.feature?.id !== i) return
    const orig = { color:"#555", weight:1, fillColor:"#FF0000", fillOpacity:0.2 }
    const anim = { color:"#555", weight:2, fillColor:"#800080", fillOpacity:0.7 }
    l.setStyle(anim)
    const b = l.getBounds()
    const c = b.getCenter()
    const circle = L.circleMarker(c, { radius:10, color:"white", weight:3, fillOpacity:0 }).addTo(map)
    let r = 10
    const interval = setInterval(() => {
      r += EXPANSION_ANIMATION_CIRCLE_RADIUS_INCREMENT
      circle.setRadius(r)
      circle.setStyle({ opacity: Math.max(0, 1 - r/EXPANSION_ANIMATION_CIRCLE_MAX_RADIUS) })
      if(r >= EXPANSION_ANIMATION_CIRCLE_MAX_RADIUS){
        clearInterval(interval)
        map.removeLayer(circle)
      }
    }, EXPANSION_ANIMATION_INTERVAL_MS)
    setTimeout(() => {
      l.setStyle(orig)
      refreshGeoStyle()
    }, ANIMATION_DURATION)
  })
}

function renderWorldList(){
  countryListElement.innerHTML = ""
  const arr = Object.keys(gameState.countryStatus)
  arr.forEach(iso => {
    const st = gameState.countryStatus[iso]
    const li = document.createElement("li")
    const icon = st.dominated ? '<i class="fas fa-check-circle country-conquered"></i>' : (st.control>=50 ? '<i class="fas fa-flag country-expanding"></i>' : "")
    li.innerHTML = `${st.countryName || iso} ${icon}`
    li.addEventListener("click", () => {
      document.querySelector('.tab-button[data-tab="world"]').click();
      if(gameState.countryStatus[iso] && gameState.countryStatus[iso].esbirros > 0){
        showCountryDetail(iso)
      } else {
        document.getElementById("detailCountryName").innerText = "Este país aún no tiene presencia tu banda"
        document.getElementById("detailPopulation").innerText = ""
        document.getElementById("detailEsbirros").innerText = ""
        document.getElementById("detailArrested").innerText = ""
      }
      geojsonLayer.eachLayer(ly => {
        if(ly.feature?.id === iso){
          map.fitBounds(ly.getBounds())
        }
      })
      SoundManager.playButtonClick() // Play sound on world list item click
    })
    countryListElement.appendChild(li)
  })
  if(gameState.currentIso) showCountryDetail(gameState.currentIso)
}

function showCountryDetail(i){
  gameState.currentIso = i
  const st = gameState.countryStatus[i]
  if(!st) return
  detailCountryNameElement.innerText = st.countryName || i
  detailPopulationElement.innerText = formatNumber(st.popReal || 0)
  detailEsbirrosElement.innerText = formatNumber(st.esbirros || 0)
  detailArrestedElement.innerText = formatNumber(st.arrestedTotal || 0)
  refreshGeoStyle()
  renderStats()
}

function startGame(){
  renderStats()
  renderUpgrades()
  renderInvestments()
  renderWorldList()
  refreshGeoStyle()
  updatePerSecondStats()
  notificationContainer.innerHTML = ''
  if(!gameState.gameActive){
    gameState.gameActive = true
    startNewsGeneration()
    SoundManager.startBackgroundMusic() // Start background music on game start
  } else if(!gameState.firstSession){
    startNewsGeneration()
    SoundManager.startBackgroundMusic() // Start background music on game load. Actually, it's already started in loadGame function. Let's keep it just in case.
  }
}

function spawnIcon(iconType, icon, iso) {
  if(!iconsEnabled) return;
  if(iconType==="money" && !moneyIconsEnabled) return;
  if(iconType==="esbirros" && !esbirrosIconsEnabled) return;
  if(iconType==="police" && !policeIconsEnabled) return;
  if(!iso || !geojsonLayer) return;

  let tLayer;
  geojsonLayer.eachLayer(l => {
    if(l.feature?.id === iso) tLayer = l;
  });
  if(!tLayer) return;

  const bounds = tLayer.getBounds();
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const lngSpan = ne.lng - sw.lng;
  const latSpan = ne.lat - sw.lat;
  let tries = 50;

  while(tries > 0) {
    const rLng = sw.lng + lngSpan * Math.random();
    const rLat = sw.lat + latSpan * Math.random();
    const point = L.latLng([rLat, rLng]);
    
    // Crear un punto GeoJSON para verificar
    const pt = turf.point([point.lng, point.lat]);
    const isInside = turf.booleanPointInPolygon(pt, tLayer.feature);

    if(isInside) {
      const marker = L.marker(point, { icon });
      
      // Verificar que el pointer (base del icono) también está dentro
      const pointerPoint = map.latLngToContainerPoint(point);
      const pointerLatLng = map.containerPointToLatLng(
        pointerPoint.add([0, icon.options.iconAnchor[1]])
      );
      const pointerPt = turf.point([pointerLatLng.lng, pointerLatLng.lat]);
      
      if(turf.booleanPointInPolygon(pointerPt, tLayer.feature)) {
        marker.on("click", () => {
          if(iconType === "money") {
            const moneyGain = gameState.moneyPerSecond * 10;
            generateMoneyNews(
              { bandName: gameState.bandName, leaderName: gameState.leaderName },
              gameState.countryStatus[iso]?.countryName || iso
            ).then((newsContent) => {
              showNewsPopup(newsContent, "¡Hallazgo inesperado!", "money");
              animateBonusRewardInNews(moneyGain, "money", 2000, () => {
                gameState.playerMoney += moneyGain;
                renderStats();
                saveGame();
                createAnimation(bannerMoneyElement, moneyGain, "money");
                SoundManager.playMoneyEarned();
              });
            });
          } else if(iconType === "esbirros") {
            const st = gameState.countryStatus[iso];
            if(st) {
              const maxEsbirros = st.popReal - st.arrestedTotal;
              if(maxEsbirros <= 0 || st.control === 100) {
                map.removeLayer(marker);
                activeIcons = activeIcons.filter(m => m !== marker);
                return;
              }

              let currentEsbirros = st.esbirros || 0;
              if(currentEsbirros >= maxEsbirros) {
                map.removeLayer(marker);
                activeIcons = activeIcons.filter(m => m !== marker);
                return;
              }

              let esbirrosGain = Math.floor(gameState.esbirrosPerSecond * 100);
              const canAdd = Math.max(0, maxEsbirros - currentEsbirros);
              if(esbirrosGain > canAdd) esbirrosGain = canAdd;
              
              if(esbirrosGain > 0) {
                generateEsbirrosNews(
                  { bandName: gameState.bandName, leaderName: gameState.leaderName },
                  st.countryName || iso
                ).then((newsContent) => {
                  showNewsPopup(newsContent, "¡Reclutamiento sorpresa!", "esbirros");
                  animateBonusRewardInNews(esbirrosGain, "esbirros", 2000, () => {
                    st.esbirros = (st.esbirros || 0) + esbirrosGain;
                    renderStats();
                    renderWorldList();
                    saveGame();
                    createAnimation(bannerEsbirrosElement, esbirrosGain, "esbirros");
                  });
                });
              }
            }
          } else if(iconType === "police") {
            if(gameState.policeStars > 0) {
              generatePoliceNews(
                { bandName: gameState.bandName, leaderName: gameState.leaderName },
                gameState.countryStatus[iso]?.countryName || iso
              ).then((newsContent) => {
                showNewsPopup(newsContent, "¡Relajación Policial!", "police");
                animateBonusRewardInNews(1, "police", 2000, () => {
                  recalcPoliceStarsFromValue(gameState.policeStars - 1);
                  renderStats();
                  saveGame();
                  createAnimation(bannerMoneyElement, -1, "police");
                  SoundManager.playPolice();
                });
              });
            }
          }
          map.removeLayer(marker);
          activeIcons = activeIcons.filter(m => m !== marker);
        });

        marker.addTo(map);
        activeIcons.push(marker);
        return;
      }
    }
    tries--;
  }
}

function spawnRandomIcons(){
  if(!iconsEnabled || !gameState.gameActive || !gameState.bandName || !countriesData) return;

  // Solo permitir iconos si se ha leído el mensaje de bienvenida
  if(gameState.firstSession) return;

  const cIso = Object.keys(gameState.countryStatus).filter(i => {
    const cs = gameState.countryStatus[i];
    return cs && cs.esbirros > 0; // Solo países con al menos un esbirro
  });
  if(cIso.length === 0) return;

  const now = Date.now();
  const isInitialPhase = Date.now() - gameState.gameStartTime < 60000; // 1 minuto inicial

  // Intervalos más cortos al inicio
  const moneyInterval = isInitialPhase ? 5000 : MONEY_ICON_SPAWN_INTERVAL;
  const esbirrosInterval = isInitialPhase ? 7000 : ESBIRROS_ICON_SPAWN_INTERVAL;
  const policeInterval = isInitialPhase ? 10000 : POLICE_ICON_SPAWN_INTERVAL;

  // Iconos de dinero
  if(moneyIconsEnabled && now - lastMoneySpawn >= moneyInterval) {
    const availableCountries = cIso.filter(i => {
      const cs = gameState.countryStatus[i];
      // Mayor probabilidad en países dominados
      return cs && cs.esbirros > 0 && (Math.random() < (cs.control === 100 ? 0.4 : 0.2));
    });
    
    if(availableCountries.length > 0) {
      const rM = availableCountries[Math.floor(Math.random() * availableCountries.length)];
      spawnIcon("money", moneyIcon, rM);
      lastMoneySpawn = now;
    }
  }

  // Iconos de esbirros
  if(esbirrosIconsEnabled && now - lastEsbirrosSpawn >= esbirrosInterval) {
    const availableForEsbirros = cIso.filter(i => {
      const cs = gameState.countryStatus[i];
      // Solo en países donde queda población por reclutar
      const maxEsbirros = cs.popReal - cs.arrestedTotal;
      return cs && cs.esbirros > 0 && 
             maxEsbirros > 0 && 
             cs.esbirros < maxEsbirros;
    });
    
    if(availableForEsbirros.length > 0) {
      const rE = availableForEsbirros[Math.floor(Math.random() * availableForEsbirros.length)];
      spawnIcon("esbirros", esbirrosIcon, rE);
      lastEsbirrosSpawn = now;
    }
  }

  // Iconos de policía
  if(policeIconsEnabled && now - lastPoliceSpawn >= policeInterval) {
    const availableForPolice = cIso.filter(i => {
      const cs = gameState.countryStatus[i];
      // Aparece en países con más del 51% de control policial o aleatoriamente si hay estrellas
      const policeControl = (cs.arrestedTotal / cs.popReal) * 100;
      return cs && cs.esbirros > 0 && (
        policeControl > 51 || 
        (gameState.policeStars > 0 && cs.control < 100 && Math.random() < 0.3)
      );
    });
    
    if(availableForPolice.length > 0) {
      const rP = availableForPolice[Math.floor(Math.random() * availableForPolice.length)];
      spawnIcon("police", policeIcon, rP);
      lastPoliceSpawn = now;
    }
  }
}

function checkGameOver(){
  const allCountries = countriesData.features.map(f => f.id)
  const controlledCountries = Object.keys(gameState.countryStatus).filter(iso => gameState.countryStatus[iso].dominated)
  const allCountriesControlled = allCountries.length === controlledCountries.length
  if(allCountriesControlled){
    addNotification("¡Has dominado el mundo entero! Fin del juego.","gameResult")
    SoundManager.playGameOver() // Play game over sound
    return true
  }
  let totalPopulation = 0
  let arrestedPopulation = 0
  for(const iso in gameState.countryStatus){
    const st = gameState.countryStatus[iso]
    const pop = st.popReal || 0
    totalPopulation += pop
    if((st.arrestedTotal / pop) * 100 >= 100 && pop>0){
      arrestedPopulation += pop
    }
  }
  if((arrestedPopulation / totalPopulation) * 100 >= POPULATION_CONTROL_GAME_OVER_THRESHOLD && totalPopulation>0){
    addNotification("¡GAME OVER! La policía domina el 51% de la población mundial.","gameResult")
    SoundManager.playGameOver() // Play game over sound
    return true
  }
  return false
}

setInterval(() => {
  if(!gameState.gameActive || !gameState.bandName || !countriesData) return

  triggerPoliceActions()

  let newArrestsGlobal = 0
  let totalWorldPopulation = 0
  let totalEsbirrosInGame = 0
  for(const iso in gameState.countryStatus){
    const st = gameState.countryStatus[iso]
    const oldE = st.esbirros || 0
    const eGain = (gameState.totalEsbirrosUpgrades * gameState.esbirrosPerTickMultiplier * (1 + gameState.esbirrosMultiplierPercentage)) / 5
    const dominatedCount = Object.keys(gameState.countryStatus).filter(k => gameState.countryStatus[k].dominated).length

    // Ajustar tasa de arrestos según estrellas y resistencia
    let arrestRate = 0.01 * Math.max(0, gameState.policeStars - gameState.policeResistance)
    if(gameState.policeStars >= 3) arrestRate *= 1.5
    if(gameState.policeStars >= 5) arrestRate *= 2.0

    // Ajustar según control del país
    if(st.control < 20){
      arrestRate *= 0.1
    } else if(st.control < 50){
      arrestRate *= 0.3
    } else if(st.control < 80){
      arrestRate *= 0.7
    }

    let arrests = Math.floor(oldE * arrestRate * (1 + dominatedCount * 0.1))
    let newEsb = oldE + eGain - arrests

    const pop = st.popReal || 0
    totalWorldPopulation += pop

    let maxEsbirrosInCountry = Math.max(0, pop - (st.arrestedTotal || 0))
    newEsb = Math.min(newEsb, maxEsbirrosInCountry)
    if(isNaN(newEsb) || !isFinite(newEsb)) newEsb = 0
    if(newEsb < 0) newEsb = 0

    newArrestsGlobal += arrests
    st.esbirros = newEsb
    st.arrestedTotal = Math.min((st.arrestedTotal || 0) + arrests, pop)
    st.control = pop>0 ? Math.min(100, (st.esbirros/pop)*100) : 0

    if(st.control >= 100 && !st.dominated){
      st.dominated = true
      addNotification("¡Has dominado","countryConquered", st.countryName)
      increaseStarsWithResistance(15) // Aumentar estrellas al dominar un país
    }
    totalEsbirrosInGame += (st.esbirros || 0)
  }
  gameState.totalArrested += newArrestsGlobal
  gameState.lastArrestIncrement = newArrestsGlobal
  gameState.arrestedPerSecond = (gameState.lastArrestIncrement / 5) * (1 - gameState.socialArrestReductionPercentage);
  gameState.moneyPerSecond = Math.max(0, gameState.totalMoneyUpgradesSec)
  gameState.playerMoney += gameState.moneyPerSecond

  if(checkGameOver()){
    gameState.gameActive = false
    stopNewsGeneration()
    SoundManager.stopBackgroundMusic() // Stop background music on game over
    saveGame()
    return
  }
  if(totalEsbirrosInGame <= 0){
    addNotification("¡GAME OVER! Todos tus esbirros han sido arrestados.","gameResult")
    SoundManager.playGameOver() // Play game over sound
    gameState.gameActive = false
    stopNewsGeneration()
    SoundManager.stopBackgroundMusic() // Stop background music on game over
    saveGame()
    return
  }

  updatePerSecondStats()
  refreshGeoStyle()
  renderStats()
  renderWorldList()
  Object.keys(gameState.countryStatus).forEach(expandFromCountry)
  spawnRandomIcons()
  renderStats()
  saveGame()
}, 200)

function generateNewsUpdate(){}

function startNewsGeneration(){
  if(!newsInterval){
    newsInterval = setInterval(generateNewsUpdate, 300000)
  }
}
function stopNewsGeneration(){
  if(newsInterval){
    clearInterval(newsInterval)
    newsInterval = null
  }
}

function showNewsPopup(newsContent, newsTitle="Última hora", newsType="default") {
  // Limpiar clases anteriores y asegurar que el popup esté visible
  newsPopupElement.style.display = "block";
  newsPopupElement.className = "";
  newsPopupElement.classList.add("newsPopup");
  
  // Añadir clase según el tipo
  if (newsType === "welcome") {
    newsPopupElement.classList.add("welcome-popup");
  } else if (["money", "esbirros", "police"].includes(newsType)) {
    newsPopupElement.classList.add(`news-${newsType}`);
  }

  // Configurar icono según el tipo
  const iconSrc = {
    money: "assets/images/iconodinero.webp",
    esbirros: "assets/images/iconoesbirro.webp",
    police: "assets/images/iconopolicia.webp",
    welcome: "assets/images/iconoinfo.webp",
    default: "assets/images/icononoticia.webp"
  }[newsType] || "assets/images/icononoticia.webp";

  // Crear estructura del popup
  newsPopupElement.innerHTML = `
    <div class="news-header">
      <img src="${iconSrc}" alt="Icono de noticia" class="news-icon">
      <div class="news-title-header">
        <div class="news-banner">${newsTitle}</div>
      </div>
      <button class="close-news-btn">×</button>
    </div>
    <div class="news-content">
      ${newsType === "welcome" ? newsContent : ""}
    </div>
  `;

  // Si no es mensaje de bienvenida, procesar el contenido de la noticia
  if (newsType !== "welcome") {
    try {
      const news = JSON.parse(newsContent);
      const newsContentDiv = newsPopupElement.querySelector(".news-content");
      newsContentDiv.innerHTML = `
        <h4 class="news-headline">${news.headline}</h4>
        <p class="news-body">${news.body}</p>
        <div id="bonusRewardContainer" class="bonus-reward-container"></div>
      `;
    } catch (e) {
      console.error("Error al procesar la noticia:", e);
      const newsContentDiv = newsPopupElement.querySelector(".news-content");
      newsContentDiv.innerHTML = `
        <h4 class="news-headline">Error al procesar la noticia</h4>
        <p class="news-body">No se pudo mostrar la noticia correctamente.</p>
        <div id="bonusRewardContainer" class="bonus-reward-container"></div>
      `;
    }
  }

  // Mostrar el popup y el overlay
  newsPopupElement.classList.remove("hidden");
  newsOverlay.classList.remove("hidden");
  newsOverlay.style.display = "block";
  
  // Detener la generación de noticias mientras se muestra el popup
  stopNewsGeneration();
  
  // Reproducir sonido
  SoundManager.playPopup();

  // Configurar el nuevo botón de cerrar
  const closeBtn = newsPopupElement.querySelector(".close-news-btn");
  closeBtn.addEventListener("click", closeNewsPopup);
}

function closeNewsPopup(){
  newsPopupElement.classList.add("hidden");
  newsOverlay.classList.add("hidden");
  newsOverlay.style.display = "none";
  startNewsGeneration();
  SoundManager.playButtonClick(); // Play sound on close news popup
}
closeNewsButton.addEventListener("click", closeNewsPopup);
newsOverlay.addEventListener("click", closeNewsPopup);

leaderCards.forEach(c => {
  c.addEventListener("click", () => {
    leaderCards.forEach(x => x.classList.remove("selected"));
    c.classList.add("selected");
    SoundManager.playButtonClick(); // Play sound on leader card click
  });
});

tabButtons.forEach(btn => {
  btn.addEventListener("click", e => {
    const tId = e.target.dataset.tab || e.target.parentElement.dataset.tab;
    tabContents.forEach(cc => cc.classList.remove("active"));
    tabButtons.forEach(b => b.classList.remove("active"));
    document.getElementById(tId).classList.add("active");
    btn.classList.add("active");

    if(tId === "world") {
      sidebar.classList.add("world-sidebar");
      renderWorldList();
    } else {
      sidebar.classList.remove("world-sidebar");
    }
    renderUpgrades();
    renderInvestments();
    appContainer.className = '';
    tabContents.forEach(tabContent => {
      if (tabContent.classList.contains('active')) {
        appContainer.classList.add(`tab-content-${tabContent.id.split('.')[0]}-active`);
      }
    });
    SoundManager.playButtonClick(); // Play sound on tab button click
  });
});

gameTitles.forEach(tl => {
  tl.addEventListener("click", () => {
    tl.parentElement.classList.toggle("collapsed");
    tl.querySelector("i.fas")?.classList.toggle("fa-chevron-down");
    tl.querySelector("i.fas")?.classList.toggle("fa-chevron-up");
    SoundManager.playButtonClick(); // Play sound on game title click
  });
});

countryProgressModalCloseButton.addEventListener("click", () => {
  countryProgressModal.classList.remove("active");
  SoundManager.playButtonClick(); // Play sound on country progress modal close
});

function setMenuIcon(){
  const ic = menuToggleButton.querySelector("i");
  const portr = window.innerWidth<=768 && window.innerHeight>window.innerWidth;
  const active = sidebar.classList.contains("active");
  if(portr){
    ic.className = `fas fa-chevron-${active?"down":"up"}`;
  } else {
    ic.className = `fas fa-chevron-${active?"right":"left"}`;
  }
}

function adjustMenuToggleButton(){
  const p = window.innerWidth<=768 && window.innerHeight>window.innerWidth;
  sidebar.classList.toggle("portrait", p);
  Object.assign(menuToggleButton.style,
    p
    ? { top:"auto", bottom:"20px", left:"50%", right:"auto", transform:"translateX(-50%)" }
    : { bottom:"auto", top:"50%", right:"0", left:"auto", transform:"translateY(-50%)" }
  );
  setMenuIcon();
}

window.addEventListener("load", adjustMenuToggleButton);
window.addEventListener("resize", adjustMenuToggleButton);
window.addEventListener("orientationchange", adjustMenuToggleButton);

menuToggleButton.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  setMenuIcon();
  SoundManager.playButtonClick(); // Play sound on menu toggle button click
});

fetch("./data/countriesWithPopulation.geo.json")
  .then(r => r.json())
  .then(d => {
    countriesData = d;
    geojsonLayer = L.geoJSON(d, {
      style: () => ({ color:"#555", weight:1, fillColor:"#f0f0f0", fillOpacity:0.2 }),
      onEachFeature: (f,l) => l.on({
        click: onCountryClick
      })
    }).addTo(map);

    d.features.forEach(f => {
      const opt = document.createElement("option");
      opt.value = f.id;
      opt.textContent = f.properties.name;
      startCountrySelect.appendChild(opt);
    });
    initializeAuth(handleAuthStateChanged);
    renderInvestments();
  });
