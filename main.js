import { moneyUpgrades, esbirrosUpgrades, policeUpgrades, weaponsUpgrades } from "./upgrades.js";
import { generateNews } from "./ia.js";
import { auth, initializeAuth, logout, register, login } from "./auth.js";
import { database, ref, set, get } from "./firebase-config.js";

const map = L.map("map", { noWrap: true, minZoom: 2, maxZoom: 18 }).setView([40, -3], 5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { noWrap: true }).addTo(map);
let geojsonLayer = null;
let countriesData = null;
let countryStatus = {};
let currentIso = null;
let playerMoney = 0;
let totalArrested = 0;
let policeStars = 0;
let baseMoneyClick = 5;
let totalMoneyUpgrades = 0;
let totalMoneyUpgradesSec = 0;
let totalEsbirrosUpgrades = 0;
let bandName = "";
let leaderName = "";
let leaderImage = "";
let startCountry = "";
let gameActive = false;
let log = [];
let economicAbilities = weaponsUpgrades.filter(x => x.type === "economic");
let socialAbilities = weaponsUpgrades.filter(x => x.type === "social");
let militaryAbilities = weaponsUpgrades.filter(x => x.type === "military");
let clickMultiplierPercentage = 0;
let esbirrosMultiplierPercentage = 0;
let moneyPerSecond = 0;
let esbirrosPerSecond = 0;
let arrestedPerSecond = 0;
let displayedMoney = 0;
let displayedArrested = 0;
let displayedEsbirros = 0;
const ANIMATION_REFRESH_RATE = 50;
let lastArrestIncrement = 0;
let lastNotEnoughMoneyNotification = 0;
const NOT_ENOUGH_MONEY_COOLDOWN = 10000;
const leaders = [{ id: "leader1", image: "images/man.jfif" }, { id: "leader2", image: "images/woman.jfif" }];
let currentUser = null;

const failedImages = new Set();

function handleImageError(imgElement, imagePath) {
    imgElement.style.display = 'none';
    failedImages.add(imagePath);
}

function logMessage(message) {
    const logEntry = new Date().toISOString() + ": " + message;
    log.push(logEntry);
    console.log(logEntry);
}
function formatNumber(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toFixed(2);
}
function addNotification(msg, type = "general") {
    const allowedTypes = ["searchStars", "gameResult", "expansion", "notEnoughMoney"];
    if (!allowedTypes.includes(type)) return;
    const currentTime = Date.now();
    if (type === "notEnoughMoney") {
        if (currentTime - lastNotEnoughMoneyNotification < NOT_ENOUGH_MONEY_COOLDOWN) return;
        lastNotEnoughMoneyNotification = currentTime;
    }
    const c = document.getElementById("notificationContainer");
    let div = document.createElement("div");
    div.classList.add("notification");
    let icon = "";
    if (type === "searchStars") icon = '<i class="fas fa-shield-alt"></i> ';
    else if (type === "gameResult") icon = '<i class="fas fa-trophy"></i> ';
    else if (type === "expansion") icon = '<i class="fas fa-globe"></i> ';
    else if (type === "notEnoughMoney") icon = '<i class="fas fa-exclamation-triangle"></i> ';
    let close = document.createElement("span");
    close.classList.add("close-btn");
    close.innerText = "X";
    close.onclick = () => {
        div.classList.add("slideOut");
        setTimeout(() => {
            if (c.contains(div)) c.removeChild(div);
        }, 300);
    };
    div.appendChild(close);
    let text = document.createElement("div");
    text.innerHTML = icon + msg;
    div.appendChild(text);
    c.appendChild(div);
    setTimeout(() => {
        div.classList.add("slideOut");
        setTimeout(() => {
            if (c.contains(div)) c.removeChild(div);
        }, 300);
    }, 10000);
}
function createAnimation(elementId, value, type) {
    const bannerItem = document.getElementById(elementId);
    if (!bannerItem) return;
    const rect = bannerItem.getBoundingClientRect();
    const animation = document.createElement("div");
    animation.classList.add(type + "-animation");
    animation.style.left = rect.left + rect.width / 2 + "px";
    animation.style.top = rect.top + rect.height / 2 + "px";
    let prefix = "+";
    if (type === "arrested") prefix = "-";
    animation.textContent = prefix + formatNumber(value);
    document.body.appendChild(animation);
    requestAnimationFrame(() => {
        animation.style.transform = "translateY(-20px)";
        animation.style.opacity = 0;
        animation.style.fontFamily = "Pricedown";
        animation.style.color = type === "money" || type === "esbirros" ? "green" : "#ff0000";
    });
    setTimeout(() => {
        if (document.body.contains(animation)) document.body.removeChild(animation);
    }, 500);
    if (type === "money") {
        bannerItem.classList.add("money-flash");
        setTimeout(() => bannerItem.classList.remove("money-flash"), 500);
    } else if (type === "esbirros") {
        bannerItem.classList.add("esbirro-flash");
        setTimeout(() => bannerItem.classList.remove("esbirro-flash"), 500);
    }
}
function updatePerSecondStats() {
    totalMoneyUpgradesSec = moneyUpgrades.reduce((acc, up) => acc + (up.effectMoneySec || 0) * up.times, 0);
    moneyPerSecond = Math.max(0, totalMoneyUpgradesSec);
    esbirrosPerSecond = totalEsbirrosUpgrades * esbirrosPerTickMultiplier * (1 + esbirrosMultiplierPercentage);
}

