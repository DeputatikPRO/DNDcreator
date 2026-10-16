/**
 * DNDcreator — База данных классов D&D 5e (Все 13 классов)
 * Автор: Deputatik
 */

window.DND_CLASSES = [
  {
    id: "fighter",
    name: "Воин",
    hitDie: 10,
    primaryAbility: "str", // or dex
    savingThrows: ["str", "con"],
    armorProficiencies: "Все доспехи, щиты",
    weaponProficiencies: "Простое и воинское оружие",
    desc: "Мастер непревзойдённого боевого искусства, владеющий любым оружием и доспехом на поле брани.",
    dndsuLink: "https://dnd.su/class/83-fighter/",
    features: [
      { name: "Второе дыхание", desc: "Бонусным действием восстановите 1d10 + уровень воина хитов (1 раз за отдых)." },
      { name: "Стиль боя", desc: "Специализация в выбранном стиле (например, Защита даёт +1 к Классу Доспеха)." }
    ]
  },
  {
    id: "barbarian",
    name: "Варвар",
    hitDie: 12,
    primaryAbility: "str",
    savingThrows: ["str", "con"],
    armorProficiencies: "Лёгкие, средние доспехи, щиты",
    weaponProficiencies: "Простое и воинское оружие",
    desc: "Свирепый воин первобытных пустошей, черпающий неукротимую мощь в разрушительной ярости битвы.",
    dndsuLink: "https://dnd.su/class/86-barbarian/",
    features: [
      { name: "Ярость", desc: "+2 к урону оружием Силы, сопротивление дробящему, колющему и рубящему урону." },
      { name: "Защита без доспехов", desc: "КД = 10 + мод. Ловкости + мод. Телосложения при отсутствии брони." }
    ]
  },
  {
    id: "paladin",
    name: "Паладин",
    hitDie: 10,
    primaryAbility: "str",
    savingThrows: ["wis", "cha"],
    armorProficiencies: "Все доспехи, щиты",
    weaponProficiencies: "Простое и воинское оружие",
    desc: "Святой рыцарь, связанный нерушимой клятвой чести и карающий зло божественной силой.",
    dndsuLink: "https://dnd.su/class/87-paladin/",
    features: [
      { name: "Божественное чувство", desc: "Ощущайте присутствие исчадий, небожителей и нежити в радиусе 60 футов." },
      { name: "Наложение рук", desc: "Пул целительной святой энергии, равный 5 × уровень паладина." }
    ]
  },
  {
    id: "rogue",
    name: "Плут",
    hitDie: 8,
    primaryAbility: "dex",
    savingThrows: ["dex", "int"],
    armorProficiencies: "Лёгкие доспехи",
    weaponProficiencies: "Простое оружие, ручные арбалеты, длинные мечи, рапиры, короткие мечи",
    desc: "Неуловимый теневой боец, специалист по взлому, скрытным проникновениям и смертоносным ударам исподтишка.",
    dndsuLink: "https://dnd.su/class/84-rogue/",
    features: [
      { name: "Скрытая атака", desc: "Дополнительные 1d6 урона по существу при преимуществе или союзнике рядом." },
      { name: "Воровской жаргон", desc: "Тайный диалект и условные знаки криминального подполья." },
      { name: "Компетентность", desc: "Удвоенный бонус мастерства к двум выбранным навыкам или воровским инструментам." }
    ]
  },
  {
    id: "wizard",
    name: "Волшебник",
    hitDie: 6,
    primaryAbility: "int",
    savingThrows: ["int", "wis"],
    armorProficiencies: "Нет",
    weaponProficiencies: "Кинжалы, дротики, пращи, боевые посохи, легкие арбалеты",
    desc: "Учёный заклинатель, годами постигавший законы Плетения и записывающий могущественные формулы в гримуар.",
    dndsuLink: "https://dnd.su/class/85-wizard/",
    features: [
      { name: "Книга заклинаний", desc: "Ваш гримуар содержит тайные свитки, доступные для сотворения и ритуалов." },
      { name: "Магическое восстановление", desc: "На коротком отдыхе восстанавливайте потраченные ячейки заклинаний." }
    ]
  },
  {
    id: "cleric",
    name: "Жрец",
    hitDie: 8,
    primaryAbility: "wis",
    savingThrows: ["wis", "cha"],
    armorProficiencies: "Лёгкие и средние доспехи, щиты",
    weaponProficiencies: "Простое оружие",
    desc: "Помазанник божества, творящий чудеса веры, благословения и исцеления в материальном мире.",
    dndsuLink: "https://dnd.su/class/88-cleric/",
    features: [
      { name: "Божественный домен", desc: "Специализация в аспекте вашего божества (Жизнь, Война, Свет, Буря и др.)." },
      { name: "Использование заклинаний", desc: "Творите сакральные молитвы благодаря вашей Мудрости." }
    ]
  },
  {
    id: "bard",
    name: "Бард",
    hitDie: 8,
    primaryAbility: "cha",
    savingThrows: ["dex", "cha"],
    armorProficiencies: "Лёгкие доспехи",
    weaponProficiencies: "Простое оружие, ручные арбалеты, длинные мечи, рапиры, короткие мечи",
    desc: "Творец чарующей музыки и слов силы, вдохновляющий соратников и сплетающий иллюзии.",
    dndsuLink: "https://dnd.su/class/89-bard/",
    features: [
      { name: "Вдохновение барда", desc: "Бонусным действием даруйте союзнику кость вдохновения 1d6 к проверке или атаке." },
      { name: "Использование заклинаний", desc: "Сотворение заклинаний посредством силы музыки и Харизмы." }
    ]
  },
  {
    id: "druid",
    name: "Друид",
    hitDie: 8,
    primaryAbility: "wis",
    savingThrows: ["int", "wis"],
    armorProficiencies: "Лёгкие и средние доспехи (неметаллические), щиты",
    weaponProficiencies: "Дубинки, кинжалы, дротики, копья, боевые посохи, серпы",
    desc: "Служитель Древнего Равновесия, повелевающий стихиями природы и принимающий облик свирепых зверей.",
    dndsuLink: "https://dnd.su/class/90-druid/",
    features: [
      { name: "Друидический язык", desc: "Тайный язык хранителей природы с защитой от расшифровки чужаками." },
      { name: "Природные заклинания", desc: "Сотворение заклинаний школы природы и стихий." }
    ]
  },
  {
    id: "monk",
    name: "Монах",
    hitDie: 8,
    primaryAbility: "dex",
    savingThrows: ["str", "dex"],
    armorProficiencies: "Нет",
    weaponProficiencies: "Простое оружие, короткие мечи",
    desc: "Мастер духовной энергии Ци, превращающий собственное тело в идеальное смертоносное оружие.",
    dndsuLink: "https://dnd.su/class/91-monk/",
    features: [
      { name: "Защита без доспехов", desc: "КД = 10 + мод. Ловкости + мод. Мудрости без ношения брони." },
      { name: "Боевые искусства", desc: "Атаки кулаками 1d4 урона и дополнительный бонусный удар без оружия." }
    ]
  },
  {
    id: "ranger",
    name: "Следопыт",
    hitDie: 10,
    primaryAbility: "dex",
    savingThrows: ["str", "dex"],
    armorProficiencies: "Лёгкие и средние доспехи, щиты",
    weaponProficiencies: "Простое и воинское оружие",
    desc: "Опытный охотник фронтира, непревзойдённый стрелок и выслеживатель опасных чудовищ.",
    dndsuLink: "https://dnd.su/class/92-ranger/",
    features: [
      { name: "Заклятый враг", desc: "Преимущество на выслеживание и знание языка определенного типа существ." },
      { name: "Исследователь природы", desc: "Эксперт по передвижению и выживанию на избранной местности." }
    ]
  },
  {
    id: "sorcerer",
    name: "Чародей",
    hitDie: 6,
    primaryAbility: "cha",
    savingThrows: ["con", "cha"],
    armorProficiencies: "Нет",
    weaponProficiencies: "Кинжалы, дротики, пращи, боевые посохи, легкие арбалеты",
    desc: "Носитель врождённой магии драконов или дикого хаоса, чья кровь пульсирует чистой энергией.",
    dndsuLink: "https://dnd.su/class/93-sorcerer/",
    features: [
      { name: "Происхождение чар", desc: "Магическое наследие (Драконья кровь или Дикая магия)." },
      { name: "Использование заклинаний", desc: "Интуитивное сотворение заклинаний силой Харизмы." }
    ]
  },
  {
    id: "warlock",
    name: "Колдун",
    hitDie: 8,
    primaryAbility: "cha",
    savingThrows: ["wis", "cha"],
    armorProficiencies: "Лёгкие доспехи",
    weaponProficiencies: "Простое оружие",
    desc: "Искатель запретных знаний, заключивший пакт со сверхъестественным покровителем из иных миров.",
    dndsuLink: "https://dnd.su/class/94-warlock/",
    features: [
      { name: "Иномировой покровитель", desc: "Договор с Архифеей, Исчадием или Великим Древним." },
      { name: "Магия договора", desc: "Немногочисленные, но всегда сотворяемые на максимальном круге ячейки." }
    ]
  },
  {
    id: "artificer",
    name: "Изобретатель",
    hitDie: 8,
    primaryAbility: "int",
    savingThrows: ["con", "int"],
    armorProficiencies: "Лёгкие и средние доспехи, щиты",
    weaponProficiencies: "Простое оружие",
    desc: "Инженер-артефактор, наделяющий обычные вещи могущественными магическими свойствами.",
    dndsuLink: "https://dnd.su/class/95-artificer/",
    features: [
      { name: "Магическое ремесло", desc: "Превращение предметов в магические устройства с источником света и звука." },
      { name: "Использование заклинаний", desc: "Сотворение заклинаний с помощью наборов инструментов." }
    ]
  }
];

window.DND_SKILLS = [
  { id: "athletics", name: "Атлетика", ability: "str" },
  { id: "acrobatics", name: "Акробатика", ability: "dex" },
  { id: "sleight_of_hand", name: "Ловкость рук", ability: "dex" },
  { id: "stealth", name: "Скрытность", ability: "dex" },
  { id: "arcana", name: "Магия", ability: "int" },
  { id: "history", name: "История", ability: "int" },
  { id: "investigation", name: "Анализ", ability: "int" },
  { id: "nature", name: "Природа", ability: "int" },
  { id: "religion", name: "Религия", ability: "int" },
  { id: "animal_handling", name: "Уход за животными", ability: "wis" },
  { id: "insight", name: "Проницательность", ability: "wis" },
  { id: "medicine", name: "Медицина", ability: "wis" },
  { id: "perception", name: "Внимательность", ability: "wis" },
  { id: "survival", name: "Выживание", ability: "wis" },
  { id: "deception", name: "Обман", ability: "cha" },
  { id: "intimidation", name: "Запугивание", ability: "cha" },
  { id: "performance", name: "Выступление", ability: "cha" },
  { id: "persuasion", name: "Убеждение", ability: "cha" }
];
