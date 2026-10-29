import { useState } from 'react';
import { c } from '../ejercicios/tema2';
import { contarCodigo, estimarCoste, verNumero } from '../ejercicios/coste';
import { ClaseCoste } from '../ejercicios/tipos';
import { EditorCodigo } from './EditorCodigo';

const EJEMPLOS: { nombre: string; codigo: string }[] = [
  { nombre: 'Un bucle', codigo: 'for (i = 0; i < n; i++)\n    x++;\n' },
  { nombre: 'Dos anidados', codigo: 'for (i = 0; i < n; i++)\n    for (j = 0; j < n; j++)\n        x++;\n' },
  { nombre: 'El triángulo', codigo: 'for (i = 0; i < n; i++)\n    for (j = 0; j < i; j++)\n        x++;\n' },
  { nombre: 'Dividir entre 2', codigo: 'i = n;\nwhile (i > 1) {\n    x++;\n    i = i / 2;\n}\n' },
  { nombre: 'Fuera n, dentro dobla', codigo: 'for (i = 0; i < n; i++)\n    for (j = 1; j < n; j = j * 2)\n        x++;\n' },
  {
    nombre: 'Con una función',
    codigo: c(`
      int recorre(int m) {
          int s = 0;
          for (int k = 0; k < m; k++) s++;
          return s;
      }

      for (i = 0; i < n; i++)
          x += recorre(i);
    `) + '\n',
  },
];

const NS = [8, 16, 32, 64, 128, 256, 512, 1024];
/** Per run, so that the whole table is counted in about a second. */
const PASOS_POR_N = 400_000;

interface Calculo {
  puntos: { n: number; x: number }[];
  error?: string; // the first run already failed
  corte?: number; // n at which it stopped (too many steps)
  clase: ClaseCoste | null;
}

function calcular(codigo: string): Calculo {
  const puntos: { n: number; x: number }[] = [];
  let corte: number | undefined;
  for (const n of NS) {
    const r = contarCodigo(codigo, n, PASOS_POR_N);
    if ('error' in r) {
      if (!puntos.length) return { puntos, error: r.error, clase: null };
      corte = n;
      break;
    }
    puntos.push({ n, x: r.x });
  }
  return { puntos, corte, clase: estimarCoste(puntos) };
}

export function CalculadoraCoste() {
  const [codigo, setCodigo] = useState(EJEMPLOS[1].codigo);
  const [calculo, setCalculo] = useState<Calculo | null>(null);
  const [calculando, setCalculando] = useState(false);
  const [ejemplo, setEjemplo] = useState(1);

  const lanzar = () => {
    setCalculando(true);
    // leave the browser a frame to paint «Calculando…» before the runs
    setTimeout(() => {
      setCalculo(calcular(codigo));
      setCalculando(false);
    }, 20);
  };

  const sinCuenta = calculo && !calculo.error && calculo.puntos.every((p) => p.x === 0);

  return (
    <div className="ej-rejilla calculadora">
      <section className="panel panel-codigo">
        <div className="panel-cab">
          <h2>Código</h2>
          <label className="nota">
            Ejemplo{' '}
            <select
              value={ejemplo}
              onChange={(e) => {
                const i = Number(e.target.value);
                setEjemplo(i);
                setCodigo(EJEMPLOS[i].codigo);
                setCalculo(null);
              }}
            >
              {EJEMPLOS.map((x, i) => (
                <option key={i} value={i}>
                  {x.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="nota">
          <code>n</code> es el tamaño de la entrada. Pon <code>x++</code> en lo que quieras contar. Ya están declaradas <code>n</code>, <code>x</code>, <code>i</code>, <code>j</code> y <code>k</code>.
        </p>
        <EditorCodigo
          valor={codigo}
          onChange={(v) => {
            setCodigo(v);
            setCalculo(null);
          }}
          etiquetaAria="Código cuyo coste se calcula"
        />
        <div className="acciones">
          <button className="btn" onClick={lanzar} disabled={calculando}>
            {calculando ? 'Calculando…' : 'Calcular el coste'}
          </button>
        </div>
      </section>

      <section className="panel panel-crece">
        <div className="panel-cab">
          <h2>Resultado</h2>
          <span className="nota">Cuenta el intérprete</span>
        </div>
        {!calculo && <p className="nota">Se ejecuta el código con n = 8, 16, 32… hasta 1024 (o hasta que sean demasiadas vueltas), se mira cuánto vale <code>x</code> y se busca la O que mejor sigue esa cuenta.</p>}
        {calculo?.error && (
          <div className="caja-error" role="alert">
            {calculo.error}
          </div>
        )}
        {calculo && !calculo.error && (
          <>
            {sinCuenta ? (
              <div className="caja-aviso">
                <code>x</code> vale 0 con todos los n: pon <code>x++</code> dentro de lo que quieras contar.
              </div>
            ) : calculo.clase ? (
              <p className="veredicto">
                Parece <strong>{calculo.clase}</strong>
              </p>
            ) : (
              <div className="caja-aviso">Con tan pocos valores de n no se puede estimar: prueba con algo que dé menos vueltas.</div>
            )}
            <table className="tabla-crece">
              <thead>
                <tr>
                  <th>n</th>
                  <th>x</th>
                  <th>× al doblar</th>
                </tr>
              </thead>
              <tbody>
                {calculo.puntos.map((p, i) => {
                  const a = calculo.puntos[i - 1]?.x;
                  return (
                    <tr key={p.n}>
                      <td>{verNumero(p.n)}</td>
                      <td>{verNumero(p.x)}</td>
                      <td className="factor">{a ? `×${(p.x / a).toFixed(2).replace('.', ',')}` : ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {calculo.corte && <p className="nota">Con n = {verNumero(calculo.corte)} ya son demasiadas vueltas para contarlas aquí: la tabla para antes.</p>}
            <p className="nota">
              Es una estimación con unos pocos valores de n, no una demostración: la O se justifica con el método (vueltas, coste de cada vuelta, total). Si el coste depende de los datos, aquí solo se ve el caso que se ejecuta.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
