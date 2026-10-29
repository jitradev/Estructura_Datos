// Drawing of the queues, left to right as on the board: the front on the left and the back
// on the right. The array ones show their cells with the indices and a marker under frente
// and under final; the linked ones show the struct and, below it, the chain of nodes from
// inicio, with siguiente to the right and anterior (in the deque) back to the left. The
// array of priority queues shows its colas[] and, one row per priority, each ColaEnlazada
// with its chain to the right. Same convention as the rest of the app: red for what changes
// in this step, grey dashed for the link that stops being valid, dashed box and cross for
// freed memory, amber for what nobody reaches any more.

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { alcanzables } from '../memoria/comparar';
import { Memoria, mismoValor, Objeto, Valor } from '../memoria/modelo';
import { QueueType } from './catalog';
import { esArray } from './prepare';
import { codoLado, codoVertical, tuerce } from '../dibujo/rutas';

const MARGEN = 20;
const VAR_W = 48;
const VAR_H = 32;
const LETRA = 8.4;
const CELDA_W = 44;
const CELDA_H = 34;
const CAMPO_W = 74;
const FILA_CAMPO = 38;
const NODO_H = 40;
const HUECO_NODO = 46;
const PARTE_W: Record<string, number> = { valor: 42, prioridad: 32 };
const PTR_W = 34;

interface Pt {
  x: number;
  y: number;
}
interface VarL extends Pt {
  clave: string;
  nombre: string;
  marco: number;
  valor: Valor;
}
type Forma = 'array' | 'campos-fila' | 'campos-columna' | 'colas';
interface StructL extends Pt {
  id: number;
  w: number;
  h: number;
  forma: Forma;
}
interface Lay {
  structs: Record<number, StructL>;
  nodos: Record<number, Pt>;
  vars: VarL[];
  grupos: { x: number; y: number; texto: string; fun: boolean }[];
  ancho: number;
  alto: number;
}

const idObj = (v: Valor | undefined): number | null => (v && v.k === 'ref' && v.r.k === 'obj' ? v.r.id : null);
const anchoVar = (n: string) => Math.max(VAR_W, n.length * LETRA + 6) + 16;
const anchoParte = (c: string) => PARTE_W[c] ?? PTR_W;
const anchoNodo = (t: QueueType) => t.nodo!.campos.reduce((s, c) => s + anchoParte(c), 0);
const num = (v: Valor | Valor[] | undefined) => (v && !Array.isArray(v) && v.k === 'int' ? v.v : null);
const defDe = (t: QueueType, tipo: string) => t.ctx.structs.find((s) => s.nombre === tipo)!;
/** Struct fields drawn as boxes (the arrays go apart). */
const camposDe = (t: QueueType, tipo: string) =>
  defDe(t, tipo)
    .campos.filter((c) => !c.arr)
    .map((c) => c.nombre);
const celdasDe = (t: QueueType) => defDe(t, t.struct).campos.find((c) => c.arr)?.arr ?? 0;
/** Width of the label column in the boxes with their fields one under another. */
const etiquetaW = (t: QueueType, tipo: string) => Math.max(...camposDe(t, tipo).map((c) => c.length * 7.6), t.subcola === undefined || tipo !== t.struct ? 0 : 'colas[0]'.length * 7.6) + 14;
/** Height of one row of the array of queues: one ColaEnlazada box. */
const pasoColas = (t: QueueType) => 28 + camposDe(t, t.subcola!).length * FILA_CAMPO + 22;
/** Top of the colas[i] box, level with the inicio box of its queue. */
const filaColas = (t: QueueType, s: { y: number }, i: number) => s.y + 30 + i * pasoColas(t) + 28;

/** Where each field box goes inside its struct, relative to the corner. */
function sitioCampo(t: QueueType, s: { forma: Forma; h: number }, tipo: string, campo: string): Pt {
  const i = camposDe(t, tipo).indexOf(campo);
  if (s.forma === 'campos-fila') return { x: 16 + i * CAMPO_W, y: 50 };
  if (s.forma === 'array') return { x: 16 + celdasDe(t) * CELDA_W + 24 + etiquetaW(t, tipo), y: 30 + i * 42 };
  if (s.forma === 'colas') return { x: 14 + etiquetaW(t, tipo), y: s.h - VAR_H - 12 }; // tamano, under colas[]
  return { x: 12 + etiquetaW(t, tipo), y: 28 + i * FILA_CAMPO };
}

