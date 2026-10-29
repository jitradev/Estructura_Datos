// Analizador de un C reducido: el que hace falta para listas, pilas y colas.
// Tipos: int, void y los structs del contexto, con punteros. Sentencias: declaraciones,
// expresiones, if/else, while, do-while, for, bloques, return, break y continue.
// Expresiones con el operador ternario. Funciones con parámetros.

import { Tipo } from '../memoria/modelo';

export class ErrorSintaxis extends Error {
  constructor(
    public linea: number,
    mensaje: string,
  ) {
    super(mensaje);
  }
}

// ------------------------------------------------------------------ léxico

type TipoTok = 'id' | 'num' | 'op' | 'fin';
export interface Token {
  t: TipoTok;
  v: string;
  linea: number;
  ini: number;
  fin: number;
}

const OPS = ['->', '++', '--', '==', '!=', '<=', '>=', '&&', '||', '+=', '-=', '*=', '/=', '?', ':', '(', ')', '{', '}', '[', ']', ';', ',', '=', '<', '>', '+', '-', '*', '/', '%', '!', '&', '.'];

export function lexico(src: string): Token[] {
  const toks: Token[] = [];
  let i = 0;
  let linea = 1;
  while (i < src.length) {
    const c = src[i];
    if (c === '\n') {
      linea++;
      i++;
      continue;
    }
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (src.startsWith('//', i)) {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    if (src.startsWith('/*', i)) {
      const f = src.indexOf('*/', i + 2);
      const hasta = f < 0 ? src.length : f + 2;
      for (let j = i; j < hasta; j++) if (src[j] === '\n') linea++;
      i = hasta;
      continue;
    }
    if (c === '#') {
      // #include y #define se ignoran: los tipos y MAX vienen del contexto
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
      toks.push({ t: 'id', v: src.slice(i, j), linea, ini: i, fin: j });
      i = j;
      continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9]/.test(src[j])) j++;
      toks.push({ t: 'num', v: src.slice(i, j), linea, ini: i, fin: j });
      i = j;
      continue;
    }
    if (c === "'" && src[i + 2] === "'") {
      toks.push({ t: 'num', v: String(src.charCodeAt(i + 1)), linea, ini: i, fin: i + 3 });
      i += 3;
      continue;
    }
    const op = OPS.find((o) => src.startsWith(o, i));
    if (!op) throw new ErrorSintaxis(linea, `No entiendo el carácter «${c}».`);
    toks.push({ t: 'op', v: op, linea, ini: i, fin: i + op.length });
    i += op.length;
  }
  toks.push({ t: 'fin', v: '', linea, ini: src.length, fin: src.length });
  return toks;
}

// ------------------------------------------------------------------ árbol

interface Pos {
  ini: number;
  fin: number;
  linea: number;
}

export type Expr = Pos &
  (
    | { k: 'num'; v: number }
    | { k: 'null' }
    | { k: 'id'; n: string }
    | { k: 'bin'; op: string; a: Expr; b: Expr }
    | { k: 'un'; op: '!' | '-' | '*' | '&' | '++' | '--'; a: Expr }
    | { k: 'post'; op: '++' | '--'; a: Expr }
    | { k: 'asig'; op: '=' | '+=' | '-=' | '*=' | '/='; a: Expr; b: Expr }
    | { k: 'cond'; c: Expr; a: Expr; b: Expr }
    | { k: 'campo'; a: Expr; f: string; flecha: boolean }
    | { k: 'idx'; a: Expr; i: Expr }
    | { k: 'llamada'; f: string; args: Expr[] }
    | { k: 'sizeof'; t: Tipo }
    | { k: 'cast'; t: Tipo; a: Expr }
  );

export type Sent =
  | { k: 'decl'; tipo: Tipo; vars: { nombre: string; ptr: number; init?: Expr }[]; linea: number }
  | { k: 'expr'; e: Expr; linea: number }
  | { k: 'while'; c: Expr; s: Sent; linea: number }
  | { k: 'dowhile'; c: Expr; s: Sent; linea: number; lineaC: number }
  | { k: 'if'; c: Expr; s: Sent; sino?: Sent; linea: number }
  | { k: 'for'; ini?: Sent; c?: Expr; paso?: Expr; s: Sent; linea: number }
  | { k: 'bloque'; ss: Sent[]; linea: number }
  | { k: 'return'; e?: Expr; linea: number }
  | { k: 'break'; linea: number }
  | { k: 'continue'; linea: number }
  | { k: 'vacia'; linea: number };

export interface Funcion {
  nombre: string;
  ret: Tipo;
  params: { nombre: string; tipo: Tipo }[];
  cuerpo: Sent;
  linea: number;
}

export interface Programa {
  funciones: Funcion[];
  sentencias: Sent[];
}

// ------------------------------------------------------------------ sintaxis

