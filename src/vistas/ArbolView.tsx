// Visualizar for the binary trees (topics 8 and 9): what a tree looks like in memory and its
// operations step by step, running Arbol.c from the Arboles project untouched. Recursion is
// seen through the calls in progress, listed above the drawing.

import { useEffect, useMemo, useState } from 'react';
import { verValor } from '../interprete/ejecutar';
import { Memoria, Valor } from '../memoria/modelo';
import { ARBOLES, buscarArbol, construirArbol, CTX_ARBOL, ejecutarOpArbol, formaDe, structsArbol, TipoArbol } from '../arboles/catalogo';
import { DibujoArbol } from '../arboles/DibujoArbol';
import { Rico } from './comun';
import { SelectorTipo } from './SelectorTipo';
import { Bloque, ElegirOperacion } from './BloqueVer';
import { EditorCodigo } from './EditorCodigo';
import { estadosLineas, Leyenda } from './piezas';
import { Reproductor, useReproductor } from './Reproductor';

const MAX = 12;

export const COMPARA_ARBOLES: { pregunta: string; r: Record<string, string> }[] = [
  { pregunta: 'Regla de orden', r: { 'arbol-binario': 'ninguna: cada nodo, hasta dos hijos', abb: 'izquierda < nodo < derecha, en cada nodo' } },
  { pregunta: 'Buscar un valor', r: { 'arbol-binario': 'hay que mirar los dos subárboles: O(n)', abb: 'un solo camino desde la raíz: O(altura)' } },
  { pregunta: 'Inorden', r: { 'arbol-binario': 'un orden cualquiera', abb: 'de menor a mayor' } },
  { pregunta: 'Dónde entra uno nuevo', r: { 'arbol-binario': 'donde decida quien lo programa', abb: 'siempre como hoja, en su sitio' } },
  { pregunta: 'Mínimo', r: { 'arbol-binario': 'recorrer todo el árbol', abb: 'bajar siempre por la izquierda' } },
];

const leerValores = (s: string) =>
  s
    .split(/[\s,;]+/)
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isInteger(n))
    .slice(0, MAX);

const raizDe = (m: Memoria): Valor | null => {
  const a = m.marcos[0].vars.find((v) => v.nombre === 'arbol')?.valor;
  if (!a || a.k !== 'ref' || a.r.k !== 'obj') return null;
  const o = m.objetos[a.r.id];
  return o.liberado ? null : (o.campos.raiz as Valor);
};

/** The tree as «8(3(1,6),10(,14))», or why there is none. */
function mostrar(m: Memoria): string {
  const r = raizDe(m);
  if (r === null) return 'El árbol ya no existe: se ha liberado.';
  if (r.k !== 'ref') return 'Árbol vacío (raiz = NULL)';
  return `Árbol: ${formaDe(m, r)}`;
}

/** A returned pointer, in words. */
function devuelto(v: Valor, m: Memoria): string {
  if (v.k === 'ref' && v.r.k === 'obj') {
    const x = m.objetos[v.r.id]?.campos.valor;
    return x && !Array.isArray(x) && x.k === 'int' ? `el nodo del ${x.v}` : 'un puntero';
  }
  return verValor(v);
}

export function ArbolPageRoute({ id }: { id: string }) {
  const t = buscarArbol(id);
  if (!t) return <p className="contenido">No existe ese árbol.</p>;
  return <ArbolPage key={t.id} tipo={t} />;
}

