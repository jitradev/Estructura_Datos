// The trace exercises of topic 7: run a sorting algorithm (or binary search) by hand and
// write the array after each pass. The rows are simulated here with the same code as the
// deck (src/ordenacion/pasos.ts), and the counts come from the animation itself, so that
// what the student writes is what Visualizar shows.

import { ALGORITMOS, ejecutar } from '../ordenacion/pasos';
import { EjTraza } from './tipos';

/** One row: what has just run and the array as it is left. */
export interface FilaTraza {
  etiqueta: string;
  v: number[];
}

/** One turn of binary search. */
export interface VueltaBinaria {
  ini: number;
  fin: number;
  med: number;
}

export interface SimTraza {
  filas: FilaTraza[];
  vueltas: VueltaBinaria[];
  devuelve: number | null;
  comp: number;
  mov: number;
  /** What the second count is: intercambios, desplazamientos, copias a aux. */
  etiquetaMov: string;
}

/** What a row stands for, said once over the table. */
export const QUE_ES_FILA: Record<EjTraza['alg'], string> = {
  seleccion: 'Una fila por cada vuelta del for de fuera, después del intercambio.',
  insercion: 'Una fila por cada vuelta del for, después de colocar x en su sitio.',
  burbuja: 'Una fila por cada pasada del do-while, también la última, la que ya no cambia nada.',
  mezcla: 'Una fila por cada llamada a fusionar, en el orden en que se hacen, después de copiar aux a v.',
  rapida: 'Una fila por cada llamada a particion (las que tienen más de un elemento), en el orden en que se hacen.',
  binaria: 'Una fila por cada vuelta del while: ini, fin y el med que mira.',
};

export function simularTraza(ej: EjTraza): SimTraza {
  const v = [...ej.datos];
  const n = v.length;
  const filas: FilaTraza[] = [];
  const vueltas: VueltaBinaria[] = [];
  let devuelve: number | null = null;
  const foto = (etiqueta: string) => filas.push({ etiqueta, v: [...v] });
  const cambiar = (a: number, b: number) => ([v[a], v[b]] = [v[b], v[a]]);

  switch (ej.alg) {
    case 'seleccion':
      for (let i = 0; i < n - 1; i++) {
        let min = i;
        for (let j = i + 1; j < n; j++) if (v[j] < v[min]) min = j;
        cambiar(i, min);
        foto(`i = ${i}`);
      }
      break;
    case 'insercion':
      for (let i = 1; i < n; i++) {
        const x = v[i];
        let j = i - 1;
        while (j >= 0 && v[j] > x) {
          v[j + 1] = v[j];
          j--;
        }
        v[j + 1] = x;
        foto(`i = ${i}`);
      }
      break;
    case 'burbuja': {
      let i = 0;
      let cambio: boolean;
      do {
        cambio = false;
        for (let j = 0; j < n - 1 - i; j++)
          if (v[j] > v[j + 1]) {
            cambiar(j, j + 1);
            cambio = true;
          }
        foto(`Pasada ${i + 1}`);
        i++;
      } while (cambio);
      break;
    }
    case 'mezcla': {
      const aux = new Array<number>(n);
      const fusionar = (ini: number, medio: number, fin: number) => {
        let i = ini;
        let j = medio + 1;
        let k = ini;
        while (i <= medio && j <= fin) aux[k++] = v[i] <= v[j] ? v[i++] : v[j++];
        while (i <= medio) aux[k++] = v[i++];
        while (j <= fin) aux[k++] = v[j++];
        for (k = ini; k <= fin; k++) v[k] = aux[k];
        foto(`fusionar(${ini}, ${medio}, ${fin})`);
      };
      const rec = (ini: number, fin: number) => {
        if (ini >= fin) return;
        const medio = ini + Math.trunc((fin - ini) / 2);
        rec(ini, medio);
        rec(medio + 1, fin);
        fusionar(ini, medio, fin);
      };
      rec(0, n - 1);
      break;
    }
    case 'rapida': {
      const particion = (ini: number, fin: number) => {
        const pivote = v[fin];
        let i = ini - 1;
        for (let j = ini; j < fin; j++) if (v[j] <= pivote) cambiar(++i, j);
        cambiar(i + 1, fin);
        foto(`particion(${ini}, ${fin})`);
        return i + 1;
      };
      const rec = (ini: number, fin: number) => {
        if (ini >= fin) return;
        const p = particion(ini, fin);
        rec(ini, p - 1);
        rec(p + 1, fin);
      };
      rec(0, n - 1);
      break;
    }
    case 'binaria': {
      const x = ej.x ?? 0;
      let ini = 0;
      let fin = n - 1;
      devuelve = -1;
      while (ini <= fin) {
        const med = ini + Math.trunc((fin - ini) / 2);
        vueltas.push({ ini, fin, med });
        if (v[med] === x) {
          devuelve = med;
          break;
        }
        if (v[med] < x) ini = med + 1;
        else fin = med - 1;
      }
      break;
    }
  }

  const r = ejecutar(ej.alg, ej.datos, ej.x ?? 0);
  const ultimo = r.pasos[r.pasos.length - 1];
  return { filas, vueltas, devuelve, comp: ultimo.comp, mov: ultimo.mov, etiquetaMov: r.etiquetaMov };
}

export const nombreAlg = (ej: EjTraza) => ALGORITMOS.find((a) => a.id === ej.alg)!.nombre;
export const codigoAlg = (ej: EjTraza) => ALGORITMOS.find((a) => a.id === ej.alg)!.codigo;

/** The numbers written in a cell or a row: «3», «3 1 2», «3, 1, 2». */
export const leerNumeros = (s: string): number[] =>
  s
    .split(/[\s,;]+/)
    .filter(Boolean)
    .map(Number)
    .filter((x) => Number.isFinite(x));
