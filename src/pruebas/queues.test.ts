import { describe, expect, it } from 'vitest';
import { ejecutar } from '../interprete/ejecutar';
import { int, Memoria } from '../memoria/modelo';
import { buscarCola, COLAS, QueueId, QueueType, TAM_BICOLA_DIBUJO, TAM_COLA } from '../queues/catalog';
import { buildQueue, codeOf, readQueue, runQueueOp } from '../queues/prepare';
import { trocear } from '../listas/trocear';

/** Runs one call on memory m (which already has `cola` and `x`). */
function call(t: QueueType, m: Memoria, llamada: string) {
  const fn = /(\w+)\(/.exec(llamada)![1];
  const o = t.operaciones.find((x) => x.fn === fn)!;
  const { visible, preludio } = codeOf(t, o);
  const r = ejecutar(visible, { ...t.ctx, preludio }, m, { llamada, maxPasos: 5000 });
  expect(r.error, `${t.id} ${llamada}: ${r.error?.mensaje}`).toBeUndefined();
  expect(r.fugas.length, `${t.id} ${llamada}`).toBe(0);
  return r;
}
const x = (m: Memoria) => m.marcos[0].vars.find((v) => v.nombre === 'x')!.valor;
const valores = (t: QueueType, m: Memoria) => readQueue(t, m)?.map((e) => e.valor) ?? null;
const sinCola = { valores: [], prioridades: [], frente: 0 };
const crear = (id: QueueId) => {
  const t = buscarCola(id)!;
  const o = t.operaciones.find((op) => op.crea)!;
  return { t, m: call(t, buildQueue(t, sinCola, false), `cola = ${o.fn}()`).memFinal };
};

describe('trocear with the queue files', () => {
  it('finds every operation and the structs', () => {
    for (const t of COLAS) {
      const fns = trocear(t.src).funciones;
      for (const o of t.operaciones) expect(fns.has(o.fn), `${t.id} ${o.fn}`).toBe(true);
      expect(trocear(t.src).structs.length, t.id).toBe(1);
    }
  });
});

describe('the queues do what main.c says', () => {
  for (const [id, s] of [
    ['cola-array', 'ColaArray'],
    ['cola-enlazada', 'ColaEnlazada'],
  ] as const) {
    it(`${id}: FIFO, and the array one wraps around`, () => {
      let { t, m } = crear(id);
      expect(call(t, m, `desencolar${s}(cola, &x)`).devuelve).toEqual(int(0));
      for (const v of [5, 6, 7]) m = call(t, m, `encolar${s}(cola, ${v})`).memFinal;
      m = call(t, m, `desencolar${s}(cola, &x)`).memFinal;
      expect(x(m)).toEqual(int(5));
      for (let v = 8; v < 8 + TAM_COLA - 2; v++) m = call(t, m, `encolar${s}(cola, ${v})`).memFinal;
      expect(valores(t, m)).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
      if (id === 'cola-array') {
        expect(call(t, m, 'estaLLenaColaArray(cola)').devuelve).toEqual(int(1));
        expect(call(t, m, 'encolarColaArray(cola, 99)').devuelve).toEqual(int(0));
      }
      m = call(t, m, `frente${s}(cola, &x)`).memFinal;
      expect(x(m)).toEqual(int(6));
      expect(call(t, m, `tamano${s}(cola)`).devuelve).toEqual(int(TAM_COLA));
      m = call(t, m, `vaciar${s}(cola)`).memFinal;
      expect(valores(t, m)).toEqual([]);
      expect(call(t, m, `frente${s}(cola, &x)`).devuelve).toEqual(int(0));
      expect(valores(t, call(t, m, `destruir${s}(cola)`).memFinal)).toBeNull();
    });
  }
  for (const [id, s] of [
    ['bicola-array', 'BicolaArray'],
    ['bicola-enlazada', 'BicolaEnlazada'],
  ] as const) {
    it(`${id}: both ends`, () => {
      let { t, m } = crear(id);
      m = call(t, m, `insertarFinal${s}(cola, 7)`).memFinal;
      m = call(t, m, `insertarFinal${s}(cola, 3)`).memFinal;
      m = call(t, m, `insertarPrincipio${s}(cola, 9)`).memFinal; // the front goes back from 0 to the last cell
      expect(valores(t, m)).toEqual([9, 7, 3]);
      m = call(t, m, `final${s}(cola, &x)`).memFinal;
      expect(x(m)).toEqual(int(3));
      m = call(t, m, `principio${s}(cola, &x)`).memFinal;
      expect(x(m)).toEqual(int(9));
      m = call(t, m, `eliminarFinal${s}(cola, &x)`).memFinal;
      expect(x(m)).toEqual(int(3));
      m = call(t, m, `eliminarPrincipio${s}(cola, &x)`).memFinal;
      expect(x(m)).toEqual(int(9));
      expect(valores(t, m)).toEqual([7]);
      expect(valores(t, call(t, m, `destruir${s}(cola)`).memFinal)).toBeNull();
    });
  }
  it('the array deque fills up', () => {
    const t = buscarCola('bicola-array')!;
    const m = buildQueue(t, { valores: Array.from({ length: TAM_BICOLA_DIBUJO }, (_, i) => i), prioridades: [], frente: 7 });
    expect(call(t, m, 'estaLLenaBicolaArray(cola)').devuelve).toEqual(int(1));
    expect(call(t, m, 'insertarPrincipioBicolaArray(cola, 99)').devuelve).toEqual(int(0));
  });
  it('the output-restricted deque: in by both ends, out by the front', () => {
    let { t, m } = crear('bicola-salida-restringida');
    m = call(t, m, 'insertarFinalBicolaSalidaRestringida(cola, 1)').memFinal;
    m = call(t, m, 'insertarFinalBicolaSalidaRestringida(cola, 2)').memFinal;
    m = call(t, m, 'insertarPrincipioBicolaSalidaRestringida(cola, 0)').memFinal;
    expect(valores(t, m)).toEqual([0, 1, 2]);
    m = call(t, m, 'principioBicolaSalidaRestringida(cola, &x)').memFinal;
    expect(x(m)).toEqual(int(0));
    m = call(t, m, 'eliminarPrincipioBicolaSalidaRestringida(cola, &x)').memFinal;
    expect(valores(t, m)).toEqual([1, 2]);
    m = call(t, m, 'insertarPrincipioBicolaSalidaRestringida(cola, 5)').memFinal;
    expect(valores(t, m)).toEqual([5, 1, 2]);
    expect(valores(t, call(t, m, 'destruirBicolaSalidaRestringida(cola)').memFinal)).toBeNull();
  });
  for (const [id, s] of [
    ['cola-prioridad-lista', 'ColaPrioridadLista'],
    ['cola-prioridad-array', 'ColaPrioridadArray'],
  ] as const) {
    it(`${id}: highest priority first, stable among equals`, () => {
      let { t, m } = crear(id);
      for (const [v, p] of [
        [10, 1],
        [20, 3],
        [30, 0],
        [40, 1],
      ])
        m = call(t, m, `encolar${s}(cola, ${v}, ${p})`).memFinal;
      expect(readQueue(t, m)).toEqual([
        { valor: 30, prioridad: 0 },
        { valor: 10, prioridad: 1 },
        { valor: 40, prioridad: 1 },
        { valor: 20, prioridad: 3 },
      ]);
      expect(call(t, m, `encolar${s}(cola, 99, 7)`).devuelve).toEqual(int(0));
      m = call(t, m, `frente${s}(cola, &x)`).memFinal;
      expect(x(m)).toEqual(int(30));
      const sacados: number[] = [];
      for (;;) {
        const r = call(t, m, `desencolar${s}(cola, &x)`);
        if (r.devuelve?.k === 'int' && r.devuelve.v === 0) break;
        m = r.memFinal;
        sacados.push((x(m) as { v: number }).v);
      }
      expect(sacados).toEqual([30, 10, 40, 20]);
      expect(call(t, m, `estaVacia${s}(cola)`).devuelve).toEqual(int(1));
      expect(valores(t, call(t, m, `destruir${s}(cola)`).memFinal)).toBeNull();
    });
  }
  it('buildQueue matches inserting one by one', () => {
    for (const id of ['cola-prioridad-lista', 'cola-prioridad-array'] as const) {
      const t = buscarCola(id)!;
      expect(valores(t, buildQueue(t, { valores: [1, 2, 3], prioridades: [3, 0, 3], frente: 0 }))).toEqual([2, 1, 3]);
    }
  });
});

describe('every queue operation runs without errors or leaks', () => {
  for (const t of COLAS)
    for (const o of t.operaciones)
      it(`${t.id} ${o.fn}`, () => {
        const llena = Array.from({ length: t.max }, (_, i) => i + 1);
        for (const vs of [[], [5], llena])
          for (const frente of t.nodo ? [0] : [0, t.max - 1]) {
            const r = runQueueOp(t, o, { valores: vs, prioridades: vs.map((v) => v % 4), frente, x: 99, prioridad: 1 });
            expect(r.error, `${vs} @${frente}: ${r.error?.mensaje}`).toBeUndefined();
            expect(r.fugas.length, String(vs)).toBe(0);
          }
      });
});
