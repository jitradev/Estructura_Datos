// Visualizar: landing page (lists, stacks and queues) and the page of each list, with its
// operations step by step running the .c code untouched in the interpreter.

import { useEffect, useMemo, useState } from 'react';
import { comentarioDe, LISTAS, buscarLista, Operacion, TipoLista } from '../listas/catalogo';
import { DibujoLista } from '../listas/DibujoLista';
import { construirLista, ejecutarOperacion, leerLista, memoriaDe, Parametros, structsDe } from '../listas/preparar';
import { verValor } from '../interprete/ejecutar';
import { Memoria, Valor } from '../memoria/modelo';
import { EditorCodigo } from './EditorCodigo';
import { Rico } from './comun';
import { GrupoVer, NOMBRE_GRUPO } from './SelectorTipo';
import { PILAS } from '../stacks/catalog';
import { COLAS } from '../queues/catalog';
import { SelectorTipo } from './SelectorTipo';
import { estadosLineas, Leyenda } from './piezas';
import { temaVisible } from '../ejercicios/registro';
import { StackGallery } from './StackView';
import { QueueGallery } from './QueueView';
import { Reproductor, useReproductor } from './Reproductor';

const COMPARA: { pregunta: string; r: Record<string, string> }[] = [
  { pregunta: 'Enlaces por nodo', r: { simple: '1: siguiente', doble: '2: siguiente y anterior', circular: '1: siguiente', 'circular-doble': '2: siguiente y anterior' } },
  { pregunta: 'Qué guarda la lista', r: { simple: 'cabeza', doble: 'cabeza y cola', circular: 'acceso = el último', 'circular-doble': 'acceso = el primero' } },
  { pregunta: '¿Hay NULL?', r: { simple: 'el siguiente del último', doble: 'el anterior del primero y el siguiente del último', circular: 'no: el último vuelve al primero', 'circular-doble': 'no: ninguno' } },
  { pregunta: 'Insertar al final', r: { simple: 'recorre toda la lista', doble: 'directo, por la cola', circular: 'directo: detrás del acceso', 'circular-doble': 'directo: delante del acceso' } },
  { pregunta: 'Quitar un nodo', r: { simple: 'hay que buscar su anterior', doble: 'el nodo ya sabe su anterior', circular: 'hay que buscar su anterior', 'circular-doble': 'el nodo ya sabe su anterior' } },
];

// ---------------------------------------------------------------- portada de la sección

export function Visualizar({ grupo = 'listas' }: { grupo?: GrupoVer }) {
  const grupos = GRUPOS.filter((g) => g.visible());
  const actual = grupos.find((g) => g.id === grupo) ?? grupos[0];
  return (
    <main className="contenido ancho">
      <nav className="miga">
        <a href="#/">Temas</a>
      </nav>
      <h1>Visualizar</h1>
      <p className="entradilla">
        Cómo se ve cada estructura en memoria, con sus structs tal cual. Entra en cualquiera para ver sus operaciones paso a paso: se ejecuta el código de los{' '}
        <code>.c</code> línea a línea.
      </p>
      {grupos.length > 1 && (
        <nav className="filtro-tipos" aria-label="Tipo de estructura">
          {grupos.map((g) => (
            <a key={g.id} href={`#/ver/${g.id}`} className={g.id === actual.id ? 'on' : ''} aria-current={g.id === actual.id ? 'page' : undefined}>
              {NOMBRE_GRUPO[g.id]}
              <span className="cuenta-filtro">{g.cuantas}</span>
            </a>
          ))}
        </nav>
      )}
      {actual.id === 'listas' && <ListGallery />}
      {actual.id === 'pilas' && <StackGallery />}
      {actual.id === 'colas' && <QueueGallery />}
    </main>
  );
}

