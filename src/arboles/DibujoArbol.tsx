// Drawing of a binary tree (topics 8 and 9) with the same convention as the rest of the app:
// red for what changes in this step, a grey dashed arrow for the link that has just stopped
// counting, a freed node with a dashed box and a cross, and amber for what nobody reaches.
//
// Each node is a box [izquierda | valor | derecha]. The nodes go in columns by their in-order
// position and in rows by their depth, so a binary search tree reads sorted from left to right.
// Nodes outside the tree (a new one before linking it, a freed one) form little trees on the
// right. The variables that point to nodes are tags above them; the recursive calls in progress
// are listed above the drawing, and the nodes they are working on are shaded.

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { alcanzables } from '../memoria/comparar';
import { Memoria, mismoValor, Valor } from '../memoria/modelo';

const NW = 88; // node width
const CW = 24; // width of a pointer cell
const NH = 34;
const COL = 52; // horizontal step between in-order positions
const FILA = 76;
const MARGEN = 18;
const VAR_W = 48;
const VAR_H = 30;
const LETRA = 8.4;
const NODO = 'Nodo';
const ARBOL = 'Arbol';

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

interface Lay {
  nodos: Record<number, Pt>;
  vars: VarL[];
  arboles: (Pt & { id: number })[];
  grupos: { x: number; y: number; texto: string; fun: boolean }[];
  /** Variables that point to each node, as tags. */
  etiquetas: Record<number, { nombre: string; marco: number; valor: Valor; clave: string }[]>;
  ancho: number;
  alto: number;
}

const ARBOL_W = 132;
const ARBOL_H = 64;

const idObj = (v: Valor | undefined): number | null => (v && v.k === 'ref' && (v.r.k === 'obj' || v.r.k === 'campo') ? v.r.id : null);
const anchoVar = (n: string) => Math.max(VAR_W, n.length * LETRA + 6) + 16;

