// ── LIBRERÍA COMPLETA DE RUTINAS (11 programas) ─────────────────────────────
// Matriz: nivel (beginner/intermediate/elite) × objetivo (fuerza/hipertrofia/resistencia/perdida)

const BASE_EJ = {
  sentadilla: { nombre:'Sentadilla Táctica', musculo:'Cuádriceps / Glúteos / Core', consejo:'Rodillas en la dirección de los pies. Espalda neutra. Baja hasta 90° o más.', ciencia:'Schoenfeld (2010): ángulo ≥90° maximiza activación de glúteo mayor. Activa vasto medial, glúteo mayor y erector espinal simultáneamente.', videoId:'aclHkVaku9U', esIsometrico:false },
  flexRodillas: { nombre:'Flexiones en Rodillas', musculo:'Pectoral / Tríceps / Deltoides anterior', consejo:'Cuerpo recto de rodillas a hombros. Baja hasta que el pecho casi toque el suelo.', ciencia:'Cogley et al. (2005): activación del pectoral del 61% MVC. Variante en rodillas reduce carga al 54% del peso corporal.', videoId:'IODxDxX7oi4', esIsometrico:false },
  remoMesa: { nombre:'Remo en Mesa', musculo:'Dorsal ancho / Bíceps / Romboides', consejo:'Retrae las escápulas al subir. Cuerpo rígido como tabla. No balancees las caderas.', ciencia:'Lehman (2004): activa dorsal en 93% MVC y romboides en 70% MVC. Mejor sustituto de dominada para principiantes.', videoId:'2Synad5Yo-g', esIsometrico:false },
  fondosSilla: { nombre:'Fondos en Silla', musculo:'Tríceps / Deltoides posterior / Pectoral inferior', consejo:'Codos apuntando hacia atrás, no hacia los lados. Baja hasta 90° de codo.', ciencia:'ACE: activa tríceps (cabeza larga) al 88% MVC. Superiores a extensiones con mancuerna para aislamiento funcional.', videoId:'jox1rb5krQI', esIsometrico:false },
  plancha: { nombre:'Plancha Abdominal', musculo:'Transverso abdominal / Glúteos / Estabilizadores', consejo:'Pelvis neutra, nalgas apretadas. No subas ni bajes las caderas. Respira continuamente.', ciencia:'McGill (2010): activa transverso abdominal al 79% MVC con mínima carga lumbar.', videoId:'pSHjTRCQxIw', esIsometrico:true },
  dominadas: { nombre:'Dominadas', musculo:'Dorsal ancho / Bíceps / Trapecio inferior', consejo:'Agarre en pronación. Retrae y deprime las escápulas. ROM completo: cuelga y sube hasta barbilla sobre la barra.', ciencia:'Lusk et al. (2010): activa dorsal al 117–130% MVC. Mayor reclutamiento fibrilar de tracción vertical sin equipamiento.', videoId:'eGo4IYlbE5g', esIsometrico:false },
  diamante: { nombre:'Flexiones en Diamante', musculo:'Tríceps cabeza larga / Pectoral interno / Deltoides', consejo:'Manos formando un triángulo. Codos rozando el cuerpo al bajar. Explota hacia arriba.', ciencia:'ACE (2012): aumenta activación del tríceps un 22% respecto a la flexión estándar. Mayor estabilización escapular.', videoId:'J0DXzGhSJKM', esIsometrico:false },
  zancadas: { nombre:'Zancadas Alternadas', musculo:'Cuádriceps / Glúteo mayor / Isquiotibiales', consejo:'Rodilla trasera a 2-3 cm del suelo. Tronco erguido. No sobrepasar rodilla delantera el pie.', ciencia:'Lubahn (2011): mayor activación del glúteo medio (58% MVC) que sentadilla bilateral. Corrige desequilibrios inter-laterales.', videoId:'QOVaHwm-Q6U', esIsometrico:false },
  explosive: { nombre:'Flexiones Explosivas', musculo:'Pectoral / SNC / Tríceps', consejo:'Descenso controlado (2s). Empuje máximo hasta que las palmas despeguen del suelo.', ciencia:'Witmer et al. (2010): entrenamiento pliométrico de empuje incrementa producción de fuerza 12–15% en 6 semanas.', videoId:'Sd-HE1BUiVY', esIsometrico:false },
  hollowBody: { nombre:'Hollow Body Hold', musculo:'Core anterior / Psoas iliaco / Serratos', consejo:'Zona lumbar pegada al suelo. Piernas extendidas a 30–40°. Brazos detrás de la cabeza.', ciencia:'Biel (2014): activación del recto abdominal del 95% MVC con mínima compresión lumbar.', videoId:'-E8VNpVNQkw', esIsometrico:true },
  dominadasLastre: { nombre:'Dominadas con Lastre', musculo:'Dorsal / Bíceps / Trapecio / Erector espinal', consejo:'Mochila o cinturón lastrado (+5–10 kg). Agarre pronación. ROM estricto.', ciencia:'Burd et al. (2012): entrenamiento ≤6 reps, >85% 1RM produce adaptaciones neuromusculares superiores a volumen de hipertrofia.', videoId:'fSMNt0M8Yx4', esIsometrico:false },
  arquero: { nombre:'Flexión Arquero', musculo:'Pectoral / Serrato anterior / Deltoides / Core lateral', consejo:'Brazo de apoyo completamente extendido. Descenso hacia el lado del brazo doblado.', ciencia:'Activa pectoral mayor al 97–115% MVC. Serrato anterior dos veces más que flexiones estándar.', videoId:'Ykk7bXoYgfg', esIsometrico:false },
  pistola: { nombre:'Sentadilla Pistola (Asistida)', musculo:'Cuádriceps / Glúteo mayor / Tibial anterior', consejo:'Apóyate en anilla o banda. Pie de apoyo plano. Rodilla sigue punta del pie.', ciencia:'Myer et al. (2014): 18% más fuerza de cuádriceps que bilateral. Mejora control propioceptivo.', videoId:'vq5-vdgJc0I', esIsometrico:false },
  pikePush: { nombre:'Pike Push-up', musculo:'Deltoides / Tríceps / Trapecio / Manguito rotador', consejo:'Caderas altas formando V invertida. Cabeza baja entre brazos hasta casi tocar el suelo.', ciencia:'Calatayud (2015): activa deltoides anterior al 79% MVC. Mejor progresión hacia handstand push-up.', videoId:'sposDXWEB0A', esIsometrico:false },
  lSit: { nombre:'L-Sit Tuck', musculo:'Core / Flexores de cadera / Tríceps / Latísimo', consejo:'Brazos completamente extendidos. Empuje activo del suelo. Rodillas al pecho.', ciencia:'Freudenrich (2019): iliopsoas 97% MVC y recto abdominal 112% MVC. Máximo reclutamiento de core isométrico.', videoId:'16a529WU5FQ', esIsometrico:true },
  mountainClimber: { nombre:'Mountain Climbers', musculo:'Core / Hip flexors / Cardio', consejo:'Caderas bajas, core activado. Alterna las rodillas al pecho de forma explosiva.', ciencia:'Activa el core dinámico al 75% MVC mientras eleva la FC al 80–90% FCMax en circuito continuo.', videoId:'nmwgirgXLYM', esIsometrico:false },
  burpees: { nombre:'Burpees Tácticos', musculo:'Cuerpo completo / Cardiovascular', consejo:'Movimiento fluido sin pausas. Extensión completa en el salto. Flexión real al bajar.', ciencia:'Aumenta el consumo de oxígeno al 74% VO2max en 2 min. Superior al sprint de 30s para combust. lipídico post-ejercicio (Ziemann, 2011).', videoId:'dZgVxmf6jkA', esIsometrico:false },
  superman: { nombre:'Superman / Back Extension', musculo:'Erector espinal / Glúteo / Isquiotibiales', consejo:'Eleva brazos y piernas simultáneamente. Mantén 2 segundos arriba. Baja controlado.', ciencia:'McGill (2002): activa erector espinal al 83% MVC con mínima compresión discal L4-L5 en decúbito prono.', videoId:'z6PJMT2y8GQ', esIsometrico:false },
  glute: { nombre:'Puente de Glúteos', musculo:'Glúteo mayor / Isquiotibiales / Core', consejo:'Empuja con los talones. Extiende completamente la cadera. Mantén 1s arriba.', ciencia:'Contreras et al. (2011): activa glúteo mayor al 119% MVC. Superior a la sentadilla para aislamiento de glúteo.', videoId:'OUgsJ8-Vi0E', esIsometrico:false },
};

