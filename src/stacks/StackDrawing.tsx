// Drawing of the two stacks, upright as on the board: the array with index 0 at the
// bottom and a marker on the top, and the linked stack with the top node first and each
// node pointing to the one below. Same convention as the rest of the app: red for what
// changes in this step, grey dashed for the link that stops being valid, dashed box and
// cross for freed memory, amber for what nobody reaches any more.

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { alcanzables } from '../memoria/comparar';
import { Memoria, mismoValor, Valor } from '../memoria/modelo';
import { StackType } from './catalog';
import { codoVertical, tuerce } from '../dibujo/rutas';

const MARGEN = 20;
const VAR_W = 48;
const VAR_H = 32;
const LETRA = 8.4;
const CELDA_W = 54;
const CELDA_H = 30;
const NODO_VAL = 46;
const NODO_SIG = 34;
const NODO_W = NODO_VAL + NODO_SIG;
const NODO_H = 40;
const PASO_NODO = 72;

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
interface PilaL extends Pt {
  id: number;
  w: number;
  h: number;
}
interface Lay {
  pilas: Record<number, PilaL>;
  nodos: Record<number, Pt>;
  vars: VarL[];
  grupos: { x: number; y: number; texto: string; fun: boolean }[];
  ancho: number;
  alto: number;
}

const idObj = (v: Valor | undefined): number | null => (v && v.k === 'ref' && v.r.k === 'obj' ? v.r.id : null);
const anchoVar = (n: string) => Math.max(VAR_W, n.length * LETRA + 6) + 16;

// ---------------------------------------------------------------- layout

