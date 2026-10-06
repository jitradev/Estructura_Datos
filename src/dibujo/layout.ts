// Dónde va cada cosa en el dibujo. Los nodos se colocan en filas siguiendo las
// cadenas de siguiente desde las variables (como se dibuja en la pizarra); las variables
// que apuntan a un nodo van justo encima de él; el resto de variables y los structs
// (la pila, la cola) van en una banda arriba.

import { campoDato, Contexto, esNodo, Memoria, Objeto, structDe, Valor } from '../memoria/modelo';

export const G = {
  datoW: 46,
  ptrW: 34,
  nodoH: 42,
  hueco: 58, // entre nodos de una fila
  varW: 48,
  varH: 32,
  carril: 74, // espacio para variables encima de cada fila
  bajo: 40, // espacio debajo de cada fila
  margen: 20,
  celdaW: 44,
  celdaH: 38,
  etiquetaCampo: 70,
  letra: 8.4, // ancho aproximado de un carácter mono a 14 px
};

export const anchoNodo = () => G.datoW + G.ptrW;

export interface NodoL {
  id: number;
  x: number;
  y: number;
  fila: number;
  col: number;
}

export interface VarL {
  clave: string; // «marco:nombre»
  nombre: string;
  marco: number;
  funcion: string;
  x: number;
  y: number; // arriba de la caja (la etiqueta va encima)
  w: number;
  valor: Valor;
}

export interface CampoL {
  nombre: string;
  y: number; // relativo al struct
  h: number;
  array: boolean;
}

export interface RecordL {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  campos: CampoL[];
}

export interface Layout {
  grupos: { x: number; y: number; texto: string; funcion: boolean }[];
  nodos: Record<number, NodoL>;
  vars: VarL[];
  records: Record<number, RecordL>;
  ancho: number;
  alto: number;
}

const refObj = (v: Valor | undefined) => (v && v.k === 'ref' && v.r.k === 'obj' ? v.r.id : null);

