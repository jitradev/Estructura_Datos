// The cost of a fragment as an equation: every simple statement costs 1, a loop is a sum
// over its variable and a call costs what its function costs. The sums are solved from the
// innermost out, keeping only the terms that grow fastest, so every line is «≈».
// Loops whose turns depend on the data (a list, a condition on an array...) are not solved.

import { analizar, ErrorSintaxis, Expr, Funcion, Sent } from '../interprete/parser';
import { ClaseCoste } from './tipos';

// ------------------------------------------------------------------ polynomials

/** base^p · (log base)^l · (log log base)^ll */
interface Fac {
  p: number;
  l: number;
  ll: number;
}
export interface Termino {
  c: number;
  f: Record<string, Fac>;
}
/** A sum of terms. */
export type Poli = Termino[];

class NoSe extends Error {}
const noSe = (motivo: string): never => {
  throw new NoSe(motivo);
};

const cte = (c: number): Poli => (Math.abs(c) < 1e-12 ? [] : [{ c, f: {} }]);
const variable = (b: string, fac: Partial<Fac> = {}): Poli => [{ c: 1, f: { [b]: { p: 1, l: 0, ll: 0, ...fac } } }];
const nulo = (x: Fac) => !x.p && !x.l && !x.ll;
const clave = (t: Termino) =>
  Object.keys(t.f)
    .sort()
    .map((b) => `${b}:${t.f[b].p},${t.f[b].l},${t.f[b].ll}`)
    .join('|');

function juntar(ts: Termino[]): Poli {
  const m = new Map<string, Termino>();
  for (const t of ts) {
    const f: Record<string, Fac> = {};
    for (const [b, x] of Object.entries(t.f)) if (!nulo(x)) f[b] = x;
    const u = { c: t.c, f };
    const k = clave(u);
    const v = m.get(k);
    if (v) v.c += u.c;
    else m.set(k, { ...u });
  }
  return [...m.values()].filter((t) => Math.abs(t.c) > 1e-9);
}

const sumar = (...ps: Poli[]): Poli => juntar(ps.flat());
const escalar = (p: Poli, k: number): Poli => juntar(p.map((t) => ({ c: t.c * k, f: t.f })));
const restar = (a: Poli, b: Poli) => sumar(a, escalar(b, -1));

function multiplicar(a: Poli, b: Poli): Poli {
  const out: Termino[] = [];
  for (const x of a)
    for (const y of b) {
      const f: Record<string, Fac> = { ...x.f };
      for (const [k, v] of Object.entries(y.f)) {
        const w = f[k] ?? { p: 0, l: 0, ll: 0 };
        f[k] = { p: w.p + v.p, l: w.l + v.l, ll: w.ll + v.ll };
      }
      out.push({ c: x.c * y.c, f });
    }
  return juntar(out);
}

const esConstante = (p: Poli) => p.every((t) => !Object.keys(t.f).length);
const valor = (p: Poli) => p.reduce((s, t) => s + t.c, 0);
const contiene = (p: Poli, b: string) => p.some((t) => b in t.f);

/** a grows at least as fast as b (comparable only when b's bases are all in a). */
function domina(a: Termino, b: Termino): boolean {
  let estricto = false;
  for (const [k, y] of Object.entries(b.f)) {
    const x = a.f[k];
    if (!x) return false;
    const d = x.p - y.p || x.l - y.l || x.ll - y.ll;
    if (d < 0) return false;
    if (d > 0) estricto = true;
  }
  if (Object.keys(a.f).length > Object.keys(b.f).length) estricto = true;
  return estricto;
}

/** Keeps the terms that grow fastest. */
function principal(p: Poli): Poli {
  const ts = juntar(p);
  return ts.filter((t) => !ts.some((u) => u !== t && u.c > 0 && domina(u, t)));
}

/** p^e for an integer e, or for any e when p has a single term. */
function potencia(p: Poli, e: number): Poli {
  if (e === 0) return cte(1);
  const q = principal(p);
  if (q.length === 1 && q[0].c > 0) {
    const t = q[0];
    const f: Record<string, Fac> = {};
    for (const [k, v] of Object.entries(t.f)) {
      if (e !== Math.trunc(e) && (v.l || v.ll)) noSe('una raíz de un logaritmo');
      f[k] = { p: v.p * e, l: v.l * e, ll: v.ll * e };
    }
    return [{ c: Math.pow(t.c, e), f }];
  }
  if (e !== Math.trunc(e) || e < 0) return noSe('una raíz de una suma');
  let r = cte(1);
  for (let i = 0; i < e; i++) r = multiplicar(r, p);
  return r;
}

