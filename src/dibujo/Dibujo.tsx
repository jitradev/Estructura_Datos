// Dibujo de la memoria con el convenio de los decks: en rojo lo que cambia en este
// paso, en gris discontinuo lo que acaba de dejar de valer, el nodo liberado con caja
// discontinua y aspa, y en ámbar los nodos a los que ya no llega nadie (fugas).
// Entre un paso y el siguiente las cajas se deslizan a su nuevo sitio.

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { alcanzables } from '../memoria/comparar';
import { Contexto, Memoria, mismoValor, Ref, Valor } from '../memoria/modelo';
import { anchoNodo, calcularLayout, datoDe, G, Layout } from './layout';

interface Caja {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Punto {
  x: number;
  y: number;
}

// ---------------------------------------------------------------- animación

function interpolar(a: Layout | null, b: Layout, t: number): Layout {
  if (!a || t >= 1) return b;
  const l = (p: number, q: number) => p + (q - p) * t;
  const nodos: Layout['nodos'] = {};
  for (const [id, n] of Object.entries(b.nodos)) {
    const o = a.nodos[Number(id)];
    nodos[Number(id)] = o ? { ...n, x: l(o.x, n.x), y: l(o.y, n.y) } : n;
  }
  const vars = b.vars.map((v) => {
    const o = a.vars.find((x) => x.clave === v.clave);
    return o ? { ...v, x: l(o.x, v.x), y: l(o.y, v.y) } : v;
  });
  const records: Layout['records'] = {};
  for (const [id, r] of Object.entries(b.records)) {
    const o = a.records[Number(id)];
    records[Number(id)] = o ? { ...r, x: l(o.x, r.x), y: l(o.y, r.y) } : r;
  }
  return { grupos: b.grupos, nodos, vars, records, ancho: b.ancho, alto: b.alto };
}

function useTransicion(destino: Layout): Layout {
  const desde = useRef<Layout | null>(null);
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
  const t = reducir ? 1 : Math.min(1, (performance.now() - inicio.current) / 380);
  useEffect(() => {
    if (t >= 1) return;
    const r = requestAnimationFrame(() => setTic((x) => x + 1));
    return () => cancelAnimationFrame(r);
  });
  const suave = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const l = interpolar(desde.current, destino, suave);
  actual.current = l;
  return l;
}

// ---------------------------------------------------------------- geometría

function camino(s: Punto, t: Caja, lado = false, derecha = false): string {
  const cx = t.x + t.w / 2;
  const cy = t.y + t.h / 2;
  const ini = derecha ? `M${s.x} ${s.y} C${s.x + 70} ${s.y}` : '';
  // a una variable o a un struct: se llega por el costado
  if (lado) {
    const ey = Math.max(t.y + 12, Math.min(t.y + t.h - 12, s.y));
    if (s.x < t.x - 6 || s.x > t.x + t.w + 6) {
      const izq = s.x < t.x;
      const ex = izq ? t.x - 3 : t.x + t.w + 3;
      if (!ini && Math.abs(ey - s.y) < 10 && Math.abs(ex - s.x) > 120) {
        // lejos y en la misma banda: por debajo, para no atravesar otras cajas
        const sg = izq ? -1 : 1;
        return `M${s.x} ${s.y} C${s.x} ${s.y + 78} ${ex + sg * 60} ${ey + 50} ${ex} ${ey}`;
      }
      const dx = (ex - s.x) * 0.5;
      return `${ini || `M${s.x} ${s.y} C${s.x + dx} ${s.y}`} ${ex - dx} ${ey} ${ex} ${ey}`;
    }
    // justo encima o debajo: se rodea por la izquierda
    const ex = t.x - 3;
    const ey2 = t.y + t.h / 2;
    return `M${s.x} ${s.y} C${s.x - 70} ${s.y} ${ex - 60} ${ey2} ${ex} ${ey2}`;
  }
  if (!derecha && Math.abs(cy - s.y) < 10) {
    if (t.x > s.x + 4) return `M${s.x} ${s.y} L${t.x - 3} ${cy}`;
    // hacia atrás en la banda de arriba: arco por debajo, para no salirse
    if (t.y < 110) {
      const fin = t.y + t.h + 3;
      return `M${s.x} ${s.y} C${s.x} ${s.y + 58} ${cx} ${fin + 46} ${cx} ${fin}`;
    }
    // hacia atrás en la misma fila (o a sí mismo): arco por encima
    return `M${s.x} ${s.y} C${s.x + 26} ${s.y - 78} ${cx + 10} ${t.y - 70} ${cx} ${t.y - 3}`;
  }
  if (t.y > s.y) {
    const d = Math.max(30, (t.y - s.y) * 0.5);
    return `${ini || `M${s.x} ${s.y} C${s.x} ${s.y + d}`} ${cx} ${t.y - d} ${cx} ${t.y - 3}`;
  }
  const fin = t.y + t.h + 3;
  const d = Math.max(30, (s.y - fin) * 0.5);
  return `${ini || `M${s.x} ${s.y} C${s.x} ${s.y - d}`} ${cx} ${fin + d} ${cx} ${fin}`;
}

type Tono = 'tinta' | 'rojo' | 'gris' | 'fuga';

// ---------------------------------------------------------------- componente

export function Dibujo({ mem, prev, ctx, titulo }: { mem: Memoria; prev?: Memoria; ctx: Contexto; titulo?: string }) {
  const uid = useId().replace(/:/g, '');
  const destino = useMemo(() => calcularLayout(mem, ctx), [mem, ctx]);
  const L = useTransicion(destino);

  const vivos = alcanzables(
    mem,
    mem.marcos.map((_, i) => i),
  );

  // ------------------------------------------------ cajas de destino de cada puntero
  const cajaVar = (clave: string): Caja | null => {
    const v = L.vars.find((x) => x.clave === clave);
    return v ? { x: v.x, y: v.y, w: v.w, h: G.varH } : null;
  };
  const cajaCampo = (id: number, campo: string, i?: number): Caja | null => {
    const n = L.nodos[id];
    if (n) {
      return campo === 'siguiente' ? { x: n.x + G.datoW, y: n.y, w: G.ptrW, h: G.nodoH } : { x: n.x, y: n.y, w: G.datoW, h: G.nodoH };
    }
    const r = L.records[id];
    if (!r) return null;
    const c = r.campos.find((x) => x.nombre === campo);
    if (!c) return null;
    if (c.array) return { x: r.x + G.etiquetaCampo + (i ?? 0) * G.celdaW, y: r.y + c.y, w: G.celdaW, h: G.celdaH };
    return { x: r.x + G.etiquetaCampo, y: r.y + c.y, w: G.varW, h: G.varH };
  };
  const cajaRef = (r: Ref): (Caja & { lado?: boolean }) | null => {
    switch (r.k) {
      case 'obj': {
        const n = L.nodos[r.id];
        if (n) return { x: n.x, y: n.y, w: anchoNodo(), h: G.nodoH };
        const rc = L.records[r.id];
        return rc ? { x: rc.x, y: rc.y, w: rc.w, h: rc.h, lado: true } : null;
      }
      case 'var': {
        const c = cajaVar(`${r.marco}:${r.nombre}`);
        return c ? { ...c, lado: true } : null;
      }
      case 'campo':
        return cajaCampo(r.id, r.campo);
      case 'elem':
        return cajaCampo(r.id, r.campo, r.i);
    }
  };

  const flechas: { d: string; tono: Tono; clave: string; discontinua?: boolean }[] = [];
  const nulos: { x: number; y: number; tono: Tono; clave: string }[] = [];

  /** Flecha desde un punto hasta lo que apunte v; y, si cambió, la flecha vieja en gris. */
  function puntero(clave: string, s: Punto, v: Valor, antes: Valor | undefined, origenMuerto: boolean, enCaja: boolean, derecha = false) {
    const cambia = antes !== undefined && !mismoValor(antes, v);
    const tono: Tono = origenMuerto ? 'gris' : cambia || antes === undefined ? 'rojo' : 'tinta';
    if (v.k === 'ref') {
      const c = cajaRef(v.r);
      if (c) flechas.push({ d: camino(s, c, c.lado, derecha), tono, clave, discontinua: origenMuerto });
    } else if (v.k === 'nulo' && !enCaja) nulos.push({ x: s.x, y: s.y, tono, clave });
    if (cambia && antes && antes.k === 'ref') {
      const c = cajaRef(antes.r);
      if (c) flechas.push({ d: camino(s, c, c.lado, derecha), tono: 'gris', clave: clave + '-viejo', discontinua: true });
    }
  }

  // punteros de las variables
  const varPrev = (marco: number, nombre: string) => prev?.marcos[marco]?.vars.find((x) => x.nombre === nombre)?.valor;
  for (const v of L.vars) {
    if (v.valor.k !== 'ref') continue;
    const antes = prev ? (varPrev(v.marco, v.nombre) ?? ({ k: 'basura' } as Valor)) : v.valor;
    puntero(`v${v.clave}`, { x: v.x + v.w / 2, y: v.y + G.varH / 2 }, v.valor, antes, false, true);
  }
  // siguiente de los nodos
  for (const n of Object.values(L.nodos)) {
    const o = mem.objetos[n.id];
    const sig = o.campos.siguiente as Valor;
    const po = prev?.objetos[n.id];
    const antes = prev ? (po ? (po.campos.siguiente as Valor) : ({ k: 'basura' } as Valor)) : sig;
    puntero(`n${n.id}`, { x: n.x + G.datoW + G.ptrW / 2, y: n.y + G.nodoH / 2 }, sig, antes, o.liberado, false);
  }
  // campos puntero de los structs
  for (const r of Object.values(L.records)) {
    const o = mem.objetos[r.id];
    for (const c of r.campos) {
      const v = o.campos[c.nombre];
      if (Array.isArray(v) || v.k !== 'ref') continue;
      const po = prev?.objetos[r.id];
      const antes = prev ? (po ? (po.campos[c.nombre] as Valor) : undefined) : v;
      puntero(`r${r.id}${c.nombre}`, { x: r.x + G.etiquetaCampo + G.varW - 8, y: r.y + c.y + G.varH / 2 }, v, antes, false, true, true);
    }
  }


  return (
    <svg
      className="dibujo"
      viewBox={`0 0 ${L.ancho} ${L.alto}`}
      style={{ maxWidth: L.ancho * 1.35 }}
      role="img"
      aria-label={titulo ?? 'Estado de la memoria'}
    >
      <defs>
        {(['tinta', 'rojo', 'gris', 'fuga'] as Tono[]).map((t) => (
          <marker key={t} id={`${uid}-${t}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" className={`punta-${t}`} />
          </marker>
        ))}
      </defs>

      {L.grupos.map((g) => (
        <text key={g.texto} x={g.x} y={g.y + 8} className={`grupo-marco ${g.funcion ? 'fun' : ''}`}>
          {g.texto}
        </text>
      ))}

      {/* structs: la pila, la cola */}
      {Object.values(L.records).map((r) => {
        const o = mem.objetos[r.id];
        const po = prev?.objetos[r.id];
        return (
          <g key={`r${r.id}`} className="record">
            <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={10} className="record-caja" />
            <text x={r.x + 12} y={r.y + 19} className="record-titulo">
              {o.nombre ? (
                <>
                  {o.nombre} <tspan className="record-tipo">({o.tipo})</tspan>
                </>
              ) : (
                o.tipo
              )}
            </text>
            {r.campos.map((c) => {
              const v = o.campos[c.nombre];
              const ya = r.x + 8;
              if (Array.isArray(v)) {
                const antes = po?.campos[c.nombre] as Valor[] | undefined;
                const logica = celdasLogicas(o.campos, v.length);
                const marcas = marcasArray(o.campos, v.length);
                return (
                  <g key={c.nombre}>
                    <text x={ya} y={r.y + c.y + 24} className="campo-nombre">
                      {c.nombre}
                    </text>
                    {v.map((x, i) => {
                      const cx = r.x + G.etiquetaCampo + i * G.celdaW;
                      const cambia = antes && !mismoValor(antes[i], x);
                      return (
                        <g key={i}>
                          <rect x={cx} y={r.y + c.y} width={G.celdaW} height={G.celdaH} className={`celda ${cambia ? 'cambia' : ''}`} />
                          <text x={cx + G.celdaW / 2} y={r.y + c.y + 25} className={`celda-v ${logica(i) ? '' : 'obsoleto'} ${cambia ? 'rojo' : ''}`}>
                            {x.k === 'int' ? x.v : ''}
                          </text>
                          <text x={cx + G.celdaW / 2} y={r.y + c.y + G.celdaH + 13} className="celda-i">
                            {i}
                          </text>
                        </g>
                      );
                    })}
                    {marcas.map((mk, j) => {
                      const cx = r.x + G.etiquetaCampo + mk.i * G.celdaW + G.celdaW / 2;
                      const y = r.y + c.y + G.celdaH + 28 + mk.fila * 16;
                      return (
                        <text key={j} x={cx} y={y} className={`marca ${mk.fuera ? 'fuera' : ''}`}>
                          ▲ {mk.nombre}
                        </text>
                      );
                    })}
                  </g>
                );
              }
              const antes = po?.campos[c.nombre] as Valor | undefined;
              const cambia = prev && antes && !mismoValor(antes, v);
              return (
                <g key={c.nombre}>
                  <text x={ya} y={r.y + c.y + 21} className="campo-nombre">
                    {c.nombre}
                  </text>
                  <Casilla x={r.x + G.etiquetaCampo} y={r.y + c.y} v={v} cambia={!!cambia} />
                </g>
              );
            })}
          </g>
        );
      })}

      {/* flechas por debajo de las cajas */}
      {flechas.map((f) => (
        <path key={f.clave} d={f.d} className={`fl ${f.tono} ${f.discontinua ? 'disc' : ''}`} markerEnd={`url(#${uid}-${f.tono})`} />
      ))}
      {nulos.map((n) => (
        <g key={n.clave + 'nulo'}>
          <path d={`M${n.x} ${n.y} H${n.x + 38}`} className={`fl ${n.tono}`} markerEnd={`url(#${uid}-${n.tono})`} />
          <text x={n.x + 44} y={n.y + 5} className={`nulo ${n.tono}`}>
            NULL
          </text>
        </g>
      ))}

      {/* nodos */}
      {Object.values(L.nodos).map((n) => {
        const o = mem.objetos[n.id];
        const po = prev?.objetos[n.id];
        const nuevo = prev && !po;
        const fuga = o.heap && !o.liberado && !vivos.has(o.id);
        const dcampo = Object.keys(o.campos).find((k) => k !== 'siguiente')!;
        const cambiaDato = po && !mismoValor(po.campos[dcampo] as Valor, o.campos[dcampo] as Valor);
        const sig = o.campos.siguiente as Valor;
        const cls = `nodo ${o.liberado ? 'liberado' : ''} ${nuevo ? 'nuevo' : ''} ${fuga ? 'fuga' : ''}`;
        return (
          <g key={`n${n.id}`} className={cls} transform={`translate(${n.x} ${n.y})`}>
            <rect width={G.datoW} height={G.nodoH} rx={5} className="caja" />
            <rect x={G.datoW} width={G.ptrW} height={G.nodoH} rx={5} className="caja" />
            <text x={G.datoW / 2} y={27} className={`dato ${cambiaDato ? 'rojo' : ''}`}>
              {datoDe(o, ctx)}
            </text>
            {sig.k === 'basura' ? (
              <text x={G.datoW + G.ptrW / 2} y={27} className="dato peque">
                ?
              </text>
            ) : (
              <circle cx={G.datoW + G.ptrW / 2} cy={G.nodoH / 2} r={3.6} className="punto" />
            )}
            {o.liberado && <path d={`M4 4 L${anchoNodo() - 4} ${G.nodoH - 4} M${anchoNodo() - 4} 4 L4 ${G.nodoH - 4}`} className="aspa" />}
            {o.liberado && (
              <text x={anchoNodo() / 2} y={G.nodoH + 16} className="nota-nodo">
                liberado{o.liberadoEn ? ` (línea ${o.liberadoEn})` : ''}
              </text>
            )}
            {fuga && (
              <text x={anchoNodo() / 2} y={G.nodoH + 16} className="nota-nodo fuga">
                nadie lo apunta: fuga
              </text>
            )}
          </g>
        );
      })}

      {/* variables */}
      {L.vars.map((v) => {
        const antes = varPrev(v.marco, v.nombre);
        const cambia = prev && (!antes || !mismoValor(antes, v.valor));
        return (
          <g key={v.clave} className={`var ${v.marco > 0 ? 'local' : ''}`}>
            <text x={v.x + v.w / 2} y={v.y - 6} className="var-nombre">
              {v.nombre}
            </text>
            <Casilla x={v.x} y={v.y} v={v.valor} cambia={!!cambia} />
          </g>
        );
      })}
    </svg>
  );
}

function Casilla({ x, y, v, cambia }: { x: number; y: number; v: Valor; cambia: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={G.varW} height={G.varH} rx={5} className={`casilla ${cambia ? 'cambia' : ''}`} />
      {v.k === 'ref' ? (
        <circle cx={x + G.varW / 2} cy={y + G.varH / 2} r={3.6} className={`punto ${cambia ? 'rojo' : ''}`} />
      ) : (
        <text x={x + G.varW / 2} y={y + 21} className={`casilla-v ${v.k === 'nulo' ? 'peque' : ''} ${cambia ? 'rojo' : ''}`}>
          {v.k === 'int' ? v.v : v.k === 'nulo' ? 'NULL' : '?'}
        </text>
      )}
    </g>
  );
}

// ---------------------------------------------------------------- arrays con marcadores

type Campos = Record<string, Valor | Valor[]>;
const ent = (v: Valor | Valor[] | undefined) => (v && !Array.isArray(v) && v.k === 'int' ? v.v : null);

function celdasLogicas(c: Campos, n: number): (i: number) => boolean {
  const cima = ent(c.cima);
  if (cima !== null) return (i) => i <= cima;
  const f = ent(c.frente);
  const k = ent(c.n ?? c.numElementos);
  if (f !== null && k !== null) return (i) => (((i - f) % n) + n) % n < k;
  return () => true;
}

function marcasArray(c: Campos, n: number): { nombre: string; i: number; fila: number; fuera: boolean }[] {
  const res: { nombre: string; i: number; fila: number; fuera: boolean }[] = [];
  const poner = (nombre: string, i: number | null) => {
    if (i === null) return;
    const fila = res.filter((r) => r.i === i).length;
    res.push({ nombre, i, fila, fuera: i < 0 || i >= n });
  };
  poner('cima', ent(c.cima));
  poner('frente', ent(c.frente));
  poner('final', ent(c.final));
  return res;
}
