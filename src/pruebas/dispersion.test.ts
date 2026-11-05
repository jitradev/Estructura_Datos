import { describe, expect, it } from 'vitest';
import { leerCelda, leerNumero, leerResultado, mismaCelda, ocupadas, simular, verCelda } from '../ejercicios/dispersion';
import { tema6 } from '../ejercicios/tema6';
import { EjDispersion } from '../ejercicios/tipos';

const deTabla = tema6.ejercicios.filter((e): e is EjDispersion => e.tipo === 'dispersion');
const ej = (id: string) => deTabla.find((e) => e.id === id)!;

describe('rellena la tabla', () => {
  it('paper exercise 1: the chained buckets, inserting at the front', () => {
    const s = simular(ej('6-01'));
    expect(s.cubos).toEqual([[28], [36, 22, 15], [9], [17, 3], [], [], []]);
    expect(s.pasos.slice(-2).map((p) => [p.mira.length, p.resultado])).toEqual([
      [3, 'está'],
      [3, 'no está'],
    ]);
  });

  it('paper exercise 2: linear probing with deleted cells', () => {
    const s = simular(ej('6-05'));
    expect(s.pasos.map((p) => [p.mira.join(' '), p.resultado])).toEqual([
      ['3', '3'],
      ['3 4', '4'],
      ['3 4 5', '5'],
      ['3 4', 'borrada'],
      ['3 4 5', 'está'],
      ['3 4 5 6', '4'],
      ['3 4 5 6', 'no está'],
      ['5 6', '6'],
    ]);
    expect(s.celdas.map(verCelda).join(' ')).toBe('. . . 10 31 24 5');
  });

  it('paper exercise 3: quadratic probing and double hashing', () => {
    const cuad = simular(ej('6-08'));
    expect(cuad.celdas.map(verCelda).join(' ')).toBe('. . 37 . 4 15 5 . 26 . .');
    expect(cuad.pasos.map((p) => p.mira.length)).toEqual([1, 2, 3, 4, 2]);
    const doble = simular(ej('6-09'));
    expect(doble.celdas.map(verCelda).join(' ')).toBe('. . . . 4 5 26 . . 37 15');
    expect(doble.pasos.map((p) => p.mira.length)).toEqual([1, 2, 2, 2, 1]);
  });

  it('a full table and a quadratic sequence that misses free cells give «no cabe»', () => {
    expect(simular(ej('6-07')).pasos.map((p) => p.resultado).slice(-2)).toEqual(['no cabe', 'no está']);
    expect(simular(ej('6-10')).pasos.slice(-1)[0].resultado).toBe('no cabe');
  });

  it('every exercise has keys, a sound h2 and coherent questions', () => {
    for (const e of deTabla) {
      expect(e.ops.length, e.id).toBeGreaterThan(0);
      if (e.sondeo === 'doble') expect(e.q! > 0 && e.q! < e.tam, e.id).toBe(true);
      const s = simular(e);
      for (const q of e.preguntas ?? []) if (/α/.test(q.texto)) expect(q.respuesta, e.id).toBeCloseTo(ocupadas(e, s) / e.tam);
    }
  });

  it('reads what the student writes', () => {
    expect(mismaCelda(leerCelda(' b '), { k: 'borrada', clave: 17 })).toBe(true);
    expect(mismaCelda(leerCelda(''), { k: 'vacia' })).toBe(true);
    expect(mismaCelda(leerCelda('24'), { k: 'ocupada', clave: 24 })).toBe(true);
    expect(leerResultado('Ya estaba')).toBe('ya estaba');
    expect(leerResultado(' 4 ')).toBe('4');
    expect(leerNumero('0,77')).toBeCloseTo(0.77);
    expect(leerNumero('7/7')).toBe(1);
  });
});