/** The chain from inicio, following siguiente. */
function cadenaDe(t: QueueType, m: Memoria, s: Objeto): number[] {
  const res: number[] = [];
  let id = idObj(s.campos.inicio as Valor);
  while (id !== null && m.objetos[id]?.tipo === t.nodo!.tipo && !res.includes(id)) {
    res.push(id);
    id = idObj(m.objetos[id].campos.siguiente as Valor);
  }
  return res;
}

// ---------------------------------------------------------------- layout

function layout(m: Memoria, t: QueueType, sinVars: boolean): Lay {
  const esNodo = (id: number | null): id is number => id !== null && !!t.nodo && m.objetos[id]?.tipo === t.nodo.tipo;
  const marcos = m.marcos.length > 1 ? [0, m.marcos.length - 1] : [0];
  const todas: VarL[] = [];
  if (!sinVars) for (const i of marcos) for (const v of m.marcos[i].vars) todas.push({ clave: `${i}:${v.nombre}`, nombre: v.nombre, marco: i, valor: v.valor, x: 0, y: 0 });
  const aNodo = (v: Valor) => (esNodo(idObj(v)) ? idObj(v) : null);

  // top band: everything that does not point to a node, grouped by function
  const vars: VarL[] = [];
  const grupos: Lay['grupos'] = [];
  const hayFuncion = marcos.length > 1;
  const yBanda = MARGEN + 18 + (hayFuncion ? 16 : 0);
  let x = MARGEN;
  for (const marco of marcos) {
    const lista = todas.filter((v) => v.marco === marco && aNodo(v.valor) === null);
    if (!lista.length) continue;
    if (hayFuncion) grupos.push({ x, y: MARGEN + 4, texto: marco === 0 ? 'en main' : `en ${m.marcos[marco].funcion}`, fun: marco > 0 });
    for (const v of lista) {
      vars.push({ ...v, x, y: yBanda });
      x += anchoVar(v.nombre);
    }
    x += 24;
  }
  let ancho = x;
  const yStruct = vars.length ? yBanda + VAR_H + 46 : MARGEN;
  let alto = yStruct;

  const structs: Lay['structs'] = {};
  const nodos: Lay['nodos'] = {};
  const nw = t.nodo ? anchoNodo(t) : 0;
  const principal = Object.values(m.objetos)
    .filter((o) => o.tipo === t.struct)
    .sort((a, b) => a.id - b.id)[0];
  const enCadena = new Set<number>();
  /** Nodes of a chain in a row, from (x0, y). */
  const fila = (ids: number[], x0: number, y: number) =>
    ids.forEach((n, i) => {
      nodos[n] = { x: x0 + i * (nw + HUECO_NODO), y };
      enCadena.add(n);
      ancho = Math.max(ancho, x0 + i * (nw + HUECO_NODO) + nw + 40);
    });

  if (principal && esArray(t)) {
    const w = sitioCampo(t, { forma: 'array', h: 0 }, t.struct, camposDe(t, t.struct)[0]).x + VAR_W + 16;
    const h = Math.max(30 + 22 + CELDA_H + 2 * 16 + 10, 30 + camposDe(t, t.struct).length * 42);
    structs[principal.id] = { id: principal.id, x: MARGEN, y: yStruct, w, h, forma: 'array' };
    alto = yStruct + h;
    ancho = Math.max(ancho, MARGEN + w + MARGEN);
  } else if (principal && t.subcola) {
    // colas[] down the left, one row per queue
    const sub = t.subcola;
    const subW = 12 + etiquetaW(t, sub) + VAR_W + 12;
    const paso = pasoColas(t);
    const subH = paso - 22;
    const colas = principal.campos.colas as Valor[];
    const subIds = colas.map(idObj).filter((id): id is number => id !== null && m.objetos[id]?.tipo === sub);
    const sueltas = Object.values(m.objetos)
      .filter((o) => o.tipo === sub && !subIds.includes(o.id))
      .map((o) => o.id);
    const filas = colas.length + sueltas.length;
    const h = 30 + filas * paso + VAR_H + 20;
    const w = 14 + etiquetaW(t, t.struct) + VAR_W + 14;
    structs[principal.id] = { id: principal.id, x: MARGEN, y: yStruct, w, h, forma: 'colas' };
    const xSub = MARGEN + w + 56;
    const yFila = (i: number) => yStruct + 30 + i * paso;
    colas.forEach((v, i) => {
      const id = idObj(v);
      if (id === null || m.objetos[id]?.tipo !== sub || structs[id]) return;
      structs[id] = { id, x: xSub, y: yFila(i), w: subW, h: subH, forma: 'campos-columna' };
    });
    sueltas.forEach((id, k) => (structs[id] = { id, x: xSub, y: yFila(colas.length + k), w: subW, h: subH, forma: 'campos-columna' }));
    for (const s of Object.values(structs))
      if (s.forma === 'campos-columna') {
        const o = m.objetos[s.id];
        if (!o.liberado) fila(cadenaDe(t, m, o), s.x + s.w + 46, s.y + 28 + (VAR_H - NODO_H) / 2);
        ancho = Math.max(ancho, s.x + s.w + 40);
      }
    alto = yStruct + h;
  } else if (principal) {
    const w = 16 + camposDe(t, t.struct).length * CAMPO_W;
    const h = 50 + VAR_H + 14;
    structs[principal.id] = { id: principal.id, x: MARGEN, y: yStruct, w, h, forma: 'campos-fila' };
    ancho = Math.max(ancho, MARGEN + w + MARGEN);
    alto = yStruct + h + 56 + NODO_H + 30;
    if (!principal.liberado) fila(cadenaDe(t, m, principal), MARGEN + 10, yStruct + h + 56);
  }

  // nodes outside the chains (the new one before it is linked, the one that has just been
  // skipped or freed): a row underneath
  if (t.nodo) {
    const conVars = (ids: number[]) => ids.some((n) => todas.some((v) => aNodo(v.valor) === n));
    const cadena = [...enCadena];
    if (conVars(cadena)) alto = Math.max(alto, Math.max(...cadena.map((n) => nodos[n].y)) + NODO_H + 34 + VAR_H + 22);
    const sueltos = Object.values(m.objetos)
      .filter((o) => o.tipo === t.nodo!.tipo && !enCadena.has(o.id))
      .map((o) => o.id)
      .sort((a, b) => a - b);
    const ySueltos = alto + 30;
    sueltos.forEach((n, i) => {
      nodos[n] = { x: MARGEN + 10 + i * (nw + HUECO_NODO + 40), y: ySueltos };
      ancho = Math.max(ancho, MARGEN + 10 + i * (nw + HUECO_NODO + 40) + nw + 50);
    });
    if (sueltos.length) alto = ySueltos + NODO_H + (conVars(sueltos) ? 34 + VAR_H + 10 : 30);

    // variables that point to a node: under it
    const usado: Record<number, number> = {};
    for (const v of todas) {
      const n = aNodo(v.valor);
      if (n === null || !nodos[n]) continue;
      const p = nodos[n];
      const xv = p.x + (usado[n] ?? 0);
      vars.push({ ...v, x: xv, y: p.y + NODO_H + 34 });
      usado[n] = (usado[n] ?? 0) + anchoVar(v.nombre);
      ancho = Math.max(ancho, xv + anchoVar(v.nombre) + MARGEN);
    }
  }
  return { structs, nodos, vars, grupos, ancho: Math.max(ancho + MARGEN, 320), alto: alto + MARGEN };
}