function renderStats() {
    document.getElementById("moneyPerSecond").innerText = formatNumber(moneyPerSecond);
    document.getElementById("esbirrosPerSecond").innerText = formatNumber(esbirrosPerSecond);
    document.getElementById("arrestedPerSecond").innerText = formatNumber(arrestedPerSecond);
    let progressWidth = (policeStars / 5) * 100;
    if (policeStars > 5) progressWidth = 100;
    if (policeStars < 0) progressWidth = 0;
    document.querySelector("#bannerStars .progress").style.width = progressWidth + "%";
    document.querySelectorAll("#bannerStars .star").forEach((star, i) => {
        star.style.opacity = i < policeStars ? 1 : 0;
    });
    if (!currentIso) {
        document.getElementById("bannerEsbirros").innerText = "0";
        return;
    }
    let st = countryStatus[currentIso];
    if (!st) return;
    document.getElementById("bandInfoBand").textContent = bandName;
    document.getElementById("bandInfoLeader").textContent = leaderName;
    document.getElementById("bandInfoCountry").textContent = startCountry;
    const leaderImgElement = document.getElementById("leaderImage");
    const newLeaderImage = new Image();
    newLeaderImage.onload = () => {
        leaderImgElement.src = leaderImage;
    };
    newLeaderImage.onerror = () => {
        leaderImgElement.src = 'images/placeholder.png';
    };
    newLeaderImage.src = leaderImage;

    let banner = document.getElementById("statsBanner");
    if (currentIso && banner.classList.contains("hidden")) {
        banner.classList.add("active");
        banner.classList.remove("hidden");
    }
    banner.classList.add('subtle-banner');
}

function costOf(u) {
    return Math.floor(u.baseCost * Math.pow(1.15, u.times));
}
function isPreviousRankPurchased(up, upgradesArray) {
    if (up.rank === 1) return true;
    let prevUpgrade = upgradesArray.find(x => x.rank === up.rank - 1);
    if (!prevUpgrade) return true;
    return prevUpgrade.times >= 10;
}
function isUnlocked(up, upgradesArray) {
    if (up.rank === 1) return true;
    return isPreviousRankPurchased(up, upgradesArray);
}
function shouldShow(up, upgradesArray) {
    if (up.rank === 1) return true;
    let prev = upgradesArray.find(x => x.rank === up.rank - 1);
    if (!prev) return true;
    if (prev.times >= 10) return true;
    return false;
}

function renderUpgradesList(id, upgradesArray, buyFunc, type) {
    let container = document.getElementById(id);
    container.innerHTML = "";
    upgradesArray.sort((a, b) => a.rank - b.rank);
    for (let up of upgradesArray) {
        let visible = up.rank === 1 ? true : shouldShow(up, upgradesArray);
        if (!visible) continue;
        if (type === "weapons" && up.rank > 5) {
            let hasConquered = Object.values(countryStatus).some(st => st.control >= 50);
            if (!hasConquered) visible = false;
        }
        if (!visible) continue;
        let cost = costOf(up);
        let canBuy = playerMoney >= cost;
        let item = document.createElement("div");
        item.classList.add("upgrade-item");
        let locked = "";
        if (!isUnlocked(up, upgradesArray) && up.rank > 1) {
            locked = '<span class="lock-icon"><i class="fas fa-lock"></i><span class="tooltiptext">Desbloqueado al comprar 10 veces la mejora rank "' + (up.rank - 1) + '"</span></span>';
        }
        let effectText = "";
        if (type === "money") {
            effectText = '<div class="effect"><span class="value">' + formatNumber(up.effectMoney) + '</span> <span class="unit">/click</span>' + (up.effectMoneySec ? '<span class="value">+' + formatNumber(up.effectMoneySec) + '</span><span class="unit">/seg</span>' : '') + '</div>';
        } else if (type === "esbirros") {
            effectText = '<div class="effect"><span class="value">' + formatNumber(up.effectEsb) + '</span> <span class="unit">esb/tick</span></div>';
        } else if (type === "police" && up.effectPolice !== 0) {
            let sign = up.effectPolice > 0 ? ("+" + up.effectPolice) : up.effectPolice;
            effectText = '<div class="effect">Ajuste Policía: <span class="value">' + sign + "</span></div>";
        } else if (type === "weapons") {
            if (up.type === "economic") {
                effectText = '<div class="effect">+<span class="value">' + (up.effect * 100).toFixed(1) + '</span><span class="unit">%</span> por click</div>';
            } else if (up.type === "military") {
                effectText = '<div class="effect">+<span class="value">' + (up.effect * 100).toFixed(1) + '</span><span class="unit">%</span> esbirros/seg</div>';
            } else {
                effectText = '<div class="effect">' + up.desc + "</div>";
            }
        }

        let imageHTML = '';
        if (up.image && !failedImages.has(up.image)) {
            imageHTML = `<img src="${up.image}" alt="${up.name}" class="upgrade-image" onerror="handleImageError(this, '${up.image}')"/>`;
        }

        let itemContent = locked + '<div class="upgrade-header">' + imageHTML + '<div class="upgrade-title"><div class="name">' + up.name + '</div><div class="cost">Coste: ' + formatNumber(cost) + '</div></div></div><div class="upgrade-details"><div class="desc">' + up.desc + "</div>" + effectText + (type !== "weapons" ? '<div class="times">Veces: ' + up.times + "</div>" : "") + "</div>";
        item.innerHTML = itemContent;
        if (canBuy && isUnlocked(up, upgradesArray)) {
            item.classList.add("upgrade-available", "clickable");
        } else {
            item.classList.add("upgrade-unavailable");
        }
        item.addEventListener("click", () => {
            if (!isUnlocked(up, upgradesArray)) {
                addNotification("No has desbloqueado la siguiente mejora todavía.", "general");
                return;
            }
            if (!canBuy) {
                addNotification("No tienes suficiente dinero.", "notEnoughMoney");
                return;
            }
            buyFunc(up);
        });
        container.appendChild(item);
    }
}

