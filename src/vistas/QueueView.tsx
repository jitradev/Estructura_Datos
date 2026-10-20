// Visualizar for the queues: what each one looks like and its operations step by step,
// running the code of the Tema 4 project untouched.

import { useEffect, useMemo, useState } from 'react';
import { verValor } from '../interprete/ejecutar';
import { Memoria } from '../memoria/modelo';
import { buscarCola, COLAS, FAMILIAS, MAX, NPRIO, QueueType } from '../queues/catalog';
import { QueueDrawing } from '../queues/QueueDrawing';
import { buildQueue, esArray, readQueue, runQueueOp, structsOf } from '../queues/prepare';
import { Rico } from './comun';
import { EditorCodigo } from './EditorCodigo';
import { estadosLineas, Leyenda } from './piezas';
import { Reproductor, useReproductor } from './Reproductor';

export const COMPARA_COLAS: { familia: string; pregunta: string; r: Record<string, string> }[] = [
  { familia: 'Cola', pregunta: 'Dónde están los datos', r: { 'cola-array': 'en un array circular dentro del struct', 'cola-enlazada': 'en nodos sueltos en el montón' } },
  { familia: 'Cola', pregunta: 'Qué son frente y final', r: { 'cola-array': 'índices: el primero y el primer hueco libre', 'cola-enlazada': 'punteros al primer y al último nodo' } },
  { familia: 'Cola', pregunta: 'Vacía', r: { 'cola-array': 'n == 0', 'cola-enlazada': 'frente == NULL' } },
  { familia: 'Cola', pregunta: '¿Se llena?', r: { 'cola-array': 'sí, con MAX elementos', 'cola-enlazada': 'no, solo si malloc falla' } },
  { familia: 'Cola', pregunta: 'Desencolar', r: { 'cola-array': 'avanza frente con % MAX; el dato se queda en el array', 'cola-enlazada': 'avanza frente y hace free del nodo' } },
  { familia: 'Bicola', pregunta: 'Qué se guarda', r: { 'bicola-array': 'frente y n: el último se calcula', 'bicola-enlazada': 'frente y final, y cada nodo ant y sig' } },
  { familia: 'Bicola', pregunta: 'Insertar por el frente', r: { 'bicola-array': 'retrocede el frente: (frente - 1 + MAX) % MAX', 'bicola-enlazada': 'nodo nuevo delante; el viejo frente apunta atrás a él' } },
  { familia: 'Bicola', pregunta: 'Extraer por el final', r: { 'bicola-array': 'resta 1 a n: el frente no se mueve', 'bicola-enlazada': 'final = final->ant, sin recorrer' } },
  { familia: 'Bicola', pregunta: '¿Se llena?', r: { 'bicola-array': 'sí, con MAX elementos', 'bicola-enlazada': 'no: esLlena siempre devuelve 0' } },
];

const leerNumeros = (s: string) =>
  s
    .split(/[\s,;]+/)
    .filter(Boolean)
    .map((x) => x.split(':'));

/** «4:0, 8:1» → values and priorities (without a priority, 0). */
function leerCola(s: string, max: number, conPrio: boolean): { valores: number[]; prios: number[] } {
  const valores: number[] = [];
  const prios: number[] = [];
  for (const [v, p] of leerNumeros(s)) {
    const n = Number(v);
    if (!Number.isInteger(n) || valores.length >= max) continue;
    valores.push(n);
    const q = Number(p);
    prios.push(conPrio && Number.isInteger(q) ? Math.min(NPRIO - 1, Math.max(0, q)) : 0);
  }
  return { valores, prios };
}

const textoInicial = (t: QueueType) => t.ejemplo.map((v, i) => (t.prioridades ? `${v}:${t.prioridades[i]}` : String(v))).join(', ');
const ejemploDe = (t: QueueType) => ({ valores: t.ejemplo, prios: t.prioridades ?? [], frente: t.ejemploFrente ?? 0 });

/** The queue as its mostrar prints it. */
function mostrar(t: QueueType, m: Memoria): string {
  const xs = readQueue(t, m);
  if (t.prioridades) return `sale primero <${xs.map((e) => ` ${e.dato}(p${e.prio})`).join('')} >`;
  return `frente <${xs.map((e) => ' ' + e.dato).join('')} > final`;
}

