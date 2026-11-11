import { ReactNode, useMemo, useState } from 'react';
import { codigoAlg, leerNumeros, nombreAlg, QUE_ES_FILA, simularTraza, SimTraza } from '../../ejercicios/traza';
import { EjTraza } from '../../ejercicios/tipos';
import { useBorrador } from '../../progreso';
import { Rico } from '../comun';

interface Avance {
  traza?: boolean;
  cuentas?: boolean;
}

/** Declared outside so that the inputs inside do not remount (and lose focus) on every key. */
function Estado({ n, paso, children }: { n: number; paso: number; children: ReactNode }) {
  return (
    <li className={`paso-fallo ${paso > n ? 'hecho' : paso === n ? 'actual' : 'pendiente'}`}>
      <span className="circulo" aria-hidden>
        {paso > n ? '✓' : n}
      </span>
      <div>{children}</div>
    </li>
  );
}

/** The second count, asked as what the code does. */
const PREGUNTA_MOV: Record<string, string> = {
  intercambios: '¿Cuántas veces llama a intercambiar? También cuenta cuando cambia una casilla consigo misma.',
  desplazamientos: '¿Cuántos desplazamientos (v[j + 1] = v[j]) hace?',
  'copias a aux': '¿Cuántos datos copia a aux, sumando todas las llamadas a fusionar?',
};

const marca = (ok: boolean | undefined) => (ok === undefined ? '' : ok ? 'bien' : 'mal');

/** A row of cells with their index, read only. */
export function FilaArray({ v, cambia = [] }: { v: number[]; cambia?: number[] }) {
  return (
    <div className="fila-celdas" role="img" aria-label={v.join(' ')}>
      {v.map((x, i) => (
        <span key={i} className={`celda-hash ${cambia.includes(i) ? 'borrada' : ''}`}>
          <b>{x}</b>
          <small>{i}</small>
        </span>
      ))}
    </div>
  );
}

