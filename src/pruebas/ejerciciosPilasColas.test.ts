import { describe, expect, it } from 'vitest';
import { tema3 } from '../ejercicios/tema3';
import { tema4 } from '../ejercicios/tema4';

const cuenta = (t: typeof tema3, estructura: string) => t.ejercicios.filter((e) => e.estructura === estructura).length;

describe('exercises on stacks and queues', () => {
  it('every exercise is tagged with its structure', () => {
    expect(tema3.ejercicios.length).toBe(58);
    expect(tema4.ejercicios.length).toBe(106);
    expect(cuenta(tema3, 'Pila array') + cuenta(tema3, 'Pila enlazada')).toBe(58);
    expect(cuenta(tema4, 'Cola array') + cuenta(tema4, 'Cola enlazada')).toBe(58);
    for (const e of ['Bicola array', 'Bicola enlazada', 'Prioridad array', 'Prioridad enlazada']) expect(cuenta(tema4, e), e).toBe(12);
    expect(tema3.ejercicios.find((e) => e.id === '3-01')!.estructura).toBe('Pila array');
    expect(tema3.ejercicios.find((e) => e.id === '3-05')!.estructura).toBe('Pila enlazada');
    expect(tema4.ejercicios.find((e) => e.id === '4-01')!.estructura).toBe('Cola array');
    expect(tema4.ejercicios.find((e) => e.id === '4-05')!.estructura).toBe('Cola enlazada');
  });

  it('both topics go by exercise type', () => {
    for (const t of [tema3, tema4]) {
      const tipos = t.ejercicios.map((e) => e.tipo);
      const primero = (x: string) => tipos.indexOf(x as (typeof tipos)[number]);
      expect(primero('programar')).toBeLessThan(primero('fallo'));
      expect(tipos.lastIndexOf('programar')).toBeLessThan(primero('fallo'));
      expect(tipos.lastIndexOf('fallo')).toBeLessThan(primero('misterio'));
    }
  });
});
