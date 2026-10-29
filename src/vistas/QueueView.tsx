// Visualizar for the queues: what each one looks like and its operations step by step,
// running the code of the Colas project untouched.

import { useEffect, useMemo, useState } from 'react';
import { verValor } from '../interprete/ejecutar';
import { Memoria } from '../memoria/modelo';
import { buscarCola, COLAS, FAMILIAS, NUM_PRIORIDADES, QueueType } from '../queues/catalog';
import { QueueDrawing } from '../queues/QueueDrawing';
import { buildQueue, esArray, readQueue, runQueueOp, structsOf } from '../queues/prepare';
import { Rico } from './comun';
import { SelectorTipo } from './SelectorTipo';
import { Bloque, ElegirOperacion } from './BloqueVer';
import { EditorCodigo } from './EditorCodigo';
import { estadosLineas, Leyenda } from './piezas';
import { Reproductor, useReproductor } from './Reproductor';

export const COMPARA_COLAS: { familia: string; pregunta: string; r: Record<string, string> }[] = [
  { familia: 'Cola', pregunta: 'Dónde están los datos', r: { 'cola-array': 'en un array circular dentro del struct', 'cola-enlazada': 'en nodos sueltos en el montón' } },
  { familia: 'Cola', pregunta: 'Qué marca los extremos', r: { 'cola-array': 'frente y final: índices del primero y del primer hueco libre', 'cola-enlazada': 'inicio y final: punteros al primer y al último nodo' } },
  { familia: 'Cola', pregunta: 'Vacía', r: { 'cola-array': 'numElementos == 0', 'cola-enlazada': 'inicio == NULL' } },
  { familia: 'Cola', pregunta: '¿Se llena?', r: { 'cola-array': 'sí, con TAM_COLA_ARRAY elementos', 'cola-enlazada': 'no, solo si malloc falla' } },
  { familia: 'Cola', pregunta: 'Desencolar', r: { 'cola-array': 'avanza frente con %; el valor se queda en el array', 'cola-enlazada': 'avanza inicio y elimina el nodo' } },
  { familia: 'Bicola', pregunta: 'Cómo es por dentro', r: { 'bicola-array': 'array circular con frente, final y numElementos', 'bicola-enlazada': 'lista doble con inicio y final', 'bicola-salida-restringida': 'lista simple con inicio y final' } },
  { familia: 'Bicola', pregunta: 'Insertar al principio', r: { 'bicola-array': 'retrocede frente: (frente - 1 + TAM) % TAM', 'bicola-enlazada': 'nodo nuevo delante; el viejo inicio apunta atrás a él', 'bicola-salida-restringida': 'nodo nuevo delante del inicio' } },
  { familia: 'Bicola', pregunta: 'Eliminar del final', r: { 'bicola-array': 'retrocede final y lee esa casilla', 'bicola-enlazada': 'final pasa a su anterior, sin recorrer', 'bicola-salida-restringida': 'no se puede: solo sale por el principio' } },
  { familia: 'Bicola', pregunta: '¿Se llena?', r: { 'bicola-array': 'sí, con TAM_BICOLA_ARRAY elementos', 'bicola-enlazada': 'no, solo si malloc falla', 'bicola-salida-restringida': 'no, solo si malloc falla' } },
  { familia: 'Cola con prioridad', pregunta: 'Cómo es por dentro', r: { 'cola-prioridad-lista': 'una lista ordenada por prioridad', 'cola-prioridad-array': 'una ColaEnlazada por prioridad' } },
  { familia: 'Cola con prioridad', pregunta: 'Encolar', r: { 'cola-prioridad-lista': 'recorre hasta el hueco de su prioridad', 'cola-prioridad-array': 'directo, al final de colas[prioridad]' } },
  { familia: 'Cola con prioridad', pregunta: 'Desencolar', r: { 'cola-prioridad-lista': 'directo: sale el inicio', 'cola-prioridad-array': 'busca la primera cola no vacía desde la 0' } },
  { familia: 'Cola con prioridad', pregunta: 'Empates', r: { 'cola-prioridad-lista': 'el <= lo pone detrás de sus iguales', 'cola-prioridad-array': 'cada cola ya es FIFO' } },
];

const leerNumeros = (s: string) =>
  s
    .split(/[\s,;]+/)
    .filter(Boolean)
    .map((x) => x.split(':'));

/** «4:0, 8:1» → values and priorities (without a priority, 0). */
function leerCola(s: string, max: number, conPrioridad: boolean): { valores: number[]; prioridades: number[] } {
  const valores: number[] = [];
  const prioridades: number[] = [];
  for (const [v, p] of leerNumeros(s)) {
    const n = Number(v);
    if (!Number.isInteger(n) || valores.length >= max) continue;
    valores.push(n);
    const q = Number(p);
    prioridades.push(conPrioridad && Number.isInteger(q) ? Math.min(NUM_PRIORIDADES - 1, Math.max(0, q)) : 0);
  }
  return { valores, prioridades };
}

