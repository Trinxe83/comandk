import './style.css'
import { translations } from './i18n.js'
import { auth, provider, signInWithPopup, onAuthStateChanged, signOut } from './firebase.js'
import { saveSession, loadSessions, saveRotationMap, loadRotationMap } from './db.js'
import { getRutinaDelDia, avanzarRotacion, ROTACION } from './routines.js'

// ── Algoritmo de rutinas según perfil ──────────────────────────────────────
function generarRutina(perfil) {
  const { nivel, pullups, pushups, objetivo, lesiones } = perfil;

  const alfa = {
    nombre: 'RUTA ALFA — Cimientos de Fuerza',
    descripcion: 'Circuito de 30 min diseñado para principiantes. Aprende los patrones fundamentales de movimiento antes de añadir carga.',
    color: '#4fc3f7',
    ejercicios: [
      {
        nombre: 'Sentadilla Táctica', series: 4, reps: '15', descanso: 60,
        musculo: 'Cuádriceps / Glúteos / Core',
        consejo: 'Rodillas en la dirección de los pies. Espalda neutra. Desciende hasta 90° o más.',
        ciencia: 'La sentadilla activa el vasto medial, glúteo mayor y erector espinal simultáneamente. Schoenfeld (2010, J Strength Cond Res) confirma que el ángulo de rodilla ≥ 90° maximiza la activación del glúteo mayor.',
        videoId: 'aclHkVaku9U',
        esIsometrico: false
      },
      {
        nombre: 'Flexiones en Rodillas', series: 4, reps: '10', descanso: 60,
        musculo: 'Pectoral / Tríceps / Deltoides anterior',
        consejo: 'Cuerpo recto de rodillas a hombros. Baja hasta que el pecho casi toque el suelo.',
        ciencia: 'Las flexiones generan una activación del pectoral del 61 % de la MVC (contracción voluntaria máxima), según Cogley et al. (2005, J Strength Cond Res). La variante en rodillas reduce la carga al 54 % del peso corporal.',
        videoId: 'IODxDxX7oi4',
        esIsometrico: false
      },
      {
        nombre: 'Remo en Mesa', series: 4, reps: '12', descanso: 60,
        musculo: 'Dorsal ancho / Bíceps / Romboides',
        consejo: 'Retrae las escápulas al subir. Cuerpo rígido como tabla. No balancees las caderas.',
        ciencia: 'El remo horizontal activa el dorsal en un 93 % MVC y los romboides en un 70 % MVC (Lehman, 2004). Es el sustituto de la dominada más efectivo para principiantes.',
        videoId: '2Synad5Yo-g',
        esIsometrico: false
      },
      {
        nombre: 'Fondos en Silla', series: 3, reps: '10', descanso: 60,
        musculo: 'Tríceps / Deltoides posterior / Pectoral inferior',
        consejo: 'Codos apuntando hacia atrás, no hacia los lados. Baja hasta 90° de codo.',
        ciencia: 'Los fondos en banco activan el tríceps (cabeza larga) un 88 % de MVC según ACE. Son superiores a las extensiones con mancuerna para aislamiento funcional del tríceps.',
        videoId: 'jox1rb5krQI',
        esIsometrico: false
      },
      {
        nombre: 'Plancha Abdominal', series: 3, reps: '30', descanso: 45,
        musculo: 'Transverso abdominal / Glúteos / Estabilizadores',
        consejo: 'Pelvis neutra, nalgas apretadas. No subas ni bajes las caderas. Respira de forma continua.',
        ciencia: 'La plancha activa el transverso abdominal (79 % MVC) con mínima carga lumbar, lo que la hace superior a los abdominales tradicionales según McGill (2010, J Orthop Sports Phys Ther).',
        videoId: 'pSHjTRCQxIw',
        esIsometrico: true
      },
    ]
  };

  const bravo = {
    nombre: 'RUTA BRAVO — AMRAP Táctico',
    descripcion: 'Circuito de alta intensidad AMRAP (As Many Rounds As Possible) en 30 minutos. Sin equipamiento. Para nivel intermedio.',
    color: '#d1fc00',
    ejercicios: [
      {
        nombre: 'Dominadas', series: 5, reps: `${Math.max(3, (pullups||5) - 2)}`, descanso: 90,
        musculo: 'Dorsal ancho / Bíceps / Trapecio inferior',
        consejo: 'Agarre en pronación. Retrae y deprime las escápulas antes de iniciar. ROM completo: cuelga y sube hasta barbilla sobre la barra.',
        ciencia: 'La dominada con agarre en pronación activa el dorsal al 117-130 % MVC (Lusk et al., 2010). Es el ejercicio de tracción vertical con mayor reclutamiento fibrilar sin necesidad de equipamiento.',
        videoId: 'eGo4IYlbE5g',
        esIsometrico: false
      },
      {
        nombre: 'Flexiones en Diamante', series: 4, reps: '12', descanso: 60,
        musculo: 'Tríceps cabeza larga / Pectoral interno / Deltoides',
        consejo: 'Manos formando un triángulo. Codos rozando el cuerpo al bajar. Explota hacia arriba.',
        ciencia: 'La variante diamante aumenta la activación del tríceps un 22 % respecto a la flexión estándar (ACE, 2012). Requiere mayor estabilización escapular.',
        videoId: 'J0DXzGhSJKM',
        esIsometrico: false
      },
      {
        nombre: 'Zancadas Alternadas', series: 4, reps: '20 (total)', descanso: 60,
        musculo: 'Cuádriceps / Glúteo mayor / Isquiotibiales',
        consejo: 'Rodilla trasera a 2-3 cm del suelo. Tronco erguido. No dejes que la rodilla delantera sobrepase el pie.',
        ciencia: 'La zancada unilateral genera mayor activación del glúteo medio (58 % MVC) que la sentadilla bilateral, lo que corrige desequilibrios de fuerza entre piernas (Lubahn, 2011).',
        videoId: 'QOVaHwm-Q6U',
        esIsometrico: false
      },
      {
        nombre: 'Flexiones Explosivas', series: 3, reps: '8', descanso: 75,
        musculo: 'Pectoral / Sistema nervioso central / Tríceps',
        consejo: 'Descenso controlado (2s). Empuje máximo hasta que las palmas despeguen del suelo.',
        ciencia: 'El entrenamiento pliométrico de empuje incrementa la producción de fuerza en un 12-15 % en 6 semanas (Witmer et al., 2010). Activa las fibras de contracción rápida tipo IIx.',
        videoId: 'Sd-HE1BUiVY',
        esIsometrico: false
      },
      {
        nombre: 'Hollow Body Hold', series: 3, reps: '40', descanso: 45,
        musculo: 'Core anterior / Psoas iliaco / Serratos',
        consejo: 'Zona lumbar pegada al suelo. Piernas extendidas a 30-40°. Brazos detrás de la cabeza.',
        ciencia: 'El hollow body es la posición base de la gimnasia artística. Biel (2014) confirma una activación del recto abdominal del 95 % MVC con mínima compresión lumbar versus los crunchs tradicionales.',
        videoId: '-E8VNpVNQkw',
        esIsometrico: true
      },
    ]
  };

  const charlie = {
    nombre: 'RUTA CHARLIE — Élite Táctica',
    descripcion: 'Fuerza máxima y habilidades avanzadas de calistenia. Requiere base sólida y cero lesiones activas.',
    color: '#ff7043',
    ejercicios: [
      {
        nombre: 'Dominadas con Lastre', series: 5, reps: '5-6', descanso: 120,
        musculo: 'Dorsal ancho / Bíceps / Trapecio / Erector espinal',
        consejo: 'Usa una mochila o cinturón lastrado (+5-10 kg). Agarre en pronación. ROM estricto obligatorio.',
        ciencia: 'El entrenamiento de fuerza máxima (≤6 reps, >85 % 1RM) produce adaptaciones neuromusculares superiores a series de hipertrofia (Burd et al., 2012, J Physiol).',
        videoId: 'fSMNt0M8Yx4',
        esIsometrico: false
      },
      {
        nombre: 'Flexión Arquero', series: 4, reps: '6 por lado', descanso: 90,
        musculo: 'Pectoral / Serrato anterior / Deltoides / Core lateral',
        consejo: 'Brazo de apoyo totalmente extendido y firme. Descenso hacia el lado del brazo doblado.',
        ciencia: 'La flexión arquero activa el pectoral mayor en un 97-115 % MVC y exige una estabilización unilateral que activa el serrato anterior dos veces más que las flexiones estándar.',
        videoId: 'Ykk7bXoYgfg',
        esIsometrico: false
      },
      {
        nombre: 'Sentadilla Pistola (Asistida)', series: 4, reps: '5 por pierna', descanso: 90,
        musculo: 'Cuádriceps / Glúteo mayor / Tibial anterior / Equilibrio',
        consejo: 'Apóyate en una anilla o banda al inicio. Pie de apoyo plano. La rodilla sigue la punta del pie.',
        ciencia: 'La sentadilla unipodal require un 18 % más de fuerza de cuádriceps que la bilateral. Mejora el control propioceptivo y los déficits inter-laterales (Myer et al., 2014).',
        videoId: 'vq5-vdgJc0I',
        esIsometrico: false
      },
      {
        nombre: 'Pike Push-up', series: 4, reps: '10', descanso: 75,
        musculo: 'Deltoides / Tríceps / Trapecio / Manguito rotador',
        consejo: 'Caderas altas formando una V invertida. La cabeza baja entre los brazos hasta casi tocar el suelo.',
        ciencia: 'El pike push-up activa el deltoides anterior en un 79 % MVC, siendo el mejor ejercicio progresivo hacia el handstand push-up (Calatayud, 2015, J Hum Kinet).',
        videoId: 'sposDXWEB0A',
        esIsometrico: false
      },
      {
        nombre: 'L-Sit Tuck', series: 3, reps: '20', descanso: 60,
        musculo: 'Core / Flexores de cadera / Tríceps / Latísimo',
        consejo: 'Brazos completamente extendidos. Empuje activo del suelo. Mantén las rodillas al pecho.',
        ciencia: 'El L-sit genera una activación del iliopsoas del 97 % MVC y del recto abdominal del 112 % MVC. Es uno de los ejercicios isométricos con mayor reclutamiento de Core (Freudenrich, 2019).',
        videoId: '16a529WU5FQ',
        esIsometrico: true
      },
    ]
  };

  if (nivel === 'elite' && (pullups || 0) >= 10) return charlie;
  if (nivel === 'intermediate' || (pullups || 0) >= 5) return bravo;
  return alfa;
}



