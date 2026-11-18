import { describe, expect, it } from 'vitest';
import { ARBOLES, construirArbol, ejecutarOpArbol, enOrden, formaDe } from '../arboles/catalogo';
import { Memoria, Valor } from '../memoria/modelo';

const raiz = (m: Memoria): Valor => {
  const a = m.marcos[0].vars.find((v) => v.nombre === 'arbol')!.valor;
  return a.k === 'ref' && a.r.k === 'obj' ? (m.objetos[a.r.id].campos.raiz as Valor) : { k: 'nulo' };
};
const op = (fn: string) => ARBOLES.flatMap((t) => t.operaciones).find((o) => o.fn === fn)!;
const EJ = [8, 3, 10, 1, 6, 14, 4];

describe('árboles: Arbol.c en el intérprete', () => {
  it('construye un ABB insertando en orden', () => {
    const m = construirArbol(EJ);
    expect(formaDe(m, raiz(m))).toBe('8(3(1,6(4,)),10(,14))');
  });
  it('cada operación se ejecuta sin errores ni fugas', () => {
    for (const t of ARBOLES)
      for (const o of t.operaciones)
        for (const vals of [EJ, [], [5]]) {
          const r = ejecutarOpArbol(o, vals, 6);
          expect(r.error, `${o.fn} ${vals}: ${r.error?.mensaje}`).toBeUndefined();
          if (o.fn !== 'crearArbol') expect(r.fugas.length, `${o.fn} ${vals}`).toBe(0);
        }
  });
  it('los recorridos escriben lo que deben', () => {
    expect(ejecutarOpArbol(op('preOrden'), EJ, 0).memFinal.salida).toBe('8 3 1 6 4 10 14 ');
    expect(ejecutarOpArbol(op('inOrden'), EJ, 0).memFinal.salida).toBe('1 3 4 6 8 10 14 ');
    expect(ejecutarOpArbol(op('postOrden'), EJ, 0).memFinal.salida).toBe('1 4 6 3 14 10 8 ');
  });
  it('consultas', () => {
    const dev = (fn: string, v = 0, vals = EJ) => {
      const d = ejecutarOpArbol(op(fn), vals, v).devuelve;
      return d?.k === 'int' ? d.v : d?.k;
    };
    expect(dev('contarNodos')).toBe(7);
    expect(dev('contarHojas')).toBe(3);
    expect(dev('altura')).toBe(4);
    expect(dev('altura', 0, [])).toBe(0);
    expect(dev('buscar', 6)).toBe(1);
    expect(dev('buscar', 7)).toBe(0);
  });
  it('insertar y eliminar dejan un ABB', () => {
    const ins = ejecutarOpArbol(op('insertar'), EJ, 7);
    expect(enOrden(ins.memFinal, raiz(ins.memFinal))).toEqual([1, 3, 4, 6, 7, 8, 10, 14]);
    for (const x of [1, 6, 3, 8, 14]) {
      const el = ejecutarOpArbol(op('eliminar'), EJ, x);
      expect(el.fugas.length).toBe(0);
      expect(enOrden(el.memFinal, raiz(el.memFinal))).toEqual([1, 3, 4, 6, 8, 10, 14].filter((y) => y !== x));
    }
  });
});

describe('printf', () => {
  it('escribe enteros y cadenas, y avisa si falta un valor', async () => {
    const { ejecutar } = await import('../interprete/ejecutar');
    const { memoriaVacia } = await import('../memoria/modelo');
    const ctx = { structs: [] };
    const r = ejecutar('int x = 4;\nprintf("x = %d, %d%%\\n", x, x + 1);\nputs("fin");', ctx, memoriaVacia());
    expect(r.error).toBeUndefined();
    expect(r.memFinal.salida).toBe('x = 4, 5%\nfin\n');
    expect(ejecutar('printf("%d %d", 1);', ctx, memoriaVacia()).error?.mensaje).toMatch(/Falta un valor/);
    expect(ejecutar('int y = "hola";', ctx, memoriaVacia()).error?.mensaje).toMatch(/printf/);
  });
});
