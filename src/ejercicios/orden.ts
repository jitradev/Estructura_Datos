// Order of a topic: the same as its sections on screen, so that "next" follows the list.

import { EjCodigo, Ejercicio } from './tipos';

const rangoTipo = (e: EjCodigo) => {
  if (e.tipo === 'fallo') return 2;
  if (e.tipo === 'misterio') return 3;
  return e.codigoInicial?.includes('(') ? 1 : 0;
};

/** Sorts the exercises by type and tags those without a structure yet. */
export const porTipo = (ejercicios: EjCodigo[], estructura: (e: EjCodigo) => string): Ejercicio[] =>
  [...ejercicios].sort((a, b) => rangoTipo(a) - rangoTipo(b)).map((e) => ({ estructura: estructura(e), ...e }));
