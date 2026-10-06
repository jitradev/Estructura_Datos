import { tema2 } from './tema2';
import { tema3 } from './tema3';
import { tema4 } from './tema4';
import { Ejercicio, Tema } from './tipos';

export const TEMAS: Tema[] = [tema2, tema3, tema4];

export function buscarEjercicio(id: string): { tema: Tema; ejercicio: Ejercicio; indice: number } | null {
  for (const tema of TEMAS) {
    const indice = tema.ejercicios.findIndex((e) => e.id === id);
    if (indice >= 0) return { tema, ejercicio: tema.ejercicios[indice], indice };
  }
  return null;
}
