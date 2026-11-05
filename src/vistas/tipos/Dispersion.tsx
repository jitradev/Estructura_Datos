import { ReactNode, useMemo, useState } from 'react';
import {
  abierta,
  clavesDe,
  h1,
  h2,
  leerCelda,
  leerNumero,
  leerResultado,
  mismaCelda,
  mismoNumero,
  NOMBRE_SONDEO,
  numeros,
  opcionesResultado,
  simular,
  Simulacion,
  textoOp,
  verCelda,
} from '../../ejercicios/dispersion';
import { EjDispersion } from '../../ejercicios/tipos';
import { useBorrador } from '../../progreso';
import { Rico } from '../comun';

interface Avance {
  hashes?: boolean;
  traza?: boolean;
  tabla?: boolean;
  preguntas?: boolean;
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

const marca = (ok: boolean | undefined) => (ok === undefined ? '' : ok ? 'bien' : 'mal');

/** The table as it ends: a row of cells with their index, or the buckets with their lists. */
export function TablaHashFinal({ ej, sim }: { ej: EjDispersion; sim: Simulacion }) {
  if (abierta(ej))
    return (
      <div className="fila-celdas" role="img" aria-label={`Tabla final: ${sim.celdas.map(verCelda).join(' ')}`}>
        {sim.celdas.map((c, i) => (
          <span key={i} className={`celda-hash ${c.k}`}>
            <b>{verCelda(c)}</b>
            <small>{i}</small>
          </span>
        ))}
      </div>
    );
  return (
    <div className="cubos-hash">
      {sim.cubos.map((l, i) => (
        <div key={i} className="cubo-hash">
          <span className="indice-cubo">[{i}]</span>
          {l.map((x, k) => (
            <span key={k} className="nodo-hash">
              {x}
            </span>
          ))}
          <span className="nulo-cubo">NULL</span>
        </div>
      ))}
    </div>
  );
}

/** The whole trace, for the solution: what each operation looks at and its result. */
function TrazaResuelta({ ej, sim }: { ej: EjDispersion; sim: Simulacion }) {
  return (
    <table className="tabla-traza">
      <thead>
        <tr>
          <th>Operación</th>
          <th>{abierta(ej) ? 'Casillas que mira' : 'Nodos que mira'}</th>
          <th>Resultado</th>
        </tr>
      </thead>
      <tbody>
        {sim.pasos.map((p, i) => (
          <tr key={i}>
            <td>
              <code>{textoOp(p.op)}</code>
            </td>
            <td className="mono">{abierta(ej) ? p.mira.join(' ') : p.op.op === 'insertar' ? '—' : `${p.mira.length}${p.mira.length ? ` (${p.mira.join(', ')})` : ''}`}</td>
            <td>{/^\d+$/.test(p.resultado) ? (abierta(ej) ? `en ${p.resultado}` : `cubo ${p.resultado}`) : p.resultado}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Dispersion({ ej, onResuelto }: { ej: EjDispersion; onResuelto: () => void }) {
  const [av, setAv] = useBorrador<Avance>(ej.id, 'avance', () => ({}));
  const sim = useMemo(() => simular(ej), [ej]);
  const claves = useMemo(() => clavesDe(ej), [ej]);
  const conTraza = !!ej.traza;
  const conPreguntas = !!ej.preguntas?.length;
  const orden: (keyof Avance)[] = ['hashes', ...(conTraza ? ['traza' as const] : []), 'tabla', ...(conPreguntas ? ['preguntas' as const] : [])];
  const actual = orden.find((k) => !av[k]);
  const paso = actual ? orden.indexOf(actual) + 1 : orden.length + 1;
  const num = (k: keyof Avance) => orden.indexOf(k) + 1;

  const [txt, setTxt] = useState<Record<string, string>>({});
  const [bien, setBien] = useState<Record<string, boolean>>({});
  const [fallos, setFallos] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const val = (k: string) => txt[k] ?? '';
  const poner = (k: string, v: string) => setTxt((t) => ({ ...t, [k]: v }));

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
    if (actual === 'hashes')
      claves.forEach((x) => {
        r[`h${x}`] = numeros(val(`h${x}`)).join() === String(h1(ej, x));
        if (ej.sondeo === 'doble') r[`g${x}`] = numeros(val(`g${x}`)).join() === String(h2(ej, x));
      });
    if (actual === 'traza')
      sim.pasos.forEach((p, i) => {
        if (abierta(ej)) r[`m${i}`] = numeros(val(`m${i}`)).join() === p.mira.join();
        else if (p.op.op !== 'insertar') r[`m${i}`] = numeros(val(`m${i}`)).join() === String(p.mira.length);
        if (opcionesResultado(ej, p.op).length || abierta(ej)) r[`r${i}`] = leerResultado(val(`r${i}`)) === p.resultado;
      });
    if (actual === 'tabla') {
      if (abierta(ej)) sim.celdas.forEach((c, i) => (r[`c${i}`] = mismaCelda(leerCelda(val(`c${i}`)), c)));
      else sim.cubos.forEach((l, i) => (r[`c${i}`] = numeros(val(`c${i}`)).join() === l.join()));
    }
    if (actual === 'preguntas') ej.preguntas!.forEach((q, i) => (r[`p${i}`] = mismoNumero(leerNumero(val(`p${i}`)), q.respuesta)));
    setBien(r);
    if (Object.values(r).every(Boolean)) return avanzar();
    setFallos(fallos + 1);
    const malas = Object.values(r).filter((x) => !x).length;
    const cuantas = malas === 1 ? 'Hay una casilla mal' : `Hay ${malas} casillas mal`;
    setAviso(
      actual === 'hashes'
        ? `${cuantas} (en rojo). Haz el módulo con calma: el resto de dividir entre ${ej.tam}.`
        : actual === 'traza'
        ? `${cuantas} (en rojo). Recuerda: ${abierta(ej) ? 'una casilla borrada no para la búsqueda; solo para una vacía' : 'cuenta los nodos de la lista del cubo hasta encontrarla, o todos si no está'}.`
        : actual === 'tabla'
        ? `${cuantas} (en rojo).${abierta(ej) ? ' Escribe «.» en las vacías y «B» en las borradas.' : ' Cada cubo, desde la cabeza: lo último insertado va el primero.'}`
        : `${cuantas} (en rojo). Vale con dos decimales, con coma o punto, o como fracción.`,
    );
  };

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    comprobar();
  };
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
  const entrada = (k: string, etiqueta: string, extra?: { placeholder?: string; clase?: string }) => (
    <input
      type="text"
      className={`${marca(bien[k])} ${extra?.clase ?? ''}`}
      value={val(k)}
      onChange={(e) => poner(k, e.target.value)}
      placeholder={extra?.placeholder}
      aria-label={etiqueta}
      autoComplete="off"
      spellCheck={false}
    />
  );

  const ficha = (
    <p className="ficha-hash">
      <span>
        <b>TAM</b> = {ej.tam}
      </span>
      <span>
        <code>h(x) = x % {ej.tam}</code>
      </span>
      {ej.sondeo === 'doble' && (
        <span>
          <code>
            h2(x) = {ej.q} − (x % {ej.q})
          </code>
        </span>
      )}
      <span>{NOMBRE_SONDEO[ej.sondeo]}</span>
    </p>
  );

  return (
    <div className="espec dispersion">
      <section className="panel">
        {ficha}
        <ol className="pasos-fallo">
          <Estado n={1} paso={paso}>
            <strong>Calcula el hash de cada clave</strong>
            {actual === 'hashes' ? (
              <form onSubmit={enviar}>
                <p className="nota">Antes de colocar ninguna: apúntalo al lado y no tendrás que hacer el módulo de cabeza a mitad de la traza.</p>
                <div className="rejilla-hashes">
                  {claves.map((x) => (
                    <div key={x} className="fila-hash">
                      <code>h({x}) =</code>
                      {entrada(`h${x}`, `h(${x})`)}
                      {ej.sondeo === 'doble' && (
                        <>
                          <code>h2({x}) =</code>
                          {entrada(`g${x}`, `h2(${x})`)}
                        </>
                      )}
                    </div>
                  ))}
                </div>
                {botones}
              </form>
            ) : (
              paso > 1 && (
                <p className="mono resumen-espec">
                  {claves.map((x) => `h(${x}) = ${h1(ej, x)}${ej.sondeo === 'doble' ? `, h2 = ${h2(ej, x)}` : ''}`).join('   ')}
                </p>
              )
            )}
          </Estado>

          {conTraza && (
            <Estado n={num('traza')} paso={paso}>
              <strong>Traza: qué mira cada operación y qué pasa</strong>
              {actual === 'traza' && (
                <form onSubmit={enviar}>
                  <p className="nota">
                    {abierta(ej)
                      ? 'Escribe las casillas que mira, en orden (por ejemplo 3 4 5). En insertar, la casilla donde queda, o «ya estaba» o «no cabe».'
                      : 'Escribe cuántos nodos mira cada búsqueda o borrado (0 si el cubo está vacío). Las inserciones van por delante y no miran nada.'}
                  </p>
                  <table className="tabla-traza editable">
                    <thead>
                      <tr>
                        <th>Operación</th>
                        <th>{abierta(ej) ? 'Casillas que mira' : 'Nodos que mira'}</th>
                        <th>Resultado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sim.pasos.map((p, i) => {
                        const ops = opcionesResultado(ej, p.op);
                        return (
                          <tr key={i}>
                            <td>
                              <code>{textoOp(p.op)}</code>
                            </td>
                            <td>{!abierta(ej) && p.op.op === 'insertar' ? <span className="nota">—</span> : entrada(`m${i}`, `Qué mira ${textoOp(p.op)}`, { placeholder: abierta(ej) ? 'casillas' : 'nodos' })}</td>
                            <td>
                              {!abierta(ej) && p.op.op === 'insertar' ? (
                                <span className="nota">cubo {p.resultado}</span>
                              ) : p.op.op === 'insertar' ? (
                                entrada(`r${i}`, `Resultado de ${textoOp(p.op)}`, { placeholder: 'casilla, ya estaba…' })
                              ) : (
                                <select className={marca(bien[`r${i}`])} value={val(`r${i}`)} onChange={(e) => poner(`r${i}`, e.target.value)} aria-label={`Resultado de ${textoOp(p.op)}`}>
                                  <option value="">Elige…</option>
                                  {ops.map((o) => (
                                    <option key={o} value={o}>
                                      {o}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {botones}
                </form>
              )}
            </Estado>
          )}

          <Estado n={num('tabla')} paso={paso}>
            <strong>{abierta(ej) ? 'Cómo queda la tabla' : 'Cómo quedan los cubos'}</strong>
            {actual === 'tabla' && (
              <form onSubmit={enviar}>
                <p className="nota">
                  {abierta(ej) ? 'Una clave en cada casilla ocupada, «.» en las vacías y «B» en las borradas.' : 'Las claves de cada lista, desde la cabeza (por ejemplo 36 22 15). Vacío si el cubo no tiene nada.'}
                </p>
                {abierta(ej) ? (
                  <div className="fila-celdas editable">
                    {sim.celdas.map((_, i) => (
                      <label key={i} className="celda-hash">
                        {entrada(`c${i}`, `Casilla ${i}`, { placeholder: '.' })}
                        <small>{i}</small>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="cubos-hash editable">
                    {sim.cubos.map((_, i) => (
                      <div key={i} className="cubo-hash">
                        <span className="indice-cubo">[{i}]</span>
                        {entrada(`c${i}`, `Cubo ${i}`)}
                      </div>
                    ))}
                  </div>
                )}
                {botones}
              </form>
            )}
            {paso > num('tabla') && <TablaHashFinal ej={ej} sim={sim} />}
          </Estado>

          {conPreguntas && (
            <Estado n={num('preguntas')} paso={paso}>
              <strong>Haz las cuentas</strong>
              {actual === 'preguntas' && (
                <form onSubmit={enviar}>
                  <div className="tabla-espec">
                    {ej.preguntas!.map((q, i) => (
                      <div key={i} className="fila-espec">
                        <span>
                          <Rico texto={q.texto} />
                        </span>
                        {entrada(`p${i}`, q.texto)}
                      </div>
                    ))}
                  </div>
                  {botones}
                </form>
              )}
              {paso > num('preguntas') && (
                <ul className="resumen-preguntas">
                  {ej.preguntas!.map((q, i) => (
                    <li key={i}>
                      <Rico texto={q.texto} /> <b>{Number(q.respuesta.toFixed(2)).toLocaleString('es')}</b>
                    </li>
                  ))}
                </ul>
              )}
            </Estado>
          )}
        </ol>
        {aviso && actual && <p className="aviso-corto">{aviso}</p>}
      </section>

      {!actual && (
        <section className="panel">
          <div className="panel-cab">
            <h2>La traza completa</h2>
          </div>
          <TrazaResuelta ej={ej} sim={sim} />
          <p className="explicacion">
            <Rico texto={ej.explicacion} />
          </p>
        </section>
      )}
    </div>
  );
}
