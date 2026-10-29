import { useMemo, useState } from 'react';
import { ejecutar, Resultado } from '../interprete/ejecutar';
import {
  colaArray,
  colaEnlazada,
  Constructor,
  construir,
  CTX_COLA_ARRAY,
  CTX_COLA_ENLAZADA,
  CTX_LISTA,
  CTX_PILA_ARRAY,
  CTX_PILA_ENLAZADA,
  entero,
  lista,
  pilaArray,
  pilaEnlazada,
} from '../memoria/construir';
import { temaVisible } from '../ejercicios/registro';
import { Contexto } from '../memoria/modelo';
import { EditorCodigo } from './EditorCodigo';
import { Chuleta, estadosLineas } from './piezas';
import { Reproductor, useReproductor } from './Reproductor';
import { CalculadoraCoste } from './CalculadoraCoste';
import { Rico } from './comun';
import { Dibujo } from '../dibujo/Dibujo';

const TODAS_LAS_MESAS: { tema: string; nombre: string; resumen: string; ctx: Contexto; inicial: Constructor[]; ejemplo: string }[] = [
  {
    tema: '2',
    nombre: 'Lista: cab → 9 → 3 → 7',
    resumen: 'Una lista simplemente enlazada con tres nodos. `cab` apunta al primero.',
    ctx: CTX_LISTA,
    inicial: [lista('cab', [9, 3, 7])],
    ejemplo: 'Nodo *p = cab;\nwhile (p != NULL) {\n    p->valor = p->valor * 2;\n    p = p->siguiente;\n}\n',
  },
  {
    tema: '3',
    nombre: 'Pila con array (TAM 8)',
    resumen: '`pila` con dos elementos en un array de 8; `cima` es la posición del último.',
    ctx: CTX_PILA_ARRAY,
    inicial: [pilaArray('pila', [4, 1]), entero('valor', 0)],
    ejemplo: 'pushArray(pila, 8);\npila->cima++;\npila->array[pila->cima] = 3;\npopArray(pila, &valor);\n',
  },
  {
    tema: '3',
    nombre: 'Pila enlazada',
    resumen: '`pila` con dos nodos; `cima` apunta al último que entró.',
    ctx: CTX_PILA_ENLAZADA,
    inicial: [pilaEnlazada('pila', [4, 1]), entero('valor', 0)],
    ejemplo: 'Nodo *borrar = pila->cima;\nvalor = borrar->valor;\npila->cima = borrar->siguiente;\nfree(borrar);\npila->tamano--;\n',
  },
  {
    tema: '4',
    nombre: 'Cola con array (TAM_COLA_ARRAY 10)',
    resumen: '`cola` circular en un array de 10, con `frente`, `final` y `numElementos`.',
    ctx: CTX_COLA_ARRAY,
    inicial: [colaArray('cola', [8, 4], 8), entero('x', 0)],
    ejemplo: 'cola->array[cola->final] = 9;\ncola->final = (cola->final + 1) % TAM_COLA_ARRAY;\ncola->numElementos++;\ndesencolarColaArray(cola, &x);\n',
  },
  {
    tema: '4',
    nombre: 'Cola enlazada',
    resumen: '`cola` con dos nodos; `inicio` es el primero en salir y `final` el último en entrar.',
    ctx: CTX_COLA_ENLAZADA,
    inicial: [colaEnlazada('cola', [1, 2]), entero('x', 0)],
    ejemplo: 'NodoSimple *aux = crearNodoSimple(3);\nestablecerSiguienteNodoSimple(cola->final, aux);\ncola->final = aux;\ncola->tamano++;\ndesencolarColaEnlazada(cola, &x);\n',
  },
];

// Only the starting structures of the visible topics
const MESAS = TODAS_LAS_MESAS.filter((m) => temaVisible(m.tema));

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
  const [mesa, setMesa] = useState<number | null>(null);

  if (mesa === null)
    return (
      <>
        <p className="entradilla">¿Con qué estructura quieres trabajar? Empiezas con ella ya creada en memoria, escribes lo que quieras y lo ejecutas. Aquí no se corrige nada: es para probar.</p>
        <section className="galeria-mesas">
          {MESAS.map((m, i) => (
            <button key={m.nombre} className="tarjeta-lista elegir-mesa" onClick={() => setMesa(i)}>
              <span className="fila-tema">
                <strong>{m.nombre}</strong>
                <span className="cuenta">Trabajar con ella →</span>
              </span>
              <span className="resumen">
                <Rico texto={m.resumen} />
              </span>
              <span className="lienzo-memoria mini-lienzo">
                <Dibujo mem={construir(m.ctx, m.inicial)} ctx={m.ctx} />
              </span>
            </button>
          ))}
        </section>
      </>
    );
  return <Mesa key={mesa} m={MESAS[mesa]} cambiar={() => setMesa(null)} />;
}

function Mesa({ m, cambiar }: { m: (typeof MESAS)[number]; cambiar: () => void }) {
  const [codigo, setCodigo] = useState('');
  const [res, setRes] = useState<Resultado | null>(null);
  const rep = useReproductor(res?.pasos ?? null);
  const memInicial = useMemo(() => construir(m.ctx, m.inicial), [m]);

  const lanzar = (animar: boolean) => {
    const r = ejecutar(codigo, m.ctx, memInicial);
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
          <Chuleta ctx={m.ctx} />
        </section>
        <section className="panel panel-memoria">
          <div className="panel-cab">
            <h2>Memoria</h2>
          </div>
          <Reproductor pasos={res?.pasos ?? null} rep={rep} ctx={m.ctx} memInicial={memInicial} />
          {res?.error && (
            <div className="caja-error" role="alert">
              <strong>{res.error.linea > 0 ? `Línea ${res.error.linea}: ` : ''}</strong>
              {res.error.mensaje}
            </div>
          )}
          {res && !res.error && res.fugas.length > 0 && (
            <div className="caja-aviso">Al terminar quedan {res.fugas.length} nodos reservados a los que no llega nadie: son fugas.</div>
          )}
        </section>
      </div>
    </>
  );
}
