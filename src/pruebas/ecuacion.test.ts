import { describe, expect, it } from 'vitest';
import { analizarCoste, Ex, verPoli } from '../ejercicios/ecuacion';
import { tema5 } from '../ejercicios/tema5';
import { EjCoste } from '../ejercicios/tipos';

const ver = (e: Ex): string =>
  e.k === 'p' ? verPoli(e.p) : e.k === 'llamada' ? e.texto : e.k === 'sigma' ? `Σ[${e.abajo}..${e.arriba}](${ver(e.cuerpo)})` : `${e.k}(${e.xs.map(ver).join(', ')})`;

describe('cost equation', () => {
  const casos: [string, string, string][] = [
    ['for (i = 0; i < n; i++)\n    x++;\n', 'O(n)', 'n'],
    ['for (i = 0; i < n; i++)\n    for (j = 0; j < i; j++)\n        x++;\n', 'O(n²)', 'n²/2'],
    ['for (i = 0; i < n; i++)\n    for (j = i; j < n; j++)\n        x++;\n', 'O(n²)', 'n²/2'],
    ['i = n;\nwhile (i > 1) {\n    x++;\n    i = i / 2;\n}\n', 'O(log n)', ''],
    ['for (i = 0; i < n; i++)\n    for (j = 1; j < n; j = j * 2)\n        x++;\n', 'O(n log n)', ''],
    ['for (i = 1; i < n; i = i * 2)\n    for (j = 0; j < i; j++)\n        x++;\n', 'O(n)', '2n'],
    ['i = 0;\nwhile (i * i < n)\n    i++;\n', 'O(√n)', ''],
    ['for (i = 2; i < n; i = i * i)\n    x++;\n', 'O(log log n)', ''],
    ['for (i = 0; i < n; i++)\n    for (j = 0; j < n; j++)\n        for (k = 0; k < n; k++)\n            x++;\n', 'O(n³)', 'n³'],
    ['int recorre(int m) {\n    int s = 0;\n    for (int k = 0; k < m; k++) s++;\n    return s;\n}\n\nfor (i = 0; i < n; i++)\n    x += recorre(i);\n', 'O(n²)', ''],
  ];
  it.each(casos)('%s', (src, clase, total) => {
    const a = analizarCoste(src);
    if (!a.ok) throw new Error(a.motivo);
    const t = a.ecuaciones[a.ecuaciones.length - 1];
    expect(a.clase).toBe(clase);
    if (total) expect(verPoli(t.resultado)).toBe(total);
  });

  it('gives up on loops that depend on the data', () => {
    const a = analizarCoste('Nodo *p = cab;\nwhile (p != NULL) p = p->siguiente;\n');
    expect(a.ok).toBe(false);
  });

  it('agrees with every topic 5 exercise it can solve', () => {
    let resueltos = 0;
    for (const ej of tema5.ejercicios as EjCoste[]) {
      const a = analizarCoste(ej.codigo);
      if (!a.ok) continue;
      resueltos++;
      expect(a.clase, ej.id).toBe(ej.coste);
    }
    expect(resueltos).toBeGreaterThanOrEqual(18);
  });
});
