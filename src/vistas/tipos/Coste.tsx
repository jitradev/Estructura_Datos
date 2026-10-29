import { ReactNode, useMemo, useState } from 'react';
import { contarVueltas, leerCoste, verNumero } from '../../ejercicios/coste';
import { ClaseCoste, CLASES_COSTE, EjCoste } from '../../ejercicios/tipos';
import { useBorrador } from '../../progreso';
import { Rico } from '../comun';
import { EditorCodigo } from '../EditorCodigo';

interface Avance {
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
  const [aviso, setAviso] = useState<string | null>(null);
  const [otroN, setOtroN] = useState('100');
  const [otra, setOtra] = useState<{ n: number; r: number | string } | null>(null);
  const paso = !av.coste ? 1 : 2;
  const tabla = useMemo(() => (paso === 2 ? TABLA.map((n) => ({ n, r: cuentaDe(ej, n) })) : []), [ej, paso]);

  const comprobar = () => {
    if (!respuesta.trim()) return setAviso('Escribe el coste, por ejemplo O(n).');
    const r = leerCoste(respuesta);
    if (!r) return setAviso(`No entiendo «${respuesta}». Escríbelo como O(1), O(log n), O(√n) o sqrt(n), O(n), O(n log n), O(n^2) o O(n^3).`);
    if ('constante' in r)
      return setAviso(r.constante === ej.coste ? `Casi: en la O se quitan las constantes. Quedaría ${r.constante}.` : `En la O se quitan las constantes (quedaría ${r.constante}), y además no es ese.`);
    const k = r.clase;
    if (k === ej.coste) {
      setAviso(null);
      setAv({ coste: k });
      onResuelto();
      return;
    }
    const corta = CLASES_COSTE.indexOf(k) < CLASES_COSTE.indexOf(ej.coste);
    setAviso(
      corta
        ? `${k} se queda corto: crece más deprisa. ¿Hay algo que se repita más de lo que parece?`
        : `${k} se pasa: crece más despacio. ¿De verdad cada vuelta cuesta lo mismo, o depende de n?`,
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
            <strong>Escribe su coste en notación O</strong>
            {paso === 1 ? (
              <>
                <form
                  className="fila-respuesta"
                  onSubmit={(e) => {
                    e.preventDefault();
                    comprobar();
                  }}
                >
                  <input type="text" value={respuesta} onChange={(e) => setRespuesta(e.target.value)} aria-label="Coste en notación O" placeholder="O(...)" autoComplete="off" spellCheck={false} />
                  <button className="btn" type="submit">
                    Comprobar
                  </button>
                </form>
                <p className="nota">Vale O(n^2) o n², log n o log(n), sqrt(n) o √n…</p>
                {aviso && <p className="aviso-corto">{aviso}</p>}
              </>
            ) : (
              <p className="mono">{av.coste}</p>
            )}
          </Estado>
          <Estado n={2} paso={paso}>
            <strong>Por qué</strong>
            {paso === 2 && (
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

      {paso === 2 && (
        <section className="panel panel-crece">
          <div className="panel-cab">
            <h2>Compruébalo: ¿cuánto sube al doblar n?</h2>
            <span className="nota">Cuenta el intérprete</span>
          </div>
          <p className="nota">
            Lo que se cuenta: <Rico texto={ej.pregunta ?? '¿Cuántas veces se ejecuta `x++`?'} />
          </p>
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
