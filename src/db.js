// ── BASE DE DATOS — Firestore + fallback localStorage ────────────────────────
// Si el usuario está autenticado con Google → Firestore
// Si está en modo Demo → localStorage

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, orderBy, query } from 'firebase/firestore';

let db = null;

// Inicializar Firestore reutilizando la app Firebase ya creada
try {
  if (getApps().length > 0) {
    db = getFirestore(getApps()[0]);
  }
} catch (e) {
  console.warn('Firestore no disponible, usando localStorage', e);
}

// ── Claves localStorage para modo Demo ────────────────────────────────────────
const LS_SESSIONS   = 'comandk_sessions';
const LS_ROTATION   = 'comandk_rotation_index';

// ── SESIONES ──────────────────────────────────────────────────────────────────

/**
 * Guarda una sesión completada.
 * @param {string|null} uid  - UID del usuario Google (null = modo Demo)
 * @param {Object} session   - { rutinaId, rutinaNombre, ejercicio, reps, totalReps, fecha }
 */
export async function saveSession(uid, session) {
  const data = { ...session, ts: Date.now() };

  if (uid && db) {
    try {
      await addDoc(collection(db, 'users', uid, 'sessions'), data);
      return;
    } catch (e) { console.warn('Firestore write failed, fallback localStorage', e); }
  }

  // Fallback localStorage
  const stored = JSON.parse(localStorage.getItem(LS_SESSIONS) || '[]');
  stored.push(data);
  localStorage.setItem(LS_SESSIONS, JSON.stringify(stored));
}

/**
 * Carga el historial de sesiones del usuario.
 * @returns {Promise<Array>}
 */
export async function loadSessions(uid) {
  if (uid && db) {
    try {
      const q = query(collection(db, 'users', uid, 'sessions'), orderBy('ts', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    } catch (e) { console.warn('Firestore read failed, fallback localStorage', e); }
  }

  return JSON.parse(localStorage.getItem(LS_SESSIONS) || '[]');
}

// ── ROTACIÓN DE RUTINAS ───────────────────────────────────────────────────────

/**
 * Guarda el índice de rotación (qué rutina toca a continuación por nivel).
 * @param {string|null} uid
 * @param {Object} rotationMap  - { beginner: 0, intermediate: 2, elite: 1 }
 */
export async function saveRotationMap(uid, rotationMap) {
  if (uid && db) {
    try {
      await setDoc(doc(db, 'users', uid, 'meta', 'rotation'), rotationMap);
      return;
    } catch (e) { console.warn('Firestore write failed', e); }
  }
  localStorage.setItem(LS_ROTATION, JSON.stringify(rotationMap));
}

/**
 * Carga el índice de rotación.
 * @returns {Promise<Object>}
 */
export async function loadRotationMap(uid) {
  if (uid && db) {
    try {
      const snap = await getDoc(doc(db, 'users', uid, 'meta', 'rotation'));
      if (snap.exists()) return snap.data();
    } catch (e) { console.warn('Firestore read failed', e); }
  }
  return JSON.parse(localStorage.getItem(LS_ROTATION) || '{}');
}
