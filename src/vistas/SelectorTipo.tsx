// Header of every structure page of Visualizar and the Laboratorio: the way back to the kind
// of structure and a segmented control to switch to another subtype (grouped by family for
// the queues).

import { Miga } from './Miga';

export type GrupoVer = 'listas' | 'pilas' | 'colas';

export const NOMBRE_GRUPO: Record<GrupoVer, string> = { listas: 'Listas', pilas: 'Pilas', colas: 'Colas' };

/** Where the selector lives: Visualizar (#/ver/<id>) or the Laboratorio (#/lab/e/<id>). */
const SECCION = {
  ver: { nombre: 'Visualizar', raiz: '#/ver', grupo: (g: GrupoVer) => `#/ver/${g}`, tipo: (id: string) => `#/ver/${id}` },
  lab: { nombre: 'Laboratorio', raiz: '#/lab', grupo: (g: GrupoVer) => `#/lab/${g}`, tipo: (id: string) => `#/lab/e/${id}` },
};

export function SelectorTipo({
  grupo,
  actual,
  opciones,
  seccion = 'ver',
}: {
  grupo: GrupoVer;
  actual: string;
  opciones: { id: string; corto: string; familia?: string }[];
  seccion?: keyof typeof SECCION;
}) {
  const sec = SECCION[seccion];
  const familias = [...new Set(opciones.map((o) => o.familia ?? ''))];
  return (
    <>
      <Miga
        pasos={[
          ['Temas', '#/'],
          [sec.nombre, sec.raiz],
          [NOMBRE_GRUPO[grupo], sec.grupo(grupo)],
        ]}
      />
      <nav className="selector-tipo" aria-label={`Cambiar de ${NOMBRE_GRUPO[grupo].toLowerCase().slice(0, -1)}`}>
        {familias.map((f) => (
          <div key={f} className="selector-grupo">
            {f && <span className="selector-etiqueta">{f}</span>}
            <div className="segmentado">
              {opciones
                .filter((o) => (o.familia ?? '') === f)
                .map((o) => (
                  <a key={o.id} href={sec.tipo(o.id)} className={o.id === actual ? 'on' : ''} aria-current={o.id === actual ? 'page' : undefined}>
                    {o.corto}
                  </a>
                ))}
            </div>
          </div>
        ))}
      </nav>
    </>
  );
}
