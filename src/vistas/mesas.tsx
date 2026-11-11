// The structures of the Laboratorio: every list, stack and queue of the course projects,
// created and empty, with all the functions of their .c files ready to be called (they run
// as a single step, like in Visualizar). Built from the same catalogs as Visualizar.

import { ReactNode } from 'react';
import { temaVisible } from '../ejercicios/registro';
import { DibujoLista } from '../listas/DibujoLista';
import { LISTAS } from '../listas/catalogo';
import { construirLista } from '../listas/preparar';
import { trocear } from '../listas/trocear';
import { Contexto, Memoria } from '../memoria/modelo';
import { QueueDrawing } from '../queues/QueueDrawing';
import { COLAS } from '../queues/catalog';
import { buildQueue } from '../queues/prepare';
import { StackDrawing } from '../stacks/StackDrawing';
import { PILAS } from '../stacks/catalog';
import { buildStack } from '../stacks/prepare';
import { GrupoVer } from './SelectorTipo';
import { DibujoVector } from '../dibujo/DibujoVector';
import { construir, CTX_VECTOR, entero, vector } from '../memoria/construir';
import { AlgId, ALGORITMOS } from '../ordenacion/pasos';


export interface MesaLab {
  id: string;
  grupo: GrupoVer;
  nombre: string;
  corto: string;
  familia?: string;
  resumen: string;
  ctx: Contexto; // with every function of the project as preludio
  inicial: () => Memoria;
  dibujar: (mem: Memoria, prev?: Memoria, mini?: boolean) => ReactNode;
  /** Headers of the functions that can be called. */
  funciones: string[];
  ejemplo: string;
  /** Code already in the editor when the table opens. */
  codigoInicial?: string;
}

/** Printing is left out: the students do not print. */
const sinImprimir = (n: string) => !/^(mostrar|imprimir)/.test(n);

