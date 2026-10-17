import { describe, expect, it } from 'vitest';
import { TODOS_LOS_TEMAS } from '../ejercicios/registro';
import { comprobarCaso, ejecutarCaso } from '../ejercicios/comprobar';

const todos = TODOS_LOS_TEMAS.flatMap((t) => t.ejercicios);

describe('catálogo', () => {
  it('ids únicos', () => {
    const ids = todos.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  for (const ej of todos) {
    describe(ej.id + ' ' + ej.titulo, () => {
      it('la solución funciona en todos los casos, sin errores ni fugas', () => {
        for (const caso of ej.casos) {
          const r = ejecutarCaso(ej.solucion, ej, caso, false);
          expect(r.error, `${caso.nombre}: ${r.error?.mensaje}`).toBeUndefined();
          expect(r.fugas.length, caso.nombre).toBe(0);
          const inf = comprobarCaso(ej.solucion, ej, caso);
          expect(inf.ok, caso.nombre + ' ' + inf.titulo).toBe(true);
          for (const v of ej.observar) expect(r.memFinal.marcos[0].vars.some((x) => x.nombre === v), v).toBe(true);
        }
      });
      if (ej.tipo === 'programar' && ej.prohibidos) {
        it('la solución respeta los campos prohibidos', () => {
          for (const caso of ej.casos) expect(comprobarCaso(ej.solucion, ej, caso).ok).toBe(true);
        });
      }
      if (ej.tipo === 'programar' && ej.codigoInicial) {
        it('el código de partida no resuelve el ejercicio', () => {
          expect(ej.casos.some((c) => !comprobarCaso(ej.codigoInicial!, ej, c).ok)).toBe(true);
        });
      }
      if (ej.tipo === 'fallo') {
        it('el código con el fallo falla en algún caso y no en todos (o el fallo está en el caso)', () => {
          const inf = ej.casos.map((c) => comprobarCaso(ej.codigo, ej, c));
          expect(inf.some((i) => !i.ok)).toBe(true);
          const n = ej.codigo.split('\n').length;
          for (const l of ej.lineasFallo) expect(l >= 1 && l <= n).toBe(true);
        });
      }
    });
  }
});
