// Los pasos de cada algoritmo del tema 6b, para animarlos.
//
// Cada algoritmo se ejecuta de verdad sobre una copia del array y va dejando una
// foto por cada cosa que hace: comparar, intercambiar, desplazar, copiar a aux...
// El código que se enseña al lado es el mismo del deck y de ordenacion.c, y cada
// paso dice qué línea se está ejecutando.
//
// Convenio de los dibujos (el mismo en todos los algoritmos):
//   rojo          lo que cambia en este paso
//   sombreado     en su sitio DEFINITIVO: ya no se vuelve a mover
//   discontinuo   un dato que sigue escrito pero ya no cuenta
//   llave gris    ordenado entre sí, pero no definitivo (insertion sort)
//   raya roja     los que ya son <= pivote (quicksort)
//
// Las cuentas siguen el convenio de ordenacion.c: una comparación es cada vez
// que se comparan dos claves. Con [5, 2, 8, 1, 4] salen las mismas cifras que en
// los dibujos del deck: selection 10 y 4, insertion 8 y 6, bubble 10 y 6.

export type AlgId = 'seleccion' | 'insercion' | 'burbuja' | 'mezcla' | 'rapida' | 'binaria';

export interface Paso {
  v: number[];
  linea: number; // 1-based, en el código del algoritmo
  nota: string;
  comp: number;
  mov: number;
  cambiadas: number[];
  definitivas: number[];
  descartadas: number[];
  marcas: Record<string, number>; // nombre -> índice (puede ser -1: antes del array)
  arco: [number, number] | null;
  ordenadas: [number, number] | null;
  menores: [number, number] | null;
  rango: [number, number] | null;
  x: number | null;
  aux: (number | null)[] | null;
  auxNuevas: number[];
  marcasAux: Record<string, number>;
  pila: string[];
}

export interface Resultado {
  pasos: Paso[];
  etiquetaMov: string; // qué cuenta la segunda cifra
}

export interface InfoAlg {
  id: AlgId;
  nombre: string;
  familia: string;
  idea: string;
  codigo: string;
}