function calcular(m: Memoria): Lay {
  const esNodo = (id: number | null): id is number => id !== null && m.objetos[id]?.tipo === NODO;
  const hijos = (id: number) => [idObj(m.objetos[id].campos.izquierda as Valor), idObj(m.objetos[id].campos.derecha as Valor)];
  const nodoIds = Object.values(m.objetos)
    .filter((o) => o.tipo === NODO)
    .map((o) => o.id)
    .sort((a, b) => a - b);
  const arbolObjs = Object.values(m.objetos)
    .filter((o) => o.tipo === ARBOL)
    .sort((a, b) => a.id - b.id);

  // ------------------------------------------------ variables visibles: main y la llamada en curso
  const marcosVisibles = m.marcos.length > 1 ? [0, m.marcos.length - 1] : [0];
  const todas: VarL[] = [];
  for (const i of marcosVisibles)
    for (const v of m.marcos[i].vars) todas.push({ clave: `${i}:${v.nombre}`, nombre: v.nombre, marco: i, valor: v.valor, x: 0, y: 0 });
  const aNodo = (v: Valor) => {
    const id = idObj(v);
    return esNodo(id) ? id : null;
  };

  // ------------------------------------------------ banda de arriba: variables y el struct Arbol
  const vars: VarL[] = [];
  const grupos: Lay['grupos'] = [];
  const arboles: Lay['arboles'] = [];
  const hayFuncion = marcosVisibles.length > 1;
  const yBanda = MARGEN + 18 + (hayFuncion ? 16 : 0);
  let x = MARGEN;
  const colocados = new Set<number>();
  const ponerArbol = (id: number) => {
    if (colocados.has(id)) return;
    colocados.add(id);
    arboles.push({ id, x: x + 10, y: yBanda - 20 });
    x += ARBOL_W + 40;
  };
  const banda = (marco: number) => {
    const lista = todas.filter((v) => v.marco === marco && aNodo(v.valor) === null);
    if (!lista.length) return;
    if (hayFuncion) grupos.push({ x, y: MARGEN + 4, texto: marco === 0 ? 'en main' : `en ${m.marcos[marco].funcion}`, fun: marco > 0 });
    for (const v of lista) {
      vars.push({ ...v, x, y: yBanda });
      x += anchoVar(v.nombre);
      const a = idObj(v.valor);
      if (a !== null && m.objetos[a]?.tipo === ARBOL) {
        x += 16;
        ponerArbol(a);
      }
    }
    x += 18;
  };
  banda(0);
  if (hayFuncion) banda(marcosVisibles[1]);
  for (const a of arbolObjs) ponerArbol(a.id);
  const hayBanda = vars.length > 0 || arboles.length > 0;
  const altoBanda = hayBanda ? Math.max(arboles.length ? yBanda - 20 + ARBOL_H : 0, yBanda + VAR_H) : MARGEN;

  // ------------------------------------------------ bosque: columnas en inorden y filas por nivel
  const col: Record<number, number> = {};
  const nivel: Record<number, number> = {};
  let siguiente = 0;
  const visitar = (id: number | null, d: number) => {
    if (!esNodo(id) || col[id] !== undefined) return;
    col[id] = -1; // en curso: corta los ciclos
    nivel[id] = d;
    const [i, r] = hijos(id);
    visitar(i, d + 1);
    col[id] = siguiente++;
    visitar(r, d + 1);
  };
  const arbol = (id: number | null) => {
    if (!esNodo(id) || col[id] !== undefined) return;
    if (siguiente > 0) siguiente++; // a gap between trees
    visitar(id, 0);
  };
  for (const a of arbolObjs) arbol(idObj(a.campos.raiz as Valor));
  for (const v of m.marcos[0].vars) arbol(aNodo(v.valor));
  // the rest: first the ones no other loose node points to
  const sueltos = () => nodoIds.filter((id) => col[id] === undefined);
  const apuntados = new Set(sueltos().flatMap((id) => hijos(id).filter((h): h is number => h !== null)));
  for (const id of sueltos()) if (!apuntados.has(id)) arbol(id);
  for (const id of sueltos()) arbol(id);

  const yArbol = altoBanda + (hayBanda ? 64 : 34);
  const nodos: Lay['nodos'] = {};
  let ancho = x;
  let alto = yArbol;
  for (const id of nodoIds) {
    nodos[id] = { x: MARGEN + 34 + col[id] * COL, y: yArbol + nivel[id] * FILA };
    ancho = Math.max(ancho, nodos[id].x + NW + MARGEN);
    alto = Math.max(alto, nodos[id].y + NH + 34);
  }

  const etiquetas: Lay['etiquetas'] = {};
  for (const v of todas) {
    const id = aNodo(v.valor);
    if (id !== null) (etiquetas[id] ??= []).push({ nombre: v.nombre, marco: v.marco, valor: v.valor, clave: v.clave });
  }
  return { nodos, vars, arboles, grupos, etiquetas, ancho: Math.max(ancho, 320), alto: Math.max(alto, altoBanda + 30) };
}

// ---------------------------------------------------------------- animation

