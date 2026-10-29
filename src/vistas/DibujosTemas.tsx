// The illustration at the top of each topic card: one small, recognizable picture per topic.

const Punta = ({ id }: { id: string }) => (
  <defs>
    <marker id={id} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0 0L10 5L0 10z" className="lam-punta" />
    </marker>
  </defs>
);

export const DIBUJOS_TEMAS: Record<string, JSX.Element> = {
  // a TAD: its name and the signatures of its operations
  '1': (
    <svg viewBox="0 0 280 110" aria-hidden>
      <rect x="44" y="8" width="192" height="94" rx="10" className="lam-caja" />
      <path d="M44 18a10 10 0 0 1 10-10h172a10 10 0 0 1 10 10v14H44z" className="lam-cab" />
      <text x="140" y="25" className="lam-cab-t">
        TAD Fracción
      </text>
      <text x="58" y="52" className="lam-mono">
        <tspan className="lam-rojo">*</tspan>crear(e, e) → Fracción
      </text>
      <text x="58" y="71" className="lam-mono">
        sumar(F, F) → Fracción
      </text>
      <text x="58" y="90" className="lam-mono">
        num(F) → entero
      </text>
    </svg>
  ),
  // a singly linked list, from the head pointer to NULL
  '2': (
    <svg viewBox="0 0 280 110" aria-hidden>
      <Punta id="pt-t2" />
      <text x="37" y="20" className="lam-et">
        lista
      </text>
      <path d="M37 26V46" className="lam-flecha" markerEnd="url(#pt-t2)" />
      {[9, 3, 7].map((v, i) => (
        <g key={i} transform={`translate(${20 + i * 72} 50)`}>
          <rect width="34" height="30" rx="4" className="lam-caja" />
          <rect x="34" width="20" height="30" rx="4" className="lam-caja" />
          <text x="17" y="20" className="lam-t">
            {v}
          </text>
          <circle cx="44" cy="15" r="2.5" className="lam-punta" />
          <path d={i < 2 ? 'M44 15H70' : 'M44 15H66'} className="lam-flecha" markerEnd="url(#pt-t2)" />
        </g>
      ))}
      <text x="238" y="69" className="lam-et">
        NULL
      </text>
    </svg>
  ),
  // a stack in an array: the top, and the next push
  '3': (
    <svg viewBox="0 0 280 110" aria-hidden>
      <Punta id="pt-t3" />
      {[0, 1, 2, 3, 4].map((i) => {
        const v = [undefined, undefined, 8, 1, 4][i];
        return (
          <g key={i}>
            <rect x="110" y={10 + i * 18} width="64" height="18" className={v === undefined ? 'lam-vacia' : 'lam-caja'} />
            {v !== undefined && (
              <text x="142" y={23 + i * 18} className="lam-t peq">
                {v}
              </text>
            )}
          </g>
        );
      })}
      <text x="30" y="35" className="lam-mono">
        push(7)
      </text>
      <path d="M84 31H104" className="lam-flecha" markerEnd="url(#pt-t3)" />
      <text x="214" y="59" className="lam-et">
        cima
      </text>
      <path d="M208 55H180" className="lam-flecha" markerEnd="url(#pt-t3)" />
    </svg>
  ),
  // a circular queue: the end wraps around to the start
  '4': (
    <svg viewBox="0 0 280 110" aria-hidden>
      <Punta id="pt-t4" />
      <path d="M236 40C236 6 44 6 44 40" className="lam-flecha discontinua" markerEnd="url(#pt-t4)" />
      <rect x="117" y="6" width="46" height="16" rx="8" className="lam-pastilla" />
      <text x="140" y="18" className="lam-et centro">
        % TAM
      </text>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const v = [5, 2, undefined, undefined, undefined, 3, 8][i];
        return (
          <g key={i}>
            <rect x={28 + i * 32} y="44" width="32" height="30" className={v === undefined ? 'lam-vacia' : 'lam-caja'} />
            {v !== undefined && (
              <text x={44 + i * 32} y="64" className="lam-t">
                {v}
              </text>
            )}
          </g>
        );
      })}
      <text x="204" y="104" className="lam-et centro">
        frente
      </text>
      <path d="M204 92V80" className="lam-flecha" markerEnd="url(#pt-t4)" />
      <text x="76" y="104" className="lam-et centro">
        final
      </text>
      <path d="M76 92V80" className="lam-flecha" markerEnd="url(#pt-t4)" />
    </svg>
  ),
  // how the cost grows with n
  '5': (
    <svg viewBox="0 0 280 110" aria-hidden>
      <Punta id="pt-t5" />
      <path d="M30 98H252" className="lam-eje" markerEnd="url(#pt-t5)" />
      <path d="M30 98V8" className="lam-eje" markerEnd="url(#pt-t5)" />
      <text x="258" y="102" className="lam-et">
        n
      </text>
      <path d="M30 86H228" className="lam-curva c1" />
      <path d="M30 98L228 44" className="lam-curva c2" />
      <path d="M30 98Q150 98 196 14" className="lam-curva c3" />
      <text x="234" y="90" className="lam-et">
        O(1)
      </text>
      <text x="234" y="47" className="lam-et">
        O(n)
      </text>
      <text x="204" y="20" className="lam-et rojo">
        O(n²)
      </text>
    </svg>
  ),
};
