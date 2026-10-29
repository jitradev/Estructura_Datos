import { describe, expect, it } from 'vitest';
import { ejecutar } from '../interprete/ejecutar';
import { MESAS } from '../vistas/mesas';

describe('Laboratorio structures', () => {
  it('has every list, stack and queue', () => {
    expect(MESAS.length).toBe(13);
  });

  it.each(MESAS.map((m) => [m.nombre, m]))('%s starts empty and runs its example', (_, m) => {
    const ini = m.inicial();
    const r = ejecutar(m.ejemplo, m.ctx, ini, { maxPasos: 5000 });
    expect(r.error).toBeUndefined();
    expect(r.fugas).toEqual([]);
    expect(JSON.stringify(r.memFinal.objetos)).not.toBe(JSON.stringify(ini.objetos));
    expect(m.funciones.length).toBeGreaterThan(3);
  });
});
