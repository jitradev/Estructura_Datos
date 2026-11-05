// Fill-the-table exercises: the operations are simulated here, so nothing of the solution
// is written by hand. Open addressing follows tabla_abierta.c: a deleted cell does not stop
// a search, and insertar first checks that the key is not further on and then takes the
// first cell that is not occupied (a deleted one or the empty one where the search stopped).

import { EjDispersion, OpHash } from './tipos';

/** A cell of an open table: a key, empty or deleted. */
export type Celda = { k: 'vacia' } | { k: 'ocupada'; clave: number } | { k: 'borrada'; clave: number };

export interface PasoHash {
  op: OpHash;
  /** Cells looked at (open addressing) or keys of the nodes looked at (chaining). */
  mira: number[];
  /** «3» (the cell or bucket where it goes), «ya estaba», «no cabe», «está», «no está», «borrada». */
  resultado: string;
}

export interface Simulacion {
  pasos: PasoHash[];
  /** Open addressing: the cells at the end. */
  celdas: Celda[];
  /** Chaining: each bucket from its head. */
  cubos: number[][];
}

export const h1 = (ej: EjDispersion, x: number) => x % ej.tam;
export const h2 = (ej: EjDispersion, x: number) => ej.q! - (x % ej.q!);

/** The i-th cell tried for x (i = 0 is its hash). */
export function sondeo(ej: EjDispersion, x: number, i: number): number {
  const h = h1(ej, x);
  if (ej.sondeo === 'cuadratica') return (h + i * i) % ej.tam;
  if (ej.sondeo === 'doble') return (h + i * h2(ej, x)) % ej.tam;
  return (h + i) % ej.tam;
}

export const abierta = (ej: EjDispersion) => ej.sondeo !== 'encadenamiento';

export function simular(ej: EjDispersion): Simulacion {
  const celdas: Celda[] = Array.from({ length: ej.tam }, () => ({ k: 'vacia' }));
  const cubos: number[][] = Array.from({ length: ej.tam }, () => []);
  const pasos: PasoHash[] = [];
  for (const op of ej.ops) {
    const x = op.clave;
    if (!abierta(ej)) {
      const cubo = cubos[h1(ej, x)];
      if (op.op === 'insertar') {
        cubo.unshift(x);
        pasos.push({ op, mira: [], resultado: String(h1(ej, x)) });
        continue;
      }
      const k = cubo.indexOf(x);
      const mira = k < 0 ? [...cubo] : cubo.slice(0, k + 1);
      if (op.op === 'eliminar' && k >= 0) cubo.splice(k, 1);
      pasos.push({ op, mira, resultado: k < 0 ? 'no está' : op.op === 'buscar' ? 'está' : 'borrada' });
      continue;
    }
    // the search of posicion(): stops at an empty cell, goes on through deleted ones
    const mira: number[] = [];
    let donde = -1;
    for (let i = 0; i < ej.tam; i++) {
      const p = sondeo(ej, x, i);
      mira.push(p);
      const c = celdas[p];
      if (c.k === 'vacia') break;
      if (c.k === 'ocupada' && c.clave === x) {
        donde = p;
        break;
      }
    }
    if (op.op === 'buscar') pasos.push({ op, mira, resultado: donde >= 0 ? 'está' : 'no está' });
    else if (op.op === 'eliminar') {
      if (donde >= 0) celdas[donde] = { k: 'borrada', clave: x };
      pasos.push({ op, mira, resultado: donde >= 0 ? 'borrada' : 'no está' });
    } else if (donde >= 0) pasos.push({ op, mira, resultado: 'ya estaba' });
    else {
      const libre = mira.find((p) => celdas[p].k !== 'ocupada');
      if (libre === undefined) pasos.push({ op, mira, resultado: 'no cabe' });
      else {
        celdas[libre] = { k: 'ocupada', clave: x };
        pasos.push({ op, mira, resultado: String(libre) });
      }
    }
  }
  return { pasos, celdas, cubos };
}

/** The keys in order of appearance, without repeating, for the hash step. */
export const clavesDe = (ej: EjDispersion) => [...new Set(ej.ops.map((o) => o.clave))];

/** How many keys the table holds at the end. */
export function ocupadas(ej: EjDispersion, s = simular(ej)): number {
  return abierta(ej) ? s.celdas.filter((c) => c.k === 'ocupada').length : s.cubos.reduce((a, c) => a + c.length, 0);
}

// ------------------------------------------------------------------ reading answers

/** The numbers in a text: «3 4 5», «3, 4, 5». */
export const numeros = (s: string) => (s.match(/-?\d+/g) ?? []).map(Number);

/** What the student wrote in a cell: «.» or empty, «B» (with or without the old key) or a key. */
export function leerCelda(s: string): Celda | null {
  const t = s.trim().toUpperCase();
  if (t === '' || t === '.' || t === '-') return { k: 'vacia' };
  if (t.startsWith('B')) return { k: 'borrada', clave: NaN };
  return /^\d+$/.test(t) ? { k: 'ocupada', clave: Number(t) } : null;
}

export const mismaCelda = (a: Celda | null, b: Celda) =>
  !!a && a.k === b.k && (a.k !== 'ocupada' || a.clave === (b as { clave: number }).clave);

/** «.», «B» or the key, as it is written in the booklet. */
export const verCelda = (c: Celda) => (c.k === 'vacia' ? '.' : c.k === 'borrada' ? 'B' : String(c.clave));

/** Options of the result column for an operation. */
export function opcionesResultado(ej: EjDispersion, op: OpHash): string[] {
  if (op.op === 'buscar') return ['está', 'no está'];
  if (op.op === 'eliminar') return ['borrada', 'no está'];
  return abierta(ej) ? ['ya estaba', 'no cabe'] : [];
}

/** What the student wrote as the result of an insertion: a cell, or one of the words. */
export function leerResultado(s: string): string {
  const t = s.trim().toLowerCase();
  if (/^\d+$/.test(t)) return String(Number(t));
  if (/ya/.test(t)) return 'ya estaba';
  if (/cabe|llena/.test(t)) return 'no cabe';
  if (/no/.test(t)) return 'no está';
  if (/borr|elim/.test(t)) return 'borrada';
  if (/est/.test(t)) return 'está';
  return t;
}

/** A number written with a comma or a point, or as a fraction «7/7». */
export function leerNumero(s: string): number | null {
  const t = s.trim().replace(',', '.');
  const f = t.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
  if (f) return Number(f[1]) / Number(f[2]);
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : null;
}

/** Two decimals are enough: 0,77 for 10/13. */
export const mismoNumero = (a: number | null, b: number) => a !== null && Math.abs(a - b) < 0.006 + 1e-9;

export const textoOp = (o: OpHash) => `${o.op}(${o.clave})`;

export const NOMBRE_SONDEO: Record<EjDispersion['sondeo'], string> = {
  encadenamiento: 'encadenamiento',
  lineal: 'exploración lineal',
  cuadratica: 'exploración cuadrática',
  doble: 'doble hashing',
};
