import { describe, expect, it } from 'vitest';
import { tema7 } from '../ejercicios/tema7';
import { simularTraza } from '../ejercicios/traza';
import { EjTraza } from '../ejercicios/tipos';
import { ejecutar } from '../ordenacion/pasos';

const trazas = tema7.ejercicios.filter((e): e is EjTraza => e.tipo === 'traza');

describe('trace exercises', () => {
  for (const ej of trazas) {
    it(`${ej.id} ${ej.titulo}: the rows end like the animation`, () => {
      const sim = simularTraza(ej);
      const anim = ejecutar(ej.alg, ej.datos, ej.x ?? 0).pasos;
      if (ej.alg === 'binaria') {
        expect(sim.vueltas.length).toBeGreaterThan(0);
        expect(sim.devuelve).toBe(ej.datos.indexOf(ej.x!));
      } else {
        expect(sim.filas.length).toBeGreaterThan(0);
        expect(sim.filas[sim.filas.length - 1].v).toEqual([...ej.datos].sort((a, b) => a - b));
        expect(sim.filas[sim.filas.length - 1].v).toEqual(anim[anim.length - 1].v);
      }
    });
  }

  it('gives the counts of the deck for the class array', () => {
    const de = (id: string) => simularTraza(trazas.find((e) => e.id === id)!);
    expect([de('7-01').comp, de('7-01').mov]).toEqual([10, 4]);
    expect([de('7-03').comp, de('7-03').mov]).toEqual([8, 6]);
    expect([de('7-05').comp, de('7-05').mov]).toEqual([10, 6]);
  });
});
