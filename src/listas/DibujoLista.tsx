// Dibujo de las cuatro listas del TAD (simple, doble, circular y circular doble) con el
// mismo convenio que el resto de la aplicación: en rojo lo que cambia en este paso, en
// gris discontinuo el enlace que acaba de dejar de valer, el nodo liberado con caja
// discontinua y aspa, y en ámbar lo que ya no alcanza nadie.
//
// Los nodos de la lista van en una fila, en el orden en que se recorren desde el struct
// de la lista. Los que no están en ella (el nuevo antes de engancharlo, el liberado)
// van en una segunda fila debajo, cerca del nodo al que apuntan. En las circulares la
// vuelta se dibuja por debajo (siguiente del último) y por encima (anterior del primero).

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { alcanzables } from '../memoria/comparar';
import { Memoria, mismoValor, Valor } from '../memoria/modelo';
import { TipoLista } from './catalogo';
import { codoLado, codoVertical, tuerce } from '../dibujo/rutas';

// ---------------------------------------------------------------- medidas

const H = 42; // alto del nodo
const VAR_W = 48;
const VAR_H = 32;
const MARGEN = 20;
const LETRA = 8.4;

interface Medidas {
  antW: number;
  valW: number;
  sigW: number;
  w: number;
  hueco: number;
  ySig: number;
  yAnt: number;
}

function medidas(t: TipoLista): Medidas {
  return t.doble
    ? { antW: 30, valW: 46, sigW: 30, w: 106, hueco: 74, ySig: 14, yAnt: 28 }
    : { antW: 0, valW: 46, sigW: 34, w: 80, hueco: 64, ySig: 21, yAnt: 21 };
}

// ---------------------------------------------------------------- layout

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

interface CabL extends Pt {
  id: number;
  w: number;
  h: number;
  campos: { nombre: string; y: number }[];
}

interface Lay {
  nodos: Record<number, Pt & { fila: number }>;
  vars: VarL[];
  cab: CabL | null;
  grupos: { x: number; y: number; texto: string; fun: boolean }[];
  ancho: number;
  alto: number;
}

const idObj = (v: Valor | undefined): number | null => (v && v.k === 'ref' && v.r.k === 'obj' ? v.r.id : null);
const anchoVar = (n: string) => Math.max(VAR_W, n.length * LETRA + 6) + 16;

