// Controles para recorrer los pasos de una ejecución y el dibujo del paso actual.

import { ReactNode, useEffect, useState } from 'react';
import { Dibujo } from '../dibujo/Dibujo';
import { Paso } from '../interprete/ejecutar';
import { Contexto, Memoria } from '../memoria/modelo';

export const VELOCIDADES = [
  { nombre: 'Lenta', ms: 1500 },
  { nombre: 'Normal', ms: 850 },
  { nombre: 'Rápida', ms: 350 },
];

/** Estado del reproductor: índice del paso y si está en marcha. */
export function useReproductor(pasos: Paso[] | null) {
  const [idx, setIdx] = useState(0);
  const [enMarcha, setEnMarcha] = useState(false);
  const [vel, setVel] = useState(1);
  useEffect(() => {
    if (!enMarcha || !pasos) return;
    if (idx >= pasos.length - 1) {
      setEnMarcha(false);
      return;
    }
    const t = setTimeout(() => setIdx((i) => i + 1), VELOCIDADES[vel].ms);
    return () => clearTimeout(t);
  }, [enMarcha, idx, pasos, vel]);
  return { idx, setIdx, enMarcha, setEnMarcha, vel, setVel };
}

export function Reproductor({
  pasos,
  rep,
  ctx,
  memInicial,
  dibujar,
  vacio = 'Así empieza la memoria. Pulsa «Ejecutar» o «Paso a paso».',
  teclas = false,
  controlesArriba = false,
}: {
  pasos: Paso[] | null;
  rep: ReturnType<typeof useReproductor>;
  ctx: Contexto;
  memInicial: Memoria;
  /** Otro dibujo en lugar del de por defecto. */
  dibujar?: (mem: Memoria, prev?: Memoria) => ReactNode;
  vacio?: string;
  /** ← and → move one step, outside text fields. */
  teclas?: boolean;
  /** The controls and the step note above the drawing, for tall drawings. */
  controlesArriba?: boolean;
}) {
  const { idx, setIdx, enMarcha, setEnMarcha, vel, setVel } = rep;
  // si llega una ejecución más corta, idx puede ir por delante hasta que se reinicia
  const i = pasos ? Math.min(idx, pasos.length - 1) : 0;
  const paso = pasos?.[i];
  const mem = paso?.mem ?? memInicial;
  const prev = pasos && i > 0 ? pasos[i - 1].mem : undefined;
  const n = pasos?.length ?? 0;

  useEffect(() => {
    if (!teclas || !n) return;
    const pulsar = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.altKey || e.ctrlKey || e.metaKey || t?.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      setEnMarcha(false);
      setIdx((x) => (e.key === 'ArrowLeft' ? Math.max(0, x - 1) : Math.min(n - 1, x + 1)));
    };
    window.addEventListener('keydown', pulsar);
    return () => window.removeEventListener('keydown', pulsar);
  }, [teclas, n, setIdx, setEnMarcha]);

  return (
    <div className={`reproductor ${controlesArriba ? 'arriba' : ''}`}>
      <div className="lienzo-memoria">
        {dibujar ? dibujar(mem, prev) : <Dibujo mem={mem} prev={prev} ctx={ctx} />}
      </div>
      <div className={`nota-paso ${paso?.error ? 'error' : ''}`} aria-live="polite">
        {!pasos && <span>{vacio}</span>}
        {paso && (
          <>
            <span className="cuenta-paso">
              Paso {i} de {n - 1}
              {paso.linea > 0 ? ` · línea ${paso.linea}` : ''}
            </span>
            {paso.nota && <span> {paso.nota}</span>}
          </>
        )}
      </div>
      {pasos && (
        <div className="controles">
          <button className="btn-icono" onClick={() => setIdx(0)} disabled={idx === 0} aria-label="Al principio">
            ⏮
          </button>
          <button className="btn-icono" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0} aria-label="Paso anterior">
            ◀
          </button>
          <button
            className="btn-icono principal"
            onClick={() => {
              if (idx >= n - 1) setIdx(0);
              setEnMarcha(!enMarcha);
            }}
            aria-label={enMarcha ? 'Pausa' : 'Reproducir'}
          >
            {enMarcha ? '⏸' : '▶'}
          </button>
          <button className="btn-icono" onClick={() => setIdx(Math.min(n - 1, idx + 1))} disabled={idx >= n - 1} aria-label="Paso siguiente">
            ▶|
          </button>
          <input
            type="range"
            min={0}
            max={n - 1}
            value={idx}
            onChange={(e) => {
              setEnMarcha(false);
              setIdx(Number(e.target.value));
            }}
            aria-label="Paso"
          />
          <label className="vel">
            <span className="oculto">Velocidad</span>
            <select value={vel} onChange={(e) => setVel(Number(e.target.value))}>
              {VELOCIDADES.map((v, i) => (
                <option key={i} value={i}>
                  {v.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
