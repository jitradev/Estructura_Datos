import { useState } from 'react';
import { TEMAS } from '../ejercicios/registro';
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

/** How many exercises of each kind a topic has, for the chips of its card. */
function cuentas(es: Ejercicio[]): [string, number][] {
  const n = (f: (e: Ejercicio) => boolean) => es.filter(f).length;
  return (
    [
      ['de programar', n((e) => e.tipo === 'programar')],
      ['de fallos', n((e) => e.tipo === 'fallo')],
      ['misteriosas', n((e) => e.tipo === 'misterio')],
      ['de coste', n((e) => e.tipo === 'coste')],
    ] as [string, number][]
  ).filter(([, k]) => k > 0);
}

export function Inicio() {
  const resueltos = useResueltos();
  return (
    <main className="contenido">
      <Miga pasos={[['Inicio', '#/']]} />
      <h1>Ejercicios</h1>
      <p className="entradilla">
        Elige un tema. Escribe las sentencias, pulsa «Ejecutar» y mira cómo cambia la memoria línea a línea; si algo falla (un NULL, un nodo ya liberado, una fuga), la
        animación se para justo ahí. Tu progreso se guarda en este navegador.
      </p>
      <section className="temas">
        {TEMAS.map((t) => {
          const h = t.ejercicios.filter((e) => resueltos.has(e.id)).length;
          const n = t.ejercicios.length;
          return (
            <a key={t.id} className={`tarjeta-tema ${h === n ? 'completo' : ''}`} href={`#/tema/${t.id}`}>
              <span className="cab-tema">
                <span className="num-grande" aria-hidden>
                  {t.id}
                </span>
                <span>
                  <span className="num-tema">Tema {t.id}</span>
                  <strong>{t.titulo}</strong>
                </span>
              </span>
              <span className="resumen">{t.resumen}</span>
              <span className="chips-tema">
                {cuentas(t.ejercicios).map(([nombre, k]) => (
                  <span key={nombre} className="chip-tema">
                    <b>{k}</b> {nombre}
                  </span>
                ))}
              </span>
              <span className="mini-dibujo">{DIBUJOS[t.id]}</span>
              <span className="pie-tema">
                <span className="progreso">
                  <span className="barra-prog">
                    <span style={{ width: `${(100 * h) / n}%` }} />
                  </span>
                  {h} / {n}
                </span>
                <span className="cta-tema">{h === n ? '✓ Completado' : h ? 'Continuar →' : 'Empezar →'}</span>
              </span>
            </a>
          );
        })}
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
  const [filtro, setFiltro] = useState<string | null>(null);
  const [pendientes, setPendientes] = useState(false);
  const tema = TEMAS.find((t) => t.id === id);
  if (!tema) return <p className="contenido">No existe ese tema.</p>;
  const grupos = [...GRUPOS, ...new Set(tema.ejercicios.map(grupo))].filter((g, i, gs) => gs.indexOf(g) === i && tema.ejercicios.some((e) => grupo(e) === g));
  const hechos = tema.ejercicios.filter((e) => resueltos.has(e.id)).length;
  const total = tema.ejercicios.length;
  const siguiente = tema.ejercicios.find((e) => !resueltos.has(e.id));
  return (
    <main className="contenido">
      <Miga pasos={[['Ejercicios', '#/temas']]} />
      <header className="cab-pagina-tema">
        <span className="num-grande" aria-hidden>
          {tema.id}
        </span>
        <div>
          <span className="num-tema">Tema {tema.id}</span>
          <h1>{tema.titulo}</h1>
          <p className="entradilla">{tema.resumen}</p>
        </div>
      </header>

      <section className="panel resumen-tema">
        <div className="progreso grande">
          <span className="barra-prog">
            <span style={{ width: `${(100 * hechos) / total}%` }} />
          </span>
          <span>
            <b>{hechos}</b> de {total} hechos
          </span>
        </div>
        {siguiente ? (
          <a className="btn" href={`#/ej/${siguiente.id}`}>
            {hechos ? 'Seguir' : 'Empezar'} con {siguiente.id} →
          </a>
        ) : (
          <span className="tema-completo">✓ Tema completado</span>
        )}
      </section>

      <div className="filtros-tema">
        <nav className="filtro-tipos" aria-label="Tipo de ejercicio">
          <button className={filtro === null ? 'on' : ''} aria-pressed={filtro === null} onClick={() => setFiltro(null)}>
            Todos
            <span className="cuenta-filtro">{total}</span>
          </button>
          {grupos.map((g) => (
            <button key={g} className={filtro === g ? 'on' : ''} aria-pressed={filtro === g} onClick={() => setFiltro(g)}>
              {g}
              <span className="cuenta-filtro">{tema.ejercicios.filter((e) => grupo(e) === g).length}</span>
            </button>
          ))}
        </nav>
        <label className="solo-pendientes">
          <input type="checkbox" checked={pendientes} onChange={(e) => setPendientes(e.target.checked)} /> Solo los pendientes
        </label>
      </div>

      {grupos
        .filter((g) => filtro === null || filtro === g)
        .map((g) => {
          const todos = tema.ejercicios.filter((e) => grupo(e) === g);
          const es = todos.filter((e) => !pendientes || !resueltos.has(e.id));
          const h = todos.filter((e) => resueltos.has(e.id)).length;
          return (
            <section key={g} className="grupo-ej">
              <h2>
                <span>{g}</span>
                <span className="cuenta-grupo">
                  {h} / {todos.length}
                </span>
              </h2>
              {es.length ? (
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
              ) : (
                <p className="nota">Todos hechos.</p>
              )}
            </section>
          );
        })}
    </main>
  );
}