function renderAbilityColumn(id, abilitiesArray, buyFunc) {
    const container = document.getElementById(id);
    container.innerHTML = "";
    abilitiesArray.sort((a, b) => a.rank - b.rank);
    for (const ability of abilitiesArray) {
        let visible = ability.rank === 1 ? true : shouldShow(ability, abilitiesArray);
        if (!visible) continue;
        let cost = costOf(ability);
        let canBuy = playerMoney >= cost;
        let item = document.createElement("div");
        item.classList.add("upgrade-item");
        let locked = "";
        if (!isUnlocked(ability, abilitiesArray) && ability.rank > 1) {
            locked = '<span class="lock-icon"><i class="fas fa-lock"></i><span class="tooltiptext">Desbloqueado al comprar 10 veces la mejora rank "' + (ability.rank - 1) + '"</span></span>';
        }
        let effectText = "";
        if (ability.type === "economic") {
            effectText = '<div class="effect">+<span class="value">' + (ability.effect * 100).toFixed(1) + '</span><span class="unit">%</span> por click</div>';
        } else if (ability.type === "military") {
            effectText = '<div class="effect">+<span class="value">' + (ability.effect * 100).toFixed(1) + '</span><span class="unit">%</span> esbirros/seg</div>';
        } else {
            effectText = '<div class="effect">' + ability.desc + "</div>";
        }

        let imageHTML = '';
        if (ability.image && !failedImages.has(ability.image)) {
            imageHTML = `<img src="${ability.image}" alt="${ability.name}" class="upgrade-image" onerror="handleImageError(this, '${ability.image}')"/>`;
        }

        let itemContent = locked + '<div class="upgrade-header">' + imageHTML + '<div class="upgrade-title"><div class="name">' + ability.name + '</div><div class="cost">Coste: ' + formatNumber(cost) + '</div></div></div><div class="upgrade-details"><div class="desc">' + ability.desc + "</div>" + effectText + '<div class="times">Veces: ' + ability.times + "</div></div>";
        item.innerHTML = itemContent;
        if (canBuy && isUnlocked(ability, abilitiesArray)) {
            item.classList.add("upgrade-available", "clickable");
        } else {
            item.classList.add("upgrade-unavailable");
        }
        item.addEventListener("click", () => {
            if (!isUnlocked(ability, abilitiesArray)) {
                addNotification("No has desbloqueado la siguiente mejora todavía.", "general");
                return;
            }
            if (!canBuy) {
                addNotification("No tienes suficiente dinero.", "notEnoughMoney");
                return;
            }
            buyFunc(ability);
        });
        container.appendChild(item);
    }
}

function renderAbilities() {
    renderAbilityColumn("economicAbilities", economicAbilities, buyWeaponUpgrade);
    renderAbilityColumn("socialAbilities", socialAbilities, buyWeaponUpgrade);
    renderAbilityColumn("militaryAbilities", militaryAbilities, buyWeaponUpgrade);
}

function renderWorldList() {
    const list = document.getElementById("country-list");
    list.innerHTML = "";
    let arr = Object.keys(countryStatus);
    if (arr.length === 0) {
        list.innerHTML = "<li>No has descubierto ningún país todavía</li>";
    } else {
        arr.forEach(iso => {
            let country = countryStatus[iso];
            const li = document.createElement("li");
            li.textContent = country.countryName || iso;
            li.addEventListener("click", () => {
                showCountryDetail(iso);
                map.eachLayer(layer => {
                    if (layer instanceof L.GeoJSON) {
                        layer.eachLayer(featureLayer => {
                            if (featureLayer.feature.id === iso) {
                                let coords = featureLayer.feature.geometry.coordinates[0][0];
                                let lat = coords[1];
                                let lng = coords[0];
                                map.setView([lat, lng], 5);
                            }
                        });
                    }
                });
            });
            list.appendChild(li);
        });
        if (currentIso) showCountryDetail(currentIso);
    }
}

function showCountryDetail(iso) {
    currentIso = iso;
    let st = countryStatus[iso];
    if (!st) return;
    document.getElementById("detailCountryName").innerText = st.countryName || iso;
    document.getElementById("detailPopulation").innerText = formatNumber(st.popReal || 0);
    document.getElementById("detailEsbirros").innerText = formatNumber(st.esbirros || 0);
    document.getElementById("detailArrested").innerText = formatNumber(st.arrestedTotal || 0);
    refreshGeoStyle();
    renderStats();
}

function renderUpgrades() {
    renderUpgradesList("moneyUpgrades", moneyUpgrades, buyMoneyUpgrade, "money");
    renderUpgradesList("esbirrosUpgrades", esbirrosUpgrades, buyEsbirrosUpgrade, "esbirros");
    renderUpgradesList("policeUpgrades", policeUpgrades, buyPoliceUpgrade, "police");
    renderAbilities();
}