// ── Calculadora de macros (ISSN) ───────────────────────────────────────────
function calcularMacros(perfil) {
  const { peso, altura, edad, sexo, objetivo } = perfil;
  if (!peso || !altura || !edad) return null;

  // TMB Harris-Benedict
  let tmb = sexo === 'F'
    ? 447.6 + (9.25 * peso) + (3.1 * altura) - (4.33 * edad)
    : 88.36 + (13.4 * peso) + (4.8 * altura) - (5.68 * edad);

  // Factor actividad moderada (3-5 días/semana)
  let kcal = Math.round(tmb * 1.55);

  if (objetivo === 'perdida') kcal -= 400;
  if (objetivo === 'hipertrofia') kcal += 250;

  const proteina = Math.round(peso * 2.0);
  const grasa = Math.round((kcal * 0.25) / 9);
  const carbos = Math.round((kcal - proteina * 4 - grasa * 9) / 4);

  return { kcal, proteina, grasa, carbos };
}

// ── App Principal ──────────────────────────────────────────────────────────
const app = {
  activeNav: 'dashboard',
  currentLang: 'es',
  rotationMap: {},
  userProfile: {
    level: null,
    completedAssessment: false,
    nombre: null,
    edad: null, sexo: null, peso: null, altura: null,
    pullups: 0, pushups: 0,
    objetivo: null, lesiones: [],
    sessionLog: [],
  },

  init() {
    this.container = document.querySelector('#content-outlet');
    this.navItems = document.querySelectorAll('.nav-item');
    this.langToggle = document.querySelector('#lang-switcher');
    this.appShell = document.querySelector('#app-shell');
    this.authView = document.querySelector('#auth-view');
    this.btnLoginGoogle = document.querySelector('#btn-login-google');
    this.btnLoginDemo = document.querySelector('#btn-login-demo');
    this.authErrorMsg = document.querySelector('#auth-error-msg');
    this.userProfileBtn = document.querySelector('#user-profile');

    this.setupListeners();
    this.updateStaticTranslations();

    if (auth) {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.userProfile.nombre = user.displayName;
          this._uid = user.uid;
          const key = `assessment_done_${user.uid}`;
          const saved = localStorage.getItem(key);
          if (saved) {
            Object.assign(this.userProfile, JSON.parse(saved));
            this.userProfile.completedAssessment = true;
          }
          this.userProfile.assessmentKey = key;
          // Cargar historial y rotación desde Firestore
          const [sessions, rotation] = await Promise.all([
            loadSessions(user.uid),
            loadRotationMap(user.uid),
          ]);
          this.userProfile.sessionLog = sessions;
          this.rotationMap = rotation;
          this.showAppShell();
        } else {
          this.showAuthView();
        }
      });
    } else {
      this.authErrorMsg.innerText = 'Configura src/firebase.js con tus credenciales o usa el modo Demo.';
      this.authErrorMsg.style.display = 'block';
      this.showAuthView();
    }
  },

  showAuthView() {
    this.appShell.style.display = 'none';
    this.authView.style.display = 'flex';
  },

  showAppShell() {
    this.authView.style.display = 'none';
    this.appShell.style.display = 'flex';
    this.activeNav = 'dashboard';
    this.render();
    if (!this.userProfile.completedAssessment) {
      this.renderOnboardingModal();
    }
  },

  setupListeners() {
    this.btnLoginGoogle.addEventListener('click', async () => {
      if (!auth) return;
      try { await signInWithPopup(auth, provider); }
      catch (e) { this.authErrorMsg.innerText = 'Error: ' + e.message; this.authErrorMsg.style.display = 'block'; }
    });

    this.btnLoginDemo.addEventListener('click', async () => {
      this.userProfile.nombre = 'INVITADO';
      this._uid = null;
      // Cargar desde localStorage en modo demo
      const [sessions, rotation] = await Promise.all([
        loadSessions(null),
        loadRotationMap(null),
      ]);
      this.userProfile.sessionLog = sessions;
      this.rotationMap = rotation;
      this.showAppShell();
    });

    this.userProfileBtn.addEventListener('click', () => {
      if (auth && auth.currentUser) signOut(auth);
      else this.showAuthView();
    });

    this.navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.activeNav = item.getAttribute('data-nav');
        this.navItems.forEach(ni => ni.classList.remove('active'));
        item.classList.add('active');
        this.render();
      });
    });

    this.langToggle.addEventListener('click', () => {
      this.currentLang = this.currentLang === 'es' ? 'en' : 'es';
      this.updateStaticTranslations();
      this.render();
    });
  },

  t(key) { return translations[this.currentLang][key] || key; },

  updateStaticTranslations() {
    document.querySelector('#label-system-status').innerText = this.t('system_status');
    document.querySelector('#nav-hud').innerText = this.t('hud');
    document.querySelector('#nav-ops').innerText = this.t('ops');
    document.querySelector('#nav-fuel').innerText = this.t('fuel');
    document.querySelector('#nav-intel').innerText = this.t('intel');
  },

  render() {
    this.container.innerHTML = '';
    switch (this.activeNav) {
      case 'workouts': this.renderWorkouts(); break;
      case 'nutrition': this.renderNutrition(); break;
      case 'progress': this.renderProgress(); break;
      case 'exercise_detail': this.renderExerciseDetail(); break;
      case 'success': this.renderSuccess(); break;
      default: this.renderDashboard();
    }
  },

  // ── MODAL DEL TEST ────────────────────────────────────────────────────────
  renderOnboardingModal() {
    const outlet = document.querySelector('#modal-outlet');
    outlet.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content glass-tactical" style="padding:2rem; border-radius:4px;">
          <h1 class="glow-text" style="font-size:1.6rem; margin-bottom:0.3rem;">${this.t('onboarding_title')}</h1>
          <p class="label-sm" style="margin-bottom:1.5rem;">${this.t('onboarding_subtitle')}</p>
          <p id="test-error" style="display:none; color:#ff3333; font-size:0.8rem; margin-bottom:1rem; font-weight:700;"></p>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.8rem; margin-bottom:0.8rem;">
            <div>
              <label class="label-sm" style="font-size:0.65rem; display:block; margin-bottom:0.3rem;">EDAD</label>
              <input id="t-age" type="number" min="14" max="80" placeholder="25" style="width:100%; background:var(--bg-color); border:1px solid var(--glass-border); padding:0.8rem; color:white; font-family:var(--font-header); font-size:1rem;">
            </div>
            <div>
              <label class="label-sm" style="font-size:0.65rem; display:block; margin-bottom:0.3rem;">SEXO</label>
              <select id="t-sex" style="width:100%; background:var(--bg-color); border:1px solid var(--glass-border); padding:0.8rem; color:white; font-family:var(--font-header); font-size:0.9rem;">
                <option value="">— Selecciona —</option>
                <option value="M">Hombre</option>
                <option value="F">Mujer</option>
              </select>
            </div>
            <div>
              <label class="label-sm" style="font-size:0.65rem; display:block; margin-bottom:0.3rem;">PESO (kg)</label>
              <input id="t-weight" type="number" min="40" max="200" placeholder="75" style="width:100%; background:var(--bg-color); border:1px solid var(--glass-border); padding:0.8rem; color:white; font-family:var(--font-header); font-size:1rem;">
            </div>
            <div>
              <label class="label-sm" style="font-size:0.65rem; display:block; margin-bottom:0.3rem;">ALTURA (cm)</label>
              <input id="t-height" type="number" min="140" max="220" placeholder="175" style="width:100%; background:var(--bg-color); border:1px solid var(--glass-border); padding:0.8rem; color:white; font-family:var(--font-header); font-size:1rem;">
            </div>
          </div>

          <div class="card glass-tactical" style="margin-bottom:0.8rem;">
            <h3 class="label-sm" style="margin-bottom:0.8rem; color:var(--primary-color);">${this.t('question_experience')}</h3>
            <div style="display:flex; flex-direction:column; gap:0.5rem;">
              <button class="assessment-btn glass" data-level="beginner" style="padding:0.8rem; text-align:left;">${this.t('exp_beginner')}</button>
              <button class="assessment-btn glass" data-level="intermediate" style="padding:0.8rem; text-align:left;">${this.t('exp_intermediate')}</button>
              <button class="assessment-btn glass" data-level="elite" style="padding:0.8rem; text-align:left;">${this.t('exp_advanced')}</button>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.8rem; margin-bottom:0.8rem;">
            <div class="card glass">
              <label class="label-sm" style="font-size:0.65rem; display:block; margin-bottom:0.5rem;">${this.t('question_pullups')}</label>
              <input id="t-pullups" type="range" min="0" max="30" value="0" style="width:100%;">
              <div style="text-align:center; color:var(--primary-color); font-weight:800; font-size:1.2rem;" id="v-pullups">0</div>
            </div>
            <div class="card glass">
              <label class="label-sm" style="font-size:0.65rem; display:block; margin-bottom:0.5rem;">${this.t('question_pushups')}</label>
              <input id="t-pushups" type="range" min="0" max="60" value="0" style="width:100%;">
              <div style="text-align:center; color:var(--primary-color); font-weight:800; font-size:1.2rem;" id="v-pushups">0</div>
            </div>
          </div>

          <div class="card glass" style="margin-bottom:0.8rem;">
            <h3 class="label-sm" style="margin-bottom:0.8rem;">${this.t('question_goal')}</h3>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
              <button class="goal-btn glass label-sm" data-goal="fuerza" style="padding:0.8rem;">💪 ${this.t('goal_strength')}</button>
              <button class="goal-btn glass label-sm" data-goal="resistencia" style="padding:0.8rem;">🏃 ${this.t('goal_endurance')}</button>
              <button class="goal-btn glass label-sm" data-goal="perdida" style="padding:0.8rem;">🔥 Pérdida de grasa</button>
              <button class="goal-btn glass label-sm" data-goal="hipertrofia" style="padding:0.8rem;">📈 ${this.t('goal_hypertrophy')}</button>
            </div>
          </div>

          <div class="card glass" style="margin-bottom:0.8rem;">
            <h3 class="label-sm" style="margin-bottom:0.8rem;">LESIONES / LIMITACIONES</h3>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
              <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.8rem; cursor:pointer;"><input type="checkbox" class="lesion-cb" value="lumbar" style="accent-color:var(--primary-color);"> Zona lumbar</label>
              <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.8rem; cursor:pointer;"><input type="checkbox" class="lesion-cb" value="rodillas" style="accent-color:var(--primary-color);"> Rodillas</label>
              <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.8rem; cursor:pointer;"><input type="checkbox" class="lesion-cb" value="hombros" style="accent-color:var(--primary-color);"> Hombros</label>
              <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.8rem; cursor:pointer;"><input type="checkbox" class="lesion-cb" value="ninguna" style="accent-color:var(--primary-color);"> Sin lesiones</label>
            </div>
          </div>

          <div class="card glass-tactical" style="border-left:3px solid #ff3333; background:rgba(255,51,51,0.05); margin-bottom:1.2rem;">
            <div style="display:flex; align-items:flex-start; gap:0.8rem;">
              <input type="checkbox" id="medical-clearance" style="width:20px; height:20px; margin-top:2px; accent-color:#ff3333; cursor:pointer; flex-shrink:0;">
              <label for="medical-clearance" style="font-size:0.8rem; cursor:pointer;">${this.t('medical_authorization')}<br><span style="color:#ff3333; font-size:0.7rem; font-weight:700;">${this.t('medical_warning_alert')}</span></label>
            </div>
          </div>

          <button id="submit-assessment" class="glow-box" style="width:100%; background:var(--primary-color); color:var(--bg-color); border:none; padding:1.2rem; font-family:var(--font-header); font-weight:800; font-size:1.1rem; cursor:pointer; text-transform:uppercase;">
            ${this.t('submit_assessment')}
          </button>
        </div>
      </div>`;

    // Sliders
    document.querySelector('#t-pullups').oninput = e => document.querySelector('#v-pullups').innerText = e.target.value;
    document.querySelector('#t-pushups').oninput = e => document.querySelector('#v-pushups').innerText = e.target.value;

    // Botones de nivel
    document.querySelectorAll('.assessment-btn').forEach(b => {
      b.onclick = () => {
        document.querySelectorAll('.assessment-btn').forEach(x => x.style.borderColor = 'var(--glass-border)');
        b.style.borderColor = 'var(--primary-color)';
        this.userProfile.level = b.dataset.level;
      };
    });

    // Botones de objetivo
    document.querySelectorAll('.goal-btn').forEach(b => {
      b.onclick = () => {
        document.querySelectorAll('.goal-btn').forEach(x => x.style.borderColor = 'var(--glass-border)');
        b.style.borderColor = 'var(--primary-color)';
        this.userProfile.objetivo = b.dataset.goal;
      };
    });

    // Submit
    document.querySelector('#submit-assessment').onclick = () => {
      const errEl = document.querySelector('#test-error');
      if (!document.querySelector('#medical-clearance').checked) {
        errEl.innerText = '⚠️ ' + this.t('medical_warning_alert');
        errEl.style.display = 'block';
        return;
      }
      if (!this.userProfile.level) {
        errEl.innerText = '⚠️ Por favor selecciona tu nivel de experiencia.';
        errEl.style.display = 'block';
        return;
      }

      this.userProfile.edad   = parseInt(document.querySelector('#t-age').value)    || 25;
      this.userProfile.sexo   = document.querySelector('#t-sex').value              || 'M';
      this.userProfile.peso   = parseFloat(document.querySelector('#t-weight').value) || 75;
      this.userProfile.altura = parseFloat(document.querySelector('#t-height').value) || 175;
      this.userProfile.pullups= parseInt(document.querySelector('#t-pullups').value);
      this.userProfile.pushups= parseInt(document.querySelector('#t-pushups').value);
      this.userProfile.lesiones = [...document.querySelectorAll('.lesion-cb:checked')].map(x => x.value);
      if (!this.userProfile.objetivo) this.userProfile.objetivo = 'fuerza';

      this.userProfile.completedAssessment = true;
      if (this.userProfile.assessmentKey) {
        const toSave = { level: this.userProfile.level, edad: this.userProfile.edad, sexo: this.userProfile.sexo,
          peso: this.userProfile.peso, altura: this.userProfile.altura,
          pullups: this.userProfile.pullups, pushups: this.userProfile.pushups,
          objetivo: this.userProfile.objetivo, lesiones: this.userProfile.lesiones };
        localStorage.setItem(this.userProfile.assessmentKey, JSON.stringify(toSave));
      }
      document.querySelector('#modal-outlet').innerHTML = '';
      this.render();
    };
  },

  // ── HUD ─────────────────────────────────────────────────────────────────
  renderDashboard() {
    const rutina = this.userProfile.level
      ? getRutinaDelDia(this.userProfile, this.rotationMap)
      : generarRutina(this.userProfile);
    const macros = calcularMacros(this.userProfile);
    const nivel = { beginner: 'RUTA ALFA', intermediate: 'RUTA BRAVO', elite: 'RUTA CHARLIE' }[this.userProfile.level] || '—';
    const secuencia = ROTACION[this.userProfile.level] || [];
    const rotIdx = (this.rotationMap[this.userProfile.level] || 0) % (secuencia.length || 1);
    const progCirculo = secuencia.length > 0 ? Math.round((rotIdx / secuencia.length) * 100) : 0;

    this.container.innerHTML = `
      <section style="animation:fadeIn 0.5s ease-out;">
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(209,252,0,0.05); padding:1.5rem; border: 1px solid var(--glass-border); border-left:4px solid var(--primary-color); margin-bottom:1.5rem;">
          <div>
            <span class="label-sm" style="margin-bottom:0.2rem; display:block;">${this.t('operative')}: ${this.userProfile.nombre || 'INVITADO'}</span>
            <h1 style="font-size:1.8rem;" class="glow-text">${this.t('welcome')}</h1>
          </div>
          <button class="glass label-sm" style="color:var(--text-secondary); border:1px solid var(--glass-border); padding:0.6rem; cursor:pointer; font-size:0.65rem;" id="btn-retest">✎ EDITAR TEST</button>
        </div>

        <div class="card glass-tactical" style="margin-bottom:1rem; border-left:4px solid var(--primary-color);">
          <div class="label-sm" style="font-size:0.6rem; margin-bottom:0.5rem;">RUTINA ASIGNADA</div>
          <h2 style="font-size:1.1rem; color:var(--primary-color);">${rutina.nombre}</h2>
          <p style="font-size:0.8rem; opacity:0.7; margin-top:0.3rem;">${rutina.descripcion}</p>
          <button id="btn-start-workout" class="glow-box" style="width:100%; background:var(--primary-color); color:var(--bg-color); border:none; padding:1.2rem; font-family:var(--font-header); font-weight:800; font-size:1rem; cursor:pointer; text-transform:uppercase; margin-top:1rem;">▶ INICIAR ENTRENAMIENTO</button>
        </div>

        ${macros ? `
        <div class="card glass" style="margin-bottom:1rem;">
          <div class="label-sm" style="font-size:0.6rem; margin-bottom:0.8rem;">OBJETIVO CALÓRICO DIARIO (CALCULADO)</div>
          <div class="stats-grid">
            <div class="quick-stat"><div class="label-sm" style="font-size:0.55rem;">CALORÍAS</div><div class="stat-number" style="font-size:1.3rem;">${macros.kcal}<span style="font-size:0.6rem;opacity:0.5;"> kcal</span></div></div>
            <div class="quick-stat"><div class="label-sm" style="font-size:0.55rem;">PROTEÍNA</div><div class="stat-number" style="font-size:1.3rem;">${macros.proteina}<span style="font-size:0.6rem;opacity:0.5;"> g</span></div></div>
            <div class="quick-stat"><div class="label-sm" style="font-size:0.55rem;">CARBOS</div><div class="stat-number" style="font-size:1.3rem;">${macros.carbos}<span style="font-size:0.6rem;opacity:0.5;"> g</span></div></div>
            <div class="quick-stat"><div class="label-sm" style="font-size:0.55rem;">GRASAS</div><div class="stat-number" style="font-size:1.3rem;">${macros.grasa}<span style="font-size:0.6rem;opacity:0.5;"> g</span></div></div>
          </div>
        </div>` : ''}

        <div class="card glass" style="margin-bottom:1rem;">
          <div class="label-sm" style="font-size:0.6rem; margin-bottom:0.8rem;">SESIONES COMPLETADAS</div>
          <div class="stat-number" style="font-size:2.5rem;">${this.userProfile.sessionLog.length} <span style="font-size:0.8rem; opacity:0.5;">esta semana</span></div>
        </div>
      </section>`;

    document.querySelector('#btn-retest').onclick = () => this.renderOnboardingModal();
    document.querySelector('#btn-start-workout').onclick = () => { this.activeNav = 'workouts'; this.render(); };
  },

  // ── OPS ─────────────────────────────────────────────────────────────────
  renderWorkouts() {
    const rutina = generarRutina(this.userProfile);
    const ejerciciosHTML = rutina.ejercicios.map((e, i) => `
      <div class="card glass-tactical workout-item" data-index="${i}" style="padding:1.2rem; display:flex; justify-content:space-between; align-items:center; cursor:pointer; margin-bottom:0.8rem; transition:border-color 0.2s;">
        <div>
          <h3 style="font-size:1rem; color:var(--primary-color); margin-bottom:0.2rem;">${e.nombre}</h3>
          <span class="label-sm" style="font-size:0.65rem;">${e.series} series × ${e.reps} · Descanso ${e.descanso}</span>
          <span class="label-sm" style="background:rgba(209,252,0,0.1); color:var(--primary-color); padding:0.15rem 0.4rem; margin-left:0.5rem; font-size:0.55rem;">${e.musculo}</span>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
      </div>`).join('');

    this.container.innerHTML = `
      <section style="animation:fadeIn 0.5s ease-out;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
          <h1 class="glow-text" style="margin:0;">${this.t('ops')}</h1>
          <span class="label-sm" style="color:var(--primary-color); border:1px solid var(--primary-color); padding:0.3rem 0.6rem;">${this.t('time_limit')}</span>
        </div>
        <h2 style="font-size:0.9rem; color:var(--primary-color); opacity:0.8; margin-bottom:0.3rem;">${rutina.nombre}</h2>
        <p style="opacity:0.6; font-size:0.8rem; margin-bottom:1.5rem;">${rutina.descripcion}</p>
        
        <div class="card glass-tactical" style="border-left:3px solid #ff3333; margin-bottom:1.2rem;">
          <p style="font-size:0.75rem; color:#ff3333; margin:0;">${this.t('biomechanics_warning')}</p>
        </div>
        ${ejerciciosHTML}
      </section>`;

    document.querySelectorAll('.workout-item').forEach(el => {
      el.onclick = () => {
        this._ejercicioActivo = parseInt(el.dataset.index);
        this.activeNav = 'exercise_detail';
        this.render();
      };
    });
  },

  // ── DETALLE DE EJERCICIO ─────────────────────────────────────────────────
  renderExerciseDetail() {
    const rutina = generarRutina(this.userProfile);
    const idx = this._ejercicioActivo || 0;
    const ej = rutina.ejercicios[idx];
    const descansoSegs = typeof ej.descanso === 'number' ? ej.descanso : 60;
    const unidadReps = ej.esIsometrico ? 's' : 'reps';

    this.container.innerHTML = `
      <section style="animation:slideUp 0.5s ease-out;">
        <button id="btn-back" style="background:transparent; border:1px solid var(--glass-border); color:var(--text-secondary); padding:0.5rem 1rem; cursor:pointer; margin-bottom:1rem; font-family:var(--font-header); font-size:0.75rem;">← VOLVER</button>

        <!-- Cabecera ejercicio -->
        <div style="border-left:4px solid ${rutina.color || 'var(--primary-color)'}; padding:1rem 1.5rem; background:rgba(209,252,0,0.03); margin-bottom:1rem;">
          <div class="label-sm" style="font-size:0.6rem; color:${rutina.color || 'var(--primary-color)'}; margin-bottom:0.2rem;">${rutina.nombre}</div>
          <h1 class="glow-text" style="font-size:1.5rem; margin-bottom:0.3rem;">${ej.nombre}</h1>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <span style="background:rgba(209,252,0,0.12); color:var(--primary-color); padding:0.2rem 0.6rem; font-size:0.65rem; font-family:var(--font-header);">${ej.series} series × ${ej.reps} ${unidadReps}</span>
            <span style="background:rgba(255,255,255,0.06); padding:0.2rem 0.6rem; font-size:0.65rem; font-family:var(--font-header);">⏱ ${descansoSegs}s descanso</span>
            <span style="background:rgba(255,255,255,0.06); padding:0.2rem 0.6rem; font-size:0.65rem; font-family:var(--font-header);">🎯 ${ej.musculo}</span>
          </div>
        </div>

        <!-- Vídeo YouTube -->
        <div style="display:flex; justify-content:center; margin-bottom:1rem;">
          <div style="position:relative; width:100%; max-width:340px; padding-bottom:min(56.25%, 191px); background:#000; border:1px solid var(--glass-border); border-radius:4px; overflow:hidden;">
            <iframe
              src="https://www.youtube-nocookie.com/embed/${ej.videoId}?rel=0&modestbranding=1"
              style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen loading="lazy">
            </iframe>
          </div>
        </div>

        <!-- Consejo -->
        <div class="card glass-tactical" style="margin-bottom:0.8rem; border-left:3px solid var(--primary-color);">
          <div class="label-sm" style="font-size:0.6rem; color:var(--primary-color); margin-bottom:0.4rem;">💡 TÉCNICA CORRECTA</div>
          <p style="font-size:0.88rem; font-weight:500; margin:0;">${ej.consejo}</p>
        </div>

        <!-- Base científica ESPECÍFICA del ejercicio -->
        <div class="card glass" style="margin-bottom:1.2rem; border-left:2px solid var(--secondary-color);">
          <div class="label-sm" style="font-size:0.6rem; margin-bottom:0.4rem;">🔬 BASE CIENTÍFICA</div>
          <p style="font-size:0.8rem; opacity:0.85; margin:0;">${ej.ciencia}</p>
        </div>

        <!-- Temporizador de series -->
        <div class="card glass" style="padding:1.5rem;">
          <div class="label-sm" style="margin-bottom:1rem;">REGISTRO DE SERIES</div>

          <div id="timer-panel" style="display:none; text-align:center; padding:1.5rem; background:rgba(209,252,0,0.05); border:1px solid var(--primary-color); margin-bottom:1rem;">
            <div id="timer-label" class="label-sm" style="color:var(--primary-color); margin-bottom:0.5rem;">EJERCICIO EN CURSO</div>
            <div id="timer-display" style="font-size:3.5rem; font-family:var(--font-header); font-weight:900;" class="glow-text">00:00</div>
            <button id="btn-finish-set" style="margin-top:1rem; background:var(--primary-color); color:var(--bg-color); border:none; padding:0.8rem 2rem; font-family:var(--font-header); font-weight:800; cursor:pointer;">✓ FIN DE SERIE</button>
          </div>

          <div id="sets-container">
            ${Array.from({length: ej.series}, (_, i) => `
            <div id="set-row-${i}" style="display:flex; align-items:center; gap:0.8rem; margin-bottom:0.8rem; opacity:${i === 0 ? '1' : '0.4'}; transition:opacity 0.3s;">
              <span class="label-sm" style="width:40px; font-size:0.65rem;">SET ${i+1}</span>
              <input type="number" placeholder="${ej.reps}" class="reps-input" data-set="${i}" style="flex:1; background:var(--bg-color); border:1px solid var(--glass-border); padding:0.8rem; color:white; font-size:1.2rem; text-align:center; font-family:var(--font-header);" ${i > 0 ? 'disabled' : ''}>
              <button class="btn-start-set" data-set="${i}" style="background:${i === 0 ? 'var(--primary-color)' : 'transparent'}; color:${i === 0 ? 'var(--bg-color)' : 'var(--glass-border)'}; border:1px solid ${i === 0 ? 'var(--primary-color)' : 'var(--glass-border)'}; padding:0.6rem 0.9rem; font-family:var(--font-header); font-weight:800; cursor:pointer; font-size:0.75rem;" ${i > 0 ? 'disabled' : ''}>▶</button>
              <span id="set-status-${i}" style="font-size:1rem;"></span>
            </div>`).join('')}
          </div>

          <button id="finish-exercise-btn" class="glow-box" style="width:100%; background:rgba(209,252,0,0.2); color:var(--primary-color); border:1px solid var(--primary-color); padding:1.2rem; font-family:var(--font-header); font-weight:800; cursor:pointer; margin-top:0.5rem; opacity:0.5;" disabled>FINALIZAR EJERCICIO</button>
        </div>
      </section>`;

    // ── Lógica del temporizador ──────────────────────────────────────────────
    let timerInterval = null;
    let serieActual = 0;
    let seriesCompletadas = 0;
    const totalSeries = ej.series;

    const beep = (freq = 880, dur = 150) => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        osc.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.start();
        setTimeout(() => { osc.stop(); ctx.close(); }, dur);
      } catch(e) {}
    };

    const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

    const startTimer = (segundos, label, onDone) => {
      clearInterval(timerInterval);
      const panel = document.querySelector('#timer-panel');
      const display = document.querySelector('#timer-display');
      const lbl = document.querySelector('#timer-label');
      panel.style.display = 'block';
      lbl.innerText = label;
      let remaining = segundos;
      display.innerText = formatTime(remaining);
      timerInterval = setInterval(() => {
        remaining--;
        display.innerText = formatTime(remaining);
        if (remaining <= 3 && remaining > 0) beep(660, 100);
        if (remaining <= 0) {
          clearInterval(timerInterval);
          beep(1100, 300);
          panel.style.display = 'none';
          onDone();
        }
      }, 1000);
    };

    const activarSiguienteSerie = (idx) => {
      if (idx >= totalSeries) return;
      const row = document.querySelector(`#set-row-${idx}`);
      const input = row?.querySelector('.reps-input');
      const btn = row?.querySelector('.btn-start-set');
      if (row) { row.style.opacity = '1'; }
      if (input) { input.removeAttribute('disabled'); }
      if (btn) {
        btn.removeAttribute('disabled');
        btn.style.background = 'var(--primary-color)';
        btn.style.color = 'var(--bg-color)';
        btn.style.borderColor = 'var(--primary-color)';
      }
    };

    document.querySelectorAll('.btn-start-set').forEach(btn => {
      btn.onclick = () => {
        const setIdx = parseInt(btn.dataset.set);
        if (setIdx !== serieActual) return;

        if (ej.esIsometrico) {
          const secs = parseInt(ej.reps) || 30;
          startTimer(secs, `⏱ MANTÉN LA POSICIÓN — ${secs}s`, () => {
            document.querySelector(`#set-status-${setIdx}`).innerText = '✅';
            document.querySelector(`.reps-input[data-set="${setIdx}"]`).value = secs;
            seriesCompletadas++;
            if (seriesCompletadas < totalSeries) {
              serieActual++;
              startTimer(descansoSegs, `😮‍💨 DESCANSANDO — ${descansoSegs}s`, () => activarSiguienteSerie(serieActual));
            } else {
              document.querySelector('#finish-exercise-btn').removeAttribute('disabled');
              document.querySelector('#finish-exercise-btn').style.opacity = '1';
              document.querySelector('#finish-exercise-btn').style.background = 'var(--primary-color)';
              document.querySelector('#finish-exercise-btn').style.color = 'var(--bg-color)';
            }
          });
        } else {
          btn.innerText = '⏸';
          document.querySelector(`#timer-panel`).style.display = 'block';
          document.querySelector('#timer-label').innerText = '🔥 SERIE EN CURSO — Introduce las reps al terminar';
          document.querySelector('#timer-display').innerText = '—';
        }
      };
    });

    document.querySelector('#btn-finish-set')?.addEventListener('click', () => {
      const setIdx = serieActual;
      document.querySelector(`#set-status-${setIdx}`).innerText = '✅';
      document.querySelector('#timer-panel').style.display = 'none';
      seriesCompletadas++;
      if (seriesCompletadas < totalSeries) {
        serieActual++;
        startTimer(descansoSegs, `😮‍💨 DESCANSANDO — ${descansoSegs}s`, () => activarSiguienteSerie(serieActual));
      } else {
        document.querySelector('#finish-exercise-btn').removeAttribute('disabled');
        document.querySelector('#finish-exercise-btn').style.opacity = '1';
        document.querySelector('#finish-exercise-btn').style.background = 'var(--primary-color)';
        document.querySelector('#finish-exercise-btn').style.color = 'var(--bg-color)';
      }
    });

    document.querySelector('#btn-back').onclick = () => { clearInterval(timerInterval); this.activeNav = 'workouts'; this.render(); };
    document.querySelector('#finish-exercise-btn').onclick = async () => {
      clearInterval(timerInterval);
      const reps = [...document.querySelectorAll('.reps-input')].map(i => parseInt(i.value) || 0);
      const totalReps = reps.reduce((a, b) => a + b, 0);
      const rutina = getRutinaDelDia(this.userProfile, this.rotationMap) || {};
      const sessionData = {
        ejercicio: ej.nombre,
        rutinaId: rutina.id || 'unknown',
        rutinaNombre: rutina.nombre || ej.nombre,
        fecha: new Date().toLocaleDateString('es-ES'),
        reps,
        totalReps,
      };
      // Guardar sesión en Firestore / localStorage
      await saveSession(this._uid || null, sessionData);
      this.userProfile.sessionLog.push(sessionData);
      // Avanzar rotación y persistir
      this.rotationMap = avanzarRotacion(this.userProfile.level, this.rotationMap);
      await saveRotationMap(this._uid || null, this.rotationMap);
      this.activeNav = 'success';
      this.render();
    };
  },



  // ── ÉXITO ────────────────────────────────────────────────────────────────
  renderSuccess() {
    const ultimaSesion = this.userProfile.sessionLog.slice(-1)[0];
    const totalReps = ultimaSesion?.totalReps || 0;
    const kcal = Math.round(totalReps * 0.5);

    this.container.innerHTML = `
      <section style="animation:scaleIn 0.6s ease-out; display:flex; flex-direction:column; align-items:center; text-align:center; padding: 2rem 1rem;">
        <div style="width:80px; height:80px; border:2px solid var(--primary-color); display:flex; justify-content:center; align-items:center;" class="glow-box">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h1 class="glow-text" style="font-size:2rem; margin-top:1.5rem;">${this.t('mission_completed')}</h1>
        <p class="label-sm" style="color:var(--primary-color); margin-top:-0.3rem;">${this.t('new_pr')}</p>
        <div class="card glass-tactical" style="width:100%; margin-top:2rem; border-top:2px solid var(--primary-color); border-left:none;">
          <div class="label-sm" style="margin-bottom:1rem;">${this.t('payload')}</div>
          <div style="display:flex; justify-content:space-around;">
            <div><div class="stat-number" style="font-size:2rem;">${totalReps}</div><div class="label-sm">${this.t('total_reps')}</div></div>
            <div><div class="stat-number" style="font-size:2rem;">~${kcal}</div><div class="label-sm">KCAL</div></div>
            <div><div class="stat-number" style="font-size:2rem;">${this.userProfile.sessionLog.length}</div><div class="label-sm">SESIONES</div></div>
          </div>
        </div>
        <button id="return-hq-btn" style="margin-top:2rem; background:transparent; border:1px solid var(--primary-color); color:var(--primary-color); padding:1.2rem; cursor:pointer; width:100%; font-weight:800; font-family:var(--font-header);">${this.t('return_hq')}</button>
      </section>`;
    document.querySelector('#return-hq-btn').onclick = () => { this.activeNav = 'dashboard'; this.render(); };
  },

  // ── NUTRICIÓN ─────────────────────────────────────────────────────────────
  renderNutrition() {
    const macros = calcularMacros(this.userProfile);
    const obj = this.userProfile.objetivo;
    const peso = this.userProfile.peso || 75;
    const agua = Math.round(peso * 0.035 * 10) / 10;
    const proteina = macros?.proteina || Math.round(peso * 2);
    const objetivoLabel = { fuerza:'Fuerza Máxima', resistencia:'Resistencia', perdida:'Pérdida de Grasa', hipertrofia:'Hipertrofia' }[obj] || 'General';

    const dias = [
      { dia:'LUNES', entrena: true,
        comidas:[
          { momento:'☀️ Desayuno (7:00h)', alimentos:'Avena (80g) + proteína de suero (30g) + plátano + almendras (20g)', macro:'C: 60g · P: 40g · G: 12g' },
          { momento:'🥗 Almuerzo (13:00h)', alimentos:'Arroz integral (150g) + pechuga de pollo a la plancha (180g) + brócoli + aceite de oliva (10ml)', macro:'C: 55g · P: 50g · G: 10g' },
          { momento:'🍌 Pre-Entreno (17:30h)', alimentos:'Boniato cocido (120g) + atún al natural (100g)', macro:'C: 35g · P: 25g · G: 2g' },
          { momento:'🥛 Post-Entreno (20:00h)', alimentos:'Batido: proteína de suero (40g) + leche semidesnatada (300ml) + plátano', macro:'C: 45g · P: 45g · G: 7g' },
          { momento:'🌙 Cena (21:30h)', alimentos:'Salmón al horno (200g) + espárragos + puré de boniato (100g)', macro:'C: 25g · P: 42g · G: 15g' },
        ]},
      { dia:'MARTES', entrena: false,
        comidas:[
          { momento:'☀️ Desayuno', alimentos:'Huevos revueltos (3) + tostada integral (2) + aguacate (½)', macro:'C: 30g · P: 22g · G: 20g' },
          { momento:'🥗 Almuerzo', alimentos:'Lentejas guisadas (200g cocidas) + ensalada verde + aceite de oliva', macro:'C: 48g · P: 18g · G: 8g' },
          { momento:'🍎 Merienda', alimentos:'Queso cottage (200g) + manzana + nueces (20g)', macro:'C: 25g · P: 28g · G: 14g' },
          { momento:'🌙 Cena', alimentos:'Merluza al vapor (200g) + judías verdes + arroz integral (80g)', macro:'C: 30g · P: 38g · G: 4g' },
        ]},
      { dia:'MIÉRCOLES', entrena: true,
        comidas:[
          { momento:'☀️ Desayuno', alimentos:'Tortilla francesa (3 huevos) + avena (60g) + frutos rojos', macro:'C: 42g · P: 28g · G: 12g' },
          { momento:'🥗 Almuerzo', alimentos:'Pasta integral (130g) + carne magra (150g) + tomate + aceite', macro:'C: 65g · P: 38g · G: 10g' },
          { momento:'🍌 Pre-Entreno', alimentos:'Tostada integral + mantequilla de cacahuete (20g) + plátano', macro:'C: 45g · P: 8g · G: 10g' },
          { momento:'🥛 Post-Entreno', alimentos:'Proteína (40g) + avena (50g) + leche', macro:'C: 50g · P: 43g · G: 7g' },
          { momento:'🌙 Cena', alimentos:'Pechuga de pavo (200g) + brócoli + patata pequeña asada', macro:'C: 28g · P: 45g · G: 4g' },
        ]},
      { dia:'JUEVES', entrena: false,
        comidas:[
          { momento:'☀️ Desayuno', alimentos:'Greek yogur (200g) + granola (40g) + miel + kiwi', macro:'C: 45g · P: 20g · G: 10g' },
          { momento:'🥗 Almuerzo', alimentos:'Garbanzos (200g) + pollo desmenuzado (150g) + pimiento asado + aceite', macro:'C: 40g · P: 42g · G: 12g' },
          { momento:'🍎 Merienda', alimentos:'Atún (1 lata) + arroz inflado (30g) + pepino', macro:'C: 20g · P: 26g · G: 2g' },
          { momento:'🌙 Cena', alimentos:'Bacalao al horno (200g) + pisto de verduras + quinoa (80g)', macro:'C: 32g · P: 40g · G: 6g' },
        ]},
      { dia:'VIERNES', entrena: true,
        comidas:[
          { momento:'☀️ Desayuno', alimentos:'Avena (80g) + proteína (30g) + fresas + semillas de chía (10g)', macro:'C: 58g · P: 38g · G: 10g' },
          { momento:'🥗 Almuerzo', alimentos:'Arroz integral (150g) + pechuga (180g) + aguacate (½) + lima', macro:'C: 55g · P: 50g · G: 14g' },
          { momento:'🍌 Pre-Entreno', alimentos:'Dátiles (30g) + proteína de suero (20g)', macro:'C: 30g · P: 20g · G: 1g' },
          { momento:'🥛 Post-Entreno', alimentos:'Leche desnatada (400ml) + proteína (30g) + plátano', macro:'C: 40g · P: 42g · G: 4g' },
          { momento:'🌙 Cena', alimentos:'Solomillo de cerdo (180g) + judías + espinacas salteadas', macro:'C: 15g · P: 45g · G: 8g' },
        ]},
      { dia:'SÁBADO', entrena: false,
        comidas:[
          { momento:'☀️ Desayuno', alimentos:'Pancakes de avena y huevo (3) + miel + arándanos', macro:'C: 55g · P: 20g · G: 10g' },
          { momento:'🥗 Almuerzo', alimentos:'Paella de verduras con pollo (ración mediana)', macro:'C: 70g · P: 35g · G: 12g' },
          { momento:'🍎 Merienda', alimentos:'Queso fresco + membrillo + nueces', macro:'C: 20g · P: 16g · G: 15g' },
          { momento:'🌙 Cena', alimentos:'Ensalada de atún, huevo, tomate, maíz y arroz integral', macro:'C: 35g · P: 32g · G: 8g' },
        ]},
      { dia:'DOMINGO', entrena: false,
        comidas:[
          { momento:'☀️ Brunch', alimentos:'Huevos Benedict (2) + salmón ahumado + tostada integral + fruta', macro:'C: 35g · P: 30g · G: 18g' },
          { momento:'🥗 Comida', alimentos:'Pollo asado (200g) + patatas al horno + ensalada', macro:'C: 45g · P: 42g · G: 12g' },
          { momento:'🌙 Cena ligera', alimentos:'Caldo de verduras + tortilla francesa (2 huevos) + manzana', macro:'C: 18g · P: 14g · G: 8g' },
        ]},
    ];

    const diasHTML = dias.map((d, i) => `
      <div style="margin-bottom:1rem;">
        <div style="display:flex; align-items:center; justify-content:space-between; padding:0.8rem 1rem; background:rgba(209,252,0,0.06); border-left:3px solid ${d.entrena ? 'var(--primary-color)' : 'var(--glass-border)'}; cursor:pointer;" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'">
          <span style="font-family:var(--font-header); font-weight:800; font-size:0.9rem;">${d.dia} ${d.entrena ? '⚡ DÍA DE ENTRENO' : '🔄 RECUPERACIÓN'}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
        </div>
        <div style="display:none; border:1px solid var(--glass-border); border-top:none;">
          ${d.comidas.map(c => `
          <div style="padding:0.8rem 1rem; border-bottom:1px solid rgba(255,255,255,0.04);">
            <div style="font-size:0.75rem; font-weight:700; color:var(--primary-color); margin-bottom:0.2rem;">${c.momento}</div>
            <div style="font-size:0.82rem; margin-bottom:0.2rem;">${c.alimentos}</div>
            <div style="font-size:0.65rem; opacity:0.5; font-family:var(--font-header);">${c.macro}</div>
          </div>`).join('')}
        </div>
      </div>`).join('');

    this.container.innerHTML = `
      <section style="animation:fadeIn 0.5s ease-out;">
        <h1 class="glow-text" style="margin-bottom:0.2rem;">${this.t('fuel')}</h1>
        <p class="label-sm" style="margin-bottom:1rem; opacity:0.6;">OBJETIVO: ${objetivoLabel}</p>

        <div class="card glass-tactical" style="border-left:3px solid #ff3333; background:rgba(255,51,51,0.05); margin-bottom:1rem;">
          <p style="font-size:0.72rem; color:#ff3333; margin:0;">${this.t('nutrition_warning')}</p>
        </div>

        ${macros ? `
        <div class="card glass" style="margin-bottom:1rem; border-left:4px solid var(--primary-color);">
          <div class="label-sm" style="font-size:0.55rem; margin-bottom:0.8rem;">TUS MACROS CALCULADAS (HARRIS-BENEDICT + ISSN)</div>
          <div class="stats-grid">
            <div style="text-align:center;"><div class="stat-number" style="font-size:1.8rem; color:var(--primary-color);">${macros.kcal}</div><div class="label-sm" style="font-size:0.55rem;">KCAL</div></div>
            <div style="text-align:center;"><div class="stat-number" style="font-size:1.8rem;">${macros.proteina}</div><div class="label-sm" style="font-size:0.55rem;">g PROTEÍNA</div></div>
            <div style="text-align:center;"><div class="stat-number" style="font-size:1.8rem;">${macros.carbos}</div><div class="label-sm" style="font-size:0.55rem;">g CARBOS</div></div>
            <div style="text-align:center;"><div class="stat-number" style="font-size:1.8rem;">${agua}</div><div class="label-sm" style="font-size:0.55rem;">L AGUA</div></div>
          </div>
        </div>` : `<div class="card glass" style="text-align:center; padding:1.5rem; margin-bottom:1rem;"><p style="opacity:0.5;">Completa el test para ver tus macros personalizadas.</p></div>`}

        <div class="label-sm" style="margin-bottom:0.8rem; color:var(--primary-color);">📅 PLAN SEMANAL DE DIETA (ISSN / Consenso Español Nutrición Deportiva 2022)</div>
        ${diasHTML}
      </section>`;
  },


  // ── INTEL (PROGRESO) ─────────────────────────────────────────────────────
  renderProgress() {
    const log = this.userProfile.sessionLog;
    const totalSesiones = log.length;
    const totalReps = log.reduce((acc, s) => acc + s.totalReps, 0);
    const maxReps = log.reduce((max, s) => Math.max(max, s.totalReps), 0);

    // ── Racha de días consecutivos ──────────────────────────────────────────
    const fechasUnicas = [...new Set(log.map(s => s.fecha))].reverse();
    let racha = 0;
    const hoy = new Date();
    for (let i = 0; i < fechasUnicas.length; i++) {
      const d = new Date(fechasUnicas[i].split('/').reverse().join('-'));
      const diffDias = Math.round((hoy - d) / 86400000);
      if (diffDias === i || diffDias === i + 1) racha++;
      else break;
    }

    // ── Gráfica de barras SVG — sesiones por semana (últimas 6 semanas) ──────
    const porSemana = {};
    log.forEach(s => {
      const parts = s.fecha.split('/');
      if (parts.length !== 3) return;
      const d = new Date(`${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`);
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - d.getDay());
      const key = startOfWeek.toISOString().slice(0, 10);
      porSemana[key] = (porSemana[key] || 0) + 1;
    });
    const semanas = Object.keys(porSemana).sort().slice(-6);
    const maxSemana = Math.max(...semanas.map(k => porSemana[k]), 1);
    const barW = 32, barGap = 10, chartH = 80;
    const svgW = semanas.length * (barW + barGap);
    const barsHTML = semanas.map((k, i) => {
      const val = porSemana[k];
      const barH = Math.round((val / maxSemana) * chartH);
      const x = i * (barW + barGap);
      const fechaCorta = k.slice(5); // MM-DD
      return `
        <rect x="${x}" y="${chartH - barH}" width="${barW}" height="${barH}" fill="var(--primary-color)" opacity="0.85" rx="2"/>
        <text x="${x + barW/2}" y="${chartH + 14}" text-anchor="middle" font-size="8" fill="rgba(255,255,255,0.4)">${fechaCorta}</text>
        <text x="${x + barW/2}" y="${chartH - barH - 4}" text-anchor="middle" font-size="9" fill="var(--primary-color)">${val}</text>`;
    }).join('');

    const chartHTML = semanas.length > 0 ? `
      <div class="card glass" style="margin-bottom:1.2rem; padding:1.2rem;">
        <div class="label-sm" style="font-size:0.55rem; margin-bottom:1rem;">📊 SESIONES POR SEMANA</div>
        <svg width="100%" viewBox="0 0 ${Math.max(svgW, 100)} ${chartH + 20}" style="overflow:visible;">
          ${barsHTML}
        </svg>
      </div>` : '';

    // ── Historial de sesiones ──────────────────────────────────────────────
    const logHTML = log.length === 0
      ? '<p style="opacity:0.5; text-align:center; padding:2rem 0;">Aún no hay sesiones registradas. ¡Completa tu primer entrenamiento!</p>'
      : [...log].reverse().slice(0, 20).map(s => `
          <div class="card glass" style="padding:0.9rem 1rem; margin-bottom:0.6rem; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.85rem; font-weight:700; color:var(--primary-color); margin-bottom:0.1rem;">${s.rutinaNombre || s.ejercicio}</div>
              <div class="label-sm" style="font-size:0.6rem; opacity:0.6;">${s.ejercicio} · ${s.fecha}</div>
            </div>
            <div style="text-align:right;">
              <div class="stat-number" style="font-size:1.4rem;">${s.totalReps}</div>
              <div class="label-sm" style="font-size:0.5rem;">REPS</div>
            </div>
          </div>`).join('');

    this.container.innerHTML = `
      <section style="animation:fadeIn 0.5s ease-out;">
        <h1 class="glow-text" style="margin-bottom:0.3rem;">${this.t('intel')}</h1>
        <p class="label-sm" style="margin-bottom:1.2rem; opacity:0.6;">REGISTRO OPERATIVO DE PROGRESIÓN</p>

        <div class="stats-grid" style="margin-bottom:1.2rem;">
          <div class="card glass" style="padding:1rem; border-left:3px solid var(--primary-color);">
            <div class="label-sm" style="font-size:0.55rem;">SESIONES</div>
            <div class="stat-number" style="font-size:2rem;">${totalSesiones}</div>
          </div>
          <div class="card glass" style="padding:1rem; border-left:3px solid #00f5c8;">
            <div class="label-sm" style="font-size:0.55rem;">RACHA 🔥</div>
            <div class="stat-number" style="font-size:2rem;">${racha}<span style="font-size:0.8rem;opacity:0.5;"> días</span></div>
          </div>
          <div class="card glass" style="padding:1rem; border-left:3px solid var(--primary-color);">
            <div class="label-sm" style="font-size:0.55rem;">REPS TOTAL</div>
            <div class="stat-number" style="font-size:2rem;">${totalReps}</div>
          </div>
          <div class="card glass" style="padding:1rem; border-left:3px solid #00f5c8;">
            <div class="label-sm" style="font-size:0.55rem;">MEJOR SESIÓN</div>
            <div class="stat-number" style="font-size:2rem;">${maxReps}</div>
          </div>
        </div>

        ${chartHTML}

        <div class="label-sm" style="margin-bottom:0.8rem;">HISTORIAL DE SESIONES</div>
        ${logHTML}
      </section>`;
  }
};

app.init();

