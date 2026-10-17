import { useMemo, useState } from 'react';
import { ejecutar, Resultado } from '../interprete/ejecutar';
import {
  colaCircular,
  colaEnlazada,
  Constructor,
  construir,
  CTX_COLA_CIRCULAR,
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

const TODAS_LAS_MESAS: { tema: string; nombre: string; ctx: Contexto; inicial: Constructor[]; ejemplo: string }[] = [
  {
    tema: '2',
    nombre: 'Lista: cab → 9 → 3 → 7',
    ctx: CTX_LISTA,
    inicial: [lista('cab', [9, 3, 7])],
    ejemplo: 'Nodo *p = cab;\nwhile (p != NULL) {\n    p->valor = p->valor * 2;\n    p = p->siguiente;\n}\n',
  },
  { tema: '3', nombre: 'Pila con array (MAX 6)', ctx: CTX_PILA_ARRAY, inicial: [pilaArray('p', [4, 1]), entero('x', 0)], ejemplo: 'p->datos[++p->cima] = 8;\nx = p->datos[p->cima--];\n' },
  { tema: '3', nombre: 'Pila enlazada', ctx: CTX_PILA_ENLAZADA, inicial: [pilaEnlazada('p', [4, 1]), entero('x', 0)], ejemplo: 'Nodo *v = p->cima;\nx = v->valor;\np->cima = v->siguiente;\nfree(v);\np->n--;\n' },
  {
    tema: '4',
    nombre: 'Cola circular (MAX 5)',
    ctx: CTX_COLA_CIRCULAR,
    inicial: [colaCircular('c', [8, 4], 3), entero('x', 0)],
    ejemplo: 'c->datos[c->final] = 9;\nc->final = (c->final + 1) % MAX;\nc->n++;\n',
  },
  {
    tema: '4',
    nombre: 'Cola enlazada',
    ctx: CTX_COLA_ENLAZADA,
    inicial: [colaEnlazada('c', [1, 2]), entero('x', 0)],
    ejemplo: 'Nodo *nuevo = malloc(sizeof(Nodo));\nnuevo->dato = 3;\nnuevo->siguiente = NULL;\nc->final->siguiente = nuevo;\nc->final = nuevo;\nc->n++;\n',
  },
];

// Only the starting structures of the visible topics
const MESAS = TODAS_LAS_MESAS.filter((m) => temaVisible(m.tema));

export function Laboratorio() {
  const [mesa, setMesa] = useState(0);
  const [codigo, setCodigo] = useState(MESAS[0].ejemplo);
  const [res, setRes] = useState<Resultado | null>(null);
  const rep = useReproductor(res?.pasos ?? null);
  const m = MESAS[mesa];
  const memInicial = useMemo(() => construir(m.ctx, m.inicial), [m]);

  const lanzar = (animar: boolean) => {
    const r = ejecutar(codigo, m.ctx, memInicial);
    setRes(r);
    rep.setIdx(0);
    rep.setEnMarcha(animar);
  };

  return (
    <main className="contenido ancho">
      <nav className="miga">
        <a href="#/">Temas</a>
      </nav>
      <h1>Laboratorio</h1>
      <p className="entradilla">Elige con qué empezar, escribe lo que quieras y ejecútalo. Aquí no se corrige nada: es para probar.</p>
      <label className="selector-mesa">
        Empezar con{' '}
        <select
          value={mesa}
          onChange={(e) => {
            const i = Number(e.target.value);
            setMesa(i);
            setCodigo(MESAS[i].ejemplo);
            setRes(null);
          }}
        >
          {MESAS.map((x, i) => (
            <option key={i} value={i}>
              {x.nombre}
            </option>
          ))}
        </select>
      </label>
      <div className="ej-rejilla">
        <section className="panel panel-codigo">
          <div className="panel-cab">
            <h2>Código</h2>
          </div>
          <EditorCodigo
            valor={codigo}
            onChange={(v) => {
              setCodigo(v);
              setRes(null);
            }}
            estados={estadosLineas(res?.pasos ?? null, rep.idx)}
          />
          <div className="acciones">
            <button className="btn" onClick={() => lanzar(true)}>
              ▶ Ejecutar
            </button>
            <button className="btn secundario" onClick={() => lanzar(false)}>
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
    </main>
  );
}
