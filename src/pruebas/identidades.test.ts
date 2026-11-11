import { describe, expect, it } from 'vitest';
import { identidades } from '../ordenacion/identidades';
import { ejecutar } from '../ordenacion/pasos';

describe('identidades', () => {
  it('a swap makes the two bars trade places', () => {
    const ids = identidades([
      [5, 2, 8],
      [2, 5, 8],
    ]);
    expect(ids[1]).toEqual([1, 0, 2]);
  });

  it('an insertion shift slides the bar right and leaves a new copy', () => {
    const ids = identidades([
      [2, 5, 3],
      [2, 5, 5],
    ]);
    expect(ids[1][2]).toBe(1);
    expect(ids[1][1]).toBe(3);
  });

  it('keeps ids unique within every step of every algorithm', () => {
    for (const id of ['seleccion', 'insercion', 'burbuja', 'mezcla', 'rapida'] as const) {
      const { pasos } = ejecutar(id, [5, 2, 8, 1, 4, 4, 7]);
      for (const fila of identidades(pasos.map((p) => p.v))) expect(new Set(fila).size).toBe(fila.length);
    }
  });
});
