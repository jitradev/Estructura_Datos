import { describe, expect, it } from 'vitest';
import { ejecutar } from '../interprete/ejecutar';
import { construir, CTX_LISTA, lista } from '../memoria/construir';
import { int, Memoria, nuevoObjeto, NULO, Valor } from '../memoria/modelo';
import { buscarLista, LISTAS, nombreFuncion, Operacion, TipoLista } from '../listas/catalogo';
import { codigoDe, construirLista, ejecutarOperacion, leerLista, memoriaDe, Parametros } from '../listas/preparar';
import { trocear } from '../listas/trocear';

const P: Parametros = { valores: [10, 20, 30, 40], nuevo: 99, posicion: 2, valor: 30, nodo: 1 };
const op = (t: TipoLista, base: string): Operacion => t.operaciones.find((o) => o.base === base) ?? { base, titulo: base, args: [], grupo: 'Consulta' };

/** Ejecuta una operación sobre la memoria m (que ya tiene la lista) y devuelve la memoria final. */
function paso(t: TipoLista, m: Memoria, base: string, args: (number | 'nuevo' | 'nodo')[], valorNuevo?: number, posNodo?: number): { m: Memoria; dev?: Valor } {
  const o = op(t, base);
  const mm = structuredClone(m);
  mm.marcos[0].vars = mm.marcos[0].vars.filter((v) => v.nombre === 'lista');
  if (valorNuevo !== undefined) {
    const n = nuevoObjeto(mm, t.ctx, t.nodo, true);
    n.campos.valor = int(valorNuevo);
    n.campos.siguiente = NULO;
    if (t.doble) n.campos.anterior = NULO;
    mm.marcos[0].vars.push({ nombre: 'nuevo', tipo: { base: t.nodo, ptr: 1 }, valor: { k: 'ref', r: { k: 'obj', id: n.id } } });
  }
  if (posNodo !== undefined) {
    // el nodo de esa posición, recorriendo la lista
    const ids: number[] = [];
    const vals = leerLista(t, mm);
    const vivos = Object.values(mm.objetos).filter((x) => x.tipo === t.nodo && !x.liberado);
    for (const v of vals) ids.push(vivos.find((x) => (x.campos.valor as { v: number }).v === v)!.id);
    mm.marcos[0].vars.push({ nombre: 'nodo', tipo: { base: t.nodo, ptr: 1 }, valor: { k: 'ref', r: { k: 'obj', id: ids[posNodo] } } });
  }
  const { visible, preludio } = codigoDe(t, o);
  const llamada = `${base}${t.sufijo}(lista${args.map((a) => ', ' + a).join('')})`;
  const r = ejecutar(visible, { ...t.ctx, preludio }, mm, { llamada, maxPasos: 5000 });
  expect(r.error, `${t.id} ${llamada}: ${r.error?.mensaje}`).toBeUndefined();
  return { m: r.memFinal, dev: r.devuelve };
}

describe('intérprete: do-while, continue y ternario', () => {
  it('do-while ejecuta el cuerpo al menos una vez', () => {
    const m = construir(CTX_LISTA, [lista('cab', [9])]);
    const r = ejecutar('Nodo *p = cab;\nint n = 0;\ndo {\n  n++;\n} while (n < 0);', CTX_LISTA, m);
    expect(r.error).toBeUndefined();
    expect(r.memFinal.marcos[0].vars.find((v) => v.nombre === 'n')!.valor).toEqual(int(1));
  });
  it('continue y ?:', () => {
    const m = construir(CTX_LISTA, [lista('cab', [9])]);
    const r = ejecutar('int s = 0;\nfor (int i = 0; i < 5; i++) {\n  if (i == 2) continue;\n  s += i;\n}\nint t = s > 5 ? 1 : 2;', CTX_LISTA, m);
    expect(r.error).toBeUndefined();
    const v = (n: string) => r.memFinal.marcos[0].vars.find((x) => x.nombre === n)!.valor;
    expect(v('s')).toEqual(int(8));
    expect(v('t')).toEqual(int(1));
  });
});

