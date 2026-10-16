const APP_VERSION = "v1.0.0"; // Единая строка версии

/**
 * DNDcreator — Основной модуль приложения
 * Автор: Deputatik
 */

(function () {
  "use strict";

  // --- Глобальное состояние персонажа ---
  const state = {
    currentStep: 1,
    name: "",
    race: null,
    subrace: null,
    classData: null,
    fightingStyle: "defense",
    hasRolledStats: false,
    rolledPool: [], // 6 чисел 1..20
    assignedStats: {
      str: null,
      dex: null,
      con: null,
      int: null,
      wis: null,
      cha: null
    },
    adminMode: false,
    adminInfiniteRolls: false,
    adminCustomScores: null,
    adminProfBonus: null,
    adminCustomHp: null,
    background: "soldier",
    alignment: "TN",
    selectedSkills: new Set(["athletics", "intimidation"]),
    armor: "chain_mail",
    shield: true,
    mainWeapon: "battleaxe_double",
    elementalRes: "lightning",
    namesList: []
  };

  // --- Хеш мастер-пароля (SHA-256 солированно) ---
  const ADMIN_SALT = "dnd_deputatik_salt_";
  const ADMIN_HASH = "46d88ec3f5739337c1e9f5d6bc67965ff88da510fd60f84c80ab36b9182c0801";

  // --- Инициализация при загрузке DOM ---
  document.addEventListener("DOMContentLoaded", () => {
    initVersion();
    initCanvas();
    loadNamesDatabase();
    initNavigation();
    initRaces();
    initClasses();
    initStatsArena();
    initSkillsAndBackground();
    initGearAndCombat();
    initExportAndCopy();
    initAdminSystem();
    updateLivePreview();
  });

  // --- 1. Версия в шапке ---
  function initVersion() {
    const el = document.getElementById("header-version");
    if (el) el.textContent = APP_VERSION;
  }

  // --- 2. Фон: Магические парящие частицы (Canvas) ---
  function initCanvas() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(40, Math.floor(width / 35));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2 + 0.8,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.6 - 0.2,
        alpha: Math.random() * 0.6 + 0.2,
        color: Math.random() > 0.4 ? "212, 175, 55" : "56, 189, 248"
      });
    }

    function render() {
      ctx.clearRect(0, 0, width, height);
      for (let p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${p.color}, 0.8)`;
        ctx.fill();
      }
      requestAnimationFrame(render);
    }
    render();
  }

  // --- 3. База имён (name.txt) & Рулетка ---
  function loadNamesDatabase() {
    const countEl = document.getElementById("names-loaded-count");
    const listEl = document.getElementById("name-suggestions-box");
    const nameInput = document.getElementById("char-name-input");
    const randomBtn = document.getElementById("btn-random-name");

    fetch("./name.txt")
      .then((res) => {
        if (!res.ok) throw new Error("Не удалось загрузить name.txt");
        return res.text();
      })
      .then((data) => {
        state.namesList = data
          .split(",")
          .map((n) => n.trim())
          .filter((n) => n.length > 0);

        if (countEl) countEl.textContent = `Доступно ${state.namesList.length} имён`;
        renderNameChips(state.namesList.slice(0, 35));
      })
      .catch((err) => {
        console.warn("Ошибка загрузки name.txt:", err);
        if (countEl) countEl.textContent = "Ошибка загрузки name.txt";
      });

    // Реактивный ввод имени
    nameInput.addEventListener("input", (e) => {
      state.name = e.target.value.trim();
      updateLivePreview(["name"]);
    });

    // Рулетка случайного имени
    randomBtn.addEventListener("click", () => {
      if (!state.namesList.length) return;
      randomBtn.disabled = true;
      randomBtn.classList.add("roulette-spinning");

      let counter = 0;
      const totalCycles = 15;
      const interval = setInterval(() => {
        const randName = state.namesList[Math.floor(Math.random() * state.namesList.length)];
        nameInput.value = randName;
        state.name = randName;
        counter++;

        if (counter >= totalCycles) {
          clearInterval(interval);
          randomBtn.disabled = false;
          randomBtn.classList.remove("roulette-spinning");
          updateLivePreview(["name"]);
        }
      }, 70);
    });
  }

  function renderNameChips(names) {
    const box = document.getElementById("name-suggestions-box");
    if (!box) return;
    box.innerHTML = "";
    names.forEach((name) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "name-chip";
      chip.textContent = name;
      chip.addEventListener("click", () => {
        const input = document.getElementById("char-name-input");
        input.value = name;
        state.name = name;
        updateLivePreview(["name"]);
      });
      box.appendChild(chip);
    });
  }

  // --- 4. Навигация по 7 шагам ---
  function initNavigation() {
    const tabs = document.querySelectorAll(".step-tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const step = parseInt(tab.dataset.step, 10);
        goToStep(step);
      });
    });

    document.querySelectorAll("[data-next-step]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = parseInt(btn.dataset.nextStep, 10);
        goToStep(next);
      });
    });

    document.querySelectorAll("[data-prev-step]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const prev = parseInt(btn.dataset.prevStep, 10);
        goToStep(prev);
      });
    });
  }

  function goToStep(step) {
    if (step < 1 || step > 7) return;
    state.currentStep = step;

    // Переключение секций
    document.querySelectorAll(".step-section").forEach((sec) => sec.classList.remove("active"));
    const targetSec = document.getElementById(`step-${step}`);
    if (targetSec) targetSec.classList.add("active");

    // Переключение табов
    document.querySelectorAll(".step-tab").forEach((tab) => {
      tab.classList.toggle("active", parseInt(tab.dataset.step, 10) === step);
    });

    // Прогресс бар
    const percent = Math.round((step / 7) * 100);
    const fill = document.getElementById("progress-fill-bar");
    const percentText = document.getElementById("progress-percent-text");
    const stepText = document.getElementById("progress-step-text");

    if (fill) fill.style.width = `${percent}%`;
    if (percentText) percentText.textContent = `${percent}%`;

    const stepNames = [
      "Имя персонажа",
      "Раса и наследие",
      "Класс и стиль боя",
      "Кубики 1d20",
      "Предыстория",
      "Снаряжение & Бой",
      "Экспорт"
    ];
    if (stepText) stepText.textContent = `Шаг ${step} из 7: ${stepNames[step - 1]}`;

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // --- 5. Модуль рас (DND_RACES) ---
  function initRaces() {
    const container = document.getElementById("races-cards-container");
    const searchInput = document.getElementById("race-search-input");
    const races = window.DND_RACES || [];

    function renderCards(filterText = "") {
      container.innerHTML = "";
      const lower = filterText.toLowerCase();
      const filtered = races.filter((r) => r.name.toLowerCase().includes(lower) || r.desc.toLowerCase().includes(lower));

      filtered.forEach((race) => {
        const card = document.createElement("div");
        card.className = "selection-card";
        if (state.race && state.race.id === race.id) card.classList.add("selected");

        const bonusStr = Object.entries(race.abilityBonuses || {})
          .map(([k, v]) => `${k.toUpperCase()} +${v}`)
          .join(", ");

        card.innerHTML = `
          <div>
            <div class="card-title">${race.name}</div>
            <div style="font-size:0.75rem; color:var(--text-muted); line-height:1.3;">
              ${race.desc.slice(0, 75)}...
            </div>
          </div>
          <div class="card-tags">
            <span class="tag-badge stat">${bonusStr || "Гибкие бонусы"}</span>
            <span class="tag-badge">Скор: ${race.speed} фт.</span>
            <span class="tag-badge">${race.size}</span>
          </div>
        `;

        card.addEventListener("click", () => {
          selectRace(race);
          renderCards(searchInput.value);
        });

        container.appendChild(card);
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        renderCards(e.target.value);
      });
    }

    renderCards();

    // По умолчанию выберем Драконорождённого (как на изображении анкеты)
    const defaultRace = races.find((r) => r.id === "dragonborn") || races[0];
    if (defaultRace) selectRace(defaultRace);
  }

  function selectRace(race) {
    state.race = race;
    const panel = document.getElementById("race-detail-panel");
    const nameEl = document.getElementById("race-detail-name");
    const basicsEl = document.getElementById("race-detail-basics");
    const descEl = document.getElementById("race-detail-desc");
    const linkEl = document.getElementById("race-dndsu-link");
    const traitsCont = document.getElementById("race-traits-container");
    const subraceGroup = document.getElementById("race-subrace-group");
    const subraceSelect = document.getElementById("race-subrace-select");

    panel.style.display = "block";
    nameEl.textContent = race.name;
    basicsEl.textContent = `Размер: ${race.size} | Скорость: ${race.speed} фт. | Бонусы: ${formatBonuses(race.abilityBonuses)}`;
    descEl.textContent = race.desc;
    linkEl.href = race.dndsuLink;

    // Подрасы / Драконье наследие
    if (race.subraces && race.subraces.length > 0) {
      subraceGroup.style.display = "block";
      subraceSelect.innerHTML = "";
      race.subraces.forEach((sub) => {
        const opt = document.createElement("option");
        opt.value = sub.id;
        opt.textContent = sub.name;
        subraceSelect.appendChild(opt);
      });
      state.subrace = race.subraces[0];
      if (state.subrace.resistance) {
        state.elementalRes = state.subrace.resistance.toLowerCase() === "электричество" ? "lightning" : "fire";
      }

      subraceSelect.onchange = (e) => {
        const found = race.subraces.find((s) => s.id === e.target.value);
        if (found) {
          state.subrace = found;
          if (found.resistance) {
            const resSelect = document.getElementById("gear-elemental-res-select");
            if (resSelect) {
              const resMap = { "Электричество": "lightning", "Огонь": "fire", "Холод": "cold", "Яд": "poison", "Кислота": "acid" };
              if (resMap[found.resistance]) resSelect.value = resMap[found.resistance];
            }
          }
          updateLivePreview(["resistance"]);
        }
      };
    } else {
      subraceGroup.style.display = "none";
      state.subrace = null;
    }

    // Трейты
    traitsCont.innerHTML = "";
    (race.traits || []).forEach((t) => {
      const b = document.createElement("div");
      b.className = "trait-box";
      b.innerHTML = `<h4>${t.name}</h4><p>${t.desc}</p>`;
      traitsCont.appendChild(b);
    });

    updateStatsAssignmentUI();
    updateLivePreview(["race", "speed", "resistance"]);
  }

  function formatBonuses(b) {
    if (!b) return "нет";
    const dict = { str: "СИЛ", dex: "ЛОВ", con: "ТЕЛ", int: "ИНТ", wis: "МУД", cha: "ХАР" };
    return Object.entries(b)
      .map(([k, v]) => `${dict[k] || k} +${v}`)
      .join(", ");
  }

  // --- 6. Модуль классов (DND_CLASSES) & Стиль боя ---
  function initClasses() {
    const container = document.getElementById("classes-cards-container");
    const classes = window.DND_CLASSES || [];

    classes.forEach((cls) => {
      const card = document.createElement("div");
      card.className = "selection-card";
      if (state.classData && state.classData.id === cls.id) card.classList.add("selected");

      card.innerHTML = `
        <div>
          <div class="card-title">${cls.name}</div>
          <div style="font-size:0.75rem; color:var(--text-muted); line-height:1.3;">
            ${cls.desc.slice(0, 75)}...
          </div>
        </div>
        <div class="card-tags">
          <span class="tag-badge stat">Кость: 1d${cls.hitDie}</span>
          <span class="tag-badge">Ключевая: ${formatAbility(cls.primaryAbility)}</span>
        </div>
      `;

      card.addEventListener("click", () => {
        selectClass(cls);
        document.querySelectorAll("#classes-cards-container .selection-card").forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
      });

      container.appendChild(card);
    });

    // По умолчанию Воин (как на прикрепленном изображении)
    const defaultClass = classes.find((c) => c.id === "fighter") || classes[0];
    if (defaultClass) selectClass(defaultClass);

    // Стиль боя
    const styleSelect = document.getElementById("fighting-style-select");
    if (styleSelect) {
      styleSelect.addEventListener("change", (e) => {
        state.fightingStyle = e.target.value;
        updateLivePreview(["fightingStyle", "ac"]);
      });
    }
  }

  function selectClass(cls) {
    state.classData = cls;
    const panel = document.getElementById("class-detail-panel");
    const nameEl = document.getElementById("class-detail-name");
    const basicsEl = document.getElementById("class-detail-basics");
    const descEl = document.getElementById("class-detail-desc");
    const linkEl = document.getElementById("class-dndsu-link");
    const featuresCont = document.getElementById("class-features-container");

    panel.style.display = "block";
    nameEl.textContent = cls.name;
    basicsEl.textContent = `Кость хитов: 1d${cls.hitDie} | Ключевая хар-ка: ${formatAbility(cls.primaryAbility)} | Спасброски: ${cls.savingThrows.map(formatAbility).join(", ")}`;
    descEl.textContent = cls.desc;
    linkEl.href = cls.dndsuLink;

    featuresCont.innerHTML = "";
    (cls.features || []).forEach((f) => {
      const b = document.createElement("div");
      b.className = "trait-box";
      b.innerHTML = `<h4>${f.name}</h4><p>${f.desc}</p>`;
      featuresCont.appendChild(b);
    });

    updateStatsAssignmentUI();
    updateLivePreview(["class", "hp", "ac"]);
  }

  function formatAbility(a) {
    const map = { str: "Сила", dex: "Ловкость", con: "Телосложение", int: "Интеллект", wis: "Мудрость", cha: "Харизма" };
    return map[a] || a;
  }

  // --- 7. Бросок 1d20 и Арена характеристик ---
  function initStatsArena() {
    const rollBtn = document.getElementById("btn-roll-stats");

    rollBtn.addEventListener("click", () => {
      if (state.hasRolledStats && !state.adminInfiniteRolls && !state.adminMode) {
        return;
      }
      performDiceRollAnimation();
    });

    renderStatsAssignmentSlots();
  }

  function performDiceRollAnimation() {
    const rollBtn = document.getElementById("btn-roll-stats");
    const statusText = document.getElementById("dice-roll-status");
    const diceBoxes = document.querySelectorAll(".d20-box");

    rollBtn.disabled = true;
    statusText.innerHTML = "🎲 <em>Бросаем кубики 1d20...</em>";

    // Сбрасываем старые состояния
    diceBoxes.forEach((box) => {
      box.className = "d20-box is-rolling";
    });

    let iterations = 0;
    const maxIterations = 14;

    const rollInterval = setInterval(() => {
      iterations++;
      diceBoxes.forEach((box) => {
        const tempVal = Math.floor(Math.random() * 20) + 1;
        const numSpan = box.querySelector(".d20-number");
        if (numSpan) numSpan.textContent = tempVal;
      });

      if (iterations >= maxIterations) {
        clearInterval(rollInterval);
        finishDiceRoll();
      }
    }, 75);

    function finishDiceRoll() {
      // Генерируем 6 финальных значений (1..20)
      state.rolledPool = [];
      for (let i = 0; i < 6; i++) {
        state.rolledPool.push(Math.floor(Math.random() * 20) + 1);
      }

      state.hasRolledStats = true;

      // Применяем финальные значения и проверяем криты
      diceBoxes.forEach((box, i) => {
        box.classList.remove("is-rolling");
        const val = state.rolledPool[i];
        const numSpan = box.querySelector(".d20-number");
        if (numSpan) numSpan.textContent = val;

        if (val === 20) {
          box.classList.add("crit-success");
        } else if (val === 1) {
          box.classList.add("crit-fumble");
        }
      });

      statusText.innerHTML = `✨ <strong>Бросок завершён!</strong> Выпали значения: <code>${state.rolledPool.join(", ")}</code>. Распределите их ниже.`;

      // Блокировка кнопки (если не включён админ)
      if (!state.adminMode && !state.adminInfiniteRolls) {
        rollBtn.disabled = true;
        document.getElementById("btn-roll-stats-text").textContent = "Кубики брошены (Блокировка 1 броска)";
      } else {
        rollBtn.disabled = false;
        document.getElementById("btn-roll-stats-text").textContent = "🎲 Перебросить кубики (Режим Мастера)";
      }

      renderPoolChips();
      autoAssignStatsIfEmpty();
    }
  }

  function renderPoolChips() {
    const container = document.getElementById("pool-chips-container");
    container.innerHTML = "";

    state.rolledPool.forEach((val, idx) => {
      const chip = document.createElement("div");
      chip.className = "pool-token";
      chip.dataset.index = idx;
      chip.textContent = val;

      const isUsed = Object.values(state.assignedStats).some((slot) => slot && slot.poolIndex === idx);
      if (isUsed) chip.classList.add("used");

      chip.addEventListener("click", () => {
        // Подсказка при клике: подсвечиваем первое свободное поле
        const firstEmptyKey = ["str", "dex", "con", "int", "wis", "cha"].find((k) => !state.assignedStats[k]);
        if (firstEmptyKey) {
          assignPoolValueToStat(firstEmptyKey, idx);
        }
      });

      container.appendChild(chip);
    });

    updateRemainingCount();
    updateStatsAssignmentUI();
  }

  function updateRemainingCount() {
    const assignedCount = Object.values(state.assignedStats).filter((s) => s !== null).length;
    const remaining = 6 - assignedCount;
    const label = document.getElementById("pool-remaining-count");
    if (label) label.textContent = `Доступно: ${remaining} из 6`;
  }

  function renderStatsAssignmentSlots() {
    const grid = document.getElementById("stats-assignment-grid");
    grid.innerHTML = "";

    const statsList = [
      { key: "str", name: "Сила (STR)", desc: "Атака ближнего боя, атлетика, груз" },
      { key: "dex", name: "Ловкость (DEX)", desc: "КД, инициатива, скрытность" },
      { key: "con", name: "Телосложение (CON)", desc: "Хиты, спасброски выносливости" },
      { key: "int", name: "Интеллект (INT)", desc: "Магия, история, анализ" },
      { key: "wis", name: "Мудрость (WIS)", desc: "Внимательность, медицина" },
      { key: "cha", name: "Харизма (CHA)", desc: "Убеждение, обман, обаяние" }
    ];

    statsList.forEach((stat) => {
      const card = document.createElement("div");
      card.className = "stat-slot-card";
      card.id = `stat-card-${stat.key}`;

      card.innerHTML = `
        <span class="rec-badge" id="rec-badge-${stat.key}" style="display:none;">⭐ Ключевая</span>
        <div class="stat-name-row">
          <div class="stat-title">${stat.name}</div>
          <div class="stat-sub">${stat.desc}</div>
        </div>
        <div class="stat-select-wrap">
          <select class="stat-select" id="select-stat-${stat.key}">
            <option value="">— Выберите из пула —</option>
          </select>
        </div>
        <div class="stat-breakdown-row">
          <div class="breakdown-pill">
            <span class="pill-label">База</span>
            <span class="pill-val" id="base-score-${stat.key}">10</span>
          </div>
          <div class="breakdown-pill">
            <span class="pill-label">Раса</span>
            <span class="pill-val" id="racial-bonus-val-${stat.key}">+0</span>
          </div>
          <div class="breakdown-pill">
            <span class="pill-label">Итого</span>
            <span class="pill-val" id="total-score-${stat.key}">10</span>
          </div>
          <div class="breakdown-pill mod-pill">
            <span class="pill-label">Мод.</span>
            <span class="pill-val" id="mod-badge-${stat.key}">+0</span>
          </div>
        </div>
      `;

      grid.appendChild(card);

      const sel = card.querySelector(`#select-stat-${stat.key}`);
      sel.addEventListener("change", (e) => {
        const poolIdx = e.target.value === "" ? null : parseInt(e.target.value, 10);
        assignPoolValueToStat(stat.key, poolIdx);
      });
    });
  }

  function assignPoolValueToStat(statKey, poolIdx) {
    if (poolIdx !== null) {
      Object.keys(state.assignedStats).forEach((k) => {
        if (state.assignedStats[k] && state.assignedStats[k].poolIndex === poolIdx) {
          state.assignedStats[k] = null;
        }
      });
      state.assignedStats[statKey] = {
        poolIndex: poolIdx,
        value: state.rolledPool[poolIdx]
      };
    } else {
      state.assignedStats[statKey] = null;
    }

    renderPoolChips();
    updateLivePreview(["stats", "ac", "hp", "init", statKey]);
  }

  function autoAssignStatsIfEmpty() {
    const sortedIndices = state.rolledPool
      .map((val, idx) => ({ val, idx }))
      .sort((a, b) => b.val - a.val);

    const primary = state.classData ? state.classData.primaryAbility : "str";
    const order = [primary, "con", "dex", "wis", "cha", "int"];
    const uniqueOrder = [...new Set(order)];

    uniqueOrder.forEach((statKey, i) => {
      if (sortedIndices[i]) {
        state.assignedStats[statKey] = {
          poolIndex: sortedIndices[i].idx,
          value: sortedIndices[i].val
        };
      }
    });

    renderPoolChips();
    updateLivePreview(["stats", "ac", "hp", "init"]);
  }

  function updateStatsAssignmentUI() {
    const primary = state.classData ? state.classData.primaryAbility : null;

    ["str", "dex", "con", "int", "wis", "cha"].forEach((k) => {
      const card = document.getElementById(`stat-card-${k}`);
      const badge = document.getElementById(`rec-badge-${k}`);
      const select = document.getElementById(`select-stat-${k}`);
      const baseEl = document.getElementById(`base-score-${k}`);
      const racialEl = document.getElementById(`racial-bonus-val-${k}`);
      const totalText = document.getElementById(`total-score-${k}`);
      const modBadge = document.getElementById(`mod-badge-${k}`);

      if (!card || !select) return;

      const isRec = primary === k || (k === "con" && state.classData && (state.classData.id === "barbarian" || state.classData.id === "fighter"));
      if (card) card.classList.toggle("recommended", isRec);
      if (badge) badge.style.display = isRec ? "block" : "none";

      const currentSelected = state.assignedStats[k] ? state.assignedStats[k].poolIndex : "";
      select.innerHTML = `<option value="">— Выберите из пула —</option>`;

      state.rolledPool.forEach((val, idx) => {
        const isUsedElsewhere = Object.entries(state.assignedStats).some(
          ([otherKey, slot]) => otherKey !== k && slot && slot.poolIndex === idx
        );

        const opt = document.createElement("option");
        opt.value = idx;
        opt.textContent = `Кубик #${idx + 1}: [${val}]${isUsedElsewhere ? " (занято)" : ""}`;
        if (isUsedElsewhere) opt.disabled = true;
        if (currentSelected === idx) opt.selected = true;
        select.appendChild(opt);
      });

      const racialBonus = state.race && state.race.abilityBonuses && state.race.abilityBonuses[k] ? state.race.abilityBonuses[k] : 0;
      const baseVal = state.assignedStats[k] ? state.assignedStats[k].value : 10;
      const total = baseVal + racialBonus;
      const mod = Math.floor((total - 10) / 2);

      if (baseEl) baseEl.textContent = baseVal;
      if (racialEl) racialEl.textContent = `+${racialBonus}`;
      if (totalText) totalText.textContent = total;
      if (modBadge) modBadge.textContent = mod >= 0 ? `+${mod}` : `${mod}`;
    });
  }

  // --- 8. Навыки & Предыстория ---
  function initSkillsAndBackground() {
    const bgSelect = document.getElementById("char-background-select");
    const alignSelect = document.getElementById("char-alignment-select");
    const grid = document.getElementById("skills-checkbox-grid");
    const skills = window.DND_SKILLS || [];

    grid.innerHTML = "";
    skills.forEach((skill) => {
      const label = document.createElement("label");
      label.style = "display:flex; align-items:center; gap:0.4rem; font-size:0.8rem; cursor:pointer; background:rgba(0,0,0,0.25); padding:0.35rem 0.6rem; border-radius:4px;";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = skill.id;
      cb.style = "accent-color:var(--gold-primary);";
      cb.checked = state.selectedSkills.has(skill.id);

      cb.addEventListener("change", (e) => {
        if (e.target.checked) {
          state.selectedSkills.add(skill.id);
        } else {
          state.selectedSkills.delete(skill.id);
        }
        updateLivePreview(["skills"]);
      });

      label.appendChild(cb);
      label.appendChild(document.createTextNode(`${skill.name} (${skill.ability.toUpperCase()})`));
      grid.appendChild(label);
    });

    if (bgSelect) {
      bgSelect.addEventListener("change", (e) => {
        state.background = e.target.value;
        updateLivePreview(["background"]);
      });
    }

    if (alignSelect) {
      alignSelect.addEventListener("change", (e) => {
        state.alignment = e.target.value;
        updateLivePreview(["alignment"]);
      });
    }
  }

  // --- 9. Снаряжение и Боевой расчет ---
  function initGearAndCombat() {
    const armorSelect = document.getElementById("gear-armor-select");
    const shieldToggle = document.getElementById("gear-shield-toggle");
    const weaponSelect = document.getElementById("gear-main-weapon-select");
    const resSelect = document.getElementById("gear-elemental-res-select");

    armorSelect.addEventListener("change", (e) => {
      state.armor = e.target.value;
      updateLivePreview(["ac", "armor"]);
    });

    shieldToggle.addEventListener("change", (e) => {
      state.shield = e.target.checked;
      updateLivePreview(["ac"]);
    });

    weaponSelect.addEventListener("change", (e) => {
      state.mainWeapon = e.target.value;
      updateLivePreview(["weapon"]);
    });

    resSelect.addEventListener("change", (e) => {
      state.elementalRes = e.target.value;
      updateLivePreview(["resistance"]);
    });
  }

  // --- 10. Расчет формул (КД, ХП, Инициатива, Модификаторы) ---
  function calculateCombatStats() {
    // Модификаторы
    const getStat = (k) => {
      if (state.adminCustomScores && state.adminCustomScores[k] !== undefined) {
        return state.adminCustomScores[k];
      }
      const base = state.assignedStats[k] ? state.assignedStats[k].value : 10;
      const racial = state.race && state.race.abilityBonuses && state.race.abilityBonuses[k] ? state.race.abilityBonuses[k] : 0;
      return base + racial;
    };

    const getMod = (k) => Math.floor((getStat(k) - 10) / 2);

    const dexMod = getMod("dex");
    const conMod = getMod("con");
    const wisMod = getMod("wis");

    // Расчет КД
    let baseAc = 10;
    const armorEl = document.querySelector(`#gear-armor-select option[value="${state.armor}"]`);
    const armorAc = armorEl ? parseInt(armorEl.dataset.ac, 10) : 10;
    const armorType = armorEl ? armorEl.dataset.type : "none";

    if (armorType === "heavy") {
      baseAc = armorAc; // Без бонуса Ловкости
    } else if (armorType === "medium") {
      baseAc = armorAc + Math.min(2, Math.max(0, dexMod)); // Макс +2 Лов
    } else if (armorType === "light") {
      baseAc = armorAc + dexMod;
    } else {
      // Без доспеха
      if (state.classData && state.classData.id === "barbarian") {
        baseAc = 10 + dexMod + conMod;
      } else if (state.classData && state.classData.id === "monk") {
        baseAc = 10 + dexMod + wisMod;
      } else {
        baseAc = 10 + dexMod;
      }
    }

    if (state.shield) baseAc += 2;
    if (state.fightingStyle === "defense" && armorType !== "none") baseAc += 1; // Стиль «Защита» даёт +1 КД

    // Расчет Хитов (HP 1-го уровня)
    let hp = 10;
    if (state.adminCustomHp !== null) {
      hp = state.adminCustomHp;
    } else {
      const hitDie = state.classData ? state.classData.hitDie : 10;
      hp = Math.max(1, hitDie + conMod);
    }

    // Инициатива
    const init = dexMod;

    // Пассивная внимательность
    const hasPerception = state.selectedSkills.has("perception");
    const profBonus = state.adminProfBonus !== null ? state.adminProfBonus : 2;
    const passivePerc = 10 + wisMod + (hasPerception ? profBonus : 0);

    return {
      ac: baseAc,
      hp: hp,
      init: init,
      passivePerc: passivePerc,
      profBonus: profBonus,
      getStat,
      getMod
    };
  }

  // --- 11. Обновление Live Preview карточки ---
  function updateLivePreview(changedFields = []) {
    const combat = calculateCombatStats();

    // Имя
    const nameEl = document.getElementById("preview-name");
    if (nameEl) {
      if (state.name) {
        nameEl.textContent = state.name;
        nameEl.classList.remove("empty-placeholder");
      } else {
        nameEl.textContent = "Безымянный Герой";
        nameEl.classList.add("empty-placeholder");
      }
      triggerGlow(nameEl);
    }

    // Подзаголовок
    const subEl = document.getElementById("preview-subtitle");
    if (subEl) {
      const raceName = state.race ? state.race.name : "Раса не выбрана";
      const subName = state.subrace ? ` (${state.subrace.name})` : "";
      const className = state.classData ? state.classData.name : "Класс не выбран";
      subEl.textContent = `${raceName}${subName} • ${className} • Уровень 1`;
      triggerGlow(subEl);
    }

    // КД
    const acEl = document.getElementById("preview-ac");
    if (acEl) {
      acEl.textContent = combat.ac;
      triggerGlow(acEl);
    }

    // Хиты
    const hpEl = document.getElementById("preview-hp");
    if (hpEl) {
      hpEl.textContent = combat.hp;
      triggerGlow(hpEl);
    }

    // Инициатива
    const initEl = document.getElementById("preview-init");
    if (initEl) {
      initEl.textContent = combat.init >= 0 ? `+${combat.init}` : `${combat.init}`;
      triggerGlow(initEl);
    }

    // Скорость
    const speedEl = document.getElementById("preview-speed");
    if (speedEl) {
      speedEl.textContent = state.race ? state.race.speed : 30;
      triggerGlow(speedEl);
    }

    // 6 Характеристик
    ["str", "dex", "con", "int", "wis", "cha"].forEach((k) => {
      const val = combat.getStat(k);
      const mod = combat.getMod(k);
      const scoreEl = document.getElementById(`preview-val-${k}`);
      const modEl = document.getElementById(`preview-mod-${k}`);

      if (scoreEl) {
        scoreEl.textContent = val;
        triggerGlow(scoreEl);
      }
      if (modEl) {
        modEl.textContent = mod >= 0 ? `+${mod}` : `${mod}`;
      }
    });

    // Стиль боя
    const styleMap = {
      defense: "Защита (+1 КД)",
      dueling: "Дуэлянт (+2 урона)",
      archery: "Стрельба (+2 атака)",
      greatweapon: "Двуручное оружие",
      protection: "Охрана со щитом",
      twoweapon: "Два оружия",
      none: "Без стиля"
    };
    const styleEl = document.getElementById("preview-fighting-style");
    if (styleEl) styleEl.textContent = styleMap[state.fightingStyle] || "—";

    // Сопротивление
    const resMap = {
      lightning: "⚡ Электричество",
      fire: "🔥 Огонь",
      cold: "❄️ Холод",
      acid: "🧪 Кислота",
      poison: "☠️ Яд",
      necrotic: "💀 Некротический",
      radiant: "✨ Излучение",
      force: "🔮 Силовое поле",
      none: "Нет"
    };
    const resEl = document.getElementById("preview-resistance");
    if (resEl) resEl.textContent = resMap[state.elementalRes] || "—";

    // Доспех и Оружие
    const armorSelect = document.getElementById("gear-armor-select");
    const armorText = armorSelect ? armorSelect.options[armorSelect.selectedIndex].text.split("(")[0].trim() : "—";
    const weaponSelect = document.getElementById("gear-main-weapon-select");
    const weaponText = weaponSelect ? weaponSelect.options[weaponSelect.selectedIndex].text.split("(")[0].trim() : "—";

    const armorRow = document.getElementById("preview-armor");
    if (armorRow) armorRow.textContent = `${armorText}${state.shield ? " + Щит" : ""}`;

    const weaponRow = document.getElementById("preview-weapon");
    if (weaponRow) weaponRow.textContent = weaponText;

    // Пассивная внимательность & Бонус мастерства
    const passEl = document.getElementById("preview-passive-perc");
    if (passEl) passEl.textContent = combat.passivePerc;

    const profEl = document.getElementById("preview-prof-bonus");
    if (profEl) profEl.textContent = `+${combat.profBonus}`;

    // Обновление формул в шаге 6
    const formulaAc = document.getElementById("ac-formula-calc");
    if (formulaAc) {
      formulaAc.textContent = `База ${combat.ac - (state.shield ? 2 : 0) - (state.fightingStyle === "defense" ? 1 : 0)} + ${state.shield ? "2 (Щит) + " : ""}${state.fightingStyle === "defense" ? "1 (Защита) " : ""}= ${combat.ac}`;
    }

    const formulaHp = document.getElementById("hp-formula-calc");
    if (formulaHp) {
      const hitDie = state.classData ? state.classData.hitDie : 10;
      const conMod = combat.getMod("con");
      formulaHp.textContent = `${hitDie} (кость) + ${conMod} (мод. ТЕЛ) = ${combat.hp}`;
    }
  }

  function triggerGlow(element) {
    if (!element) return;
    element.classList.remove("flash-highlight");
    void element.offsetWidth; // trigger reflow
    element.classList.add("flash-highlight");
  }

  // --- 12. Генерация и Скачивание .TXT Файла ---
  function initExportAndCopy() {
    const downloadBtn = document.getElementById("btn-download-txt");
    const copyBtn = document.getElementById("btn-copy-clipboard");
    const resetBtn = document.getElementById("btn-reset-character");

    downloadBtn.addEventListener("click", () => {
      const text = generateCharacterSheetText();
      const filename = `${state.name || "Персонаж"}_DND5e.txt`;
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showExportToast("Файл анкеты успешно скачан!");
    });

    copyBtn.addEventListener("click", () => {
      const text = generateCharacterSheetText();
      navigator.clipboard.writeText(text).then(() => {
        showExportToast("Анкета скопирована в буфер обмена!");
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (confirm("Вы уверены, что хотите начать заново и сбросить все параметры?")) {
          window.location.reload();
        }
      });
    }
  }

  function showExportToast(msg) {
    const toast = document.getElementById("export-toast-msg");
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = "block";
    setTimeout(() => {
      toast.style.display = "none";
    }, 4000);
  }

  function generateCharacterSheetText() {
    const combat = calculateCombatStats();
    const raceName = state.race ? state.race.name : "Не выбрана";
    const subName = state.subrace ? ` (${state.subrace.name})` : "";
    const className = state.classData ? state.classData.name : "Не выбран";

    const styleNames = {
      defense: "Защита (+1 КД)",
      dueling: "Дуэлянт (+2 к урону)",
      archery: "Стрельба (+2 к атаке)",
      greatweapon: "Двуручное оружие",
      protection: "Охрана",
      twoweapon: "Сражение двумя оружиями",
      none: "Нет"
    };

    const resNames = {
      lightning: "Электричество",
      fire: "Огонь",
      cold: "Холод",
      acid: "Кислота",
      poison: "Яд",
      necrotic: "Некротический",
      radiant: "Излучение",
      force: "Силовое поле",
      none: "Нет"
    };

    const armorSelect = document.getElementById("gear-armor-select");
    const armorName = armorSelect ? armorSelect.options[armorSelect.selectedIndex].text : "Кольчуга";
    const weaponSelect = document.getElementById("gear-main-weapon-select");
    const weaponName = weaponSelect ? weaponSelect.options[weaponSelect.selectedIndex].text : "Двойной топор";

    // Сборка текста со строгим брендингом и версией в конце
    const lines = [
      "============================================================",
      "                         DNDcreator                         ",
      "                       By: Deputatik                        ",
      "============================================================",
      `Имя:                 ${state.name || "Безымянный Герой"}`,
      `Раса:                ${raceName}${subName}`,
      `Класс:               ${className}`,
      `Уровень:             1`,
      `Мировоззрение:       ${state.alignment}`,
      `Предыстория:         ${state.background}`,
      "------------------------------------------------------------",
      "ХАРАКТЕРИСТИКИ И МОДИФИКАТОРЫ:",
      `  Сила (STR):        ${combat.getStat("str")} (${combat.getMod("str") >= 0 ? "+" : ""}${combat.getMod("str")})`,
      `  Ловкость (DEX):    ${combat.getStat("dex")} (${combat.getMod("dex") >= 0 ? "+" : ""}${combat.getMod("dex")})`,
      `  Телосложение (CON):${combat.getStat("con")} (${combat.getMod("con") >= 0 ? "+" : ""}${combat.getMod("con")})`,
      `  Интеллект (INT):   ${combat.getStat("int")} (${combat.getMod("int") >= 0 ? "+" : ""}${combat.getMod("int")})`,
      `  Мудрость (WIS):    ${combat.getStat("wis")} (${combat.getMod("wis") >= 0 ? "+" : ""}${combat.getMod("wis")})`,
      `  Харизма (CHA):     ${combat.getStat("cha")} (${combat.getMod("cha") >= 0 ? "+" : ""}${combat.getMod("cha")})`,
      "------------------------------------------------------------",
      "БОЕВЫЕ ПАРАМЕТРЫ:",
      `  КД (Класс Доспеха):${combat.ac}`,
      `  Хиты (HP):         ${combat.hp}`,
      `  Инициатива:        ${combat.init >= 0 ? "+" : ""}${combat.init}`,
      `  Скорость:          ${state.race ? state.race.speed : 30} фт.`,
      `  Бонус мастерства:  +${combat.profBonus}`,
      `  Пассивная внимат.: ${combat.passivePerc}`,
      "------------------------------------------------------------",
      "СПЕЦИАЛИЗАЦИЯ И СТИЛЬ:",
      `  Стиль боя:         ${styleNames[state.fightingStyle] || "—"}`,
      `  Сопротивление:     ${resNames[state.elementalRes] || "—"}`,
      "------------------------------------------------------------",
      "СНАРЯЖЕНИЕ:",
      `  Доспех:            ${armorName}`,
      `  Щит:               ${state.shield ? "Да (+2 к КД)" : "Нет"}`,
      `  Основное оружие:   ${weaponName}`,
      "============================================================",
      `Версия генератора: ${APP_VERSION}`
    ];

    return lines.join("\n");
  }

  // --- 13. Защищённый Админ-режим (SHA-256 + IIFE Closure) ---
  function initAdminSystem() {
    const openBtn = document.getElementById("btn-open-admin");
    const closeBtn = document.getElementById("btn-close-admin-modal");
    const overlay = document.getElementById("admin-modal-overlay");
    const authForm = document.getElementById("admin-auth-form");
    const passInput = document.getElementById("admin-pass-input");
    const errorMsg = document.getElementById("admin-error-msg");
    const toolsPanel = document.getElementById("admin-tools-panel");
    const ribbon = document.getElementById("admin-ribbon");

    openBtn.addEventListener("click", () => {
      overlay.classList.add("active");
      passInput.value = "";
      errorMsg.style.display = "none";
      passInput.focus();
    });

    closeBtn.addEventListener("click", () => {
      overlay.classList.remove("active");
    });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.remove("active");
    });

    authForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const enteredPassword = passInput.value.trim();

      // Проверка через Web Crypto API SHA-256
      const isValid = await verifyAdminPassword(enteredPassword);
      if (isValid) {
        state.adminMode = true;
        authForm.style.display = "none";
        toolsPanel.style.display = "flex";
        errorMsg.style.display = "none";
        document.body.classList.add("admin-mode-active");
        ribbon.style.display = "block";
        openBtn.classList.add("admin-unlocked");
        openBtn.innerHTML = "<span>👑</span><span>Админ (ВКЛ)</span>";

        // Функция синхронизации значений и превью модов в админке
        function syncAdminInputs() {
          const combat = calculateCombatStats();
          ["str", "dex", "con", "int", "wis", "cha"].forEach((k) => {
            const input = document.getElementById(`admin-stat-${k}`);
            const modPrev = document.getElementById(`admin-mod-${k}`);
            if (input) {
              const currentVal = state.adminCustomScores && state.adminCustomScores[k] !== undefined
                ? state.adminCustomScores[k]
                : combat.getStat(k);
              input.value = currentVal;
              const mod = Math.floor((currentVal - 10) / 2);
              if (modPrev) modPrev.textContent = `мод: ${mod >= 0 ? "+" + mod : mod}`;
            }
          });

          const hpInput = document.getElementById("admin-input-hp");
          if (hpInput) hpInput.value = state.adminCustomHp !== null ? state.adminCustomHp : combat.hp;

          const profSelect = document.getElementById("admin-input-prof");
          if (profSelect) profSelect.value = state.adminProfBonus !== null ? state.adminProfBonus : combat.profBonus;
        }

        syncAdminInputs();

        // Снимаем блокировку броска
        const rollBtn = document.getElementById("btn-roll-stats");
        if (rollBtn) {
          rollBtn.disabled = false;
          document.getElementById("btn-roll-stats-text").textContent = "🎲 Перебросить кубики (Режим Мастера)";
        }
      } else {
        errorMsg.style.display = "block";
      }
    });

    // Обработчик кнопок шагомеров [+] и [-]
    document.querySelectorAll("[data-step-stat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const statKey = btn.dataset.stepStat;
        const delta = parseInt(btn.dataset.delta, 10);
        const input = document.getElementById(`admin-stat-${statKey}`);
        const modPrev = document.getElementById(`admin-mod-${statKey}`);
        if (input) {
          let val = (parseInt(input.value, 10) || 10) + delta;
          val = Math.max(1, Math.min(30, val));
          input.value = val;
          const mod = Math.floor((val - 10) / 2);
          if (modPrev) modPrev.textContent = `мод: ${mod >= 0 ? "+" + mod : mod}`;
        }
      });
    });

    // Ручной ввод в инпуты с авто-обновлением превью модификатора
    ["str", "dex", "con", "int", "wis", "cha"].forEach((k) => {
      const input = document.getElementById(`admin-stat-${k}`);
      const modPrev = document.getElementById(`admin-mod-${k}`);
      if (input) {
        input.addEventListener("input", () => {
          let val = parseInt(input.value, 10) || 10;
          val = Math.max(1, Math.min(30, val));
          const mod = Math.floor((val - 10) / 2);
          if (modPrev) modPrev.textContent = `мод: ${mod >= 0 ? "+" + mod : mod}`;
        });
      }
    });

    // Быстрый пресет: Точные статы из скриншота анкеты [15, 12, 17, 12, 10, 11]
    const presetNoteBtn = document.getElementById("btn-preset-note");
    if (presetNoteBtn) {
      presetNoteBtn.addEventListener("click", () => {
        const noteScores = { str: 15, dex: 12, con: 17, int: 12, wis: 10, cha: 11 };
        Object.entries(noteScores).forEach(([k, v]) => {
          const inp = document.getElementById(`admin-stat-${k}`);
          const modPrev = document.getElementById(`admin-mod-${k}`);
          if (inp) inp.value = v;
          if (modPrev) {
            const m = Math.floor((v - 10) / 2);
            modPrev.textContent = `мод: ${m >= 0 ? "+" + m : m}`;
          }
        });
      });
    }

    // Быстрый пресет: Эпик [18, 16, 16, 14, 12, 10]
    const presetEpicBtn = document.getElementById("btn-preset-epic");
    if (presetEpicBtn) {
      presetEpicBtn.addEventListener("click", () => {
        const epicScores = { str: 18, dex: 16, con: 16, int: 14, wis: 12, cha: 10 };
        Object.entries(epicScores).forEach(([k, v]) => {
          const inp = document.getElementById(`admin-stat-${k}`);
          const modPrev = document.getElementById(`admin-mod-${k}`);
          if (inp) inp.value = v;
          if (modPrev) {
            const m = Math.floor((v - 10) / 2);
            modPrev.textContent = `мод: ${m >= 0 ? "+" + m : m}`;
          }
        });
      });
    }

    // Быстрый пресет: Все 20
    const presetMaxBtn = document.getElementById("btn-preset-max");
    if (presetMaxBtn) {
      presetMaxBtn.addEventListener("click", () => {
        ["str", "dex", "con", "int", "wis", "cha"].forEach((k) => {
          const inp = document.getElementById(`admin-stat-${k}`);
          const modPrev = document.getElementById(`admin-mod-${k}`);
          if (inp) inp.value = 20;
          if (modPrev) modPrev.textContent = "мод: +5";
        });
      });
    }

    // Быстрый переброс кубиков прямо из админки
    const presetRerollBtn = document.getElementById("btn-preset-reroll");
    if (presetRerollBtn) {
      presetRerollBtn.addEventListener("click", () => {
        performDiceRollAnimation();
        overlay.classList.remove("active");
        goToStep(4);
      });
    }

    // Чекбокс бесконечных бросков
    const infiniteCheckbox = document.getElementById("admin-infinite-rolls");
    if (infiniteCheckbox) {
      infiniteCheckbox.addEventListener("change", (e) => {
        state.adminInfiniteRolls = e.target.checked;
        const rollBtn = document.getElementById("btn-roll-stats");
        if (rollBtn) rollBtn.disabled = false;
      });
    }

    // Кнопка применить кастомные характеристики
    const applyStatsBtn = document.getElementById("btn-admin-apply-stats");
    applyStatsBtn.addEventListener("click", () => {
      state.adminCustomScores = {
        str: parseInt(document.getElementById("admin-stat-str").value, 10) || 10,
        dex: parseInt(document.getElementById("admin-stat-dex").value, 10) || 10,
        con: parseInt(document.getElementById("admin-stat-con").value, 10) || 10,
        int: parseInt(document.getElementById("admin-stat-int").value, 10) || 10,
        wis: parseInt(document.getElementById("admin-stat-wis").value, 10) || 10,
        cha: parseInt(document.getElementById("admin-stat-cha").value, 10) || 10
      };

      state.adminProfBonus = parseInt(document.getElementById("admin-input-prof").value, 10) || 2;
      state.adminCustomHp = parseInt(document.getElementById("admin-input-hp").value, 10) || 10;

      updateLivePreview(["stats", "ac", "hp"]);
      updateStatsAssignmentUI();
      overlay.classList.remove("active");
    });

    // Кнопка выхода из админ режима
    const logoutBtn = document.getElementById("btn-admin-logout");
    logoutBtn.addEventListener("click", () => {
      state.adminMode = false;
      state.adminInfiniteRolls = false;
      state.adminCustomScores = null;
      state.adminProfBonus = null;
      state.adminCustomHp = null;

      document.body.classList.remove("admin-mode-active");
      ribbon.style.display = "none";
      openBtn.classList.remove("admin-unlocked");
      openBtn.innerHTML = "<span>🔒</span><span>Админ</span>";
      authForm.style.display = "block";
      toolsPanel.style.display = "none";
      overlay.classList.remove("active");

      // Возвращаем нормальную блокировку если бросок уже был
      const rollBtn = document.getElementById("btn-roll-stats");
      if (state.hasRolledStats && rollBtn) {
        rollBtn.disabled = true;
        document.getElementById("btn-roll-stats-text").textContent = "Кубики брошены (Блокировка 1 броска)";
      }

      updateLivePreview();
      updateStatsAssignmentUI();
    });
  }

  // Криптографическое сравнение SHA-256
  async function verifyAdminPassword(inputPass) {
    try {
      const msgBuffer = new TextEncoder().encode(ADMIN_SALT + inputPass);
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      return hashHex === ADMIN_HASH;
    } catch (e) {
      console.error("Crypto error:", e);
      return false;
    }
  }
})();