export const RUTINAS = {
  // ── ALFA (BEGINNER) ──────────────────────────────────────────────────────
  'alfa-fuerza': {
    id: 'alfa-fuerza', nivel: 'beginner', objetivo: 'fuerza',
    nombre: 'ALFA — Fundamentos de Fuerza', color: '#4fc3f7',
    descripcion: 'Construye base neuromuscular con carga progresiva. 4×6–8 reps con descansos largos. Prioridad en patrón de movimiento.',
    semanas: 4,
    ejercicios: [
      {...BASE_EJ.sentadilla, series:4, reps:'8', descanso:90},
      {...BASE_EJ.flexRodillas, series:4, reps:'8', descanso:90},
      {...BASE_EJ.remoMesa, series:4, reps:'8', descanso:90},
      {...BASE_EJ.fondosSilla, series:3, reps:'8', descanso:75},
      {...BASE_EJ.superman, series:3, reps:'10', descanso:60},
    ]
  },
  'alfa-hipertrofia': {
    id: 'alfa-hipertrofia', nivel: 'beginner', objetivo: 'hipertrofia',
    nombre: 'ALFA — Volumen Inicial', color: '#4fc3f7',
    descripcion: 'Máxima acumulación de volumen para neófito. 3×12–15 reps, descanso moderado. Énfasis en tiempo bajo tensión.',
    semanas: 4,
    ejercicios: [
      {...BASE_EJ.sentadilla, series:3, reps:'15', descanso:60},
      {...BASE_EJ.flexRodillas, series:3, reps:'12', descanso:60},
      {...BASE_EJ.remoMesa, series:3, reps:'12', descanso:60},
      {...BASE_EJ.fondosSilla, series:3, reps:'15', descanso:45},
      {...BASE_EJ.glute, series:3, reps:'15', descanso:45},
      {...BASE_EJ.plancha, series:3, reps:'30', descanso:45},
    ]
  },
  'alfa-resistencia': {
    id: 'alfa-resistencia', nivel: 'beginner', objetivo: 'resistencia',
    nombre: 'ALFA — Circuito Resistencia', color: '#4fc3f7',
    descripcion: 'AMRAP 25 min sin equipo. Alta densidad de trabajo, descanso mínimo. Desarrolla capacidad aeróbica y muscular.',
    semanas: 4,
    ejercicios: [
      {...BASE_EJ.sentadilla, series:3, reps:'20', descanso:30},
      {...BASE_EJ.flexRodillas, series:3, reps:'15', descanso:30},
      {...BASE_EJ.mountainClimber, series:3, reps:'30', descanso:30},
      {...BASE_EJ.zancadas, series:3, reps:'20 (total)', descanso:30},
      {...BASE_EJ.plancha, series:3, reps:'45', descanso:30},
    ]
  },
  'alfa-perdida': {
    id: 'alfa-perdida', nivel: 'beginner', objetivo: 'perdida',
    nombre: 'ALFA — Quema Táctica', color: '#4fc3f7',
    descripcion: 'Circuito metabólico de alta densidad. Maximiza EPOC (consumo de O₂ post-ejercicio) y quema calórica total.',
    semanas: 4,
    ejercicios: [
      {...BASE_EJ.burpees, series:4, reps:'8', descanso:45},
      {...BASE_EJ.sentadilla, series:3, reps:'20', descanso:30},
      {...BASE_EJ.mountainClimber, series:3, reps:'30', descanso:30},
      {...BASE_EJ.flexRodillas, series:3, reps:'12', descanso:30},
      {...BASE_EJ.zancadas, series:3, reps:'20 (total)', descanso:30},
    ]
  },

  // ── BRAVO (INTERMEDIATE) ─────────────────────────────────────────────────
  'bravo-fuerza': {
    id: 'bravo-fuerza', nivel: 'intermediate', objetivo: 'fuerza',
    nombre: 'BRAVO — Fuerza Táctica', color: '#d1fc00',
    descripcion: 'Trabajo de fuerza máxima con dominadas y variantes avanzadas. 5×5 estilo. Descansos de 2–3 min para recuperación total.',
    semanas: 6,
    ejercicios: [
      {...BASE_EJ.dominadas, series:5, reps:'5-6', descanso:120},
      {...BASE_EJ.explosive, series:4, reps:'6', descanso:120},
      {...BASE_EJ.pistola, series:4, reps:'5 por pierna', descanso:120},
      {...BASE_EJ.pikePush, series:4, reps:'8', descanso:90},
      {...BASE_EJ.hollowBody, series:3, reps:'40', descanso:60},
    ]
  },
  'bravo-hipertrofia': {
    id: 'bravo-hipertrofia', nivel: 'intermediate', objetivo: 'hipertrofia',
    nombre: 'BRAVO — Hipertrofia Operativa', color: '#d1fc00',
    descripcion: 'Volumen máximo orientado a hipertrofia. 4×10–12 reps. Tempo 3-1-2. Superset agonista-antagonista.',
    semanas: 6,
    ejercicios: [
      {...BASE_EJ.dominadas, series:4, reps:'10-12', descanso:75},
      {...BASE_EJ.diamante, series:4, reps:'12', descanso:60},
      {...BASE_EJ.zancadas, series:4, reps:'12 por pierna', descanso:60},
      {...BASE_EJ.pikePush, series:4, reps:'10', descanso:60},
      {...BASE_EJ.glute, series:3, reps:'20', descanso:45},
      {...BASE_EJ.hollowBody, series:3, reps:'40', descanso:45},
    ]
  },
  'bravo-resistencia': {
    id: 'bravo-resistencia', nivel: 'intermediate', objetivo: 'resistencia',
    nombre: 'BRAVO — AMRAP Táctico', color: '#d1fc00',
    descripcion: 'Circuito de alta intensidad AMRAP 30 min. Sin equipamiento. Máxima rondas posibles manteniendo forma técnica perfecta.',
    semanas: 6,
    ejercicios: [
      {...BASE_EJ.dominadas, series:5, reps:'8', descanso:45},
      {...BASE_EJ.explosive, series:3, reps:'10', descanso:45},
      {...BASE_EJ.zancadas, series:4, reps:'20 (total)', descanso:30},
      {...BASE_EJ.mountainClimber, series:4, reps:'40', descanso:30},
      {...BASE_EJ.hollowBody, series:3, reps:'40', descanso:30},
    ]
  },
  'bravo-perdida': {
    id: 'bravo-perdida', nivel: 'intermediate', objetivo: 'perdida',
    nombre: 'BRAVO — Incineración Metabólica', color: '#d1fc00',
    descripcion: 'Entrenamiento por intervalos de alta intensidad (HIIT) con calistenia. Maximiza la ventana metabólica y EPOC 24h.',
    semanas: 6,
    ejercicios: [
      {...BASE_EJ.burpees, series:5, reps:'10', descanso:30},
      {...BASE_EJ.dominadas, series:4, reps:'8', descanso:30},
      {...BASE_EJ.mountainClimber, series:4, reps:'40', descanso:30},
      {...BASE_EJ.explosive, series:3, reps:'8', descanso:30},
      {...BASE_EJ.zancadas, series:4, reps:'20 (total)', descanso:30},
    ]
  },

  // ── CHARLIE (ELITE) ──────────────────────────────────────────────────────
  'charlie-fuerza': {
    id: 'charlie-fuerza', nivel: 'elite', objetivo: 'fuerza',
    nombre: 'CHARLIE — Élite Máxima Fuerza', color: '#ff7043',
    descripcion: 'Protocolo de fuerza absoluta. Requiere dominar todas las variantes previas. Lastre, habilidades avanzadas, ROM estricto.',
    semanas: 8,
    ejercicios: [
      {...BASE_EJ.dominadasLastre, series:5, reps:'4-5', descanso:180},
      {...BASE_EJ.arquero, series:4, reps:'5 por lado', descanso:120},
      {...BASE_EJ.pistola, series:4, reps:'5 por pierna', descanso:120},
      {...BASE_EJ.pikePush, series:5, reps:'6', descanso:120},
      {...BASE_EJ.lSit, series:4, reps:'20', descanso:90},
    ]
  },
  'charlie-hipertrofia': {
    id: 'charlie-hipertrofia', nivel: 'elite', objetivo: 'hipertrofia',
    nombre: 'CHARLIE — Hipertrofia Élite', color: '#ff7043',
    descripcion: 'Máxima degradación muscular controlada para hipertrofia. Variantes unilaterales, lastre progresivo, series de alto volumen.',
    semanas: 8,
    ejercicios: [
      {...BASE_EJ.dominadasLastre, series:5, reps:'8-10', descanso:90},
      {...BASE_EJ.arquero, series:4, reps:'8 por lado', descanso:75},
      {...BASE_EJ.pistola, series:4, reps:'8 por pierna', descanso:75},
      {...BASE_EJ.diamante, series:4, reps:'15', descanso:60},
      {...BASE_EJ.glute, series:3, reps:'25', descanso:45},
      {...BASE_EJ.lSit, series:3, reps:'25', descanso:60},
    ]
  },
  'charlie-resistencia': {
    id: 'charlie-resistencia', nivel: 'elite', objetivo: 'resistencia',
    nombre: 'CHARLIE — Protocolo Operador', color: '#ff7043',
    descripcion: 'Circuito de operaciones especiales. 45 min continuo. Las variantes más duras conectadas sin pausa. Solo para elite.',
    semanas: 8,
    ejercicios: [
      {...BASE_EJ.dominadas, series:6, reps:'12', descanso:30},
      {...BASE_EJ.burpees, series:5, reps:'12', descanso:30},
      {...BASE_EJ.arquero, series:4, reps:'8 por lado', descanso:45},
      {...BASE_EJ.mountainClimber, series:5, reps:'50', descanso:30},
      {...BASE_EJ.hollowBody, series:4, reps:'60', descanso:30},
    ]
  },
};

