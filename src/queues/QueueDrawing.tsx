// Drawing of the queues, left to right as on the board: the front on the left and the back
// on the right. The array ones show the MAX cells with their indices and a marker under
// the front (and under final, or under the computed last one in the deque); the linked
// ones show main's struct and, below it, the chain of nodes from the front, with sig to the
// right and ant (in the deque) back to the left. Same convention as the rest of the app:
// red for what changes in this step, grey dashed for the link that stops being valid,
// dashed box and cross for freed memory, amber for what nobody reaches any more.

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { alcanzables } from '../memoria/comparar';
import { Memoria, mismoValor, Objeto, Valor } from '../memoria/modelo';
import { QueueType } from './catalog';
import { esArray, queueObj } from './prepare';

const MARGEN = 20;
const VAR_W = 48;
const VAR_H = 32;
const LETRA = 8.4;
const CELDA_W = 50;
const CELDA_H = 34;
const CAMPO_W = 74;
const NODO_H = 40;
const HUECO_NODO = 46;
const PARTE_W: Record<string, number> = { dato: 42, prio: 32 };
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
interface StructL extends Pt {
  id: number;
  w: number;
  h: number;
}
interface Lay {
  struct: StructL;
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
/** Struct fields drawn as boxes (the array goes apart). */
const camposStruct = (t: QueueType) => t.ctx.structs.find((s) => s.nombre === t.struct)!.campos.filter((c) => !c.arr).map((c) => c.nombre);

/** Cells of the array (MAX). */
const MAX_CELDAS = (t: QueueType) => t.ctx.structs[0].campos.find((c) => c.arr)?.arr ?? 0;

/** Where each field box of the struct goes, relative to its corner. */
function sitioCampo(t: QueueType, campo: string): Pt {
  const i = camposStruct(t).indexOf(campo);
  if (esArray(t)) return { x: 16 + MAX_CELDAS(t) * CELDA_W + 34 + 52, y: 30 + i * 42 };
  return { x: 16 + i * CAMPO_W, y: 50 };
}

/** The chain from the front, following sig. */
function cadenaDe(t: QueueType, m: Memoria, c: Objeto): number[] {
  const res: number[] = [];
  let id = idObj((c.campos.frente ?? c.campos.cabeza) as Valor);
  while (id !== null && m.objetos[id]?.tipo === t.nodo!.tipo && !res.includes(id)) {
    res.push(id);
    id = idObj(m.objetos[id].campos.sig as Valor);
  }
  return res;
}

// ---------------------------------------------------------------- layout

function layout(m: Memoria, t: QueueType, sinVars: boolean): Lay {
  const c = queueObj(m);
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
  const yStruct = sinVars ? MARGEN : yBanda + VAR_H + 46;
  let x = MARGEN;
  for (const marco of marcos) {
    const lista = todas.filter((v) => v.marco === marco && aNodo(v.valor) === null);
    if (hayFuncion) grupos.push({ x, y: MARGEN + 4, texto: marco === 0 ? 'en main' : `en ${m.marcos[marco].funcion}`, fun: marco > 0 });
    for (const v of lista) {
      vars.push({ ...v, x, y: yBanda });
      x += anchoVar(v.nombre);
    }
    x += 24;
  }
  let ancho = x;

  // main's struct
  let w: number;
  let h: number;
  if (esArray(t)) {
    w = sitioCampo(t, 'n').x + VAR_W + 16;
    h = Math.max(30 + 22 + CELDA_H + 3 * 17 + 8, 30 + camposStruct(t).length * 42);
  } else {
    w = 16 + camposStruct(t).length * CAMPO_W;
    h = 50 + VAR_H + 14;
  }
  const struct: StructL = { id: c.id, x: MARGEN, y: yStruct, w, h };
  ancho = Math.max(ancho, struct.x + w + MARGEN);
  let alto = yStruct + h;

  // nodes: the chain in a row and, below it, the ones outside the chain (the new one before
  // it is linked, the one that has just been skipped or freed)
  const nodos: Lay['nodos'] = {};
  if (t.nodo) {
    const nw = anchoNodo(t);
    const cadena = cadenaDe(t, m, c);
    const yCadena = yStruct + h + 56;
    cadena.forEach((n, i) => (nodos[n] = { x: MARGEN + 10 + i * (nw + HUECO_NODO), y: yCadena }));
    const sueltos = Object.values(m.objetos)
      .filter((o) => o.tipo === t.nodo!.tipo && !cadena.includes(o.id))
      .map((o) => o.id)
      .sort((a, b) => a - b);
    const conVars = (ids: number[]) => ids.some((n) => todas.some((v) => aNodo(v.valor) === n));
    const ySueltos = yCadena + NODO_H + (conVars(cadena) ? 34 + VAR_H + 48 : 64);
    sueltos.forEach((n, i) => (nodos[n] = { x: MARGEN + 10 + i * (nw + HUECO_NODO + 40), y: ySueltos }));
    alto = Math.max(alto, yCadena + NODO_H + 40);
    if (sueltos.length) alto = Math.max(alto, ySueltos + NODO_H + (conVars(sueltos) ? 34 + VAR_H + 10 : 30));
    else if (conVars(cadena)) alto = Math.max(alto, yCadena + NODO_H + 34 + VAR_H + 10);
    for (const p of Object.values(nodos)) ancho = Math.max(ancho, p.x + nw + 50);

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
  return { struct, nodos, vars, grupos, ancho: Math.max(ancho + MARGEN, 320), alto: alto + MARGEN };
}

// ---------------------------------------------------------------- animation

function interpolar(a: Lay | null, b: Lay, k: number): Lay {
  if (!a || k >= 1) return b;
  const l = (p: number, q: number) => p + (q - p) * k;
  const mover = <T extends Pt>(desde: T | undefined, hacia: T): T => (desde ? { ...hacia, x: l(desde.x, hacia.x), y: l(desde.y, hacia.y) } : hacia);
  const nodos: Lay['nodos'] = {};
  for (const [id, n] of Object.entries(b.nodos)) nodos[Number(id)] = mover(a.nodos[Number(id)], n);
  const vars = b.vars.map((v) => mover(a.vars.find((x) => x.clave === v.clave), v));
  return { ...b, nodos, vars, struct: mover(a.struct, b.struct) };
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
  const S = L.struct;
  const nw = tipo.nodo ? anchoNodo(tipo) : 0;
  const doble = !!tipo.nodo?.campos.includes('ant');

  const varPrev = (v: VarL) => prev?.marcos[v.marco]?.vars.find((x) => x.nombre === v.nombre)?.valor;
  const campoPrev = (id: number, c: string): Valor | undefined => {
    if (!prev) return undefined;
    const o = prev.objetos[id];
    return o ? (o.campos[c] as Valor) : { k: 'basura' };
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
  /** Height inside the node where each pointer leaves, so sig and ant do not overlap. */
  const yPtr = (c: string) => (!doble ? NODO_H / 2 : c === 'sig' ? 13 : 27);

  /** Where an arrow to v ends, coming from s (field: which pointer it is, for the offsets). */
  function destinoDe(v: Valor, s: Pt, campo?: string): string | null {
    if (v.k !== 'ref') return null;
    let t: Pt;
    if (v.r.k === 'obj') {
      const n = L.nodos[v.r.id];
      if (n) {
        const mismaFila = Math.abs(s.y - (n.y + (campo ? yPtr(campo) : NODO_H / 2))) < 6;
        if (mismaFila && campo === 'sig' && n.x > s.x) return `M${s.x} ${s.y} L${n.x - 2} ${s.y}`;
        if (mismaFila && campo === 'ant' && n.x < s.x) return `M${s.x} ${s.y} L${n.x + nw + 2} ${s.y}`;
        const dx = campo === 'final' ? 0.68 : campo === 'frente' || campo === 'cabeza' ? 0.32 : 0.5;
        if (s.y > n.y + NODO_H) return curva(s, { x: n.x + nw * dx, y: n.y + NODO_H + 2 }, true);
        return curva(s, { x: n.x + nw * dx, y: n.y - 2 }, false);
      }
      if (v.r.id === S.id) return curva(s, { x: Math.min(Math.max(s.x, S.x + 16), S.x + S.w - 16), y: S.y - 2 }, false);
      return null;
    }
    if (v.r.k === 'var') {
      const r = v.r;
      const tv = L.vars.find((x) => x.marco === r.marco && x.nombre === r.nombre);
      if (!tv) return null;
      if (Math.abs(tv.y + VAR_H / 2 - s.y) < 4) return `M${s.x} ${s.y} L${s.x > tv.x ? tv.x + VAR_W + 2 : tv.x - 2} ${s.y}`;
      return curva(s, { x: tv.x + VAR_W / 2, y: tv.y + VAR_H + 2 }, true);
    }
    if (v.r.k === 'campo') {
      // a pointer to a field (the NodoP **p of encolarPrio): into that field's box
      const { id, campo: cf } = v.r;
      if (id === S.id) {
        const sc = sitioCampo(tipo, cf);
        t = { x: S.x + sc.x + VAR_W / 2, y: S.y + sc.y - 2 };
      } else if (L.nodos[id]) {
        t = { x: L.nodos[id].x + xParte(cf) + anchoParte(cf) / 2, y: L.nodos[id].y - 2 };
      } else return null;
      return curva(s, t, s.y > t.y);
    }
    return null;
  }

  function curva(s: Pt, t: Pt, subiendo: boolean): string {
    if (subiendo) {
      const dy = Math.max(16, (s.y - t.y) / 2);
      return `M${s.x} ${s.y} C${s.x} ${s.y - dy} ${t.x} ${t.y + dy} ${t.x} ${t.y}`;
    }
    const dy = Math.max(16, (t.y - s.y) / 2);
    return `M${s.x} ${s.y} C${s.x} ${s.y + dy} ${t.x} ${t.y - dy} ${t.x} ${t.y}`;
  }

  function puntero(clave: string, s: Pt, v: Valor, antes: Valor | undefined, muerto: boolean, campo?: string) {
    const cambia = antes !== undefined && !mismoValor(antes, v);
    const tono: Tono = muerto ? 'gris' : cambia ? 'rojo' : 'tinta';
    const dib = (val: Valor, tn: Tono, k: string, disc: boolean) => {
      const d = destinoDe(val, s, campo);
      if (d) flechas.push({ d, tono: tn, clave: k, disc });
    };
    if (v.k === 'ref') dib(v, tono, clave, muerto);
    if (cambia && antes?.k === 'ref') dib(antes, 'gris', clave + '-viejo', true);
  }

  for (const v of L.vars) if (v.valor.k === 'ref') puntero(`v${v.clave}`, { x: v.x + VAR_W / 2, y: v.y + (v.y > S.y ? 0 : VAR_H / 2) }, v.valor, prev ? (varPrev(v) ?? { k: 'basura' }) : undefined, false);
  if (tipo.nodo) {
    const o = mem.objetos[S.id];
    for (const cf of camposStruct(tipo)) {
      if (cf === 'n') continue;
      const sc = sitioCampo(tipo, cf);
      puntero(`c${cf}`, { x: S.x + sc.x + VAR_W / 2, y: S.y + sc.y + VAR_H / 2 }, o.campos[cf] as Valor, campoPrev(S.id, cf), false, cf);
    }
    for (const [ids, n] of Object.entries(L.nodos)) {
      const id = Number(ids);
      const on = mem.objetos[id];
      for (const cf of tipo.nodo.campos.filter((x) => !(x in PARTE_W)))
        puntero(`n${id}${cf}`, { x: n.x + xParte(cf) + PTR_W / 2, y: n.y + yPtr(cf) }, on.campos[cf] as Valor, campoPrev(id, cf), on.liberado, cf);
    }
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

      <StructBox s={S} mem={mem} prev={prev} tipo={tipo} />

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
                const s = v.k === 'int' ? (cf === 'prio' ? `p${v.v}` : String(v.v)) : '?';
                texto = (
                  <text x={x0 + wp / 2} y={26} className={`dato ${cf === 'prio' ? 'peque' : ''} ${cambia ? 'rojo' : ''}`}>
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
            <text x={v.x + VAR_W / 2} y={v.y > S.y ? v.y + VAR_H + 15 : v.y - 6} className="var-nombre">
              {v.nombre}
            </text>
            <Casilla x={v.x} y={v.y} v={v.valor} cambia={cambia} />
          </g>
        );
      })}
    </svg>
  );
}