function buyMoneyUpgrade(u) {
    let c = costOf(u);
    if (playerMoney < c) {
        addNotification("No tienes suficiente dinero.", "notEnoughMoney");
        return;
    }
    playerMoney -= c;
    u.times++;
    totalMoneyUpgrades += u.effectMoney;
    maybeRaiseStars(1);
    createAnimation("bannerMoney", u.effectMoney, "money");
    updatePerSecondStats();
    renderStats();
    renderUpgrades();
    logMessage("Comprada mejora de dinero: " + u.name);
    saveGame();
}
function buyEsbirrosUpgrade(u) {
    let c = costOf(u);
    if (playerMoney < c) {
        addNotification("No tienes suficiente dinero.", "notEnoughMoney");
        return;
    }
    playerMoney -= c;
    u.times++;
    totalEsbirrosUpgrades += u.effectEsb;
    maybeRaiseStars(2);
    createAnimation("bannerEsbirros", u.effectEsb, "esbirros");
    updatePerSecondStats();
    renderStats();
    renderUpgrades();
    logMessage("Comprada mejora de esbirros: " + u.name);
    saveGame();
}
function buyPoliceUpgrade(u) {
    let c = costOf(u);
    if (playerMoney < c) {
        addNotification("No tienes suficiente dinero.", "notEnoughMoney");
        return;
    }
    playerMoney -= c;
    u.times++;
    if (u.effectPolice !== 0) {
        policeStars += u.effectPolice;
        if (policeStars < 0) policeStars = 0;
        if (policeStars > 5) policeStars = 5;
        addNotification("Compraste " + u.name + ". Estrellas policía: " + policeStars, "searchStars");
        logMessage("Comprada mejora de policía: " + u.name + ", Estrellas policía: " + policeStars);
    }
    renderStats();
    renderUpgrades();
    saveGame();
}
function buyWeaponUpgrade(u) {
    let c = costOf(u);
    if (playerMoney < c) {
        addNotification("No tienes suficiente dinero.", "notEnoughMoney");
        return;
    }
    playerMoney -= c;
    u.times++;
    if (u.type === "economic") {
        clickMultiplierPercentage += u.effect;
        updatePerSecondStats();
        renderStats();
        renderUpgrades();
        logMessage("Comprada mejora de click: " + u.name);
    } else if (u.type === "military") {
        esbirrosMultiplierPercentage += u.effect;
        updatePerSecondStats();
        renderStats();
        renderUpgrades();
        logMessage("Comprada mejora de esbirros: " + u.name);
    } else {
        if (u.effect) {
            applyWeaponEffect(u);
            addNotification("Compraste " + u.name + ".", "expansion");
            logMessage("Comprada arma: " + u.name);
        }
        renderStats();
        renderAbilities();
    }
    saveGame();
}

let expansionProbabilityMultiplier = 1;
let policeResistance = 0;
let esbirrosPerTickMultiplier = 1;

function applyWeaponEffect(u) {
    if (u.id.startsWith("probabilityBoost")) expansionProbabilityMultiplier *= u.effect;
    if (u.id.startsWith("policeResistance")) policeResistance += u.effect;
    if (u.id.startsWith("esbirrosPerTick")) esbirrosPerTickMultiplier *= u.effect;
    if (u.id.startsWith("weaponElite") || u.id.startsWith("weaponMastery") || u.id.startsWith("weaponLegendary")) {
        expansionProbabilityMultiplier *= u.effect;
        policeResistance += u.effect * 0.05;
        esbirrosPerTickMultiplier *= u.effect;
    }
}

function maybeRaiseStars(level) {
    if (policeStars >= 5) return;
    let chance = level === 1 ? 0.05 : 0.1;
    chance *= expansionProbabilityMultiplier;
    if (Math.random() < chance) {
        policeStars++;
        addNotification("La policía incrementa su vigilancia. Estrellas = " + policeStars, "searchStars");
        logMessage("Policía incrementa vigilancia. Estrellas: " + policeStars);
        renderStats();
        renderUpgrades();
        saveGame();
    }
}

document.getElementById("btnMoneyClick").addEventListener("click", e => {
    handleMoneyClick(e, 1);
});
document.querySelectorAll(".btn-multiplier").forEach(btn => {
    btn.addEventListener("click", e => {
        const multiplier = parseInt(e.target.getAttribute("data-multiplier"));
        handleMoneyClick(e, multiplier);
    });
});
function handleMoneyClick(e, multiplier) {
    if (!gameActive) return;
    let earn = (baseMoneyClick + totalMoneyUpgrades) * multiplier * (1 + clickMultiplierPercentage);
    playerMoney += earn;
    createAnimation("bannerMoney", earn, "money");
    renderStats();
    renderAbilities();
    e.target.classList.add("clicked");
    setTimeout(() => e.target.classList.remove("clicked"), 200);
    logMessage("Generado dinero: " + earn);
    saveGame();
}

function onCountryClick(e) {
    showCountryDetail(e.target.feature.id);
}
function onCountryMouseOver(e) {
    let iso = e.target.feature.id;
    if (!countryStatus[iso]) {
        let countryName = countriesData.features.find(f => f.id === iso)?.properties?.name || iso;
        e.target.bindTooltip(countryName + "\nEsbirros=0\nDetenidos=0\nControl=0%").openTooltip();
        return;
    }
    let st = countryStatus[iso];
    let c = st.control || 0;
    let arr = st.arrestedTotal || 0;
    let esb = st.esbirros || 0;
    let countryName = st.countryName || iso;
    e.target.bindTooltip(countryName + "\nEsbirros:" + formatNumber(esb) + "\nDetenidos:" + formatNumber(arr) + "\nControl:" + c + "%").openTooltip();
}
function onCountryMouseOut(e) {
    e.target.closeTooltip();
}
function refreshGeoStyle() {
    if (!geojsonLayer) return;
    geojsonLayer.setStyle(feature => {
        let iso = feature.id;
        if (!countryStatus[iso]) return { color: "#555", weight: 1, fillColor: "#f0f0f0", fillOpacity: 0.2 };
        let st = countryStatus[iso];
        if (iso === startCountry) return { color: "#555", weight: 1, fillColor: "#00FF00", fillOpacity: 0.5 };
        if (st.dominated) return { color: "#555", weight: 1, fillColor: "#ff0000", fillOpacity: 1 };
        if (st.control >= 90) return { color: "#555", weight: 1, fillColor: "#ff0000", fillOpacity: 0.8 };
        if (st.control >= 50 && st.control < 90) return { color: "#555", weight: 1, fillColor: "#800080", fillOpacity: st.control / 100 };
        if (st.control < 50 && st.arrestedTotal >= st.esbirros) return { color: "#555", weight: 1, fillColor: "#0000FF", fillOpacity: 1 };
        return { color: "#555", weight: 1, fillColor: "#ff0000", fillOpacity: st.control / 100 };
    });
}
function getPopulationFromFeature(iso) {
    if (!countriesData) return 0;
    let feat = countriesData.features.find(f => f.id === iso);
    if (!feat) return 0;
    return feat.properties.population || 0;
}