// ── Secuencias de rotación por nivel ─────────────────────────────────────────
// Cada nivel tiene sus rutinas en orden de rotación.
// Una vez completadas todas, se reinicia desde el principio.
export const ROTACION = {
  beginner:     ['alfa-fuerza', 'alfa-hipertrofia', 'alfa-resistencia', 'alfa-perdida'],
  intermediate: ['bravo-fuerza', 'bravo-hipertrofia', 'bravo-resistencia', 'bravo-perdida'],
  elite:        ['charlie-fuerza', 'charlie-hipertrofia', 'charlie-resistencia'],
};

export function getKeyForProfile(nivel, objetivo) {
  const n = nivel === 'elite' ? 'charlie' : nivel === 'intermediate' ? 'bravo' : 'alfa';
  const o = objetivo || 'fuerza';
  // Charlie no tiene perdida
  if (n === 'charlie' && o === 'perdida') return 'charlie-fuerza';
  const key = `${n}-${o}`;
  return RUTINAS[key] ? key : `${n}-fuerza`;
}

/**
 * Devuelve la rutina que toca según el índice de rotación del nivel del usuario.
 * Si el nivel no está definido, usa el objetivo original como fallback.
 * @param {Object} perfil
 * @param {Object} rotationMap  - { beginner: 0, intermediate: 2, elite: 1 }
 */