export const ALGORITMOS: InfoAlg[] = [
  {
    id: 'seleccion',
    nombre: 'Selection sort',
    familia: 'sencillo · O(n²)',
    idea: 'Busca el más pequeño de lo que queda y lo pone delante. Tras cada pasada, uno más queda en su sitio definitivo.',
    codigo: `void ordSeleccion(int v[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int min = i;
        for (int j = i + 1; j < n; j++)
            if (v[j] < v[min]) min = j;
        intercambiar(&v[i], &v[min]);
    }
}`,
  },
  {
    id: 'insercion',
    nombre: 'Insertion sort',
    familia: 'sencillo · O(n²)',
    idea: 'Coge el siguiente y lo mete en su sitio entre los ya ordenados, corriendo a la derecha los mayores. Lo de la izquierda está ordenado entre sí, pero todavía no es definitivo.',
    codigo: `void ordInsercion(int v[], int n) {
    for (int i = 1; i < n; i++) {
        int x = v[i];
        int j = i - 1;
        while (j >= 0 && v[j] > x) {
            v[j + 1] = v[j];
            j--;
        }
        v[j + 1] = x;
    }
}`,
  },
  {
    id: 'burbuja',
    nombre: 'Bubble sort',
    familia: 'sencillo · O(n²)',
    idea: 'Compara cada pareja de vecinos y la cambia si está al revés: en cada pasada, el mayor de lo que queda sube hasta el final. Para cuando una pasada no cambia nada.',
    codigo: `void ordBurbuja(int v[], int n) {
    int i = 0, cambio;
    do {
        cambio = 0;
        for (int j = 0; j < n - 1 - i; j++)
            if (v[j] > v[j+1]) { intercambiar(&v[j], &v[j+1]); cambio = 1; }
        i++;
    } while (cambio);
}`,
  },
  {
    id: 'mezcla',
    nombre: 'Merge sort',
    familia: 'divide y vencerás · O(n log n)',
    idea: 'Parte por la mitad hasta quedarse con tramos de uno, y al volver de la recursión fusiona cada par de mitades ya ordenadas en aux.',
    codigo: `void mezclaRec(int v[], int aux[], int ini, int fin) {
    if (ini >= fin) return;
    int medio = ini + (fin - ini) / 2;
    mezclaRec(v, aux, ini, medio);
    mezclaRec(v, aux, medio + 1, fin);
    fusionar(v, aux, ini, medio, fin);
}

void fusionar(int v[], int aux[], int ini, int medio, int fin) {
    int i = ini, j = medio + 1, k = ini;
    while (i <= medio && j <= fin)
        if (v[i] <= v[j]) aux[k++] = v[i++];
        else               aux[k++] = v[j++];
    while (i <= medio) aux[k++] = v[i++];
    while (j <= fin)   aux[k++] = v[j++];
    for (k = ini; k <= fin; k++) v[k] = aux[k];
}`,
  },
  {
    id: 'rapida',
    nombre: 'Quicksort',
    familia: 'divide y vencerás · O(n log n) de media',
    idea: 'Elige un pivote (el último), pone a su izquierda los menores o iguales y a su derecha los mayores, y repite en cada lado. Tras cada partición el pivote queda en su sitio definitivo.',
    codigo: `void rapidaRec(int v[], int ini, int fin) {
    if (ini >= fin) return;
    int p = particion(v, ini, fin);
    rapidaRec(v, ini, p - 1);
    rapidaRec(v, p + 1, fin);
}

int particion(int v[], int ini, int fin) {
    int pivote = v[fin];
    int i = ini - 1;
    for (int j = ini; j < fin; j++)
        if (v[j] <= pivote) intercambiar(&v[++i], &v[j]);
    intercambiar(&v[i + 1], &v[fin]);
    return i + 1;
}`,
  },
  {
    id: 'binaria',
    nombre: 'Binary search',
    familia: 'búsqueda · O(log n)',
    idea: 'Sobre un array ordenado: mira el del medio y descarta la mitad donde no puede estar. Cada vuelta tira la mitad de lo que queda.',
    codigo: `int busquedaBinaria(const int v[], int n, int x) {
    int ini = 0, fin = n - 1;
    while (ini <= fin) {
        int med = ini + (fin - ini) / 2;
        if (v[med] == x) return med;
        if (v[med] <  x) ini = med + 1;
        else             fin = med - 1;
    }
    return -1;
}`,
  },
];

export const ORDENACIONES = ALGORITMOS.filter((a) => a.id !== 'binaria');

/** Línea (1-based) del código que contiene el trozo. Falla si no está: así un
 *  cambio en el código no deja pasos señalando a una línea que no es. */
function lin(codigo: string, trozo: string, desde = 1): number {
  const ls = codigo.split('\n');
  for (let k = desde - 1; k < ls.length; k++) if (ls[k].includes(trozo)) return k + 1;
  throw new Error(`no encuentro «${trozo}» en el código`);
}

const codigoDe = (id: AlgId) => ALGORITMOS.find((a) => a.id === id)!.codigo;

/** Lleva el estado y va guardando fotos. Lo que no se dice en un paso, se hereda
 *  del anterior solo si es "persistente" (definitivas, ordenadas, rango, pila...). */
class Grabador {
  pasos: Paso[] = [];
  v: number[];
  comp = 0;
  mov = 0;
  definitivas = new Set<number>();
  ordenadas: [number, number] | null = null;
  rango: [number, number] | null = null;
  aux: (number | null)[] | null = null;
  pila: string[] = [];
  constructor(datos: number[]) {
    this.v = [...datos];
  }
  foto(linea: number, nota: string, extra: Partial<Paso> = {}) {
    this.pasos.push({
      v: [...this.v],
      linea,
      nota,
      comp: this.comp,
      mov: this.mov,
      cambiadas: [],
      definitivas: [...this.definitivas],
      descartadas: [],
      marcas: {},
      arco: null,
      ordenadas: this.ordenadas,
      menores: null,
      rango: this.rango,
      x: null,
      aux: this.aux ? [...this.aux] : null,
      auxNuevas: [],
      marcasAux: {},
      pila: [...this.pila],
      ...extra,
    });
  }
  todas() {
    this.v.forEach((_, k) => this.definitivas.add(k));
  }
}