function calcular(m: Memoria, t: TipoLista, compacto: boolean): Lay {
  const M = medidas(t);
  const colW = M.w + M.hueco;
  const nodoIds = Object.values(m.objetos)
    .filter((o) => o.tipo === t.nodo)
    .map((o) => o.id)
    .sort((a, b) => a - b);
  const esNodo = (id: number | null): id is number => id !== null && m.objetos[id]?.tipo === t.nodo;
  const cabObj = Object.values(m.objetos).find((o) => o.tipo === t.lista) ?? null;

  // ------------------------------------------------ fila de la lista
  const orden: number[] = [];
  if (cabObj) {
    let id = idObj(cabObj.campos[t.extremos[0]] as Valor);
    // en la circular simple el acceso es el último: se empieza por su siguiente
    if (t.id === 'circular' && esNodo(id)) id = idObj(m.objetos[id].campos.siguiente as Valor);
    while (esNodo(id) && !orden.includes(id)) {
      orden.push(id);
      id = idObj(m.objetos[id].campos.siguiente as Valor);
    }
  }
  const col: Record<number, number> = {};
  orden.forEach((id, i) => (col[id] = i));

  // ------------------------------------------------ fila de abajo: lo que no está en la lista
  const sueltos = nodoIds.filter((id) => col[id] === undefined);
  const colAbajo: Record<number, number> = {};
  const deseada = (id: number): number => {
    const o = m.objetos[id];
    const s = idObj(o.campos.siguiente as Valor);
    if (esNodo(s) && col[s] !== undefined) return col[s] - 0.5;
    const a = t.doble ? idObj(o.campos.anterior as Valor) : null;
    if (esNodo(a) && col[a] !== undefined) return col[a] + 0.5;
    return orden.length ? orden.length - 0.5 : 0;
  };
  const conDeseo = sueltos.map((id) => ({ id, d: deseada(id) })).sort((a, b) => a.d - b.d || a.id - b.id);
  let libre = -Infinity;
  for (const { id, d } of conDeseo) {
    const c = Math.max(d, libre);
    colAbajo[id] = c;
    libre = c + 1;
  }
  const minCol = Math.min(0, ...Object.values(colAbajo));

  // ------------------------------------------------ variables que se ven: main y la función en curso
  const marcosVisibles = m.marcos.length > 1 ? [0, m.marcos.length - 1] : [0];
  const todas: VarL[] = [];
  for (const i of marcosVisibles)
    for (const v of m.marcos[i].vars) todas.push({ clave: `${i}:${v.nombre}`, nombre: v.nombre, marco: i, valor: v.valor, x: 0, y: 0 });
  const aNodo = (v: Valor): number | null => {
    if (v.k !== 'ref') return null;
    if (v.r.k === 'obj' && esNodo(v.r.id)) return v.r.id;
    if (v.r.k === 'campo' && esNodo(v.r.id)) return v.r.id;
    return null;
  };

  // ------------------------------------------------ banda de arriba
  const vars: VarL[] = [];
  const grupos: Lay['grupos'] = [];
  const hayFuncion = marcosVisibles.length > 1;
  const yBanda = MARGEN + 18 + (hayFuncion ? 16 : 0);
  let x = MARGEN;
  const banda = (marco: number) => {
    const lista = todas.filter((v) => v.marco === marco && aNodo(v.valor) === null);
    if (!lista.length) return;
    if (hayFuncion) grupos.push({ x, y: MARGEN + 4, texto: marco === 0 ? 'en main' : `en ${m.marcos[marco].funcion}`, fun: marco > 0 });
    for (const v of lista) {
      vars.push({ ...v, x, y: yBanda });
      x += anchoVar(v.nombre);
    }
    x += 18;
  };
  banda(0);
  let cab: CabL | null = null;
  if (cabObj) {
    const campos = t.extremos.map((nombre, i) => ({ nombre, y: 30 + i * 40 }));
    cab = { id: cabObj.id, x: x + 12, y: yBanda - 22, w: 150, h: 30 + t.extremos.length * 40, campos };
    x = cab.x + cab.w + 40;
  }
  if (hayFuncion) banda(marcosVisibles[1]);
  const altoBanda = Math.max(cab ? cab.y + cab.h : 0, yBanda + VAR_H);

  // ------------------------------------------------ nodos
  const x0 = MARGEN + (t.doble ? 64 : 24);
  // hueco para las flechas del struct y, si no es compacto, para las variables de encima
  const yFila = altoBanda + (compacto ? 64 : 116);
  const yAbajo = yFila + H + 50 + 66;
  const nodos: Lay['nodos'] = {};
  for (const id of orden) nodos[id] = { x: x0 + (col[id] - minCol) * colW, y: yFila, fila: 0 };
  for (const id of sueltos) nodos[id] = { x: x0 + (colAbajo[id] - minCol) * colW, y: yAbajo, fila: 1 };

  // variables que apuntan a nodos: encima de su nodo, sin pisarse
  const porFila: Record<number, { v: VarL; d: number }[]> = {};
  for (const v of todas) {
    const id = aNodo(v.valor);
    if (id === null) continue;
    const n = nodos[id];
    const campo = v.valor.k === 'ref' && v.valor.r.k === 'campo';
    const d = campo ? n.x + M.w - M.sigW / 2 - VAR_W / 2 + 18 : n.x + (t.doble ? M.antW - 6 : -4);
    (porFila[n.fila] ??= []).push({ v, d });
  }
  let ancho = x;
  for (const [fila, lista] of Object.entries(porFila)) {
    lista.sort((a, b) => a.d - b.d || a.v.marco - b.v.marco);
    let lib = -Infinity;
    const y = (Number(fila) ? yAbajo : yFila) - 56;
    for (const { v, d } of lista) {
      const xv = Math.max(d, lib, MARGEN);
      vars.push({ ...v, x: xv, y });
      lib = xv + anchoVar(v.nombre);
    }
    ancho = Math.max(ancho, lib);
  }
  for (const n of Object.values(nodos)) ancho = Math.max(ancho, n.x + M.w + 80);
  const alto = (sueltos.length ? yAbajo : yFila) + H + 46;
  return { nodos, vars, cab, grupos, ancho: Math.max(ancho + MARGEN, 360), alto };
}

