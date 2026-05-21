
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');
if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', mainNav.classList.contains('open'));
  });
}

document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => mainNav?.classList.remove('open'));
});

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('visible'));
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Catalog filters
const filterButtons = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');
function applyCatalogFilter() {
  const active = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
  const query = (document.getElementById('catalogSearch')?.value || '').toLowerCase().trim();
  productCards.forEach(card => {
    const category = card.dataset.category;
    const text = card.innerText.toLowerCase();
    const matchFilter = active === 'all' || category === active;
    const matchQuery = !query || text.includes(query);
    card.classList.toggle('is-hidden', !(matchFilter && matchQuery));
  });
}
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(item => item.classList.remove('active'));
    btn.classList.add('active');
    applyCatalogFilter();
  });
});
document.getElementById('catalogSearch')?.addEventListener('input', applyCatalogFilter);

// Selector recommendation
const selectorForm = document.getElementById('selectorForm');
const recommendation = document.getElementById('recommendation');
const productLinks = {
  radar: 'products/rff-radar-120.html',
  vibro: 'products/rff-vibro-fps.html',
  mag: 'products/rff-mag-m6.html',
  gwr: 'products/rff-gwr-30.html',
  flow: 'products/rff-flow-m3000.html',
  hydro: 'products/rff-hydro-p.html'
};
function relProductLink(path) {
  const isProductPage = location.pathname.includes('/products/');
  return isProductPage ? path.replace('products/', '') : path;
}
if (selectorForm && recommendation) {
  selectorForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(selectorForm);
    const media = data.get('media');
    const tank = data.get('tank');
    const task = data.get('task');
    let result = { name: 'RFF-Radar 120', reason: 'универсальное бесконтактное измерение уровня', url: productLinks.radar };
    if (task === 'limit') result = { name: 'RFF-Vibro FPS', reason: 'предельная сигнализация уровня и защита от переполнения', url: productLinks.vibro };
    else if (task === 'accuracy') result = { name: 'RFF-Mag M6', reason: 'высокая точность измерения в резервуарах', url: productLinks.mag };
    else if (media === 'foam' || media === 'viscous') result = { name: 'RFF-GWR 30', reason: 'устойчивость к пене, пару, налипанию и изменению свойств среды', url: productLinks.gwr };
    else if (tank === 'open') result = { name: 'RFF-Hydro P', reason: 'простое решение для открытых емкостей, колодцев и воды', url: productLinks.hydro };
    else if (media === 'bulk') result = { name: 'RFF-Radar 120', reason: 'бесконтактный контроль уровня в силосах и бункерах', url: productLinks.radar };
    recommendation.innerHTML = `<strong>Рекомендация: ${result.name}</strong><br>${result.reason}. <a href="${relProductLink(result.url)}">Открыть страницу прибора →</a>`;
  });
}

// Tabs on product pages
const tabButtons = document.querySelectorAll('.tab-btn');
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(item => item.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(target)?.classList.add('active');
  });
});

// Demo contact forms
function handleDemoForm(form) {
  form.addEventListener('submit', event => {
    event.preventDefault();
    const note = form.querySelector('.form-note') || document.createElement('p');
    note.className = 'form-note form-success';
    note.textContent = 'Заявка сохранена в демо-режиме. Для публикации подключите email, CRM или Telegram.';
    if (!note.parentElement) form.appendChild(note);
  });
}
document.querySelectorAll('form.contact-form, form.request-form').forEach(handleDemoForm);