const GRUPOS: { id: GrupoVer; cuantas: number; visible: () => boolean }[] = [
  { id: 'listas', cuantas: LISTAS.length, visible: () => true },
  { id: 'pilas', cuantas: PILAS.length, visible: () => temaVisible('3') },
  { id: 'colas', cuantas: COLAS.length, visible: () => temaVisible('4') },
];

/** Cards and comparison table of the four lists. */
function ListGallery() {
  return (
    <>
      <section className="galeria-listas">
        {LISTAS.map((t) => (
          <a key={t.id} className="tarjeta-lista" href={`#/ver/${t.id}`}>
            <span className="fila-tema">
              <strong>{t.nombre}</strong>
              <span className="cuenta">Ver operaciones →</span>
            </span>
            <span className="resumen">
              <Rico texto={t.resumen[0]} /> <Rico texto={t.resumen[1]} />
            </span>
            <span className="lienzo-memoria mini-lienzo">
              <DibujoLista mem={construirLista(t, t.ejemplo)} tipo={t} compacto />
            </span>
          </a>
        ))}
      </section>
      <section className="panel compara">
        <h3>Las cuatro, cara a cara</h3>
        <div className="tabla-scroll">
          <table>
            <thead>
              <tr>
                <th />
                {LISTAS.map((t) => (
                  <th key={t.id}>
                    <a href={`#/ver/${t.id}`}>{t.corto}</a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARA.map((f) => (
                <tr key={f.pregunta}>
                  <th scope="row">{f.pregunta}</th>
                  {LISTAS.map((t) => (
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

// ---------------------------------------------------------------- una lista

const leerValores = (s: string) =>
  s
    .split(/[\s,;]+/)
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isInteger(n))
    .slice(0, 7);

/** La lista como la imprime su función mostrar. */
function mostrar(t: TipoLista, m: Memoria): string {
  const v = m.marcos[0].vars.find((x) => x.nombre === 'lista')?.valor;
  if (v?.k === 'ref' && v.r.k === 'obj' && m.objetos[v.r.id].liberado) return 'La lista se ha liberado entera: ya no se puede usar.';
  const xs = leerLista(t, m);
  const flecha = t.doble ? ' <-> ' : ' -> ';
  const nombre = { simple: 'Lista', doble: 'Lista doble', circular: 'Lista circular', 'circular-doble': 'Lista circular doble' }[t.id];
  if (t.circular) return `${nombre}: ${xs.length ? xs.join(flecha) + `${flecha}(vuelve al ${xs[0]})` : '(vacia)'}`;
  return `${nombre}: ${[...xs, 'NULL'].join(flecha)}`;
}

/** Lo que devuelve, en palabras: un número o el nodo al que apunta. */
function devuelto(v: Valor, m: Memoria): string {
  if (v.k === 'ref' && v.r.k === 'obj') {
    const x = m.objetos[v.r.id]?.campos.valor;
    return x && !Array.isArray(x) && x.k === 'int' ? `el nodo del ${x.v}` : 'un puntero';
  }
  return verValor(v);
}

export function VisualizarLista({ id }: { id: string }) {
  const tipo = buscarLista(id);
  if (!tipo) return <p className="contenido">No existe esa lista.</p>;
  return <PaginaLista key={tipo.id} tipo={tipo} />;
}

function PaginaLista({ tipo }: { tipo: TipoLista }) {
  const [opIdx, setOpIdx] = useState(0);
  const [texto, setTexto] = useState('10, 20, 30, 40');
  const [nuevo, setNuevo] = useState(99);
  const [posicion, setPosicion] = useState(2);
  const [valor, setValor] = useState(30);
  const [nodo, setNodo] = useState(1);

  const op: Operacion = tipo.operaciones[opIdx];
  const valores = useMemo(() => leerValores(texto), [texto]);
  const p: Parametros = { valores, nuevo, posicion, valor, nodo: Math.min(nodo, Math.max(0, valores.length - 1)) };
  const clave = JSON.stringify([tipo.id, opIdx, p]);
  const inicial = useMemo(() => memoriaDe(tipo, op, p), [clave]); // eslint-disable-line react-hooks/exhaustive-deps
  const res = useMemo(() => ejecutarOperacion(tipo, op, p, inicial), [inicial]); // eslint-disable-line react-hooks/exhaustive-deps
  const rep = useReproductor(res.pasos);
  useEffect(() => {
    rep.setIdx(0);
    rep.setEnMarcha(false);
  }, [res]); // eslint-disable-line react-hooks/exhaustive-deps

  const grupos = [...new Set(tipo.operaciones.map((o) => o.grupo))];
  const final = rep.idx >= res.pasos.length - 1;
  const comentario = comentarioDe(tipo, op.base);
  const sinNodos = op.args.includes('nodo') && !valores.length;

  return (
    <main className="contenido ancho">
      <SelectorTipo grupo="listas" actual={tipo.id} opciones={LISTAS} />
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
            <summary>Los structs</summary>
            <EditorCodigo valor={structsDe(tipo)} soloLectura minLineas={1} etiquetaAria="Structs de la lista" />
          </details>
        </div>
        <div className="lienzo-memoria">
          <DibujoLista mem={construirLista(tipo, tipo.ejemplo)} tipo={tipo} compacto titulo={`Ejemplo: ${tipo.nombre} con ${tipo.ejemplo.join(', ')}`} />
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
                    <option key={o.base} value={i}>
                      {o.titulo}
                    </option>
                  ) : null,
                )}
              </optgroup>
            ))}
          </select>
        </label>
        <label>
          Lista de partida
          <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="vacía" aria-describedby="ayuda-lista" />
          <span id="ayuda-lista" className="ayuda">
            Hasta 7 números; en blanco, vacía
          </span>
        </label>
        {op.args.includes('nuevo') && (
          <label>
            Valor del nodo nuevo
            <input type="number" value={nuevo} onChange={(e) => setNuevo(Number(e.target.value) || 0)} />
          </label>
        )}
        {op.args.includes('posicion') && (
          <label>
            Posición
            <input type="number" value={posicion} onChange={(e) => setPosicion(Number(e.target.value) || 0)} />
          </label>
        )}
        {op.args.includes('valor') && (
          <label>
            {op.grupo === 'Inserción' ? 'Tras el valor' : 'Valor'}
            <input type="number" value={valor} onChange={(e) => setValor(Number(e.target.value) || 0)} />
          </label>
        )}
        {op.args.includes('nodo') && (
          <label>
            Nodo
            <select value={p.nodo} onChange={(e) => setNodo(Number(e.target.value))} disabled={sinNodos}>
              {valores.map((v, i) => (
                <option key={i} value={i}>
                  posición {i} (el {v})
                </option>
              ))}
            </select>
          </label>
        )}
        <p className="llamada-op">
          Desde main: <code>{res.llamada};</code>
          {comentario && <span className="nota"> {comentario}</span>}
        </p>
      </section>

      <div className="ej-rejilla ver-rejilla">
        <section className="panel panel-codigo">
          <div className="panel-cab">
            <h2>Código</h2>
            <span className="nota">de {tipo.lista}.c</span>
          </div>
          <EditorCodigo valor={res.codigo} soloLectura estados={estadosLineas(res.pasos, rep.idx)} etiquetaAria="Código de la operación" />
          <p className="nota">Las funciones del TAD Nodo y las de consulta se ejecutan de un solo paso.</p>
        </section>
        <section className="panel panel-memoria">
          <div className="panel-cab">
            <h2>Memoria</h2>
          </div>
          <Reproductor
            pasos={res.pasos}
            rep={rep}
            ctx={tipo.ctx}
            memInicial={inicial}
            dibujar={(mem, prev) => <DibujoLista mem={mem} prev={prev} tipo={tipo} />}
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
                  Devuelve <strong>{devuelto(res.devuelve, res.memFinal)}</strong>.{' '}
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