// ---------------------------------------------------------------- animación

function interpolar(a: Lay | null, b: Lay, k: number): Lay {
  if (!a || k >= 1) return b;
  const l = (p: number, q: number) => p + (q - p) * k;
  const nodos: Lay['nodos'] = {};
  for (const [id, n] of Object.entries(b.nodos)) {
    const o = a.nodos[Number(id)];
    nodos[Number(id)] = o ? { ...n, x: l(o.x, n.x), y: l(o.y, n.y) } : n;
  }
  const vars = b.vars.map((v) => {
    const o = a.vars.find((x) => x.clave === v.clave);
    return o ? { ...v, x: l(o.x, v.x), y: l(o.y, v.y) } : v;
  });
  const cab = b.cab && a.cab ? { ...b.cab, x: l(a.cab.x, b.cab.x), y: l(a.cab.y, b.cab.y) } : b.cab;
  return { ...b, nodos, vars, cab };
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

// ---------------------------------------------------------------- componente

type Tono = 'tinta' | 'rojo' | 'gris' | 'fuga';
interface Flecha {
  d: string;
  tono: Tono;
  clave: string;
  disc?: boolean;
}
interface Nulo extends Pt {
  izq: boolean;
  tono: Tono;
  clave: string;
}

export function DibujoLista({ mem, prev, tipo, titulo, compacto = false }: { mem: Memoria; prev?: Memoria; tipo: TipoLista; titulo?: string; compacto?: boolean }) {
  const uid = useId().replace(/:/g, '');
  const M = medidas(tipo);
  const destino = useMemo(() => calcular(mem, tipo, compacto), [mem, tipo, compacto]);
  const L = useTransicion(destino);
  const vivos = alcanzables(
    mem,
    mem.marcos.map((_, i) => i),
  );

  const flechas: Flecha[] = [];
  const nulos: Nulo[] = [];

  // ------------------------------------------------ a dónde llega cada puntero
  /** Punto de llegada y por dónde se entra: arriba del nodo, por un lado, o a una casilla. */
  type Destino = { p: Pt; lado: 'arriba' | 'izq' | 'der' };
  const destinoNodo = (id: number, desde: 'var' | 'cab' | 'sig' | 'ant', campo?: string, extremo?: string): Destino | null => {
    const n = L.nodos[id];
    if (!n) return null;
    if (campo) {
      // puntero a un campo del nodo (Nodo** referencia = &nodo->siguiente)
      const cx = campo === 'anterior' ? n.x + M.antW / 2 : n.x + M.w - M.sigW / 2;
      return { p: { x: cx, y: n.y - 2 }, lado: 'arriba' };
    }
    if (desde === 'sig') return { p: { x: n.x - 2, y: n.y + M.ySig }, lado: 'izq' };
    if (desde === 'ant') return { p: { x: n.x + M.w + 2, y: n.y + M.yAnt }, lado: 'der' };
    if (desde === 'cab') return { p: { x: extremo === 'cola' ? n.x + M.w - 16 : n.x + 16, y: n.y - 2 }, lado: 'arriba' };
    return { p: { x: n.x + M.antW + M.valW / 2, y: n.y - 2 }, lado: 'arriba' };
  };
  const destinoRef = (v: Valor, desde: 'var' | 'cab' | 'sig' | 'ant', origen: Pt, extremo?: string): Destino | null => {
    if (v.k !== 'ref') return null;
    const r = v.r;
    if (r.k === 'obj') {
      if (L.nodos[r.id]) return destinoNodo(r.id, desde, undefined, extremo);
      const c = L.cab;
      if (c && c.id === r.id) return origen.x < c.x ? { p: { x: c.x - 2, y: c.y + 16 }, lado: 'izq' } : { p: { x: c.x + c.w + 2, y: c.y + 16 }, lado: 'der' };
      return null;
    }
    if (r.k === 'campo') {
      if (L.nodos[r.id]) return destinoNodo(r.id, desde, r.campo);
      const c = L.cab;
      const f = c && c.id === r.id ? c.campos.find((x) => x.nombre === r.campo) : null;
      if (c && f) {
        const cy = c.y + f.y + VAR_H / 2;
        const cx = c.x + 76;
        return origen.x < cx ? { p: { x: cx - 2, y: cy }, lado: 'izq' } : { p: { x: cx + VAR_W + 2, y: cy }, lado: 'der' };
      }
    }
    return null;
  };

  // ------------------------------------------------ caminos
  const fondo = (n: Pt) => n.y + H;
  function camino(s: Pt, d: Destino, desde: 'var' | 'cab' | 'sig' | 'ant', mismoNodo?: Pt, destinoN?: Pt): string {
    const t = d.p;
    if (desde === 'sig' && mismoNodo && destinoN) {
      const misma = Math.abs(mismoNodo.y - destinoN.y) < 4;
      if (misma && destinoN.x > mismoNodo.x + 4 && destinoN.x - mismoNodo.x < M.w + M.hueco + 4) return `M${s.x} ${s.y} L${t.x} ${t.y}`;
      if (misma && destinoN.x <= mismoNodo.x + 4) {
        // vuelta hacia atrás (circular) o a sí mismo: por debajo de la fila
        const yb = fondo(mismoNodo) + 30;
        const sx = mismoNodo.x + M.w;
        return `M${s.x} ${s.y} L${sx + 10} ${s.y} C${sx + 38} ${s.y} ${sx + 38} ${yb} ${sx + 8} ${yb} L${t.x - 20} ${yb} C${t.x - 50} ${yb} ${t.x - 40} ${t.y} ${t.x} ${t.y}`;
      }
      if (misma) {
        // hacia delante saltándose nodos: arco por debajo
        const yb = fondo(mismoNodo) + 16;
        return `M${s.x} ${s.y} C${s.x + 40} ${s.y} ${s.x + 30} ${yb} ${(s.x + t.x) / 2} ${yb} S${t.x - 34} ${t.y} ${t.x} ${t.y}`;
      }
      return `M${s.x} ${s.y} C${s.x + 60} ${s.y} ${t.x - 60} ${t.y} ${t.x} ${t.y}`;
    }
    if (desde === 'ant' && mismoNodo && destinoN) {
      const misma = Math.abs(mismoNodo.y - destinoN.y) < 4;
      if (misma && destinoN.x < mismoNodo.x - 4 && mismoNodo.x - destinoN.x < M.w + M.hueco + 4) return `M${s.x} ${s.y} L${t.x} ${t.y}`;
      if (misma && destinoN.x >= mismoNodo.x - 4) {
        // vuelta hacia delante (circular doble) o a sí mismo: por encima de la fila
        const ya = mismoNodo.y - 24;
        const sx = mismoNodo.x;
        return `M${s.x} ${s.y} L${sx - 10} ${s.y} C${sx - 38} ${s.y} ${sx - 38} ${ya} ${sx - 8} ${ya} L${t.x + 20} ${ya} C${t.x + 50} ${ya} ${t.x + 40} ${t.y} ${t.x} ${t.y}`;
      }
      if (misma) {
        const ya = mismoNodo.y - 12;
        return `M${s.x} ${s.y} C${s.x - 40} ${s.y} ${s.x - 30} ${ya} ${(s.x + t.x) / 2} ${ya} S${t.x + 34} ${t.y} ${t.x} ${t.y}`;
      }
      return `M${s.x} ${s.y} C${s.x - 60} ${s.y} ${t.x + 60} ${t.y} ${t.x} ${t.y}`;
    }
    if (d.lado === 'arriba') {
      if (desde === 'cab') {
        // del struct de la lista: hacia la derecha si el nodo queda a la derecha; si no, hacia abajo
        if (t.x > s.x + 60) return t.y - s.y > 30 ? codoLado(s, t) : `M${s.x} ${s.y} C${s.x + 70} ${s.y} ${t.x} ${t.y - 80} ${t.x} ${t.y}`;
        // the turn just above the nodes, under the struct and its other fields
        if (tuerce(s, t)) return codoVertical(s, t, t.y - 22);
        return `M${s.x} ${s.y} C${s.x} ${s.y + 70} ${t.x} ${t.y - 70} ${t.x} ${t.y}`;
      }
      if (s.y > t.y) {
        // de la fila de abajo a un nodo de arriba
        return `M${s.x} ${s.y} C${s.x} ${s.y + 30} ${t.x - 50} ${t.y - 50} ${t.x} ${t.y}`;
      }
      if (tuerce(s, t)) return codoVertical(s, t);
      const dy = Math.max(18, (t.y - s.y) / 2);
      return `M${s.x} ${s.y} C${s.x} ${s.y + dy} ${t.x} ${t.y - dy} ${t.x} ${t.y}`;
    }
    const dx = (t.x - s.x) / 2;
    return `M${s.x} ${s.y} C${s.x + dx} ${s.y} ${t.x - dx} ${t.y} ${t.x} ${t.y}`;
  }

  /** Flecha (o NULL) de un puntero; si cambió en este paso, roja, y la vieja en gris. */
  function puntero(clave: string, s: Pt, v: Valor, antes: Valor | undefined, desde: 'var' | 'cab' | 'sig' | 'ant', muerto: boolean, nodo?: Pt, extremo?: string) {
    const cambia = antes !== undefined && !mismoValor(antes, v);
    const tono: Tono = muerto ? 'gris' : cambia ? 'rojo' : 'tinta';
    const dibujar = (val: Valor, tn: Tono, k: string, disc: boolean) => {
      const d = destinoRef(val, desde, s, extremo);
      if (!d) return;
      const tid = val.k === 'ref' && val.r.k === 'obj' ? L.nodos[val.r.id] : undefined;
      flechas.push({ d: camino(s, d, desde, nodo, tid), tono: tn, clave: k, disc });
    };
    if (v.k === 'ref') dibujar(v, tono, clave, muerto);
    else if (v.k === 'nulo' && (desde === 'sig' || desde === 'ant')) nulos.push({ x: s.x, y: s.y, izq: desde === 'ant', tono, clave });
    if (cambia && antes && antes.k === 'ref') dibujar(antes, 'gris', clave + '-viejo', true);
  }

  const objPrev = (id: number) => prev?.objetos[id];
  const campoPrev = (id: number, c: string): Valor | undefined => {
    if (!prev) return undefined;
    const o = objPrev(id);
    return o ? (o.campos[c] as Valor) : { k: 'basura' };
  };

  // variables
  for (const v of L.vars) {
    if (v.valor.k !== 'ref') continue;
    const antes = prev ? (prev.marcos[v.marco]?.vars.find((x) => x.nombre === v.nombre)?.valor ?? { k: 'basura' }) : undefined;
    puntero(`v${v.clave}`, { x: v.x + VAR_W / 2, y: v.y + VAR_H / 2 }, v.valor, antes as Valor | undefined, 'var', false);
  }
  // struct de la lista
  if (L.cab) {
    const o = mem.objetos[L.cab.id];
    for (const c of L.cab.campos) {
      const v = o.campos[c.nombre] as Valor;
      puntero(`c${c.nombre}`, { x: L.cab.x + 76 + VAR_W / 2, y: L.cab.y + c.y + VAR_H / 2 }, v, campoPrev(L.cab.id, c.nombre), 'cab', o.liberado, undefined, c.nombre);
    }
  }
  // enlaces de los nodos
  for (const [ids, n] of Object.entries(L.nodos)) {
    const id = Number(ids);
    const o = mem.objetos[id];
    puntero(`s${id}`, { x: n.x + M.w - M.sigW / 2, y: n.y + M.ySig }, o.campos.siguiente as Valor, campoPrev(id, 'siguiente'), 'sig', o.liberado, n);
    if (tipo.doble) puntero(`a${id}`, { x: n.x + M.antW / 2, y: n.y + M.yAnt }, o.campos.anterior as Valor, campoPrev(id, 'anterior'), 'ant', o.liberado, n);
  }

  const tonos: Tono[] = ['tinta', 'rojo', 'gris', 'fuga'];
  return (
    <svg className="dibujo" viewBox={`0 0 ${L.ancho} ${L.alto}`} style={{ maxWidth: L.ancho * 1.3 }} role="img" aria-label={titulo ?? `Memoria: ${tipo.nombre}`}>
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

      {/* el struct de la lista */}
      {L.cab &&
        (() => {
          const c = L.cab;
          const o = mem.objetos[c.id];
          return (
            <g className={`record ${o.liberado ? 'liberado' : ''}`}>
              <rect x={c.x} y={c.y} width={c.w} height={c.h} rx={10} className={`record-caja ${o.liberado ? 'liberada' : ''}`} />
              <text x={c.x + 12} y={c.y + 19} className="record-titulo">
                {tipo.lista}
              </text>
              {c.campos.map((f) => {
                const v = o.campos[f.nombre] as Valor;
                const antes = campoPrev(c.id, f.nombre);
                return (
                  <g key={f.nombre}>
                    <text x={c.x + 12} y={c.y + f.y + 21} className="campo-nombre">
                      {f.nombre}
                    </text>
                    <Casilla x={c.x + 76} y={c.y + f.y} v={v} cambia={!!prev && antes !== undefined && !mismoValor(antes, v)} />
                  </g>
                );
              })}
              {o.liberado && <path d={`M${c.x + 6} ${c.y + 6} L${c.x + c.w - 6} ${c.y + c.h - 6} M${c.x + c.w - 6} ${c.y + 6} L${c.x + 6} ${c.y + c.h - 6}`} className="aspa" />}
            </g>
          );
        })()}

      {/* flechas por debajo de las cajas */}
      {flechas.map((f) => (
        <path key={f.clave} d={f.d} className={`fl ${f.tono} ${f.disc ? 'disc' : ''}`} markerEnd={`url(#${uid}-${f.tono})`} />
      ))}
      {nulos.map((n) => (
        <g key={n.clave + 'nulo'}>
          <path d={n.izq ? `M${n.x} ${n.y} H${n.x - 40}` : `M${n.x} ${n.y} H${n.x + 40}`} className={`fl ${n.tono}`} markerEnd={`url(#${uid}-${n.tono})`} />
          <text x={n.izq ? n.x - 44 : n.x + 44} y={n.y + 4.5} className={`nulo ${n.tono}`} textAnchor={n.izq ? 'end' : 'start'}>
            NULL
          </text>
        </g>
      ))}

      {/* nodos */}
      {Object.entries(L.nodos).map(([ids, n]) => {
        const id = Number(ids);
        const o = mem.objetos[id];
        const po = objPrev(id);
        const nuevo = prev && !po;
        const fuga = o.heap && !o.liberado && !vivos.has(id);
        const val = o.campos.valor as Valor;
        const cambiaVal = po && !mismoValor(po.campos.valor as Valor, val);
        const celdaPtr = (x: number, w: number, v: Valor, y: number) =>
          v.k === 'basura' ? (
            <text x={x + w / 2} y={27} className="dato peque">
              ?
            </text>
          ) : (
            <circle cx={x + w / 2} cy={y} r={3.6} className="punto" />
          );
        return (
          <g key={`n${id}`} className={`nodo ${o.liberado ? 'liberado' : ''} ${nuevo ? 'nuevo' : ''} ${fuga ? 'fuga' : ''}`} transform={`translate(${n.x} ${n.y})`}>
            {tipo.doble && <rect width={M.antW} height={H} rx={5} className="caja" />}
            <rect x={M.antW} width={M.valW} height={H} rx={5} className="caja" />
            <rect x={M.antW + M.valW} width={M.sigW} height={H} rx={5} className="caja" />
            <text x={M.antW + M.valW / 2} y={27} className={`dato ${cambiaVal ? 'rojo' : ''}`}>
              {val.k === 'int' ? val.v : '?'}
            </text>
            {tipo.doble && celdaPtr(0, M.antW, o.campos.anterior as Valor, M.yAnt)}
            {celdaPtr(M.antW + M.valW, M.sigW, o.campos.siguiente as Valor, M.ySig)}
            {o.liberado && <path d={`M4 4 L${M.w - 4} ${H - 4} M${M.w - 4} 4 L4 ${H - 4}`} className="aspa" />}
            {o.liberado && (
              <text x={M.w / 2} y={H + 15} className="nota-nodo">
                liberado{o.liberadoEn ? ` (línea ${o.liberadoEn})` : ''}
              </text>
            )}
            {fuga && (
              <text x={M.w / 2} y={H + 15} className="nota-nodo fuga">
                nadie lo apunta: fuga
              </text>
            )}
          </g>
        );
      })}

      {/* variables */}
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
    </svg>
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