// Compare drawer
const compareKey = 'rfflowCompareV2';
function getCompare() {
  try { return JSON.parse(localStorage.getItem(compareKey)) || []; } catch { return []; }
}
function saveCompare(items) { localStorage.setItem(compareKey, JSON.stringify(items)); }
function cardData(btn) {
  const card = btn.closest('[data-product-id]');
  return {
    id: card.dataset.productId,
    title: card.dataset.title,
    range: card.dataset.range,
    output: card.dataset.output,
    temp: card.dataset.temp,
    category: card.dataset.categoryName || card.dataset.category
  };
}
function renderCompare() {
  const drawer = document.getElementById('compareDrawer');
  const body = document.getElementById('compareBody');
  const items = getCompare();
  document.querySelectorAll('.compare-btn').forEach(btn => {
    const id = btn.closest('[data-product-id]')?.dataset.productId;
    btn.classList.toggle('active', items.some(item => item.id === id));
    btn.textContent = items.some(item => item.id === id) ? '✓ В сравнении' : 'Сравнить';
  });
  if (!drawer || !body) return;
  if (!items.length) { drawer.classList.remove('open'); return; }
  drawer.classList.add('open');
  const cols = items.map(item => `<td><strong>${item.title}</strong><br><small>${item.category}</small></td>`).join('');
  const ranges = items.map(item => `<td>${item.range}</td>`).join('');
  const outputs = items.map(item => `<td>${item.output}</td>`).join('');
  const temps = items.map(item => `<td>${item.temp}</td>`).join('');
  body.innerHTML = `<table class="compare-table"><tr><th>Модель</th>${cols}</tr><tr><th>Диапазон</th>${ranges}</tr><tr><th>Выходы</th>${outputs}</tr><tr><th>Температура</th>${temps}</tr></table>`;
}
document.querySelectorAll('.compare-btn').forEach(btn => {
  btn.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    const data = cardData(btn);
    let items = getCompare();
    const exists = items.some(item => item.id === data.id);
    if (exists) items = items.filter(item => item.id !== data.id);
    else {
      if (items.length >= 3) items.shift();
      items.push(data);
    }
    saveCompare(items);
    renderCompare();
  });
});
document.getElementById('clearCompare')?.addEventListener('click', () => { saveCompare([]); renderCompare(); });
document.getElementById('closeCompare')?.addEventListener('click', () => document.getElementById('compareDrawer')?.classList.remove('open'));
renderCompare();

document.querySelectorAll('[data-print]').forEach(btn => btn.addEventListener('click', () => window.print()));


