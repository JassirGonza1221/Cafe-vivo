/**
 * Café Vivo — Aplicación principal (vanilla JS)
 * Tabs: Regiones | Panel | Colmenas & Reinas | Calendario | Gráficos
 */

const App = (function () {
  const TODAY = '2026-10-16';

  let state = {
    tab: 'regiones',
    regionId: 'co-huila',
    filter: 'all',
    y: 2026,
    m: 9, // Octubre (0-indexed)
    sel: TODAY,
    ftype: 'conteo',
    fvalue: '',
    records: [],
    msg: '',
    // Bees UI
    beeFormOpen: false,
    editingHiveId: null,
    beeMsg: ''
  };

  // ── Helpers ──────────────────────────────────────────────
  function pad(n) { return String(n).padStart(2, '0'); }
  function ds(y, m, d) { return y + '-' + pad(m + 1) + '-' + pad(d); }

  function windowsFor(regionId) {
    const cyc = DATA.cycle[regionId];
    if (!cyc) return [];
    return cyc.w.map(w => {
      const len = ((w[1] - w[0] + 12) % 12) + 1;
      const peak = (w[0] + Math.floor((len - 1) / 2)) % 12;
      return { s: w[0], e: w[1], len, peak, flower: (peak - 8 + 12) % 12 };
    });
  }

  function inWin(w, m) {
    return ((m - w.s + 12) % 12) < w.len;
  }

  function phaseKeys(m, regionId) {
    const windows = windowsFor(regionId);
    const keys = [];
    if (windows.some(w => inWin(w, m))) keys.push('cosecha');
    if (windows.some(w => w.flower === m)) keys.push('floracion');
    if (windows.some(w => (w.s - 1 + 12) % 12 === m)) keys.push('precosecha');
    if (windows.some(w => {
      const a = (m - w.e + 12) % 12;
      return a >= 1 && a <= 2 && !inWin(w, m);
    })) keys.push('poscosecha');
    if (windows.some(w => {
      const k = (m - w.flower + 12) % 12;
      return k >= 1 && k <= 2;
    })) keys.push('cuajado');
    if (keys.length === 0) keys.push('desarrollo');
    return keys;
  }

  function eventsFor(dstr, dow, mIdx, dayNum, regionId) {
    const out = [];
    if (DATA.rain[dstr]) {
      out.push({ title: 'Lluvia del día', type: 'lluvia', chip: DATA.rain[dstr] + ' mm', detail: DATA.rain[dstr] + ' mm' });
    }
    if (dow === 1) {
      out.push({ title: 'Conteo de visitas (5 min)', type: 'conteo' });
    }
    phaseKeys(mIdx, regionId).forEach((k, idx) => {
      const ph = DATA.phases[k];
      ph.tasks.slice(0, idx === 0 ? ph.tasks.length : 2).forEach(t => {
        if (t.days && t.days.indexOf(dayNum) !== -1) {
          out.push({
            title: t.cal,
            chip: t.chip,
            type: k === 'cosecha' ? 'cosecha' : 'labor',
            phaseLabel: ph.label,
            note: t.note
          });
        }
      });
    });
    (DATA.schedule[dstr] || []).forEach(e => out.push(e));
    state.records.filter(r => r.date === dstr).forEach(r => {
      const f = DATA.forms[r.key];
      out.push({
        title: f.title,
        type: f.type,
        rec: true,
        detail: r.value + ' ' + f.unit,
        chip: r.key === 'lluvia' ? r.value + ' mm' : undefined
      });
    });
    return out.map(e => ({ ...e, done: e.rec ? true : dstr < TODAY }));
  }

  // ── Heatmap de floración ─────────────────────────────────
  function buildHeat(region) {
    const base = [
      [3, 2, 0, 1, 2, 3, 3, 2, 1, 1, 2, 3],
      [1, 3, 1, 0, 1, 2, 3, 3, 3, 2, 1, 0],
      [2, 1, 0, 2, 3, 2, 1, 1, 2, 3, 3, 2]
    ];
    const shift = (region.gap - 2 + 12) % 12;
    const heatColors = ['#EFE6D6', '#F1D28A', '#DDA73B', '#A8661A'];
    const heat = [];
    base.forEach((row, r) => {
      heat.push({ isLabel: true, label: 'Franja ' + (r + 1) });
      for (let i = 0; i < 12; i++) {
        const v = row[(i - shift + 12) % 12];
        heat.push({
          isLabel: false,
          bg: heatColors[v],
          bd: i === region.gap ? '#B5573A' : '#D8CDB9'
        });
      }
    });
    return heat;
  }

  // ── Render helpers ───────────────────────────────────────
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) => {
        if (k === 'className') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
        else if (v !== false && v != null) node.setAttribute(k, v);
      });
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(c => {
        if (c == null) return;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return node;
  }

  // ── Tabs content ─────────────────────────────────────────
  function renderRegiones() {
    const section = el('section', { className: 'section' });
    section.appendChild(el('h1', { className: 'page-title', text: 'Regiones cafeteras' }));
    section.appendChild(el('p', { className: 'page-sub', text: 'Elige la región de tu finca. Cada una tiene su abeja nativa y su ciclo de cosecha.' }));

    const pills = el('div', { className: 'pills' });
    const allPills = [{ id: 'all', label: 'Todas las regiones' }].concat(DATA.countries.map(c => ({ id: c.id, label: c.label })));
    allPills.forEach(p => {
      const on = p.id === state.filter;
      pills.appendChild(el('button', {
        className: 'pill' + (on ? ' pill-on' : ''),
        type: 'button',
        onClick: () => { state.filter = p.id; render(); }
      }, p.label));
    });
    section.appendChild(pills);

    const cards = DATA.regions.filter(r => state.filter === 'all' || r.cc === state.filter);
    section.appendChild(el('p', { className: 'muted', text: cards.length + (cards.length === 1 ? ' región cafetera' : ' regiones cafeteras') }));

    const grid = el('div', { className: 'region-grid' });
    cards.forEach(r => {
      const cn = getCountry(r.cc);
      const on = r.id === state.regionId;
      const card = el('article', { className: 'region-card' + (on ? ' region-card-on' : '') });

      if (r.pilot) {
        card.appendChild(el('div', { className: 'pilot-badge', text: 'REGIÓN PILOTO' }));
      }

      const sky = el('div', { className: 'region-sky', style: 'background: ' + cn.sky });
      sky.appendChild(el('span', { className: 'country-tag', text: cn.label }));
      card.appendChild(sky);

      const body = el('div', { className: 'region-body' });
      body.appendChild(el('h3', { text: r.name }));
      body.appendChild(el('span', { className: 'muted', text: 'Altitud aprox. ' + r.alt }));
      body.appendChild(el('span', { className: 'muted', text: 'Cosecha: ' + ((DATA.cycle[r.id] || {}).harvest || r.harvest) }));
      body.appendChild(el('span', { className: 'bee-line', text: '🐝 ' + r.bee }));

      body.appendChild(el('button', {
        className: 'btn' + (on ? ' btn-primary' : ' btn-outline'),
        type: 'button',
        onClick: () => {
          state.regionId = r.id;
          state.tab = 'panel';
          render();
        }
      }, on ? 'Región activa' : 'Elegir región'));

      card.appendChild(body);
      grid.appendChild(card);
    });
    section.appendChild(grid);
    return section;
  }

  function renderPanel() {
    const region = getRegion(state.regionId);
    const country = getCountry(region.cc);
    const cyc = DATA.cycle[region.id];
    const windows = windowsFor(region.id);
    const keysNow = phaseKeys(state.m, region.id);
    const hives = BeesModule.hivesForRegion(region.id);

    const section = el('section', { className: 'section' });
    section.appendChild(el('h1', { className: 'page-title', text: region.name + ', ' + country.label }));
    section.appendChild(el('p', { className: 'page-sub', text: 'Altitud ' + region.alt + ' · Abeja nativa: ' + region.bee }));

    const banner = el('div', { className: 'banner', style: 'background: ' + (keysNow.includes('cosecha') ? '#DCE3D2' : '#EFE6D6') });
    banner.appendChild(el('strong', { text: 'Ciclo actual' }));
    banner.appendChild(el('p', {
      text: 'Floración principal aprox. en ' + windows.map(w => DATA.monthsLower[w.flower]).join(' y ') +
        ' · Cosecha: ' + cyc.harvest + '.'
    }));
    section.appendChild(banner);

    const stats = el('div', { className: 'stats-row' });
    stats.appendChild(statCard('Colmenas registradas', String(hives.length), 'En esta región'));
    stats.appendChild(statCard('Abeja nativa', region.bee.split('(')[0].trim(), 'Especie prioritaria'));
    stats.appendChild(statCard('Mes sin flor', DATA.months[region.gap], 'Hueco de alimento'));
    section.appendChild(stats);

    section.appendChild(el('div', { className: 'note-box' }, [
      el('strong', { text: 'Nota de la región' }),
      el('p', { text: DATA.notes[region.cc] })
    ]));

    const guide = el('div', { className: 'card' });
    guide.appendChild(el('h2', { text: 'Guía de ' + DATA.monthsLower[state.m] }));
    const pills = el('div', { className: 'phase-pills' });
    keysNow.forEach(k => {
      const ph = DATA.phases[k];
      pills.appendChild(el('span', {
        className: 'phase-pill',
        style: 'background:' + ph.bg + ';color:' + ph.fg,
        text: ph.label
      }));
    });
    guide.appendChild(pills);
    guide.appendChild(el('p', { className: 'intro', text: DATA.phases[keysNow[0]].intro }));

    const taskList = el('ul', { className: 'task-list' });
    keysNow.forEach((k, idx) => {
      const ph = DATA.phases[k];
      ph.tasks.slice(0, idx === 0 ? ph.tasks.length : 2).forEach(t => {
        const li = el('li');
        li.appendChild(el('span', { className: 'task-dot', style: 'background:' + ph.bg }));
        li.appendChild(el('span', { text: t.t }));
        if (t.note) li.appendChild(el('small', { className: 'task-note', text: t.note }));
        taskList.appendChild(li);
      });
    });
    guide.appendChild(taskList);
    section.appendChild(guide);

    return section;
  }

  function statCard(label, value, sub) {
    const c = el('div', { className: 'stat-card' });
    c.appendChild(el('span', { className: 'stat-label', text: label }));
    c.appendChild(el('strong', { className: 'stat-value', text: value }));
    if (sub) c.appendChild(el('span', { className: 'muted', text: sub }));
    return c;
  }

  // ── Colmenas & Reinas ────────────────────────────────────
  function renderColmenas() {
    const region = getRegion(state.regionId);
    const allHives = BeesModule.loadHives();
    const regionHives = allHives.filter(h => h.regionId === state.regionId);
    const gap = BeesModule.forageGapAlert(region);

    const section = el('section', { className: 'section' });
    section.appendChild(el('h1', { className: 'page-title', text: 'Colmenas & Reinas' }));
    section.appendChild(el('p', { className: 'page-sub', text: 'Registro y seguimiento de colonias nativas en ' + region.name + '. Marca la reina y vincula la colmena a una zona de forrajeo.' }));

    if (gap) {
      section.appendChild(el('div', { className: 'alert alert-warn' }, [
        el('strong', { text: 'Zona de forrajeo' }),
        el('p', { text: gap.message })
      ]));
    }

    const stats = el('div', { className: 'stats-row' });
    stats.appendChild(statCard('Colmenas en región', String(regionHives.length), region.name));
    const marked = regionHives.filter(h => h.queen && h.queen.marked).length;
    stats.appendChild(statCard('Reinas marcadas', String(marked), 'Código de color por año'));
    const active = regionHives.filter(h => h.status === 'activa').length;
    stats.appendChild(statCard('Colonias activas', String(active), 'Con reina presente'));
    section.appendChild(stats);

    const actions = el('div', { className: 'actions-row' });
    actions.appendChild(el('button', {
      className: 'btn btn-primary',
      type: 'button',
      onClick: () => {
        state.beeFormOpen = !state.beeFormOpen;
        state.editingHiveId = null;
        state.beeMsg = '';
        render();
      }
    }, state.beeFormOpen ? 'Cerrar formulario' : '+ Registrar colmena'));
    section.appendChild(actions);

    if (state.beeMsg) {
      section.appendChild(el('div', { className: 'alert alert-ok', text: state.beeMsg }));
    }

    if (state.beeFormOpen) {
      section.appendChild(renderHiveForm());
    }

    if (regionHives.length === 0) {
      section.appendChild(el('div', { className: 'empty-state' }, [
        el('p', { text: 'Aún no hay colmenas registradas en esta región.' }),
        el('p', { className: 'muted', text: 'Registra la primera y marca su reina para empezar el seguimiento.' })
      ]));
    } else {
      const list = el('div', { className: 'hive-list' });
      regionHives.forEach(h => list.appendChild(renderHiveCard(h)));
      section.appendChild(list);
    }

    section.appendChild(renderQueenColorGuide());
    return section;
  }

  function renderHiveForm() {
    const region = getRegion(state.regionId);
    const currentYear = new Date().getFullYear();
    const form = el('form', { className: 'card form-card', onSubmit: function (e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      const marked = fd.get('marked') === 'on';
      BeesModule.addHive({
        name: fd.get('name'),
        species: fd.get('species') || region.bee,
        regionId: state.regionId,
        zone: fd.get('zone'),
        status: fd.get('status'),
        marked: marked,
        queenYear: fd.get('queenYear'),
        markedDate: fd.get('markedDate'),
        queenNotes: fd.get('queenNotes'),
        notes: fd.get('notes'),
        installed: fd.get('installed')
      });
      state.beeFormOpen = false;
      state.beeMsg = 'Colmena registrada. ' + (marked ? 'Reina marcada con el color del año.' : 'Recuerda marcar la reina en la próxima revisión.');
      render();
    }});

    form.appendChild(el('h2', { text: 'Nueva colmena' }));

    form.appendChild(field('Nombre o código', el('input', { name: 'name', required: true, placeholder: 'Ej. Angelita A3', className: 'input' })));
    form.appendChild(field('Especie', el('input', { name: 'species', value: region.bee, className: 'input' })));
    form.appendChild(field('Zona de forrajeo / lote', el('input', { name: 'zone', placeholder: 'Ej. Franja 1 · Lote 2', className: 'input' })));

    const statusSelect = el('select', { name: 'status', className: 'input' });
    DATA.hiveStatuses.forEach(s => {
      statusSelect.appendChild(el('option', { value: s.id, text: s.label }));
    });
    form.appendChild(field('Estado de la colonia', statusSelect));

    form.appendChild(field('Fecha de instalación', el('input', { name: 'installed', type: 'date', value: new Date().toISOString().slice(0, 10), className: 'input' })));

    const queenBlock = el('div', { className: 'queen-block' });
    queenBlock.appendChild(el('h3', { text: 'Marcado de la reina' }));
    queenBlock.appendChild(el('p', { className: 'muted', text: 'Código internacional de color por año. Marcar la reina permite seguir su edad y estado en revisiones futuras.' }));

    const markCheck = el('label', { className: 'check-label' });
    markCheck.appendChild(el('input', { name: 'marked', type: 'checkbox', id: 'mark-queen' }));
    markCheck.appendChild(document.createTextNode(' Marcar reina ahora'));
    queenBlock.appendChild(markCheck);

    const yearInput = el('input', { name: 'queenYear', type: 'number', min: 2020, max: 2035, value: currentYear, className: 'input', style: 'max-width:120px' });
    queenBlock.appendChild(field('Año del color (dígito final)', yearInput));

    const colorPreview = el('div', { className: 'color-preview', id: 'color-preview' });
    updateColorPreview(colorPreview, currentYear);
    yearInput.addEventListener('input', function () {
      updateColorPreview(colorPreview, Number(yearInput.value) || currentYear);
    });
    queenBlock.appendChild(colorPreview);

    queenBlock.appendChild(field('Fecha de marcado', el('input', { name: 'markedDate', type: 'date', value: new Date().toISOString().slice(0, 10), className: 'input' })));
    queenBlock.appendChild(field('Notas de la reina', el('textarea', { name: 'queenNotes', rows: 2, className: 'input', placeholder: 'Origen, postura observada, etc.' })));

    form.appendChild(queenBlock);
    form.appendChild(field('Notas generales de la colmena', el('textarea', { name: 'notes', rows: 2, className: 'input' })));

    const btns = el('div', { className: 'form-actions' });
    btns.appendChild(el('button', { type: 'submit', className: 'btn btn-primary' }, 'Guardar colmena'));
    btns.appendChild(el('button', {
      type: 'button',
      className: 'btn btn-outline',
      onClick: function () { state.beeFormOpen = false; render(); }
    }, 'Cancelar'));
    form.appendChild(btns);

    return form;
  }

  function updateColorPreview(container, year) {
    const info = getQueenColorForYear(year);
    container.innerHTML = '';
    const swatch = el('span', {
      className: 'color-swatch',
      style: 'background:' + info.hex + ';border:1px solid #ccc'
    });
    container.appendChild(swatch);
    container.appendChild(el('span', { text: ' Color del año ' + year + ': ' + info.name }));
  }

  function field(label, input) {
    const wrap = el('label', { className: 'field' });
    wrap.appendChild(el('span', { className: 'field-label', text: label }));
    wrap.appendChild(input);
    return wrap;
  }

  function renderHiveCard(h) {
    const st = BeesModule.statusInfo(h.status);
    const card = el('article', { className: 'hive-card' });

    const head = el('div', { className: 'hive-head' });
    head.appendChild(el('h3', { text: h.name }));
    head.appendChild(el('span', {
      className: 'status-badge',
      style: 'background:' + st.color + '22;color:' + st.color + ';border:1px solid ' + st.color,
      text: st.label
    }));
    card.appendChild(head);

    card.appendChild(el('p', { className: 'muted', text: h.species }));
    card.appendChild(el('p', { text: '📍 ' + h.zone }));

    const queenBox = el('div', { className: 'queen-info' });
    if (h.queen && h.queen.marked) {
      const row = el('div', { className: 'queen-row' });
      row.appendChild(el('span', {
        className: 'color-swatch',
        style: 'background:' + h.queen.colorHex + ';border:1px solid #999'
      }));
      row.appendChild(el('span', {
        text: 'Reina marcada · ' + h.queen.colorName + ' (' + h.queen.colorYear + ') · ' + (h.queen.markedDate || '—')
      }));
      queenBox.appendChild(row);
      if (h.queen.notes) queenBox.appendChild(el('p', { className: 'muted small', text: h.queen.notes }));
    } else {
      queenBox.appendChild(el('p', { className: 'muted', text: 'Reina aún no marcada' }));
      queenBox.appendChild(el('button', {
        className: 'btn btn-sm btn-outline',
        type: 'button',
        onClick: function () {
          const year = new Date().getFullYear();
          BeesModule.updateHive(h.id, {
            markQueen: true,
            queenYear: year,
            markedDate: new Date().toISOString().slice(0, 10)
          });
          state.beeMsg = 'Reina marcada con el color del año ' + year + '.';
          render();
        }
      }, 'Marcar reina ahora'));
    }
    card.appendChild(queenBox);

    if (h.notes) card.appendChild(el('p', { className: 'hive-notes', text: h.notes }));

    const foot = el('div', { className: 'hive-foot' });
    foot.appendChild(el('span', { className: 'muted small', text: 'Instalada: ' + (h.installed || '—') + ' · Última revisión: ' + (h.lastCheck || '—') }));
    foot.appendChild(el('button', {
      className: 'btn btn-sm btn-danger',
      type: 'button',
      onClick: function () {
        if (confirm('¿Eliminar la colmena «' + h.name + '»?')) {
          BeesModule.deleteHive(h.id);
          state.beeMsg = 'Colmena eliminada.';
          render();
        }
      }
    }, 'Eliminar'));
    card.appendChild(foot);

    return card;
  }

  function renderQueenColorGuide() {
    const box = el('div', { className: 'card' });
    box.appendChild(el('h2', { text: 'Código de colores de la reina' }));
    box.appendChild(el('p', { className: 'muted', text: 'Estándar internacional: el color corresponde al dígito final del año de marcado. Así se estima la edad de la reina en revisiones posteriores.' }));

    const grid = el('div', { className: 'color-grid' });
    const seen = {};
    [1, 2, 3, 4, 5].forEach(function (d) {
      const info = DATA.queenColors[d];
      if (seen[info.name]) return;
      seen[info.name] = true;
      const item = el('div', { className: 'color-item' });
      item.appendChild(el('span', { className: 'color-swatch lg', style: 'background:' + info.hex + ';border:1px solid #ccc' }));
      item.appendChild(el('div', {}, [
        el('strong', { text: info.name }),
        el('span', { className: 'muted small', text: 'Años ' + info.yearHint })
      ]));
      grid.appendChild(item);
    });
    box.appendChild(grid);
    return box;
  }

  // ── Calendario ───────────────────────────────────────────
  function renderCalendario() {
    const region = getRegion(state.regionId);
    const section = el('section', { className: 'section' });
    section.appendChild(el('h1', { className: 'page-title', text: 'Calendario de la finca' }));
    section.appendChild(el('p', { className: 'page-sub', text: region.name + ' · ' + DATA.months[state.m] + ' ' + state.y }));

    const nav = el('div', { className: 'cal-nav' });
    nav.appendChild(el('button', {
      className: 'btn btn-outline',
      type: 'button',
      onClick: function () {
        var m = state.m - 1, y = state.y;
        if (m < 0) { m = 11; y -= 1; }
        state.m = m; state.y = y;
        state.sel = ds(y, m, 1);
        render();
      }
    }, '←'));
    nav.appendChild(el('strong', { text: DATA.months[state.m] + ' ' + state.y }));
    nav.appendChild(el('button', {
      className: 'btn btn-outline',
      type: 'button',
      onClick: function () {
        var m = state.m + 1, y = state.y;
        if (m > 11) { m = 0; y += 1; }
        state.m = m; state.y = y;
        state.sel = ds(y, m, 1);
        render();
      }
    }, '→'));
    section.appendChild(nav);

    const ribbon = el('div', { className: 'phase-ribbon' });
    DATA.months.forEach(function (mn, i) {
      const ks = phaseKeys(i, region.id);
      const p1 = DATA.phases[ks[0]];
      const on = i === state.m;
      const cell = el('button', {
        className: 'ribbon-cell' + (on ? ' ribbon-on' : ''),
        type: 'button',
        style: 'background:' + p1.bg + ';color:' + p1.fg,
        title: mn + ': ' + ks.map(function (k) { return DATA.phases[k].label; }).join(' y '),
        onClick: function () {
          state.m = i;
          state.sel = ds(state.y, i, 1);
          render();
        }
      }, mn.slice(0, 3));
      ribbon.appendChild(cell);
    });
    section.appendChild(ribbon);

    const first = (new Date(state.y, state.m, 1).getDay() + 6) % 7;
    const dim = new Date(state.y, state.m + 1, 0).getDate();
    const total = Math.ceil((first + dim) / 7) * 7;

    const grid = el('div', { className: 'cal-grid' });
    ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].forEach(function (d) {
      grid.appendChild(el('div', { className: 'cal-head', text: d }));
    });

    for (var i = 0; i < total; i++) {
      var d = i - first + 1;
      if (d < 1 || d > dim) {
        grid.appendChild(el('div', { className: 'cal-cell empty' }));
        continue;
      }
      var dstr = ds(state.y, state.m, d);
      var dow = new Date(state.y, state.m, d).getDay();
      var evs = eventsFor(dstr, dow, state.m, d, region.id);
      var isToday = dstr === TODAY;
      var isSel = dstr === state.sel;

      var cell = el('button', {
        className: 'cal-cell' + (isToday ? ' today' : '') + (isSel ? ' selected' : ''),
        type: 'button',
        onClick: (function (ds) {
          return function () { state.sel = ds; state.msg = ''; render(); };
        })(dstr)
      });
      cell.appendChild(el('span', { className: 'day-num', text: String(d) }));
      if (evs[0]) {
        cell.appendChild(el('span', {
          className: 'cal-chip',
          style: 'background:' + (DATA.types[evs[0].type] ? DATA.types[evs[0].type].bg : '#eee'),
          text: evs[0].chip || (DATA.types[evs[0].type] ? DATA.types[evs[0].type].short : '')
        }));
      }
      if (evs.length > 1) {
        cell.appendChild(el('span', { className: 'cal-more', text: '+' + (evs.length - 1) }));
      }
      grid.appendChild(cell);
    }
    section.appendChild(grid);

    var parts = state.sel.split('-').map(Number);
    var selDate = new Date(parts[0], parts[1] - 1, parts[2]);
    var selLabel = DATA.days[selDate.getDay()] + ' ' + parts[2] + ' de ' + DATA.monthsLower[parts[1] - 1];
    var selEvents = eventsFor(state.sel, selDate.getDay(), parts[1] - 1, parts[2], region.id);

    var detail = el('div', { className: 'card day-detail' });
    detail.appendChild(el('h2', { text: selLabel }));

    if (selEvents.length === 0) {
      detail.appendChild(el('p', { className: 'muted', text: 'Sin tareas programadas este día.' }));
    } else {
      var ul = el('ul', { className: 'event-list' });
      selEvents.forEach(function (e) {
        var li = el('li');
        var badge = el('span', {
          className: 'event-badge',
          style: 'background:' + (DATA.types[e.type] ? DATA.types[e.type].bg : '#eee')
        });
        li.appendChild(badge);
        var text = el('div');
        text.appendChild(el('strong', { text: e.title }));
        if (e.phaseLabel) text.appendChild(el('span', { className: 'muted', text: ' · Labor · ' + e.phaseLabel }));
        if (e.detail) text.appendChild(el('span', { className: 'muted', text: ' · ' + e.detail }));
        text.appendChild(el('span', {
          className: 'status-tag',
          text: e.done ? (e.detail ? 'Hecho · ' + e.detail : 'Hecho') : 'Programado'
        }));
        if (e.note) text.appendChild(el('p', { className: 'task-note', text: e.note }));
        li.appendChild(text);
        ul.appendChild(li);
      });
      detail.appendChild(ul);
    }

    var form = el('div', { className: 'record-form' });
    form.appendChild(el('h3', { text: 'Registrar medición' }));
    var typeSelect = el('select', {
      className: 'input',
      onChange: function (e) { state.ftype = e.target.value; state.msg = ''; render(); }
    });
    Object.keys(DATA.forms).forEach(function (k) {
      var f = DATA.forms[k];
      var opt = el('option', { value: k, text: f.title });
      if (k === state.ftype) opt.selected = true;
      typeSelect.appendChild(opt);
    });
    form.appendChild(typeSelect);

    var unit = DATA.forms[state.ftype].unit;
    form.appendChild(el('input', {
      className: 'input',
      type: 'text',
      placeholder: 'Valor (' + unit + ')',
      value: state.fvalue,
      onInput: function (e) { state.fvalue = e.target.value; }
    }));

    form.appendChild(el('button', {
      className: 'btn btn-primary',
      type: 'button',
      onClick: function () {
        var v = String(state.fvalue).trim();
        if (!v) {
          state.msg = 'Escribe un valor para guardar.';
          render();
          return;
        }
        state.records = state.records.concat([{ date: state.sel, key: state.ftype, value: v }]);
        var heavy = state.ftype === 'lluvia' && Number(v) >= 20;
        state.fvalue = '';
        state.msg = heavy
          ? 'Medición guardada. Con lluvia fuerte conviene no fumigar ese día.'
          : 'Medición guardada en el calendario.';
        render();
      }
    }, 'Guardar'));

    if (state.msg) form.appendChild(el('p', { className: 'form-msg', text: state.msg }));
    detail.appendChild(form);
    section.appendChild(detail);

    return section;
  }

  // ── Gráficos ─────────────────────────────────────────────
  function renderGraficos() {
    const region = getRegion(state.regionId);
    const section = el('section', { className: 'section' });
    section.appendChild(el('h1', { className: 'page-title', text: 'Gráficos de la finca' }));
    section.appendChild(el('p', { className: 'page-sub', text: 'Datos de ejemplo · ' + region.name }));

    section.appendChild(chartCard('Kilos de café por lote', 'Comparación con abejas vs. control', buildBarChartKilos()));
    section.appendChild(chartCard('Humedad de la cáscara · Lote 3', 'Porcentaje durante el secado, con proyección', buildLineChartMoisture()));
    section.appendChild(chartCard('Floración de las franjas por mes', 'Cuánto alimento hay para las abejas en ' + region.name, buildHeatmap(region)));
    section.appendChild(chartCard('Lluvia semanal y floración', 'Pluviómetro de la finca · milímetros por semana · últimas 10 semanas', buildBarChartRain()));
    section.appendChild(chartCard('Ingresos por fuente', 'Índice de ingreso de la finca (sin proyecto = 100)', buildIncomeBars()));

    return section;
  }

  function chartCard(title, sub, content) {
    const card = el('div', { className: 'card chart-card' });
    card.appendChild(el('h2', { text: title }));
    card.appendChild(el('p', { className: 'muted', text: sub }));
    card.appendChild(content);
    return card;
  }

  function buildBarChartKilos() {
    var withBees = [210, 245, 260, 198];
    var control = [185, 212, 228, 176];
    var labels = ['Lote 1', 'Lote 2', 'Lote 3', 'Lote 4'];
    var max = 300;

    var wrap = el('div', { className: 'svg-wrap' });
    var legend = el('div', { className: 'legend' });
    legend.appendChild(el('span', { className: 'leg-item' }, [
      el('span', { className: 'leg-swatch', style: 'background:#C27F0B' }),
      ' Con abejas'
    ]));
    legend.appendChild(el('span', { className: 'leg-item' }, [
      el('span', { className: 'leg-swatch', style: 'background:#4A2C1C' }),
      ' Control'
    ]));
    wrap.appendChild(legend);

    var svg = '<svg viewBox="0 0 520 250" width="100%" role="img" aria-label="Gráfico de barras: kilos de café por lote">';
    [0, 100, 200, 300].forEach(function (v) {
      var y = 210 - (v / max) * 190;
      svg += '<line x1="48" y1="' + y + '" x2="500" y2="' + y + '" stroke="#E4DDD0" stroke-width="1"/>';
      svg += '<text x="40" y="' + (y + 4) + '" font-size="11" fill="#6E6459" text-anchor="end">' + v + '</text>';
    });
    labels.forEach(function (lab, i) {
      var x = 104.5 + i * 113;
      svg += '<text x="' + x + '" y="232" font-size="11" fill="#6E6459" text-anchor="middle">' + lab + '</text>';
      var h1 = (withBees[i] / max) * 190;
      var h2 = (control[i] / max) * 190;
      svg += '<rect x="' + (x - 38) + '" y="' + (210 - h1) + '" width="34" height="' + h1 + '" rx="4" fill="#C27F0B"/>';
      svg += '<rect x="' + (x + 4) + '" y="' + (210 - h2) + '" width="34" height="' + h2 + '" rx="4" fill="#4A2C1C"/>';
      svg += '<text x="' + (x - 21) + '" y="' + (210 - h1 - 6) + '" font-size="11" font-weight="700" fill="#2A2622" text-anchor="middle">' + withBees[i] + '</text>';
      svg += '<text x="' + (x + 21) + '" y="' + (210 - h2 - 6) + '" font-size="11" font-weight="700" fill="#2A2622" text-anchor="middle">' + control[i] + '</text>';
    });
    svg += '</svg>';
    wrap.appendChild(el('div', { html: svg }));
    return wrap;
  }

  function buildLineChartMoisture() {
    var points = [
      { d: 1, v: 55 }, { d: 2, v: 42 }, { d: 3, v: 33 }, { d: 4, v: 26 },
      { d: 5, v: 21 }, { d: 6, v: 17.5 }, { d: 7, v: 14.8 }
    ];
    var proj = [{ d: 7, v: 14.8 }, { d: 8, v: 13.2 }, { d: 9, v: 11.8 }];

    var wrap = el('div', { className: 'svg-wrap' });
    var legend = el('div', { className: 'legend' });
    legend.appendChild(el('span', { className: 'leg-item' }, [el('span', { className: 'leg-line', style: 'background:#4A2C1C' }), ' Medido']));
    legend.appendChild(el('span', { className: 'leg-item' }, [el('span', { className: 'leg-line', style: 'background:#9A8573' }), ' Proyección']));
    legend.appendChild(el('span', { className: 'leg-item' }, [el('span', { className: 'leg-line', style: 'background:#B5573A' }), ' Umbral 12 %']));
    wrap.appendChild(legend);

    function xOf(d) { return 60 + ((d - 1) / 8) * 430; }
    function yOf(v) { return 210 - (v / 60) * 190; }

    var svg = '<svg viewBox="0 0 520 250" width="100%" role="img">';
    [0, 20, 40, 60].forEach(function (v) {
      var y = yOf(v);
      svg += '<line x1="48" y1="' + y + '" x2="500" y2="' + y + '" stroke="#E4DDD0"/>';
      svg += '<text x="40" y="' + (y + 4) + '" font-size="11" fill="#6E6459" text-anchor="end">' + v + ' %</text>';
    });
    [1, 3, 5, 7, 9].forEach(function (d) {
      svg += '<text x="' + xOf(d) + '" y="232" font-size="11" fill="#6E6459" text-anchor="middle">Día ' + d + '</text>';
    });
    var uy = yOf(12);
    svg += '<line x1="48" y1="' + uy + '" x2="500" y2="' + uy + '" stroke="#B5573A" stroke-width="2" stroke-dasharray="6 4"/>';
    svg += '<text x="500" y="' + (uy - 8) + '" font-size="11" font-weight="700" fill="#8A2C16" text-anchor="end">Umbral 12 %</text>';

    var pathP = proj.map(function (p, i) { return (i ? 'L' : 'M') + xOf(p.d) + ',' + yOf(p.v); }).join(' ');
    svg += '<path d="' + pathP + '" fill="none" stroke="#9A8573" stroke-width="3" stroke-dasharray="3 6" stroke-linecap="round"/>';

    var pathM = points.map(function (p, i) { return (i ? 'L' : 'M') + xOf(p.d) + ',' + yOf(p.v); }).join(' ');
    svg += '<path d="' + pathM + '" fill="none" stroke="#4A2C1C" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>';
    points.forEach(function (p) {
      svg += '<circle cx="' + xOf(p.d) + '" cy="' + yOf(p.v) + '" r="3.5" fill="#4A2C1C"/>';
    });
    var last = points[points.length - 1];
    svg += '<circle cx="' + xOf(last.d) + '" cy="' + yOf(last.v) + '" r="5.5" fill="#B5573A"/>';
    svg += '<text x="' + xOf(last.d) + '" y="' + (yOf(last.v) - 14) + '" font-size="12" font-weight="700" fill="#8A2C16" text-anchor="middle">Hoy: 14,8 %</text>';
    svg += '</svg>';
    wrap.appendChild(el('div', { html: svg }));
    return wrap;
  }

  function buildHeatmap(region) {
    var heat = buildHeat(region);
    var wrap = el('div', { className: 'heat-wrap' });
    var legend = el('div', { className: 'legend' });
    [
      { bg: '#EFE6D6', bd: '#D8CDB9', t: 'Sin flor' },
      { bg: '#F1D28A', t: 'Baja' },
      { bg: '#DDA73B', t: 'Media' },
      { bg: '#A8661A', t: 'Alta' }
    ].forEach(function (l) {
      legend.appendChild(el('span', { className: 'leg-item' }, [
        el('span', { className: 'leg-swatch', style: 'background:' + l.bg + ';border:1px solid ' + (l.bd || l.bg) }),
        ' ' + l.t
      ]));
    });
    wrap.appendChild(legend);

    var table = el('div', { className: 'heat-table' });
    var header = el('div', { className: 'heat-row heat-header' });
    header.appendChild(el('span', { className: 'heat-label' }));
    DATA.months.forEach(function (m) {
      header.appendChild(el('span', { className: 'heat-mon', text: m.slice(0, 3) }));
    });
    table.appendChild(header);

    var row;
    heat.forEach(function (h) {
      if (h.isLabel) {
        row = el('div', { className: 'heat-row' });
        row.appendChild(el('span', { className: 'heat-label', text: h.label }));
        table.appendChild(row);
      } else {
        row.appendChild(el('div', {
          className: 'heat-cell',
          style: 'background:' + h.bg + ';border:2px solid ' + h.bd
        }));
      }
    });
    wrap.appendChild(table);
    wrap.appendChild(el('p', {
      className: 'alert-inline',
      text: 'Borde rojo: mes sin alimento (' + DATA.monthsLower[region.gap] + '). Siembra algo que florezca en esa época.'
    }));
    return wrap;
  }

  function buildBarChartRain() {
    var values = [38, 12, 4, 2, 9, 46, 62, 24, 30, 59];
    var max = 80;
    var wrap = el('div', { className: 'svg-wrap' });
    var legend = el('div', { className: 'legend' });
    legend.appendChild(el('span', { className: 'leg-item' }, [el('span', { className: 'leg-swatch', style: 'background:#4F7A95' }), ' Lluvia de la semana']));
    legend.appendChild(el('span', { className: 'leg-item' }, [el('span', { className: 'leg-swatch', style: 'background:#F1E2B5' }), ' Periodo seco']));
    legend.appendChild(el('span', { className: 'leg-item' }, [el('span', { className: 'leg-swatch', style: 'background:#4F7A95;border:2px solid #2A2622' }), ' Primera lluvia tras sequía']));
    wrap.appendChild(legend);

    var svg = '<svg viewBox="0 0 520 250" width="100%">';
    svg += '<rect x="93" y="20" width="181" height="190" fill="#F1E2B5" opacity="0.7"/>';
    svg += '<text x="183.5" y="36" font-size="12" font-weight="700" fill="#7A4A07" text-anchor="middle">Periodo seco</text>';
    [0, 20, 40, 60, 80].forEach(function (v) {
      var y = 210 - (v / max) * 190;
      svg += '<line x1="48" y1="' + y + '" x2="500" y2="' + y + '" stroke="#E4DDD0"/>';
      svg += '<text x="40" y="' + (y + 4) + '" font-size="11" fill="#6E6459" text-anchor="end">' + v + '</text>';
    });
    values.forEach(function (v, i) {
      var x = 70.6 + i * 45.2;
      var h = (v / max) * 190;
      var stroke = i === 5 ? ' stroke="#2A2622" stroke-width="2.5"' : '';
      svg += '<rect x="' + (x - 15) + '" y="' + (210 - h) + '" width="30" height="' + h + '" rx="3" fill="#4F7A95"' + stroke + '/>';
      svg += '<text x="' + x + '" y="' + (210 - h - 6) + '" font-size="11" font-weight="700" fill="#2A2622" text-anchor="middle">' + v + '</text>';
      svg += '<text x="' + x + '" y="232" font-size="11" fill="#6E6459" text-anchor="middle">S' + (i + 1) + '</text>';
    });
    svg += '</svg>';
    wrap.appendChild(el('div', { html: svg }));
    wrap.appendChild(el('p', {
      className: 'chart-note',
      text: 'Tras 4 semanas con poca lluvia, la semana 6 trajo 46 mm: es la señal típica para que el cafetal florezca. Cuando veas flores, anota la fecha en el calendario.'
    }));
    return wrap;
  }

  function buildIncomeBars() {
    var wrap = el('div', { className: 'income-wrap' });
    var legend = el('div', { className: 'legend' });
    legend.appendChild(el('span', { className: 'leg-item' }, [el('span', { className: 'leg-swatch', style: 'background:#4A2C1C' }), ' Café']));
    legend.appendChild(el('span', { className: 'leg-item' }, [el('span', { className: 'leg-swatch', style: 'background:#D9A23A' }), ' Miel']));
    legend.appendChild(el('span', { className: 'leg-item' }, [el('span', { className: 'leg-swatch', style: 'background:#B5573A' }), ' Infusión de cáscara']));
    wrap.appendChild(legend);

    wrap.appendChild(el('p', { className: 'muted', text: 'Sin proyecto (solo café)' }));
    wrap.appendChild(el('div', { className: 'income-bar', style: 'width:74.6%;background:#4A2C1C' }, '100'));

    wrap.appendChild(el('p', { className: 'muted', style: 'margin-top:12px', text: 'Con Café Vivo' }));
    var bar2 = el('div', { className: 'income-bar-stack' });
    bar2.appendChild(el('div', { className: 'income-seg', style: 'width:85%;background:#4A2C1C;color:#fff' }, '114'));
    bar2.appendChild(el('div', { className: 'income-seg', style: 'width:9%;background:#D9A23A;color:#2A2622' }, '12'));
    bar2.appendChild(el('div', { className: 'income-seg', style: 'width:6%;background:#B5573A;color:#fff' }, '8'));
    wrap.appendChild(bar2);

    wrap.appendChild(el('p', {
      className: 'chart-note',
      text: 'El agricultor gana por tres vías: más café (polinización), venta de miel y venta de la infusión de cáscara.'
    }));
    return wrap;
  }

  // ── Shell ────────────────────────────────────────────────
  function renderNav() {
    var tabs = [
      { id: 'regiones', label: 'Regiones' },
      { id: 'panel', label: 'Panel' },
      { id: 'colmenas', label: 'Colmenas & Reinas' },
      { id: 'calendario', label: 'Calendario' },
      { id: 'graficos', label: 'Gráficos' }
    ];
    var nav = el('nav', { className: 'main-nav' });
    tabs.forEach(function (t) {
      var on = state.tab === t.id;
      nav.appendChild(el('button', {
        className: 'nav-btn' + (on ? ' nav-on' : ''),
        type: 'button',
        'aria-current': on ? 'page' : 'false',
        onClick: function () { state.tab = t.id; state.beeMsg = ''; render(); }
      }, t.label));
    });
    return nav;
  }

  function renderFooter() {
    var footer = el('footer', { className: 'site-footer' });
    var inner = el('div', { className: 'footer-inner' });
    var brand = el('div', { className: 'footer-brand' });
    brand.appendChild(el('span', { className: 'brand-name', text: 'CAFÉ VIVO' }));
    brand.appendChild(el('span', { className: 'brand-tag', text: 'Café que cuida a sus abejas' }));
    inner.appendChild(brand);

    var links = el('div', { className: 'footer-links' });
    ['regiones', 'panel', 'colmenas', 'calendario', 'graficos'].forEach(function (id) {
      var labels = { regiones: 'Regiones', panel: 'Panel', colmenas: 'Colmenas', calendario: 'Calendario', graficos: 'Gráficos' };
      links.appendChild(el('button', {
        type: 'button',
        onClick: function () { state.tab = id; render(); window.scrollTo(0, 0); }
      }, labels[id]));
    });
    inner.appendChild(links);
    inner.appendChild(el('span', { className: 'muted small', text: 'Prototipo funcional · datos de ejemplo' }));
    footer.appendChild(inner);
    return footer;
  }

  function render() {
    var root = document.getElementById('app');
    root.innerHTML = '';

    var header = el('header', { className: 'site-header' });
    var headerInner = el('div', { className: 'header-inner' });
    var brand = el('div', { className: 'brand', onClick: function () { state.tab = 'regiones'; render(); } });
    brand.appendChild(el('span', { className: 'brand-name', text: 'CAFÉ VIVO' }));
    brand.appendChild(el('span', { className: 'brand-tag', text: 'Café que cuida a sus abejas' }));
    headerInner.appendChild(brand);

    var region = getRegion(state.regionId);
    headerInner.appendChild(el('span', { className: 'header-region', text: region.name + ' · ' + getCountry(region.cc).label }));
    header.appendChild(headerInner);
    header.appendChild(renderNav());
    root.appendChild(header);

    var main = el('main', { className: 'main' });
    var content;
    switch (state.tab) {
      case 'regiones': content = renderRegiones(); break;
      case 'panel': content = renderPanel(); break;
      case 'colmenas': content = renderColmenas(); break;
      case 'calendario': content = renderCalendario(); break;
      case 'graficos': content = renderGraficos(); break;
      default: content = renderRegiones();
    }
    main.appendChild(content);
    root.appendChild(main);
    root.appendChild(renderFooter());
  }

  function init() {
    render();
  }

  return { init: init, render: render };
})();

document.addEventListener('DOMContentLoaded', App.init);