/** main's struct: for the array ones, the cells left to right with their markers. */
function StructBox({ s, mem, prev, tipo }: { s: StructL; mem: Memoria; prev?: Memoria; tipo: QueueType }) {
  const o = mem.objetos[s.id];
  const po = prev?.objetos[s.id];
  const cambia = (c: string) => !!prev && (!po || !mismoValor(po.campos[c] as Valor, o.campos[c] as Valor));
  const campos = camposStruct(tipo).map((nombre) => {
    const sc = sitioCampo(tipo, nombre);
    const arriba = !esArray(tipo);
    return (
      <g key={nombre}>
        <text x={arriba ? s.x + sc.x + VAR_W / 2 : s.x + sc.x - 8} y={arriba ? s.y + sc.y - 7 : s.y + sc.y + 21} className="campo-nombre" textAnchor={arriba ? 'middle' : 'end'}>
          {nombre}
        </text>
        <Casilla x={s.x + sc.x} y={s.y + sc.y} v={o.campos[nombre] as Valor} cambia={cambia(nombre)} />
      </g>
    );
  });
  let celdas: JSX.Element | null = null;
  if (esArray(tipo)) {
    const arr = o.campos.datos as Valor[];
    const antes = po?.campos.datos as Valor[] | undefined;
    const tam = arr.length;
    const f = num(o.campos.frente);
    const n = num(o.campos.n);
    const valido = (i: number | null): i is number => i !== null && i >= 0 && i < tam;
    const logica = (i: number) => valido(f) && n !== null && ((i - f + tam) % tam) < Math.min(n, tam);
    const xc = s.x + 16;
    const yc = s.y + 30 + 22;
    // markers under the cells: the fields that are indices, and the computed last one of the deque
    const marcas: { texto: string; i: number; rojo: boolean; calculada?: boolean }[] = [];
    if (valido(f)) marcas.push({ texto: 'frente', i: f, rojo: cambia('frente') });
    const fin = num(o.campos.final);
    if ('final' in o.campos && valido(fin)) marcas.push({ texto: 'final', i: fin, rojo: cambia('final') });
    if (!('final' in o.campos) && valido(f) && n !== null && n > 0 && n <= tam) marcas.push({ texto: 'último', i: (f + n - 1) % tam, rojo: cambia('frente') || cambia('n'), calculada: true });
    const fila: Record<number, number> = {};
    celdas = (
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
          const r = (fila[mk.i] = (fila[mk.i] ?? -1) + 1);
          return (
            <text key={mk.texto} x={xc + mk.i * CELDA_W + CELDA_W / 2} y={yc + CELDA_H + 15 + r * 16} textAnchor="middle" className={`marca-cima ${mk.rojo ? 'rojo' : ''}`} style={mk.calculada ? { fontStyle: 'italic', fontWeight: 600 } : undefined}>
              ▲ {mk.texto}
            </text>
          );
        })}
      </>
    );
  }
  return (
    <g className="record">
      <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={10} className="record-caja" />
      <text x={s.x + 12} y={s.y + 19} className="record-titulo">
        {tipo.struct} c
      </text>
      {celdas}
      {campos}
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
