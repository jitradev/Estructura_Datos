// Modelo de memoria del intérprete: variables en marcos (main y llamadas) y
// objetos (structs) en el montón o como variables locales de main.
// Todo son objetos planos para poder copiarlos con structuredClone en cada paso.

export interface Tipo {
  base: string; // 'int', 'void' o el nombre de un struct
  ptr: number; // número de asteriscos
}

export type Ref =
  | { k: 'obj'; id: number } // puntero a un struct
  | { k: 'var'; marco: number; nombre: string } // puntero a una variable (Nodo **p = &cab)
  | { k: 'campo'; id: number; campo: string } // puntero a un campo (p = &(*p)->siguiente)
  | { k: 'elem'; id: number; campo: string; i: number };

export type Valor = { k: 'int'; v: number } | { k: 'nulo' } | { k: 'basura' } | { k: 'ref'; r: Ref };

export const NULO: Valor = { k: 'nulo' };
export const BASURA: Valor = { k: 'basura' };
export const int = (v: number): Valor => ({ k: 'int', v });

export interface CampoDef {
  nombre: string;
  tipo: Tipo;
  arr?: number; // tamaño si es un array (int datos[MAX])
}

export interface StructDef {
  nombre: string;
  campos: CampoDef[];
}

export interface Objeto {
  id: number;
  tipo: string;
  campos: Record<string, Valor | Valor[]>;
  heap: boolean; // reservado con malloc
  liberado: boolean;
  liberadoEn?: number; // línea del free
  creadoEn?: number; // línea del malloc
  nombre?: string; // para los structs locales de main (pila, cola)
}

export interface Variable {
  nombre: string;
  tipo: Tipo;
  valor: Valor;
}

export interface Marco {
  funcion: string; // 'main' o el nombre de la función
  vars: Variable[];
}

export interface Memoria {
  objetos: Record<number, Objeto>;
  marcos: Marco[];
  sigId: number;
}

export interface Contexto {
  structs: StructDef[];
  constantes?: Record<string, number>;
  /** Funciones auxiliares en mini C (esVacia, esLlena...). Se ejecutan sin pasos. */
  preludio?: string;
}

export const clonar = (m: Memoria): Memoria => structuredClone(m);

export function memoriaVacia(): Memoria {
  return { objetos: {}, marcos: [{ funcion: 'main', vars: [] }], sigId: 1 };
}

export function structDe(ctx: Contexto, nombre: string): StructDef | undefined {
  return ctx.structs.find((s) => s.nombre === nombre);
}

/** Un struct es «nodo» si tiene un puntero a su propio tipo llamado siguiente. */
export function esNodo(ctx: Contexto, tipo: string): boolean {
  const s = structDe(ctx, tipo);
  return !!s && s.campos.some((c) => c.nombre === 'siguiente' && c.tipo.base === tipo && c.tipo.ptr === 1);
}

/** El campo entero que se dibuja dentro del nodo (valor o dato). */
export function campoDato(ctx: Contexto, tipo: string): string | undefined {
  const s = structDe(ctx, tipo);
  return s?.campos.find((c) => c.tipo.base === 'int' && c.tipo.ptr === 0 && !c.arr)?.nombre;
}

export function nuevoObjeto(m: Memoria, ctx: Contexto, tipo: string, heap: boolean, nombre?: string): Objeto {
  const s = structDe(ctx, tipo);
  if (!s) throw new Error(`No existe el tipo ${tipo}`);
  const campos: Record<string, Valor | Valor[]> = {};
  for (const c of s.campos) campos[c.nombre] = c.arr ? Array.from({ length: c.arr }, () => BASURA) : BASURA;
  const o: Objeto = { id: m.sigId++, tipo, campos, heap, liberado: false, nombre };
  m.objetos[o.id] = o;
  return o;
}

export function mismoValor(a: Valor, b: Valor): boolean {
  if (a.k !== b.k) return false;
  if (a.k === 'int' && b.k === 'int') return a.v === b.v;
  if (a.k === 'ref' && b.k === 'ref') return mismaRef(a.r, b.r);
  return true;
}

export function mismaRef(a: Ref, b: Ref): boolean {
  if (a.k !== b.k) return false;
  switch (a.k) {
    case 'obj':
      return a.id === (b as typeof a).id;
    case 'var':
      return a.marco === (b as typeof a).marco && a.nombre === (b as typeof a).nombre;
    case 'campo':
      return a.id === (b as typeof a).id && a.campo === (b as typeof a).campo;
    case 'elem':
      return a.id === (b as typeof a).id && a.campo === (b as typeof a).campo && a.i === (b as typeof a).i;
  }
}

export const tipoTexto = (t: Tipo) => `${t.base}${t.ptr ? ' ' + '*'.repeat(t.ptr) : ''}`;