function funcionesDe(fuentes: string[]): { preludio: string; cabeceras: string[] } {
  const fs = fuentes.flatMap((s) => [...trocear(s).funciones.values()]).filter((f) => sinImprimir(f.nombre));
  const cabecera = (texto: string) =>
    texto
      .split('\n')
      .find((l) => /\w+\s*\(/.test(l) && !/^\s*(\/\/|\/\*|\*)/.test(l))!
      .replace(/\s*\{\s*$/, '')
      .trim();
  return { preludio: fs.map((f) => f.texto).join('\n\n'), cabeceras: fs.map((f) => cabecera(f.texto)) };
}

const listas: MesaLab[] = LISTAS.map((t) => {
  const { preludio, cabeceras } = funcionesDe([t.srcNodo, t.srcLista]);
  const [crear, asignar] = t.nodo === 'Nodo' ? ['crearNodo', 'asignarValor'] : ['crearNodoDoble', 'asignarValorNodoDoble'];
  const ins = `insertarPrincipio${t.sufijo}`;
  return {
    id: t.id,
    grupo: 'listas',
    nombre: t.nombre,
    corto: t.corto,
    resumen: t.resumen.slice(0, 2).join(' '),
    ctx: { ...t.ctx, preludio },
    inicial: () => construirLista(t, []),
    dibujar: (mem, prev, mini) => <DibujoLista mem={mem} prev={prev} tipo={t} compacto={mini} />,
    funciones: cabeceras,
    ejemplo: [10, 20].map((v, i) => `${t.nodo} *n${i + 1} = ${crear}();\n${asignar}(n${i + 1}, ${v});\n${ins}(lista, n${i + 1});\n`).join(''),
  };
});

const pilas: MesaLab[] = PILAS.map((t) => {
  const { preludio, cabeceras } = funcionesDe([t.src]);
  const push = t.operaciones.find((o) => o.args[0] === 'valor')!.fn;
  const pop = t.operaciones.find((o) => o.args[0] === '&valor' && o.grupo === 'Apilar y desapilar')!.fn;
  return {
    id: t.id,
    grupo: 'pilas',
    nombre: t.nombre,
    corto: t.corto,
    resumen: t.resumen.slice(0, 2).join(' '),
    ctx: { ...t.ctx, preludio },
    inicial: () => buildStack(t, []),
    dibujar: (mem, prev) => <StackDrawing mem={mem} prev={prev} tipo={t} />,
    funciones: cabeceras,
    ejemplo: `${push}(pila, 4);\n${push}(pila, 7);\n${push}(pila, 1);\n${pop}(pila, &valor);\n`,
  };
});

const colas: MesaLab[] = COLAS.map((t) => {
  const { preludio, cabeceras } = funcionesDe([t.src, ...t.otros]);
  const meter = t.operaciones.find((o) => o.args[0] === 'x')!;
  const sacar = t.operaciones.find((o) => o.args[0] === '&x' && o.grupo === 'Insertar y extraer')!;
  const con = (v: number, p: number) => `${meter.fn}(cola, ${v}${meter.args.includes('prioridad') ? `, ${p}` : ''});\n`;
  return {
    id: t.id,
    grupo: 'colas',
    nombre: t.nombre,
    corto: t.corto,
    familia: t.familia,
    resumen: t.resumen.slice(0, 2).join(' '),
    ctx: { ...t.ctx, preludio },
    inicial: () => buildQueue(t, { valores: [], prioridades: [], frente: 0 }),
    dibujar: (mem, prev) => <QueueDrawing mem={mem} prev={prev} tipo={t} />,
    funciones: cabeceras,
    ejemplo: con(5, 2) + con(8, 0) + con(3, 1) + `${sacar.fn}(cola, ${sacar.args.join(', ')});\n`,
  };
});

/** Topic 7: an int array with every function of ordenacion.c, to sort it by hand or with them. */
const ordenacion: MesaLab[] = (() => {
  const envoltorios = `
void ordMezcla(int v[], int n) {
    int aux[n];
    mezclaRec(v, aux, 0, n - 1);
}

void ordRapida(int v[], int n) {
    rapidaRec(v, 0, n - 1);
}`;
  const { preludio, cabeceras } = funcionesDe([CTX_VECTOR.preludio!, ...ALGORITMOS.map((a) => a.codigo), envoltorios]);
  const ctx = { ...CTX_VECTOR, preludio };
  const dibujar: MesaLab['dibujar'] = (mem, prev, mini) => <DibujoVector mem={mem} prev={prev} compacto={mini} />;
  const conDatos = (datos: number[]) => () => construir(CTX_VECTOR, [vector('v', datos), entero('n', datos.length)]);
  const FAMILIA: Record<AlgId, string> = { seleccion: 'Sencillos', insercion: 'Sencillos', burbuja: 'Sencillos', mezcla: 'Divide y vencerás', rapida: 'Divide y vencerás', binaria: 'Búsqueda' };
  const CORTO: Record<AlgId, string> = { seleccion: 'Selection', insercion: 'Insertion', burbuja: 'Bubble', mezcla: 'Merge', rapida: 'Quicksort', binaria: 'Binaria' };
  const LLAMADA: Record<AlgId, string> = {
    seleccion: 'ordSeleccion(v, n);',
    insercion: 'ordInsercion(v, n);',
    burbuja: 'ordBurbuja(v, n);',
    mezcla: 'int aux[n];\nmezclaRec(v, aux, 0, n - 1);',
    rapida: 'rapidaRec(v, 0, n - 1);',
    binaria: 'int pos = busquedaBinaria(v, n, 23);',
  };
  // one table per algorithm: its example is the code of the deck, so it runs line by line
  const porAlgoritmo: MesaLab[] = ALGORITMOS.map((a) => {
    const datos = a.id === 'binaria' ? [2, 5, 8, 12, 16, 23, 38, 56, 72, 91] : [5, 2, 8, 1, 4];
    return {
      id: a.id,
      grupo: 'ordenacion',
      nombre: a.nombre,
      corto: CORTO[a.id],
      familia: FAMILIA[a.id],
      resumen: `${a.idea} Empiezas con \`v = {${datos.join(', ')}}\` y \`n = ${datos.length}\`: el código ya está cargado: pulsa «Paso a paso» para verlo, o cámbialo y prueba tu versión.`,
      ctx,
      inicial: conDatos(datos),
      dibujar,
      funciones: cabeceras,
      ejemplo: `${a.codigo}\n\n${LLAMADA[a.id]}\n`,
      codigoInicial: `${a.codigo}\n\n${LLAMADA[a.id]}\n`,
    };
  });
  return [
    ...porAlgoritmo,
    {
      id: 'array',
      grupo: 'ordenacion',
      nombre: 'Array libre',
      corto: 'Libre',
      familia: 'Libre',
      resumen:
        'Empiezas con `int v[] = {5, 2, 8, 1, 4}` y `n = 5`. Escribe tu propia ordenación (funciones incluidas) y mírala paso a paso, o declara más arrays, como `int w[] = {9, 3, 7};` o `int aux[8];`.',
      ctx,
      inicial: conDatos([5, 2, 8, 1, 4]),
      dibujar,
      funciones: cabeceras,
      ejemplo: `void miBurbuja(int v[], int n) {
    for (int i = 0; i < n - 1; i++)
        for (int j = 0; j < n - 1 - i; j++)
            if (v[j] > v[j + 1])
                intercambiar(&v[j], &v[j + 1]);
}

miBurbuja(v, n);
int pos = busquedaBinaria(v, n, 4);
`,
    },
  ];
})();

const TEMA: Record<GrupoVer, string> = { listas: '2', pilas: '3', colas: '4', ordenacion: '7' };

/** Only the structures of the visible topics. */
export const MESAS: MesaLab[] = [...listas, ...pilas, ...colas, ...ordenacion].filter((m) => temaVisible(TEMA[m.grupo]));
