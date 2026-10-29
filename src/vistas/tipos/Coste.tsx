import { ReactNode, useMemo, useState } from 'react';
import { contarVueltas, verNumero } from '../../ejercicios/coste';
import { ClaseCoste, CLASES_COSTE, EjCoste } from '../../ejercicios/tipos';
import { useBorrador } from '../../progreso';
import { Rico } from '../comun';
import { EditorCodigo } from '../EditorCodigo';

interface Avance {
  cuenta?: number; // the right count, once found (or shown)
  coste?: ClaseCoste;
}

const TABLA = [8, 16, 32, 64];

const cuentaDe = (ej: EjCoste, n: number): number | string => {
  const r = contarVueltas(ej, n);
  return 'x' in r ? r.x : r.error;
};

/** Declared outside Coste so that the input inside does not remount (and lose focus) on every key. */
function Estado({ n, paso, children }: { n: number; paso: number; children: ReactNode }) {
  return (
    <li className={`paso-fallo ${paso > n ? 'hecho' : paso === n ? 'actual' : 'pendiente'}`}>
      <span className="circulo" aria-hidden>
        {paso > n ? '✓' : n}
      </span>
      <div>{children}</div>
    </li>
  );
}

export function Coste({ ej, onResuelto }: { ej: EjCoste; onResuelto: () => void }) {
  const [av, setAv] = useBorrador<Avance>(ej.id, 'avance', () => ({}));
  const [respuesta, setRespuesta] = useState('');
  const [fallos, setFallos] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [avisoCoste, setAvisoCoste] = useState<string | null>(null);
  const [otroN, setOtroN] = useState('100');
  const [otra, setOtra] = useState<{ n: number; r: number | string } | null>(null);
  const correcta = useMemo(() => cuentaDe(ej, ej.n), [ej]);
  const paso = av.cuenta === undefined ? 1 : !av.coste ? 2 : 3;
  const tabla = useMemo(() => (paso === 3 ? TABLA.map((n) => ({ n, r: cuentaDe(ej, n) })) : []), [ej, paso]);
  const pregunta = ej.pregunta ?? '¿Cuántas veces se ejecuta `x++`?';

  const comprobarCuenta = () => {
    const v = Number(respuesta.replace(/[.\s]/g, ''));
    if (!respuesta.trim() || !Number.isInteger(v)) return setAviso('Escribe un número entero.');
    if (v === correcta) {
      setAviso(null);
      setAv({ ...av, cuenta: v });
      return;
    }
    setFallos(fallos + 1);
    setAviso(
      typeof correcta === 'number' && Math.abs(v - correcta) <= 1
        ? `Casi: ${verNumero(v)} no es. Mira bien la primera y la última vuelta (¿< o <=?).`
        : `${verNumero(v)} no es. Sigue a mano los valores de la variable del bucle, vuelta a vuelta, con n = ${ej.n}.`,
    );
  };

  const elegir = (k: ClaseCoste) => {
    if (paso !== 2) return;
    if (k === ej.coste) {
      setAvisoCoste(null);
      setAv({ ...av, coste: k });
      onResuelto();
      return;
    }
    const corta = CLASES_COSTE.indexOf(k) < CLASES_COSTE.indexOf(ej.coste);
    setAvisoCoste(
      corta
        ? `${k} se queda corto: la cuenta crece más deprisa. ¿Hay algo que se repita más de lo que parece?`
        : `${k} se pasa: la cuenta crece más despacio. ¿De verdad cada vuelta cuesta lo mismo, o depende de n?`,
    );
  };

  const probarOtro = () => {
    const n = Math.trunc(Number(otroN));
    if (!Number.isFinite(n) || n < 1 || n > 1_000_000) return setOtra({ n, r: 'Prueba con un n entre 1 y 1.000.000.' });
    setOtra({ n, r: cuentaDe(ej, n) });
  };

  return (
    <div className="ej-rejilla coste">
      <section className="panel panel-codigo">
        <div className="panel-cab">
          <h2>El código</h2>
          <span className="nota">n es el tamaño de la entrada</span>
        </div>
        <EditorCodigo valor={ej.codigo} soloLectura minLineas={4} etiquetaAria="Código del ejercicio" />
      </section>

      <section className="panel panel-pasos">
        <ol className="pasos-fallo">
          <Estado n={1} paso={paso}>
            <strong>
              Cuenta con n = {ej.n}. <Rico texto={pregunta} />
            </strong>
            {paso === 1 ? (
              <>
                <form
                  className="fila-respuesta"
                  onSubmit={(e) => {
                    e.preventDefault();
                    comprobarCuenta();
                  }}
                >
                  <input type="text" inputMode="numeric" value={respuesta} onChange={(e) => setRespuesta(e.target.value)} aria-label="Número de vueltas" placeholder="Vueltas" />
                  <button className="btn" type="submit">
                    Comprobar
                  </button>
                  {fallos >= 2 && typeof correcta === 'number' && (
                    <button type="button" className="btn-texto" onClick={() => setAv({ ...av, cuenta: correcta })}>
                      Ver la cuenta
                    </button>
                  )}
                </form>
                {aviso && <p className="aviso-corto">{aviso}</p>}
              </>
            ) : (
              <p>{verNumero(av.cuenta!)}.</p>
            )}
          </Estado>
          <Estado n={2} paso={paso}>
            <strong>¿Qué coste tiene en notación O?</strong>
            {paso >= 2 && (
              <div className="chips">
                {CLASES_COSTE.map((k) => (
                  <button key={k} className={`chip-texto ${av.coste === k ? 'on' : ''}`} onClick={() => elegir(k)} disabled={paso !== 2}>
                    {k}
                  </button>
                ))}
              </div>
            )}
            {avisoCoste && paso === 2 && <p className="aviso-corto">{avisoCoste}</p>}
          </Estado>
          <Estado n={3} paso={paso}>
            <strong>Por qué</strong>
            {paso === 3 && (
              <ol className="metodo">
                {ej.pasos.map((p) => (
                  <li key={p.titulo}>
                    <strong>{p.titulo}.</strong> <Rico texto={p.texto} />
                  </li>
                ))}
              </ol>
            )}
          </Estado>
        </ol>
      </section>

      {paso === 3 && (
        <section className="panel panel-crece">
          <div className="panel-cab">
            <h2>Compruébalo: ¿cuánto sube al doblar n?</h2>
            <span className="nota">Cuenta el intérprete</span>
          </div>
          <table className="tabla-crece">
            <thead>
              <tr>
                <th>n</th>
                {tabla.map((t) => (
                  <th key={t.n}>{t.n}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Vueltas</th>
                {tabla.map((t) => (
                  <td key={t.n}>{typeof t.r === 'number' ? verNumero(t.r) : '—'}</td>
                ))}
              </tr>
              <tr className="factor">
                <th>× al doblar</th>
                {tabla.map((t, i) => {
                  const a = tabla[i - 1]?.r;
                  return <td key={t.n}>{i > 0 && typeof a === 'number' && a > 0 && typeof t.r === 'number' ? `×${(t.r / a).toFixed(1).replace('.', ',')}` : ''}</td>;
                })}
              </tr>
            </tbody>
          </table>
          <p className="nota">Si al doblar n la cuenta se queda igual es O(1); si sube en uno, logarítmica; si se dobla, lineal; si se multiplica por 4, cuadrática; por 8, cúbica.</p>
          <form
            className="fila-respuesta"
            onSubmit={(e) => {
              e.preventDefault();
              probarOtro();
            }}
          >
            <label htmlFor={`otro-${ej.id}`}>Prueba con otro n</label>
            <input id={`otro-${ej.id}`} type="number" min={1} value={otroN} onChange={(e) => setOtroN(e.target.value)} />
            <button className="btn secundario" type="submit">
              Contar
            </button>
            {otra && <span className="mono">{typeof otra.r === 'number' ? `n = ${verNumero(otra.n)}: ${verNumero(otra.r)} vueltas` : otra.r}</span>}
          </form>
        </section>
      )}
    </div>
  );
}
