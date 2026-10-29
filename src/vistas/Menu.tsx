// Main menu: the three parts of the app, Ejercicios (the topics), Visualizar and Laboratorio.

import { nombreTemasVisibles, TEMAS, temaVisible } from '../ejercicios/registro';
import { useResueltos } from '../progreso';

const lista = (xs: (string | false)[], y: string) => {
  const n = xs.filter(Boolean) as string[];
  return n.length > 1 ? `${n.slice(0, -1).join(', ')} ${y} ${n[n.length - 1]}` : (n[0] ?? '');
};

export function Menu() {
  const resueltos = useResueltos();
  const total = TEMAS.reduce((s, t) => s + t.ejercicios.length, 0);
  const hechos = TEMAS.reduce((s, t) => s + t.ejercicios.filter((e) => resueltos.has(e.id)).length, 0);
  return (
    <main className="contenido">
      <section className="portada">
        <p className="antetitulo">Universidad San Jorge · Ejercicios y visualizaciones</p>
        <h1>Estructura de Datos</h1>
        <p className="entradilla">{nombreTemasVisibles()}, paso a paso: escribe el código, ejecútalo y mira cómo cambia la memoria línea a línea. ¿Por dónde empiezas?</p>
      </section>
      <nav className="menu-principal" aria-label="Menú principal">
        <a href="#/temas" className="boton-menu ejercicios">
          <span className="icono-menu" aria-hidden>
            <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="7" y="5" width="26" height="30" rx="4" />
              <path d="M13 14l3 3 6-6M13 25h14" />
            </svg>
          </span>
          <strong>Ejercicios</strong>
          <span className="resumen">Por temas: {temaVisible('1') ? 'especificar TAD, ' : ''}programar a mano, escribir funciones, encontrar fallos y funciones misteriosas{temaVisible('5') ? ', y el coste de algoritmos' : ''}. Se corrigen solos.</span>
          <span className="pie-menu">
            <span className="progreso">
              <span className="barra-prog">
                <span style={{ width: `${(100 * hechos) / total}%` }} />
              </span>
              {hechos} / {total}
            </span>
            <span className="cta-tema">{hechos ? 'Seguir →' : 'Empezar →'}</span>
          </span>
        </a>
        <a href="#/ver" className="boton-menu">
          <span className="icono-menu" aria-hidden>
            <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="14" width="10" height="12" rx="2" />
              <rect x="27" y="14" width="10" height="12" rx="2" />
              <path d="M13 20h12M21 16l4 4-4 4" />
            </svg>
          </span>
          <strong>Visualizar</strong>
          <span className="resumen">
            {lista(['Las cuatro listas', temaVisible('3') && 'las dos pilas', temaVisible('4') && 'las siete colas'], 'y')}: cómo es cada una en memoria y sus operaciones paso a paso, con el código del proyecto.
          </span>
          <span className="pie-menu">
            <span className="cta-tema">Ver estructuras →</span>
          </span>
        </a>
        <a href="#/lab" className="boton-menu">
          <span className="icono-menu" aria-hidden>
            <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 5h8M17 5v11L8 32a2.5 2.5 0 0 0 2 4h20a2.5 2.5 0 0 0 2-4L23 16V5M12 26h16" />
            </svg>
          </span>
          <strong>Laboratorio</strong>
          <span className="resumen">
            Elige {lista(['una lista', temaVisible('3') && 'una pila', temaVisible('4') && 'una cola'], 'o')} vacía y escribe lo que quieras: sin corrección, para probar.
            {temaVisible('5') && ' Y una calculadora de O(n).'}
          </span>
          <span className="pie-menu">
            <span className="cta-tema">Abrir el laboratorio →</span>
          </span>
        </a>
      </nav>
    </main>
  );
}
