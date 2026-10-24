// Tipos de ejercicio. Todos se corrigen con el intérprete: la solución no se escribe
// a mano, se calcula ejecutando el código de referencia sobre cada caso.

import { Constructor } from '../memoria/construir';
import { Contexto } from '../memoria/modelo';

export interface Caso {
  nombre: string; // «Lista vacía», «9 → 3 → 7»
  inicial: Constructor[];
  llamada?: string; // «insertarFinal(&cab, 5)»
}

interface Base {
  id: string;
  titulo: string;
  /** Admite **negrita** y `código`. */
  enunciado: string;
  pistas?: string[];
  alResolver?: string;
  ctx: Contexto;
  casos: Caso[];
  /** Variables de main que se comparan con la solución. */
  observar: string[];
  solucion: string;
}

/** Escribir sentencias (o una función) y verlas ejecutarse con animación. */
export interface EjProgramar extends Base {
  tipo: 'programar';
  codigoInicial?: string;
  /** Campos que no se pueden asignar, y funciones que no se pueden llamar si acaban en «()» (para obligar a mover nodos). */
  prohibidos?: string[];
}

export type TipoFallo = 'nulo' | 'liberado' | 'fuga' | 'pierde' | 'colgante' | 'array' | 'caso';

export const NOMBRE_FALLO: Record<TipoFallo, string> = {
  nulo: 'Acceso a NULL',
  liberado: 'Uso tras free',
  fuga: 'Fuga de memoria',
  pierde: 'Se pierde la lista',
  colgante: 'Puntero colgando',
  array: 'Fuera del array',
  caso: 'Caso sin contemplar',
};

/** Una función con un fallo típico: encontrar el caso, la línea, el tipo y arreglarla. */
export interface EjFallo extends Base {
  tipo: 'fallo';
  codigo: string;
  /** Líneas que se aceptan como «la del fallo». */
  lineasFallo: number[];
  /** Texto del paso 2. */
  preguntaLinea?: string;
  tiposFallo: TipoFallo[];
  /** Se enseña al acertar el tipo de fallo. */
  explicacion: string;
}

export type Ejercicio = EjProgramar | EjFallo;

export interface Tema {
  id: string;
  titulo: string;
  resumen: string;
  ejercicios: Ejercicio[];
}
