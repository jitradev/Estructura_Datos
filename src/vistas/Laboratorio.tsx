import { useMemo, useState } from 'react';
import { ejecutar, Resultado } from '../interprete/ejecutar';
import { temaVisible } from '../ejercicios/registro';
import { EditorCodigo } from './EditorCodigo';
import { estadosLineas } from './piezas';
import { Reproductor, useReproductor } from './Reproductor';
import { CalculadoraCoste } from './CalculadoraCoste';
import { Rico } from './comun';
import { MesaLab, MESAS } from './mesas';
import { GrupoVer, NOMBRE_GRUPO, SelectorTipo } from './SelectorTipo';
import { Miga } from './Miga';

const GRUPOS: GrupoVer[] = ['listas', 'pilas', 'colas'];

/** #/lab/<listas|pilas|colas> chooses a structure, #/lab/e/<id> works on it, #/lab/coste is the calculator. */
export function Laboratorio({ ruta = [] }: { ruta?: string[] }) {
  const mesa = ruta[0] === 'e' ? MESAS.find((m) => m.id === ruta[1]) : undefined;
  // inside a structure there is no way to the calculator: only to its sibling structures
  if (mesa)
    return (
      <main className="contenido ancho">
        <SelectorTipo seccion="lab" grupo={mesa.grupo} actual={mesa.id} opciones={MESAS.filter((m) => m.grupo === mesa.grupo)} />
        <h1>{mesa.nombre}</h1>
        <Mesa key={mesa.id} m={mesa} />
      </main>
    );
  const coste = ruta[0] === 'coste' && temaVisible('5');
  return (
    <main className="contenido ancho">
      <Miga pasos={[['Inicio', '#/']]} />
      <h1>Laboratorio</h1>
      <nav className="pestanas" aria-label="Laboratorio">
        <a href="#/lab" className={!coste ? 'on' : ''} aria-current={!coste ? 'page' : undefined}>
          Memoria
        </a>
        {temaVisible('5') && (
          <a href="#/lab/coste" className={coste ? 'on' : ''} aria-current={coste ? 'page' : undefined}>
            Calculadora de O(n)
          </a>
        )}
      </nav>
      {coste ? (
        <>
          <p className="entradilla">Escribe código que dependa de n y mira la O de cada bucle y la del total.</p>
          <CalculadoraCoste />
        </>
      ) : (
        <Elegir grupo={ruta[0] as GrupoVer} />
      )}
    </main>
  );
}

/** The structures of one kind, to choose the one to work with. */
function Elegir({ grupo }: { grupo?: GrupoVer }) {
  const grupos = GRUPOS.filter((g) => MESAS.some((m) => m.grupo === g));
  const actual = grupos.includes(grupo!) ? grupo! : grupos[0];
  return (
    <>
      <p className="entradilla">
        ¿Con qué estructura quieres trabajar? Empiezas con ella creada y vacía, y puedes llamar a todas las funciones de su proyecto o tocar los campos a mano. Aquí no se corrige nada: es para probar.
      </p>
      {grupos.length > 1 && (
        <nav className="filtro-tipos" aria-label="Tipo de estructura">
          {grupos.map((g) => (
            <a key={g} href={`#/lab/${g}`} className={g === actual ? 'on' : ''} aria-current={g === actual ? 'page' : undefined}>
              {NOMBRE_GRUPO[g]}
              <span className="cuenta-filtro">{MESAS.filter((m) => m.grupo === g).length}</span>
            </a>
          ))}
        </nav>
      )}
      <section className="galeria-mesas">
        {MESAS.filter((m) => m.grupo === actual).map((m) => (
          <a key={m.id} className="tarjeta-lista" href={`#/lab/e/${m.id}`}>
            <span className="fila-tema">
              <strong>{m.nombre}</strong>
              <span className="cuenta">Trabajar con ella →</span>
            </span>
            <span className="resumen">
              <Rico texto={m.resumen} />
            </span>
            <span className="lienzo-memoria mini-lienzo">{m.dibujar(m.inicial(), undefined, true)}</span>
          </a>
        ))}
      </section>
    </>
  );
}

function Mesa({ m }: { m: MesaLab }) {
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
