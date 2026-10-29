import { useEffect, useState } from 'react';
import { EjercicioPagina } from './vistas/EjercicioPagina';
import { Inicio, TemaPagina } from './vistas/Inicio';
import { Laboratorio } from './vistas/Laboratorio';
import { Visualizar, VisualizarLista } from './vistas/Visualizar';
import { StackPageRoute } from './vistas/StackView';
import { QueuePageRoute } from './vistas/QueueView';
import { temaVisible } from './ejercicios/registro';

// Enrutado con # para que funcione en cualquier alojamiento estático (Vercel incluido).
function useRuta() {
  const [ruta, setRuta] = useState(() => window.location.hash.slice(1) || '/');
  useEffect(() => {
    const f = () => setRuta(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return ruta;
}

export function App() {
  const ruta = useRuta();
  let pagina;
  const partes = ruta.split('/').filter(Boolean);
  if (partes[0] === 'ej' && partes[1]) pagina = <EjercicioPagina id={decodeURIComponent(partes[1])} />;
  else if (partes[0] === 'tema' && partes[1]) pagina = <TemaPagina id={decodeURIComponent(partes[1])} />;
  else if (partes[0] === 'lab') pagina = <Laboratorio modo={partes[1] === 'coste' ? 'coste' : 'memoria'} />;
  else if (partes[0] === 'ver' && partes[1]?.startsWith('pila') && temaVisible('3')) pagina = <StackPageRoute id={decodeURIComponent(partes[1])} />;
  else if (partes[0] === 'ver' && /^(cola|bicola)/.test(partes[1] ?? '') && temaVisible('4')) pagina = <QueuePageRoute id={decodeURIComponent(partes[1])} />;
  else if (partes[0] === 'ver' && partes[1]) pagina = <VisualizarLista id={decodeURIComponent(partes[1])} />;
  else if (partes[0] === 'ver') pagina = <Visualizar />;
  else pagina = <Inicio />;
  return (
    <>
      <header className="cabecera">
        <a href="#/" className="marca">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="2" y="8" width="9" height="10" rx="2" />
            <rect x="15" y="8" width="9" height="10" rx="2" />
            <path d="M11 13h4" />
          </svg>
          <span>
            EDA <em>· ejercicios</em>
          </span>
        </a>
        <nav>
          <a href="#/">Temas</a>
          <a href="#/ver">Visualizar</a>
          <a href="#/lab">Laboratorio</a>
        </nav>
      </header>
      {pagina}
    </>
  );
}