const textoInicial = (t: QueueType) => t.ejemplo.map((v, i) => (t.prioridades ? `${v}:${t.prioridades[i]}` : String(v))).join(', ');
const ejemploDe = (t: QueueType) => ({ valores: t.ejemplo, prioridades: t.prioridades ?? [], frente: t.ejemploFrente ?? 0 });

/** The queue as its mostrar prints it. */
function mostrar(t: QueueType, m: Memoria): string {
  const xs = readQueue(t, m);
  if (xs === null) return 'La cola se ha liberado: ya no se puede usar.';
  if (t.prioridades) return `sale primero <${xs.map((e) => ` ${e.valor}(p${e.prioridad})`).join('')} >`;
  return `principio <${xs.map((e) => ' ' + e.valor).join('')} > final`;
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
  const [x, setX] = useState(tipo.prioridades ? 50 : 4);
  const [prioridad, setPrioridad] = useState(1);
  const op = tipo.operaciones[opIdx];
  const { valores, prioridades } = useMemo(() => leerCola(texto, tipo.max, !!tipo.prioridades), [texto, tipo]);
  const res = useMemo(() => runQueueOp(tipo, op, { valores, prioridades, frente, x, prioridad }), [tipo, op, valores, prioridades, frente, x, prioridad]);
  const rep = useReproductor(res.pasos);
  useEffect(() => {
    rep.setIdx(0);
    rep.setEnMarcha(false);
  }, [res]); // eslint-disable-line react-hooks/exhaustive-deps

  const final = rep.idx >= res.pasos.length - 1;
  const enMain = (n: string) => res.memFinal.marcos[0].vars.find((v) => v.nombre === n)?.valor;
  const salidas = op.args.filter((a) => a.startsWith('&')).map((a) => a.slice(1));
  const hermanas = COLAS.filter((t) => t.familia === tipo.familia);

  return (
    <main className="contenido ancho">
      <SelectorTipo grupo="colas" actual={tipo.id} opciones={COLAS} />
      <h1>{tipo.nombre}</h1>

      <Bloque id="como" num={1} titulo="Cómo es">
        <section className="ver-intro bloque-estructura">
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
            {tipo.nota && (
              <p className="nota">
                <Rico texto={tipo.nota} />
              </p>
            )}
            {hermanas.length > 1 && (
              <p className="nota">
                {hermanas.length > 2 ? 'Las otras formas: ' : 'La otra forma: '}
                {hermanas
                  .filter((t) => t.id !== tipo.id)
                  .map((t, i) => (
                    <span key={t.id}>
                      {i > 0 && ', '}
                      <a href={`#/ver/${t.id}`}>{t.nombre.toLowerCase()}</a>
                    </span>
                  ))}
                .
              </p>
            )}
          </div>
          <div className="lienzo-memoria">
            <QueueDrawing mem={buildQueue(tipo, ejemploDe(tipo))} tipo={tipo} soloCola titulo={`Ejemplo: ${tipo.nombre} con ${textoInicial(tipo)}`} />
          </div>
        </section>

      </Bloque>

      <Bloque
        id="operaciones"
        num={2}
        titulo="Operaciones paso a paso"
        operaciones
        subtitulo={
          <>
            Elige una operación y los datos de partida: se ejecuta su código del <code>.c</code> línea a línea y se ve cómo cambia la memoria. Con las flechas ← → del teclado también se avanza.
          </>
        }
      >
        <section className="panel form-op">
          <ElegirOperacion operaciones={tipo.operaciones} actual={opIdx} onChange={setOpIdx} />
          {!op.crea && (
            <label>
              {tipo.familia === 'Bicola' ? 'Bicola de partida' : 'Cola de partida'}
              <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="vacía" aria-describedby="ayuda-cola" />
              <span id="ayuda-cola" className="ayuda">
                {tipo.prioridades ? `valor:prioridad (0 a ${NUM_PRIORIDADES - 1}), hasta ${tipo.max}` : `Del principio al final, hasta ${tipo.max}`}; en blanco, vacía
              </span>
            </label>
          )}
          {!op.crea && esArray(tipo) && (
            <label>
              Frente en la casilla
              <select value={frente} onChange={(e) => setFrente(Number(e.target.value))}>
                {Array.from({ length: tipo.max }, (_, i) => (
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
          {op.args.includes('prioridad') && (
            <label>
              Prioridad
              <input type="number" value={prioridad} onChange={(e) => setPrioridad(Number(e.target.value) || 0)} />
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
            <p className="nota">Las demás funciones del archivo y las del TAD del nodo se ejecutan de un solo paso.</p>
          </section>
          <section className="panel panel-memoria">
            <div className="panel-cab">
              <h2>Memoria</h2>
            </div>
            <Reproductor
              teclas
              controlesArriba
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
                {res.devuelve && res.devuelve.k !== 'nulo' && !op.crea && (
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
      </Bloque>
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
                <h3>{tipos.length === 3 ? 'Las tres' : 'Las dos'}, cara a cara</h3>
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
