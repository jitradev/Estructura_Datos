// Checking the specification exercises (topic 1). The student types signatures and the right
// sides of equations; both are read leniently: type synonyms (int, double, bool, string...),
// spaces, and the order of the operands of + and * do not matter.

import { EcuacionEspec, EjEspec, OpEspec } from './tipos';

const TIPOS: Record<string, string> = {
  entero: 'entero',
  int: 'entero',
  integer: 'entero',
  natural: 'entero',
  real: 'real',
  double: 'real',
  float: 'real',
  decimal: 'real',
  booleano: 'booleano',
  bool: 'booleano',
  boolean: 'booleano',
  logico: 'booleano',
  lógico: 'booleano',
  cadena: 'cadena',
  string: 'cadena',
  'char*': 'cadena',
  texto: 'cadena',
};

/** A type as written by the student, in the course's words; null if unknown. */
export function normalizarTipo(s: string, tad: string): string | null {
  const t = s.trim().toLowerCase().replace(/\s+/g, '').replace(/^const/, '');
  if (!t) return null;
  if (t === tad.toLowerCase() || t === `${tad.toLowerCase()}*`) return tad;
  return TIPOS[t] ?? null;
}

/** Reads «entero, entero -> Fraccion», «(entero, entero) → Fraccion» or «entero x entero -> Fraccion». */
export function leerFirma(s: string, tad: string): { args: string[]; devuelve: string } | null {
  const partes = s.split(/->|→|=>/);
  if (partes.length !== 2) return null;
  let izq = partes[0].trim();
  const p = izq.indexOf('(');
  if (p >= 0) izq = izq.slice(p + 1, izq.lastIndexOf(')') > p ? izq.lastIndexOf(')') : undefined);
  const trozos = /^\s*(nada|void|vacio|vacío|ninguno)?\s*$/i.test(izq) ? [] : izq.split(/,|×|\s+x\s+/i);
  const args = trozos.map((a) => normalizarTipo(a, tad));
  const devuelve = normalizarTipo(partes[1], tad);
  if (args.some((a) => a === null) || !devuelve) return null;
  return { args: args as string[], devuelve };
}

export const mismaFirma = (op: OpEspec, f: { args: string[]; devuelve: string }) =>
  f.devuelve === op.devuelve && f.args.length === op.args.length && f.args.every((a, i) => a === op.args[i]);

export const textoFirma = (op: OpEspec) => `${op.constructora ? '*' : ''}${op.nombre}(${op.args.join(', ')}) -> ${op.devuelve}`;

// ------------------------------------------------------------------ expressions

type Nodo = { k: 'hoja'; v: string } | { k: 'op'; op: string; xs: Nodo[] } | { k: 'f'; f: string; xs: Nodo[] } | { k: 'neg'; x: Nodo };

/** A small parser for the right sides: calls, + - * /, unary minus and comparisons. */
function parsear(s: string): Nodo | null {
  const toks = s.match(/\d+(?:\.\d+)?|[A-Za-zÀ-ÿ_][\wÀ-ÿ]*|<=|>=|==|!=|[-+*/(),=<>]/g);
  if (!toks || toks.join('') !== s.replace(/\s+/g, '')) return null;
  let i = 0;
  const ver = () => toks[i];
  const comer = (t?: string) => (t === undefined || toks[i] === t ? toks[i++] : null);
  const comparacion = (): Nodo | null => {
    const a = suma();
    if (!a) return null;
    const op = ver();
    if (op && ['=', '==', '!=', '<', '>', '<=', '>='].includes(op)) {
      i++;
      const b = suma();
      return b && { k: 'op', op: op === '==' ? '=' : op, xs: [a, b] };
    }
    return a;
  };
  const cadena = (sig: () => Nodo | null, ops: string[]): Nodo | null => {
    let a = sig();
    while (a && ops.includes(ver())) {
      const op = toks[i++];
      const b = sig();
      if (!b) return null;
      a = { k: 'op', op, xs: [a, b] };
    }
    return a;
  };
  const suma = () => cadena(producto, ['+', '-']);
  const producto = () => cadena(factor, ['*', '/']);
  const factor = (): Nodo | null => {
    const t = ver();
    if (t === undefined) return null;
    if (t === '-') {
      i++;
      const x = factor();
      return x && { k: 'neg', x };
    }
    if (t === '(') {
      i++;
      const e = comparacion();
      return e && comer(')') ? e : null;
    }
    if (/^[\wÀ-ÿ]/.test(t)) {
      i++;
      if (ver() !== '(') return { k: 'hoja', v: t.toLowerCase() };
      i++;
      const xs: Nodo[] = [];
      if (ver() !== ')')
        for (;;) {
          const a = comparacion();
          if (!a) return null;
          xs.push(a);
          if (comer(',')) continue;
          break;
        }
      return comer(')') ? { k: 'f', f: t.toLowerCase(), xs } : null;
    }
    return null;
  };
  const r = comparacion();
  return r && i === toks.length ? r : null;
}

/** Operands of a chain of the same commutative operator, flattened. */
function aplanar(n: Nodo, op: string): Nodo[] {
  return n.k === 'op' && n.op === op ? n.xs.flatMap((x) => aplanar(x, op)) : [n];
}

function canon(n: Nodo): string {
  switch (n.k) {
    case 'hoja':
      return n.v;
    case 'neg':
      return `-(${canon(n.x)})`;
    case 'f':
      return `${n.f}(${n.xs.map(canon).join(',')})`;
    case 'op': {
      if (n.op === '+' || n.op === '*') return `${n.op}[${aplanar(n, n.op).map(canon).sort().join(',')}]`;
      if (n.op === '=' || n.op === '!=') return `${n.op}[${n.xs.map(canon).sort().join(',')}]`;
      return `${n.op}(${n.xs.map(canon).join(',')})`;
    }
  }
}

const BOOLEANOS: Record<string, string> = { verdadero: 'V', cierto: 'V', true: 'V', v: 'V', si: 'V', sí: 'V', falso: 'F', false: 'F', f: 'F', no: 'F' };

/** The canonical form of an answer, so that «b*d» and «d * b» compare equal. */
export function canonica(s: string): string {
  const t = s.trim().replace(/\.$/, '').replace(/[·×]/g, '*').replace(/√/g, 'raiz').replace(/\bsqrt\b/gi, 'raiz');
  const b = BOOLEANOS[t.toLowerCase()];
  if (b) return b;
  const n = parsear(t);
  return n ? canon(n) : t.toLowerCase().replace(/\s+/g, '');
}

export function respuestaValida(ec: EcuacionEspec, s: string): boolean {
  if (!s.trim()) return false;
  // an error condition: the reason may be worded in any way
  if (ec.der[0].startsWith('error')) return /^\s*error\b/i.test(s);
  const c = canonica(s);
  return ec.der.some((d) => canonica(d) === c);
}

/** The whole specification, in the format of the slides. */
export function especificacionCompleta(ej: EjEspec): { informal: string; formal: string } {
  const cab = `TAD ${ej.tad} (${ej.valores})`;
  const informal = [cab, ...ej.operaciones.flatMap((o) => [`${o.nombre}(${o.args.join(', ')})`, `        ${o.descripcion}`])].join('\n');
  const formal = [
    cab,
    'Sintaxis',
    ...ej.operaciones.map((o) => `        ${textoFirma(o)}`),
    `Semántica  Para todo ${ej.variables}`,
    ...ej.ecuaciones.map((e) => `        ${e.izq} -> ${e.antes ? e.antes + ' ' : ''}${e.der[0]}`),
  ].join('\n');
  return { informal, formal };
}
