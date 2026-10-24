// Progreso y borradores del alumno, guardados en el navegador (localStorage).
// Es solo una comodidad: si el navegador no deja guardar, la aplicación sigue funcionando.

import { useCallback, useEffect, useState } from 'react';

const CLAVE = 'eda-ejercicios-v1';
const EVENTO = 'eda-progreso';

interface Registro {
  resuelto?: boolean;
  datos?: Record<string, unknown>;
}

function leer(): Record<string, Registro> {
  try {
    return migrarPilasColas(migrar(JSON.parse(localStorage.getItem(CLAVE) || '{}')));
  } catch {
    return {};
  }
}

// Los campos del nodo pasaron de info/sig/ant a valor/siguiente/anterior: los borradores
// guardados antes se traducen una vez para que sigan funcionando.
const MIGRADO = '__campos-v2';
function migrar(todo: Record<string, Registro>): Record<string, Registro> {
  if ((todo as Record<string, unknown>)[MIGRADO]) return todo;
  const traducir = (x: unknown): unknown =>
    typeof x === 'string'
      ? x.replace(/\bsig\b/g, 'siguiente').replace(/\binfo\b/g, 'valor').replace(/\bant\b/g, 'anterior')
      : Array.isArray(x)
        ? x.map(traducir)
        : x && typeof x === 'object'
          ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, traducir(v)]))
          : x;
  for (const r of Object.values(todo)) if (r?.datos) r.datos = traducir(r.datos) as Record<string, unknown>;
  (todo as Record<string, unknown>)[MIGRADO] = { resuelto: false };
  try {
    localStorage.setItem(CLAVE, JSON.stringify(todo));
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
  return todo;
}

// Stacks and queues moved to the Pilas and Colas projects (PilaArray, pila->array,
// pushArray...): drafts written with the old names no longer run and cannot be translated
// line by line, so they are dropped once. What was solved stays solved.
const MIGRADO_PILAS_COLAS = '__pilas-colas-v3';
function migrarPilasColas(todo: Record<string, Registro>): Record<string, Registro> {
  if ((todo as Record<string, unknown>)[MIGRADO_PILAS_COLAS]) return todo;
  for (const [id, r] of Object.entries(todo)) if (/^[34]-/.test(id) && r?.datos) delete r.datos;
  (todo as Record<string, unknown>)[MIGRADO_PILAS_COLAS] = { resuelto: false };
  try {
    localStorage.setItem(CLAVE, JSON.stringify(todo));
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
  return todo;
}

function escribir(todo: Record<string, Registro>) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(todo));
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
  window.dispatchEvent(new Event(EVENTO));
}

export function marcarResuelto(id: string) {
  const todo = leer();
  if (todo[id]?.resuelto) return;
  todo[id] = { ...todo[id], resuelto: true };
  escribir(todo);
}

export function borrarProgreso() {
  escribir({});
}

export function useResueltos(): Set<string> {
  const calc = () => new Set(Object.entries(leer()).filter(([, r]) => r.resuelto).map(([k]) => k));
  const [s, setS] = useState(calc);
  useEffect(() => {
    const f = () => setS(calc());
    window.addEventListener(EVENTO, f);
    window.addEventListener('storage', f);
    return () => {
      window.removeEventListener(EVENTO, f);
      window.removeEventListener('storage', f);
    };
  }, []);
  return s;
}

/** Estado de React que se guarda como borrador del ejercicio. */
export function useBorrador<T>(ejercicio: string, campo: string, inicial: () => T): [T, (v: T) => void, () => void] {
  const [v, setV] = useState<T>(() => {
    const d = leer()[ejercicio]?.datos?.[campo];
    return d === undefined ? inicial() : (d as T);
  });
  const set = useCallback(
    (nuevo: T) => {
      setV(nuevo);
      const todo = leer();
      todo[ejercicio] = { ...todo[ejercicio], datos: { ...todo[ejercicio]?.datos, [campo]: nuevo } };
      try {
        localStorage.setItem(CLAVE, JSON.stringify(todo));
      } catch {
        /* nada */
      }
    },
    [ejercicio, campo],
  );
  const reiniciar = useCallback(() => set(inicial()), [set]); // eslint-disable-line
  return [v, set, reiniciar];
}
