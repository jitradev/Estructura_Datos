import { useState } from 'react';
import { c } from '../ejercicios/tema2';
import { contarCodigo, estimarCoste } from '../ejercicios/coste';
import { Analisis, analizarCoste, Fila } from '../ejercicios/ecuacion';
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

/** The O of every loop and call, grouped by function, inner loops indented. */
function Filas({ filas }: { filas: Fila[] }) {
  const ambitos = [...new Set(filas.map((f) => f.ambito))];
  return (
    <>
      {ambitos.map((am) => (
        <div key={am} className="coste-bloque">
          {ambitos.length > 1 && <h3>{am === 'Programa' ? 'Programa' : <>Función <code>{am}</code></>}</h3>}
          <ul className="filas-coste">
            {filas
              .filter((f) => f.ambito === am)
              .map((f, i) => (
                <li key={i} style={{ paddingLeft: f.nivel * 22 }}>
                  <span className="nota">Línea {f.linea}</span>
                  <code>{f.codigo}</code>
                  <span className="flecha">→</span>
                  <span className="mono">{!f.vueltas ? f.coste : f.cada ? `${f.vueltas} × ${f.cada} = ${f.coste}` : f.vueltas}</span>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </>
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
          <h2>El coste, bucle a bucle</h2>
        </div>
        {!calculo && <p className="nota">Cada bucle cuesta sus vueltas × lo que cuesta una vuelta. Lo que va seguido se suma, y manda el mayor.</p>}
        {a?.ok && (
          <>
            {a.filas.length ? <Filas filas={a.filas} /> : <p className="nota">No hay bucles ni llamadas: cada instrucción cuesta O(1).</p>}
            <p className="veredicto">
              Total: <strong>{a.texto}</strong>
            </p>
            {a.avisos.map((t) => (
              <p key={t} className="nota">
                <Rico texto={t} />
              </p>
            ))}
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
