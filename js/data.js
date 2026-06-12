"use strict";

var BUNS = {
  regular: { name: 'לחמנייה' },
  pretzel: { name: 'לחמניית בייגלה' }
};

var SAUSAGES = {
  sausage: { name: 'נקניקייה' },
  vegan:   { name: 'נקניקייה טבעונית' }
};

var TOPPINGS = {
  ketchup:  { name: 'קטשופ' },
  mustard:  { name: 'חרדל' },
  onions:   { name: 'בצל מטוגן' },
  kraut:    { name: 'כרוב כבוש' }
};

var EXTRAS = {
  fries: { name: 'ציפס' },
  soda:  { name: 'שתייה' }
};

var CUSTOMER_TYPES = {
  office: {
    name: 'עובד משרד',
    patience: 22,
    tipMult: 1.0,
    weight: 35,
    maxToppings: 2,
    extraChance: 0.25,
    emoji: '💼'
  },
  tourist: {
    name: 'תייר',
    patience: 26,
    tipMult: 1.6,
    weight: 20,
    maxToppings: 4,
    extraChance: 0.5,
    emoji: '📷'
    // מזמינים קומבינציות יוצאות דופן — תמיד לפחות 2 תוספות, אפשר בייגלה/טבעוני
  },
  child: {
    name: 'ילד',
    patience: 14,
    tipMult: 0.8,
    weight: 20,
    maxToppings: 1,
    extraChance: 0.6,
    emoji: '🧒'
    // הזמנות פשוטות: לחמנייה רגילה + נקניקייה + לכל היותר תוספת אחת, לעתים קרובות ציפס/שתייה
  },
  vip: {
    name: 'VIP',
    patience: 18,
    tipMult: 2.5,
    weight: 15,
    maxToppings: 4,
    extraChance: 0.7,
    emoji: '⭐'
    // דורשני: תמיד 3-4 תוספות, לעתים קרובות לחמניית בייגלה
  },
  critic: {
    name: 'מבקר אוכל',
    patience: 30,
    tipMult: 3.0,
    weight: 5,
    maxToppings: 3,
    extraChance: 0.3,
    emoji: '📝'
    // נדיר; מעניק בונוס גדול לבישול/קלייה מושלמים, עונש גדול אחרת
  }
};

var BALANCE = {
  dayLength: 90,
  baseGoal: 50,
  goalGrowth: 1.25,
  spawnBaseMs: 6500,
  spawnMinMs: 2600,
  spawnDecayPerDay: 450,
  patienceDecayPerDay: 0.06,   // שבריר מהירות דעיכת סבלנות לכל יום
  grillTime: 6,                 // שניות מגלם לבישול מושלם
  burnTime: 11,                 // שניות מגלם לשריפה; החלון הטוב הוא 6-11 (6-8 = מושלם)
  toastTime: 3.5,
  toastPerfectWindow: [3.5, 5.5],
  toastBurnTime: 7,
  restockTime: 3,
  stockMax: 8,
  scoreServe: 10,
  scorePerfectCook: 5,
  scorePerfectToast: 5,
  comboMax: 5,
  coinBase: 8,
  coinPerTopping: 2,
  coinExtra: 4,
  speedBonusCoins: 5,
  rushHourLen: 20,
  rushFromDay: 3
};