function interpolar(a: Lay | null, b: Lay, k: number): Lay {
  if (!a || k >= 1) return b;
  const l = (p: number, q: number) => p + (q - p) * k;
  const nodos: Lay['nodos'] = {};
  for (const [id, n] of Object.entries(b.nodos)) {
    const o = a.nodos[Number(id)];
    nodos[Number(id)] = o ? { x: l(o.x, n.x), y: l(o.y, n.y) } : n;
  }
  return { ...b, nodos };
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
    /* nada */
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

// ---------------------------------------------------------------- the calls in progress

/** «preOrden(8)»: the function with its first argument, read as the value of its node. */
function llamadaTexto(m: Memoria, i: number): string {
  const mc = m.marcos[i];
  const a = mc.vars[0];
  let arg = '';
  if (a) {
    const v = a.valor;
    const id = idObj(v);
    if (id !== null && m.objetos[id]?.tipo === NODO) {
      const d = m.objetos[id].campos.valor as Valor;
      arg = d.k === 'int' ? String(d.v) : '?';
    } else if (id !== null) arg = a.nombre;
    else if (v.k === 'nulo') arg = 'NULL';
    else if (v.k === 'int') arg = String(v.v);
    else arg = '?';
  }
  return `${mc.funcion}(${arg})`;
}

export function pilaLlamadas(m: Memoria): string[] {
  return m.marcos.slice(1).map((_, k) => llamadaTexto(m, k + 1));
}

// ---------------------------------------------------------------- component

type Tono = 'tinta' | 'rojo' | 'gris' | 'fuga';
interface Flecha {
  d: string;
  tono: Tono;
  clave: string;
  disc?: boolean;
}

export function DibujoArbol({ mem, prev, titulo, compacto = false }: { mem: Memoria; prev?: Memoria; titulo?: string; compacto?: boolean }) {
  const uid = useId().replace(/:/g, '');
  const destino = useMemo(() => calcular(mem), [mem]);
  const L = useTransicion(destino);
  const vivos = alcanzables(
    mem,
    mem.marcos.map((_, i) => i),
  );

  // nodes the calls are working on: the first argument of each frame
  const enCurso = new Map<number, 'actual' | 'pila'>();
  mem.marcos.forEach((mc, i) => {
    if (i === 0) return;
    const id = idObj(mc.vars[0]?.valor);
    if (id !== null && mem.objetos[id]?.tipo === NODO) enCurso.set(id, i === mem.marcos.length - 1 ? 'actual' : enCurso.get(id) === 'actual' ? 'actual' : 'pila');
  });

  const flechas: Flecha[] = [];
  const nulos: { x: number; y: number; tono: Tono; clave: string }[] = [];
  const objPrev = (id: number) => prev?.objetos[id];
  const campoPrev = (id: number, c: string): Valor | undefined => {
    if (!prev) return undefined;
    const o = objPrev(id);
    return o ? (o.campos[c] as Valor) : { k: 'basura' };
  };

  /** Arrival point of a pointer: the top of a node or the side of the Arbol struct. */
  const destinoDe = (v: Valor, desde: Pt): Pt | null => {
    const id = idObj(v);
    if (id === null) return null;
    const n = L.nodos[id];
    if (n) return { x: n.x + NW / 2, y: n.y - 2 };
    const a = L.arboles.find((t) => t.id === id);
    if (a) return desde.x < a.x ? { x: a.x - 2, y: a.y + 18 } : { x: a.x + ARBOL_W + 2, y: a.y + 18 };
    return null;
  };
  const camino = (s: Pt, t: Pt, hijo: boolean): string => {
    if (hijo && t.y > s.y + 20) return `M${s.x} ${s.y} L${t.x} ${t.y}`;
    if (Math.abs(t.y - s.y) < 30 && !hijo) {
      const dx = (t.x - s.x) / 2;
      return `M${s.x} ${s.y} C${s.x + dx} ${s.y} ${t.x - dx} ${t.y} ${t.x} ${t.y}`;
    }
    const dy = Math.max(30, Math.abs(t.y - s.y) / 2);
    return `M${s.x} ${s.y} C${s.x} ${s.y + dy} ${t.x} ${t.y - dy} ${t.x} ${t.y}`;
  };
  function puntero(clave: string, s: Pt, v: Valor, antes: Valor | undefined, muerto: boolean, hijo: boolean) {
    const cambia = antes !== undefined && !mismoValor(antes, v);
    const tono: Tono = muerto ? 'gris' : cambia ? 'rojo' : 'tinta';
    const dibujar = (val: Valor, tn: Tono, k: string, disc: boolean) => {
      const t = destinoDe(val, s);
      if (t) flechas.push({ d: camino(s, t, hijo), tono: tn, clave: k, disc });
    };
    if (v.k === 'ref') dibujar(v, tono, clave, muerto);
    else if (v.k === 'nulo' && hijo) nulos.push({ x: s.x, y: s.y, tono, clave });
    if (cambia && antes && antes.k === 'ref') dibujar(antes, 'gris', clave + '-viejo', true);
  }

  for (const v of L.vars) {
    if (v.valor.k !== 'ref') continue;
    const antes = prev ? (prev.marcos[v.marco]?.vars.find((x) => x.nombre === v.nombre)?.valor ?? { k: 'basura' }) : undefined;
    puntero(`v${v.clave}`, { x: v.x + VAR_W / 2, y: v.y + VAR_H / 2 }, v.valor, antes as Valor | undefined, false, false);
  }
  for (const a of L.arboles) {
    const o = mem.objetos[a.id];
    puntero(`a${a.id}`, { x: a.x + 62 + VAR_W / 2, y: a.y + 30 + VAR_H / 2 }, o.campos.raiz as Valor, campoPrev(a.id, 'raiz'), o.liberado, false);
  }
  for (const [ids, n] of Object.entries(L.nodos)) {
    const id = Number(ids);
    const o = mem.objetos[id];
    puntero(`i${id}`, { x: n.x + CW / 2, y: n.y + NH / 2 }, o.campos.izquierda as Valor, campoPrev(id, 'izquierda'), o.liberado, true);
    puntero(`d${id}`, { x: n.x + NW - CW / 2, y: n.y + NH / 2 }, o.campos.derecha as Valor, campoPrev(id, 'derecha'), o.liberado, true);
  }

  const llamadas = pilaLlamadas(mem);
  const tonos: Tono[] = ['tinta', 'rojo', 'gris', 'fuga'];
  return (
    <div className="dibujo-arbol">
      {!compacto && llamadas.length > 0 && (
        <p className="pila-llamadas" aria-label="Llamadas en curso">
          <span className="pila-etiqueta">Llamadas</span>
          {(llamadas.length > 6 ? [...llamadas.slice(0, 2), '…', ...llamadas.slice(-3)] : llamadas).map((t, i, xs) => (
            <span key={i} className={i === xs.length - 1 ? 'en-curso' : ''}>
              {t}
            </span>
          ))}
        </p>
      )}
      <svg className="dibujo" viewBox={`0 0 ${L.ancho} ${L.alto}`} style={{ maxWidth: L.ancho * 1.25 }} role="img" aria-label={titulo ?? 'Memoria: árbol binario'}>
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

        {/* the Arbol structs */}
        {L.arboles.map((a) => {
          const o = mem.objetos[a.id];
          const v = o.campos.raiz as Valor;
          const antes = campoPrev(a.id, 'raiz');
          return (
            <g key={`a${a.id}`} className="record">
              <rect x={a.x} y={a.y} width={ARBOL_W} height={ARBOL_H} rx={10} className={`record-caja ${o.liberado ? 'liberada' : ''}`} />
              <text x={a.x + 12} y={a.y + 19} className="record-titulo">
                Arbol
              </text>
              <text x={a.x + 12} y={a.y + 51} className="campo-nombre">
                raiz
              </text>
              <Casilla x={a.x + 62} y={a.y + 30} v={v} cambia={!!prev && antes !== undefined && !mismoValor(antes, v)} />
              {o.liberado && <path d={`M${a.x + 6} ${a.y + 6} L${a.x + ARBOL_W - 6} ${a.y + ARBOL_H - 6} M${a.x + ARBOL_W - 6} ${a.y + 6} L${a.x + 6} ${a.y + ARBOL_H - 6}`} className="aspa" />}
            </g>
          );
        })}

        {flechas.map((f) => (
          <path key={f.clave} d={f.d} className={`fl ${f.tono} ${f.disc ? 'disc' : ''}`} markerEnd={`url(#${uid}-${f.tono})`} />
        ))}

        {Object.entries(L.nodos).map(([ids, n]) => {
          const id = Number(ids);
          const o = mem.objetos[id];
          const po = objPrev(id);
          const nuevo = prev && !po;
          const fuga = o.heap && !o.liberado && !vivos.has(id);
          const val = o.campos.valor as Valor;
          const cambiaVal = po && !mismoValor(po.campos.valor as Valor, val);
          const celda = (x0: number, v: Valor, clave: string) => {
            const nulo = nulos.find((q) => q.clave === clave);
            if (v.k === 'basura')
              return (
                <text x={x0 + CW / 2} y={23} className="dato peque">
                  ?
                </text>
              );
            if (v.k === 'nulo') return <path d={`M${x0 + CW - 5} 5 L${x0 + 5} ${NH - 5}`} className={`nulo-barra ${nulo?.tono ?? ''}`} />;
            return <circle cx={x0 + CW / 2} cy={NH / 2} r={3.4} className="punto" />;
          };
          const marca = enCurso.get(id);
          return (
            <g key={`n${id}`} className={`nodo ${o.liberado ? 'liberado' : ''} ${nuevo ? 'nuevo' : ''} ${fuga ? 'fuga' : ''} ${marca ? `llamada-${marca}` : ''}`} transform={`translate(${n.x} ${n.y})`}>
              <rect width={CW} height={NH} rx={5} className="caja" />
              <rect x={CW} width={NW - 2 * CW} height={NH} rx={5} className="caja caja-valor" />
              <rect x={NW - CW} width={CW} height={NH} rx={5} className="caja" />
              <text x={NW / 2} y={23} className={`dato ${cambiaVal ? 'rojo' : ''}`}>
                {val.k === 'int' ? val.v : '?'}
              </text>
              {celda(0, o.campos.izquierda as Valor, `i${id}`)}
              {celda(NW - CW, o.campos.derecha as Valor, `d${id}`)}
              {o.liberado && <path d={`M4 4 L${NW - 4} ${NH - 4} M${NW - 4} 4 L4 ${NH - 4}`} className="aspa" />}
              {o.liberado && (
                <text x={NW / 2} y={NH + 14} className="nota-nodo">
                  liberado{o.liberadoEn ? ` (línea ${o.liberadoEn})` : ''}
                </text>
              )}
              {fuga && (
                <text x={NW / 2} y={NH + 14} className="nota-nodo fuga">
                  nadie lo apunta: fuga
                </text>
              )}
            </g>
          );
        })}

        {/* tags of the variables that point to nodes */}
        {Object.entries(L.etiquetas).map(([ids, et]) => {
          const n = L.nodos[Number(ids)];
          if (!n) return null;
          const xa = n.x + 14;
          return (
            <g key={`e${ids}`}>
              <path d={`M${xa} ${n.y - 20} V${n.y - 3}`} className="fl tinta" markerEnd={`url(#${uid}-tinta)`} />
              <text x={xa - 5} y={n.y - 7} className="etiqueta-var" textAnchor="end">
                {et.map((e, k) => {
                  const antes = prev?.marcos[e.marco]?.vars.find((x) => x.nombre === e.nombre)?.valor;
                  const cambia = !!prev && (!antes || !mismoValor(antes, e.valor));
                  return (
                    <tspan key={e.clave} className={`${e.marco > 0 ? 'local' : ''} ${cambia ? 'rojo' : ''}`}>
                      {k > 0 ? ', ' : ''}
                      {e.nombre}
                    </tspan>
                  );
                })}
              </text>
            </g>
          );
        })}

        {L.vars.map((v) => {
          const antes = prev?.marcos[v.marco]?.vars.find((x) => x.nombre === v.nombre)?.valor;
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
        {!Object.keys(L.nodos).length && (
          <text x={MARGEN + 34} y={L.alto - 14} className="nota-nodo" textAnchor="start" style={{ textAnchor: 'start' }}>
            Árbol vacío: no hay nodos
          </text>
        )}
      </svg>
      {mem.salida !== undefined && (
        <p className="salida-printf">
          <span className="pila-etiqueta">Salida</span>
          <code className={prev && prev.salida !== mem.salida ? 'cambia' : ''}>{mem.salida || ' '}</code>
        </p>
      )}
    </div>
  );
}

function Casilla({ x, y, v, cambia }: { x: number; y: number; v: Valor; cambia: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={VAR_W} height={VAR_H} rx={5} className={`casilla ${cambia ? 'cambia' : ''}`} />
      {v.k === 'ref' ? (
        <circle cx={x + VAR_W / 2} cy={y + VAR_H / 2} r={3.6} className={`punto ${cambia ? 'rojo' : ''}`} />
      ) : (
        <text x={x + VAR_W / 2} y={y + 20} className={`casilla-v ${v.k === 'nulo' ? 'peque' : ''} ${cambia ? 'rojo' : ''}`}>
          {v.k === 'int' ? v.v : v.k === 'nulo' ? 'NULL' : '?'}
        </text>
      )}
    </g>
  );
}