export function calcularLayout(m: Memoria, ctx: Contexto): Layout {
  const nodoIds = new Set(Object.values(m.objetos).filter((o) => esNodo(ctx, o.tipo)).map((o) => o.id));
  const esN = (id: number | null): id is number => id !== null && nodoIds.has(id);

  // ------------------------------------------------ variables y structs, en orden
  const todas: { marco: number; nombre: string; valor: Valor; funcion: string }[] = [];
  m.marcos.forEach((mc, i) => mc.vars.forEach((v) => todas.push({ marco: i, nombre: v.nombre, valor: v.valor, funcion: mc.funcion })));

  const recordIds: number[] = [];
  const verRecord = (id: number | null) => {
    if (id !== null && !nodoIds.has(id) && !recordIds.includes(id)) recordIds.push(id);
  };
  todas.forEach((v) => verRecord(refObj(v.valor)));
  Object.values(m.objetos).forEach((o) => !nodoIds.has(o.id) && verRecord(o.id));

  // raíces de cadenas: variables que apuntan a nodos y campos puntero de los structs
  const raices: number[] = [];
  const empujar = (id: number | null) => {
    if (esN(id)) raices.push(id);
  };
  todas.filter((v) => v.marco === 0).forEach((v) => empujar(refObj(v.valor)));
  for (const rid of recordIds) {
    const o = m.objetos[rid];
    for (const c of Object.values(o.campos)) if (!Array.isArray(c)) empujar(refObj(c));
  }
  todas.filter((v) => v.marco > 0).forEach((v) => {
    empujar(refObj(v.valor));
    const r = v.valor.k === 'ref' && v.valor.r.k === 'campo' ? v.valor.r.id : null;
    empujar(r);
  });
  // punteros dobles a un campo siguiente
  todas.forEach((v) => empujar(v.valor.k === 'ref' && v.valor.r.k === 'campo' ? v.valor.r.id : null));
  // y los que no alcanza nadie, en orden de creación
  [...nodoIds].sort((a, b) => a - b).forEach((id) => raices.push(id));

  // ------------------------------------------------ filas
  const pos: Record<number, { fila: number; col: number }> = {};
  const filas: number[][] = [];
  for (const r of raices) {
    if (pos[r]) continue;
    const fila = filas.length;
    const cadena: number[] = [];
    let id: number | null = r;
    while (esN(id) && !pos[id]) {
      pos[id] = { fila, col: cadena.length };
      cadena.push(id);
      id = refObj(m.objetos[id].campos.siguiente as Valor);
    }
    filas.push(cadena);
    // si la cadena desemboca en un nodo ya colocado, se acerca a él
    if (esN(id) && pos[id] && pos[id].fila !== fila) {
      const desp = pos[id].col - cadena.length;
      cadena.forEach((n) => (pos[n].col += desp));
    }
  }
  const minCol = Math.min(0, ...Object.values(pos).map((p) => p.col));
  Object.values(pos).forEach((p) => (p.col -= minCol));

  // ------------------------------------------------ banda de arriba: variables sueltas y structs
  const vars: VarL[] = [];
  const anchoVar = (n: string) => Math.max(G.varW, n.length * G.letra + 6) + 16;
  const apuntaANodo = (v: Valor) => esN(refObj(v)) || (v.k === 'ref' && v.r.k === 'campo' && nodoIds.has(v.r.id));

  const hayMarcos = m.marcos.length > 1;
  const grupos: Layout['grupos'] = [];
  let x = G.margen;
  const yBanda = G.margen + 18 + (hayMarcos ? 18 : 0); // deja sitio a la etiqueta (y al nombre del marco)
  let altoBanda = 0;
  const records: Record<number, RecordL> = {};
  for (const rid of recordIds) {
    const o = m.objetos[rid];
    const s = structDe(ctx, o.tipo)!;
    const campos: CampoL[] = [];
    let y = 30;
    let wMax = 0;
    for (const c of s.campos) {
      const h = c.arr ? G.celdaH + 16 + 36 : G.varH + 8;
      campos.push({ nombre: c.nombre, y, h, array: !!c.arr });
      y += h + 6;
      wMax = Math.max(wMax, c.arr ? c.arr * G.celdaW : G.varW);
    }
    const w = G.etiquetaCampo + wMax + 24;
    records[rid] = { id: rid, x, y: G.margen, w, h: y + 6, campos };
    x += w + 36;
    altoBanda = Math.max(altoBanda, y + 6);
  }
  let marcoActual = -1;
  for (const v of todas) {
    if (apuntaANodo(v.valor)) continue;
    if (hayMarcos && v.marco !== marcoActual) {
      if (marcoActual >= 0) x += 18;
      grupos.push({ x, y: G.margen + 4, texto: v.marco === 0 ? 'en main' : `en ${v.funcion}`, funcion: v.marco > 0 });
      marcoActual = v.marco;
    }
    const w = anchoVar(v.nombre);
    vars.push({ clave: `${v.marco}:${v.nombre}`, nombre: v.nombre, marco: v.marco, funcion: v.funcion, x, y: yBanda, w: G.varW, valor: v.valor });
    x += w;
    altoBanda = Math.max(altoBanda, yBanda - G.margen + G.varH);
  }
  let anchoTotal = x;

  // ------------------------------------------------ nodos y carriles
  const y0 = G.margen + (altoBanda ? altoBanda + 30 : 0);
  const pasoFila = G.carril + G.nodoH + G.bajo;
  const nodos: Record<number, NodoL> = {};
  const x0 = G.margen + 10;
  for (const [id, p] of Object.entries(pos)) {
    nodos[Number(id)] = { id: Number(id), fila: p.fila, col: p.col, x: x0 + p.col * (anchoNodo() + G.hueco), y: y0 + G.carril + p.fila * pasoFila };
  }

  // variables que apuntan a nodos: en el carril de encima de su nodo
  const porFila: Record<number, { v: (typeof todas)[number]; deseada: number }[]> = {};
  for (const v of todas) {
    if (!apuntaANodo(v.valor)) continue;
    const r = (v.valor as { r: { k: string; id: number } }).r;
    const n = nodos[r.id];
    const deseada = r.k === 'campo' ? n.x + G.datoW + G.ptrW / 2 - G.varW / 2 + 22 : n.x - 4;
    (porFila[n.fila] ??= []).push({ v, deseada });
  }
  for (const [fila, lista] of Object.entries(porFila)) {
    lista.sort((a, b) => a.deseada - b.deseada);
    let libre = -Infinity;
    const y = y0 + Number(fila) * pasoFila + 18;
    for (const { v, deseada } of lista) {
      const xv = Math.max(deseada, libre, G.margen);
      vars.push({ clave: `${v.marco}:${v.nombre}`, nombre: v.nombre, marco: v.marco, funcion: v.funcion, x: xv, y, w: G.varW, valor: v.valor });
      libre = xv + anchoVar(v.nombre);
    }
    anchoTotal = Math.max(anchoTotal, libre);
  }

  const nFilas = filas.filter((f) => f.length).length;
  for (const n of Object.values(nodos)) anchoTotal = Math.max(anchoTotal, n.x + anchoNodo() + 90);
  const alto = nFilas ? y0 + nFilas * pasoFila : y0 + 10;
  return { grupos, nodos, vars, records, ancho: Math.max(anchoTotal + G.margen, 320), alto: Math.max(alto, 140) };
}

/** Texto del dato de un nodo. */
export function datoDe(o: Objeto, ctx: Contexto): string {
  const d = campoDato(ctx, o.tipo);
  const v = d ? (o.campos[d] as Valor) : undefined;
  return v?.k === 'int' ? String(v.v) : '?';
}