const defaultGameState = {
    playerMoney: 100,
    totalArrested: 0,
    policeStars: 0,
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
    expansionProbabilityMultiplier: 1,
    policeResistance: 0,
    esbirrosPerTickMultiplier: 1,
    moneyUpgrades: moneyUpgrades.map(u => ({ times: 0 })),
    esbirrosUpgrades: esbirrosUpgrades.map(u => ({ times: 0 })),
    policeUpgrades: policeUpgrades.map(u => ({ times: 0 })),
    weaponsUpgrades: weaponsUpgrades.map(u => ({ times: 0 })),
    currentIso: null
};

document.getElementById('register-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const registerEmail = document.getElementById('register-email').value;
    const registerPassword = document.getElementById('register-password').value;
    const registerPasswordConfirm = document.getElementById('register-password-confirm').value;
    const registerBandName = document.getElementById('register-band-name').value;
    const registerStartCountry = document.getElementById('register-start-country').value;
    const registerLeaderName = document.getElementById('register-leader-name').value;
    const selectedLeader = document.querySelector('.leader-card.selected .leader-card-inner')?.getAttribute('data-leader-id');
    const selectedLeaderImage = document.querySelector('.leader-card.selected .leader-card-image')?.getAttribute('src');

    if (registerPassword !== registerPasswordConfirm) {
        addNotification("Las contraseñas no coinciden.", "general");
        return;
    }
    if (!selectedLeader) {
        addNotification("Selecciona un líder.", "general");
        return;
    }
    bandName = registerBandName;
    startCountry = countriesData.features.find(f => f.id === registerStartCountry)?.properties?.name || registerStartCountry;
    leaderName = registerLeaderName;
    leaderImage = selectedLeaderImage;

    register(registerEmail, registerPassword)
        .then(user => {
            const initialGameState = { ...defaultGameState };
            initialGameState.bandName = registerBandName;
            initialGameState.startCountry = countriesData.features.find(f => f.id === registerStartCountry)?.properties?.name || registerStartCountry;
            initialGameState.leaderName = registerLeaderName;
            initialGameState.leaderImage = selectedLeaderImage;
            initialGameState.currentIso = registerStartCountry;
            initialGameState.gameActive = true;
            initialGameState.countryStatus[registerStartCountry] = {
                countryName: initialGameState.startCountry,
                popReal: getPopulationFromFeature(registerStartCountry),
                control: 0,
                dominated: false,
                arrestedTotal: 0,
                esbirros: 1
            };
            const userRef = ref(database, `users/${user.uid}/gameState`);
            set(userRef, initialGameState).then(() => {
                loadGame(user.uid);
                addNotification("Registro exitoso para: " + registerEmail, "general");
                document.getElementById('auth-container').classList.add('hidden');
            }).catch(error => {
                addNotification("Error al guardar el estado inicial del juego: " + error.message, "general");
            });
        })
        .catch(error => {
            addNotification("Error en el registro: " + error.message, "general");
        });
});

document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const loginEmail = document.getElementById('login-email').value;
    const loginPassword = document.getElementById('login-password').value;

    login(loginEmail, loginPassword)
        .then(user => {
            loadGame(user.uid);
            document.getElementById('auth-container').classList.add('hidden');
            addNotification("Inicio de sesión exitoso para: " + loginEmail, "general");
        })
        .catch(error => {
            addNotification("Error en el inicio de sesión: " + error.message, "general");
        });
});
document.getElementById('show-register').addEventListener('click', function () {
    document.getElementById('login-form-container').classList.add('hidden');
    document.getElementById('register-form-container').classList.remove('hidden');
});

document.getElementById('show-login').addEventListener('click', function () {
    document.getElementById('login-form-container').classList.remove('hidden');
    document.getElementById('register-form-container').classList.add('hidden');
});

