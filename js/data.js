/**
 * Café Vivo — Datos del prototipo
 */

const DATA = {
  months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthsLower: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  days: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],

  types: {
    conteo: { label: 'Conteo de visitas', short: 'Conteo', bg: '#F1E2B5' },
    cajas: { label: 'Revisión de cajas', short: 'Cajas', bg: '#DDE5D0' },
    humedad: { label: 'Humedad', short: 'Humedad', bg: '#E9D3C1' },
    fumigacion: { label: 'Fumigación amigable', short: 'Fumigar', bg: '#F2CFC3' },
    cosecha: { label: 'Pase de recolección', short: 'Pase', bg: '#C3CEB4' },
    labor: { label: 'Labor del cultivo', short: 'Labor', bg: '#D6E3EA' },
    lluvia: { label: 'Lluvia registrada', short: 'Lluvia', bg: '#9CC3DC' }
  },

  forms: {
    conteo: { type: 'conteo', title: 'Conteo de visitas', unit: 'visitas / 5 min' },
    cascara: { type: 'humedad', title: 'Humedad de la cáscara', unit: '%' },
    miel: { type: 'humedad', title: 'Humedad de la miel', unit: '%' },
    colonias: { type: 'cajas', title: 'Colonias activas', unit: 'colonias' },
    lluvia: { type: 'lluvia', title: 'Lluvia del día', unit: 'mm' }
  },

  schedule: {
    '2026-10-05': [{ title: 'Revisión de cajas', type: 'cajas', detail: '12 activas' }],
    '2026-10-14': [{ title: 'Humedad de la miel', type: 'humedad', detail: '27 %' }],
    '2026-10-21': [{ title: 'Humedad de cáscara · Lote 3', type: 'humedad' }],
    '2026-10-23': [{ title: 'Revisión de cajas', type: 'cajas' }],
    '2026-10-24': [{ title: 'Fumigar solo al atardecer y avisar a vecinos', type: 'fumigacion' }],
    '2026-10-30': [{ title: 'Humedad de la miel', type: 'humedad' }],
    '2026-11-04': [{ title: 'Humedad de cáscara · Lote 4', type: 'humedad' }],
    '2026-11-13': [{ title: 'Revisión de cajas', type: 'cajas' }],
    '2026-11-14': [{ title: 'Fumigar solo al atardecer y avisar a vecinos', type: 'fumigacion' }]
  },

  rain: {
    '2026-10-02': 6, '2026-10-03': 14, '2026-10-07': 9,
    '2026-10-09': 21, '2026-10-12': 18, '2026-10-13': 32, '2026-10-15': 9
  },

  cycle: {
    'co-huila': { w: [[3, 5], [9, 11]], harvest: 'principal abr–jun · mitaca oct–dic' },
    'co-eje': { w: [[8, 11], [3, 5]], harvest: 'principal sep–dic · mitaca abr–jun' },
    'co-narino': { w: [[3, 5], [9, 11]], harvest: 'principal abr–jun · mitaca oct–dic' },
    'br-mg': { w: [[4, 8]], harvest: 'may–sep' },
    'br-sp': { w: [[4, 8]], harvest: 'may–sep' },
    'br-es': { w: [[3, 8]], harvest: 'abr–sep' },
    'mx-chis': { w: [[10, 2]], harvest: 'nov–mar' },
    'mx-ver': { w: [[10, 2]], harvest: 'nov–mar' },
    'mx-oax': { w: [[10, 2]], harvest: 'nov–mar' },
    'pe-jun': { w: [[3, 8]], harvest: 'abr–sep' },
    'pe-caj': { w: [[3, 8]], harvest: 'abr–sep' },
    'pe-cus': { w: [[3, 8]], harvest: 'abr–sep' },
    'gt-hue': { w: [[11, 3]], harvest: 'dic–abr' },
    'cr-tar': { w: [[10, 2]], harvest: 'nov–mar' },
    'hn-mar': { w: [[11, 2]], harvest: 'dic–mar' }
  },

  notes: {
    co: 'En Colombia el ciclo cambia con la latitud: en el sur la cosecha principal cae en el primer semestre, en la zona central hay dos cosechas y en el norte una sola, en el segundo semestre (Cenicafé).',
    br: 'En Brasil la floración está más sincronizada y la cosecha va de abril o mayo a septiembre, según la zona y la altitud.',
    mx: 'En México la cosecha va de noviembre a marzo.',
    pe: 'En Perú la cosecha va de abril o mayo a septiembre, con su pico entre junio y agosto.',
    gt: 'En Guatemala la cosecha va de noviembre a abril y cambia con la altitud y la región.',
    cr: 'En Costa Rica, Tarrazú cosecha de noviembre a marzo; otras zonas empiezan antes.',
    hn: 'En Honduras la cosecha va de noviembre a marzo o abril.'
  },

  phases: {
    floracion: {
      label: 'Floración', bg: '#F1D28A', fg: '#2A2622',
      intro: 'Cuando llegan lluvias después de unas semanas secas, el cafetal florece. Esa floración marca la cosecha: entre la flor y el fruto maduro pasan unas 32 semanas (7 a 8 meses).',
      tasks: [
        { t: 'Anota la fecha de la floración principal de cada lote.', cal: 'Anotar floración', chip: 'Floración', days: [5], note: 'Con esa fecha se calculan el control de roya, la fertilización y la cosecha esperada.' },
        { t: 'Registra la lluvia de cada día con un pluviómetro: unas semanas secas seguidas de lluvia son la señal que dispara la floración.', note: 'Cenicafé: más de 10 días con poca lluvia, seguidos de lluvias, rompen el reposo de las yemas florales.' },
        { t: 'Cuenta las visitas de abejas en la franja florida y en la parcela control.', note: 'El conteo de 5 minutos queda en el calendario cada lunes.' },
        { t: 'Evita aplicar agroquímicos con flores abiertas; si es indispensable, hazlo al atardecer y avisa a los vecinos.' },
        { t: 'Revisa que las colmenas estén fuertes y que las franjas tengan flores.', cal: 'Revisar colmenas y franjas', chip: 'Colmenas', days: [12] }
      ]
    },
    cuajado: {
      label: 'Cuajado del fruto', bg: '#DCE3C4', fg: '#2A2622',
      intro: 'El fruto empieza a formarse. Es la etapa en la que más pesan la nutrición y la roya.',
      tasks: [
        { t: 'Fertiliza según el análisis de suelo: la nutrición de los 2 a 3 primeros meses después de la floración es la que más pesa en la cosecha.', cal: 'Fertilizar según análisis de suelo', chip: 'Fertilizar', days: [10] },
        { t: 'Si tu variedad es susceptible a la roya, inicia el control unos 60 días después de la floración principal.', cal: 'Iniciar control de roya', chip: 'Roya', days: [22], note: 'Luego repite cada 45 o 60 días, según el producto (Cenicafé).' },
        { t: 'Mantén flores en las franjas: las abejas también necesitan alimento cuando el café ya no florece.' }
      ]
    },
    desarrollo: {
      label: 'Desarrollo del fruto', bg: '#B8C6A0', fg: '#2A2622',
      intro: 'El fruto crece y se llena. Es tiempo de vigilar plagas y de planear la cosecha con el registro de floración.',
      tasks: [
        { t: 'Muestrea la broca en cada lote; el nivel de daño económico es de 5 % de frutos infestados.', cal: 'Muestreo de broca', chip: 'Broca', days: [8] },
        { t: 'Si tu variedad es susceptible, repite el control de roya cada 45 o 60 días.' },
        { t: 'Usa el registro de floración para estimar cuándo madurará cada lote y cuánta mano de obra necesitarás.' },
        { t: 'Sigue la lluvia con tu pluviómetro: tras semanas secas, la primera lluvia fuerte puede disparar una nueva floración.' },
        { t: 'Revisa las colmenas y comprueba que las franjas siguen floreciendo.' }
      ]
    },
    precosecha: {
      label: 'Pre-cosecha', bg: '#E9D3C1', fg: '#2A2622',
      intro: 'Faltan pocas semanas para cosechar: es momento de alistar la finca y el beneficio.',
      tasks: [
        { t: 'Calibra la despulpadora y limpia los tanques; ten al menos dos tanques de fermentación para no mezclar tandas.', cal: 'Calibrar despulpadora y tanques', chip: 'Despulpadora', days: [8] },
        { t: 'Revisa tus secadores o camas de secado y verifica que alcancen para toda la cosecha.', cal: 'Revisar secadores', chip: 'Secadores', days: [14] },
        { t: 'Organiza y capacita a los recolectores: solo frutos maduros (meta: más de 85 % maduros y menos de 2,5 % verdes).', cal: 'Capacitar recolectores', chip: 'Recolectores', days: [20] },
        { t: 'Ten a mano el medidor de humedad y los formatos de registro por lote.' }
      ]
    },
    cosecha: {
      label: 'Cosecha', bg: '#55664A', fg: '#FFFFFF',
      intro: 'Se recolecta por pases, solo lo maduro, y el beneficio empieza de inmediato.',
      tasks: [
        { t: 'Haz pases de recolección cada 2 a 3 semanas, solo con frutos maduros.', cal: 'Pase de recolección', chip: 'Pase', days: [3, 20], note: 'En fincas con dos cosechas, Cenicafé midió entre 14 y 24 días entre pases (promedio de 17,8).' },
        { t: 'Separa por flotación los frutos secos, brocados y vanos antes de despulpar.' },
        { t: 'Fermenta y lava por tandas separadas, sin mezclarlas.' },
        { t: 'Seca cuanto antes hasta 10–12 % de humedad: capas de máximo 2,5 cm al sol, o menos de 50 °C en secador mecánico.' },
        { t: 'Seca la cáscara para la infusión y anota los kilos y la humedad de cada lote.' }
      ]
    },
    poscosecha: {
      label: 'Poscosecha', bg: '#D6E3EA', fg: '#2A2622',
      intro: 'Terminada la cosecha se limpia el cafetal y se prepara el siguiente ciclo.',
      tasks: [
        { t: 'Re-Re: recoge los frutos que quedaron en el árbol y en el suelo para cortar el ciclo de la broca.', cal: 'Re-Re: repase de frutos', chip: 'Re-Re', days: [6], note: 'Cenicafé: baja la infestación hasta 73,6 %; se hace al terminar la cosecha principal y la mitaca.' },
        { t: 'Poda o zoca los lotes viejos (corte del tallo a 30 cm).', cal: 'Poda o zoca de lotes viejos', chip: 'Zoca', days: [20], note: 'La última fertilización antes de zocar debe haberse hecho unos 10 meses antes; después se retoma entre 6 y 12 meses (Cenicafé).' },
        { t: 'Compara los kilos de la parcela con abejas y de la parcela control, y planea nuevas franjas de flores.' }
      ]
    }
  },

  countries: [
    { id: 'co', label: 'Colombia', sky: 'linear-gradient(#DCE8D2, #F3EFE7)', h1: '#7C9A6B', h2: '#5F7F52' },
    { id: 'br', label: 'Brasil', sky: 'linear-gradient(#F6E3B4, #F3EFE7)', h1: '#A8B070', h2: '#7D8F4F' },
    { id: 'mx', label: 'México', sky: 'linear-gradient(#F2D8C3, #F3EFE7)', h1: '#B58A5A', h2: '#8C6A45' },
    { id: 'pe', label: 'Perú', sky: 'linear-gradient(#D6E3EA, #F3EFE7)', h1: '#6C8C7A', h2: '#4F6F63' },
    { id: 'gt', label: 'Guatemala', sky: 'linear-gradient(#E3E0D0, #F3EFE7)', h1: '#7F8F5A', h2: '#5E6E44' },
    { id: 'cr', label: 'Costa Rica', sky: 'linear-gradient(#D8EAD9, #F3EFE7)', h1: '#6FA07A', h2: '#4F7F5E' },
    { id: 'hn', label: 'Honduras', sky: 'linear-gradient(#EADFC9, #F3EFE7)', h1: '#9AA06A', h2: '#74804F' }
  ],

  regions: [
    { id: 'co-huila', cc: 'co', name: 'Huila', alt: '1.200–2.000 msnm', harvest: 'abr–jun y oct–dic', hm: [3, 4, 5, 9, 10, 11], bee: 'Tetragonisca angustula (angelita)', gap: 2, pilot: true },
    { id: 'co-eje', cc: 'co', name: 'Eje Cafetero', alt: '1.200–1.800 msnm', harvest: 'abr–jun y oct–dic', hm: [3, 4, 5, 9, 10, 11], bee: 'Tetragonisca angustula (angelita)', gap: 7 },
    { id: 'co-narino', cc: 'co', name: 'Nariño', alt: '1.500–2.300 msnm', harvest: 'abr–jun y oct–dic', hm: [3, 4, 5, 9, 10, 11], bee: 'Tetragonisca angustula (angelita)', gap: 10 },
    { id: 'br-mg', cc: 'br', name: 'Minas Gerais', alt: '800–1.300 msnm', harvest: 'may–sep', hm: [4, 5, 6, 7, 8], bee: 'Tetragonisca angustula (jataí)', gap: 8 },
    { id: 'br-sp', cc: 'br', name: 'São Paulo', alt: '800–1.200 msnm', harvest: 'may–sep', hm: [4, 5, 6, 7, 8], bee: 'Tetragonisca angustula (jataí)', gap: 9 },
    { id: 'br-es', cc: 'br', name: 'Espírito Santo', alt: '500–1.200 msnm', harvest: 'abr–sep', hm: [3, 4, 5, 6, 7, 8], bee: 'Tetragonisca angustula (jataí)', gap: 1 },
    { id: 'mx-chis', cc: 'mx', name: 'Chiapas', alt: '900–1.700 msnm', harvest: 'nov–mar', hm: [10, 11, 0, 1, 2], bee: 'Melipona beecheii', gap: 4 },
    { id: 'mx-ver', cc: 'mx', name: 'Veracruz', alt: '600–1.500 msnm', harvest: 'nov–mar', hm: [10, 11, 0, 1, 2], bee: 'Scaptotrigona mexicana', gap: 11 },
    { id: 'mx-oax', cc: 'mx', name: 'Oaxaca', alt: '900–1.700 msnm', harvest: 'nov–mar', hm: [10, 11, 0, 1, 2], bee: 'Melipona beecheii', gap: 5 },
    { id: 'pe-jun', cc: 'pe', name: 'Selva Central (Junín)', alt: '1.000–1.800 msnm', harvest: 'abr–sep', hm: [3, 4, 5, 6, 7, 8], bee: 'Tetragonisca angustula', gap: 3, pilot: true },
    { id: 'pe-caj', cc: 'pe', name: 'Cajamarca', alt: '1.200–2.000 msnm', harvest: 'abr–sep', hm: [3, 4, 5, 6, 7, 8], bee: 'Tetragonisca angustula', gap: 0 },
    { id: 'pe-cus', cc: 'pe', name: 'Cusco', alt: '1.000–1.900 msnm', harvest: 'abr–sep', hm: [3, 4, 5, 6, 7, 8], bee: 'Tetragonisca angustula', gap: 6 },
    { id: 'gt-hue', cc: 'gt', name: 'Huehuetenango', alt: '1.500–2.000 msnm', harvest: 'ene–abr', hm: [0, 1, 2, 3], bee: 'Melipona beecheii', gap: 8 },
    { id: 'cr-tar', cc: 'cr', name: 'Tarrazú', alt: '1.200–1.900 msnm', harvest: 'nov–mar', hm: [10, 11, 0, 1, 2], bee: 'Tetragonisca angustula', gap: 7 },
    { id: 'hn-mar', cc: 'hn', name: 'Marcala', alt: '1.200–1.700 msnm', harvest: 'dic–mar', hm: [11, 0, 1, 2], bee: 'Melipona beecheii', gap: 4 }
  ],

  queenColors: {
    0: { name: 'Azul', hex: '#3B6EA5', yearHint: '…0 y …5' },
    1: { name: 'Blanco', hex: '#F5F5F0', yearHint: '…1 y …6' },
    2: { name: 'Amarillo', hex: '#E8C547', yearHint: '…2 y …7' },
    3: { name: 'Rojo', hex: '#C23B2A', yearHint: '…3 y …8' },
    4: { name: 'Verde', hex: '#4A8C5C', yearHint: '…4 y …9' },
    5: { name: 'Azul', hex: '#3B6EA5', yearHint: '…0 y …5' },
    6: { name: 'Blanco', hex: '#F5F5F0', yearHint: '…1 y …6' },
    7: { name: 'Amarillo', hex: '#E8C547', yearHint: '…2 y …7' },
    8: { name: 'Rojo', hex: '#C23B2A', yearHint: '…3 y …8' },
    9: { name: 'Verde', hex: '#4A8C5C', yearHint: '…4 y …9' }
  },

  hiveStatuses: [
    { id: 'activa', label: 'Reina presente · colonia activa', color: '#4A8C5C' },
    { id: 'reemplazo', label: 'En reemplazo de reina', color: '#D9A23A' },
    { id: 'huerfana', label: 'Huérfana (sin reina)', color: '#C23B2A' },
    { id: 'enjambrazon', label: 'Enjambrazón reciente', color: '#B5573A' },
    { id: 'nueva', label: 'Colmena nueva / núcleo', color: '#4F7A95' }
  ],

  sampleHives: [
    {
      id: 'h1',
      name: 'Colmena Angelita A1',
      species: 'Tetragonisca angustula (angelita)',
      regionId: 'co-huila',
      zone: 'Franja 1 · Lote 2',
      status: 'activa',
      queen: {
        marked: true,
        colorYear: 2025,
        colorName: 'Azul',
        colorHex: '#3B6EA5',
        markedDate: '2025-09-12',
        notes: 'Reina marcada en revisión de primavera. Buena postura.'
      },
      installed: '2024-03-15',
      lastCheck: '2026-10-05',
      notes: 'Cerca de la franja de leguminosas. Alta actividad en floración de café.'
    },
    {
      id: 'h2',
      name: 'Colmena Angelita A2',
      species: 'Tetragonisca angustula (angelita)',
      regionId: 'co-huila',
      zone: 'Franja 2 · Lote 3',
      status: 'activa',
      queen: {
        marked: true,
        colorYear: 2024,
        colorName: 'Verde',
        colorHex: '#4A8C5C',
        markedDate: '2024-11-02',
        notes: 'Reina de 2 años. Vigilar en próxima revisión.'
      },
      installed: '2023-11-20',
      lastCheck: '2026-10-05',
      notes: 'Junto a la parcela control.'
    },
    {
      id: 'h3',
      name: 'Núcleo Melipona M1',
      species: 'Melipona beecheii',
      regionId: 'mx-chis',
      zone: 'Franja 1 · Borde de bosque',
      status: 'nueva',
      queen: {
        marked: false,
        colorYear: null,
        colorName: null,
        colorHex: null,
        markedDate: null,
        notes: 'Pendiente de marcado en la próxima revisión.'
      },
      installed: '2026-08-10',
      lastCheck: '2026-09-28',
      notes: 'Colmena piloto en Chiapas.'
    }
  ]
};

function getCountry(cc) {
  return DATA.countries.find(c => c.id === cc);
}

function getRegion(id) {
  return DATA.regions.find(r => r.id === id) || DATA.regions[0];
}

function getQueenColorForYear(year) {
  const digit = year % 10;
  return DATA.queenColors[digit];
}