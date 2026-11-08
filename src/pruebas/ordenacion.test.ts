import { describe, expect, it } from 'vitest';
import { aleatorio, ALGORITMOS, binaria, ejecutar, ORDENACIONES } from '../ordenacion/pasos';

const ultimo = <T,>(a: T[]) => a[a.length - 1];
const ordenado = (v: number[]) => v.every((x, i) => i === 0 || v[i - 1] <= x);

describe('animaciones de ordenación', () => {
  it('las cifras de [5, 2, 8, 1, 4] son las de los dibujos del deck', () => {
    const d = [5, 2, 8, 1, 4];
    const fin = (id: Parameters<typeof ejecutar>[0]) => ultimo(ejecutar(id, d).pasos);
    expect([fin('seleccion').comp, fin('seleccion').mov]).toEqual([10, 4]);
    expect([fin('insercion').comp, fin('insercion').mov]).toEqual([8, 6]);
    expect([fin('burbuja').comp, fin('burbuja').mov]).toEqual([10, 6]);
  });
  for (const a of ORDENACIONES) {
    it(`${a.nombre} ordena y cada paso señala una línea que existe`, () => {
      const lineas = a.codigo.split('\n').length;
      const casos = [[], [7], [2, 1], [3, 3, 3], [5, 2, 8, 1, 4], ...[1, 2, 3, 4, 5].map((s) => aleatorio(9, s)), [9, 8, 7, 6, 5, 4, 3, 2, 1]];
      for (const c of casos) {
        const { pasos } = ejecutar(a.id, c);
        const ult = ultimo(pasos);
        expect(ult.v).toEqual([...c].sort((x, y) => x - y));
        expect(ordenado(ult.v)).toBe(true);
        expect(ult.definitivas.length).toBe(c.length);
        for (const p of pasos) expect(p.linea >= 1 && p.linea <= lineas, `${a.id} línea ${p.linea}`).toBe(true);
      }
    });
  }
  it('la binaria encuentra lo que está y dice -1 de lo que no', () => {
    const v = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
    for (const x of v) expect(ultimo(binaria(v, x).pasos).nota).toContain('encontrado');
    for (const x of [0, 60, 100]) expect(ultimo(binaria(v, x).pasos).nota).toContain('-1');
    expect(ultimo(binaria(v, 23).pasos).comp).toBe(3);
  });
  it('hay un algoritmo por cada uno del deck, más la búsqueda', () => {
    expect(ALGORITMOS.map((a) => a.id)).toEqual(['seleccion', 'insercion', 'burbuja', 'mezcla', 'rapida', 'binaria']);
  });
});
