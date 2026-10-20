import { describe, expect, it } from 'vitest';
import { ejecutar } from '../interprete/ejecutar';
import { int, Memoria } from '../memoria/modelo';
import { buscarCola, COLAS, MAX, QueueType } from '../queues/catalog';
import { buildQueue, codeOf, readQueue, runQueueOp } from '../queues/prepare';
import { trocear } from '../listas/trocear';

/** Runs one call on memory m (which already has `c` and `x`). */
function call(t: QueueType, m: Memoria, llamada: string) {
  const o = t.operaciones.find((x) => x.fn === /^\w+/.exec(llamada)![0])!;
  const { visible, preludio } = codeOf(t, o);
  const r = ejecutar(visible, { ...t.ctx, preludio }, m, { llamada, maxPasos: 5000 });
  expect(r.error, `${t.id} ${llamada}: ${r.error?.mensaje}`).toBeUndefined();
  expect(r.fugas.length, `${t.id} ${llamada}`).toBe(0);
  return r;
}
const varDe = (m: Memoria, n: string) => m.marcos[0].vars.find((v) => v.nombre === n)!.valor;
const datos = (t: QueueType, m: Memoria) => readQueue(t, m).map((e) => e.dato);
const vacia = { valores: [], prios: [], frente: 0 };

describe('trocear with the queue files', () => {
  it('finds every operation and the structs (anonymous typedef included)', () => {
    for (const t of COLAS) {
      const fns = trocear(t.src).funciones;
      for (const o of t.operaciones) expect(fns.has(o.fn), `${t.id} ${o.fn}`).toBe(true);
      expect(trocear(t.header).structs.length, t.id).toBe(t.nodo ? 2 : 1);
    }
  });
});

describe('the queues do what their mains say', () => {
  for (const id of ['cola-array', 'cola-enlazada'] as const) {
    it(`${id}: FIFO, and the array one wraps around`, () => {
      const t = buscarCola(id)!;
      let m = call(t, buildQueue(t, vacia, false), 'crearCola(&c)').memFinal;
      expect(call(t, m, 'desencolar(&c, &x)').devuelve).toEqual(int(0));
      for (const v of [1, 2, 3]) m = call(t, m, `encolar(&c, ${v})`).memFinal;
      m = call(t, m, 'desencolar(&c, &x)').memFinal;
      expect(varDe(m, 'x')).toEqual(int(1));
      m = call(t, m, 'desencolar(&c, &x)').memFinal;
      for (const v of [4, 5, 6, 7]) m = call(t, m, `encolar(&c, ${v})`).memFinal;
      expect(datos(t, m)).toEqual([3, 4, 5, 6, 7]);
      if (id === 'cola-array') {
        expect(call(t, m, 'estaLlena(&c)').devuelve).toEqual(int(1));
        expect(call(t, m, 'encolar(&c, 8)').devuelve).toEqual(int(0));
      }
      m = call(t, m, 'frente(&c, &x)').memFinal;
      expect(varDe(m, 'x')).toEqual(int(3));
      expect(call(t, m, 'tamano(&c)').devuelve).toEqual(int(5));
      m = call(t, m, 'limpiar(&c)').memFinal;
      expect(datos(t, m)).toEqual([]);
    });
  }
  for (const id of ['bicola-array', 'bicola-enlazada'] as const) {
    it(`${id}: both ends`, () => {
      const t = buscarCola(id)!;
      let m = call(t, buildQueue(t, vacia, false), 'crearBicola(&c)').memFinal;
      m = call(t, m, 'insertarFinal(&c, 2)').memFinal;
      m = call(t, m, 'insertarFrente(&c, 1)').memFinal; // the front goes back from 0 to MAX - 1
      m = call(t, m, 'insertarFinal(&c, 3)').memFinal;
      expect(datos(t, m)).toEqual([1, 2, 3]);
      m = call(t, m, 'extraerFinal(&c, &x)').memFinal;
      expect(varDe(m, 'x')).toEqual(int(3));
      m = call(t, m, 'verFinal(&c, &x)').memFinal;
      expect(varDe(m, 'x')).toEqual(int(2));
      m = call(t, m, 'extraerFrente(&c, &x)').memFinal;
      expect(varDe(m, 'x')).toEqual(int(1));
      m = call(t, m, 'liberarBicola(&c)').memFinal;
      if (id === 'bicola-enlazada') expect(datos(t, m)).toEqual([]);
    });
  }
  it('the array deque fills up at MAX', () => {
    const t = buscarCola('bicola-array')!;
    const m = buildQueue(t, { valores: [1, 2, 3, 4, 5], prios: [], frente: 3 });
    expect(call(t, m, 'esLlena(&c)').devuelve).toEqual(int(1));
    expect(call(t, m, 'insertarFrente(&c, 9)').devuelve).toEqual(int(0));
  });
  it('the priority queue is stable', () => {
    const t = buscarCola('cola-prioridad')!;
    let m = call(t, buildQueue(t, vacia, false), 'crearColaPrio(&c)').memFinal;
    for (const [x, p] of [[1, 2], [2, 0], [3, 2], [4, 0], [5, 1]]) m = call(t, m, `encolarPrio(&c, ${x}, ${p})`).memFinal;
    expect(readQueue(t, m)).toEqual([
      { dato: 2, prio: 0 },
      { dato: 4, prio: 0 },
      { dato: 5, prio: 1 },
      { dato: 1, prio: 2 },
      { dato: 3, prio: 2 },
    ]);
    expect(call(t, m, 'encolarPrio(&c, 9, 7)').devuelve).toEqual(int(0));
    m = call(t, m, 'frentePrio(&c, &x, &prio)').memFinal;
    expect([varDe(m, 'x'), varDe(m, 'prio')]).toEqual([int(2), int(0)]);
    m = call(t, m, 'liberarColaPrio(&c)').memFinal;
    expect(call(t, m, 'esVaciaPrio(&c)').devuelve).toEqual(int(1));
  });
  it('buildQueue matches inserting one by one', () => {
    const t = buscarCola('cola-prioridad')!;
    const m = buildQueue(t, { valores: [1, 2, 3], prios: [3, 0, 3], frente: 0 });
    expect(datos(t, m)).toEqual([2, 1, 3]);
  });
});

describe('every queue operation runs without errors or leaks', () => {
  for (const t of COLAS)
    for (const o of t.operaciones)
      it(`${t.id} ${o.fn}`, () => {
        const llena = Array.from({ length: t.max }, (_, i) => i + 1);
        for (const valores of [[], [5], llena])
          for (const frente of t.nodo ? [0] : [0, MAX - 1]) {
            const r = runQueueOp(t, o, { valores, prios: valores.map((v) => v % 4), frente, x: 99, prio: 1 });
            expect(r.error, `${valores} @${frente}: ${r.error?.mensaje}`).toBeUndefined();
            expect(r.fugas.length, String(valores)).toBe(0);
          }
      });
});