// ===== RFFlow v3 interactions =====
(function () {
  const productData = [
    {id:"rff-radar-120", name:"RFF-Radar 120", url:"products/rff-radar-120.html", media:"Жидкости и сыпучие материалы", range:"0…120 м", temp:"-40…+600 °C", output:"4–20 мА / HART / RS-485 / Modbus", reason:"Бесконтактный радар подходит для высоких силосов, резервуаров, пыли, пара и сложных промышленных условий."},
    {id:"rff-vibro-fps", name:"RFF-Vibro FPS", url:"products/rff-vibro-fps.html", media:"Сыпучие материалы", range:"предельный уровень", temp:"-60…+200 °C", output:"DPDT / SPST / PNP / NPN", reason:"Оптимален для дискретной сигнализации минимального или максимального уровня в бункерах и силосах."},
    {id:"rff-mag-m6", name:"RFF-Mag M6", url:"products/rff-mag-m6.html", media:"Жидкости", range:"0…6 м", temp:"-40…+200 °C", output:"4–20 мА / HART / Modbus", reason:"Подходит для точного измерения уровня жидкости в резервуаре с поплавком."},
    {id:"rff-gwr-30", name:"RFF-GWR 30", url:"products/rff-gwr-30.html", media:"Жидкости, пасты, пена", range:"0…30 м", temp:"-40…+400 °C", output:"4–20 мА / HART / RS-485", reason:"Волноводный радар устойчив при пене, паре, узкой емкости и сложной геометрии."},
    {id:"rff-flow-m3000", name:"RFF-Flow M3000", url:"products/rff-flow-m3000.html", media:"Проводящие жидкости", range:"DN 3…3000", temp:"-40…+180 °C", output:"4–20 мА / HART / импульс", reason:"Решение для контроля расхода проводящих жидкостей, а не уровня."},
    {id:"rff-hydro-p", name:"RFF-Hydro P", url:"products/rff-hydro-p.html", media:"Вода и стоки", range:"0…60 м", temp:"типовое исполнение", output:"4–20 мА", reason:"Погружной гидростатический датчик подходит для колодцев, воды, стоков и открытых емкостей."}
  ];

  function getPrefix() {
    const path = location.pathname;
    if (path.includes('/products/') || path.includes('/applications/') || path.includes('/industries/') || path.includes('/knowledge/')) return '../';
    return '';
  }

  function productById(id) {
    return productData.find(p => p.id === id);
  }

  function productResultCard(p, prefix) {
    return `<div class="result-card">
      <h3>${p.name}</h3>
      <p>${p.reason}</p>
      <ul class="spec-list">
        <li><span>Среда</span><strong>${p.media}</strong></li>
        <li><span>Диапазон</span><strong>${p.range}</strong></li>
        <li><span>Температура</span><strong>${p.temp}</strong></li>
        <li><span>Выход</span><strong>${p.output}</strong></li>
      </ul>
      <a class="btn btn-secondary" href="${prefix}${p.url}">Открыть страницу прибора</a>
    </div>`;
  }

  // Advanced configurator
  const smartConfigurator = document.getElementById('smartConfigurator');
  const configuratorResult = document.getElementById('configuratorResult');
  if (smartConfigurator && configuratorResult) {
    smartConfigurator.addEventListener('submit', function (e) {
      e.preventDefault();
      const fd = new FormData(smartConfigurator);
      const media = fd.get('media');
      const object = fd.get('object');
      const conditions = fd.get('conditions');
      const signal = fd.get('signal');
      let ids = [];

      if (media === 'conductive' || object === 'pipe' || signal === 'pulse') {
        ids = ['rff-flow-m3000'];
      } else if (signal === 'relay') {
        ids = ['rff-vibro-fps', 'rff-radar-120'];
      } else if (object === 'well') {
        ids = ['rff-hydro-p', 'rff-radar-120'];
      } else if (conditions === 'foam' || media === 'foam' || media === 'viscous') {
        ids = ['rff-gwr-30', 'rff-radar-120'];
      } else if (conditions === 'accuracy') {
        ids = ['rff-mag-m6', 'rff-gwr-30'];
      } else if (object === 'silo' || media === 'bulk' || conditions === 'dust') {
        ids = ['rff-radar-120', 'rff-vibro-fps'];
      } else {
        ids = ['rff-radar-120', 'rff-gwr-30', 'rff-mag-m6'];
      }

      if (conditions === 'ex' && !ids.includes('rff-radar-120')) ids.unshift('rff-radar-120');

      const unique = [...new Set(ids)].slice(0, 3).map(productById).filter(Boolean);
      const prefix = getPrefix();
      configuratorResult.innerHTML = `<h2>Рекомендованные решения</h2>
        <p>Предварительный подбор на основе выбранных параметров. Для финальной спецификации нужно уточнить среду, температуру, давление, присоединение и схему монтажа.</p>
        ${unique.map(p => productResultCard(p, prefix)).join('')}
        <a class="btn btn-primary" href="${prefix}survey-sheets.html">Заполнить опросный лист</a>`;
    });
  }

  // Demo serial number search
  const serialForm = document.getElementById('serialForm');
  const serialResult = document.getElementById('serialResult');
  const serialDb = {
    "RFF-24001-001": {model:"RFF-Radar 120", id:"rff-radar-120", date:"12.03.2024", range:"0…80 м", output:"4–20 мА/HART", status:"Поставка зарегистрирована"},
    "RFF-24002-014": {model:"RFF-Vibro FPS", id:"rff-vibro-fps", date:"21.06.2024", range:"предельный уровень", output:"PNP/NPN", status:"Поставка зарегистрирована"},
    "RFF-24003-007": {model:"RFF-GWR 30", id:"rff-gwr-30", date:"04.09.2024", range:"0…20 м", output:"4–20 мА/HART", status:"Поставка зарегистрирована"}
  };
  if (serialForm && serialResult) {
    serialForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const serial = new FormData(serialForm).get('serial').trim().toUpperCase();
      const item = serialDb[serial];
      const prefix = getPrefix();
      if (!item) {
        serialResult.innerHTML = `<h2>Серийный номер не найден</h2><p>Это демо-раздел. Проверьте номер или свяжитесь с сервисом: <a href="mailto:zakaz@lkis.ru">zakaz@lkis.ru</a>.</p>`;
        return;
      }
      const p = productById(item.id);
      serialResult.innerHTML = `<h2>${item.model}</h2>
        <div class="result-card">
          <ul class="spec-list">
            <li><span>Серийный номер</span><strong>${serial}</strong></li>
            <li><span>Дата поставки</span><strong>${item.date}</strong></li>
            <li><span>Диапазон</span><strong>${item.range}</strong></li>
            <li><span>Выход</span><strong>${item.output}</strong></li>
            <li><span>Статус</span><strong>${item.status}</strong></li>
          </ul>
          <a class="btn btn-secondary" href="${prefix}${p.url}">Открыть прибор</a>
          <a class="btn btn-secondary" href="${prefix}downloads.html">Документы</a>
        </div>`;
    });
  }

  // Survey sheet generator
  const surveyForm = document.getElementById('surveyForm');
  const surveyResult = document.getElementById('surveyResult');
  if (surveyForm && surveyResult) {
    surveyForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const fd = new FormData(surveyForm);
      const text = `Здравствуйте! Нужен подбор оборудования RFFlow.\n\nТип прибора: ${fd.get('device')}\nСреда: ${fd.get('media')}\nОбъект: ${fd.get('object')}\nТемпература / давление: ${fd.get('tp')}\nСложные факторы: ${fd.get('factors')}\nВыходной сигнал: ${fd.get('signal')}\n\nПрошу подготовить рекомендацию и коммерческое предложение.`;
      surveyResult.innerHTML = `<h2>Готовый текст запроса</h2><textarea rows="13" readonly>${text}</textarea><p class="form-note">Скопируйте текст и отправьте на zakaz@lkis.ru или через форму заявки.</p>`;
    });
  }

  // Compare tray using localStorage
  function getCompare() {
    try { return JSON.parse(localStorage.getItem('rfflow_compare') || '[]'); } catch(e) { return []; }
  }
  function setCompare(ids) {
    localStorage.setItem('rfflow_compare', JSON.stringify(ids.slice(0,3)));
    renderCompare();
  }
  function renderCompare() {
    const ids = getCompare();
    document.querySelectorAll('.compare-toggle').forEach(btn => {
      const active = ids.includes(btn.dataset.compare);
      btn.classList.toggle('active', active);
      btn.textContent = active ? 'В сравнении' : (btn.classList.contains('mini') ? 'В сравнение' : 'Добавить к сравнению');
    });
    const tray = document.getElementById('compareTray');
    if (tray) {
      if (!ids.length) {
        tray.innerHTML = '<strong>Выбранные приборы:</strong><span>пока ничего не выбрано</span>';
      } else {
        tray.innerHTML = '<strong>Выбранные приборы:</strong>' + ids.map(id => {
          const p = productById(id);
          return p ? `<span class="compare-pill">${p.name}<button type="button" data-remove-compare="${id}">×</button></span>` : '';
        }).join('');
      }
    }
  }
  document.addEventListener('click', function(e) {
    const compareBtn = e.target.closest('[data-compare]');
    if (compareBtn) {
      const id = compareBtn.dataset.compare;
      let ids = getCompare();
      if (ids.includes(id)) ids = ids.filter(x => x !== id);
      else if (ids.length < 3) ids.push(id);
      else { alert('Можно сравнить до 3 приборов. Удалите один из выбранных.'); return; }
      setCompare(ids);
    }
    const removeBtn = e.target.closest('[data-remove-compare]');
    if (removeBtn) {
      setCompare(getCompare().filter(x => x !== removeBtn.dataset.removeCompare));
    }
  });
  renderCompare();

  // Search for catalog
  const catalogSearch = document.getElementById('catalogSearch');
  if (catalogSearch) {
    catalogSearch.addEventListener('input', function() {
      const q = catalogSearch.value.toLowerCase().trim();
      document.querySelectorAll('.product-card').forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  // Search for documents
  const docSearch = document.getElementById('docSearch');
  if (docSearch) {
    docSearch.addEventListener('input', function() {
      const q = docSearch.value.toLowerCase().trim();
      document.querySelectorAll('.download-card').forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }

  // Product tabs
  document.querySelectorAll('[data-tabs]').forEach(tabs => {
    tabs.addEventListener('click', e => {
      const btn = e.target.closest('.tab-button');
      if (!btn) return;
      const name = btn.dataset.tab;
      tabs.querySelectorAll('.tab-button').forEach(b => b.classList.toggle('active', b === btn));
      tabs.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === name));
    });
  });
})();
