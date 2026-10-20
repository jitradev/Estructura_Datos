// Parte un archivo .c en sus funciones (con el comentario que llevan encima) y sus
// structs, para enseñar y ejecutar solo las que hacen falta en cada operación.

export interface FuncionC {
  nombre: string;
  texto: string; // comentario de encima + cabecera + cuerpo
}

export interface ArchivoC {
  funciones: Map<string, FuncionC>;
  structs: string[]; // «struct Nodo { ... };» tal cual
}

/** Posición de la llave que cierra la que se abre en i, saltando comentarios y cadenas. */
function cierre(src: string, i: number): number {
  let n = 0;
  for (let j = i; j < src.length; j++) {
    if (src.startsWith('//', j)) j = src.indexOf('\n', j) < 0 ? src.length : src.indexOf('\n', j);
    else if (src.startsWith('/*', j)) j = src.indexOf('*/', j + 2) + 1;
    else if (src[j] === '"' || src[j] === "'") {
      const q = src[j];
      for (j++; j < src.length && src[j] !== q; j++) if (src[j] === '\\') j++;
    } else if (src[j] === '{') n++;
    else if (src[j] === '}' && --n === 0) return j;
  }
  return src.length - 1;
}

export function trocear(src: string): ArchivoC {
  const funciones = new Map<string, FuncionC>();
  const structs: string[] = [];
  const lineas = src.split('\n');
  // inicio de cada línea en el texto
  const ini: number[] = [];
  let acc = 0;
  for (const l of lineas) {
    ini.push(acc);
    acc += l.length + 1;
  }
  const lineaDe = (pos: number) => {
    let k = 0;
    while (k + 1 < ini.length && ini[k + 1] <= pos) k++;
    return k;
  };

  let i = 0;
  while (i < src.length) {
    const llave = src.indexOf('{', i);
    if (llave < 0) break;
    const l0 = lineaDe(llave);
    // la cabecera puede ocupar varias líneas: se sube hasta una línea vacía, un comentario o un cierre
    let lc = l0;
    while (lc > 0 && /\S/.test(lineas[lc - 1]) && !/^\s*(\/\/|#|}|\*)/.test(lineas[lc - 1]) && !/[;}]\s*$/.test(lineas[lc - 1])) lc--;
    const cabecera = src.slice(ini[lc], llave);
    const fin = cierre(src, llave);
    const lf = lineaDe(fin);
    // comentario pegado encima
    let lcom = lc;
    while (lcom > 0 && /^\s*\/\//.test(lineas[lcom - 1]) && !/^\s*\/\/\s*=+/.test(lineas[lcom - 1])) lcom--;
    const struct = /^\s*(typedef\s+)?struct(\s+\w+)?\s*$/.test(cabecera);
    if (struct) {
      structs.push(lineas.slice(lc, lf + 1).join('\n'));
    } else {
      const m = /(\w+)\s*\([^)]*\)\s*$/.exec(cabecera.replace(/\s+/g, ' '));
      if (m) funciones.set(m[1], { nombre: m[1], texto: lineas.slice(lcom, lf + 1).join('\n') });
    }
    i = ini[lf] + lineas[lf].length + 1;
  }
  return { funciones, structs };
}

/** Nombres de funciones a las que llama el texto (de entre las conocidas). */
export function llamadas(texto: string, conocidas: Iterable<string>): string[] {
  const sinComentarios = texto.replace(/\/\/.*$/gm, '');
  const cuerpo = sinComentarios.slice(sinComentarios.indexOf('{'));
  return [...conocidas].filter((n) => new RegExp(`\\b${n}\\s*\\(`).test(cuerpo));
}