// ---------------------------------------------------------------- animation

function interpolar(a: Lay | null, b: Lay, k: number): Lay {
  if (!a || k >= 1) return b;
  const l = (p: number, q: number) => p + (q - p) * k;
  const mover = <T extends Pt>(desde: T | undefined, hacia: T): T => (desde ? { ...hacia, x: l(desde.x, hacia.x), y: l(desde.y, hacia.y) } : hacia);
  const nodos: Lay['nodos'] = {};
  for (const [id, n] of Object.entries(b.nodos)) nodos[Number(id)] = mover(a.nodos[Number(id)], n);
  const structs: Lay['structs'] = {};
  for (const [id, s] of Object.entries(b.structs)) structs[Number(id)] = mover(a.structs[Number(id)], s);
  const vars = b.vars.map((v) => mover(a.vars.find((x) => x.clave === v.clave), v));
  return { ...b, nodos, structs, vars };
}

function useTransicion(destino: Lay): Lay {
  const desde = useRef<Lay | null>(null);
  const hacia = useRef(destino);
  const actual = useRef(destino);
  const inicio = useRef(0);
  const [, setTic] = useState(0);
  if (hacia.current !== destino) {
    desde.current = actual.current;
    hacia.current = destino;
    inicio.current = performance.now();
  }
  let reducir = false;
  try {
    reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    /* nothing */
  }
  const k = reducir ? 1 : Math.min(1, (performance.now() - inicio.current) / 380);
  useEffect(() => {
    if (k >= 1) return;
    const r = requestAnimationFrame(() => setTic((x) => x + 1));
    return () => cancelAnimationFrame(r);
  });
  const suave = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  const l = interpolar(desde.current, destino, suave);
  actual.current = l;
  return l;
}

