import { Fragment, useState } from 'react';
import { c } from '../ejercicios/tema2';
import { contarCodigo, estimarCoste } from '../ejercicios/coste';
import { Analisis, analizarCoste, Ecuacion, Ex, verPoli } from '../ejercicios/ecuacion';
import { ClaseCoste } from '../ejercicios/tipos';
import { Rico } from './comun';
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
/** Per run, so that the whole fallback count takes about a second. */
const PASOS_POR_N = 400_000;

/** Without an equation: run the code with growing n and see which class follows x. */
function estimar(codigo: string): { clase: ClaseCoste | null; error?: string; sinCuenta?: boolean } {
  const puntos: { n: number; x: number }[] = [];
  for (const n of NS) {
    const r = contarCodigo(codigo, n, PASOS_POR_N);
    if ('error' in r) {
      if (!puntos.length) return { clase: null, error: r.error };
      break;
    }
    puntos.push({ n, x: r.x });
  }
  if (puntos.every((p) => p.x === 0)) return { clase: null, sinCuenta: true };
  return { clase: estimarCoste(puntos) };
}

interface Calculo {
  analisis: Analisis;
  estimado?: ReturnType<typeof estimar>;
}

/** A line of the equation, with the sums drawn with their limits. */
function Expresion({ e }: { e: Ex }) {
  switch (e.k) {
    case 'p':
      return <>{verPoli(e.p)}</>;
    case 'llamada':
      return <code>{e.texto}</code>;
    case 'mas':
      return (
        <>
          {e.xs.map((x, i) => (
            <Fragment key={i}>
              {i > 0 && ' + '}
              <Expresion e={x} />
            </Fragment>
          ))}
        </>
      );
    case 'max':
      return (
        <>
          máx(
          {e.xs.map((x, i) => (
            <Fragment key={i}>
              {i > 0 && ', '}
              <Expresion e={x} />
            </Fragment>
          ))}
          )
        </>
      );
    case 'sigma': {
      const c = e.cuerpo;
      const parentesis = c.k === 'mas' || c.k === 'max' || (c.k === 'p' && c.p.length > 1);
      return (
        <span className="sigma">
          <span className="sigma-signo" title={`Línea ${e.linea}`}>
            <small>{e.arriba}</small>
            <span aria-hidden>Σ</span>
            <small>{e.abajo}</small>
          </span>
          {parentesis ? '(' : ''}
          <Expresion e={c} />
          {parentesis ? ')' : ''}
        </span>
      );
    }
  }
}

function VerEcuacion({ ec }: { ec: Ecuacion }) {
  return (
    <div className="ecuacion">
      {ec.lineas.map((l, i) => (
        <Fragment key={i}>
          <div className="ecuacion-linea">
            <span className="ecuacion-izq">{i === 0 ? `${ec.nombre} =` : '≈'}</span>
            <span className="mono">
              <Expresion e={l} />
            </span>
          </div>
          {ec.notas[i]?.length > 0 && (
            <ul className="ecuacion-notas">
              {ec.notas[i].map((n, j) => (
                <li key={j}>
                  <Rico texto={n} />
                </li>
              ))}
            </ul>
          )}
        </Fragment>
      ))}
    </div>
  );
}

export function CalculadoraCoste() {
  const [codigo, setCodigo] = useState(EJEMPLOS[1].codigo);
  const [calculo, setCalculo] = useState<Calculo | null>(null);
  const [calculando, setCalculando] = useState(false);
  const [ejemplo, setEjemplo] = useState(1);

  const lanzar = () => {
    const analisis = analizarCoste(codigo);
    if (analisis.ok) return setCalculo({ analisis });
    setCalculando(true);
    // leave the browser a frame to paint «Calculando…» before the runs
    setTimeout(() => {
      setCalculo({ analisis, estimado: estimar(codigo) });
      setCalculando(false);
    }, 20);
  };

  const a = calculo?.analisis;
  const est = calculo?.estimado;

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
          <code>n</code> es el tamaño de la entrada. Ya están declaradas <code>n</code>, <code>x</code>, <code>i</code>, <code>j</code> y <code>k</code>. Puedes definir funciones encima y llamarlas.
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
          <h2>La ecuación</h2>
          <span className="nota">Cada instrucción simple cuesta 1</span>
        </div>
        {!calculo && (
          <p className="nota">
            Cada bucle se convierte en una suma (Σ) sobre su variable, una llamada cuesta lo que cueste su función y lo que va seguido se suma. Luego se resuelven las sumas de dentro hacia fuera, quedándose con lo que crece más deprisa.
          </p>
        )}
        {a?.ok && (
          <>
            {a.ecuaciones.map((ec) => (
              <VerEcuacion key={ec.nombre} ec={ec} />
            ))}
            <p className="veredicto">
              Es <strong>{a.texto}</strong>
            </p>
            {a.avisos.map((t) => (
              <p key={t} className="nota">
                <Rico texto={t} />
              </p>
            ))}
            <p className="nota">Los «≈» son porque en cada paso se quitan los términos que crecen más despacio: para la O no cambian nada.</p>
          </>
        )}
        {a && !a.ok && (
          <>
            <div className="caja-aviso">
              <strong>No puedo plantear la ecuación.</strong> <Rico texto={a.motivo} />
            </div>
            {est?.error && (
              <div className="caja-error" role="alert">
                {est.error}
              </div>
            )}
            {est?.sinCuenta && (
              <p className="nota">
                Para estimarlo de otra forma, pon <code>x++</code> en lo que quieras contar: se ejecuta el código con n cada vez mayor y se mira cómo crece <code>x</code>.
              </p>
            )}
            {est && !est.error && !est.sinCuenta && (
              <p className="nota">
                Ejecutándolo con n cada vez mayor, <code>x</code> crece como <strong>{est.clase ?? '¿?'}</strong>. Es una estimación, no una demostración.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
