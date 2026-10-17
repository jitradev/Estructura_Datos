// Visualizar for the stacks: what each one looks like and its operations step by step,
// running the PilaArray.c and PilaEnlazada.c code untouched.

import { useEffect, useMemo, useState } from 'react';
import { verValor } from '../interprete/ejecutar';
import { Memoria } from '../memoria/modelo';
import { buscarPila, PILAS, StackType } from '../stacks/catalog';
import { StackDrawing } from '../stacks/StackDrawing';
import { buildStack, readStack, runStackOp, structsOf } from '../stacks/prepare';
import { Rico } from './comun';
import { EditorCodigo } from './EditorCodigo';
import { estadosLineas, Leyenda } from './piezas';
import { Reproductor, useReproductor } from './Reproductor';

export const EJEMPLO_PILA = [1, 2, 3];

export const COMPARA_PILAS: { pregunta: string; r: Record<string, string> }[] = [
  { pregunta: 'Dónde están los datos', r: { 'pila-array': 'en un array dentro del struct', 'pila-enlazada': 'en nodos sueltos en el montón' } },
  { pregunta: 'Qué es la cima', r: { 'pila-array': 'un índice del array', 'pila-enlazada': 'un puntero al nodo de arriba' } },
  { pregunta: 'Vacía', r: { 'pila-array': 'cima == -1', 'pila-enlazada': 'cima == NULL' } },
  { pregunta: '¿Se llena?', r: { 'pila-array': 'sí, con TAM elementos', 'pila-enlazada': 'no, solo si malloc falla' } },
  { pregunta: 'Pop', r: { 'pila-array': 'baja la cima; el valor se queda en el array', 'pila-enlazada': 'mueve la cima y hace free del nodo' } },
  { pregunta: 'Tamaño', r: { 'pila-array': 'cima + 1', 'pila-enlazada': 'el contador tamano' } },
];

const leerValores = (s: string, max: number) =>
  s
    .split(/[\s,;]+/)
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isInteger(n))
    .slice(0, max);

/** The stack from top to bottom. */
function mostrar(t: StackType, m: Memoria): string {
  const xs = readStack(t, m);
  if (xs === null) return 'La pila ya no existe: se ha liberado.';
  return `cima [${xs.map((x) => ' ' + x).join('')} ] fondo`;
}

export function StackPageRoute({ id }: { id: string }) {
  const t = buscarPila(id);
  if (!t) return <p className="contenido">No existe esa pila.</p>;
  return <StackPage key={t.id} tipo={t} />;
}

function StackPage({ tipo }: { tipo: StackType }) {
  const [opIdx, setOpIdx] = useState(0);
  const [texto, setTexto] = useState('1, 2, 3');
  const [valor, setValor] = useState(4);
  const op = tipo.operaciones[opIdx];
  const valores = useMemo(() => leerValores(texto, tipo.max), [texto, tipo.max]);
  const res = useMemo(() => runStackOp(tipo, op, { valores, valor }), [tipo, op, valores, valor]);
  const rep = useReproductor(res.pasos);
  useEffect(() => {
    rep.setIdx(0);
    rep.setEnMarcha(false);
  }, [res]); // eslint-disable-line react-hooks/exhaustive-deps

  const grupos = [...new Set(tipo.operaciones.map((o) => o.grupo))];
  const final = rep.idx >= res.pasos.length - 1;
  const valorMain = res.memFinal.marcos[0].vars.find((v) => v.nombre === 'valor')?.valor;
  const usaValor = op.args.includes('&valor');

  return (
    <main className="contenido ancho">
      <nav className="miga">
        <a href="#/">Temas</a>
        <span>/</span>
        <a href="#/ver">Visualizar</a>
      </nav>
      <div className="pestanas" role="tablist" aria-label="Tipo de pila">
        {PILAS.map((t) => (
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
            <summary>{tipo.enlazada ? 'Los structs' : 'El struct'}</summary>
            <EditorCodigo valor={structsOf(tipo)} soloLectura minLineas={1} etiquetaAria="Structs de la pila" />
          </details>
          {tipo.nota && (
            <p className="nota">
              <Rico texto={tipo.nota} />
            </p>
          )}
        </div>
        <div className="lienzo-memoria">
          <StackDrawing mem={buildStack(tipo, EJEMPLO_PILA)} tipo={tipo} titulo={`Ejemplo: ${tipo.nombre} tras apilar ${EJEMPLO_PILA.join(', ')}`} />
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
            Pila de partida
            <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="vacía" aria-describedby="ayuda-pila" />
            <span id="ayuda-pila" className="ayuda">
              Del fondo a la cima, hasta {tipo.max}; en blanco, vacía
            </span>
          </label>
        )}
        {op.args.includes('valor') && (
          <label>
            Valor a apilar
            <input type="number" value={valor} onChange={(e) => setValor(Number(e.target.value) || 0)} />
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
          <p className="nota">Las demás funciones de la pila (esVacia, esLLena, limpiar…) se ejecutan de un solo paso.</p>
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
            dibujar={(mem, prev) => <StackDrawing mem={mem} prev={prev} tipo={tipo} />}
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
              {usaValor && valorMain?.k === 'int' && (
                <>
                  En main, <code>valor = {valorMain.v}</code>.{' '}
                </>
              )}
              <span className="mono">{mostrar(tipo, res.memFinal)}</span>
            </div>
          )}
        </section>
      </div>
      <Leyenda />
    </main>
  );
}

/** Card and comparison table for the Visualizar landing page. */
export function StackGallery() {
  return (
    <>
      <section className="galeria-listas">
        {PILAS.map((t) => (
          <a key={t.id} className="tarjeta-lista" href={`#/ver/${t.id}`}>
            <span className="fila-tema">
              <strong>{t.nombre}</strong>
              <span className="cuenta">Ver operaciones →</span>
            </span>
            <span className="resumen">
              <Rico texto={t.resumen[0]} /> <Rico texto={t.resumen[1]} />
            </span>
            <span className="lienzo-memoria mini-lienzo">
              <StackDrawing mem={buildStack(t, EJEMPLO_PILA)} tipo={t} />
            </span>
          </a>
        ))}
      </section>
      <section className="panel compara">
        <h3>Las dos, cara a cara</h3>
        <div className="tabla-scroll">
          <table>
            <thead>
              <tr>
                <th />
                {PILAS.map((t) => (
                  <th key={t.id}>
                    <a href={`#/ver/${t.id}`}>{t.corto}</a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARA_PILAS.map((f) => (
                <tr key={f.pregunta}>
                  <th scope="row">{f.pregunta}</th>
                  {PILAS.map((t) => (
                    <td key={t.id}>{f.r[t.id]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
