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

export type TipoFallo = 'nulo' | 'liberado' | 'fuga' | 'pierde' | 'colgante' | 'array' | 'bucle' | 'caso';

export const NOMBRE_FALLO: Record<TipoFallo, string> = {
  nulo: 'Acceso a NULL',
  liberado: 'Uso tras free',
  fuga: 'Fuga de memoria',
  pierde: 'Se pierde la lista',
  colgante: 'Puntero colgando',
  array: 'Fuera del array',
  bucle: 'Bucle infinito',
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
 * A code fragment whose cost has to be written in O notation. Once solved, a table shows
 * the turns for several n (the interpreter runs `contar` and reads `x`).
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
  /** What `contar` counts (admits `código`). By default «¿Cuántas veces se ejecuta `x++`?». */
  pregunta?: string;
  /** Runnable version that leaves the count in `x`. By default `codigo`. `n`, `x`, `i`, `j` and `k` are already declared. */
  contar?: string;
  /** A small n whose count the tests check. */
  n: number;
  coste: ClaseCoste;
  /** The three steps of the method. */
  pasos: PasoCoste[];
  /** Two values of n whose counts follow `coste` (tests); worst case if it depends on n. */
  nCrecimiento?: [number, number];
}

/**
 * A function (or a few statements) to read and understand: first predict what it leaves in
 * each case (the interpreter runs `solucion`, which is the code shown), then pick what it does.
 */
export interface EjMisterio extends Base {
  tipo: 'misterio';
  /** What is asked in each case: «devuelve» (what the call returns) or variables of main. */
  responder: string[];
  /** Descriptions to choose from; `correcta` is the index of the right one. */
  opciones: string[];
  correcta: number;
  /** Question of step 2. By default «¿Qué hace?». */
  preguntaOpciones?: string;
  /** Shown once solved. */
  explicacion: string;
}

/** Exercises run on memory states, case by case. */
export type EjCodigo = EjProgramar | EjFallo | EjMisterio;
/** One operation of a TAD: what its informal and formal specifications say. */
export interface OpEspec {
  nombre: string;
  /** Types of the arguments: entero, real, booleano, cadena or the TAD itself. */
  args: string[];
  devuelve: string;
  /** Marked with * in the syntax: it builds a value of the TAD from nothing. */
  constructora?: boolean;
  /** Its line in the informal specification. */
  descripcion: string;
}

/** An equation of the semantics whose right side the student writes. */
export interface EcuacionEspec {
  izq: string;
  /** Accepted right sides; the first is the one shown. */
  der: string[];
  /** Fixed text before the gap, such as «verdadero si». */
  antes?: string;
}

/** Topic 1: write the informal and formal specification of a TAD, step by step. */
export interface EjEspec {
  id: string;
  tipo: 'especificacion';
  titulo: string;
  bloque: string;
  enunciado: string;
  pistas?: string[];
  alResolver?: string;
  tad: string;
  /** What its values are, in the header «TAD Fraccion (...)». */
  valores: string;
  /** «a, b enteros y f, g de tipo Fraccion», for «Para todo ...». */
  variables: string;
  operaciones: OpEspec[];
  /** Wrong descriptions offered next to the right ones in the informal step. */
  distractores: string[];
  ecuaciones: EcuacionEspec[];
}

export type Ejercicio = EjCodigo | EjCoste | EjEspec;

export interface Tema {
  id: string;
  titulo: string;
  resumen: string;
  ejercicios: Ejercicio[];
}