export function analizar(src: string, tipos: string[]): Programa {
  const toks = lexico(src);
  let p = 0;
  const TIPOS = new Set(['int', 'void', 'char', ...tipos]);
  const ver = (o = 0) => toks[Math.min(p + o, toks.length - 1)];
  const es = (v: string, o = 0) => ver(o).v === v && ver(o).t !== 'num';
  const comer = (v: string, que?: string) => {
    const t = ver();
    if (t.v !== v || t.t === 'num') throw new ErrorSintaxis(t.linea, `Falta «${v}»${que ? ' ' + que : ''}${t.t === 'fin' ? ' al final' : `, antes de «${t.v}»`}.`);
    p++;
    return t;
  };
  const esTipo = (o = 0) => {
    let t = ver(o);
    if (t.v === 'static') t = ver(++o);
    if (t.v === 'const' || t.v === 'struct') t = ver(o + 1);
    return t.t === 'id' && TIPOS.has(t.v);
  };

  function tipo(): Tipo {
    while (es('static') || es('const') || es('struct')) p++;
    const t = ver();
    if (t.t !== 'id' || !TIPOS.has(t.v)) throw new ErrorSintaxis(t.linea, `«${t.v}» no es un tipo conocido.`);
    p++;
    let ptr = 0;
    while (es('*')) {
      p++;
      ptr++;
    }
    while (es('const')) p++;
    return { base: t.v, ptr };
  }

  function programa(): Programa {
    const funciones: Funcion[] = [];
    const sentencias: Sent[] = [];
    while (ver().t !== 'fin') {
      // ¿definición de función? tipo nombre (
      if (esTipo()) {
        const guarda = p;
        const t = tipo();
        const n = ver();
        if (n.t === 'id' && es('(', 1)) {
          p += 2;
          const params: Funcion['params'] = [];
          if (!es(')')) {
            if (es('void') && es(')', 1)) p++;
            else
              do {
                const pt = tipo();
                const pn = ver();
                if (pn.t !== 'id') throw new ErrorSintaxis(pn.linea, 'Falta el nombre del parámetro.');
                p++;
                params.push({ nombre: pn.v, tipo: pt });
              } while (es(',') && ++p);
          }
          comer(')');
          const cuerpo = bloque();
          funciones.push({ nombre: n.v, ret: t, params, cuerpo, linea: n.linea });
          continue;
        }
        p = guarda;
      }
      sentencias.push(sentencia());
    }
    return { funciones, sentencias };
  }

  function bloque(): Sent {
    const l = comer('{').linea;
    const ss: Sent[] = [];
    while (!es('}')) {
      if (ver().t === 'fin') throw new ErrorSintaxis(ver().linea, 'Falta cerrar una llave «}».');
      ss.push(sentencia());
    }
    comer('}');
    return { k: 'bloque', ss, linea: l };
  }

  function declaracion(): Sent {
    const linea = ver().linea;
    const t = tipo();
    const vars: { nombre: string; ptr: number; init?: Expr }[] = [];
    let ptr = t.ptr;
    for (;;) {
      const n = ver();
      if (n.t !== 'id') throw new ErrorSintaxis(n.linea, `Falta el nombre de la variable.`);
      p++;
      if (es('[')) throw new ErrorSintaxis(n.linea, 'Aquí no se pueden declarar arrays: usa los que ya tiene la estructura.');
      let init: Expr | undefined;
      if (es('=')) {
        p++;
        init = expresion();
      }
      vars.push({ nombre: n.v, ptr, init });
      if (!es(',')) break;
      p++;
      ptr = 0;
      while (es('*')) {
        p++;
        ptr++;
      }
    }
    comer(';', 'al final de la declaración');
    return { k: 'decl', tipo: { base: t.base, ptr: 0 }, vars, linea };
  }

  function sentencia(): Sent {
    const t = ver();
    if (es(';')) {
      p++;
      return { k: 'vacia', linea: t.linea };
    }
    if (es('{')) return bloque();
    if (es('while')) {
      p++;
      comer('(');
      const c = expresion();
      comer(')', 'tras la condición del while');
      return { k: 'while', c, s: sentencia(), linea: t.linea };
    }
    if (es('do')) {
      p++;
      const cuerpo = sentencia();
      const w = comer('while', 'después del cuerpo del do');
      comer('(');
      const c = expresion();
      comer(')', 'tras la condición del while');
      comer(';', 'después del do-while');
      return { k: 'dowhile', c, s: cuerpo, linea: t.linea, lineaC: w.linea };
    }
    if (es('if')) {
      p++;
      comer('(');
      const c = expresion();
      comer(')', 'tras la condición del if');
      const s = sentencia();
      let sino: Sent | undefined;
      if (es('else')) {
        p++;
        sino = sentencia();
      }
      return { k: 'if', c, s, sino, linea: t.linea };
    }
    if (es('for')) {
      p++;
      comer('(');
      let ini: Sent | undefined;
      if (esTipo()) ini = declaracion();
      else if (es(';')) p++;
      else {
        const e = expresion();
        comer(';');
        ini = { k: 'expr', e, linea: t.linea };
      }
      const c = es(';') ? undefined : expresion();
      comer(';');
      const paso = es(')') ? undefined : expresion();
      comer(')');
      return { k: 'for', ini, c, paso, s: sentencia(), linea: t.linea };
    }
    if (es('return')) {
      p++;
      const e = es(';') ? undefined : expresion();
      comer(';', 'tras el return');
      return { k: 'return', e, linea: t.linea };
    }
    if (es('break')) {
      p++;
      comer(';');
      return { k: 'break', linea: t.linea };
    }
    if (es('continue')) {
      p++;
      comer(';');
      return { k: 'continue', linea: t.linea };
    }
    if (esTipo()) return declaracion();
    const e = expresion();
    comer(';', 'al final de la sentencia');
    return { k: 'expr', e, linea: t.linea };
  }

  // Precedencia de C, de menor a mayor.
  function expresion(): Expr {
    return asignacion();
  }

  function asignacion(): Expr {
    const a = condicional();
    const t = ver();
    if (t.t === 'op' && (t.v === '=' || t.v === '+=' || t.v === '-=' || t.v === '*=' || t.v === '/=')) {
      p++;
      const b = asignacion();
      return { k: 'asig', op: t.v, a, b, ini: a.ini, fin: b.fin, linea: a.linea };
    }
    return a;
  }

  // c ? a : b
  function condicional(): Expr {
    const c = binaria(0);
    if (!es('?')) return c;
    p++;
    const a = expresion();
    comer(':', 'en el operador ? :');
    const b = condicional();
    return { k: 'cond', c, a, b, ini: c.ini, fin: b.fin, linea: c.linea };
  }

  const NIVELES = [['||'], ['&&'], ['==', '!='], ['<', '<=', '>', '>='], ['+', '-'], ['*', '/', '%']];

  function binaria(n: number): Expr {
    if (n === NIVELES.length) return unaria();
    let a = binaria(n + 1);
    while (ver().t === 'op' && NIVELES[n].includes(ver().v)) {
      const op = ver().v;
      p++;
      const b = binaria(n + 1);
      a = { k: 'bin', op, a, b, ini: a.ini, fin: b.fin, linea: a.linea };
    }
    return a;
  }

  function unaria(): Expr {
    const t = ver();
    if (t.t === 'op' && ['!', '-', '*', '&', '++', '--'].includes(t.v)) {
      p++;
      const a = unaria();
      return { k: 'un', op: t.v as '!', a, ini: t.ini, fin: a.fin, linea: t.linea };
    }
    if (es('sizeof')) {
      p++;
      comer('(');
      const ty = tipo();
      const f = comer(')');
      return { k: 'sizeof', t: ty, ini: t.ini, fin: f.fin, linea: t.linea };
    }
    // cast: (Nodo *) expr
    if (es('(') && esTipo(1)) {
      p++;
      const ty = tipo();
      comer(')');
      const a = unaria();
      return { k: 'cast', t: ty, a, ini: t.ini, fin: a.fin, linea: t.linea };
    }
    return postfija();
  }

  function postfija(): Expr {
    let a = primaria();
    for (;;) {
      if (es('->') || es('.')) {
        const flecha = ver().v === '->';
        p++;
        const f = ver();
        if (f.t !== 'id') throw new ErrorSintaxis(f.linea, `Falta el nombre del campo después de «${flecha ? '->' : '.'}».`);
        p++;
        a = { k: 'campo', a, f: f.v, flecha, ini: a.ini, fin: f.fin, linea: a.linea };
      } else if (es('[')) {
        p++;
        const i = expresion();
        const f = comer(']');
        a = { k: 'idx', a, i, ini: a.ini, fin: f.fin, linea: a.linea };
      } else if (es('++') || es('--')) {
        const t = ver();
        p++;
        a = { k: 'post', op: t.v as '++', a, ini: a.ini, fin: t.fin, linea: a.linea };
      } else return a;
    }
  }

  function primaria(): Expr {
    const t = ver();
    if (t.t === 'num') {
      p++;
      return { k: 'num', v: Number(t.v), ini: t.ini, fin: t.fin, linea: t.linea };
    }
    if (t.t === 'id') {
      p++;
      if (t.v === 'NULL') return { k: 'null', ini: t.ini, fin: t.fin, linea: t.linea };
      if (es('(')) {
        p++;
        const args: Expr[] = [];
        if (!es(')'))
          do args.push(expresion());
          while (es(',') && ++p);
        const f = comer(')', `al final de la llamada a ${t.v}`);
        return { k: 'llamada', f: t.v, args, ini: t.ini, fin: f.fin, linea: t.linea };
      }
      return { k: 'id', n: t.v, ini: t.ini, fin: t.fin, linea: t.linea };
    }
    if (es('(')) {
      p++;
      const e = expresion();
      const f = comer(')');
      return { ...e, ini: t.ini, fin: f.fin };
    }
    if (t.t === 'fin') throw new ErrorSintaxis(t.linea, 'El código se acaba a mitad de una expresión.');
    throw new ErrorSintaxis(t.linea, `No esperaba «${t.v}» aquí.`);
  }

  return programa();
}