function layout(m: Memoria, t: StackType): Lay {
  const tam = t.enlazada ? 0 : ((t.ctx.structs[0].campos.find((c) => c.arr)?.arr as number) ?? 0);
  const pilaIds = Object.values(m.objetos)
    .filter((o) => o.tipo === t.struct)
    .map((o) => o.id)
    .sort((a, b) => a - b);
  const esNodo = (id: number | null): id is number => id !== null && m.objetos[id]?.tipo === 'Nodo';

  const marcos = m.marcos.length > 1 ? [0, m.marcos.length - 1] : [0];
  const todas: VarL[] = [];
  for (const i of marcos) for (const v of m.marcos[i].vars) todas.push({ clave: `${i}:${v.nombre}`, nombre: v.nombre, marco: i, valor: v.valor, x: 0, y: 0 });
  const aPila = (v: Valor) => {
    const id = idObj(v);
    return id !== null && pilaIds.includes(id) ? id : null;
  };
  const aNodo = (v: Valor) => (esNodo(idObj(v)) ? idObj(v) : null);

  // top band: numbers, pointers to variables, NULL and uninitialised pointers
  const vars: VarL[] = [];
  const grupos: Lay['grupos'] = [];
  const hayFuncion = marcos.length > 1;
  const yBanda = MARGEN + 18 + (hayFuncion ? 16 : 0);
  let x = MARGEN;
  for (const marco of marcos) {
    const lista = todas.filter((v) => v.marco === marco && aPila(v.valor) === null && aNodo(v.valor) === null);
    if (!lista.length) continue;
    if (hayFuncion) grupos.push({ x, y: MARGEN + 4, texto: marco === 0 ? 'en main' : `en ${m.marcos[marco].funcion}`, fun: marco > 0 });
    for (const v of lista) {
      vars.push({ ...v, x, y: yBanda });
      x += anchoVar(v.nombre);
    }
    x += 24;
  }
  let ancho = x;
  const hayBanda = vars.length > 0;

  // one column per stack, with the variables that point to it just above
  const yCarril = (hayBanda ? yBanda + VAR_H + 34 : MARGEN + 18) + (hayFuncion && !hayBanda ? 16 : 0);
  const yPila = yCarril + VAR_H + 34;
  const pilas: Lay['pilas'] = {};
  const nodos: Lay['nodos'] = {};
  let xc = MARGEN;
  let alto = yPila;
  for (const pid of pilaIds) {
    const o = m.objetos[pid];
    let w: number;
    let h: number;
    let anchoCol: number;
    if (!t.enlazada) {
      w = 34 + CELDA_W + 86;
      h = 30 + 42 + tam * CELDA_H + 34;
      anchoCol = w;
    } else {
      w = 150;
      h = 30 + 2 * 40;
      // the chain from cima, top to bottom
      const cadena: number[] = [];
      let id = idObj(o.campos.cima as Valor);
      while (esNodo(id) && !cadena.includes(id)) {
        cadena.push(id);
        id = idObj(m.objetos[id].campos.siguiente as Valor);
      }
      const xn = xc + 30;
      const yn0 = yPila + h + 46;
      cadena.forEach((n, i) => (nodos[n] = { x: xn, y: yn0 + i * PASO_NODO }));
      // variables pointing to chain nodes go to their right
      const anchoVarsNodo = (n: number) => todas.filter((v) => aNodo(v.valor) === n).reduce((s, v) => s + anchoVar(v.nombre), 0);
      const extra = Math.max(0, ...cadena.map(anchoVarsNodo));
      // nodes outside the chain (the new one before linking it, the freed one): a lane on the right
      const xl = xn + NODO_W + 30 + extra + (extra ? 10 : 0);
      const sueltos = Object.values(m.objetos)
        .filter((n) => n.tipo === 'Nodo' && !cadena.includes(n.id) && !nodos[n.id] && pertenece(m, n.id, pid, pilaIds))
        .map((n) => n.id);
      sueltos.forEach((n, i) => (nodos[n] = { x: xl, y: yn0 + i * PASO_NODO }));
      const extraSuelto = Math.max(0, ...sueltos.map(anchoVarsNodo));
      anchoCol = Math.max(w, sueltos.length ? xl - xc + NODO_W + 30 + extraSuelto : xn - xc + NODO_W + 30 + extra);
      const filas = Math.max(cadena.length, sueltos.length);
      alto = Math.max(alto, yn0 + Math.max(1, filas) * PASO_NODO + 10);
    }
    pilas[pid] = { id: pid, x: xc, y: yPila, w, h };
    alto = Math.max(alto, yPila + h + 20);
    // variables that point to this stack
    let xv = xc;
    for (const v of todas.filter((v) => aPila(v.valor) === pid)) {
      vars.push({ ...v, x: xv, y: yCarril });
      xv += anchoVar(v.nombre);
    }
    xc += Math.max(anchoCol, xv - xc) + 60;
  }
  ancho = Math.max(ancho, xc);

  // variables pointing to nodes: to the right of their node
  const usado: Record<number, number> = {};
  for (const v of todas) {
    const n = aNodo(v.valor);
    if (n === null || !nodos[n]) continue;
    const p = nodos[n];
    const xv = p.x + NODO_W + 30 + (usado[n] ?? 0);
    vars.push({ ...v, x: xv, y: p.y + (NODO_H - VAR_H) / 2 });
    usado[n] = (usado[n] ?? 0) + anchoVar(v.nombre);
    ancho = Math.max(ancho, xv + anchoVar(v.nombre));
  }
  return { pilas, nodos, vars, grupos, ancho: Math.max(ancho + MARGEN, 320), alto: alto + MARGEN };
}

/** Whether a loose node belongs next to this stack (it is drawn with the first one otherwise). */
function pertenece(m: Memoria, nodo: number, pila: number, pilas: number[]): boolean {
  // a node reachable from another stack's chain belongs to that stack
  for (const p of pilas) {
    let id = idObj(m.objetos[p].campos.cima as Valor);
    const vistos = new Set<number>();
    while (id !== null && m.objetos[id]?.tipo === 'Nodo' && !vistos.has(id)) {
      if (id === nodo) return p === pila;
      vistos.add(id);
      id = idObj(m.objetos[id].campos.siguiente as Valor);
    }
  }
  return pila === pilas[0];
}

// ---------------------------------------------------------------- animation

