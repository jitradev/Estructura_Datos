// Bars view of a sorting step, animated like VisuAlgo: each value is a bar whose
// height is the value, bars slide to their new place on a swap or shift, and the
// colours say what happens in the step (compared, changed, final place).
// Plain HTML with CSS transitions, so movement and height changes are smooth.

import { CSSProperties } from 'react';
import { Paso } from './pasos';

const MARCAS_ROJAS = ['i', 'min', 'med', 'pivote', 'x'];

type Estado = 'normal' | 'mirada' | 'cambia' | 'definitiva' | 'descartada';

function estadoDe(p: Paso, k: number, miradas: Set<number>): Estado {
  if (p.cambiadas.includes(k)) return 'cambia';
  if (p.descartadas.includes(k)) return 'descartada';
  if (p.definitivas.includes(k)) return 'definitiva';
  if (miradas.has(k)) return 'mirada';
  return 'normal';
}

interface Props {
  paso: Paso;
  ids: number[];
  mano?: boolean;
  /** Length of the slide and grow animations, in ms. */
  ms: number;
  /** Range of the values in the whole run, so bar heights do not jump between steps. */
  escala: [number, number];
}

export function BarrasAnimadas({ paso, ids, mano = false, ms, escala }: Props) {
  const n = paso.v.length;
  // one gutter column on the left (for marks at -1), n cells, and the hand for insertion sort
  const cols = n + 1 + (mano ? 1.5 : 0);
  const ancho = 100 / cols;
  const [lo, hi] = escala;
  const alto = (x: number) => 8 + ((x - lo) / Math.max(hi - lo, 1)) * 92;
  const izq = (k: number) => `${(k + 1) * ancho}%`;
  const fuera = (k: number) => (paso.rango ? k < paso.rango[0] || k > paso.rango[1] : false);
  const miradas = new Set(Object.values(paso.marcas));
  const estilo = { '--ob-t': `${ms}ms`, '--ob-w': `${ancho}%` } as CSSProperties;

  const porIndice = new Map<number, string[]>();
  for (const [nombre, k] of Object.entries(paso.marcas)) {
    if (!porIndice.has(k)) porIndice.set(k, []);
    porIndice.get(k)!.push(nombre);
  }

  const barra = (key: string | number, k: number, valor: number, estado: Estado, tenue: boolean, xpos?: string) => (
    <div key={key} className={`ob-col ${estado}${tenue ? ' tenue' : ''}`} style={{ left: xpos ?? izq(k) }}>
      <div className="ob-barra" style={{ height: `${alto(valor)}%` }}>
        <span className="ob-valor">{valor}</span>
      </div>
    </div>
  );

  return (
    <div className="ob-escena" style={estilo} role="img" aria-label={`Array: ${paso.v.join(', ')}`}>
      <div className="ob-zona">
        <span className="ob-nombre">v</span>
        {paso.v.map((valor, k) => barra(ids[k], k, valor, estadoDe(paso, k, miradas), fuera(k)))}
        {mano && paso.x !== null && barra('mano', 0, paso.x, 'cambia', false, `${(n + 1.25) * ancho}%`)}
        {mano && (
          <span className="ob-mano" style={{ left: `${(n + 1.25) * ancho}%` }}>
            x
          </span>
        )}
      </div>

      <div className="ob-base">
        {paso.v.map((_, k) => (
          <span key={k} className="ob-indice" style={{ left: izq(k) }}>
            {k}
          </span>
        ))}
        {paso.menores && paso.menores[1] >= paso.menores[0] && (
          <span className="ob-menores" style={{ left: izq(paso.menores[0]), width: `${(paso.menores[1] - paso.menores[0] + 1) * ancho}%` }} />
        )}
        {paso.ordenadas && paso.ordenadas[1] > paso.ordenadas[0] && (
          <span className="ob-llave" style={{ left: izq(paso.ordenadas[0]), width: `${(paso.ordenadas[1] - paso.ordenadas[0] + 1) * ancho}%` }}>
            ordenado entre sí
          </span>
        )}
      </div>

      <div className="ob-marcas">
        {[...porIndice.entries()].map(([k, nombres]) => (
          <span key={nombres.join()} className={`ob-marca${nombres.some((m) => MARCAS_ROJAS.includes(m)) ? ' roja' : ''}`} style={{ left: izq(k) }}>
            <span className="ob-flecha">▲</span>
            {nombres.join(' · ')}
          </span>
        ))}
      </div>

      {paso.aux && (
        <>
          <div className="ob-zona ob-aux">
            <span className="ob-nombre">aux</span>
            {paso.aux.map((valor, k) =>
              valor === null ? (
                <div key={`a${k}`} className="ob-col vacia" style={{ left: izq(k) }}>
                  <div className="ob-barra" />
                </div>
              ) : (
                barra(`a${k}`, k, valor, paso.auxNuevas.includes(k) ? 'cambia' : 'normal', fuera(k))
              ),
            )}
          </div>
          <div className="ob-marcas">
            {Object.entries(paso.marcasAux).map(([nombre, k]) => (
              <span key={nombre} className="ob-marca" style={{ left: izq(k) }}>
                <span className="ob-flecha">▲</span>
                {nombre}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
