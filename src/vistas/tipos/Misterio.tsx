import { ReactNode, useMemo, useState } from 'react';
import { leerValores, mismosValores, preguntas, respuestas } from '../../ejercicios/misterio';
import { EjMisterio } from '../../ejercicios/tipos';
import { construir } from '../../memoria/construir';
import { useBorrador } from '../../progreso';
import { Rico } from '../comun';
import { EditorCodigo } from '../EditorCodigo';
import { estadosLineas } from '../piezas';
import { Reproductor, useReproductor } from '../Reproductor';

interface Avance {
  prediccion?: boolean; // every case predicted (or shown)
  opcion?: number;
}

/** Declared outside Misterio so that the inputs inside do not remount (and lose focus) on every key. */
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

export function Misterio({ ej, onResuelto }: { ej: EjMisterio; onResuelto: () => void }) {
  const [av, setAv] = useBorrador<Avance>(ej.id, 'avance', () => ({}));
  const [escrito, setEscrito] = useState<Record<string, string>>({});
  const [bien, setBien] = useState<Record<string, boolean>>({});
  const [intentos, setIntentos] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [avisoOpcion, setAvisoOpcion] = useState<string | null>(null);
  const [casoSel, setCasoSel] = useState(0);
  const datos = useMemo(() => ej.casos.map((c) => ({ caso: c, preguntas: preguntas(ej, c), ...respuestas(ej, c) })), [ej]);
  const paso = !av.prediccion ? 1 : av.opcion !== ej.correcta ? 2 : 3;
  const sel = datos[casoSel];
  const rep = useReproductor(paso === 3 ? sel.r.pasos : null);
  const memInicial = useMemo(() => construir(ej.ctx, sel.caso.inicial), [ej, sel]);
  const clave = (i: number, j: number) => `${i}-${j}`;

  const comprobar = () => {
    const nuevo: Record<string, boolean> = {};
    datos.forEach((d, i) => d.respuestas.forEach((r, j) => (nuevo[clave(i, j)] = mismosValores(leerValores(escrito[clave(i, j)] ?? ''), r.valores))));
    setBien(nuevo);
    if (Object.values(nuevo).every(Boolean)) {
      setAviso(null);
      setAv({ ...av, prediccion: true });
      return;
    }
    setIntentos(intentos + 1);
    setAviso('Alguna no es (las marcadas en rojo). Sigue el código línea a línea con los datos de ese caso, apuntando en un papel cómo cambia cada variable.');
  };

  const elegir = (i: number) => {
    if (paso !== 2) return;
    setAv({ ...av, opcion: i });
    if (i === ej.correcta) {
      setAvisoOpcion(null);
      onResuelto();
    } else setAvisoOpcion('No es eso. Mira lo que has predicho en cada caso: ¿cuadra con esa descripción en todos?');
  };

  return (
    <div className="ej-rejilla misterio">
      <section className="panel panel-codigo">
        <div className="panel-cab">
          <h2>El código</h2>
          <span className="nota">Solo lectura</span>
        </div>
        <EditorCodigo valor={ej.solucion} soloLectura minLineas={4} etiquetaAria="Código del ejercicio" estados={paso === 3 ? estadosLineas(sel.r.pasos, rep.idx) : {}} />
      </section>

      <section className="panel panel-pasos">
        <ol className="pasos-fallo">
          <Estado n={1} paso={paso}>
            <strong>Predice qué pasa en {datos.length > 1 ? 'cada caso' : 'este caso'}</strong>
            <form
              className="prediccion"
              onSubmit={(e) => {
                e.preventDefault();
                comprobar();
              }}
            >
              {datos.map((d, i) => (
                <fieldset key={d.caso.nombre} className="caso-prediccion">
                  <legend>
                    {d.caso.nombre}
                    {d.caso.llamada && (
                      <>
                        {' · '}
                        <code>{d.caso.llamada}</code>
                      </>
                    )}
                  </legend>
                  {d.preguntas.map((p, j) => {
                    const k = clave(i, j);
                    return (
                      <label key={k} className="fila-prediccion">
                        <span>
                          <Rico texto={p.texto} />
                        </span>
                        {paso === 1 ? (
                          <input
                            type="text"
                            className={bien[k] === undefined ? '' : bien[k] ? 'bien' : 'mal'}
                            value={escrito[k] ?? ''}
                            placeholder={p.formato}
                            autoComplete="off"
                            onChange={(e) => setEscrito({ ...escrito, [k]: e.target.value })}
                          />
                        ) : (
                          <span className="mono">{d.respuestas[j].texto}</span>
                        )}
                      </label>
                    );
                  })}
                </fieldset>
              ))}
              {paso === 1 && (
                <div className="fila-respuesta">
                  <button className="btn" type="submit">
                    Comprobar
                  </button>
                  {intentos >= 2 && (
                    <button type="button" className="btn-texto" onClick={() => setAv({ ...av, prediccion: true })}>
                      Ver las respuestas
                    </button>
                  )}
                </div>
              )}
            </form>
            {aviso && paso === 1 && <p className="aviso-corto">{aviso}</p>}
          </Estado>
          <Estado n={2} paso={paso}>
            <strong>{ej.preguntaOpciones ?? '¿Qué hace?'}</strong>
            {paso >= 2 && (
              <div className="opciones">
                {ej.opciones.map((o, i) => (
                  <button key={i} className={`opcion ${paso === 3 && i === ej.correcta ? 'on' : ''} ${paso === 2 && av.opcion === i ? 'mal' : ''}`} onClick={() => elegir(i)} disabled={paso !== 2}>
                    <Rico texto={o} />
                  </button>
                ))}
              </div>
            )}
            {avisoOpcion && paso === 2 && <p className="aviso-corto">{avisoOpcion}</p>}
            {paso === 3 && (
              <p className="explicacion">
                <Rico texto={ej.explicacion} />
              </p>
            )}
          </Estado>
        </ol>
      </section>

      {paso === 3 && (
        <section className="panel panel-memoria">
          <div className="panel-cab">
            <h2>Míralo ejecutarse</h2>
            <span className="nota">{sel.caso.nombre}</span>
          </div>
          {datos.length > 1 && (
            <div className="casos" role="group" aria-label="Caso">
              {datos.map((d, i) => (
                <button
                  key={d.caso.nombre}
                  className={`caso ${i === casoSel ? 'on' : ''}`}
                  aria-pressed={i === casoSel}
                  onClick={() => {
                    setCasoSel(i);
                    rep.setIdx(0);
                    rep.setEnMarcha(false);
                  }}
                >
                  {d.caso.nombre}
                </button>
              ))}
            </div>
          )}
          <Reproductor pasos={sel.r.pasos} rep={rep} ctx={ej.ctx} memInicial={memInicial} />
        </section>
      )}
    </div>
  );
}