// ------------------------------------------------------------------ selection
export function seleccion(datos: number[]): Resultado {
  const C = codigoDe('seleccion');
  const g = new Grabador(datos);
  const v = g.v;
  const n = v.length;
  g.foto(1, 'El array de partida. El sombreado irá marcando lo que ya está en su sitio definitivo.');
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    g.foto(lin(C, 'int min = i'), `Pasada i = ${i}. De momento, el mínimo es v[${i}] = ${v[i]}.`, { marcas: { i, min } });
    for (let j = i + 1; j < n; j++) {
      g.comp++;
      const menor = v[j] < v[min];
      const antes = v[min];
      if (menor) min = j;
      g.foto(
        lin(C, 'if (v[j] < v[min])'),
        menor ? `¿${v[j]} < ${antes}? Sí: el nuevo mínimo es v[${j}] = ${v[j]}.` : `¿${v[j]} < ${antes}? No: el mínimo sigue siendo ${antes}.`,
        { marcas: { i, j, min } },
      );
    }
    [v[i], v[min]] = [v[min], v[i]];
    g.mov++;
    g.definitivas.add(i);
    g.foto(
      lin(C, 'intercambiar'),
      min === i
        ? `El mínimo ya estaba en la ${i}: se intercambia consigo mismo (el código no lo comprueba). El ${v[i]} queda en su sitio.`
        : `Se intercambian v[${i}] y v[${min}]: el ${v[i]} queda en su sitio definitivo.`,
      { marcas: { i }, arco: min === i ? null : [i, min], cambiadas: min === i ? [i] : [i, min] },
    );
  }
  g.todas();
  g.foto(C.split('\n').length, `Ordenado. ${g.comp} comparaciones y ${g.mov} intercambios: con n = ${n}, siempre n(n-1)/2 y n-1, vengan como vengan los datos.`);
  return { pasos: g.pasos, etiquetaMov: 'intercambios' };
}

// ------------------------------------------------------------------ insertion
export function insercion(datos: number[]): Resultado {
  const C = codigoDe('insercion');
  const g = new Grabador(datos);
  const v = g.v;
  const n = v.length;
  g.ordenadas = n > 0 ? [0, 0] : null;
  g.foto(1, 'El array de partida. Un elemento solo ya está ordenado: la llave marca lo que está ordenado entre sí.');
  for (let i = 1; i < n; i++) {
    const x = v[i];
    g.foto(lin(C, 'int x = v[i]'), `Pasada i = ${i}: se levanta x = ${x}. Su casilla queda libre para que los mayores se corran.`, {
      x,
      descartadas: [i],
      marcas: { i },
    });
    let j = i - 1;
    let hueco = i;
    for (;;) {
      if (j < 0) {
        g.foto(lin(C, 'while'), 'j = -1: ya no queda nadie a la izquierda. El bucle para sin comparar claves.', { x, descartadas: [hueco], marcas: { j } });
        break;
      }
      g.comp++;
      if (v[j] > x) {
        g.foto(lin(C, 'while'), `¿${v[j]} > ${x}? Sí: el ${v[j]} se corre una casilla a la derecha.`, { x, descartadas: [hueco], marcas: { j } });
        v[j + 1] = v[j];
        g.mov++;
        hueco = j;
        g.foto(lin(C, 'v[j + 1] = v[j]'), `v[${j + 1}] = v[${j}]. El ${v[j]} sigue escrito en la ${j}, pero ya no cuenta: es el hueco.`, {
          x,
          descartadas: [j],
          cambiadas: [j + 1],
          marcas: { j },
        });
        j--;
      } else {
        g.foto(lin(C, 'while'), `¿${v[j]} > ${x}? No: el ${x} va justo detrás del ${v[j]}. El bucle para.`, { x, descartadas: [hueco], marcas: { j } });
        break;
      }
    }
    v[j + 1] = x;
    g.ordenadas = [0, i];
    g.foto(lin(C, 'v[j + 1] = x'), `Se suelta x en la ${j + 1}. Del 0 al ${i}, ordenado entre sí.`, { cambiadas: [j + 1] });
  }
  g.ordenadas = null;
  g.todas();
  g.foto(C.split('\n').length, `Ordenado. ${g.comp} comparaciones y ${g.mov} desplazamientos. Si viniera ya ordenado, serían ${Math.max(0, n - 1)} comparaciones y ninguno.`);
  return { pasos: g.pasos, etiquetaMov: 'desplazamientos' };
}

