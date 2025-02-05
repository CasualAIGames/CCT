// utils.js
import { SLIDEOUT_ANIMATION_DURATION, ANIMATION_DURATION, NOTIFICATION_DURATION, CENTER_POPUP_DURATION } from "./config.js"

export function formatNumber(num) {
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

export function removeNotificationElement(nd, cont){
  nd.classList.add("slideOutNotification")
  setTimeout(() => {
    if(cont.contains(nd)){
      cont.removeChild(nd)
    }
  }, SLIDEOUT_ANIMATION_DURATION)
}

export function createNotificationCloseButton(div, cont){
  const c = document.createElement("span")
  c.classList.add("close-btn")
  c.innerText = "X"
  c.onclick = () => removeNotificationElement(div, cont)
  return c
}

export function createNotificationElement(msg, type, cont, countryName = null){
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
  }
  const cl = createNotificationCloseButton(d, cont)
  d.appendChild(cl)
  const t = document.createElement("div")
  t.classList.add("notification-text")
  t.innerHTML = icon + msg + (countryName ? ` ${countryName}!` : "")
  d.appendChild(t)
  cont.appendChild(d)
  return d
}

export function addNotification(msg, type="general", countryName=null, notificationContainer, statsBanner, gameState, NOT_ENOUGH_MONEY_COOLDOWN, conqueredCountriesNotification, removeNotificationElement, createNotificationElement){
  const now = Date.now()
  if(type === "notEnoughMoney" && now - gameState.lastNotEnoughMoneyNotification < NOT_ENOUGH_MONEY_COOLDOWN) return
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

export function createAnimation(el, val, t){
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

export function createCenterPopupAnimation(txt, t){
  const c = document.createElement("div")
  c.classList.add("center-popup-animation")
  c.textContent = txt
  c.style.color = (t==="money"||t==="esbirros") ? "green" : "#ff0000"
  c.style.fontFamily = "Pricedown"
  c.style.fontSize = "2em"
  document.body.appendChild(c)
  requestAnimationFrame(() => {
    c.style.opacity = 1
    c.style.transform = "translateY(0)"
  })
  setTimeout(() => {
    if(document.body.contains(c)){
      c.style.opacity = 0
      c.style.transform = "translateY(-20px)"
      setTimeout(() => {
        document.body.removeChild(c)
      }, 300)
    }
  }, CENTER_POPUP_DURATION)
}

export function updateHeatUI(){}

export function recalcPoliceStarsFromValue(stars, gameState, updatePoliceNotification){
  gameState.policeStars = Math.min(5, Math.max(0, stars))
  updatePoliceNotification(gameState, createNotificationElement, removeNotificationElement, NOTIFICATION_DURATION, notificationContainer)
}

export function updatePoliceNotification(gameState, createNotificationElement, removeNotificationElement, NOTIFICATION_DURATION, notificationContainer){
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