function saveGame() {
    if (!currentUser) {
        console.error("No hay usuario autenticado para guardar el juego.");
        return;
    }
    const gameState = {
        playerMoney: playerMoney,
        totalArrested: totalArrested,
        policeStars: policeStars,
        totalMoneyUpgrades: totalMoneyUpgrades,
        totalMoneyUpgradesSec: totalMoneyUpgradesSec,
        totalEsbirrosUpgrades: totalEsbirrosUpgrades,
        bandName: bandName,
        leaderName: leaderName,
        leaderImage: leaderImage,
        startCountry: startCountry,
        gameActive: gameActive,
        countryStatus: countryStatus,
        clickMultiplierPercentage: clickMultiplierPercentage,
        esbirrosMultiplierPercentage: esbirrosMultiplierPercentage,
        expansionProbabilityMultiplier: expansionProbabilityMultiplier,
        policeResistance: policeResistance,
        esbirrosPerTickMultiplier: esbirrosPerTickMultiplier,
        moneyUpgrades: moneyUpgrades.map(u => ({ times: u.times })),
        esbirrosUpgrades: esbirrosUpgrades.map(u => ({ times: u.times })),
        policeUpgrades: policeUpgrades.map(u => ({ times: u.times })),
        weaponsUpgrades: weaponsUpgrades.map(u => ({ times: u.times })),
        currentIso: currentIso
    };
    const userRef = ref(database, `users/${currentUser.uid}/gameState`);
    set(userRef, gameState).then(() => {
        logMessage("Juego guardado en Firebase.");
    }).catch(error => {
        console.error("Error al guardar el juego:", error);
        addNotification("Error al guardar el juego en Firebase: " + error.message, "general");
    });
}
function loadGame(uid) {
    if (!uid) {
        console.error("No se proporcionó un UID de usuario para cargar el juego.");
        return;
    }
    const userRef = ref(database, `users/${uid}/gameState`);
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const gameState = snapshot.val();
            playerMoney = gameState.playerMoney;
            totalArrested = gameState.totalArrested;
            policeStars = gameState.policeStars;
            totalMoneyUpgrades = gameState.totalMoneyUpgrades;
            totalMoneyUpgradesSec = gameState.totalMoneyUpgradesSec;
            totalEsbirrosUpgrades = gameState.totalEsbirrosUpgrades;
            bandName = gameState.bandName;
            leaderName = gameState.leaderName;
            leaderImage = gameState.leaderImage;
            startCountry = gameState.startCountry;
            gameActive = gameState.gameActive;
            countryStatus = gameState.countryStatus;
            clickMultiplierPercentage = gameState.clickMultiplierPercentage;
            esbirrosMultiplierPercentage = gameState.esbirrosMultiplierPercentage;
            expansionProbabilityMultiplier = gameState.expansionProbabilityMultiplier;
            policeResistance = gameState.policeResistance;
            esbirrosPerTickMultiplier = gameState.esbirrosPerTickMultiplier;
            currentIso = gameState.currentIso;

            moneyUpgrades.forEach((upgrade, index) => {
                if (gameState.moneyUpgrades && gameState.moneyUpgrades[index]) upgrade.times = gameState.moneyUpgrades[index]?.times || 0;
                else upgrade.times = 0;
            });
            esbirrosUpgrades.forEach((upgrade, index) => {
                if (gameState.esbirrosUpgrades && gameState.esbirrosUpgrades[index]) upgrade.times = gameState.esbirrosUpgrades[index]?.times || 0;
                else upgrade.times = 0;
            });
            policeUpgrades.forEach((upgrade, index) => {
                if (gameState.policeUpgrades && gameState.policeUpgrades[index]) upgrade.times = gameState.policeUpgrades[index]?.times || 0;
                else upgrade.times = 0;
            });
            weaponsUpgrades.forEach((upgrade, index) => {
                if (gameState.weaponsUpgrades && gameState.weaponsUpgrades[index]) upgrade.times = gameState.weaponsUpgrades[index]?.times || 0;
                else upgrade.times = 0;
            });
            totalEsbirrosUpgrades = esbirrosUpgrades.reduce((acc, up) => acc + (up.effectEsb || 0) * up.times, 0);
            updatePerSecondStats();
            logMessage("Juego cargado desde Firebase.");
            startGame();
        } else {
            logMessage("No se encontró un juego guardado para este usuario en Firebase.");
            startGame();
        }
    }).catch(error => {
        console.error("Error al cargar el juego desde Firebase:", error);
        addNotification("Error al cargar el juego desde Firebase: " + error.message, "general");
    });
}
function initGame(initialCountryIso, selectedLeaderId, selectedLeaderImage, registerBandName, registerLeaderName) {
    if (!countriesData) {
        addNotification("Aún no se cargó geojson.", "general")
        return
    }
    let countryName = countriesData.features.find(f => f.id === initialCountryIso)?.properties?.name || initialCountryIso;
    if (!countryStatus[initialCountryIso]) {
        countryStatus[initialCountryIso] = {
            countryName: countryName,
            popReal: getPopulationFromFeature(initialCountryIso),
            control: 0,
            dominated: false,
            arrestedTotal: 0,
            esbirros: 1
        }
    }
    bandName = registerBandName;
    startCountry = countryName;
    leaderName = registerLeaderName;
    leaderImage = selectedLeaderImage;
    currentIso = initialCountryIso;

    startGame();
}
document.querySelectorAll('.leader-card').forEach(card => {
    card.addEventListener('click', function () {
        document.querySelectorAll('.leader-card').forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
    });
});

function startGame() {
    renderStats();
    renderUpgrades();
    renderAbilities();
    renderWorldList();
    refreshGeoStyle();
    updatePerSecondStats();

    let banner = document.getElementById("statsBanner");
    if (currentIso && banner.classList.contains("hidden")) {
        banner.classList.add("active");
        banner.classList.remove("hidden");
    }
    gameActive = true;
}

fetch("./countriesWithPopulation.geo.json").then(r => r.json()).then(data => {
    countriesData = data;
    geojsonLayer = L.geoJSON(data, {
        style: () => ({ color: "#555", weight: 1, fillColor: "#f0f0f0", fillOpacity: 0.2 }),
        onEachFeature: (feat, layer) => {
            layer.on({
                click: onCountryClick,
                mouseover: onCountryMouseOver,
                mouseout: onCountryMouseOut
            });
        }
    }).addTo(map);
    let sel = document.getElementById("register-start-country");
    data.features.forEach(f => {
        let iso = f.id;
        let nm = f.properties.name;
        let opt = document.createElement("option");
        opt.value = iso;
        opt.textContent = nm;
        sel.appendChild(opt);
    });
    logMessage("GeoJSON cargado correctamente.");
    initializeAuth(handleAuthStateChanged);

}).catch(err => {
    addNotification("Error al cargar geojson:" + err.message, "general");
    logMessage("Error al cargar geojson: " + err.message);
});
function handleAuthStateChanged(user) {
    currentUser = user;
    if (user) {
        console.log("Usuario autenticado:", user.uid);
        loadGame(user.uid)
    } else {
        console.log("Usuario no autenticado.");
        document.getElementById('auth-container').classList.remove('hidden');
    }
}