/** log of p, in no particular base: only its fastest term counts. */
function logaritmo(p: Poli, doble = false): Poli {
  const q = principal(p);
  if (esConstante(q)) {
    const v = Math.max(2, valor(q));
    return cte(doble ? Math.log2(Math.max(2, Math.log2(v))) : Math.log2(v));
  }
  if (q.length !== 1) return noSe('el logaritmo de una resta');
  const bases = Object.entries(q[0].f).filter(([, v]) => v.p > 0);
  if (!bases.length) return doble ? noSe('un logaritmo de otro') : sumar(...Object.keys(q[0].f).map((b) => variable(b, { p: 0, ll: 1 })));
  return sumar(...bases.map(([b, v]) => (doble ? variable(b, { p: 0, ll: 1 }) : escalar(variable(b, { p: 0, l: 1 }), v.p))));
}

/** Replaces base b by the polynomial a (a call: the parameter by its argument). */
function sustituir(p: Poli, b: string, a: Poli): Poli {
  return sumar(
    ...p.map((t) => {
      const x = t.f[b];
      if (!x) return [t];
      const resto: Termino = { c: t.c, f: { ...t.f } };
      delete resto.f[b];
      let r: Poli = [resto];
      if (x.p) r = multiplicar(r, potencia(a, x.p));
      if (x.l) r = multiplicar(r, potencia(logaritmo(a), x.l));
      if (x.ll) r = multiplicar(r, potencia(logaritmo(a, true), x.ll));
      return r;
    }),
  );
}

// ------------------------------------------------------------------ how it is written

function fraccion(c: number): [number, number] | null {
  for (let d = 1; d <= 12; d++) if (Math.abs(c * d - Math.round(c * d)) < 1e-6) return [Math.round(c * d), d];
  return null;
}

