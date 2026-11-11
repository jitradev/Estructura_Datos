import { describe, expect, it } from 'vitest';
import { ejecutar } from '../interprete/ejecutar';
import { describir } from '../memoria/comparar';
import { construir, CTX_VECTOR, entero, vector } from '../memoria/construir';

const mem = () => construir(CTX_VECTOR, [vector('v', [5, 2, 8, 1, 4]), entero('n', 5)]);

describe('int arrays', () => {
  it('sorts through an int v[] parameter and intercambiar', () => {
    const src = `
void ordSeleccion(int v[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int min = i;
        for (int j = i + 1; j < n; j++)
            if (v[j] < v[min]) min = j;
        intercambiar(&v[i], &v[min]);
    }
}`;
    const r = ejecutar(src, CTX_VECTOR, mem(), { llamada: 'ordSeleccion(v, n)' });
    expect(r.error).toBeUndefined();
    expect(describir(r.memFinal, CTX_VECTOR, 'v')).toBe('v = [1, 2, 4, 5, 8]');
  });

  it('declares local arrays with a size or with values', () => {
    const r = ejecutar('int w[] = {3, 1, 2};\nint aux[4];\naux[0] = w[2] + w[0];', CTX_VECTOR, mem());
    expect(r.error).toBeUndefined();
    expect(describir(r.memFinal, CTX_VECTOR, 'w')).toBe('w = [3, 1, 2]');
    expect(describir(r.memFinal, CTX_VECTOR, 'aux')).toBe('aux = [5, ?, ?, ?]');
  });

  it('stops when an index goes out of the array, also through a parameter', () => {
    const r = ejecutar('void f(int v[], int n) { v[n] = 0; }', CTX_VECTOR, mem(), { llamada: 'f(v, n)' });
    expect(r.error?.tipo).toBe('array');
    expect(r.error?.linea).toBe(1);
  });

  it('does not let an array be assigned', () => {
    const r = ejecutar('int w[2];\nw = v;', CTX_VECTOR, mem());
    expect(r.error?.tipo).toBe('tipo');
  });
});

describe('Laboratorio array table', () => {
  it('runs its example and every sorting function of ordenacion.c', async () => {
    const { MESAS } = await import('../vistas/mesas');
    const mesa = MESAS.find((m) => m.id === 'array')!;
    const r = ejecutar(mesa.ejemplo, mesa.ctx, mesa.inicial());
    expect(r.error).toBeUndefined();
    expect(describir(r.memFinal, mesa.ctx, 'v')).toBe('v = [1, 2, 4, 5, 8]');
    expect(describir(r.memFinal, mesa.ctx, 'pos')).toBe('pos = 2');
    for (const f of ['ordSeleccion', 'ordInsercion', 'ordBurbuja', 'ordMezcla', 'ordRapida']) {
      const s = ejecutar(`${f}(v, n);`, mesa.ctx, mesa.inicial());
      expect(s.error, f).toBeUndefined();
      expect(describir(s.memFinal, mesa.ctx, 'v'), f).toBe('v = [1, 2, 4, 5, 8]');
      // the aux of ordMezcla dies with the call
      expect(Object.keys(s.memFinal.objetos).length, f).toBe(1);
    }
  });
});

describe('Laboratorio sorting tables', () => {
  it('runs the deck code of every algorithm line by line', async () => {
    const { MESAS } = await import('../vistas/mesas');
    const tablas = MESAS.filter((m) => m.grupo === 'ordenacion' && m.id !== 'array');
    expect(tablas.map((m) => m.id)).toEqual(['seleccion', 'insercion', 'burbuja', 'mezcla', 'rapida', 'binaria']);
    for (const m of tablas) {
      const r = ejecutar(m.ejemplo, m.ctx, m.inicial(), { maxPasos: 5000 });
      expect(r.error, m.id).toBeUndefined();
      expect(r.pasos.length, m.id).toBeGreaterThan(10);
      if (m.id === 'binaria') expect(describir(r.memFinal, m.ctx, 'pos')).toBe('pos = 5');
      else expect(describir(r.memFinal, m.ctx, 'v'), m.id).toBe('v = [1, 2, 4, 5, 8]');
    }
  });
});
