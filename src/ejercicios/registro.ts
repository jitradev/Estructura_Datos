import { tema2 } from './tema2';
import { tema3 } from './tema3';
import { tema4 } from './tema4';
import { Ejercicio, Tema } from './tipos';

/** Todos los temas (los tests los comprueban todos, se vean o no). */
export const TODOS_LOS_TEMAS: Tema[] = [tema2, tema3, tema4];

/** Topics hidden from the website. Remove an id to publish it (3 = stacks, 4 = queues). */
const OCULTOS = new Set<string>();
export const TEMAS: Tema[] = TODOS_LOS_TEMAS.filter((t) => !OCULTOS.has(t.id));
export const temaVisible = (id: string) => !OCULTOS.has(id);

/** «Listas, pilas y colas» with only the visible topics. */
export function nombreTemasVisibles(): string {
  const n = [temaVisible('2') && 'listas', temaVisible('3') && 'pilas', temaVisible('4') && 'colas'].filter(Boolean) as string[];
  const t = n.length > 1 ? `${n.slice(0, -1).join(', ')} y ${n[n.length - 1]}` : (n[0] ?? '');
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function buscarEjercicio(id: string): { tema: Tema; ejercicio: Ejercicio; indice: number } | null {
  for (const tema of TEMAS) {
    const indice = tema.ejercicios.findIndex((e) => e.id === id);
    if (indice >= 0) return { tema, ejercicio: tema.ejercicios[indice], indice };
  }
  return null;
}