describe('trocear', () => {
  it('saca todas las funciones y los structs de cada .c', () => {
    for (const t of LISTAS) {
      const a = trocear(t.srcLista);
      expect(a.structs.length, t.id).toBe(1);
      for (const o of t.operaciones) expect(a.funciones.has(nombreFuncion(t, o.base)), nombreFuncion(t, o.base)).toBe(true);
    }
  });
});

describe('las cuatro listas hacen lo que dice main.c', () => {
  for (const id of ['simple', 'doble', 'circular-doble'] as const) {
    it(id, () => {
      const t = buscarLista(id)!;
      let m = construirLista(t, []);
      m = paso(t, m, 'insertarFinal', ['nuevo'], 20).m;
      m = paso(t, m, 'insertarPrincipio', ['nuevo'], 10).m;
      m = paso(t, m, 'insertarFinal', ['nuevo'], 40).m;
      m = paso(t, m, 'insertar', ['nuevo', 2], 30).m;
      m = paso(t, m, 'insertarTras', ['nuevo', 40], 50).m;
      expect(leerLista(t, m)).toEqual([10, 20, 30, 40, 50]);
      expect(paso(t, m, 'obtenerLongitud', []).dev).toEqual(int(5));
      expect(paso(t, m, 'obtenerPosicion', [30]).dev).toEqual(int(2));
      m = paso(t, m, 'eliminarPorValor', [10]).m;
      m = paso(t, m, 'eliminarNodoPosicion', [1]).m;
      m = paso(t, m, 'eliminarPorReferencia', ['nodo'], undefined, 2).m;
      expect(paso(t, m, 'eliminarPorValor', [99]).dev).toEqual(int(0));
      expect(leerLista(t, m)).toEqual([20, 40]);
      m = paso(t, m, 'eliminarNodo', ['nodo'], undefined, 0).m;
      m = paso(t, m, 'eliminarNodo', ['nodo'], undefined, 0).m;
      expect(leerLista(t, m)).toEqual([]);
    });
  }
  it('circular', () => {
    const t = buscarLista('circular')!;
    let m = construirLista(t, []);
    m = paso(t, m, 'insertarPrincipio', ['nuevo'], 20).m;
    m = paso(t, m, 'insertarPrincipio', ['nuevo'], 10).m;
    m = paso(t, m, 'insertar', ['nuevo', 2], 40).m;
    m = paso(t, m, 'insertar', ['nuevo', 2], 30).m;
    m = paso(t, m, 'insertarTras', ['nuevo', 40], 50).m;
    expect(leerLista(t, m)).toEqual([10, 20, 30, 40, 50]);
    expect(paso(t, m, 'obtenerPosicion', [50]).dev).toEqual(int(4));
    m = paso(t, m, 'eliminarPorValor', [10]).m;
    m = paso(t, m, 'eliminarNodoPosicion', [1]).m;
    m = paso(t, m, 'eliminarPorReferencia', ['nodo'], undefined, 2).m;
    expect(leerLista(t, m)).toEqual([20, 40]);
    m = paso(t, m, 'eliminarNodo', ['nodo'], undefined, 1).m;
    expect(leerLista(t, m)).toEqual([20]);
    m = paso(t, m, 'eliminarNodo', ['nodo'], undefined, 0).m;
    expect(leerLista(t, m)).toEqual([]);
  });
});

describe('todas las operaciones del visualizador funcionan sin errores ni fugas', () => {
  for (const t of LISTAS)
    for (const o of t.operaciones)
      it(`${t.id} ${o.base}`, () => {
        for (const valores of [[], [10], [10, 20, 30, 40]]) {
          const p = { ...P, valores };
          const r = ejecutarOperacion(t, o, p, memoriaDe(t, o, p));
          expect(r.error, `${valores}: ${r.error?.mensaje}`).toBeUndefined();
          // tras eliminarLista la lista ya no existe; en el resto no queda nada suelto
          if (o.base !== 'eliminarLista') expect(r.fugas.length, String(valores)).toBe(0);
          expect(r.pasos.length).toBeGreaterThan(1);
        }
      });
});
