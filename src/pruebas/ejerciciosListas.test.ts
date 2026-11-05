import { describe, expect, it } from 'vitest';
import { comprobarCaso } from '../ejercicios/comprobar';
import { respuestas } from '../ejercicios/misterio';
import { EJERCICIOS_LISTAS } from '../ejercicios/tema2Listas';
import { EjFallo, EjMisterio, EjProgramar } from '../ejercicios/tipos';

const ej = <T>(id: string) => EJERCICIOS_LISTAS.find((e) => e.id === id) as T;
const informe = (id: string, nombre: string, codigo?: string) => {
  const e = ej<EjFallo>(id);
  return comprobarCaso(codigo ?? e.codigo, e, e.casos.find((c) => c.nombre === nombre)!);
};
const predicciones = (id: string) => {
  const e = ej<EjMisterio>(id);
  return e.casos.map((c) => respuestas(e, c).respuestas[0].texto);
};

describe('exercises on the double and circular lists', () => {
  it('every exercise is in a section and draws its list', () => {
    expect(EJERCICIOS_LISTAS.length).toBe(74);
    for (const e of EJERCICIOS_LISTAS) {
      expect(e.bloque, e.id).toMatch(/^Lista /);
      expect(e.ctx.tipoLista, e.id).toBeDefined();
    }
  });

  it('a link missing only backwards is caught, and the message shows it', () => {
    const doble = informe('2-D9', '9 ⇄ 3 ⇄ 7');
    expect(doble.ok).toBe(false);
    expect(doble.detalle!.join('\n')).toContain('lista->cola hacia atrás -> 7 -> 3 -> 9 -> NULL');
    expect(doble.detalle!.join('\n')).toContain('lista->cola hacia atrás -> 7 -> 3 -> 9 -> 1 -> NULL');

    const circular = informe('2-E8', '9 ⇄ 3 ⇄ 7 ↺');
    expect(circular.ok).toBe(false);
    expect(circular.detalle![0]).toContain('hacia atrás -> 9 -> 7 -> 3 -> 9 (otra vez');
    expect(circular.detalle![1]).toContain('hacia atrás -> 9 -> 5 -> 7 -> 3 -> 9 (otra vez');
  });

  it('each fault fails the way the exercise says', () => {
    expect(informe('2-C9', 'Lista vacía').ok).toBe(true);
    expect(informe('2-C9', '9 → 3 → 7 ↺').resultado.error?.mensaje).toMatch(/bucle|pasos/i);
    expect(informe('2-D10', 'El primero').ok).toBe(true);
    expect(informe('2-D10', 'El último').resultado.error?.linea).toBe(7);
    expect(informe('2-E10', 'Lista vacía').resultado.error?.linea).toBe(5);
    expect(informe('2-E10', '9 ⇄ 3 ⇄ 7 ↺').ok).toBe(true);
    expect(informe('2-C10', '9 → 3 → 7 ↺').titulo).toContain('Devuelve 12 y tendría que devolver 19');
    expect(informe('2-C11', '9 → 3 → 7 ↺').detalle!.join('\n')).toContain('liberado');
    expect(informe('2-C12', 'Lista vacía').detalle![0]).toContain('5 -> NULL');
    expect(informe('2-E9', 'El único').detalle!.join('\n')).toContain('liberado');
    expect(informe('2-D21', 'Un nodo').resultado.error?.linea).toBe(5);
    expect(informe('2-D21', '9 ⇄ 3 ⇄ 7').ok).toBe(true);
    expect(informe('2-D22', 'Un nodo').ok).toBe(false);
    expect(informe('2-D22', '9 ⇄ 3 ⇄ 7').ok).toBe(true);
    expect(informe('2-D23', '9 ⇄ 3 ⇄ 7').titulo).toContain('Fuga de memoria');
    expect(informe('2-C23', 'Lista vacía').resultado.error?.linea).toBe(5);
    expect(informe('2-C24', 'Tras el 9').ok).toBe(true);
    expect(informe('2-C24', 'Tras el último').ok).toBe(false);
    expect(informe('2-C25', 'Un nodo').detalle!.join('\n')).toContain('liberado');
    expect(informe('2-C26', '9 → 3 → 7 ↺').resultado.error?.linea).toBe(5);
    expect(informe('2-E19', 'Lista vacía').ok).toBe(true);
    expect(informe('2-E19', '9 ⇄ 3 ⇄ 7 ↺').detalle![0]).toContain('lista->acceso -> 9');
    expect(informe('2-E20', '9 ⇄ 3 ⇄ 7 ↺').detalle![0]).toContain('hacia atrás');
    expect(informe('2-E21', 'Un nodo').ok).toBe(true);
    expect(informe('2-E21', '9 ⇄ 3 ⇄ 7 ↺').resultado.error?.mensaje).toMatch(/bucle|pasos/i);
  });

  it('a fix that only works forwards is not accepted', () => {
    const e = ej<EjProgramar>('2-D1');
    const sinAnterior = e.solucion.replace('lista->cabeza->anterior = nuevo;\n', '');
    expect(comprobarCaso(sinAnterior, e, e.casos[0]).ok).toBe(false);
  });

  it('the mystery functions read the lists from their first node', () => {
    expect(predicciones('2-D12')).toEqual(['1', '3', '5']);
    expect(predicciones('2-C13')).toEqual(['2 3 4 1', '4 1 2 3', '1 2 3 4']);
    expect(predicciones('2-C14')).toEqual(['3', '1', '5']);
    expect(predicciones('2-E11')).toEqual(['1', '2', '0']);
    expect(predicciones('2-D24')).toEqual(['4 3 2 1', '5 8 6', '7']);
    expect(predicciones('2-C27')).toEqual(['3', '2', '7']);
    expect(predicciones('2-C28')).toEqual(['2 3 1', '4 1 4', '5']);
    expect(predicciones('2-E22')).toEqual(['9 1 3', '5 2', '7 1 2']);
  });

  it('rotating is forbidden to touch the links', () => {
    const e = ej<EjProgramar>('2-C4');
    const conEnlaces = 'Nodo *p = lista->acceso->siguiente;\nlista->acceso->siguiente = p;';
    expect(comprobarCaso(conEnlaces, e, e.casos[0]).ok).toBe(false);
  });
});
