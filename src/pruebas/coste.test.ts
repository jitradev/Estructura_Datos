import { describe, expect, it } from 'vitest';
import { leerCoste } from '../ejercicios/coste';

describe('leerCoste', () => {
  const casos: [string, string][] = [
    ['O(1)', 'O(1)'],
    ['1', 'O(1)'],
    ['O(log log n)', 'O(log log n)'],
    ['loglog(n)', 'O(log log n)'],
    ['O(log n)', 'O(log n)'],
    ['log(n)', 'O(log n)'],
    ['O(log2 n)', 'O(log n)'],
    ['log₂ n', 'O(log n)'],
    ['O(lg n)', 'O(log n)'],
    ['O(√n)', 'O(√n)'],
    ['sqrt(n)', 'O(√n)'],
    ['n^(1/2)', 'O(√n)'],
    ['O(n)', 'O(n)'],
    ['o(N)', 'O(n)'],
    ['O(n log n)', 'O(n log n)'],
    ['n*log(n)', 'O(n log n)'],
    ['nlogn', 'O(n log n)'],
    ['O(n²)', 'O(n²)'],
    ['O(n^2)', 'O(n²)'],
    ['n2', 'O(n²)'],
    ['n^3', 'O(n³)'],
  ];
  for (const [txt, clase] of casos) it(txt, () => expect(leerCoste(txt)).toEqual({ clase }));
  it('constants are pointed out', () => {
    expect(leerCoste('O(2n)')).toEqual({ constante: 'O(n)' });
    expect(leerCoste('n/2')).toEqual({ constante: 'O(n)' });
    expect(leerCoste('O(1000)')).toEqual({ constante: 'O(1)' });
    expect(leerCoste('3n^2')).toEqual({ constante: 'O(n²)' });
  });
  it('nonsense is not read', () => {
    expect(leerCoste('rápido')).toBeNull();
    expect(leerCoste('O(n+1)')).toBeNull();
  });
});
