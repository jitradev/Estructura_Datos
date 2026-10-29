import { useEffect, useState } from 'react';
import { buscarEjercicio } from '../ejercicios/registro';
import { Ejercicio } from '../ejercicios/tipos';
import { marcarResuelto, useResueltos } from '../progreso';
import { Rico } from './comun';
import { Coste } from './tipos/Coste';
import { Fallo } from './tipos/Fallo';
import { Misterio } from './tipos/Misterio';
import { Programar } from './tipos/Programar';
import { Miga } from './Miga';

export function nombreTipo(e: Ejercicio): string {
  if (e.tipo === 'fallo') return 'Encuentra el fallo';
  if (e.tipo === 'coste') return 'Calcula el coste';
  if (e.tipo === 'misterio') return 'Función misteriosa';
  return e.codigoInicial && e.codigoInicial.includes('(') ? 'Escribe la función' : 'Programar a mano';
}

export function EjercicioPagina({ id }: { id: string }) {
  const r = buscarEjercicio(id);
  const resueltos = useResueltos();
  const [pistas, setPistas] = useState(0);
  const [celebrar, setCelebrar] = useState(false);
  useEffect(() => {
    setPistas(0);
    setCelebrar(false);
    window.scrollTo(0, 0);
  }, [id]);
  if (!r)
    return (
      <p className="contenido">
        No existe ese ejercicio. <a href="#/">Volver</a>
      </p>
    );
  const { tema, ejercicio: ej, indice } = r;
  const anterior = tema.ejercicios[indice - 1];
  const siguiente = tema.ejercicios[indice + 1];
  const resuelto = resueltos.has(ej.id);
  const onResuelto = () => {
    marcarResuelto(ej.id);
    setCelebrar(true);
  };

  return (
    <main className="contenido ancho ejercicio">
      <Miga
        pasos={[
          ['Temas', '#/'],
          [`Tema ${tema.id} · ${tema.titulo}`, `#/tema/${tema.id}`],
        ]}
      />
      <header className="cabecera-ej">
        <div>
          <span className={`etiqueta-tipo ${ej.tipo}`}>{nombreTipo(ej)}</span>
          <h1>
            <span className="num-ej">{ej.id}</span> {ej.titulo}
          </h1>
        </div>
        {resuelto && <span className="sello grande">Resuelto</span>}
      </header>
      <p className="enunciado">
        <Rico texto={ej.enunciado} />
      </p>
      {ej.pistas && ej.pistas.length > 0 && (
        <div className="pistas">
          {ej.pistas.slice(0, pistas).map((p, i) => (
            <p key={i} className="pista">
              <strong>Pista {i + 1}.</strong> <Rico texto={p} />
            </p>
          ))}
          {pistas < ej.pistas.length && (
            <button className="btn-texto" onClick={() => setPistas(pistas + 1)}>
              {pistas === 0 ? 'Ver una pista' : 'Otra pista'}
            </button>
          )}
        </div>
      )}

      {ej.tipo === 'programar' ? (
        <Programar key={ej.id} ej={ej} onResuelto={onResuelto} />
      ) : ej.tipo === 'fallo' ? (
        <Fallo key={ej.id} ej={ej} onResuelto={onResuelto} />
      ) : ej.tipo === 'misterio' ? (
        <Misterio key={ej.id} ej={ej} onResuelto={onResuelto} />
      ) : (
        <Coste key={ej.id} ej={ej} onResuelto={onResuelto} />
      )}

      {celebrar && (
        <div className="aviso-resuelto" role="status">
          <strong>¡Ejercicio resuelto!</strong>
          {ej.alResolver && (
            <p>
              <Rico texto={ej.alResolver} />
            </p>
          )}
          {siguiente && (
            <a className="btn" href={`#/ej/${siguiente.id}`}>
              Siguiente ejercicio →
            </a>
          )}
        </div>
      )}

      <nav className="pie-nav">
        {anterior ? <a href={`#/ej/${anterior.id}`}>← {anterior.titulo}</a> : <span />}
        {siguiente ? <a href={`#/ej/${siguiente.id}`}>{siguiente.titulo} →</a> : <span />}
      </nav>
    </main>
  );
}