// -------------------------------------------------------------------- bubble
export function burbuja(datos: number[]): Resultado {
  const C = codigoDe('burbuja');
  const g = new Grabador(datos);
  const v = g.v;
  const n = v.length;
  g.foto(1, 'El array de partida. El sombreado irá creciendo por la derecha.');
  let i = 0;
  let cambio: boolean;
  do {
    cambio = false;
    g.foto(lin(C, 'cambio = 0;'), `Pasada ${i + 1}: cambio = 0.`);
    for (let j = 0; j < n - 1 - i; j++) {
      g.comp++;
      const mayor = v[j] > v[j + 1];
      g.foto(lin(C, 'if (v[j] > v[j+1])'), `¿${v[j]} > ${v[j + 1]}? ${mayor ? 'Sí: se cambian.' : 'No: se quedan.'}`, { marcas: { j, 'j+1': j + 1 } });
      if (mayor) {
        [v[j], v[j + 1]] = [v[j + 1], v[j]];
        g.mov++;
        cambio = true;
        g.foto(lin(C, 'if (v[j] > v[j+1])'), `Intercambio: el ${v[j + 1]} sube un sitio. cambio = 1.`, {
          marcas: { j, 'j+1': j + 1 },
          arco: [j, j + 1],
          cambiadas: [j, j + 1],
        });
      }
    }
    if (n - 1 - i >= 0) g.definitivas.add(n - 1 - i);
    i++;
    g.foto(
      lin(C, 'i++'),
      cambio ? `Fin de la pasada ${i}: el ${v[n - i]} ya está en su sitio definitivo.` : `Fin de la pasada ${i}: no ha cambiado nada.`,
    );
  } while (cambio && i < n);
  g.todas();
  g.foto(
    lin(C, 'while (cambio)'),
    `Una pasada sin cambios: la bandera para el bucle. ${g.comp} comparaciones y ${g.mov} intercambios.`,
  );
  return { pasos: g.pasos, etiquetaMov: 'intercambios' };
}