const SUP: Record<string, string> = { 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶' };

function verFactor(b: string, x: Fac): string {
  const partes: string[] = [];
  const entera = Math.trunc(x.p);
  const media = Math.abs(x.p - entera - 0.5) < 1e-9;
  if (x.p === entera || media) {
    if (entera === 1) partes.push(b);
    else if (entera > 1) partes.push(b + (SUP[entera] ?? `^${entera}`));
    if (media) partes.push(`√${b}`);
  } else if (x.p) partes.push(`${b}^${String(Number(x.p.toFixed(2))).replace('.', ',')}`);
  if (x.l) partes.push(`log${x.l > 1 ? (SUP[x.l] ?? `^${x.l}`) : ''} ${b}`);
  if (x.ll) partes.push(`log log ${b}`);
  return partes.join(' ');
}

/** Orders terms from fastest to slowest, n first. */
function peso(t: Termino): number {
  return Object.values(t.f).reduce((s, x) => s + x.p * 100 + x.l * 10 + x.ll, 0);
}

export function verPoli(p: Poli): string {
  const ts = juntar(p).sort((a, b) => peso(b) - peso(a));
  if (!ts.length) return '0';
  return ts
    .map((t, i) => {
      const bases = Object.keys(t.f).sort((a, b) => (a === 'n' ? -1 : b === 'n' ? 1 : a.localeCompare(b)));
      const cuerpo = bases.map((b) => verFactor(b, t.f[b])).join('·');
      const signo = t.c < 0 ? (i ? ' − ' : '−') : i ? ' + ' : '';
      const c = Math.abs(t.c);
      const fr = fraccion(c);
      let texto: string;
      if (!cuerpo) texto = fr ? (fr[1] === 1 ? String(fr[0]) : `${fr[0]}/${fr[1]}`) : c.toFixed(2).replace('.', ',');
      else if (!fr) texto = `${c.toFixed(2).replace('.', ',')}·${cuerpo}`;
      else {
        const [a, d] = fr;
        const delante = a === 1 ? '' : String(a);
        const pegado = delante && /^[a-z]/.test(cuerpo) && !cuerpo.startsWith('log') ? `${delante}${cuerpo}` : delante ? `${delante}·${cuerpo}` : cuerpo;
        texto = d === 1 ? pegado : `${pegado}/${d}`;
      }
      return signo + texto;
    })
    .join('');
}

/** The class of a polynomial in n only, if it is one of the course's. */
export function claseDe(p: Poli): { clase: ClaseCoste | null; texto: string } {
  const ts = principal(p);
  const t = ts.length === 1 ? ts[0] : ts.length === 0 ? { c: 1, f: {} } : null;
  if (!t || Object.keys(t.f).some((b) => b !== 'n')) return { clase: null, texto: `O(${verPoli(ts)})` };
  const x = t.f.n ?? { p: 0, l: 0, ll: 0 };
  const k = `${x.p},${x.l},${x.ll}`;
  const CLASES: Record<string, ClaseCoste> = {
    '0,0,0': 'O(1)',
    '0,0,1': 'O(log log n)',
    '0,1,0': 'O(log n)',
    '0.5,0,0': 'O(√n)',
    '1,0,0': 'O(n)',
    '1,1,0': 'O(n log n)',
    '2,0,0': 'O(n²)',
    '3,0,0': 'O(n³)',
  };
  return { clase: CLASES[k] ?? null, texto: CLASES[k] ?? `O(${verFactor('n', x)})` };
}

// ------------------------------------------------------------------ the equation

/** A sum still to solve, a call, a sequence of statements or the branches of an if. */
export type Ex =
  | { k: 'p'; p: Poli }
  | { k: 'mas'; xs: Ex[] }
  | { k: 'max'; xs: Ex[] }
  | { k: 'llamada'; texto: string; p: Poli }
  | { k: 'sigma'; abajo: string; arriba: string; cuerpo: Ex; linea: number; resolver: (cuerpo: Poli) => { p: Poli; nota: string } };

export interface Ecuacion {
  /** «T(n)» or «suma(m)». */
  nombre: string;
  /** Every line is the previous one with the innermost sums solved. */
  lineas: Ex[];
  /** What was solved to go from each line to the next. */
  notas: string[][];
  resultado: Poli;
}

export type Analisis =
  | { ok: true; ecuaciones: Ecuacion[]; clase: ClaseCoste | null; texto: string; avisos: string[] }
  | { ok: false; motivo: string; linea?: number };

const resuelta = (e: Ex) => e.k === 'p';

/** One step: sums whose body was already solved, and calls; sequences and ifs collapse at once. */
function paso(e: Ex, notas: string[]): Ex {
  switch (e.k) {
    case 'p':
      return e;
    case 'llamada':
      notas.push(`\`${e.texto}\` cuesta ${verPoli(e.p)}.`);
      return { k: 'p', p: e.p };
    case 'sigma': {
      if (e.cuerpo.k === 'p') {
        const r = e.resolver(e.cuerpo.p);
        notas.push(r.nota);
        return { k: 'p', p: r.p };
      }
      return { ...e, cuerpo: paso(e.cuerpo, notas) };
    }
    case 'mas':
    case 'max': {
      const xs = e.xs.map((x) => paso(x, notas));
      return plegar({ k: e.k, xs });
    }
  }
}

/** Joins what is already solved inside a sequence or an if. */
function plegar(e: Ex): Ex {
  if (e.k !== 'mas' && e.k !== 'max') return e;
  const hechas = e.xs.filter(resuelta).map((x) => (x as { p: Poli }).p);
  const resto = e.xs.filter((x) => !resuelta(x));
  if (!hechas.length) return e.xs.length === 1 ? e.xs[0] : e;
  let p: Poli;
  if (e.k === 'mas') p = sumar(...hechas);
  else {
    // the dearest branch; if they cannot be compared, both (an upper bound)
    const cubre = (x: Poli, y: Poli) => y.every((t) => x.some((u) => (clave(u) === clave(t) ? u.c >= t.c : domina(u, t))));
    p = hechas.map(principal).reduce((a, b) => (cubre(a, b) ? a : cubre(b, a) ? b : sumar(a, b)));
  }
  if (!resto.length) return { k: 'p', p };
  return { k: e.k, xs: [{ k: 'p', p }, ...resto] };
}

// ------------------------------------------------------------------ reading the code

type Entorno = Map<string, Poli>;

interface Bucle {
  v: string;
  tipo: 'suma' | 'resta' | 'mult' | 'div' | 'cuad';
  k: number; // what is added or multiplied by
  desde: Poli;
  hasta: Poli; // the bound, already as a value of v (√ for v*v < B)
  incluye: boolean; // <= or >=
  raiz: boolean;
  comoMucho: boolean; // && with something else: it may stop earlier
}

function poliDe(e: Expr, env: Entorno): Poli | null {
  switch (e.k) {
    case 'num':
      return cte(e.v);
    case 'id':
      return env.get(e.n) ?? null;
    case 'un':
      if (e.op === '-') {
        const a = poliDe(e.a, env);
        return a && escalar(a, -1);
      }
      return null;
    case 'bin': {
      const a = poliDe(e.a, env);
      const b = poliDe(e.b, env);
      if (!a || !b) return null;
      if (e.op === '+') return sumar(a, b);
      if (e.op === '-') return restar(a, b);
      if (e.op === '*') return multiplicar(a, b);
      if (e.op === '/' && esConstante(b) && valor(b) > 0) return escalar(a, 1 / valor(b));
      return null;
    }
    default:
      return null;
  }
}

const usa = (e: Expr | undefined, v: string): boolean => {
  if (!e) return false;
  if (e.k === 'id') return e.n === v;
  return Object.values(e).some((x) => (Array.isArray(x) ? x.some((y) => y && typeof y === 'object' && 'k' in y && usa(y as Expr, v)) : x && typeof x === 'object' && 'k' in x && usa(x as Expr, v)));
};

/** Variables a statement assigns to (or ++ / --). */
function asignadas(s: Sent | undefined, out = new Set<string>()): Set<string> {
  if (!s) return out;
  const enExpr = (e: Expr | undefined) => {
    if (!e) return;
    if ((e.k === 'asig' || e.k === 'post' || (e.k === 'un' && (e.op === '++' || e.op === '--'))) && e.a.k === 'id') out.add(e.a.n);
    for (const x of Object.values(e))
      if (Array.isArray(x)) x.forEach((y) => y && typeof y === 'object' && 'k' in y && enExpr(y as Expr));
      else if (x && typeof x === 'object' && 'k' in x) enExpr(x as Expr);
  };
  switch (s.k) {
    case 'decl':
      s.vars.forEach((v) => {
        out.add(v.nombre);
        enExpr(v.init);
      });
      break;
    case 'expr':
      enExpr(s.e);
      break;
    case 'while':
    case 'dowhile':
      enExpr(s.c);
      asignadas(s.s, out);
      break;
    case 'if':
      enExpr(s.c);
      asignadas(s.s, out);
      asignadas(s.sino, out);
      break;
    case 'for':
      asignadas(s.ini, out);
      enExpr(s.c);
      enExpr(s.paso);
      asignadas(s.s, out);
      break;
    case 'bloque':
      s.ss.forEach((x) => asignadas(x, out));
      break;
    case 'return':
      enExpr(s.e);
      break;
  }
  return out;
}

/** How an update moves v: i++, i -= 2, i = i * 2, i /= 2, i = i * i... */
function actualizacion(e: Expr, env: Entorno): { v: string; tipo: Bucle['tipo']; k: number } | null {
  if ((e.k === 'post' || e.k === 'un') && (e.op === '++' || e.op === '--') && e.a.k === 'id') return { v: e.a.n, tipo: e.op === '++' ? 'suma' : 'resta', k: 1 };
  if (e.k !== 'asig' || e.a.k !== 'id') return null;
  const v = e.a.n;
  const sinV = new Map(env);
  sinV.delete(v);
  const num = (x: Expr) => {
    const p = poliDe(x, sinV);
    return p && esConstante(p) ? valor(p) : null;
  };
  let op: string = e.op;
  let k: number | null = null;
  if (e.op === '=') {
    const b = e.b;
    if (b.k !== 'bin') return null;
    const esV = (x: Expr) => x.k === 'id' && x.n === v;
    if (b.op === '*' && esV(b.a) && esV(b.b)) return { v, tipo: 'cuad', k: 2 };
    if (b.op === '+' && esV(b.a) && esV(b.b)) return { v, tipo: 'mult', k: 2 };
    if (esV(b.a)) {
      op = b.op + '=';
      k = num(b.b);
    } else if (esV(b.b) && (b.op === '+' || b.op === '*')) {
      op = b.op + '=';
      k = num(b.a);
    } else return null;
  } else k = num(e.b);
  if (k === null || k <= 0) return null;
  if (op === '+=') return { v, tipo: 'suma', k };
  if (op === '-=') return { v, tipo: 'resta', k };
  if (op === '*=' && k >= 2) return { v, tipo: 'mult', k };
  if (op === '/=' && k >= 2) return { v, tipo: 'div', k };
  return null;
}

/** The condition as a bound for v; && with something else is an upper bound. */
function limite(c: Expr, v: string, sube: boolean, env: Entorno): { hasta: Poli; incluye: boolean; raiz: boolean; comoMucho: boolean } | null {
  if (c.k === 'bin' && c.op === '&&') {
    const a = usa(c.a, v) ? limite(c.a, v, sube, env) : null;
    const r = a ?? (usa(c.b, v) ? limite(c.b, v, sube, env) : null);
    return r && { ...r, comoMucho: true };
  }
  if (c.k !== 'bin' || !['<', '<=', '>', '>=', '!='].includes(c.op)) return null;
  const lado = (x: Expr) => (x.k === 'id' && x.n === v ? 'v' : x.k === 'bin' && x.op === '*' && x.a.k === 'id' && x.a.n === v && x.b.k === 'id' && x.b.n === v ? 'vv' : null);
  let op = c.op;
  let l = lado(c.a);
  let otro = c.b;
  if (!l) {
    l = lado(c.b);
    otro = c.a;
    op = ({ '<': '>', '<=': '>=', '>': '<', '>=': '<=', '!=': '!=' } as Record<string, string>)[op];
  }
  if (!l || usa(otro, v)) return null;
  const b = poliDe(otro, env);
  if (!b) return null;
  if (sube ? !['<', '<=', '!='].includes(op) : !['>', '>=', '!='].includes(op)) return null;
  return { hasta: l === 'vv' ? potencia(b, 0.5) : b, incluye: op.length === 2 && op !== '!=', raiz: l === 'vv', comoMucho: false };
}

const TEXTO_TIPO = (b: Bucle) =>
  ({
    suma: b.k === 1 ? 'de uno en uno' : `sumando ${b.k}`,
    resta: b.k === 1 ? 'bajando de uno en uno' : `restando ${b.k}`,
    mult: `multiplicando por ${b.k}`,
    div: `dividiendo entre ${b.k}`,
    cuad: 'elevando al cuadrado',
  })[b.tipo];

/** Sum over the values of v of a body that may depend on v. */
function sumarBucle(b: Bucle, cuerpo: Poli): { vueltas: Poli; total: Poli } {
  const sube = b.tipo === 'suma' || b.tipo === 'mult' || b.tipo === 'cuad';
  const alto = sube ? b.hasta : b.desde;
  const bajo = sube ? b.desde : b.hasta;
  let vueltas: Poli;
  if (b.tipo === 'suma' || b.tipo === 'resta') vueltas = escalar(restar(alto, bajo), 1 / b.k);
  else if (b.tipo === 'cuad') vueltas = logaritmo(alto, true);
  else vueltas = esConstante(bajo) ? logaritmo(alto) : restar(logaritmo(alto), logaritmo(bajo));
  if (esConstante(vueltas) && valor(vueltas) < 0) noSe('el bucle no da ninguna vuelta');

  const total = sumar(
    ...cuerpo.map((t): Poli => {
      const x = t.f[b.v];
      if (!x) return multiplicar([t], vueltas);
      const resto: Termino = { c: t.c, f: { ...t.f } };
      delete resto.f[b.v];
      if (x.ll) noSe(`un log log de \`${b.v}\` dentro de la suma`);
      if (b.tipo === 'suma' || b.tipo === 'resta') {
        // Σ v^p log^l v ≈ (alto^(p+1) log^l alto − bajo^(p+1) log^l bajo) / ((p+1)·k)
        const prim = (y: Poli) => (x.l ? multiplicar(potencia(y, x.p + 1), potencia(logaritmo(y), x.l)) : potencia(y, x.p + 1));
        return multiplicar([resto], escalar(restar(prim(alto), esConstante(bajo) && !esConstante(alto) ? [] : prim(bajo)), 1 / ((x.p + 1) * b.k)));
      }
      if (x.p > 0) {
        // geometric: the last term rules, Σ ≈ alto^p · k^p/(k^p − 1)
        const k = b.tipo === 'cuad' ? 1 : Math.pow(b.k, x.p) / (Math.pow(b.k, x.p) - 1);
        const ultimo = x.l ? multiplicar(potencia(alto, x.p), potencia(logaritmo(alto), x.l)) : potencia(alto, x.p);
        return multiplicar([resto], escalar(ultimo, k));
      }
      // Σ (log v)^l over v = 1, 2, 4...: the exponents 0..log alto, ≈ (log alto)^(l+1)/(l+1)
      return multiplicar([resto], escalar(potencia(logaritmo(alto), x.l + 1), 1 / (x.l + 1)));
    }),
  );
  return { vueltas, total: principal(total) };
}

export function analizarCoste(src: string): Analisis {
  let prog;
  try {
    prog = analizar(src, []);
  } catch (e) {
    if (e instanceof ErrorSintaxis) return { ok: false, motivo: `Línea ${e.linea}: ${e.message}`, linea: e.linea };
    throw e;
  }
  const lineas = src.split('\n');
  const verLinea = (l: number) => (lineas[l - 1] ?? '').trim().replace(/\s*\{$/, '');
  const funciones = new Map(prog.funciones.map((f) => [f.nombre, f]));
  const ecuaciones: Ecuacion[] = [];
  const costeDe = new Map<string, Poli>();
  const avisos = new Set<string>();
  const enCurso: string[] = [];
  let lineaActual = 0;

  /** Cost of a function with its parameters as bases. */
  const costeFuncion = (f: Funcion): Poli => {
    const hecho = costeDe.get(f.nombre);
    if (hecho) return hecho;
    if (enCurso.includes(f.nombre)) noSe(`\`${f.nombre}\` es recursiva: su coste sale de una ecuación de recurrencia, y esa no la resuelvo aquí`);
    enCurso.push(f.nombre);
    const env: Entorno = new Map(f.params.map((p) => [p.nombre, variable(p.nombre)]));
    const ec = resolver(`${f.nombre}(${f.params.map((p) => p.nombre).join(', ')})`, sentencia(f.cuerpo, env));
    enCurso.pop();
    costeDe.set(f.nombre, ec.resultado);
    ecuaciones.push(ec);
    return ec.resultado;
  };

  /** Calls to the code's own functions inside an expression. */
  const llamadas = (e: Expr | undefined, env: Entorno, out: Ex[] = []): Ex[] => {
    if (!e) return out;
    if (e.k === 'llamada') {
      e.args.forEach((a) => llamadas(a, env, out));
      const f = funciones.get(e.f);
      if (f) {
        let p = costeFuncion(f);
        f.params.forEach((par, i) => {
          if (!contiene(p, par.nombre)) return;
          const a = e.args[i] && poliDe(e.args[i], env);
          if (!a) noSe(`el coste de \`${e.f}\` depende de \`${par.nombre}\`, y no sé cuánto vale lo que se le pasa`);
          p = sustituir(p, par.nombre, a!);
        });
        out.push({ k: 'llamada', texto: src.slice(e.ini, e.fin).replace(/\s+/g, ' '), p: principal(p) });
      } else if (!['printf', 'malloc', 'free'].includes(e.f)) noSe(`se llama a \`${e.f}\`, que no está en el código, y no sé cuánto cuesta`);
      return out;
    }
    for (const x of Object.values(e))
      if (Array.isArray(x)) x.forEach((y) => y && typeof y === 'object' && 'k' in y && llamadas(y as Expr, env, out));
      else if (x && typeof x === 'object' && 'k' in x) llamadas(x as Expr, env, out);
    return out;
  };

  const simple = (es: (Expr | undefined)[], env: Entorno): Ex => plegar({ k: 'mas', xs: [{ k: 'p', p: cte(1) }, ...es.flatMap((e) => llamadas(e, env))] });

  const recordar = (v: string, e: Expr | undefined, env: Entorno) => {
    const p = e && poliDe(e, env);
    if (p) env.set(v, p);
    else env.delete(v);
  };

  const secuencia = (ss: Sent[], env: Entorno): Ex => plegar({ k: 'mas', xs: ss.filter((s) => s.k !== 'vacia').map((s) => sentencia(s, env)) });

  function sentencia(s: Sent, env: Entorno): Ex {
    lineaActual = s.linea;
    switch (s.k) {
      case 'vacia':
        return { k: 'p', p: [] };
      case 'bloque':
        return secuencia(s.ss, env);
      case 'decl': {
        const ex = simple(
          s.vars.map((v) => v.init),
          env,
        );
        s.vars.forEach((v) => recordar(v.nombre, v.ptr ? undefined : v.init, env));
        return ex;
      }
      case 'expr': {
        const ex = simple([s.e], env);
        const e = s.e;
        if (e.k === 'asig' && e.a.k === 'id') recordar(e.a.n, e.op === '=' ? e.b : undefined, env);
        else asignadas(s).forEach((v) => env.delete(v));
        return ex;
      }
      case 'return':
        return simple([s.e], env);
      case 'break':
      case 'continue':
        avisos.add('Hay un `break` o un `continue`: se cuenta el caso en que el bucle da todas las vueltas, el peor.');
        return { k: 'p', p: cte(1) };
      case 'if': {
        const c = simple([s.c], env);
        const ramas = [sentencia(s.s, new Map(env)), s.sino ? sentencia(s.sino, new Map(env)) : ({ k: 'p', p: [] } as Ex)];
        asignadas(s).forEach((v) => env.delete(v));
        if (!s.sino && ramas[0].k === 'p') return plegar({ k: 'mas', xs: [c, ramas[0]] });
        avisos.add('Con un `if` se cuenta la rama más cara: es el peor caso.');
        return plegar({ k: 'mas', xs: [c, plegar({ k: 'max', xs: ramas })] });
      }
      case 'dowhile':
        return noSe(`no sé cuántas vueltas da el \`do-while\` de la línea ${s.linea}`);
      case 'for':
      case 'while':
        return bucle(s, env);
    }
  }

  function bucle(s: Extract<Sent, { k: 'for' | 'while' }>, env: Entorno): Ex {
    const linea = s.linea;
    const nombre = `el bucle de la línea ${linea} (\`${verLinea(linea)}\`)`;
    // the header of a for (start, condition, update) is not counted, only its calls
    let act: ReturnType<typeof actualizacion> = null;
    if (s.k === 'for') {
      if (s.ini) sentencia(s.ini, env);
      act = s.paso ? actualizacion(s.paso, env) : null;
      if (act && asignadas(s.s).has(act.v)) noSe(`en ${nombre} \`${act.v}\` también cambia dentro del cuerpo`);
    } else {
      // the update is a statement of the body that changes a variable of the condition
      const ss = s.s.k === 'bloque' ? s.s.ss : [s.s];
      const cands = ss.flatMap((x, i) => (x.k === 'expr' ? [{ i, a: actualizacion(x.e, env) }] : [])).filter((x) => x.a && usa(s.c, x.a.v));
      if (cands.length === 1) {
        act = cands[0].a;
        const resto = ss.filter((_, i) => i !== cands[0].i);
        if (resto.some((x) => asignadas(x).has(act!.v))) noSe(`en ${nombre} \`${act!.v}\` cambia en más de un sitio`);
      }
    }
    if (!act || !s.c) return noSe(`no sé cuántas vueltas da ${nombre}: no encuentro una variable que avance hacia un límite`);
    const desde = env.get(act.v);
    if (!desde) return noSe(`no sé desde qué valor empieza \`${act.v}\` en ${nombre}`);
    const sube = act.tipo === 'suma' || act.tipo === 'mult' || act.tipo === 'cuad';
    const lim = limite(s.c, act.v, sube, env);
    if (!lim) return noSe(`no sé cuántas vueltas da ${nombre}: la condición no es un límite de \`${act.v}\` que sepa leer`);
    if ((act.tipo === 'mult' || act.tipo === 'cuad') && esConstante(desde) && valor(desde) < (act.tipo === 'cuad' ? 2 : 1))
      noSe(`en ${nombre} \`${act.v}\` empieza en ${valor(desde)} y al multiplicarla no crece`);
    if (lim.comoMucho) avisos.add(`La condición de la línea ${linea} tiene un \`&&\`: se cuentan las vueltas que permite el límite de \`${act.v}\`, como mucho.`);

    const b: Bucle = { v: act.v, tipo: act.tipo, k: act.k, desde, hasta: lim.hasta, incluye: lim.incluye, raiz: lim.raiz, comoMucho: lim.comoMucho };

    // inside, v is itself, and what the body changes is unknown
    const dentro: Entorno = new Map(env);
    asignadas(s.s).forEach((v) => dentro.delete(v));
    dentro.set(b.v, variable(b.v));
    const cuerpo = plegar({ k: 'mas', xs: [...llamadas(s.c, dentro), sentencia(s.s, dentro)] });
    asignadas(s).forEach((v) => env.delete(v));

    // the sum's limits as they are written
    const v = b.v;
    let abajo: string;
    let arriba: string;
    if (b.tipo === 'suma') {
      abajo = `${v}=${verPoli(b.desde)}` + (b.k === 1 ? '' : `, ${verPoli(sumar(b.desde, cte(b.k)))}, ${verPoli(sumar(b.desde, cte(2 * b.k)))}…`);
      arriba = b.raiz ? `√${verPoli(potencia(b.hasta, 2))}` : verPoli(b.incluye ? b.hasta : sumar(b.hasta, cte(-1)));
    } else if (b.tipo === 'resta') {
      abajo = `${v}=${verPoli(b.incluye ? b.hasta : sumar(b.hasta, cte(1)))}`;
      arriba = verPoli(b.desde);
    } else {
      const d = verPoli(b.desde);
      const serie =
        b.tipo === 'mult'
          ? esConstante(b.desde) && valor(b.desde) === 1
            ? [1, b.k, b.k * b.k].join(', ')
            : [d, `${b.k}${d}`, `${b.k * b.k}${d}`].join(', ')
          : b.tipo === 'div'
            ? [d, `${d}/${b.k}`, `${d}/${b.k * b.k}`].join(', ')
            : esConstante(b.desde)
              ? [valor(b.desde), valor(b.desde) ** 2, valor(b.desde) ** 4].join(', ')
              : [d, `${d}²`, `${d}⁴`].join(', ');
      abajo = `${v}=${serie}…`;
      arriba = b.tipo === 'div' ? verPoli(b.hasta) : `< ${verPoli(b.hasta)}`;
    }

    const resolverB = (c: Poli) => {
      const { vueltas, total } = sumarBucle(b, c);
      const cada = contiene(c, v) ? `y la vuelta de \`${v}\` cuesta ${verPoli(c)}` : `de coste ${verPoli(c)}`;
      const como = b.raiz ? `sube ${TEXTO_TIPO(b)} hasta que \`${v}\`² llega a ${verPoli(potencia(b.hasta, 2))}` : TEXTO_TIPO(b);
      const base = b.tipo === 'mult' || b.tipo === 'div' ? ` (logaritmo en base ${b.k})` : '';
      const nota = `Línea ${linea}, \`${verLinea(linea)}\`: \`${v}\` va ${como}, unas ${verPoli(principal(vueltas))} vueltas${base}, ${cada}. Total ≈ ${verPoli(total)}.`;
      return { p: total, nota };
    };
    return { k: 'sigma', abajo, arriba, cuerpo, linea, resolver: resolverB };
  }

  function resolver(nombre: string, e: Ex): Ecuacion {
    const ls: Ex[] = [e];
    const notas: string[][] = [];
    let actual = e;
    for (let i = 0; actual.k !== 'p' && i < 30; i++) {
      const ns: string[] = [];
      actual = paso(actual, ns);
      ls.push(actual);
      notas.push(ns);
    }
    const resultado = principal((actual as { p: Poli }).p);
    if (actual.k === 'p' && verPoli(actual.p) !== verPoli(resultado)) {
      ls.push({ k: 'p', p: resultado });
      notas.push(['Se queda lo que crece más deprisa.']);
    }
    return { nombre, lineas: ls, notas, resultado };
  }

  try {
    const env: Entorno = new Map([['n', variable('n')]]);
    const ec = resolver('T(n)', secuencia(prog.sentencias, env));
    if (ec.resultado.some((t) => Object.keys(t.f).some((b) => b !== 'n')))
      return { ok: false, motivo: `El resultado depende de algo que no es \`n\`: ${verPoli(ec.resultado)}.` };
    if (ec.resultado.some((t) => t.c < 0)) return { ok: false, motivo: 'Al restar los términos se anulan y la aproximación no sirve aquí.' };
    ecuaciones.push(ec);
    const { clase, texto } = claseDe(ec.resultado);
    return { ok: true, ecuaciones, clase, texto, avisos: [...avisos] };
  } catch (e) {
    if (e instanceof NoSe) return { ok: false, motivo: e.message.charAt(0).toUpperCase() + e.message.slice(1) + '.', linea: lineaActual };
    throw e;
  }
}
