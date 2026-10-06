import React from 'react';

/** Texto con **negrita** y `código`. */
export function Rico({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {partes.map((p, i) =>
        p.startsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p.startsWith('`') ? <code key={i}>{p.slice(1, -1)}</code> : <React.Fragment key={i}>{p}</React.Fragment>,
      )}
    </>
  );
}

export type Nivel = 'ok' | 'mal' | 'aviso' | 'info';
export interface LineaInforme {
  nivel: Nivel;
  titulo: React.ReactNode;
  detalle?: React.ReactNode;
}

export function Informe({ lineas, titulo = 'Comprobación' }: { lineas: LineaInforme[]; titulo?: string }) {
  if (!lineas.length) return null;
  return (
    <div className="informe" aria-live="polite">
      <h3>{titulo}</h3>
      <ul>
        {lineas.map((l, i) => (
          <li key={i} className={`linea ${l.nivel}`}>
            <span className="icono" aria-hidden>
              {l.nivel === 'ok' ? '✓' : l.nivel === 'mal' ? '✗' : l.nivel === 'aviso' ? '!' : 'i'}
            </span>
            <div>
              <strong>{l.titulo}</strong>
              {l.detalle && <div className="detalle">{l.detalle}</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
