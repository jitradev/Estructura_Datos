import { describe, expect, it } from 'vitest';
import { TODOS_LOS_TEMAS } from '../ejercicios/registro';
import { comprobarCaso, ejecutarCaso } from '../ejercicios/comprobar';
import { contarVueltas, CRECIMIENTO } from '../ejercicios/coste';
import { leerValores, mismosValores, respuestas } from '../ejercicios/misterio';
import { ClaseCoste, EjCodigo, EjCoste } from '../ejercicios/tipos';

const todos = TODOS_LOS_TEMAS.flatMap((t) => t.ejercicios);
const conCodigo = todos.filter((e): e is EjCodigo => e.tipo !== 'coste' && e.tipo !== 'especificacion');
const deCoste = todos.filter((e): e is EjCoste => e.tipo === 'coste');

const CRECE = CRECIMIENTO;

describe('catálogo', () => {
  it('ids únicos', () => {
    const ids = todos.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  for (const ej of conCodigo) {
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
      if (ej.tipo === 'misterio') {
        it('cada pregunta tiene respuesta, la opción correcta existe y los casos no dan todos lo mismo', () => {
          expect(ej.correcta >= 0 && ej.correcta < ej.opciones.length).toBe(true);
          expect(new Set(ej.opciones).size).toBe(ej.opciones.length);
          const textos = ej.casos.map((c) => {
            const { respuestas: rs } = respuestas(ej, c);
            for (const r of rs) {
              expect(r.valores, c.nombre).not.toBeNull();
              expect(mismosValores(leerValores(r.texto), r.valores), `${c.nombre}: ${r.texto}`).toBe(true);
            }
            return rs.map((r) => r.texto).join('|');
          });
          if (ej.casos.length > 1) expect(new Set(textos).size).toBeGreaterThan(1);
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
  for (const ej of deCoste) {
    it(`${ej.id} ${ej.titulo}: se cuenta sin errores y crece como ${ej.coste}`, () => {
      const cuenta = (n: number) => {
        const r = contarVueltas(ej, n);
        if ('error' in r) throw new Error(`n = ${n}: ${r.error}`);
        return r.x;
      };
      expect(cuenta(ej.n)).toBeGreaterThan(0);
      // the count grows like the class: same ratio between two values of n, within 40 %
      const [a, b] = ej.nCrecimiento ?? [32, 256];
      const g = CRECE[ej.coste];
      const real = cuenta(b) / cuenta(a);
      const teorica = g(b) / g(a);
      expect(real / teorica).toBeGreaterThan(0.6);
      expect(real / teorica).toBeLessThan(1.4);
      // and no neighbouring class fits better
      for (const otra of Object.keys(CRECE) as ClaseCoste[]) {
        const t = CRECE[otra](b) / CRECE[otra](a);
        expect(Math.abs(Math.log(real / t)) + 1e-9, otra).toBeGreaterThanOrEqual(Math.abs(Math.log(real / teorica)) - 1e-9);
      }
    });
  }
});
