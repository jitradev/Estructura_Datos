import { nombreTemasVisibles, TEMAS, temaVisible } from '../ejercicios/registro';
import { Ejercicio } from '../ejercicios/tipos';
import { borrarProgreso, useResueltos } from '../progreso';
import { nombreTipo } from './EjercicioPagina';
import { Miga } from './Miga';

const DIBUJOS: Record<string, JSX.Element> = {
  '2': (
    <svg viewBox="0 0 300 44" aria-hidden>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${i * 88} 8)`}>
          <rect width="36" height="28" rx="4" className="mini" />
          <rect x="36" width="22" height="28" rx="4" className="mini" />
          <text x="18" y="19" className="mini-t">
            {[9, 3, 7][i]}
          </text>
          <path d={i < 2 ? 'M47 14h36' : 'M47 14h26'} className="mini-l" />
        </g>
      ))}
      <text x="252" y="27" className="mini-n">
        NULL
      </text>
    </svg>
  ),
  '3': (
    <svg viewBox="0 0 300 44" aria-hidden>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect x={1 + i * 40} y="8" width="40" height="28" className={i < 3 ? 'mini' : 'mini apagado'} />
          {i < 3 && (
            <text x={21 + i * 40} y="27" className="mini-t">
              {[4, 1, 8][i]}
            </text>
          )}
        </g>
      ))}
      <text x="248" y="27" className="mini-n">
        cima=2
      </text>
    </svg>
  ),
  '4': (
    <svg viewBox="0 0 300 44" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={1 + i * 44} y="8" width="44" height="28" className="mini" />
          {i !== 1 && (
            <text x={23 + i * 44} y="27" className="mini-t">
              {[2, 0, 8, 4, 9][i]}
            </text>
          )}
        </g>
      ))}
      <text x="232" y="27" className="mini-n">
        % TAM
      </text>
    </svg>
  ),
  '5': (
    <svg viewBox="0 0 300 44" aria-hidden>
      <path d="M4 40h200M4 40V4" className="mini-l" />
      <path d="M4 40C60 38 120 34 196 30" className="mini-l" />
      <path d="M4 40L196 12" className="mini-l" />
      <path d="M4 40C90 39 140 30 160 4" className="mini-l" />
      <text x="214" y="27" className="mini-n">
        O(n²)
      </text>
    </svg>
  ),
};

function cuenta(es: Ejercicio[]) {
  if (es.every((e) => e.tipo === 'coste')) return `${es.length} de coste`;
  const f = es.filter((e) => e.tipo === 'fallo').length;
  const m = es.filter((e) => e.tipo === 'misterio').length;
  return `${es.length - f - m} de programar · ${f} de fallos${m ? ` · ${m} misteriosas` : ''}`;
}

export function Inicio() {
  const resueltos = useResueltos();
  return (
    <main className="contenido">
      <section className="portada">
        <p className="antetitulo">Estructura de Datos y Algoritmos · Universidad San Jorge</p>
        <h1>{nombreTemasVisibles()}, paso a paso</h1>
        <p className="entradilla">
          Escribe las sentencias, pulsa «Ejecutar» y mira cómo cambia la memoria línea a línea. Si algo falla (un NULL, un nodo ya liberado, una fuga), la
          animación se para justo ahí. Tu progreso se guarda en este navegador.
        </p>
      </section>
      <section className="temas">
        {TEMAS.map((t) => {
          const h = t.ejercicios.filter((e) => resueltos.has(e.id)).length;
          const n = t.ejercicios.length;
          return (
            <a key={t.id} className="tarjeta-tema" href={`#/tema/${t.id}`}>
              <span className="fila-tema">
                <span className="num-tema">Tema {t.id}</span>
                <span className="cuenta">{cuenta(t.ejercicios)}</span>
              </span>
              <strong>{t.titulo}</strong>
              <span className="resumen">{t.resumen}</span>
              <span className="mini-dibujo">{DIBUJOS[t.id]}</span>
              <span className="progreso">
                <span className="barra-prog">
                  <span style={{ width: `${(100 * h) / n}%` }} />
                </span>
                {h} / {n}
              </span>
            </a>
          );
        })}
      </section>
      <section className="lab-link">
        <a href="#/ver" className="tarjeta-tema ancha">
          <strong>Visualizar</strong>
          <span className="resumen">
            {['Las cuatro listas del TAD', temaVisible('3') && 'las dos pilas', temaVisible('4') && 'las colas, bicolas y colas con prioridad'].filter(Boolean).join(', ').replace(/, ([^,]*)$/, ' y $1')}: cómo se ve cada una en memoria y sus operaciones paso a paso, con su código.
          </span>
        </a>
        <a href="#/lab" className="tarjeta-tema ancha">
          <strong>Laboratorio</strong>
          <span className="resumen">
            Elige {['una lista', temaVisible('3') && 'una pila', temaVisible('4') && 'una cola'].filter(Boolean).join(', ').replace(/, ([^,]*)$/, ' o $1')}, escribe lo que quieras y mira qué pasa en la memoria. Sin corrección.
            {temaVisible('5') && ' Y una calculadora de O(n) para tus bucles.'}
          </span>
        </a>
      </section>
      <p className="nota pie">
        <button
          className="btn-texto"
          onClick={() => {
            let ok = false;
            try {
              ok = window.confirm('¿Borrar todo el progreso y los borradores guardados en este navegador?');
            } catch {
              ok = false;
            }
            if (ok) borrarProgreso();
          }}
        >
          Borrar mi progreso
        </button>
      </p>
    </main>
  );
}

const GRUPOS = ['Programar a mano', 'Escribe la función', 'Encuentra el fallo', 'Función misteriosa'];

/** Section of the topic page: the exercise type, or its block for the cost ones. */
const grupo = (e: Ejercicio) => (e.tipo === 'coste' ? e.bloque : nombreTipo(e));

export function TemaPagina({ id }: { id: string }) {
  const resueltos = useResueltos();
  const tema = TEMAS.find((t) => t.id === id);
  if (!tema) return <p className="contenido">No existe ese tema.</p>;
  return (
    <main className="contenido">
      <Miga pasos={[['Temas', '#/']]} />
      <h1>
        <span className="num-ej">Tema {tema.id}</span> {tema.titulo}
      </h1>
      <p className="entradilla">{tema.resumen}</p>
      {[...GRUPOS, ...new Set(tema.ejercicios.map(grupo))].filter((g, i, gs) => gs.indexOf(g) === i).map((g) => {
        const es = tema.ejercicios.filter((e) => grupo(e) === g);
        if (!es.length) return null;
        return (
          <section key={g} className="grupo-ej">
            <h2>{g}</h2>
            <ol className="lista-ej">
              {es.map((e) => (
                <li key={e.id}>
                  <a href={`#/ej/${e.id}`} className={resueltos.has(e.id) ? 'resuelto' : ''}>
                    <span className="check" aria-label={resueltos.has(e.id) ? 'resuelto' : 'pendiente'}>
                      {resueltos.has(e.id) ? '✓' : ''}
                    </span>
                    <span className="num-ej">{e.id}</span>
                    <span className="tit">{e.titulo}</span>
                  </a>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </main>
  );
}