// --------------------------------------------------------------------- merge
export function mezcla(datos: number[]): Resultado {
  const C = codigoDe('mezcla');
  const g = new Grabador(datos);
  const v = g.v;
  const n = v.length;
  g.aux = v.map(() => null);
  const L = {
    entra: lin(C, 'void mezclaRec'),
    base: lin(C, 'if (ini >= fin) return;'),
    medio: lin(C, 'int medio'),
    fusiona: lin(C, 'fusionar(v, aux, ini, medio, fin);'),
    ijk: lin(C, 'int i = ini, j = medio + 1, k = ini;'),
    izq: lin(C, 'if (v[i] <= v[j])'),
    der: lin(C, 'else               aux[k++] = v[j++];'),
    colaI: lin(C, 'while (i <= medio) aux'),
    colaJ: lin(C, 'while (j <= fin)   aux'),
    vuelta: lin(C, 'for (k = ini'),
  };

  const rec = (ini: number, fin: number) => {
    g.pila.push(`mezclaRec(v, aux, ${ini}, ${fin})`);
    g.rango = [ini, fin];
    if (ini >= fin) {
      g.foto(L.base, `Tramo [${ini}..${fin}]: un solo elemento. Caso base: ya está ordenado.`);
      g.pila.pop();
      return;
    }
    const medio = ini + Math.floor((fin - ini) / 2);
    g.foto(L.medio, `Tramo [${ini}..${fin}]: medio = ${medio}. Se parte en [${ini}..${medio}] y [${medio + 1}..${fin}].`);
    rec(ini, medio);
    rec(medio + 1, fin);
    g.rango = [ini, fin];
    // fusionar
    for (let t = ini; t <= fin; t++) g.aux![t] = null;
    let i = ini;
    let j = medio + 1;
    let k = ini;
    g.pila.push(`fusionar(v, aux, ${ini}, ${medio}, ${fin})`);
    const usadas = () => {
      const r: number[] = [];
      for (let t = ini; t < i; t++) r.push(t);
      for (let t = medio + 1; t < j; t++) r.push(t);
      return r;
    };
    const mi = () => {
      const m: Record<string, number> = {};
      if (i <= medio) m.i = i;
      if (j <= fin) m.j = j;
      return m;
    };
    g.foto(L.ijk, `Vuelve de las dos llamadas: [${ini}..${medio}] y [${medio + 1}..${fin}] ya están ordenadas. Ahora se fusionan en aux.`, {
      marcas: mi(),
      marcasAux: { k },
      ordenadas: null,
    });
    while (i <= medio && j <= fin) {
      g.comp++;
      if (v[i] <= v[j]) {
        const a = v[i];
        const b = v[j];
        g.aux![k] = v[i];
        i++;
        g.mov++;
        g.foto(L.izq, `${a} ≤ ${b}: se copia el ${a}, de la izquierda.`, { marcas: mi(), descartadas: usadas(), auxNuevas: [k], marcasAux: { k: k + 1 } });
      } else {
        const a = v[i];
        const b = v[j];
        g.aux![k] = v[j];
        j++;
        g.mov++;
        g.foto(L.der, `${a} > ${b}: se copia el ${b}, de la derecha.`, { marcas: mi(), descartadas: usadas(), auxNuevas: [k], marcasAux: { k: k + 1 } });
      }
      k++;
    }
    while (i <= medio) {
      g.aux![k] = v[i];
      const a = v[i];
      i++;
      g.mov++;
      g.foto(L.colaI, `La derecha se ha acabado: el ${a} se copia sin comparar.`, { marcas: mi(), descartadas: usadas(), auxNuevas: [k], marcasAux: { k: k + 1 } });
      k++;
    }
    while (j <= fin) {
      g.aux![k] = v[j];
      const b = v[j];
      j++;
      g.mov++;
      g.foto(L.colaJ, `La izquierda se ha acabado: el ${b} se copia sin comparar.`, { marcas: mi(), descartadas: usadas(), auxNuevas: [k], marcasAux: { k: k + 1 } });
      k++;
    }
    const cambiadas: number[] = [];
    for (let t = ini; t <= fin; t++) {
      v[t] = g.aux![t]!;
      cambiadas.push(t);
    }
    g.pila.pop();
    g.foto(L.vuelta, `Se copia aux de vuelta a v: [${ini}..${fin}] queda ordenado.`, { cambiadas });
    g.pila.pop();
  };

  g.foto(L.entra, 'El array de partida. Se llama a mezclaRec(v, aux, 0, n - 1).', { rango: null });
  if (n > 0) rec(0, n - 1);
  g.rango = null;
  g.aux = null;
  g.todas();
  g.foto(L.fusiona, `Ordenado. ${g.comp} comparaciones y ${g.mov} copias a aux.`);
  return { pasos: g.pasos, etiquetaMov: 'copias a aux' };
}