export function QueuePageRoute({ id }: { id: string }) {
  const t = buscarCola(id);
  if (!t) return <p className="contenido">No existe esa cola.</p>;
  return <QueuePage key={t.id} tipo={t} />;
}

function QueuePage({ tipo }: { tipo: QueueType }) {
  const [opIdx, setOpIdx] = useState(0);
  const [texto, setTexto] = useState(textoInicial(tipo));
  const [frente, setFrente] = useState(tipo.ejemploFrente ?? 0);
  const [x, setX] = useState(tipo.prioridades ? 5 : 4);
  const [prio, setPrio] = useState(1);
  const op = tipo.operaciones[opIdx];
  const { valores, prios } = useMemo(() => leerCola(texto, tipo.max, !!tipo.prioridades), [texto, tipo]);
  const res = useMemo(() => runQueueOp(tipo, op, { valores, prios, frente, x, prio }), [tipo, op, valores, prios, frente, x, prio]);
  const rep = useReproductor(res.pasos);
  useEffect(() => {
    rep.setIdx(0);
    rep.setEnMarcha(false);
  }, [res]); // eslint-disable-line react-hooks/exhaustive-deps

  const grupos = [...new Set(tipo.operaciones.map((o) => o.grupo))];
  const final = rep.idx >= res.pasos.length - 1;
  const enMain = (n: string) => res.memFinal.marcos[0].vars.find((v) => v.nombre === n)?.valor;
  const salidas = op.args.filter((a) => a.startsWith('&')).map((a) => a.slice(1));
  const hermanas = COLAS.filter((t) => t.familia === tipo.familia);

  return (
    <main className="contenido ancho">
      <nav className="miga">
        <a href="#/">Temas</a>
        <span>/</span>
        <a href="#/ver">Visualizar</a>
      </nav>
      <div className="pestanas" role="tablist" aria-label="Tipo de cola">
        {COLAS.map((t) => (
          <a key={t.id} role="tab" aria-selected={t.id === tipo.id} className={`pestana ${t.id === tipo.id ? 'on' : ''}`} href={`#/ver/${t.id}`}>
            {t.nombre}
          </a>
        ))}
      </div>
      <h1>{tipo.nombre}</h1>

      <section className="ver-intro">
        <div>
          <ul className="puntos">
            {tipo.resumen.map((r) => (
              <li key={r}>
                <Rico texto={r} />
              </li>
            ))}
          </ul>
          <details className="chuleta" open>
            <summary>{tipo.nodo ? 'Los structs' : 'El struct'}</summary>
            <EditorCodigo valor={structsOf(tipo)} soloLectura minLineas={1} etiquetaAria="Structs de la cola" />
          </details>
          {hermanas.length > 1 && (
            <p className="nota">
              La otra forma: {hermanas.filter((t) => t.id !== tipo.id).map((t) => <a key={t.id} href={`#/ver/${t.id}`}>{t.nombre.toLowerCase()}</a>)}. Las dos tienen las mismas operaciones con los mismos nombres.
            </p>
          )}
        </div>
        <div className="lienzo-memoria">
          <QueueDrawing mem={buildQueue(tipo, ejemploDe(tipo))} tipo={tipo} soloCola titulo={`Ejemplo: ${tipo.nombre} con ${textoInicial(tipo)}`} />
        </div>
      </section>

      <h2 className="titulo-seccion">Operaciones paso a paso</h2>
      <section className="panel form-op">
        <label>
          Operación
          <select value={opIdx} onChange={(e) => setOpIdx(Number(e.target.value))}>
            {grupos.map((g) => (
              <optgroup key={g} label={g}>
                {tipo.operaciones.map((o, i) =>
                  o.grupo === g ? (
                    <option key={o.fn} value={i}>
                      {o.titulo}
                    </option>
                  ) : null,
                )}
              </optgroup>
            ))}
          </select>
        </label>
        {!op.crea && (
          <label>
            {tipo.familia === 'Bicola' ? 'Bicola de partida' : 'Cola de partida'}
            <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="vacía" aria-describedby="ayuda-cola" />
            <span id="ayuda-cola" className="ayuda">
              {tipo.prioridades ? `dato:prioridad (0 a ${NPRIO - 1}), hasta ${tipo.max}` : `Del frente al final, hasta ${tipo.max}`}; en blanco, vacía
            </span>
          </label>
        )}
        {!op.crea && esArray(tipo) && (
          <label>
            Frente en la casilla
            <select value={frente} onChange={(e) => setFrente(Number(e.target.value))}>
              {Array.from({ length: MAX }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>
        )}
        {op.args.includes('x') && (
          <label>
            Valor
            <input type="number" value={x} onChange={(e) => setX(Number(e.target.value) || 0)} />
          </label>
        )}
        {op.args.includes('prio') && (
          <label>
            Prioridad
            <input type="number" value={prio} onChange={(e) => setPrio(Number(e.target.value) || 0)} />
          </label>
        )}
        <p className="llamada-op">
          Desde main: <code>{res.llamada};</code>
          <span className="nota"> {op.descripcion}</span>
        </p>
      </section>

      <div className="ej-rejilla ver-rejilla">
        <section className="panel panel-codigo">
          <div className="panel-cab">
            <h2>Código</h2>
            <span className="nota">de {tipo.archivo}</span>
          </div>
          <EditorCodigo valor={res.codigo} soloLectura estados={estadosLineas(res.pasos, rep.idx)} etiquetaAria="Código de la operación" />
          <p className="nota">Las demás funciones del archivo (esVacia, avanza…) se ejecutan de un solo paso.</p>
        </section>
        <section className="panel panel-memoria">
          <div className="panel-cab">
            <h2>Memoria</h2>
          </div>
          <Reproductor
            pasos={res.pasos}
            rep={rep}
            ctx={tipo.ctx}
            memInicial={res.inicial}
            dibujar={(mem, prev) => <QueueDrawing mem={mem} prev={prev} tipo={tipo} />}
          />
          {res.error && (
            <div className="caja-error" role="alert">
              <strong>{res.error.linea > 0 ? `Línea ${res.error.linea}: ` : ''}</strong>
              {res.error.mensaje}
            </div>
          )}
          {!res.error && final && (
            <div className="caja-bien">
              {res.devuelve && res.devuelve.k !== 'nulo' && (
                <>
                  Devuelve <strong>{verValor(res.devuelve)}</strong>.{' '}
                </>
              )}
              {res.devuelve?.k === 'int' &&
                res.devuelve.v !== 0 &&
                salidas.map((n) => {
                  const v = enMain(n);
                  return v?.k === 'int' ? (
                    <span key={n}>
                      En main, <code>{n} = {v.v}</code>.{' '}
                    </span>
                  ) : null;
                })}
              <span className="mono">{mostrar(tipo, res.memFinal)}</span>
            </div>
          )}
        </section>
      </div>
      <Leyenda />
    </main>
  );
}

/** Cards and comparison tables for the Visualizar landing page. */
export function QueueGallery() {
  return (
    <>
      {FAMILIAS.map((f) => {
        const tipos = COLAS.filter((t) => t.familia === f);
        const filas = COMPARA_COLAS.filter((c) => c.familia === f);
        return (
          <div key={f}>
            <h3 className="subtitulo-familia">{f}</h3>
            <section className="galeria-listas">
              {tipos.map((t) => (
                <a key={t.id} className="tarjeta-lista" href={`#/ver/${t.id}`}>
                  <span className="fila-tema">
                    <strong>{t.nombre}</strong>
                    <span className="cuenta">Ver operaciones →</span>
                  </span>
                  <span className="resumen">
                    <Rico texto={t.resumen[0]} /> <Rico texto={t.resumen[1]} />
                  </span>
                  <span className="lienzo-memoria mini-lienzo">
                    <QueueDrawing mem={buildQueue(t, ejemploDe(t))} tipo={t} soloCola />
                  </span>
                </a>
              ))}
            </section>
            {filas.length > 0 && (
              <section className="panel compara">
                <h3>Las dos, cara a cara</h3>
                <div className="tabla-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th />
                        {tipos.map((t) => (
                          <th key={t.id}>
                            <a href={`#/ver/${t.id}`}>{t.corto}</a>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filas.map((c) => (
                        <tr key={c.pregunta}>
                          <th scope="row">{c.pregunta}</th>
                          {tipos.map((t) => (
                            <td key={t.id}>{c.r[t.id]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        );
      })}
    </>
  );
}
