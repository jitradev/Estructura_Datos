import { describe, expect, it } from 'vitest';
import { canonica, leerArgs, leerFirma, mismaFirma, mismosArgs, respuestaValida } from '../ejercicios/especificacion';
import { tema1 } from '../ejercicios/tema1';
import { EjEspec } from '../ejercicios/tipos';

describe('reading signatures', () => {
  it.each([
    ['entero, entero -> Fraccion', ['entero', 'entero'], 'Fraccion'],
    ['(int, int) → fraccion', ['entero', 'entero'], 'Fraccion'],
    ['crear(entero, entero) -> Fraccion', ['entero', 'entero'], 'Fraccion'],
    ['entero x entero -> Fraccion', ['entero', 'entero'], 'Fraccion'],
    ['-> Fraccion', [], 'Fraccion'],
    ['() -> Fraccion', [], 'Fraccion'],
    ['Fraccion, Fraccion -> bool', ['Fraccion', 'Fraccion'], 'booleano'],
    ['Fraccion -> double', ['Fraccion'], 'real'],
  ])('%s', (s, args, devuelve) => {
    expect(leerFirma(s, 'Fraccion')).toEqual({ args, devuelve });
  });

  it('rejects what it cannot read', () => {
    expect(leerFirma('entero, entero', 'Fraccion')).toBeNull();
    expect(leerFirma('numero -> Fraccion', 'Fraccion')).toBeNull();
  });
});

describe('reading the parameters of the informal specification', () => {
  it.each([
    ['entero, entero', ['entero', 'entero']],
    ['(int, int)', ['entero', 'entero']],
    ['', []],
    ['  ', []],
    ['Conjunto, int', ['Conjunto', 'entero']],
  ])('%j', (s, args) => {
    expect(leerArgs(s, 'Conjunto')).toEqual(args);
  });
  it('rejects unknown types', () => {
    expect(leerArgs('numero', 'Conjunto')).toBeNull();
  });
});

describe('comparing answers', () => {
  it('ignores spaces and the order of + and *', () => {
    expect(canonica('crear(a*d + c*b, b*d)')).toBe(canonica('crear(b*c+d*a, d * b)'));
    expect(canonica('valor(c) + 1')).toBe(canonica('1 + valor(c)'));
    expect(canonica('a - b')).not.toBe(canonica('b - a'));
  });
  it('reads booleans in several ways', () => {
    expect(canonica('cierto')).toBe(canonica('verdadero'));
    expect(canonica('false')).toBe(canonica('Falso'));
  });
  it('accepts any wording of an error', () => {
    expect(respuestaValida({ izq: 'crear(a, 0)', der: ['error: denominador cero'] }, 'error, no se puede')).toBe(true);
    expect(respuestaValida({ izq: 'crear(a, 0)', der: ['error: denominador cero'] }, 'crear(a, 0)')).toBe(false);
  });
});

describe('topic 1 catalogue', () => {
  const ejs = tema1.ejercicios as EjEspec[];
  it('has unique ids', () => {
    expect(new Set(ejs.map((e) => e.id)).size).toBe(ejs.length);
  });
  for (const ej of ejs) {
    it(`${ej.id} ${ej.titulo} is consistent`, () => {
      const nombres = ej.operaciones.map((o) => o.nombre);
      expect(new Set(nombres).size).toBe(nombres.length);
      const descs = ej.operaciones.map((o) => o.descripcion);
      expect(new Set([...descs, ...ej.distractores]).size).toBe(descs.length + ej.distractores.length);
      expect(ej.operaciones.some((o) => o.constructora)).toBe(true);
      for (const o of ej.operaciones) {
        const f = leerFirma(`${o.args.join(', ')} -> ${o.devuelve}`, ej.tad);
        expect(f, o.nombre).not.toBeNull();
        expect(mismaFirma(o, f!), o.nombre).toBe(true);
        expect(mismosArgs(o, leerArgs(o.args.join(', '), ej.tad)!), o.nombre).toBe(true);
      }
      for (const e of ej.ecuaciones) for (const d of e.der) expect(respuestaValida(e, d), `${e.izq} -> ${d}`).toBe(true);
    });
  }
});