// ----------------------------------------------------------------- quicksort
export function rapida(datos: number[]): Resultado {
  const C = codigoDe('rapida');
  const g = new Grabador(datos);
  const v = g.v;
  const n = v.length;
  const L = {
    entra: lin(C, 'void rapidaRec'),
    base: lin(C, 'if (ini >= fin) return;'),
    part: lin(C, 'int p = particion'),
    piv: lin(C, 'int pivote = v[fin]'),
    i: lin(C, 'int i = ini - 1'),
    comp: lin(C, 'if (v[j] <= pivote)'),
    coloca: lin(C, 'intercambiar(&v[i + 1], &v[fin]);'),
    ret: lin(C, 'return i + 1;'),
  };

  const rec = (ini: number, fin: number) => {
    g.pila.push(`rapidaRec(v, ${ini}, ${fin})`);
    g.rango = [ini, fin];
    if (ini >= fin) {
      if (ini === fin) g.definitivas.add(ini);
      g.foto(
        L.base,
        ini === fin ? `Tramo [${ini}..${fin}]: un solo elemento, ya está en su sitio.` : `Tramo vacío [${ini}..${fin}]: no hay nada que hacer.`,
      );
      g.pila.pop();
      return;
    }
    g.pila.push(`particion(v, ${ini}, ${fin})`);
    const pivote = v[fin];
    g.foto(L.piv, `Tramo [${ini}..${fin}]. El pivote es el último: ${pivote}.`, { marcas: { pivote: fin } });
    let i = ini - 1;
    g.foto(L.i, `i = ${i}: todavía no hay ninguno ≤ ${pivote}. i marcará el último de ellos.`, { marcas: { pivote: fin, i } });
    for (let j = ini; j < fin; j++) {
      g.comp++;
      if (v[j] <= pivote) {
        i++;
        const mismo = i === j;
        [v[i], v[j]] = [v[j], v[i]];
        g.mov++;
        g.foto(
          L.comp,
          mismo
            ? `¿${v[j]} ≤ ${pivote}? Sí: i pasa a ${i}, y como i = j, se intercambia consigo mismo.`
            : `¿${v[i]} ≤ ${pivote}? Sí: i pasa a ${i} y se intercambian v[${i}] y v[${j}]. La zona de los ≤ ${pivote} crece.`,
          { marcas: { pivote: fin, i, j }, arco: mismo ? null : [i, j], cambiadas: mismo ? [i] : [i, j], menores: [ini, i] },
        );
      } else {
        g.foto(L.comp, `¿${v[j]} ≤ ${pivote}? No: se queda donde está.`, { marcas: { pivote: fin, i, j }, menores: i >= ini ? [ini, i] : null });
      }
    }
    [v[i + 1], v[fin]] = [v[fin], v[i + 1]];
    g.mov++;
    g.definitivas.add(i + 1);
    g.foto(L.coloca, `El pivote ${pivote} va a la ${i + 1}, justo detrás de los ≤ ${pivote}: su sitio definitivo.`, {
      marcas: { i },
      arco: i + 1 === fin ? null : [i + 1, fin],
      cambiadas: i + 1 === fin ? [fin] : [i + 1, fin],
      menores: i >= ini ? [ini, i] : null,
    });
    g.pila.pop();
    const p = i + 1;
    g.foto(L.ret, `particion devuelve ${p}. Ahora, una llamada para [${ini}..${p - 1}] y otra para [${p + 1}..${fin}], las dos sin el pivote.`);
    rec(ini, p - 1);
    rec(p + 1, fin);
    g.pila.pop();
  };

  g.foto(L.entra, 'El array de partida. Se llama a rapidaRec(v, 0, n - 1).');
  if (n > 0) rec(0, n - 1);
  g.rango = null;
  g.todas();
  g.foto(L.entra, `Ordenado. ${g.comp} comparaciones y ${g.mov} intercambios.`);
  return { pasos: g.pasos, etiquetaMov: 'intercambios' };
}

