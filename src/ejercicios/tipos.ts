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

/** Orders of growth offered in the cost exercises, from slowest to fastest. */
export const CLASES_COSTE = ['O(1)', 'O(log log n)', 'O(log n)', 'O(√n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n³)'] as const;
export type ClaseCoste = (typeof CLASES_COSTE)[number];

/** One step of the solution: «Vueltas.», «Cada vuelta cuesta.», «Total.» */
export interface PasoCoste {
  titulo: string;
  texto: string;
}

/**
 * A code fragment whose cost has to be worked out: first count the turns for a small n
 * (the interpreter runs `contar` and reads `x`), then pick the order of growth.
 */
export interface EjCoste {
  id: string;
  tipo: 'coste';
  titulo: string;
  /** Section of the topic page («Bucles simples», «Bucles anidados»...). */
  bloque: string;
  enunciado: string;
  pistas?: string[];
  alResolver?: string;
  /** The fragment as the student reads it. */
  codigo: string;
  /** What is counted, shown in step 1 (admits `código`). By default «¿Cuántas veces se ejecuta `x++`?». */
  pregunta?: string;
  /** Runnable version that leaves the count in `x`. By default `codigo`. `n`, `x`, `i`, `j` and `k` are already declared. */
  contar?: string;
  /** n for step 1. */
  n: number;
  coste: ClaseCoste;
  /** The three steps of the method. */
  pasos: PasoCoste[];
  /** Two values of n whose counts follow `coste` (tests); worst case if it depends on n. */
  nCrecimiento?: [number, number];
}

/** Exercises run on memory states, checked case by case against `solucion`. */
export type EjCodigo = EjProgramar | EjFallo;
export type Ejercicio = EjCodigo | EjCoste;

export interface Tema {
  id: string;
  titulo: string;
  resumen: string;
  ejercicios: Ejercicio[];
}
