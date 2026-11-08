// El dibujo de un paso: casillas pegadas con su índice, como en los decks.
// Los colores tienen UN solo significado en todos los algoritmos (ver pasos.ts).

import { Paso } from './pasos';

const W = 56; // ancho de casilla
const H = 48; // alto de casilla
const X0 = 76; // margen izquierdo: deja sitio a una marca en la posición -1
const Y0 = 70; // margen de arriba: las marcas (i, j, min...), en uno o dos pisos

const COL = {
  tinta: '#241a18',
  gris: '#6f605c',
  palo: '#c9bdb8',
  linea: '#e6d6cd',
  hueso: '#fdf7f3',
  zona: '#efdcd1',
  zonaB: '#d6bcae',
  rojo: '#d0363b',
  rosa: '#fbeaea',
};

type Estilo = 'normal' | 'cambia' | 'definitiva' | 'definitivaCambia' | 'descartada' | 'vacia';

function estiloCelda(p: Paso, k: number): Estilo {
  const cambia = p.cambiadas.includes(k);
  const def = p.definitivas.includes(k);
  if (cambia) return def ? 'definitivaCambia' : 'cambia';
  if (p.descartadas.includes(k)) return 'descartada';
  if (def) return 'definitiva';
  return 'normal';
}

function Celda({ x, y, valor, estilo, tenue }: { x: number; y: number; valor: number | null; estilo: Estilo; tenue?: boolean }) {
  let fill = '#fff';
  let stroke = COL.linea;
  let sw = 1.5;
  let color = COL.tinta;
  let dash: string | undefined;
  if (estilo === 'cambia' || estilo === 'definitivaCambia') {
    fill = COL.rosa;
    stroke = COL.rojo;
    sw = 2.5;
    color = COL.rojo;
  } else if (estilo === 'definitiva') {
    fill = COL.zona;
    stroke = COL.zonaB;
  } else if (estilo === 'descartada') {
    stroke = COL.palo;
    color = COL.palo;
    dash = '5 4';
  } else if (estilo === 'vacia') {
    stroke = COL.linea;
  }
  return (
    <g opacity={tenue ? 0.32 : 1} className="ord-celda">
      <rect x={x} y={y} width={W} height={H} style={{ fill, stroke, strokeWidth: sw }} strokeDasharray={dash} />
      {valor !== null && (
        <text x={x + W / 2} y={y + H / 2 + 7} textAnchor="middle" fontSize={20} fill={color} fontWeight={estilo === 'cambia' || estilo === 'definitivaCambia' ? 700 : 500}>
          {valor}
        </text>
      )}
    </g>
  );
}

/** Marcas encima de las casillas: si dos caen en la misma, van juntas. */
function Marcas({ marcas, y, x0, rojas }: { marcas: Record<string, number>; y: number; x0: number; rojas: string[] }) {
  const porIndice = new Map<number, string[]>();
  for (const [nombre, k] of Object.entries(marcas)) {
    if (!porIndice.has(k)) porIndice.set(k, []);
    porIndice.get(k)!.push(nombre);
  }
  // Dos marcas en casillas vecinas no caben a la misma altura: la segunda sube un piso.
  const orden = [...porIndice.keys()].sort((a, b) => a - b);
  const piso = new Map<number, number>();
  orden.forEach((k, t) => {
    const ant = orden[t - 1];
    const ancho = porIndice.get(k)!.join(' · ').length;
    const choca = ant !== undefined && k - ant === 1 && (ancho > 3 || porIndice.get(ant)!.join(' · ').length > 3);
    piso.set(k, choca && piso.get(ant) === 0 ? 1 : 0);
  });
  return (
    <>
      {[...porIndice.entries()].map(([k, nombres]) => {
        const cx = x0 + k * W + W / 2;
        const rojo = nombres.some((n) => rojas.includes(n));
        const c = rojo ? COL.rojo : COL.gris;
        const sube = (piso.get(k) ?? 0) * 20;
        return (
          <g key={k}>
            {sube > 0 && <path d={`M${cx} ${y - 18 - sube} L${cx} ${y - 18}`} stroke={c} strokeWidth={1.5} strokeDasharray="2 3" />}
            <text x={cx} y={y - 24 - sube} textAnchor="middle" fontSize={15} fill={c} fontWeight={600}>
              {nombres.join(' · ')}
            </text>
            <path d={`M${cx} ${y - 18} L${cx} ${y - 7}`} stroke={c} strokeWidth={2} />
            <path d={`M${cx - 5} ${y - 11} L${cx} ${y - 4} L${cx + 5} ${y - 11}`} fill="none" stroke={c} strokeWidth={2} />
          </g>
        );
      })}
    </>
  );
}