function interpolar(a: Lay | null, b: Lay, k: number): Lay {
  if (!a || k >= 1) return b;
  const l = (p: number, q: number) => p + (q - p) * k;
  const mover = <T extends Pt>(desde: T | undefined, hacia: T): T => (desde ? { ...hacia, x: l(desde.x, hacia.x), y: l(desde.y, hacia.y) } : hacia);
  const nodos: Lay['nodos'] = {};
  for (const [id, n] of Object.entries(b.nodos)) nodos[Number(id)] = mover(a.nodos[Number(id)], n);
  const pilas: Lay['pilas'] = {};
  for (const [id, p] of Object.entries(b.pilas)) pilas[Number(id)] = mover(a.pilas[Number(id)], p);
  const vars = b.vars.map((v) => mover(a.vars.find((x) => x.clave === v.clave), v));
  return { ...b, nodos, pilas, vars };
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

export function StackDrawing({ mem, prev, tipo, titulo }: { mem: Memoria; prev?: Memoria; tipo: StackType; titulo?: string }) {
  const uid = useId().replace(/:/g, '');
  const destino = useMemo(() => layout(mem, tipo), [mem, tipo]);
  const L = useTransicion(destino);
  const vivos = alcanzables(
    mem,
    mem.marcos.map((_, i) => i),
  );
  const flechas: Flecha[] = [];
  const nulos: { x: number; y: number; tono: Tono; clave: string }[] = [];

  const varPrev = (v: VarL) => prev?.marcos[v.marco]?.vars.find((x) => x.nombre === v.nombre)?.valor;
  const campoPrev = (id: number, c: string): Valor | undefined => {
    if (!prev) return undefined;
    const o = prev.objetos[id];
    return o ? (o.campos[c] as Valor) : { k: 'basura' };
  };

  /** Where an arrow to v ends, coming from s. */
  function destinoDe(v: Valor, s: Pt): { p: Pt; desde: 'arriba' | 'lado' | 'abajo' } | null {
    if (v.k !== 'ref') return null;
    if (v.r.k === 'obj') {
      const n = L.nodos[v.r.id];
      if (n) {
        if (Math.abs(s.y - (n.y + NODO_H / 2)) < 6 && s.x > n.x + NODO_W) return { p: { x: n.x + NODO_W + 2, y: n.y + NODO_H / 2 }, desde: 'lado' };
        return { p: { x: n.x + NODO_VAL + NODO_SIG / 2, y: n.y - 2 }, desde: 'arriba' };
      }
      const p = L.pilas[v.r.id];
      if (p) return { p: { x: Math.min(Math.max(s.x, p.x + 16), p.x + p.w - 16), y: p.y - 2 }, desde: 'arriba' };
      return null;
    }
    if (v.r.k === 'var') {
      const r = v.r;
      const t = L.vars.find((x) => x.marco === r.marco && x.nombre === r.nombre);
      if (!t) return null;
      // on the same row: straight in from the side
      if (Math.abs(t.y + VAR_H / 2 - s.y) < 4) return { p: { x: s.x > t.x ? t.x + VAR_W + 2 : t.x - 2, y: s.y }, desde: 'lado' };
      return { p: { x: t.x + VAR_W / 2, y: t.y + VAR_H + 2 }, desde: 'abajo' };
    }
    return null;
  }

  function camino(s: Pt, d: { p: Pt; desde: 'arriba' | 'lado' | 'abajo' }): string {
    const t = d.p;
    if (d.desde === 'lado') return `M${s.x} ${s.y} L${t.x} ${t.y}`;
    if (d.desde === 'abajo') {
      const fondo = Math.max(s.y, t.y) + 46;
      return `M${s.x} ${s.y} C${s.x} ${fondo} ${t.x} ${fondo} ${t.x} ${t.y}`;
    }
    if (t.y < s.y) {
      // upwards (a loose node pointing to the top of the chain): around the left
      return `M${s.x} ${s.y} C${s.x + 40} ${s.y} ${t.x} ${t.y - 50} ${t.x} ${t.y}`;
    }
    if (tuerce(s, t)) return codoVertical(s, t);
    const dy = Math.max(16, (t.y - s.y) / 2);
    return `M${s.x} ${s.y} C${s.x} ${s.y + dy} ${t.x} ${t.y - dy} ${t.x} ${t.y}`;
  }

  function puntero(clave: string, s: Pt, v: Valor, antes: Valor | undefined, muerto: boolean, nuloAbajo: boolean) {
    const cambia = antes !== undefined && !mismoValor(antes, v);
    const tono: Tono = muerto ? 'gris' : cambia ? 'rojo' : 'tinta';
    const dib = (val: Valor, tn: Tono, k: string, disc: boolean) => {
      const d = destinoDe(val, s);
      if (d) flechas.push({ d: camino(s, d), tono: tn, clave: k, disc });
    };
    if (v.k === 'ref') dib(v, tono, clave, muerto);
    else if (v.k === 'nulo' && nuloAbajo) nulos.push({ x: s.x, y: s.y, tono, clave });
    if (cambia && antes?.k === 'ref') dib(antes, 'gris', clave + '-viejo', true);
  }

  for (const v of L.vars) if (v.valor.k === 'ref') puntero(`v${v.clave}`, { x: v.x + VAR_W / 2, y: v.y + VAR_H / 2 }, v.valor, prev ? (varPrev(v) ?? { k: 'basura' }) : undefined, false, false);
  if (tipo.enlazada) {
    for (const p of Object.values(L.pilas)) {
      const o = mem.objetos[p.id];
      puntero(`c${p.id}`, { x: p.x + 76 + VAR_W / 2, y: p.y + 30 + VAR_H / 2 }, o.campos.cima as Valor, campoPrev(p.id, 'cima'), o.liberado, false);
    }
    for (const [ids, n] of Object.entries(L.nodos)) {
      const id = Number(ids);
      const o = mem.objetos[id];
      puntero(`s${id}`, { x: n.x + NODO_VAL + NODO_SIG / 2, y: n.y + NODO_H / 2 }, o.campos.siguiente as Valor, campoPrev(id, 'siguiente'), o.liberado, true);
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

      {Object.values(L.pilas).map((p) => (
        <StackBox key={p.id} p={p} mem={mem} prev={prev} tipo={tipo} />
      ))}

      {flechas.map((f) => (
        <path key={f.clave} d={f.d} className={`fl ${f.tono} ${f.disc ? 'disc' : ''}`} markerEnd={`url(#${uid}-${f.tono})`} />
      ))}
      {nulos.map((n) => (
        <g key={n.clave + 'nulo'}>
          <path d={`M${n.x} ${n.y} V${n.y + 44}`} className={`fl ${n.tono}`} markerEnd={`url(#${uid}-${n.tono})`} />
          <text x={n.x} y={n.y + 60} className={`nulo ${n.tono}`} textAnchor="middle">
            NULL
          </text>
        </g>
      ))}

      {Object.entries(L.nodos).map(([ids, n]) => {
        const id = Number(ids);
        const o = mem.objetos[id];
        const po = prev?.objetos[id];
        const fuga = o.heap && !o.liberado && !vivos.has(id);
        const val = o.campos.valor as Valor;
        const sig = o.campos.siguiente as Valor;
        const cambiaVal = po && !mismoValor(po.campos.valor as Valor, val);
        return (
          <g key={`n${id}`} className={`nodo ${o.liberado ? 'liberado' : ''} ${prev && !po ? 'nuevo' : ''} ${fuga ? 'fuga' : ''}`} transform={`translate(${n.x} ${n.y})`}>
            <rect width={NODO_VAL} height={NODO_H} rx={5} className="caja" />
            <rect x={NODO_VAL} width={NODO_SIG} height={NODO_H} rx={5} className="caja" />
            <text x={NODO_VAL / 2} y={26} className={`dato ${cambiaVal ? 'rojo' : ''}`}>
              {val.k === 'int' ? val.v : '?'}
            </text>
            {sig.k === 'basura' ? (
              <text x={NODO_VAL + NODO_SIG / 2} y={26} className="dato peque">
                ?
              </text>
            ) : (
              <circle cx={NODO_VAL + NODO_SIG / 2} cy={NODO_H / 2} r={3.6} className="punto" />
            )}
            {o.liberado && <path d={`M4 4 L${NODO_W - 4} ${NODO_H - 4} M${NODO_W - 4} 4 L4 ${NODO_H - 4}`} className="aspa" />}
            {(o.liberado || fuga) && (
              <text x={NODO_W / 2} y={NODO_H + 15} className={`nota-nodo ${fuga ? 'fuga' : ''}`}>
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
            <text x={v.x + VAR_W / 2} y={v.y - 6} className="var-nombre">
              {v.nombre}
            </text>
            <Casilla x={v.x} y={v.y} v={v.valor} cambia={cambia} />
          </g>
        );
      })}
    </svg>
  );
}

/** The stack struct: for the array, the cells upright with the top marker. */
function StackBox({ p, mem, prev, tipo }: { p: PilaL; mem: Memoria; prev?: Memoria; tipo: StackType }) {
  const o = mem.objetos[p.id];
  const po = prev?.objetos[p.id];
  const cambia = (c: string) => !!prev && (!po || !mismoValor(po.campos[c] as Valor, o.campos[c] as Valor));
  const campo = (nombre: string, y: number) => (
    <g key={nombre}>
      <text x={p.x + 12} y={p.y + y + 21} className="campo-nombre">
        {nombre}
      </text>
      <Casilla x={p.x + 76} y={p.y + y} v={o.campos[nombre] as Valor} cambia={cambia(nombre)} />
    </g>
  );
  let cuerpo: JSX.Element;
  if (tipo.enlazada) cuerpo = <>{[campo('cima', 30), campo('tamano', 70)]}</>;
  else {
    const arr = o.campos.array as Valor[];
    const antes = po?.campos.array as Valor[] | undefined;
    const cimaV = o.campos.cima as Valor;
    const cima = cimaV.k === 'int' ? cimaV.v : null;
    const yArr = p.y + 30 + 42;
    const yDe = (i: number) => yArr + (arr.length - 1 - i) * CELDA_H;
    const xc = p.x + 34;
    const fuera = cima !== null && (cima < -1 || cima >= arr.length);
    cuerpo = (
      <>
        {campo('cima', 30)}
        {arr.map((v, i) => {
          const ch = !!prev && !!antes && !mismoValor(antes[i], v);
          const logica = cima !== null && i <= cima;
          return (
            <g key={i}>
              <rect x={xc} y={yDe(i)} width={CELDA_W} height={CELDA_H} className={`celda ${ch ? 'cambia' : ''}`} />
              <text x={xc + CELDA_W / 2} y={yDe(i) + 21} className={`celda-v ${logica ? '' : 'obsoleto'} ${ch ? 'rojo' : ''}`}>
                {v.k === 'int' ? v.v : ''}
              </text>
              <text x={xc - 8} y={yDe(i) + 20} className="celda-i" textAnchor="end">
                {i}
              </text>
            </g>
          );
        })}
        {cima !== null && !fuera && (
          <text x={xc + CELDA_W + 8} y={yDe(cima) + 20} className={`marca-cima ${cambia('cima') ? 'rojo' : ''}`}>
            ◀ cima{cima === -1 ? ' (-1)' : ''}
          </text>
        )}
        {cima === -1 && <rect x={xc} y={yDe(-1)} width={CELDA_W} height={CELDA_H} className="celda-fantasma" />}
      </>
    );
  }
  return (
    <g className="record">
      <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={10} className={`record-caja ${o.liberado ? 'liberada' : ''}`} />
      <text x={p.x + 12} y={p.y + 19} className="record-titulo">
        {tipo.struct}
      </text>
      {cuerpo}
      {o.liberado && <path d={`M${p.x + 6} ${p.y + 6} L${p.x + p.w - 6} ${p.y + p.h - 6} M${p.x + p.w - 6} ${p.y + 6} L${p.x + 6} ${p.y + p.h - 6}`} className="aspa" />}
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