// ------------------------------------------------------------ binary search
export function binaria(datos: number[], x: number): Resultado {
  const C = codigoDe('binaria');
  const g = new Grabador([...datos].sort((a, b) => a - b));
  const v = g.v;
  const n = v.length;
  const L = {
    ini: lin(C, 'int ini = 0'),
    med: lin(C, 'int med'),
    igual: lin(C, 'if (v[med] == x)'),
    menor: lin(C, 'if (v[med] <  x)'),
    mayor: lin(C, 'else             fin'),
    no: lin(C, 'return -1;'),
  };
  const desc = new Set<number>();
  let ini = 0;
  let fin = n - 1;
  g.foto(L.ini, `Se busca el ${x} en un array ordenado de ${n}. ini = 0, fin = ${n - 1}.`, { marcas: { ini, fin } });
  while (ini <= fin) {
    const med = ini + Math.floor((fin - ini) / 2);
    g.foto(L.med, `med = ${ini} + (${fin} - ${ini}) / 2 = ${med}.`, { marcas: { ini, med, fin }, descartadas: [...desc] });
    g.comp++;
    if (v[med] === x) {
      g.foto(L.igual, `v[${med}] = ${x}: encontrado en ${g.comp} ${g.comp === 1 ? 'vuelta' : 'vueltas'}. Devuelve ${med}.`, {
        marcas: { med },
        descartadas: [...desc],
        cambiadas: [med],
      });
      return { pasos: g.pasos, etiquetaMov: '' };
    }
    if (v[med] < x) {
      for (let t = ini; t <= med; t++) desc.add(t);
      ini = med + 1;
      g.foto(L.menor, `${v[med]} < ${x}: el ${x} solo puede estar a la derecha. Se descarta hasta la ${med}: ini = ${ini}.`, {
        marcas: ini <= fin ? { ini, fin } : { fin },
        descartadas: [...desc],
      });
    } else {
      for (let t = med; t <= fin; t++) desc.add(t);
      fin = med - 1;
      g.foto(L.mayor, `${v[med]} > ${x}: el ${x} solo puede estar a la izquierda. Se descarta desde la ${med}: fin = ${fin}.`, {
        marcas: ini <= fin ? { ini, fin } : { ini },
        descartadas: [...desc],
      });
    }
  }
  g.foto(L.no, `ini = ${ini} ha pasado a fin = ${fin}: no queda nada donde buscar. El ${x} no está: devuelve -1.`, { descartadas: [...desc] });
  return { pasos: g.pasos, etiquetaMov: '' };
}

export function ejecutar(id: AlgId, datos: number[], x = 0): Resultado {
  switch (id) {
    case 'seleccion':
      return seleccion(datos);
    case 'insercion':
      return insercion(datos);
    case 'burbuja':
      return burbuja(datos);
    case 'mezcla':
      return mezcla(datos);
    case 'rapida':
      return rapida(datos);
    case 'binaria':
      return binaria(datos, x);
  }
}

// ----------------------------------------------------------- datos de prueba

/** Generador con semilla: el mismo botón «otro» da siempre la misma serie. */
export function aleatorio(n: number, semilla: number, max = 30): number[] {
  let s = semilla >>> 0 || 1;
  const r: number[] = [];
  for (let k = 0; k < n; k++) {
    s = (Math.imul(s, 1103515245) + 12345) >>> 0;
    r.push(1 + ((s >>> 16) % max));
  }
  return r;
}

export type TipoDatos = 'clase' | 'aleatorio' | 'casi' | 'reves' | 'propio';

export function generarDatos(tipo: TipoDatos, n: number, semilla: number, propio: number[]): number[] {
  switch (tipo) {
    case 'clase':
      return [5, 2, 8, 1, 4];
    case 'aleatorio':
      return aleatorio(n, semilla);
    case 'casi': {
      const v = aleatorio(n, semilla).sort((a, b) => a - b);
      if (n >= 4) {
        const a = 1 + (semilla % (n - 2));
        [v[a], v[a + 1]] = [v[a + 1], v[a]];
      }
      return v;
    }
    case 'reves':
      return aleatorio(n, semilla).sort((a, b) => b - a);
    case 'propio':
      return propio;
  }
}
