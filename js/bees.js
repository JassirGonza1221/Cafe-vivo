/**
 * Café Vivo — Módulo de Colmenas & Reinas
 */

const BeesModule = (function () {
  const STORAGE_KEY = 'cafevivo_hives_v1';

  function loadHives() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) {
      console.warn('No se pudo leer localStorage de colmenas', e);
    }
    const samples = JSON.parse(JSON.stringify(DATA.sampleHives));
    saveHives(samples);
    return samples;
  }

  function saveHives(hives) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hives));
    } catch (e) {
      console.warn('No se pudo guardar colmenas', e);
    }
  }

  function generateId() {
    return 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function addHive(data) {
    const hives = loadHives();
    const year = data.queenYear ? Number(data.queenYear) : new Date().getFullYear();
    const colorInfo = getQueenColorForYear(year);

    const hive = {
      id: generateId(),
      name: data.name.trim(),
      species: data.species.trim(),
      regionId: data.regionId,
      zone: data.zone.trim() || 'Sin zona asignada',
      status: data.status || 'nueva',
      queen: {
        marked: !!data.marked,
        colorYear: data.marked ? year : null,
        colorName: data.marked ? colorInfo.name : null,
        colorHex: data.marked ? colorInfo.hex : null,
        markedDate: data.marked ? (data.markedDate || new Date().toISOString().slice(0, 10)) : null,
        notes: data.queenNotes || ''
      },
      installed: data.installed || new Date().toISOString().slice(0, 10),
      lastCheck: data.lastCheck || new Date().toISOString().slice(0, 10),
      notes: data.notes || ''
    };

    hives.push(hive);
    saveHives(hives);
    return hive;
  }

  function updateHive(id, patch) {
    const hives = loadHives();
    const idx = hives.findIndex(h => h.id === id);
    if (idx === -1) return null;

    const hive = hives[idx];
    if (patch.name !== undefined) hive.name = patch.name;
    if (patch.species !== undefined) hive.species = patch.species;
    if (patch.zone !== undefined) hive.zone = patch.zone;
    if (patch.status !== undefined) hive.status = patch.status;
    if (patch.notes !== undefined) hive.notes = patch.notes;
    if (patch.lastCheck !== undefined) hive.lastCheck = patch.lastCheck;

    if (patch.markQueen) {
      const year = Number(patch.queenYear) || new Date().getFullYear();
      const colorInfo = getQueenColorForYear(year);
      hive.queen = {
        marked: true,
        colorYear: year,
        colorName: colorInfo.name,
        colorHex: colorInfo.hex,
        markedDate: patch.markedDate || new Date().toISOString().slice(0, 10),
        notes: patch.queenNotes || hive.queen.notes || ''
      };
    }

    hives[idx] = hive;
    saveHives(hives);
    return hive;
  }

  function deleteHive(id) {
    const hives = loadHives().filter(h => h.id !== id);
    saveHives(hives);
    return hives;
  }

  function hivesForRegion(regionId) {
    return loadHives().filter(h => h.regionId === regionId);
  }

  function statusInfo(statusId) {
    return DATA.hiveStatuses.find(s => s.id === statusId) || DATA.hiveStatuses[0];
  }

  function forageGapAlert(region) {
    if (!region) return null;
    const gapMonth = DATA.monthsLower[region.gap];
    return {
      month: gapMonth,
      message: `Mes sin alimento estimado en las franjas: ${gapMonth}. Siembra algo que florezca en esa época.`
    };
  }

  return {
    loadHives,
    saveHives,
    addHive,
    updateHive,
    deleteHive,
    hivesForRegion,
    statusInfo,
    forageGapAlert,
    getQueenColorForYear
  };
})();