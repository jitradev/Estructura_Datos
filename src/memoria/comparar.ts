// Comparar memorias «por forma»: dos estados son iguales si, recorriendo desde las
// mismas variables, se llega a los mismos valores con la misma forma, sin importar
// qué id tenga cada nodo. Y describir un estado en texto para los mensajes.

import { campoDato, Contexto, esNodo, Memoria, Objeto, Ref, structDe, Valor } from './modelo';

/** Ids de los objetos a los que se llega desde las variables de los marcos dados. */
export function alcanzables(m: Memoria, marcos: number[]): Set<number> {
  const vistos = new Set<number>();
  const pila: number[] = [];
  const mirar = (v: Valor) => {
    if (v.k !== 'ref') return;
    const id = v.r.k === 'obj' || v.r.k === 'campo' || v.r.k === 'elem' ? v.r.id : null;
    if (id !== null && !vistos.has(id)) {
      vistos.add(id);
      pila.push(id);
    }
  };
  for (const i of marcos) m.marcos[i]?.vars.forEach((v) => mirar(v.valor));
  // los structs locales de main (la pila, la cola) están vivos aunque nadie los apunte
  Object.values(m.objetos).forEach((o) => !o.heap && mirar({ k: 'ref', r: { k: 'obj', id: o.id } }));
  while (pila.length) {
    const o = m.objetos[pila.pop()!];
    if (o.liberado) continue;
    for (const c of Object.values(o.campos)) (Array.isArray(c) ? c : [c]).forEach(mirar);
  }
  return vistos;
}

/** Vista lógica de un struct: en los arrays solo cuenta la parte ocupada. */
function camposLogicos(o: Objeto): [string, Valor | Valor[]][] {
  const c = o.campos;
  const datos = c.datos;
  if (Array.isArray(datos) && !Array.isArray(c.cima) && c.cima && (c.cima as Valor).k === 'int') {
    const cima = (c.cima as { v: number }).v;
    return [
      ['cima', c.cima as Valor],
      ['datos', datos.slice(0, Math.max(0, cima + 1))],
    ];
  }
  if (Array.isArray(datos) && c.frente && c.final && c.n && (c.n as Valor).k === 'int' && (c.frente as Valor).k === 'int') {
    const n = (c.n as { v: number }).v;
    const f = (c.frente as { v: number }).v;
    const en: Valor[] = [];
    for (let i = 0; i < n && i < datos.length; i++) en.push(datos[(f + i) % datos.length]);
    return [
      ['frente', c.frente as Valor],
      ['final', c.final as Valor],
      ['n', c.n as Valor],
      ['en orden', en],
    ];
  }
  return Object.entries(c);
}

/** Serializa lo que se ve desde las variables observadas de main. */
export function huella(m: Memoria, observar: string[]): string {
  const ids = new Map<number, number>();
  const sv = (v: Valor): string => {
    switch (v.k) {
      case 'int':
        return String(v.v);
      case 'nulo':
        return 'NULL';
      case 'basura':
        return '?';
      case 'ref':
        return sr(v.r);
    }
  };
  const so = (id: number): string => {
    if (ids.has(id)) return `#${ids.get(id)}`;
    ids.set(id, ids.size);
    const o = m.objetos[id];
    if (o.liberado) return `LIBERADO#${ids.get(id)}`;
    return `${o.tipo}#${ids.get(id)}{${camposLogicos(o)
      .map(([k, v]) => `${k}:${Array.isArray(v) ? `[${v.map(sv).join(',')}]` : sv(v)}`)
      .join(';')}}`;
  };
  const sr = (r: Ref): string => {
    switch (r.k) {
      case 'obj':
        return so(r.id);
      case 'var':
        return `&${r.marco === 0 ? '' : r.marco + ':'}${r.nombre}`;
      case 'campo':
        return `&${so(r.id)}.${r.campo}`;
      case 'elem':
        return `&${so(r.id)}.${r.campo}[${r.i}]`;
    }
  };
  return observar
    .map((n) => {
      const v = m.marcos[0].vars.find((x) => x.nombre === n);
      return `${n}=${v ? sv(v.valor) : 'NO DECLARADA'}`;
    })
    .join(' | ');
}

// ------------------------------------------------------------------ texto

/** «cab -> 9 -> 3 -> NULL», «p->cima = 2, datos = [4, 1, 8]», «x = 5». */
export function describir(m: Memoria, ctx: Contexto, nombre: string): string {
  const v = m.marcos[0].vars.find((x) => x.nombre === nombre);
  if (!v) return `${nombre} no existe`;
  return describirValor(m, ctx, nombre, v.valor);
}

function cadena(m: Memoria, ctx: Contexto, inicio: Valor): string {
  const partes: string[] = [];
  const vistos = new Set<number>();
  let v = inicio;
  for (let i = 0; i < 12; i++) {
    if (v.k === 'nulo') {
      partes.push('NULL');
      break;
    }
    if (v.k === 'basura') {
      partes.push('?');
      break;
    }
    if (v.k !== 'ref' || v.r.k !== 'obj') {
      partes.push('…');
      break;
    }
    const o = m.objetos[v.r.id];
    const d = campoDato(ctx, o.tipo);
    const dato = d ? (o.campos[d] as Valor) : undefined;
    const t = dato?.k === 'int' ? String(dato.v) : '?';
    if (vistos.has(o.id)) {
      partes.push(`${t} (otra vez: da la vuelta)`);
      break;
    }
    vistos.add(o.id);
    if (o.liberado) {
      partes.push(`${t} (liberado)`);
      break;
    }
    partes.push(t);
    v = o.campos.siguiente as Valor;
  }
  return partes.join(' -> ');
}

function describirValor(m: Memoria, ctx: Contexto, nombre: string, v: Valor): string {
  if (v.k === 'int') return `${nombre} = ${v.v}`;
  if (v.k === 'nulo') return `${nombre} = NULL`;
  if (v.k === 'basura') return `${nombre} sin valor`;
  const r = v.r;
  if (r.k === 'var') return `${nombre} -> &${r.nombre}`;
  if (r.k === 'campo') return `${nombre} -> &(campo ${r.campo})`;
  if (r.k === 'elem') return `${nombre} -> &${r.campo}[${r.i}]`;
  const o = m.objetos[r.id];
  if (esNodo(ctx, o.tipo)) return `${nombre} -> ${cadena(m, ctx, v)}`;
  const s = structDe(ctx, o.tipo)!;
  const partes: string[] = [];
  for (const [k, c] of camposLogicos(o)) {
    if (Array.isArray(c)) partes.push(`${k === 'en orden' ? 'en orden' : `${nombre}->${k}`}: [${c.map((x) => (x.k === 'int' ? x.v : '?')).join(', ')}]`);
    else {
      const def = s.campos.find((x) => x.nombre === k);
      if (def && def.tipo.ptr > 0) partes.push(`${nombre}->${k} -> ${cadena(m, ctx, c)}`);
      else partes.push(`${nombre}->${k} = ${c.k === 'int' ? c.v : '?'}`);
    }
  }
  return partes.join(', ');
}
