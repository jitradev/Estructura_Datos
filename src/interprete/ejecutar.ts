// Intérprete paso a paso del C reducido. Ejecuta el código sobre una memoria inicial y
// guarda una copia de la memoria después de cada sentencia, que es lo que se anima.
// Los errores de memoria (NULL, nodo liberado, sin inicializar, doble free, fuera del
// array) paran la ejecución en su línea con un mensaje pensado para el alumno.

import {
  BASURA,
  clonar,
  Contexto,
  int,
  Memoria,
  NULO,
  nuevoObjeto,
  Objeto,
  Ref,
  structDe,
  Tipo,
  Valor,
} from '../memoria/modelo';
import { alcanzables } from '../memoria/comparar';
import { analizar, ErrorSintaxis, Expr, Funcion, Programa, Sent } from './parser';

export type TipoError = 'sintaxis' | 'nulo' | 'liberado' | 'basura' | 'free' | 'array' | 'bucle' | 'nombre' | 'tipo' | 'prohibido';

export interface ErrorEj {
  linea: number;
  mensaje: string;
  tipo: TipoError;
}

export interface Paso {
  linea: number; // 0 = estado inicial, -1 = vuelta a main
  mem: Memoria;
  nota?: string;
  error?: boolean;
}

export interface Resultado {
  pasos: Paso[];
  error?: ErrorEj;
  devuelve?: Valor;
  memFinal: Memoria;
  fugas: Objeto[];
}

export interface OpcionesEj {
  /** Llamada que se hace desde main, p. ej. «insertarFinal(&cab, 5)». */
  llamada?: string;
  /** Campos que el alumno no puede asignar (para que no resuelva cambiando datos). */
  prohibidos?: string[];
  maxPasos?: number;
}

class Fallo extends Error {
  constructor(public err: ErrorEj) {
    super(err.mensaje);
  }
}
class Retorno {
  constructor(public v?: Valor) {}
}
class Rotura {}
class Seguir {}

type Loc = { k: 'var'; marco: number; nombre: string } | { k: 'campo'; id: number; campo: string } | { k: 'elem'; id: number; campo: string; i: number } | { k: 'objeto'; id: number };

interface FuncionX extends Funcion {
  silenciosa: boolean;
  src: string;
}