function handleLogout() {
    saveGame();
    logout().then(() => {
        addNotification("Sesión cerrada correctamente.", "general");
        countryStatus = {};
        currentIso = null;
        playerMoney = 100;
        totalArrested = 0;
        policeStars = 0;
        baseMoneyClick = 5;
        totalMoneyUpgrades = 0;
        totalMoneyUpgradesSec = 0;
        totalEsbirrosUpgrades = 0;
        bandName = "";
        leaderName = "";
        leaderImage = "";
        startCountry = "";
        gameActive = false;
        log = [];
        clickMultiplierPercentage = 0;
        esbirrosMultiplierPercentage = 0;
        moneyPerSecond = 0;
        esbirrosPerSecond = 0;
        arrestedPerSecond = 0;
        displayedMoney = playerMoney;
        displayedArrested = totalArrested;
        displayedEsbirros = 0;
        lastArrestIncrement = 0;

        moneyUpgrades.forEach(upgrade => upgrade.times = 0);
        esbirrosUpgrades.forEach(upgrade => upgrade.times = 0);
        policeUpgrades.forEach(upgrade => upgrade.times = 0);
        weaponsUpgrades.forEach(upgrade => upgrade.times = 0);

        document.getElementById('auth-container').classList.remove('hidden');
    }).catch(error => {
        addNotification("Error al cerrar sesión: " + error.message, "general");
        console.error("Error al cerrar sesión:", error);
    });
}

const sidebar = document.getElementById('sidebar');
const logoutButton = document.createElement('button');
logoutButton.classList.add('btn');
logoutButton.id = 'btnLogout';
logoutButton.textContent = 'Cerrar Sesión';
sidebar.appendChild(logoutButton);
logoutButton.addEventListener("click", handleLogout);

renderStats();
renderAbilities();
renderWorldList();

document.querySelectorAll(".tab-button").forEach(btn => {
    btn.addEventListener("click", e => {
        const tabId = e.target.getAttribute("data-tab") || e.target.parentElement.getAttribute("data-tab");
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
        document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
        document.getElementById(tabId).classList.add("active");
        btn.classList.add("active");
        if (tabId === "world") renderWorldList();
    });
});

document.querySelectorAll(".section h3.game-title").forEach(title => {
    title.addEventListener("click", () => {
        title.parentElement.classList.toggle("collapsed");
        const icon = title.querySelector("i.fas");
        if (!icon) return;
        if (icon.classList.contains("fa-chevron-down")) {
            icon.classList.remove("fa-chevron-down");
            icon.classList.add("fa-chevron-up");
        } else {
            icon.classList.remove("fa-chevron-up");
            icon.classList.add("fa-chevron-down");
        }
    });
});

document.querySelector("#country-progress-modal .close-modal-btn").addEventListener("click", () => {
    document.getElementById("country-progress-modal").classList.remove("active");
});

function showNewsPopup(fullNewsText) {
    document.getElementById("popupNewsTitle").innerText = "Última hora";
    document.getElementById("popupNewsDescription").innerText = fullNewsText;
    document.getElementById("newsPopup").classList.remove("hidden");
    document.getElementById("newsOverlay").classList.remove("hidden");
    gameActive = false;
}
function closeNewsPopup() {
    document.getElementById("newsPopup").classList.add("hidden");
    document.getElementById("newsOverlay").classList.add("hidden");
    gameActive = true;
}
document.querySelector(".close-news-btn").addEventListener("click", closeNewsPopup);
document.getElementById("newsOverlay").addEventListener("click", closeNewsPopup);

const toggleButton = document.getElementById("menu-toggle-button");
function setMenuIcon() {
    const icon = toggleButton.querySelector("i");
    const isPortraitMobile = window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
    if (sidebar.classList.contains("active")) {
        if (isPortraitMobile) {
            icon.classList.remove("fa-chevron-left", "fa-chevron-up", "fa-chevron-right");
            icon.classList.add("fa-chevron-down");
        } else {
            icon.classList.remove("fa-chevron-up", "fa-chevron-down", "fa-chevron-right", "fa-chevron-left");
            icon.classList.add("fa-chevron-right");
        }
    } else {
        if (isPortraitMobile) {
            icon.classList.remove("fa-chevron-left", "fa-chevron-down", "fa-chevron-right");
            icon.classList.add("fa-chevron-up");
        } else {
            icon.classList.remove("fa-chevron-up", "fa-chevron-down", "fa-chevron-right", "fa-chevron-left");
            icon.classList.add("fa-chevron-left");
        }
    }
}
toggleButton.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    setMenuIcon();
});

function adjustMenuToggleButton() {
    const isPortraitMobile = window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
    if (isPortraitMobile) {
        toggleButton.style.top = "auto";
        toggleButton.style.bottom = "20px";
        toggleButton.style.left = "50%";
        toggleButton.style.right = "auto";
        toggleButton.style.transform = "translateX(-50%)";
    } else {
        toggleButton.style.bottom = "auto";
        toggleButton.style.top = "50%";
        toggleButton.style.right = "0";
        toggleButton.style.left = "auto";
        toggleButton.style.transform = "translateY(-50%)";
    }
    setMenuIcon();
}
window.addEventListener("load", adjustMenuToggleButton);
window.addEventListener("resize", adjustMenuToggleButton);
window.addEventListener("orientationchange", adjustMenuToggleButton);

setInterval(() => {
    if (!gameActive || !bandName || !countriesData) return;
    if (Math.random() < 0.8) {
        const gameData = {
            bandName: bandName,
            leaderName: leaderName,
            leaderImage: leaderImage,
            startYear: 0,
            currentCountry: currentIso,
            countryStatus: countryStatus,
            policeStars: policeStars,
            money: playerMoney,
            esbirros: countryStatus[currentIso]?.esbirros || 0
        };
        generateNews(gameData).then(news => {
            showNewsPopup(news);
        }).catch(err => {
            addNotification("Error al generar la noticia: " + err.message, "general");
            console.error("Error al generar la noticia:", err);
        });
    }
}, 300000);

