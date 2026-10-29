// Cost exercises: the interpreter runs the fragment for a given n and the count is
// whatever is left in x. No count is written by hand.

import { ejecutar } from '../interprete/ejecutar';
import { construir, entero } from '../memoria/construir';
import { Contexto } from '../memoria/modelo';
import { EjCoste } from './tipos';

const CTX: Contexto = { structs: [] };

/** Enough for O(n³) with n = 64 or O(n²) with n = 512, and still quick in the browser. */
const MAX_PASOS = 1_000_000;

export function contarVueltas(ej: EjCoste, n: number): { x: number } | { error: string } {
  const inicial = construir(CTX, [entero('n', n), entero('x', 0), entero('i', 0), entero('j', 0), entero('k', 0)]);
  const r = ejecutar(ej.contar ?? ej.codigo, CTX, inicial, { sinPasos: true, maxPasos: MAX_PASOS });
  if (r.error?.tipo === 'bucle') return { error: 'Demasiadas vueltas para contarlas aquí: prueba con un n más pequeño.' };
  if (r.error) return { error: r.error.mensaje };
  const x = r.memFinal.marcos[0].vars.find((v) => v.nombre === 'x')?.valor;
  return x?.k === 'int' ? { x: x.v } : { error: 'x no tiene un valor entero.' };
}

/** How a value of n is read in the growth table. */
export const verNumero = (v: number) => v.toLocaleString('es-ES');