export function ejecutar(src: string, ctx: Contexto, inicial: Memoria, op: OpcionesEj = {}): Resultado {
  const m = clonar(inicial);
  const pasos: Paso[] = [{ linea: 0, mem: clonar(m), nota: 'Estado inicial' }];
  const tipos = ctx.structs.map((s) => s.nombre);
  const max = op.maxPasos ?? 3000;

  let prog: Programa;
  let preludio: Programa = { funciones: [], sentencias: [] };
  try {
    prog = analizar(src, tipos);
    if (ctx.preludio) preludio = analizar(ctx.preludio, tipos);
  } catch (e) {
    if (e instanceof ErrorSintaxis) return { pasos, error: { linea: e.linea, mensaje: e.message, tipo: 'sintaxis' }, memFinal: m, fugas: [] };
    throw e;
  }

  const funciones = new Map<string, FuncionX>();
  for (const f of preludio.funciones) funciones.set(f.nombre, { ...f, silenciosa: true, src: ctx.preludio! });
  for (const f of prog.funciones) funciones.set(f.nombre, { ...f, silenciosa: false, src });

  // Comprobación estática: campos prohibidos
  if (op.prohibidos?.length) {
    const p = buscarProhibido(prog, op.prohibidos);
    if (p) return { pasos, error: { linea: p.linea, mensaje: `En este ejercicio no se puede cambiar el campo «${p.campo}»: hay que mover nodos, no datos.`, tipo: 'prohibido' }, memFinal: m, fugas: [] };
  }

  let silencio = 0;
  let cuenta = 0;
  let lineaVisible = 0;
  const fuentes: string[] = [src];
  const txt = (e: Expr) => fuentes[fuentes.length - 1].slice(e.ini, e.fin).replace(/\s+/g, ' ');
  const marco = () => m.marcos.length - 1;

  const fallar = (linea: number, tipo: TipoError, mensaje: string): never => {
    throw new Fallo({ linea: silencio > 0 ? lineaVisible : linea, tipo, mensaje });
  };
  const paso = (linea: number, nota?: string) => {
    if (silencio > 0) return;
    pasos.push({ linea, mem: clonar(m), nota });
  };
  const contar = (linea: number) => {
    if (++cuenta > max)
      fallar(linea, 'bucle', `Llevas más de ${max} pasos: seguramente hay un bucle que no termina. ¿Avanza el puntero dentro del bucle?`);
  };

  // ---------------------------------------------------------------- lectura y escritura

  const buscarVar = (n: string) => m.marcos[marco()].vars.find((v) => v.nombre === n);

  function objeto(id: number, e: Expr, desde?: Expr): Objeto {
    const o = m.objetos[id];
    if (o.liberado) {
      const quien = desde ? `«${txt(desde)}» apunta a un nodo que` : 'Ese nodo';
      fallar(e.linea, 'liberado', `${quien} se liberó en la línea ${o.liberadoEn}: después de free no se puede usar. «${txt(e)}» lee o escribe memoria liberada.`);
    }
    return o;
  }

  function leer(l: Loc, e: Expr): Valor {
    switch (l.k) {
      case 'var':
        return m.marcos[l.marco].vars.find((v) => v.nombre === l.nombre)!.valor;
      case 'campo':
        return objeto(l.id, e).campos[l.campo] as Valor;
      case 'elem':
        return (objeto(l.id, e).campos[l.campo] as Valor[])[l.i];
      case 'objeto':
        return fallar(e.linea, 'tipo', `«${txt(e)}» es un struct entero: usa uno de sus campos.`);
    }
  }

  function escribir(l: Loc, v: Valor, e: Expr) {
    switch (l.k) {
      case 'var':
        m.marcos[l.marco].vars.find((x) => x.nombre === l.nombre)!.valor = v;
        return;
      case 'campo':
        objeto(l.id, e).campos[l.campo] = v;
        return;
      case 'elem':
        (objeto(l.id, e).campos[l.campo] as Valor[])[l.i] = v;
        return;
      case 'objeto':
        fallar(e.linea, 'tipo', 'No se puede asignar un struct entero en estos ejercicios.');
    }
  }

  /** Comprueba que v es un puntero a un struct y devuelve su id. */
  function aStruct(v: Valor, a: Expr, e: Expr): number {
    if (v.k === 'nulo') return fallar(e.linea, 'nulo', `«${txt(a)}» vale NULL, así que «${txt(e)}» no existe: no hay ningún nodo al que ir.`);
    if (v.k === 'basura') return fallar(e.linea, 'basura', `«${txt(a)}» no está inicializado: apunta a cualquier sitio. Dale un valor antes de usarlo.`);
    if (v.k === 'int') return fallar(e.linea, 'tipo', `«${txt(a)}» es un número, no un puntero.`);
    if (v.r.k !== 'obj') return fallar(e.linea, 'tipo', `«${txt(a)}» apunta a un puntero, no a un struct. ¿Te falta un «*», como en «(*${txt(a)})->…»?`);
    return v.r.id;
  }

  function campoDe(id: number, f: string, e: Expr) {
    const o = m.objetos[id];
    const s = structDe(ctx, o.tipo)!;
    const c = s.campos.find((x) => x.nombre === f);
    if (!c) fallar(e.linea, 'nombre', `El tipo ${o.tipo} no tiene el campo «${f}». Sus campos son: ${s.campos.map((x) => x.nombre).join(', ')}.`);
    return c!;
  }

  function loc(e: Expr): Loc {
    switch (e.k) {
      case 'id': {
        const v = buscarVar(e.n);
        if (!v) {
          // a struct declared in main by value («ColaCircular c;»): only main sees it by name
          const local = marco() === 0 ? Object.values(m.objetos).find((o) => !o.heap && o.nombre === e.n) : undefined;
          if (local) return { k: 'objeto', id: local.id };
          if (ctx.constantes && e.n in ctx.constantes) return fallar(e.linea, 'tipo', `${e.n} es una constante: no se puede cambiar.`);
          return fallar(e.linea, 'nombre', `No existe la variable «${e.n}». ¿La has declarado?`);
        }
        return { k: 'var', marco: marco(), nombre: e.n };
      }
      case 'un':
        if (e.op === '*') {
          const v = valor(e.a);
          if (v.k === 'nulo') return fallar(e.linea, 'nulo', `«${txt(e.a)}» vale NULL, así que «${txt(e)}» no existe.`);
          if (v.k === 'basura') return fallar(e.linea, 'basura', `«${txt(e.a)}» no está inicializado.`);
          if (v.k === 'int') return fallar(e.linea, 'tipo', `«${txt(e.a)}» es un número, no un puntero.`);
          const r = v.r;
          if (r.k === 'obj') return { k: 'objeto', id: objeto(r.id, e, e.a).id };
          if (r.k === 'var') return { k: 'var', marco: r.marco, nombre: r.nombre };
          objeto(r.id, e, e.a);
          return r.k === 'campo' ? { k: 'campo', id: r.id, campo: r.campo } : { k: 'elem', id: r.id, campo: r.campo, i: r.i };
        }
        break;
      case 'campo': {
        let id: number;
        if (e.flecha) id = aStruct(valor(e.a), e.a, e);
        else {
          const l = loc(e.a);
          if (l.k !== 'objeto') return fallar(e.linea, 'tipo', `«${txt(e.a)}» es un puntero: usa «->» en lugar de «.».`);
          id = l.id;
        }
        objeto(id, e, e.a);
        campoDe(id, e.f, e);
        return { k: 'campo', id, campo: e.f };
      }
      case 'idx': {
        const l = loc(e.a);
        if (l.k !== 'campo' || !Array.isArray(m.objetos[l.id].campos[l.campo]))
          return fallar(e.linea, 'tipo', `«${txt(e.a)}» no es un array.`);
        const i = entero(valor(e.i), e.i);
        const n = (m.objetos[l.id].campos[l.campo] as Valor[]).length;
        if (i < 0 || i >= n)
          fallar(e.linea, 'array', `«${txt(e)}» se sale del array: tiene ${n} casillas (de 0 a ${n - 1}) y el índice vale ${i}.`);
        return { k: 'elem', id: l.id, campo: l.campo, i };
      }
    }
    return fallar(e.linea, 'tipo', `«${txt(e)}» no es algo a lo que se pueda asignar un valor.`);
  }

  function entero(v: Valor, e: Expr): number {
    if (v.k === 'int') return v.v;
    if (v.k === 'basura') return fallar(e.linea, 'basura', `«${txt(e)}» no tiene valor todavía.`);
    return fallar(e.linea, 'tipo', `«${txt(e)}» es un puntero, no un número.`);
  }

  function verdad(v: Valor, e: Expr): boolean {
    if (v.k === 'int') return v.v !== 0;
    if (v.k === 'nulo') return false;
    if (v.k === 'ref') return true;
    return fallar(e.linea, 'basura', `La condición usa «${txt(e)}», que no tiene valor todavía.`);
  }

  function iguales(a: Valor, b: Valor, e: Expr): boolean {
    if (a.k === 'basura' || b.k === 'basura') return fallar(e.linea, 'basura', `«${txt(e)}» compara algo que no tiene valor todavía.`);
    if (a.k === 'int' && b.k === 'int') return a.v === b.v;
    if (a.k === 'int' || b.k === 'int') {
      const n = a.k === 'int' ? a : (b as { k: 'int'; v: number });
      const o = a.k === 'int' ? b : a;
      if (n.v === 0) return o.k === 'nulo';
      return fallar(e.linea, 'tipo', `«${txt(e)}» compara un puntero con un número.`);
    }
    if (a.k === 'nulo' || b.k === 'nulo') return a.k === b.k;
    return mismaRefX((a as { r: Ref }).r, (b as { r: Ref }).r);
  }

  // ---------------------------------------------------------------- expresiones

  function valor(e: Expr): Valor {
    switch (e.k) {
      case 'num':
        return int(e.v);
      case 'null':
        return NULO;
      case 'id':
        if (ctx.constantes && e.n in ctx.constantes && !buscarVar(e.n)) return int(ctx.constantes[e.n]);
        return leer(loc(e), e);
      case 'bin': {
        if (e.op === '&&') return int(verdad(valor(e.a), e.a) && verdad(valor(e.b), e.b) ? 1 : 0);
        if (e.op === '||') return int(verdad(valor(e.a), e.a) || verdad(valor(e.b), e.b) ? 1 : 0);
        const a = valor(e.a);
        const b = valor(e.b);
        if (e.op === '==') return int(iguales(a, b, e) ? 1 : 0);
        if (e.op === '!=') return int(iguales(a, b, e) ? 0 : 1);
        const x = entero(a, e.a);
        const y = entero(b, e.b);
        switch (e.op) {
          case '<':
            return int(x < y ? 1 : 0);
          case '<=':
            return int(x <= y ? 1 : 0);
          case '>':
            return int(x > y ? 1 : 0);
          case '>=':
            return int(x >= y ? 1 : 0);
          case '+':
            return int(x + y);
          case '-':
            return int(x - y);
          case '*':
            return int(x * y);
          case '/':
          case '%':
            if (y === 0) fallar(e.linea, 'tipo', `«${txt(e)}» divide entre 0.`);
            return int(e.op === '/' ? Math.trunc(x / y) : x % y);
        }
        return fallar(e.linea, 'tipo', `Operador ${e.op} no admitido.`);
      }
      case 'un': {
        if (e.op === '!') return int(verdad(valor(e.a), e.a) ? 0 : 1);
        if (e.op === '-') return int(-entero(valor(e.a), e.a));
        if (e.op === '*') return leer(loc(e), e);
        if (e.op === '&') {
          const l = loc(e.a);
          if (l.k === 'objeto') return { k: 'ref', r: { k: 'obj', id: l.id } };
          return { k: 'ref', r: l };
        }
        const l = loc(e.a);
        const v = entero(leer(l, e.a), e.a) + (e.op === '++' ? 1 : -1);
        escribir(l, int(v), e);
        return int(v);
      }
      case 'post': {
        const l = loc(e.a);
        const v = entero(leer(l, e.a), e.a);
        escribir(l, int(v + (e.op === '++' ? 1 : -1)), e);
        return int(v);
      }
      case 'asig': {
        const l = loc(e.a);
        let v = valor(e.b);
        if (e.op !== '=') {
          const x = entero(leer(l, e.a), e.a);
          const y = entero(v, e.b);
          v = int(e.op === '+=' ? x + y : e.op === '-=' ? x - y : x * y);
        }
        escribir(l, v, e);
        return v;
      }
      case 'campo':
      case 'idx':
        return leer(loc(e), e);
      case 'sizeof':
        return int(1);
      case 'cast':
        return valor(e.a);
      case 'cond':
        return verdad(valor(e.c), e.c) ? valor(e.a) : valor(e.b);
      case 'llamada':
        return llamada(e);
    }
  }

  function llamada(e: Expr & { k: 'llamada' }): Valor {
    if (e.f === 'malloc') {
      const a = e.args[0];
      const t = a && (a.k === 'sizeof' ? a.t : null);
      if (!t || t.ptr !== 0 || !structDe(ctx, t.base))
        return fallar(e.linea, 'tipo', `Reserva así: malloc(sizeof(${ctx.structs[0]?.nombre ?? 'Nodo'})).`);
      const o = nuevoObjeto(m, ctx, t.base, true);
      o.creadoEn = e.linea;
      return { k: 'ref', r: { k: 'obj', id: o.id } };
    }
    if (e.f === 'free') {
      if (e.args.length !== 1) return fallar(e.linea, 'tipo', 'free recibe un único puntero.');
      const v = valor(e.args[0]);
      if (v.k === 'nulo') return NULO; // free(NULL) no hace nada
      if (v.k === 'basura') return fallar(e.linea, 'basura', `«${txt(e.args[0])}» no está inicializado: no se puede liberar.`);
      if (v.k !== 'ref' || v.r.k !== 'obj') return fallar(e.linea, 'free', `«${txt(e.args[0])}» no apunta a algo reservado con malloc.`);
      const o = m.objetos[v.r.id];
      if (!o.heap) return fallar(e.linea, 'free', `Solo se puede liberar lo que se reservó con malloc, y «${txt(e.args[0])}» no lo es.`);
      if (o.liberado) return fallar(e.linea, 'free', `Doble free: el nodo al que apunta «${txt(e.args[0])}» ya se liberó en la línea ${o.liberadoEn}.`);
      o.liberado = true;
      o.liberadoEn = e.linea;
      return NULO;
    }
    if (e.f === 'printf' || e.f === 'puts') return int(0);
    const f = funciones.get(e.f);
    if (!f) return fallar(e.linea, 'nombre', `No existe la función «${e.f}».`);
    if (f.params.length !== e.args.length)
      return fallar(e.linea, 'tipo', `${e.f} recibe ${f.params.length} argumento${f.params.length === 1 ? '' : 's'} y le pasas ${e.args.length}.`);
    const args = e.args.map((a) => valor(a));
    // Los punteros a variables del marco de quien llama siguen apuntando allí
    m.marcos.push({ funcion: f.nombre, vars: f.params.map((p, i) => ({ nombre: p.nombre, tipo: p.tipo, valor: args[i] })) });
    if (f.silenciosa) silencio++;
    fuentes.push(f.src);
    paso(f.linea, `Entra en ${f.nombre}`);
    let r: Valor | undefined;
    try {
      ejecutarSent(f.cuerpo);
    } catch (x) {
      if (x instanceof Retorno) r = x.v;
      else throw x;
    } finally {
      fuentes.pop();
      if (f.silenciosa) silencio--;
    }
    m.marcos.pop();
    return r ?? NULO;
  }

  // ---------------------------------------------------------------- sentencias

  function ejecutarSent(s: Sent): void {
    if (silencio === 0 && s.k !== 'bloque') lineaVisible = s.linea;
    switch (s.k) {
      case 'vacia':
        return;
      case 'bloque':
        for (const x of s.ss) ejecutarSent(x);
        return;
      case 'decl': {
        contar(s.linea);
        const mc = m.marcos[marco()];
        for (const v of s.vars) {
          const tipo: Tipo = { base: s.tipo.base, ptr: v.ptr };
          if (tipo.ptr === 0 && tipo.base !== 'int')
            fallar(s.linea, 'tipo', `Declara un puntero (${tipo.base} *${v.nombre}): los ${tipo.base} ya los tiene la estructura o se crean con malloc.`);
          const val = v.init ? valor(v.init) : BASURA;
          const i = mc.vars.findIndex((x) => x.nombre === v.nombre);
          if (i >= 0) mc.vars[i] = { nombre: v.nombre, tipo, valor: val };
          else mc.vars.push({ nombre: v.nombre, tipo, valor: val });
        }
        paso(s.linea);
        return;
      }
      case 'expr':
        contar(s.linea);
        valor(s.e);
        paso(s.linea);
        return;
      case 'if': {
        contar(s.linea);
        const c = verdad(valor(s.c), s.c);
        paso(s.linea, c ? 'La condición se cumple' : 'La condición no se cumple');
        if (c) ejecutarSent(s.s);
        else if (s.sino) ejecutarSent(s.sino);
        return;
      }
      case 'while':
        for (;;) {
          contar(s.linea);
          const c = verdad(valor(s.c), s.c);
          paso(s.linea, c ? 'Se cumple: otra vuelta' : 'No se cumple: sale del bucle');
          if (!c) return;
          if (cuerpoBucle(s.s)) return;
        }
      case 'dowhile':
        for (;;) {
          contar(s.linea);
          if (cuerpoBucle(s.s)) return;
          if (silencio === 0) lineaVisible = s.lineaC;
          const c = verdad(valor(s.c), s.c);
          paso(s.lineaC, c ? 'Se cumple: otra vuelta' : 'No se cumple: sale del bucle');
          if (!c) return;
        }
      case 'for':
        if (s.ini) ejecutarSent(s.ini);
        for (;;) {
          contar(s.linea);
          const c = s.c ? verdad(valor(s.c), s.c) : true;
          paso(s.linea, c ? 'Se cumple: otra vuelta' : 'No se cumple: sale del bucle');
          if (!c) return;
          if (cuerpoBucle(s.s)) return;
          if (s.paso) valor(s.paso);
        }
      case 'return': {
        contar(s.linea);
        const v = s.e ? valor(s.e) : undefined;
        paso(s.linea, v ? `Devuelve ${verValor(v)}` : 'Sale de la función');
        throw new Retorno(v);
      }
      case 'break':
        throw new Rotura();
      case 'continue':
        throw new Seguir();
    }
  }

  /** Ejecuta el cuerpo de un bucle; devuelve true si ha salido con break. */
  function cuerpoBucle(s: Sent): boolean {
    try {
      ejecutarSent(s);
    } catch (x) {
      if (x instanceof Rotura) return true;
      if (x instanceof Seguir) return false;
      throw x;
    }
    return false;
  }

  // ---------------------------------------------------------------- arranque

  let devuelve: Valor | undefined;
  try {
    for (const s of prog.sentencias) ejecutarSent(s);
    if (op.llamada) {
      fuentes.push(op.llamada + ';');
      const ss = analizar(op.llamada + ';', tipos).sentencias;
      for (const e of ss) {
        if (e.k !== 'expr') throw new Error('Llamada mal escrita en el ejercicio: ' + op.llamada);
        devuelve = valor(e.e);
      }
      fuentes.pop();
      pasos.push({ linea: -1, mem: clonar(m), nota: `Vuelve a main${devuelve && devuelve.k !== 'nulo' ? `: devuelve ${verValor(devuelve)}` : ''}` });
    }
  } catch (x) {
    if (x instanceof Fallo) {
      pasos.push({ linea: x.err.linea, mem: clonar(m), error: true, nota: x.err.mensaje });
      return { pasos, error: x.err, memFinal: m, fugas: [] };
    }
    if (x instanceof Retorno) {
      // return suelto en el código de main: se acaba
    } else if (x instanceof Rotura || x instanceof Seguir) {
      const err: ErrorEj = { linea: lineaVisible, tipo: 'tipo', mensaje: `Hay un ${x instanceof Rotura ? 'break' : 'continue'} fuera de un bucle.` };
      return { pasos, error: err, memFinal: m, fugas: [] };
    } else throw x;
  }

  const vivos = alcanzables(m, [0]);
  const fugas = Object.values(m.objetos).filter((o) => o.heap && !o.liberado && !vivos.has(o.id));
  return { pasos, devuelve, memFinal: m, fugas };
}