const MARCAS_ROJAS = ['i', 'min', 'med', 'pivote', 'x'];

export function Lienzo({ paso, conIndices = true, mano = false }: { paso: Paso; conIndices?: boolean; mano?: boolean }) {
  const n = paso.v.length;
  const conX = mano; // insertion sort reserva sitio para la x aunque en ese paso no haya nada en la mano
  const xBox = X0 + n * W + 46;
  const yAux = Y0 + H + 104;
  const ancho = Math.max(X0 + n * W + (conX ? 46 + W + 40 : 30), 360);
  const alto = paso.aux ? yAux + H + 46 : Y0 + H + 92;
  const tenue = (k: number) => (paso.rango ? k < paso.rango[0] || k > paso.rango[1] : false);
  const cx = (k: number) => X0 + k * W + W / 2;

  return (
    <svg className="ord-lienzo" viewBox={`0 0 ${ancho} ${alto}`} role="img" aria-label={`Array: ${paso.v.join(', ')}`}>
      <text x={X0 - 14} y={Y0 + H / 2 + 6} textAnchor="end" fontSize={16} fill={COL.gris}>
        v
      </text>
      {paso.v.map((val, k) => (
        <Celda key={k} x={X0 + k * W} y={Y0} valor={val} estilo={estiloCelda(paso, k)} tenue={tenue(k)} />
      ))}
      {conIndices &&
        paso.v.map((_, k) => (
          <text key={k} x={cx(k)} y={Y0 + H + 22} textAnchor="middle" fontSize={12} fill={COL.palo}>
            {k}
          </text>
        ))}

      {/* insertion sort: lo ordenado entre sí, con una llave debajo */}
      {paso.ordenadas && paso.ordenadas[1] > paso.ordenadas[0] && (
        <path
          d={`M${X0 + paso.ordenadas[0] * W + 4} ${Y0 + H + 30} l0 6 L${X0 + (paso.ordenadas[1] + 1) * W - 4} ${Y0 + H + 36} l0 -6`}
          fill="none"
          stroke={COL.gris}
          strokeWidth={2}
        />
      )}
      {paso.ordenadas && paso.ordenadas[1] > paso.ordenadas[0] && (
        <text x={(X0 + paso.ordenadas[0] * W + X0 + (paso.ordenadas[1] + 1) * W) / 2} y={Y0 + H + 54} textAnchor="middle" fontSize={12} fill={COL.gris}>
          ordenado entre sí
        </text>
      )}

      {/* quicksort: los que ya son <= pivote, con una raya roja debajo */}
      {paso.menores && paso.menores[1] >= paso.menores[0] && (
        <>
          <rect x={X0 + paso.menores[0] * W + 3} y={Y0 + H + 3} width={(paso.menores[1] - paso.menores[0] + 1) * W - 6} height={5} rx={2} fill={COL.rojo} />
        </>
      )}

      {/* intercambio: arco con punta en los dos extremos, por debajo */}
      {paso.arco && paso.arco[0] !== paso.arco[1] && (() => {
        const [a, b] = paso.arco[0] < paso.arco[1] ? paso.arco : [paso.arco[1], paso.arco[0]];
        const ya = Y0 + H + 28; // por debajo de los índices
        const hondo = 26 + 6 * Math.min(b - a, 5);
        const xa = cx(a);
        const xb = cx(b);
        return (
          <g className="ord-arco">
            <path d={`M${xa} ${ya + 8} C${xa} ${ya + hondo}, ${xb} ${ya + hondo}, ${xb} ${ya + 8}`} fill="none" stroke={COL.rojo} strokeWidth={2.5} />
            <path d={`M${xa - 5} ${ya + 12} L${xa} ${ya + 4} L${xa + 5} ${ya + 12}`} fill={COL.rojo} />
            <path d={`M${xb - 5} ${ya + 12} L${xb} ${ya + 4} L${xb + 5} ${ya + 12}`} fill={COL.rojo} />
          </g>
        );
      })()}

      <Marcas marcas={paso.marcas} y={Y0} x0={X0} rojas={MARCAS_ROJAS} />

      {/* insertion sort: el elemento levantado, en la mano */}
      {paso.x !== null && (
        <>
          <text x={xBox + W / 2} y={Y0 - 10} textAnchor="middle" fontSize={15} fill={COL.rojo} fontWeight={600}>
            x
          </text>
          <Celda x={xBox} y={Y0} valor={paso.x} estilo="cambia" />
        </>
      )}

      {/* merge sort: el array auxiliar */}
      {paso.aux && (
        <>
          <text x={X0 - 14} y={yAux + H / 2 + 6} textAnchor="end" fontSize={16} fill={COL.gris}>
            aux
          </text>
          {paso.aux.map((val, k) => (
            <Celda
              key={k}
              x={X0 + k * W}
              y={yAux}
              valor={val}
              estilo={paso.auxNuevas.includes(k) ? 'cambia' : val === null ? 'vacia' : 'normal'}
              tenue={tenue(k)}
            />
          ))}
          {Object.entries(paso.marcasAux).map(([nombre, k]) => (
            <g key={nombre}>
              <path d={`M${cx(k)} ${yAux + H + 6} L${cx(k)} ${yAux + H + 17}`} stroke={COL.gris} strokeWidth={2} />
              <path d={`M${cx(k) - 5} ${yAux + H + 11} L${cx(k)} ${yAux + H + 4} L${cx(k) + 5} ${yAux + H + 11}`} fill="none" stroke={COL.gris} strokeWidth={2} />
              <text x={cx(k)} y={yAux + H + 34} textAnchor="middle" fontSize={15} fill={COL.gris} fontWeight={600}>
                {nombre}
              </text>
            </g>
          ))}
        </>
      )}
    </svg>
  );
}

/** Barras, para la carrera: con muchos elementos las casillas no caben. */
export function Barras({ paso, alto = 200 }: { paso: Paso; alto?: number }) {
  const n = paso.v.length;
  const max = Math.max(...paso.v, 1);
  const ancho = 600;
  const w = ancho / Math.max(n, 1);
  const mirados = new Set(Object.values(paso.marcas));
  return (
    <svg className="ord-barras" viewBox={`0 0 ${ancho} ${alto}`} preserveAspectRatio="none" role="img" aria-label="Barras">
      {paso.v.map((val, k) => {
        const h = (val / max) * (alto - 6);
        let fill = '#d9c4b9';
        if (paso.definitivas.includes(k)) fill = '#8f7a73';
        if (mirados.has(k)) fill = '#cb591e';
        if (paso.cambiadas.includes(k)) fill = COL.rojo;
        const fuera = paso.rango ? k < paso.rango[0] || k > paso.rango[1] : false;
        return <rect key={k} x={k * w + 0.5} y={alto - h} width={Math.max(w - 1, 1)} height={h} fill={fill} opacity={fuera ? 0.45 : 1} />;
      })}
    </svg>
  );
}
