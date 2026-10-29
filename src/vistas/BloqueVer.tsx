// Pieces of the Visualizar structure pages: a numbered section that can be hidden (it stays
// hidden when moving to another structure) and the buttons to choose an operation.

import { ReactNode, useId, useState } from 'react';

const leer = (clave: string): boolean | null => {
  try {
    const v = localStorage.getItem(clave);
    return v === null ? null : v === '1';
  } catch {
    return null;
  }
};
const guardar = (clave: string, abierto: boolean) => {
  try {
    localStorage.setItem(clave, abierto ? '1' : '0');
  } catch {
    // without storage it just does not remember
  }
};

export function Bloque({ id, num, titulo, subtitulo, operaciones = false, children }: { id: string; num: number; titulo: string; subtitulo?: ReactNode; operaciones?: boolean; children: ReactNode }) {
  const clave = `ver-bloque-${id}`;
  const [abierto, setAbierto] = useState(() => leer(clave) ?? true);
  const cuerpo = useId();
  const cambiar = () => {
    guardar(clave, !abierto);
    setAbierto(!abierto);
  };
  return (
    <section className={`bloque-ver ${operaciones ? 'bloque-operaciones' : ''} ${abierto ? '' : 'cerrado'}`}>
      <h2 className="titulo-bloque">
        <button type="button" onClick={cambiar} aria-expanded={abierto} aria-controls={cuerpo}>
          <span className="num-bloque">{num}</span>
          <span className="titulo-bloque-texto">{titulo}</span>
          <span className="plegar">
            {abierto ? 'Ocultar' : 'Mostrar'}
            <span className="flecha-plegar" aria-hidden>
              ▾
            </span>
          </span>
        </button>
      </h2>
      {abierto && (
        <div id={cuerpo}>
          {subtitulo && <p className="subtitulo-bloque">{subtitulo}</p>}
          {children}
        </div>
      )}
    </section>
  );
}

/** Every operation at sight, as buttons grouped like in the .h. */
export function ElegirOperacion({ operaciones, actual, onChange }: { operaciones: { titulo: string; grupo: string }[]; actual: number; onChange: (i: number) => void }) {
  const grupos = [...new Set(operaciones.map((o) => o.grupo))];
  return (
    <div className="elegir-op" role="group" aria-label="Operación">
      {grupos.map((g) => (
        <div key={g} className="elegir-op-grupo">
          <span className="selector-etiqueta">{g}</span>
          <div className="elegir-op-botones">
            {operaciones.map((o, i) =>
              o.grupo === g ? (
                <button key={i} type="button" className={i === actual ? 'on' : ''} aria-pressed={i === actual} onClick={() => onChange(i)}>
                  {o.titulo}
                </button>
              ) : null,
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
