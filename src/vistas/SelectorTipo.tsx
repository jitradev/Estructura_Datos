// Header of every Visualizar page: the way back to the kind of structure and a segmented
// control to switch to another subtype (grouped by family for the queues).

export type GrupoVer = 'listas' | 'pilas' | 'colas';

export const NOMBRE_GRUPO: Record<GrupoVer, string> = { listas: 'Listas', pilas: 'Pilas', colas: 'Colas' };

export function SelectorTipo({ grupo, actual, opciones }: { grupo: GrupoVer; actual: string; opciones: { id: string; corto: string; familia?: string }[] }) {
  const familias = [...new Set(opciones.map((o) => o.familia ?? ''))];
  return (
    <>
      <nav className="miga">
        <a href="#/">Temas</a>
        <span>/</span>
        <a href="#/ver">Visualizar</a>
        <span>/</span>
        <a href={`#/ver/${grupo}`}>{NOMBRE_GRUPO[grupo]}</a>
      </nav>
      <nav className="selector-tipo" aria-label={`Cambiar de ${NOMBRE_GRUPO[grupo].toLowerCase().slice(0, -1)}`}>
        {familias.map((f) => (
          <div key={f} className="selector-grupo">
            {f && <span className="selector-etiqueta">{f}</span>}
            <div className="segmentado">
              {opciones
                .filter((o) => (o.familia ?? '') === f)
                .map((o) => (
                  <a key={o.id} href={`#/ver/${o.id}`} className={o.id === actual ? 'on' : ''} aria-current={o.id === actual ? 'page' : undefined}>
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
