// Cost exercises: the interpreter runs the fragment for a given n and the count is
// whatever is left in x. No count is written by hand.

import { ejecutar } from '../interprete/ejecutar';
import { construir, entero } from '../memoria/construir';
import { Contexto } from '../memoria/modelo';
import { ClaseCoste, CLASES_COSTE, EjCoste } from './tipos';

const CTX: Contexto = { structs: [] };

/** Enough for O(n³) with n = 64 or O(n²) with n = 512, and still quick in the browser. */
const MAX_PASOS = 1_000_000;

export const contarVueltas = (ej: EjCoste, n: number) => contarCodigo(ej.contar ?? ej.codigo, n);

/** Runs `codigo` with `n` and reads `x`. `n`, `x`, `i`, `j` and `k` are already declared. */
export function contarCodigo(codigo: string, n: number, maxPasos = MAX_PASOS): { x: number } | { error: string } {
  const inicial = construir(CTX, [entero('n', n), entero('x', 0), entero('i', 0), entero('j', 0), entero('k', 0)]);
  const r = ejecutar(codigo, CTX, inicial, { sinPasos: true, maxPasos });
  if (r.error?.tipo === 'bucle') return { error: 'Demasiadas vueltas para contarlas aquí: prueba con un n más pequeño.' };
  if (r.error) return { error: r.error.mensaje };
  const x = r.memFinal.marcos[0].vars.find((v) => v.nombre === 'x')?.valor;
  return x?.k === 'int' ? { x: x.v } : { error: 'x no tiene un valor entero.' };
}

/** How a value of n is read in the growth table. */
export const verNumero = (v: number) => v.toLocaleString('es-ES');

/** Spellings of each class once normalised (lowercase, no spaces, no O(...), no log base). */
const FORMAS: Record<string, ClaseCoste> = {
  '1': 'O(1)',
  loglogn: 'O(log log n)',
  logn: 'O(log n)',
  raizn: 'O(√n)',
  n: 'O(n)',
  nlogn: 'O(n log n)',
  lognn: 'O(n log n)',
  n2: 'O(n²)',
  n3: 'O(n³)',
};

function normalizar(s: string): string {
  let t = s
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/²/g, '2')
    .replace(/³/g, '3')
    .replace(/[₀-₉]/g, '')
    .replace(/[·*×]/g, '');
  const o = t.match(/^o\((.*)\)$/);
  if (o) t = o[1];
  return t
    .replace(/\^/g, '')
    .replace(/n\(1\/2\)|n1\/2|n0[.,]5|sqrt\(?n\)?|√\(?n\)?|raiz\(?n\)?/g, 'raizn')
    .replace(/lg|ln/g, 'log')
    .replace(/log_?\d*/g, 'log')
    .replace(/log\(([^()]*)\)/g, 'log$1')
    .replace(/log\(([^()]*)\)/g, 'log$1');
}

/**
 * Reads a typed cost («O(n^2)», «n log n», «log(n)», «sqrt(n)»...). Returns the class, a
 * hint when it is a class with constants left in («O(2n)», «n/2»), or nothing.
 */
export function leerCoste(s: string): { clase: ClaseCoste } | { constante: ClaseCoste } | null {
  const t = normalizar(s);
  if (FORMAS[t]) return { clase: FORMAS[t] };
  if (/^\d+$/.test(t)) return { constante: 'O(1)' };
  const sin = t.replace(/^\d+(?=[a-z])/, '').replace(/\/\d+$/, '').replace(/^\((.*)\)$/, '$1');
  if (sin !== t && FORMAS[sin]) return { constante: FORMAS[sin] };
  return null;
}

const lg = Math.log2;
/** Growth of each class, to compare with the counts. */
export const CRECIMIENTO: Record<ClaseCoste, (n: number) => number> = {
  'O(1)': () => 1,
  'O(log log n)': (n) => lg(lg(n)),
  'O(log n)': lg,
  'O(√n)': Math.sqrt,
  'O(n)': (n) => n,
  'O(n log n)': (n) => n * lg(n),
  'O(n²)': (n) => n * n,
  'O(n³)': (n) => n ** 3,
};

/**
 * The class whose growth best follows the counts: the one for which count / growth stays
 * most constant (least spread of its logarithm) over the largest values of n.
 */
export function estimarCoste(puntos: { n: number; x: number }[]): ClaseCoste | null {
  const ps = puntos.filter((p) => p.x > 0 && p.n >= 4).slice(-4);
  if (ps.length < 3) return null;
  let mejor: ClaseCoste | null = null;
  let menor = Infinity;
  for (const clase of CLASES_COSTE) {
    const r = ps.map((p) => Math.log(p.x / CRECIMIENTO[clase](p.n)));
    const dispersion = Math.max(...r) - Math.min(...r);
    if (dispersion < menor - 1e-9) {
      menor = dispersion;
      mejor = clase;
    }
  }
  return mejor;
}
