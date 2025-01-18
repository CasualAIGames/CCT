// upgrades.js

// Operaciones de Dinero (Inversiones)
export const moneyUpgrades = [
  {
    id: "u-prestar-dinero",
    name: "Prestar Dinero",
    desc: "Obtén ingresos prestando dinero con intereses usureros.",
    baseCost: 50,
    effectMoney: 1,      // +1 al click
    effectMoneySec: 0.2, // +0.2$/seg
    rank: 1,
    times: 0,
    image: "images/money-prestar-dinero.png" // Ruta de la imagen
  },
  {
    id: "u-punto-de-droga",
    name: "Punto de Venta de Droga",
    desc: "Expande la red vendiendo mercancía ilegal.",
    baseCost: 200,
    effectMoney: 2,      // +2 al click
    effectMoneySec: 1,   // +1$/seg
    rank: 2,
    times: 0,
    image: "images/money-punto-venta-droga.png"
  },
  {
    id: "u-lavado-dinero",
    name: "Local de Lavado de Dinero",
    desc: "Blanquea grandes sumas de efectivo sin dejar rastro.",
    baseCost: 800,
    effectMoney: 5,      // +5 al click
    effectMoneySec: 3,   // +3$/seg
    rank: 3,
    times: 0,
    image: "images/money-lavado-dinero.png"
  },
  {
    id: "u-banco-sombrio",
    name: "Banco Sombrío",
    desc: "Institución financiera clandestina para movimientos masivos.",
    baseCost: 3000,
    effectMoney: 10,
    effectMoneySec: 10,
    rank: 4,
    times: 0,
    image: "images/money-banco-sombrio.png"
  },
  {
    id: "u-empresa-financiera",
    name: "Empresa Financiera Clandestina",
    desc: "Gestiona inversiones complejas para maximizar tus ingresos.",
    baseCost: 10000,
    effectMoney: 25,
    effectMoneySec: 25,
    rank: 5,
    times: 0,
    image: "images/money-empresa-financiera.png"
  }
];

// Operaciones de Esbirros (Inversiones)
export const esbirrosUpgrades = [
  {
    id: "u-boca-a-boca",
    name: "Boca a Boca",
    desc: "Tu banda se hace conocida con el rumor callejero.",
    baseCost: 100,
    effectEsb: 1,  // +1 esbirro/tick
    rank: 1,
    times: 0,
    image: "images/esbirros-boca-a-boca.png"
  },
  {
    id: "u-recluta-bares",
    name: "Reclutamiento en Bares",
    desc: "Convences a matones locales para unirse a la banda.",
    baseCost: 400,
    effectEsb: 3,
    rank: 2,
    times: 0,
    image: "images/esbirros-reclutamiento-bares.png"
  },
  {
    id: "u-redes-sociales",
    name: "Difusión en Redes Sociales",
    desc: "Usas la propaganda online para encontrar más reclutas.",
    baseCost: 1500,
    effectEsb: 10,
    rank: 3,
    times: 0,
    image: "images/esbirros-difusion-redes-sociales.png"
  },
  {
    id: "u-gimnasio-clandestino",
    name: "Gimnasio Clandestino",
    desc: "Entrena a tus esbirros para mejorar su efectividad.",
    baseCost: 5000,
    effectEsb: 25,
    rank: 4,
    times: 0,
    image: "images/esbirros-gimnasio-clandestino.png"
  },
  {
    id: "u-laboratorio-biologico",
    name: "Laboratorio Biológico",
    desc: "Desarrolla mejoras genéticas para tus esbirros.",
    baseCost: 20000,
    effectEsb: 60,
    rank: 5,
    times: 0,
    image: "images/esbirros-laboratorio-biologico.png"
  }
];

// Operaciones Anti-Policía (Mejoras)
export const policeUpgrades = [
  {
    id: "policia-soborno-menor",
    name: "Soborno Menor",
    desc: "Paga a la policía local para que mire hacia otro lado.",
    baseCost: 300,
    effectPolice: -1,
    rank: 1,
    times: 0,
    image: "images/policia-soborno-menor.png"
  },
  {
    id: "policia-contactos-altos",
    name: "Contactos en Altas Esferas",
    desc: "Establece relaciones con políticos y mandos policiales.",
    baseCost: 1200,
    effectPolice: -2,
    rank: 2,
    times: 0,
    image: "images/policia-contactos-altos.png"
  },
  {
    id: "policia-provocar-revuelo",
    name: "Provocar Revuelo",
    desc: "Tus acciones violentas generan más atención policial.",
    baseCost: 500,
    effectPolice: 1, // Sube 1 estrella
    rank: 3,
    times: 0,
    image: "images/policia-provocar-revuelo.png"
  }
];

