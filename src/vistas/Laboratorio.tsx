import { Fragment, useMemo, useState } from 'react';
import { ejecutar, Resultado } from '../interprete/ejecutar';
import { temaVisible } from '../ejercicios/registro';
import { EditorCodigo } from './EditorCodigo';
import { estadosLineas } from './piezas';
import { Reproductor, useReproductor } from './Reproductor';
import { CalculadoraCoste } from './CalculadoraCoste';
import { Rico } from './comun';
import { GrupoMesa, MesaLab, MESAS } from './mesas';

const GRUPOS: GrupoMesa[] = ['Listas', 'Pilas', 'Colas'];

export function Laboratorio({ modo = 'memoria' }: { modo?: 'memoria' | 'coste' }) {
  return (
    <main className="contenido ancho">
      <nav className="miga">
        <a href="#/">Temas</a>
      </nav>
      <h1>Laboratorio</h1>
      <nav className="pestanas" aria-label="Laboratorio">
        <a href="#/lab" className={modo === 'memoria' ? 'on' : ''} aria-current={modo === 'memoria' ? 'page' : undefined}>
          Memoria
        </a>
        {temaVisible('5') && (
          <a href="#/lab/coste" className={modo === 'coste' ? 'on' : ''} aria-current={modo === 'coste' ? 'page' : undefined}>
            Calculadora de O(n)
          </a>
        )}
      </nav>
      {modo === 'coste' && temaVisible('5') ? (
        <>
          <p className="entradilla">Escribe código que dependa de n y mira cómo se plantea la ecuación de su coste y cómo se resuelve, suma a suma.</p>
          <CalculadoraCoste />
        </>
      ) : (
        <Memoria />
      )}
    </main>
  );
}

/** The memory bench: first the structure to work with, then free code on it. */
function Memoria() {
  const [id, setId] = useState<string | null>(null);
  const mesa = MESAS.find((m) => m.id === id);

  if (!mesa)
    return (
      <>
        <p className="entradilla">
          ¿Con qué estructura quieres trabajar? Empiezas con ella creada y vacía, y puedes llamar a todas las funciones de su proyecto o tocar los campos a mano. Aquí no se corrige nada: es para probar.
        </p>
        {GRUPOS.filter((g) => MESAS.some((m) => m.grupo === g)).map((g) => (
          <Fragment key={g}>
            <h2 className="titulo-seccion">{g}</h2>
            <section className="galeria-mesas">
              {MESAS.filter((m) => m.grupo === g).map((m) => (
                <button key={m.id} className="tarjeta-lista elegir-mesa" onClick={() => setId(m.id)}>
                  <span className="fila-tema">
                    <strong>{m.nombre}</strong>
                    <span className="cuenta">Trabajar con ella →</span>
                  </span>
                  <span className="resumen">
                    <Rico texto={m.resumen} />
                  </span>
                  <span className="lienzo-memoria mini-lienzo">{m.dibujar(m.inicial(), undefined, true)}</span>
                </button>
              ))}
            </section>
          </Fragment>
        ))}
      </>
    );
  return <Mesa key={mesa.id} m={mesa} cambiar={() => setId(null)} />;
}

function Mesa({ m, cambiar }: { m: MesaLab; cambiar: () => void }) {
  const [codigo, setCodigo] = useState('');
  const [res, setRes] = useState<Resultado | null>(null);
  const rep = useReproductor(res?.pasos ?? null);
  const memInicial = useMemo(() => m.inicial(), [m]);

  const lanzar = (animar: boolean) => {
    const r = ejecutar(codigo, m.ctx, memInicial, { maxPasos: 5000 });
    setRes(r);
    rep.setIdx(0);
    rep.setEnMarcha(animar);
  };

  return (
    <>
      <p className="selector-mesa">
        {m.nombre}
        <button className="btn-texto" onClick={cambiar}>
          Cambiar de estructura
        </button>
      </p>
      <div className="ej-rejilla">
        <section className="panel panel-codigo">
          <div className="panel-cab">
            <h2>Código</h2>
            <button
              className="btn-texto"
              onClick={() => {
                setCodigo(m.ejemplo);
                setRes(null);
              }}
            >
              Cargar un ejemplo
            </button>
          </div>
          <p className="nota">
            <Rico texto={m.resumen} />
          </p>
          <EditorCodigo
            valor={codigo}
            onChange={(v) => {
              setCodigo(v);
              setRes(null);
            }}
            estados={estadosLineas(res?.pasos ?? null, rep.idx)}
          />
          <div className="acciones">
            <button className="btn" onClick={() => lanzar(true)} disabled={!codigo.trim()}>
              ▶ Ejecutar
            </button>
            <button className="btn secundario" onClick={() => lanzar(false)} disabled={!codigo.trim()}>
              Paso a paso
            </button>
          </div>
          <details className="chuleta">
            <summary>Funciones que puedes llamar</summary>
            <ul className="lista-funciones">
              {m.funciones.map((f) => (
                <li key={f}>
                  <code>{f}</code>
                </li>
              ))}
            </ul>
          </details>
        </section>
        <section className="panel panel-memoria">
          <div className="panel-cab">
            <h2>Memoria</h2>
          </div>
          <Reproductor pasos={res?.pasos ?? null} rep={rep} ctx={m.ctx} memInicial={memInicial} dibujar={(mem, prev) => m.dibujar(mem, prev)} />
          {res?.error && (
            <div className="caja-error" role="alert">
              <strong>{res.error.linea > 0 ? `Línea ${res.error.linea}: ` : ''}</strong>
              {res.error.mensaje}
            </div>
          )}
          {res && !res.error && res.fugas.length > 0 && (
            <div className="caja-aviso">Al terminar quedan {res.fugas.length} bloques reservados a los que no llega nadie: son fugas.</div>
          )}
        </section>
      </div>
    </>
  );
}
