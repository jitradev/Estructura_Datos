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

export type GrupoMesa = 'Listas' | 'Pilas' | 'Colas';

export interface MesaLab {
  id: string;
  grupo: GrupoMesa;
  nombre: string;
  resumen: string;
  ctx: Contexto; // with every function of the project as preludio
  inicial: () => Memoria;
  dibujar: (mem: Memoria, prev?: Memoria, mini?: boolean) => ReactNode;
  /** Headers of the functions that can be called. */
  funciones: string[];
  ejemplo: string;
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
    grupo: 'Listas',
    nombre: t.nombre,
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
    grupo: 'Pilas',
    nombre: t.nombre,
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
    grupo: 'Colas',
    nombre: t.nombre,
    resumen: t.resumen.slice(0, 2).join(' '),
    ctx: { ...t.ctx, preludio },
    inicial: () => buildQueue(t, { valores: [], prioridades: [], frente: 0 }),
    dibujar: (mem, prev) => <QueueDrawing mem={mem} prev={prev} tipo={t} />,
    funciones: cabeceras,
    ejemplo: con(5, 2) + con(8, 0) + con(3, 1) + `${sacar.fn}(cola, ${sacar.args.join(', ')});\n`,
  };
});

const TEMA: Record<GrupoMesa, string> = { Listas: '2', Pilas: '3', Colas: '4' };

/** Only the structures of the visible topics. */
export const MESAS: MesaLab[] = [...listas, ...pilas, ...colas].filter((m) => temaVisible(TEMA[m.grupo]));