// ---------------------------------------------------------------- component

type Tono = 'tinta' | 'rojo' | 'gris' | 'fuga';
interface Flecha {
  d: string;
  tono: Tono;
  clave: string;
  disc?: boolean;
}

/** soloCola: without main's variables, for the examples. */
export function QueueDrawing({ mem, prev, tipo, titulo, soloCola = false }: { mem: Memoria; prev?: Memoria; tipo: QueueType; titulo?: string; soloCola?: boolean }) {
  const uid = useId().replace(/:/g, '');
  const destino = useMemo(() => layout(mem, tipo, soloCola), [mem, tipo, soloCola]);
  const L = useTransicion(destino);
  const vivos = alcanzables(
    mem,
    mem.marcos.map((_, i) => i),
  );
  const flechas: Flecha[] = [];
  const nw = tipo.nodo ? anchoNodo(tipo) : 0;
  const doble = !!tipo.nodo?.campos.includes('anterior');

  const varPrev = (v: VarL) => prev?.marcos[v.marco]?.vars.find((x) => x.nombre === v.nombre)?.valor;
  const campoPrev = (id: number, c: string, i?: number): Valor | undefined => {
    if (!prev) return undefined;
    const o = prev.objetos[id];
    if (!o) return { k: 'basura' };
    return i === undefined ? (o.campos[c] as Valor) : (o.campos[c] as Valor[])[i];
  };
  /** Left edge of a field inside a node. */
  const xParte = (c: string) => {
    let x = 0;
    for (const p of tipo.nodo!.campos) {
      if (p === c) return x;
      x += anchoParte(p);
    }
    return x;
  };
  /** Height inside the node where each pointer leaves, so siguiente and anterior do not overlap. */
  const yPtr = (c: string) => (!doble ? NODO_H / 2 : c === 'siguiente' ? 13 : 27);

  function curva(s: Pt, t: Pt, desde: 'abajo' | 'arriba' | 'lado'): string {
    if (desde === 'lado') {
      if (Math.abs(t.y - s.y) > 24 && Math.abs(t.x - s.x) > 24) return codoLado(s, t);
      const dx = Math.max(30, Math.abs(t.x - s.x) / 2);
      return `M${s.x} ${s.y} C${s.x + dx} ${s.y} ${t.x} ${t.y + (t.y > s.y ? -40 : 40)} ${t.x} ${t.y}`;
    }
    if (tuerce(s, t)) return codoVertical(s, t);
    const dy = Math.max(16, Math.abs(t.y - s.y) / 2) * (desde === 'abajo' ? 1 : -1);
    return `M${s.x} ${s.y} C${s.x} ${s.y + dy} ${t.x} ${t.y - dy} ${t.x} ${t.y}`;
  }

  /** The path of an arrow from s to v (campo: which pointer it is, for the offsets; lado: it leaves sideways). */
  function destinoDe(v: Valor, s: Pt, campo?: string, lado = false): string | null {
    if (v.k !== 'ref') return null;
    if (v.r.k === 'obj') {
      const n = L.nodos[v.r.id];
      if (n) {
        const mismaFila = Math.abs(s.y - (n.y + (campo === 'siguiente' || campo === 'anterior' ? yPtr(campo) : NODO_H / 2))) < 6;
        if (mismaFila && campo !== 'anterior' && n.x > s.x) return `M${s.x} ${s.y} L${n.x - 2} ${s.y}`;
        if (mismaFila && campo === 'anterior' && n.x < s.x) return `M${s.x} ${s.y} L${n.x + nw + 2} ${s.y}`;
        const dx = campo === 'final' ? 0.68 : campo === 'inicio' ? 0.32 : 0.5;
        const abajo = s.y > n.y + NODO_H;
        const t = { x: n.x + nw * dx, y: abajo ? n.y + NODO_H + 2 : n.y - 2 };
        return curva(s, t, lado ? 'lado' : abajo ? 'arriba' : 'abajo');
      }
      const st = L.structs[v.r.id];
      if (st) {
        if (s.x < st.x && s.y > st.y && s.y < st.y + st.h) return `M${s.x} ${s.y} L${st.x - 2} ${s.y}`;
        return curva(s, { x: Math.min(Math.max(s.x, st.x + 16), st.x + st.w - 16), y: st.y - 2 }, 'abajo');
      }
      return null;
    }
    if (v.r.k === 'var') {
      const r = v.r;
      const tv = L.vars.find((x) => x.marco === r.marco && x.nombre === r.nombre);
      if (!tv) return null;
      if (Math.abs(tv.y + VAR_H / 2 - s.y) < 4) return `M${s.x} ${s.y} L${s.x > tv.x ? tv.x + VAR_W + 2 : tv.x - 2} ${s.y}`;
      return curva(s, { x: tv.x + VAR_W / 2, y: tv.y + VAR_H + 2 }, 'arriba');
    }
    return null;
  }

  function puntero(clave: string, s: Pt, v: Valor, antes: Valor | undefined, muerto: boolean, campo?: string, lado = false) {
    const cambia = antes !== undefined && !mismoValor(antes, v);
    const tono: Tono = muerto ? 'gris' : cambia ? 'rojo' : 'tinta';
    const dib = (val: Valor, tn: Tono, k: string, disc: boolean) => {
      const d = destinoDe(val, s, campo, lado);
      if (d) flechas.push({ d, tono: tn, clave: k, disc });
    };
    if (v.k === 'ref') dib(v, tono, clave, muerto);
    if (cambia && antes?.k === 'ref') dib(antes, 'gris', clave + '-viejo', true);
  }

  const yMin = Math.min(...Object.values(L.structs).map((s) => s.y), Infinity);
  for (const v of L.vars) if (v.valor.k === 'ref') puntero(`v${v.clave}`, { x: v.x + VAR_W / 2, y: v.y + (v.y > yMin ? 0 : VAR_H / 2) }, v.valor, prev ? (varPrev(v) ?? { k: 'basura' }) : undefined, false);
  for (const s of Object.values(L.structs)) {
    const o = mem.objetos[s.id];
    if (s.forma === 'colas') {
      (o.campos.colas as Valor[]).forEach((v, i) => {
        puntero(`s${s.id}c${i}`, { x: s.x + 14 + etiquetaW(tipo, o.tipo) + VAR_W / 2, y: filaColas(tipo, s, i) + VAR_H / 2 }, v, campoPrev(s.id, 'colas', i), o.liberado);
      });
      continue;
    }
    if (s.forma === 'array') continue;
    for (const cf of ['inicio', 'final']) {
      if (!(cf in o.campos)) continue;
      const sc = sitioCampo(tipo, s, o.tipo, cf);
      puntero(`s${s.id}${cf}`, { x: s.x + sc.x + VAR_W / 2, y: s.y + sc.y + VAR_H / 2 }, o.campos[cf] as Valor, campoPrev(s.id, cf), o.liberado, cf, s.forma === 'campos-columna');
    }
  }
  for (const [ids, n] of Object.entries(L.nodos)) {
    const id = Number(ids);
    const on = mem.objetos[id];
    for (const cf of tipo.nodo!.campos.filter((x) => !(x in PARTE_W)))
      puntero(`n${id}${cf}`, { x: n.x + xParte(cf) + PTR_W / 2, y: n.y + yPtr(cf) }, on.campos[cf] as Valor, campoPrev(id, cf), on.liberado, cf);
  }

  const tonos: Tono[] = ['tinta', 'rojo', 'gris', 'fuga'];
  return (
    <svg className="dibujo" viewBox={`0 0 ${L.ancho} ${L.alto}`} style={{ maxWidth: L.ancho * 1.1 }} role="img" aria-label={titulo ?? `Memoria: ${tipo.nombre}`}>
      <defs>
        {tonos.map((t) => (
          <marker key={t} id={`${uid}-${t}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" className={`punta-${t}`} />
          </marker>
        ))}
      </defs>
      {L.grupos.map((g) => (
        <text key={g.texto + g.x} x={g.x} y={g.y + 8} className={`grupo-marco ${g.fun ? 'fun' : ''}`}>
          {g.texto}
        </text>
      ))}

      {Object.values(L.structs).map((s) => (
        <StructBox key={s.id} s={s} mem={mem} prev={prev} tipo={tipo} />
      ))}

      {flechas.map((f) => (
        <path key={f.clave} d={f.d} className={`fl ${f.tono} ${f.disc ? 'disc' : ''}`} markerEnd={`url(#${uid}-${f.tono})`} />
      ))}

      {Object.entries(L.nodos).map(([ids, n]) => {
        const id = Number(ids);
        const o = mem.objetos[id];
        const po = prev?.objetos[id];
        const fuga = o.heap && !o.liberado && !vivos.has(id);
        let xp = 0;
        return (
          <g key={`n${id}`} className={`nodo ${o.liberado ? 'liberado' : ''} ${prev && !po ? 'nuevo' : ''} ${fuga ? 'fuga' : ''}`} transform={`translate(${n.x} ${n.y})`}>
            {tipo.nodo!.campos.map((cf) => {
              const x0 = xp;
              const wp = anchoParte(cf);
              xp += wp;
              const v = o.campos[cf] as Valor;
              const cambia = !!po && !mismoValor(po.campos[cf] as Valor, v);
              let texto: JSX.Element;
              if (cf in PARTE_W) {
                const s = v.k === 'int' ? (cf === 'prioridad' ? `p${v.v}` : String(v.v)) : '?';
                texto = (
                  <text x={x0 + wp / 2} y={26} className={`dato ${cf === 'prioridad' ? 'peque' : ''} ${cambia ? 'rojo' : ''}`}>
                    {s}
                  </text>
                );
              } else if (v.k === 'ref') texto = <circle cx={x0 + wp / 2} cy={yPtr(cf)} r={3.6} className={`punto ${cambia ? 'rojo' : ''}`} />;
              else
                texto = (
                  <text x={x0 + wp / 2} y={v.k === 'nulo' ? 24 : 26} className={`dato peque ${cambia ? 'rojo' : ''}`} style={v.k === 'nulo' ? { fontSize: 9.5 } : undefined}>
                    {v.k === 'nulo' ? 'NULL' : '?'}
                  </text>
                );
              return (
                <g key={cf}>
                  <rect x={x0} width={wp} height={NODO_H} rx={5} className="caja" />
                  {texto}
                </g>
              );
            })}
            {o.liberado && <path d={`M4 4 L${nw - 4} ${NODO_H - 4} M${nw - 4} 4 L4 ${NODO_H - 4}`} className="aspa" />}
            {(o.liberado || fuga) && (
              <text x={nw / 2} y={-8} className={`nota-nodo ${fuga ? 'fuga' : ''}`}>
                {fuga ? 'nadie lo apunta: fuga' : 'liberado'}
              </text>
            )}
          </g>
        );
      })}

      {L.vars.map((v) => {
        const antes = varPrev(v);
        const cambia = !!prev && (!antes || !mismoValor(antes, v.valor));
        return (
          <g key={v.clave} className={`var ${v.marco > 0 ? 'local' : ''}`}>
            <text x={v.x + VAR_W / 2} y={v.y > yMin ? v.y + VAR_H + 15 : v.y - 6} className="var-nombre">
              {v.nombre}
            </text>
            <Casilla x={v.x} y={v.y} v={v.valor} cambia={cambia} />
          </g>
        );
      })}
    </svg>
  );
}

/** A struct: the array ones with their cells and markers, the others with their fields. */
function StructBox({ s, mem, prev, tipo }: { s: StructL; mem: Memoria; prev?: Memoria; tipo: QueueType }) {
  const o = mem.objetos[s.id];
  const po = prev?.objetos[s.id];
  const cambia = (c: string) => !!prev && (!po || !mismoValor(po.campos[c] as Valor, o.campos[c] as Valor));
  const fila = s.forma === 'campos-fila';
  const campos = camposDe(tipo, o.tipo).map((nombre) => {
    const sc = sitioCampo(tipo, s, o.tipo, nombre);
    return (
      <g key={nombre}>
        <text x={fila ? s.x + sc.x + VAR_W / 2 : s.x + sc.x - 8} y={fila ? s.y + sc.y - 7 : s.y + sc.y + 21} className="campo-nombre" textAnchor={fila ? 'middle' : 'end'}>
          {nombre}
        </text>
        <Casilla x={s.x + sc.x} y={s.y + sc.y} v={o.campos[nombre] as Valor} cambia={cambia(nombre)} />
      </g>
    );
  });
  let extra: JSX.Element | null = null;
  if (s.forma === 'colas') {
    const colas = o.campos.colas as Valor[];
    const antes = po?.campos.colas as Valor[] | undefined;
    const xc = s.x + 14 + etiquetaW(tipo, o.tipo);
    extra = (
      <>
        {colas.map((v, i) => (
          <g key={i}>
            <text x={xc - 8} y={filaColas(tipo, s, i) + 21} className="campo-nombre" textAnchor="end">
              colas[{i}]
            </text>
            <Casilla x={xc} y={filaColas(tipo, s, i)} v={v} cambia={!!prev && (!antes || !mismoValor(antes[i], v))} />
          </g>
        ))}
      </>
    );
  } else if (s.forma === 'array') {
    const arr = o.campos.array as Valor[];
    const antes = po?.campos.array as Valor[] | undefined;
    const tam = arr.length;
    const f = num(o.campos.frente);
    const n = num(o.campos.numElementos);
    const valido = (i: number | null): i is number => i !== null && i >= 0 && i < tam;
    const logica = (i: number) => valido(f) && n !== null && (i - f + tam) % tam < Math.min(n, tam);
    const xc = s.x + 16;
    const yc = s.y + 30 + 22;
    const marcas: { texto: string; i: number; rojo: boolean }[] = [];
    for (const c of ['frente', 'final']) {
      const i = num(o.campos[c]);
      if (valido(i)) marcas.push({ texto: c, i, rojo: cambia(c) });
    }
    const usadas: Record<number, number> = {};
    extra = (
      <>
        {arr.map((v, i) => {
          const ch = !!prev && !!antes && !mismoValor(antes[i], v);
          return (
            <g key={i}>
              <text x={xc + i * CELDA_W + CELDA_W / 2} y={yc - 6} className="celda-i">
                {i}
              </text>
              <rect x={xc + i * CELDA_W} y={yc} width={CELDA_W} height={CELDA_H} className={`celda ${ch ? 'cambia' : ''}`} />
              <text x={xc + i * CELDA_W + CELDA_W / 2} y={yc + 23} className={`celda-v ${logica(i) ? '' : 'obsoleto'} ${ch ? 'rojo' : ''}`}>
                {v.k === 'int' ? v.v : ''}
              </text>
            </g>
          );
        })}
        {marcas.map((mk) => {
          const r = (usadas[mk.i] = (usadas[mk.i] ?? -1) + 1);
          return (
            <text key={mk.texto} x={xc + mk.i * CELDA_W + CELDA_W / 2} y={yc + CELDA_H + 15 + r * 16} textAnchor="middle" className={`marca-cima ${mk.rojo ? 'rojo' : ''}`}>
              ▲ {mk.texto}
            </text>
          );
        })}
      </>
    );
  }
  return (
    <g className="record">
      <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={10} className={`record-caja ${o.liberado ? 'liberada' : ''}`} />
      <text x={s.x + 12} y={s.y + 19} className="record-titulo">
        {o.tipo}
      </text>
      {extra}
      {campos}
      {o.liberado && <path d={`M${s.x + 6} ${s.y + 6} L${s.x + s.w - 6} ${s.y + s.h - 6} M${s.x + s.w - 6} ${s.y + 6} L${s.x + 6} ${s.y + s.h - 6}`} className="aspa" />}
    </g>
  );
}

function Casilla({ x, y, v, cambia }: { x: number; y: number; v: Valor; cambia: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={VAR_W} height={VAR_H} rx={5} className={`casilla ${cambia ? 'cambia' : ''}`} />
      {v.k === 'ref' ? (
        <circle cx={x + VAR_W / 2} cy={y + VAR_H / 2} r={3.6} className={`punto ${cambia ? 'rojo' : ''}`} />
      ) : (
        <text x={x + VAR_W / 2} y={y + 21} className={`casilla-v ${v.k === 'nulo' ? 'peque' : ''} ${cambia ? 'rojo' : ''}`}>
          {v.k === 'int' ? v.v : v.k === 'nulo' ? 'NULL' : '?'}
        </text>
      )}
    </g>
  );
}
