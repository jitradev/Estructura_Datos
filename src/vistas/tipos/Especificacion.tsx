import { ReactNode, useMemo, useState } from 'react';
import { especificacionCompleta, leerFirma, mismaFirma, respuestaValida, textoFirma } from '../../ejercicios/especificacion';
import { EjEspec } from '../../ejercicios/tipos';
import { useBorrador } from '../../progreso';
import { Rico } from '../comun';
import { EditorCodigo } from '../EditorCodigo';

interface Avance {
  informal?: boolean;
  sintaxis?: boolean;
  semantica?: boolean;
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

/** A fixed shuffle per exercise, so that the options do not move on every render. */
function barajar<T>(xs: T[], semilla: string): T[] {
  let h = [...semilla].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const marca = (ok: boolean | undefined) => (ok === undefined ? '' : ok ? 'bien' : 'mal');

export function Especificacion({ ej, onResuelto }: { ej: EjEspec; onResuelto: () => void }) {
  const [av, setAv] = useBorrador<Avance>(ej.id, 'avance', () => ({}));
  const paso = !av.informal ? 1 : !av.sintaxis ? 2 : !av.semantica ? 3 : 4;
  const opciones = useMemo(() => barajar([...ej.operaciones.map((o) => o.descripcion), ...ej.distractores], ej.id), [ej]);

  const [desc, setDesc] = useState<Record<number, string>>({});
  const [firmas, setFirmas] = useState<Record<number, string>>({});
  const [constr, setConstr] = useState<Record<number, boolean>>({});
  const [ecs, setEcs] = useState<Record<number, string>>({});
  const [bien, setBien] = useState<Record<string, boolean>>({});
  const [fallos, setFallos] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);

  const avanzar = (campo: keyof Avance) => {
    setFallos(0);
    setAviso(null);
    setBien({});
    const nuevo = { ...av, [campo]: true };
    setAv(nuevo);
    if (campo === 'semantica') onResuelto();
  };

  const comprobar = () => {
    const r: Record<string, boolean> = {};
    if (paso === 1) ej.operaciones.forEach((o, i) => (r[`d${i}`] = desc[i] === o.descripcion));
    if (paso === 2)
      ej.operaciones.forEach((o, i) => {
        const f = leerFirma(firmas[i] ?? '', ej.tad);
        r[`f${i}`] = !!f && mismaFirma(o, f) && !!constr[i] === !!o.constructora;
      });
    if (paso === 3) ej.ecuaciones.forEach((e, i) => (r[`e${i}`] = respuestaValida(e, ecs[i] ?? '')));
    setBien(r);
    if (Object.values(r).every(Boolean)) return avanzar(paso === 1 ? 'informal' : paso === 2 ? 'sintaxis' : 'semantica');
    setFallos(fallos + 1);
    const malas = Object.values(r).filter((x) => !x).length;
    setAviso(
      paso === 2
        ? `${malas === 1 ? 'Hay una operación' : `Hay ${malas} operaciones`} mal: revisa los tipos (entero, real, booleano, cadena o ${ej.tad}) y el asterisco de las constructoras.`
        : `${malas === 1 ? 'Hay una' : `Hay ${malas}`} mal (en rojo).`,
    );
  };

  const verRespuestas = () => avanzar(paso === 1 ? 'informal' : paso === 2 ? 'sintaxis' : 'semantica');
  const completa = especificacionCompleta(ej);
  const cab = `TAD ${ej.tad} (${ej.valores})`;

  const botones = (
    <div className="fila-respuesta">
      <button className="btn" type="submit">
        Comprobar
      </button>
      {fallos >= 2 && (
        <button type="button" className="btn-texto" onClick={verRespuestas}>
          Ver las respuestas
        </button>
      )}
    </div>
  );
  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    comprobar();
  };