function TrazaResuelta({ ej, sim }: { ej: EjTraza; sim: SimTraza }) {
  if (ej.alg === 'binaria')
    return (
      <table className="tabla-traza">
        <thead>
          <tr>
            <th>Vuelta</th>
            <th>ini</th>
            <th>fin</th>
            <th>med</th>
            <th>v[med]</th>
          </tr>
        </thead>
        <tbody>
          {sim.vueltas.map((t, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td className="mono">{t.ini}</td>
              <td className="mono">{t.fin}</td>
              <td className="mono">{t.med}</td>
              <td className="mono">{ej.datos[t.med]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  let antes = ej.datos;
  return (
    <div className="traza-resuelta">
      {sim.filas.map((f, i) => {
        const cambia = f.v.flatMap((x, k) => (x !== antes[k] ? [k] : []));
        antes = f.v;
        return (
          <div key={i} className="fila-traza">
            <code>{f.etiqueta}</code>
            <FilaArray v={f.v} cambia={cambia} />
          </div>
        );
      })}
    </div>
  );
}

export function Traza({ ej, onResuelto }: { ej: EjTraza; onResuelto: () => void }) {
  const [av, setAv] = useBorrador<Avance>(ej.id, 'avance', () => ({}));
  const sim = useMemo(() => simularTraza(ej), [ej]);
  const orden: (keyof Avance)[] = ['traza', ...(ej.cuentas ? ['cuentas' as const] : [])];
  const actual = orden.find((k) => !av[k]);
  const paso = actual ? orden.indexOf(actual) + 1 : orden.length + 1;
  const binaria = ej.alg === 'binaria';
  const n = ej.datos.length;

  const [txt, setTxt] = useState<Record<string, string>>({});
  const [bien, setBien] = useState<Record<string, boolean>>({});
  const [fallos, setFallos] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const val = (k: string) => txt[k] ?? '';
  const poner = (k: string, v: string) => setTxt((t) => ({ ...t, [k]: v }));
  const num = (k: string) => {
    const xs = leerNumeros(val(k));
    return xs.length === 1 ? xs[0] : NaN;
  };

  /** Copies the row above (or the starting array) into row f, to change only what moves. */
  const copiarAnterior = (f: number) => {
    const antes = f === 0 ? ej.datos : ej.datos.map((x, k) => val(`f${f - 1}c${k}`) || String(x));
    setTxt((t) => {
      const nuevo = { ...t };
      antes.forEach((x, k) => (nuevo[`f${f}c${k}`] = String(x)));
      return nuevo;
    });
  };

  const avanzar = () => {
    if (!actual) return;
    setFallos(0);
    setAviso(null);
    setBien({});
    const nuevo = { ...av, [actual]: true };
    setAv(nuevo);
    if (orden.every((k) => nuevo[k])) onResuelto();
  };

  const comprobar = () => {
    const r: Record<string, boolean> = {};
    if (actual === 'traza') {
      if (binaria) {
        sim.vueltas.forEach((t, i) => {
          r[`b${i}i`] = num(`b${i}i`) === t.ini;
          r[`b${i}f`] = num(`b${i}f`) === t.fin;
          r[`b${i}m`] = num(`b${i}m`) === t.med;
        });
        r.devuelve = num('devuelve') === sim.devuelve;
      } else sim.filas.forEach((f, i) => f.v.forEach((x, k) => (r[`f${i}c${k}`] = num(`f${i}c${k}`) === x)));
    }
    if (actual === 'cuentas') {
      r.comp = num('comp') === sim.comp;
      if (sim.etiquetaMov) r.mov = num('mov') === sim.mov;
    }
    setBien(r);
    if (Object.values(r).every(Boolean)) return avanzar();
    setFallos(fallos + 1);
    const malas = Object.values(r).filter((x) => !x).length;
    const cuantas = malas === 1 ? 'Hay una casilla mal' : `Hay ${malas} casillas mal`;
    if (actual === 'cuentas') return setAviso(`${cuantas} (en rojo). Cuenta una comparación cada vez que se comparan dos claves del array, también la que sale del bucle.`);
    // the first wrong row is the one to look at: the ones after it come from it
    const fila = binaria ? sim.vueltas.findIndex((_, i) => !r[`b${i}i`] || !r[`b${i}f`] || !r[`b${i}m`]) : sim.filas.findIndex((f, i) => f.v.some((_, k) => !r[`f${i}c${k}`]));
    const donde = fila >= 0 ? ` La primera fila mal es la ${fila + 1}: arregla esa antes que las de debajo, que salen de ella.` : '';
    setAviso(`${cuantas} (en rojo).${donde}`);
  };

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    comprobar();
  };
  const entrada = (k: string, etiqueta: string, clase = '') => (
    <input
      type="text"
      inputMode="numeric"
      className={`${marca(bien[k])} ${clase}`}
      value={val(k)}
      onChange={(e) => poner(k, e.target.value)}
      aria-label={etiqueta}
      autoComplete="off"
      spellCheck={false}
    />
  );
  const botones = (
    <div className="fila-respuesta">
      <button className="btn" type="submit">
        Comprobar
      </button>
      {fallos >= 2 && (
        <button type="button" className="btn-texto" onClick={avanzar}>
          Ver las respuestas
        </button>
      )}
    </div>
  );

  return (
    <div className="espec traza">
      <section className="panel">
        <div className="ficha-traza">
          <span className="nota">{binaria ? `Buscar x = ${ej.x} en` : 'Array de partida'}</span>
          <FilaArray v={ej.datos} />
        </div>
        <details className="chuleta">
          <summary>El código de {nombreAlg(ej)}</summary>
          <pre className="codigo-traza">{codigoAlg(ej)}</pre>
        </details>
        <ol className="pasos-fallo">
          <Estado n={1} paso={paso}>
            <strong>{binaria ? 'Haz la traza de la búsqueda' : 'Escribe cómo queda el array'}</strong>
            {actual === 'traza' && (
              <form onSubmit={enviar}>
                <p className="nota">{QUE_ES_FILA[ej.alg]}</p>
                {binaria ? (
                  <>
                    <table className="tabla-traza editable">
                      <thead>
                        <tr>
                          <th>Vuelta</th>
                          <th>ini</th>
                          <th>fin</th>
                          <th>med</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sim.vueltas.map((_, i) => (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td>{entrada(`b${i}i`, `ini en la vuelta ${i + 1}`, 'corta')}</td>
                            <td>{entrada(`b${i}f`, `fin en la vuelta ${i + 1}`, 'corta')}</td>
                            <td>{entrada(`b${i}m`, `med en la vuelta ${i + 1}`, 'corta')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="fila-espec">
                      <span>¿Qué devuelve?</span>
                      {entrada('devuelve', 'Lo que devuelve la búsqueda', 'corta')}
                    </p>
                  </>
                ) : (
                  <div className="traza-editable">
                    {sim.filas.map((f, i) => (
                      <div key={i} className="fila-traza">
                        <code>{f.etiqueta}</code>
                        <div className="fila-celdas editable">
                          {Array.from({ length: n }, (_, k) => (
                            <label key={k} className="celda-hash">
                              {entrada(`f${i}c${k}`, `${f.etiqueta}, casilla ${k}`)}
                              <small>{k}</small>
                            </label>
                          ))}
                        </div>
                        <button type="button" className="btn-texto" onClick={() => copiarAnterior(i)}>
                          Copiar la de arriba
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {botones}
              </form>
            )}
            {paso > 1 && <TrazaResuelta ej={ej} sim={sim} />}
          </Estado>

          {ej.cuentas && (
            <Estado n={2} paso={paso}>
              <strong>Haz las cuentas</strong>
              {actual === 'cuentas' && (
                <form onSubmit={enviar}>
                  <div className="tabla-espec">
                    <div className="fila-espec">
                      <span>¿Cuántas comparaciones entre claves hace?</span>
                      {entrada('comp', 'Comparaciones', 'corta')}
                    </div>
                    {sim.etiquetaMov && (
                      <div className="fila-espec">
                        <span>{PREGUNTA_MOV[sim.etiquetaMov] ?? `¿Y cuántos ${sim.etiquetaMov}?`}</span>
                        {entrada('mov', sim.etiquetaMov, 'corta')}
                      </div>
                    )}
                  </div>
                  {botones}
                </form>
              )}
              {paso > 2 && (
                <ul className="resumen-preguntas">
                  <li>
                    Comparaciones: <b>{sim.comp}</b>
                  </li>
                  {sim.etiquetaMov && (
                    <li>
                      {sim.etiquetaMov.charAt(0).toUpperCase() + sim.etiquetaMov.slice(1)}: <b>{sim.mov}</b>
                    </li>
                  )}
                </ul>
              )}
            </Estado>
          )}
        </ol>
        {aviso && actual && <p className="aviso-corto">{aviso}</p>}
      </section>

      {!actual && (
        <section className="panel">
          <p className="explicacion">
            <Rico texto={ej.explicacion} />
          </p>
          <a className="btn secundario" href={`#/ver/${ej.alg}`}>
            Verlo animado en Visualizar →
          </a>
        </section>
      )}
    </div>
  );
}
