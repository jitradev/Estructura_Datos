import { describe, expect, it } from 'vitest';
import { ejecutar } from '../interprete/ejecutar';
import { int, Memoria } from '../memoria/modelo';
import { buscarPila, PILAS, StackOp, StackType, TAM_DIBUJO } from '../stacks/catalog';
import { buildStack, codeOf, readStack, runStackOp } from '../stacks/prepare';
import { trocear } from '../listas/trocear';

const opOf = (t: StackType, fn: string) => t.operaciones.find((o) => o.fn === fn)!;

/** Runs one call on memory m (which already has `pila` and `valor`). */
function call(t: StackType, m: Memoria, o: StackOp, llamada: string) {
  const { visible, preludio } = codeOf(t, o);
  const r = ejecutar(visible, { ...t.ctx, preludio }, m, { llamada, maxPasos: 5000 });
  expect(r.error, `${t.id} ${llamada}: ${r.error?.mensaje}`).toBeUndefined();
  return r;
}
const valorDe = (m: Memoria) => m.marcos[0].vars.find((v) => v.nombre === 'valor')!.valor;

describe('trocear with the stack files', () => {
  it('finds every operation and the structs (typedef included)', () => {
    for (const t of PILAS) {
      const a = trocear(t.src);
      for (const o of t.operaciones) expect(a.funciones.has(o.fn), o.fn).toBe(true);
      expect(a.structs.length, t.id).toBe(t.enlazada ? 2 : 1);
    }
  });
});

describe('the two stacks do what main.c says', () => {
  for (const t of PILAS) {
    it(t.id, () => {
      const s = t.enlazada ? 'Enlazada' : 'Array';
      let m = call(t, buildStack(t, [], false), opOf(t, `CrearPila${s}`), `pila = CrearPila${s}()`).memFinal;
      for (const v of [1, 2, 3]) m = call(t, m, opOf(t, `push${s}`), `push${s}(pila, ${v})`).memFinal;
      expect(readStack(t, m)).toEqual([3, 2, 1]);
      const pop = call(t, m, opOf(t, `pop${s}`), `pop${s}(pila, &valor)`);
      expect(valorDe(pop.memFinal)).toEqual(int(3));
      m = call(t, pop.memFinal, opOf(t, `cima${s}`), `cima${s}(pila, &valor)`).memFinal;
      expect(valorDe(m)).toEqual(int(2));
      expect(call(t, m, opOf(t, `tamano${s}`), `tamano${s}(pila)`).devuelve).toEqual(int(2));
      m = call(t, m, opOf(t, `limpiar${s}`), `limpiar${s}(pila)`).memFinal;
      expect(call(t, m, opOf(t, `esVacia${s}`), `esVacia${s}(pila)`).devuelve).toEqual(int(1));
      expect(call(t, m, opOf(t, `pop${s}`), `pop${s}(pila, &valor)`).devuelve).toEqual(int(0));
      const fin = call(t, m, opOf(t, `destruirPila${s}`), `destruirPila${s}(pila)`);
      expect(readStack(t, fin.memFinal)).toBeNull();
    });
  }
  it('the array stack fills up at TAM', () => {
    const t = buscarPila('pila-array')!;
    const llena = Array.from({ length: TAM_DIBUJO }, (_, i) => i + 1);
    const m = buildStack(t, llena);
    expect(call(t, m, opOf(t, 'esLLenaArray'), 'esLLenaArray(pila)').devuelve).toEqual(int(1));
    expect(call(t, m, opOf(t, 'pushArray'), 'pushArray(pila, 99)').devuelve).toEqual(int(0));
  });
});

describe('every stack operation runs without errors or leaks', () => {
  for (const t of PILAS)
    for (const o of t.operaciones)
      it(`${t.id} ${o.fn}`, () => {
        for (const valores of [[], [5], Array.from({ length: t.max }, (_, i) => i + 1)]) {
          const r = runStackOp(t, o, { valores, valor: 99 });
          expect(r.error, `${valores}: ${r.error?.mensaje}`).toBeUndefined();
          expect(r.fugas.length, String(valores)).toBe(0);
        }
      });
});