export function getRutinaDelDia(perfil, rotationMap = {}) {
  const nivel = perfil.level;
  const secuencia = ROTACION[nivel];

  if (!secuencia) {
    // Fallback: sin nivel asignado todavía
    return getKeyForProfile(nivel, perfil.objetivo);
  }

  const idx = (rotationMap[nivel] || 0) % secuencia.length;
  return RUTINAS[secuencia[idx]];
}

/**
 * Avanza el índice de rotación para el nivel del usuario y devuelve el nuevo mapa.
 */
export function avanzarRotacion(nivel, rotationMap = {}) {
  const secuencia = ROTACION[nivel];
  if (!secuencia) return rotationMap;
  const current = rotationMap[nivel] || 0;
  return { ...rotationMap, [nivel]: (current + 1) % secuencia.length };
}

export function generarRutina(perfil) {
  const key = getKeyForProfile(perfil.level, perfil.objetivo);
  return RUTINAS[key];
}

export function getRutinasParaNivel(nivel) {
  return Object.values(RUTINAS).filter(r => r.nivel === nivel);
}

export function calcularMacros(perfil) {
  const { peso, altura, edad, sexo, objetivo } = perfil;
  if (!peso || !altura || !edad) return null;
  let tmb = sexo === 'F'
    ? 447.6 + (9.25 * peso) + (3.1 * altura) - (4.33 * edad)
    : 88.36 + (13.4 * peso) + (4.8 * altura) - (5.68 * edad);
  let kcal = Math.round(tmb * 1.55);
  if (objetivo === 'perdida') kcal -= 400;
  if (objetivo === 'hipertrofia') kcal += 250;
  const proteina = Math.round(peso * 2.0);
  const grasa = Math.round((kcal * 0.25) / 9);
  const carbos = Math.round((kcal - proteina * 4 - grasa * 9) / 4);
  const agua = Math.round(peso * 0.035 * 10) / 10;
  return { kcal, proteina, grasa, carbos, agua };
}