setInterval(() => {
    if (!gameActive || !bandName || !countriesData) return;
    let totalEsbirrosNoDominados = 0;
    let updates = [];
    let newArrestsGlobal = 0;
    for (let iso in countryStatus) {
        let st = countryStatus[iso];
        if (st.dominated) continue;
        let oldEsb = st.esbirros;
        let arrests = 0;
        let gain = esbirrosPerSecond / 2;
        if (policeStars > policeResistance) {
            let baseArrestRate = 0.02;
            let arrestMultiplier = policeStars / 5;
            arrests = Math.floor(st.esbirros * baseArrestRate * arrestMultiplier);
        }
        newArrestsGlobal += arrests;
        let newEsb = Math.max(0, oldEsb + gain - arrests);
        if (st.popReal > 0) {
            let ratio = (newEsb * 100) / st.popReal;
            st.control = Math.floor(ratio);
        }
        if (st.control >= 90) {
            st.dominated = true;
            st.control = 100;
            addNotification("¡Has dominado " + st.countryName + "!", "expansion");
            logMessage("Dominado país: " + st.countryName);
            saveGame();
        }
        if (arrests > 0) {
            st.arrestedTotal = (st.arrestedTotal || 0) + arrests;
            totalArrested += arrests;
            logMessage("Arrestados en " + st.countryName + ": " + arrests);
            saveGame();
        }
        st.esbirros = newEsb;
        updates.push({ iso, oldEsb, newEsb });
        if (!st.dominated) totalEsbirrosNoDominados += st.esbirros;
    }
    arrestedPerSecond = newArrestsGlobal * 2;
    updates.forEach(({ iso, oldEsb, newEsb }) => {
        if (iso === currentIso && Math.abs(newEsb - oldEsb) > 0.01) {
            let diff = newEsb - oldEsb;
            createAnimation("bannerEsbirros", Math.abs(diff), diff > 0 ? "esbirros" : "arrested");
        }
    });
    if (totalEsbirrosNoDominados < 1) {
        addNotification("¡GAME OVER! Arrestaron a casi todos tus esbirros en los países no dominados.", "gameResult");
        logMessage("GAME OVER: Casi todos los esbirros arrestados.");
        gameActive = false;
        saveGame();
    }
    updatePerSecondStats();
    playerMoney += moneyPerSecond * 5;
    if (playerMoney > 100000000 && totalEsbirrosUpgrades > 10000000) {
        console.warn("Posible problema con dinero o esbirros: dinero =", playerMoney, ", esbirros =", totalEsbirrosUpgrades);
    }
    renderStats();
    renderAbilities();
    renderWorldList(); 
    refreshGeoStyle();
    if (countriesData && Object.keys(countryStatus).length === countriesData.features.length) {
        let allDominated = Object.values(countryStatus).every(st => st.dominated);
        if (allDominated) {
            addNotification("¡Has dominado el mundo! Fin del juego.", "gameResult");
            logMessage("Juego terminado: Mundo dominado.");
            gameActive = false;
            saveGame();
        }
    }
}, 500);

setInterval(() => {
    let diffMoney = playerMoney - displayedMoney;
    if (Math.abs(diffMoney) > 0.1 && Math.abs(playerMoney) < 1e9) displayedMoney += diffMoney * 0.3;
    else displayedMoney = playerMoney;

    let diffArrested = totalArrested - displayedArrested;
    if (Math.abs(diffArrested) > 0.1) displayedArrested += diffArrested * 0.3;
    else displayedArrested = totalArrested;
    if (currentIso) {
        let st = countryStatus[currentIso];
        if (st) {
            let diffEsb = st.esbirros - displayedEsbirros;
            if (Math.abs(diffEsb) > 0.1) displayedEsbirros += diffEsb * 0.3;
            else displayedEsbirros = st.esbirros;
        }
    }
    document.getElementById("bannerMoney").innerText = "$" + formatNumber(displayedMoney);
    document.getElementById("bannerArrested").innerText = formatNumber(displayedArrested);
    if (currentIso) document.getElementById("bannerEsbirros").innerText = formatNumber(displayedEsbirros);
}, ANIMATION_REFRESH_RATE);

function handleAuthStateChanged(user) {
    currentUser = user;
    if (user) {
        console.log("Usuario autenticado:", user.uid);
        loadGame(user.uid)
    } else {
        console.log("Usuario no autenticado.");
        document.getElementById('auth-container').classList.remove('hidden');
    }
}

fetch("./countriesWithPopulation.geo.json").then(r => r.json()).then(data => {
    countriesData = data;
    geojsonLayer = L.geoJSON(data, {
        style: () => ({ color: "#555", weight: 1, fillColor: "#f0f0f0", fillOpacity: 0.2 }),
        onEachFeature: (feat, layer) => {
            layer.on({
                click: onCountryClick,
                mouseover: onCountryMouseOver,
                mouseout: onCountryMouseOut
            });
        }
    }).addTo(map);
    let sel = document.getElementById("register-start-country");
    data.features.forEach(f => {
        let iso = f.id;
        let nm = f.properties.name;
        let opt = document.createElement("option");
        opt.value = iso;
        opt.textContent = nm;
        sel.appendChild(opt);
    });
    logMessage("GeoJSON cargado correctamente.");
    initializeAuth(handleAuthStateChanged);
}).catch(err => {
    addNotification("Error al cargar geojson:" + err.message, "general");
    logMessage("Error al cargar geojson: " + err.message);
});