function mismaRefX(a: Ref, b: Ref): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function verValor(v: Valor): string {
  switch (v.k) {
    case 'int':
      return String(v.v);
    case 'nulo':
      return 'NULL';
    case 'basura':
      return '?';
    case 'ref':
      return 'un puntero';
  }
}

function buscarProhibido(p: Programa, campos: string[]): { linea: number; campo: string } | null {
  let hallado: { linea: number; campo: string } | null = null;
  const verE = (e: Expr | undefined): void => {
    if (!e || hallado) return;
    if (e.k === 'asig' && e.a.k === 'campo' && campos.includes(e.a.f)) hallado = { linea: e.linea, campo: e.a.f };
    for (const v of Object.values(e)) {
      if (v && typeof v === 'object' && 'k' in (v as object) && 'ini' in (v as object)) verE(v as Expr);
      if (Array.isArray(v)) v.forEach((x) => x && typeof x === 'object' && 'ini' in x && verE(x as Expr));
    }
  };
  const verS = (s: Sent | undefined): void => {
    if (!s || hallado) return;
    switch (s.k) {
      case 'decl':
        s.vars.forEach((v) => verE(v.init));
        break;
      case 'expr':
        verE(s.e);
        break;
      case 'while':
      case 'dowhile':
        verE(s.c);
        verS(s.s);
        break;
      case 'if':
        verE(s.c);
        verS(s.s);
        verS(s.sino);
        break;
      case 'for':
        verS(s.ini);
        verE(s.c);
        verE(s.paso);
        verS(s.s);
        break;
      case 'bloque':
        s.ss.forEach(verS);
        break;
      case 'return':
        verE(s.e);
        break;
    }
  };
  p.sentencias.forEach(verS);
  p.funciones.forEach((f) => verS(f.cuerpo));
  return hallado;
}