function ArbolPage({ tipo }: { tipo: TipoArbol }) {
  const [opIdx, setOpIdx] = useState(0);
  const [texto, setTexto] = useState(tipo.ejemplo.join(', '));
  const [valor, setValor] = useState(tipo.id === 'abb' ? 5 : 6);
  const op = tipo.operaciones[opIdx];
  const valores = useMemo(() => leerValores(texto), [texto]);
  const res = useMemo(() => ejecutarOpArbol(op, valores, valor), [op, valores, valor]);
  const rep = useReproductor(res.pasos);
  useEffect(() => {
    rep.setIdx(0);
    rep.setEnMarcha(false);
  }, [res]); // eslint-disable-line react-hooks/exhaustive-deps

  const final = rep.idx >= res.pasos.length - 1;
  const ejemplo = useMemo(() => construirArbol(tipo.ejemplo), [tipo]);

  return (
    <main className="contenido ancho">
      <SelectorTipo grupo="arboles" actual={tipo.id} opciones={ARBOLES} />
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
              <summary>Los structs</summary>
              <EditorCodigo valor={structsArbol()} soloLectura minLineas={1} etiquetaAria="Structs del árbol" />
            </details>
            <p className="nota">
              <Rico texto="Los campos del nodo se leen y se cambian con las funciones de `Nodo.c` (`obtenerValor`, `obtenerIzquierda`, `establecerDerecha`...), como en el proyecto. En el dibujo, la izquierda va siempre a la izquierda." />
            </p>
          </div>
          <div className="lienzo-memoria">
            <DibujoArbol mem={ejemplo} compacto titulo={`Ejemplo: el árbol tras insertar ${tipo.ejemplo.join(', ')}`} />
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
            Elige una operación y el árbol de partida: se ejecuta su código de <code>Arbol.c</code> línea a línea. Arriba del dibujo salen las llamadas recursivas en curso, y los nodos con los que trabajan van sombreados. Con las flechas ← → del teclado también se avanza.
          </>
        }
      >
        <section className="panel form-op">
          <ElegirOperacion operaciones={tipo.operaciones} actual={opIdx} onChange={setOpIdx} />
          {!op.crea && (
            <label>
              Árbol de partida
              <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="vacío" aria-describedby="ayuda-arbol" />
              <span id="ayuda-arbol" className="ayuda">
                Se insertan en este orden, como en un ABB (hasta {MAX}); en blanco, vacío
              </span>
            </label>
          )}
          {op.args.includes('valor') && (
            <label>
              Valor
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
              <span className="nota">de Arbol.c</span>
            </div>
            <EditorCodigo valor={res.codigo} soloLectura estados={estadosLineas(res.pasos, rep.idx)} etiquetaAria="Código de la operación" />
            <p className="nota">Las funciones de Nodo.c y las demás de Arbol.c (buscar, minimo...) se ejecutan de un solo paso.</p>
          </section>
          <section className="panel panel-memoria">
            <div className="panel-cab">
              <h2>Memoria</h2>
            </div>
            <Reproductor teclas controlesArriba pasos={res.pasos} rep={rep} ctx={CTX_ARBOL} memInicial={res.inicial} dibujar={(mem, prev) => <DibujoArbol mem={mem} prev={prev} />} />
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
                    Devuelve <strong>{devuelto(res.devuelve, res.memFinal)}</strong>.{' '}
                  </>
                )}
                {res.memFinal.salida && (
                  <>
                    Escribe <strong className="mono">{res.memFinal.salida.trim()}</strong>.{' '}
                  </>
                )}
                <span className="mono">{mostrar(res.memFinal)}</span>
              </div>
            )}
          </section>
        </div>
        <Leyenda />
      </Bloque>
    </main>
  );
}

/** Cards and comparison table for the Visualizar landing page. */
export function ArbolGallery() {
  return (
    <>
      <section className="galeria-listas">
        {ARBOLES.map((t) => (
          <a key={t.id} className="tarjeta-lista" href={`#/ver/${t.id}`}>
            <span className="fila-tema">
              <strong>{t.nombre}</strong>
              <span className="cuenta">Ver operaciones →</span>
            </span>
            <span className="resumen">
              <Rico texto={t.resumen[0]} />
            </span>
            <span className="lienzo-memoria mini-lienzo">
              <DibujoArbol mem={construirArbol(t.ejemplo)} compacto />
            </span>
          </a>
        ))}
      </section>
      <section className="panel compara">
        <h3>Los dos, cara a cara</h3>
        <div className="tabla-scroll">
          <table>
            <thead>
              <tr>
                <th />
                {ARBOLES.map((t) => (
                  <th key={t.id}>
                    <a href={`#/ver/${t.id}`}>{t.corto}</a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARA_ARBOLES.map((f) => (
                <tr key={f.pregunta}>
                  <th scope="row">{f.pregunta}</th>
                  {ARBOLES.map((t) => (
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
