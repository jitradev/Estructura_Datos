// Corrección: se ejecuta la solución y el código del alumno sobre cada caso y se
// comparan por forma las variables observadas, lo que devuelve y las fugas.

import { ejecutar, Resultado, verValor } from '../interprete/ejecutar';
import { describir, huella } from '../memoria/comparar';
import { construir } from '../memoria/construir';
import { mismoValor } from '../memoria/modelo';
import { Caso, EjCodigo } from './tipos';

export interface InformeCaso {
  caso: Caso;
  ok: boolean;
  titulo: string;
  detalle?: string[];
  resultado: Resultado;
}

export function ejecutarCaso(codigo: string, ej: EjCodigo, caso: Caso, conProhibidos = true): Resultado {
  return ejecutar(codigo, ej.ctx, construir(ej.ctx, caso.inicial), {
    llamada: caso.llamada,
    prohibidos: conProhibidos && ej.tipo === 'programar' ? ej.prohibidos : undefined,
  });
}

export function comprobarCaso(codigo: string, ej: EjCodigo, caso: Caso): InformeCaso {
  const esperado = ejecutarCaso(ej.solucion, ej, caso, false);
  const r = ejecutarCaso(codigo, ej, caso);
  const base = { caso, resultado: r };
  if (r.error) {
    const donde = r.error.linea > 0 ? `Línea ${r.error.linea}: ` : '';
    return { ...base, ok: false, titulo: `${donde}${r.error.mensaje}` };
  }
  const detalle: string[] = [];
  if (huella(r.memFinal, ej.observar) !== huella(esperado.memFinal, ej.observar)) {
    for (const v of ej.observar) {
      const tu = describir(r.memFinal, ej.ctx, v);
      const bien = describir(esperado.memFinal, ej.ctx, v);
      if (huella(r.memFinal, [v]) !== huella(esperado.memFinal, [v])) {
        detalle.push(`Tienes: ${tu}`);
        detalle.push(`Se esperaba: ${bien}`);
      }
    }
    if (!detalle.length) detalle.push('Las variables apuntan a los mismos valores, pero no con la misma forma (¿dos punteros al mismo nodo?).');
    return { ...base, ok: false, titulo: 'La memoria no queda como debe.', detalle };
  }
  const dv = esperado.devuelve;
  if (dv && dv.k !== 'nulo' && (!r.devuelve || !mismoValor(r.devuelve, dv))) {
    return {
      ...base,
      ok: false,
      titulo: `Devuelve ${r.devuelve ? verValor(r.devuelve) : 'nada'} y tendría que devolver ${verValor(dv)}.`,
    };
  }
  if (r.fugas.length) {
    const n = r.fugas.length;
    return {
      ...base,
      ok: false,
      titulo: `Fuga de memoria: ${n === 1 ? 'queda 1 nodo reservado al que no llega nadie' : `quedan ${n} nodos reservados a los que no llega nadie`} y sin free.`,
      detalle: ['Lo que ya no se alcanza no se puede liberar nunca. Guarda un puntero antes de perderlo y haz free cuando ya no haga falta.'],
    };
  }
  return { ...base, ok: true, titulo: 'Bien: la memoria queda como debe, sin errores ni fugas.' };
}

export function comprobarTodo(codigo: string, ej: EjCodigo): InformeCaso[] {
  return ej.casos.map((c) => comprobarCaso(codigo, ej, c));
}
