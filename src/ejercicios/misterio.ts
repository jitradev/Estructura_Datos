// Mystery functions: what the student has to predict in each case is computed by running
// the code shown. Structures are read as plain lists of values in a fixed order.

import { Resultado } from '../interprete/ejecutar';
import { Memoria, Valor } from '../memoria/modelo';
import { ejecutarCaso } from './comprobar';
import { Caso, EjMisterio } from './tipos';

export interface Pregunta {
  responder: string; // «devuelve» or a variable of main
  texto: string; // admits `código`
  formato: string; // placeholder of the input
}

export interface Respuesta {
  valores: number[] | null; // null: not computable (an error)
  texto: string; // how it is shown: «9», «4 9 2», «vacía»
}

const campo = (m: Memoria, v: Valor) => (v.k === 'ref' && v.r.k === 'obj' ? m.objetos[v.r.id] : undefined);

/** Values of a chain of nodes, from the first one. */
function cadena(m: Memoria, v: Valor): number[] {
  const out: number[] = [];
  const vistos = new Set<number>();
  for (let o = campo(m, v); o && !vistos.has(o.id) && out.length < 50; o = campo(m, o.campos.siguiente as Valor)) {
    vistos.add(o.id);
    const d = o.campos.valor as Valor;
    out.push(d.k === 'int' ? d.v : NaN);
  }
  return out;
}

/** What a variable holds, as values: an int, a list from its head, a stack from the bottom, a queue from the front. */
export function valoresDe(m: Memoria, nombre: string): number[] | null {
  const v = m.marcos[0].vars.find((x) => x.nombre === nombre)?.valor;
  if (!v) return null;
  if (v.k === 'int') return [v.v];
  const o = campo(m, v);
  if (!o) return v.k === 'nulo' ? [] : null;
  const c = o.campos;
  const int = (x: Valor | Valor[]) => ((x as Valor).k === 'int' ? (x as { v: number }).v : NaN);
  if ('siguiente' in c) return cadena(m, v);
  if ('inicio' in c) return cadena(m, c.inicio as Valor);
  if ('cima' in c && 'array' in c) return (c.array as Valor[]).slice(0, int(c.cima) + 1).map(int);
  if ('cima' in c) return cadena(m, c.cima as Valor).reverse();
  if ('frente' in c) {
    const arr = c.array as Valor[];
    return Array.from({ length: int(c.numElementos) }, (_, i) => int(arr[(int(c.frente) + i) % arr.length]));
  }
  return null;
}

/** The questions of an exercise, with the order in which structures are written. */
export function preguntas(ej: EjMisterio, caso: Caso): Pregunta[] {
  return ej.responder.map((r) => {
    if (r === 'devuelve') return { responder: r, texto: '¿Qué devuelve?', formato: 'Un número' };
    const tipo = tipoDe(ej, caso, r);
    if (tipo === 'int') return { responder: r, texto: `¿Cuánto vale \`${r}\` al final?`, formato: 'Un número' };
    const orden = /Pila/.test(tipo) ? ', del fondo a la cima' : /Cola/.test(tipo) ? ', del frente al final' : '';
    return { responder: r, texto: `¿Cómo queda \`${r}\`${orden}?`, formato: 'p. ej. 4 9 2, o «vacía»' };
  });
}

/** Type of a variable of main once the code has run (it may be declared by the code itself). */
function tipoDe(ej: EjMisterio, caso: Caso, nombre: string): string {
  const r = ejecutarCaso(ej.solucion, ej, caso, false);
  return r.memFinal.marcos[0].vars.find((v) => v.nombre === nombre)?.tipo.base ?? 'int';
}

const verValores = (vs: number[] | null, unico: boolean) => (vs === null ? '?' : vs.length === 0 ? 'vacía' : unico ? String(vs[0]) : vs.join(' '));

export function respuestas(ej: EjMisterio, caso: Caso): { r: Resultado; respuestas: Respuesta[] } {
  const r = ejecutarCaso(ej.solucion, ej, caso, false);
  const out = preguntas(ej, caso).map((p) => {
    if (r.error) return { valores: null, texto: '?' };
    if (p.responder === 'devuelve') {
      const v = r.devuelve?.k === 'int' ? [r.devuelve.v] : null;
      return { valores: v, texto: verValores(v, true) };
    }
    const v = valoresDe(r.memFinal, p.responder);
    return { valores: v, texto: verValores(v, p.formato === 'Un número') };
  });
  return { r, respuestas: out };
}

/** Reads what the student typed: the numbers in it, or an empty list for «vacía», «NULL»... */
export function leerValores(s: string): number[] | null {
  const nums = s.match(/-?\d+/g);
  if (nums) return nums.map(Number);
  return /vac|null|nada|ningun/i.test(s) ? [] : null;
}

export const mismosValores = (a: number[] | null, b: number[] | null) => !!a && !!b && a.length === b.length && a.every((x, i) => x === b[i]);