  return (
    <div className="espec">
      <section className="panel">
        <ol className="pasos-fallo">
          <Estado n={1} paso={paso}>
            <strong>Especificación informal: ¿qué hace cada operación?</strong>
            {paso === 1 ? (
              <form onSubmit={enviar}>
                <p className="mono cab-tad">{cab}</p>
                <div className="tabla-espec">
                  {ej.operaciones.map((o, i) => (
                    <label key={o.nombre} className="fila-espec">
                      <code>{o.nombre}(…)</code>
                      <select className={marca(bien[`d${i}`])} value={desc[i] ?? ''} onChange={(e) => setDesc({ ...desc, [i]: e.target.value })}>
                        <option value="">Elige…</option>
                        {opciones.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
                {botones}
              </form>
            ) : (
              <p>Hecha.</p>
            )}
          </Estado>

          <Estado n={2} paso={paso}>
            <strong>Especificación formal, sintaxis: los tipos de cada operación</strong>
            {paso === 2 && (
              <form onSubmit={enviar}>
                <p className="nota">
                  Escribe los tipos de los argumentos y del resultado, por ejemplo <code>entero, entero -&gt; {ej.tad}</code> o <code>-&gt; {ej.tad}</code> si no tiene argumentos. Marca con * las constructoras: las que crean un {ej.tad} de la nada.
                </p>
                <div className="tabla-espec">
                  {ej.operaciones.map((o, i) => (
                    <div key={o.nombre} className={`fila-espec firma ${marca(bien[`f${i}`])}`}>
                      <label className="constr" title="Constructora">
                        <input type="checkbox" checked={!!constr[i]} onChange={(e) => setConstr({ ...constr, [i]: e.target.checked })} /> *
                      </label>
                      <code>{o.nombre}</code>
                      <input
                        type="text"
                        className={marca(bien[`f${i}`])}
                        value={firmas[i] ?? ''}
                        onChange={(e) => setFirmas({ ...firmas, [i]: e.target.value })}
                        placeholder={`tipos -> resultado`}
                        aria-label={`Sintaxis de ${o.nombre}`}
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </div>
                  ))}
                </div>
                {botones}
              </form>
            )}
            {paso > 2 && (
              <pre className="mono resumen-espec">
                {ej.operaciones.map((o) => textoFirma(o)).join('\n')}
              </pre>
            )}
          </Estado>

          <Estado n={3} paso={paso}>
            <strong>Especificación formal, semántica: completa las ecuaciones</strong>
            {paso === 3 && (
              <form onSubmit={enviar}>
                <p className="nota">
                  Para todo {ej.variables}. Vale <code>verdadero</code>/<code>falso</code>, y las condiciones de error se escriben <code>error: …</code>.
                </p>
                <div className="tabla-espec">
                  {ej.ecuaciones.map((e, i) => (
                    <div key={e.izq} className="fila-espec ecuacion-espec">
                      <code>{e.izq}</code>
                      <span className="flecha">→</span>
                      {e.antes && <span>{e.antes}</span>}
                      <input
                        type="text"
                        className={marca(bien[`e${i}`])}
                        value={ecs[i] ?? ''}
                        onChange={(ev) => setEcs({ ...ecs, [i]: ev.target.value })}
                        aria-label={`Lado derecho de ${e.izq}`}
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </div>
                  ))}
                </div>
                {botones}
              </form>
            )}
          </Estado>
        </ol>
        {aviso && paso < 4 && <p className="aviso-corto">{aviso}</p>}
      </section>

      {paso === 4 && (
        <section className="panel espec-completa">
          <div className="panel-cab">
            <h2>La especificación completa</h2>
          </div>
          <h3>Informal</h3>
          <EditorCodigo valor={completa.informal} soloLectura minLineas={1} etiquetaAria="Especificación informal" />
          <h3>Formal</h3>
          <EditorCodigo valor={completa.formal} soloLectura minLineas={1} etiquetaAria="Especificación formal" />
          <p className="nota">
            <Rico texto="El asterisco marca las constructoras. Las ecuaciones se evalúan como cuentas, sin abrir el `.c`." />
          </p>
        </section>
      )}
    </div>
  );
}