// Mejoras (Habilidades)
export const weaponsUpgrades = [
  // Económicas
  {
    id: "economic-boost-1",
    name: "Contabilidad Creativa",
    desc: "Mejora tus artimañas financieras: +5% al dinero por click.",
    baseCost: 250,
    effect: 0.05,
    rank: 1,
    times: 0,
    type: "economic",
    image: "images/weapons-contabilidad-creativa.png"
  },
  {
    id: "economic-boost-2",
    name: "Comercio Turbio",
    desc: "Aumenta tus artimañas financieras: +10% al dinero por click.",
    baseCost: 1000,
    effect: 0.10,
    rank: 2,
    times: 0,
    type: "economic",
    image: "images/weapons-comercio-turbio.png"
  },
  {
    id: "economic-boost-3",
    name: "Mercado Negro",
    desc: "Expande tu comercio ilegal: +15% al dinero por click.",
    baseCost: 4000,
    effect: 0.15,
    rank: 3,
    times: 0,
    type: "economic",
    image: "images/weapons-mercado-negro.png"
  },
  {
    id: "economic-boost-4",
    name: "Inversiones Avanzadas",
    desc: "Optimiza tus inversiones: +20% al dinero por click.",
    baseCost: 8000,
    effect: 0.20,
    rank: 4,
    times: 0,
    type: "economic",
    image: "images/weapons-inversiones-avanzadas.png"
  },
  {
    id: "economic-boost-5",
    name: "Finanzas Clandestinas",
    desc: "Control total de tus finanzas: +25% al dinero por click.",
    baseCost: 15000,
    effect: 0.25,
    rank: 5,
    times: 0,
    type: "economic",
    image: "images/weapons-finanzas-clandestinas.png"
  },

  // Sociales
  {
    id: "social-influence-1",
    name: "Influencers Marginales",
    desc: "Genera propaganda a bajo coste.",
    baseCost: 600,
    effect: 0.02,
    rank: 1,
    times: 0,
    type: "social",
    image: "images/weapons-influencers-marginales.png"
  },
  {
    id: "social-influence-2",
    name: "Corrupción de Medios",
    desc: "Medios de comunicación a tu favor.",
    baseCost: 2000,
    effect: 0.05,
    rank: 2,
    times: 0,
    type: "social",
    image: "images/weapons-corrupcion-medios.png"
  },
  {
    id: "social-influence-3",
    name: "Propaganda Masiva",
    desc: "Amplifica tu mensaje: +8% efectividad social.",
    baseCost: 6000,
    effect: 0.08,
    rank: 3,
    times: 0,
    type: "social",
    image: "images/weapons-propaganda-masiva.png"
  },
  {
    id: "social-influence-4",
    name: "Redes de Influencia",
    desc: "Establece conexiones poderosas: +12% efectividad social.",
    baseCost: 12000,
    effect: 0.12,
    rank: 4,
    times: 0,
    type: "social",
    image: "images/weapons-redes-influencia.png"
  },
  {
    id: "social-influence-5",
    name: "Control Total de Medios",
    desc: "Manipula la opinión pública: +15% efectividad social.",
    baseCost: 25000,
    effect: 0.15,
    rank: 5,
    times: 0,
    type: "social",
    image: "images/weapons-control-total-medios.png"
  },

  // Militares
  {
    id: "military-boost-1",
    name: "Armas Caseras",
    desc: "Los esbirros obtienen +5% de efectividad.",
    baseCost: 500,
    effect: 0.05,
    rank: 1,
    times: 0,
    type: "military",
    image: "images/weapons-armas-caseras.png"
  },
  {
    id: "military-boost-2",
    name: "Soldados Mercenarios",
    desc: "Contratas personal mejor entrenado: +10% esbirros/seg.",
    baseCost: 2500,
    effect: 0.10,
    rank: 2,
    times: 0,
    type: "military",
    image: "images/weapons-soldados-mercenarios.png"
  },
  {
    id: "military-boost-3",
    name: "Tecnología Avanzada",
    desc: "Mejora el equipamiento: +15% efectividad militar.",
    baseCost: 7000,
    effect: 0.15,
    rank: 3,
    times: 0,
    type: "military",
    image: "images/weapons-tecnologia-avanzada.png"
  },
  {
    id: "military-boost-4",
    name: "Entrenamiento Elite",
    desc: "Entrena a tus esbirros al máximo: +20% esbirros/seg.",
    baseCost: 14000,
    effect: 0.20,
    rank: 4,
    times: 0,
    type: "military",
    image: "images/weapons-entrenamiento-elite.png"
  },
  {
    id: "military-boost-5",
    name: "Armamento Definitivo",
    desc: "Armas de última generación: +25% efectividad militar.",
    baseCost: 30000,
    effect: 0.25,
    rank: 5,
    times: 0,
    type: "military",
    image: "images/weapons-armamento-definitivo.png"
  }
];
