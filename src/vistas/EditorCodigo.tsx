// Editor de código ligero: un textarea con el texto transparente encima de una capa
// que colorea el C y marca las líneas (ejecutada, actual, error, marcada). Los números
// de línea se pueden pulsar (para marcar la línea del fallo).

import React, { useRef } from 'react';

export type EstadoLinea = 'hecha' | 'actual' | 'error' | 'marcada' | 'bien';

const RE = /(\/\/.*$|\/\*.*?\*\/|\b(?:while|do|if|else|for|return|break|continue|sizeof|struct|const)\b|\b(?:int|void|char|Nodo|NodoDoble|NodoSimple|NodoPrioridad|PilaArray|PilaEnlazada|ColaArray|ColaEnlazada|BicolaArray|BicolaEnlazada|BicolaSalidaRestringida|ColaPrioridadLista|ColaPrioridadArray|Lista|ListaDoble|ListaCircular|ListaCircularDoble)\b|\b(?:NULL|MAX|TAM|TAM_COLA_ARRAY|TAM_BICOLA_ARRAY|NUM_PRIORIDADES)\b|\b(?:malloc|free)\b|\b\d+\b)/g;

function colorear(linea: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let ult = 0;
  let m: RegExpExecArray | null;
  RE.lastIndex = 0;
  while ((m = RE.exec(linea))) {
    if (m.index > ult) out.push(linea.slice(ult, m.index));
    const t = m[0];
    const cls = t.startsWith('//') || t.startsWith('/*') ? 'cm' : /^\d/.test(t) ? 'nu' : /^(int|void|char|Nodo|NodoDoble|NodoSimple|NodoPrioridad|PilaArray|PilaEnlazada|ColaArray|ColaEnlazada|BicolaArray|BicolaEnlazada|BicolaSalidaRestringida|ColaPrioridadLista|ColaPrioridadArray|Lista|ListaDoble|ListaCircular|ListaCircularDoble)$/.test(t) ? 'ty' : /^(NULL|MAX|TAM|TAM_COLA_ARRAY|TAM_BICOLA_ARRAY|NUM_PRIORIDADES)$/.test(t) ? 'ct' : /^(malloc|free)$/.test(t) ? 'fn' : 'kw';
    out.push(
      <span key={m.index} className={cls}>
        {t}
      </span>,
    );
    ult = m.index + t.length;
  }
  if (ult < linea.length) out.push(linea.slice(ult));
  return out;
}

export function EditorCodigo({
  valor,
  onChange,
  soloLectura,
  estados = {},
  etiquetas = {},
  onLinea,
  etiquetaAria = 'Código',
  minLineas = 8,
}: {
  valor: string;
  onChange?: (v: string) => void;
  soloLectura?: boolean;
  estados?: Record<number, EstadoLinea>;
  etiquetas?: Record<number, string>;
  onLinea?: (n: number) => void;
  etiquetaAria?: string;
  minLineas?: number;
}) {
  const ta = useRef<HTMLTextAreaElement>(null);
  const lineas = valor.split('\n');
  const n = Math.max(lineas.length, minLineas);
  const ancho = Math.max(...lineas.map((l) => l.length), 30) + 4;

  const teclas = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!onChange || soloLectura) return;
    const t = e.currentTarget;
    const { selectionStart: a, selectionEnd: b } = t;
    const poner = (texto: string, cursor: number) => {
      onChange(valor.slice(0, a) + texto + valor.slice(b));
      requestAnimationFrame(() => {
        if (ta.current) ta.current.selectionStart = ta.current.selectionEnd = cursor;
      });
    };
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      poner('    ', a + 4);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const ini = valor.lastIndexOf('\n', a - 1) + 1;
      const actual = valor.slice(ini, a);
      let sangria = actual.match(/^ */)![0];
      if (/\{\s*$/.test(actual)) sangria += '    ';
      poner('\n' + sangria, a + 1 + sangria.length);
    } else if (e.key === '}') {
      const ini = valor.lastIndexOf('\n', a - 1) + 1;
      const antes = valor.slice(ini, a);
      if (/^ {4,}$/.test(antes)) {
        e.preventDefault();
        onChange(valor.slice(0, a - 4) + '}' + valor.slice(b));
        requestAnimationFrame(() => {
          if (ta.current) ta.current.selectionStart = ta.current.selectionEnd = a - 3;
        });
      }
    }
  };

  return (
    <div className={`editor-codigo ${soloLectura ? 'lectura' : ''}`}>
      <div className="canalon" aria-hidden={!onLinea}>
        {Array.from({ length: n }, (_, i) => {
          const num = i + 1;
          const est = estados[num];
          return onLinea ? (
            <button key={num} className={`num-linea ${est ?? ''}`} onClick={() => onLinea(num)} aria-label={`Marcar la línea ${num}`}>
              {num}
            </button>
          ) : (
            <span key={num} className={`num-linea ${est ?? ''}`}>
              {num}
            </span>
          );
        })}
      </div>
      <div className="zona" style={{ minWidth: `${ancho}ch` }}>
        <pre className="capa" aria-hidden>
          {Array.from({ length: n }, (_, i) => (
            <div key={i} className={`lin ${estados[i + 1] ?? ''}`}>
              {colorear(lineas[i] ?? '')}
              {'​'}
              {etiquetas[i + 1] && <span className="etq-linea">{etiquetas[i + 1]}</span>}
            </div>
          ))}
        </pre>
        <textarea
          ref={ta}
          value={valor}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={teclas}
          readOnly={soloLectura || !onChange}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
          aria-label={etiquetaAria}
          style={{ height: `calc(${n} * var(--lh) + 20px)` }}
        />
      </div>
    </div>
  );
}
