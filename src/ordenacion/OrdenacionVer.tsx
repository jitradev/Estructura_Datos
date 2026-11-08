// Tema 7 · Ordenación y búsqueda, dentro de Visualizar: la galería (#/ver/ordenacion), cada
// algoritmo animado paso a paso con su código al lado (#/ver/seleccion, #/ver/mezcla...) y una
// carrera entre dos para ver crecer n² frente a n log n (#/ver/carrera).

import { useEffect, useMemo, useState } from 'react';
import { EditorCodigo } from '../vistas/EditorCodigo';
import { SelectorTipo } from '../vistas/SelectorTipo';
import { Barras, Lienzo } from './Lienzo';
import { AlgId, ALGORITMOS, ejecutar, generarDatos, ORDENACIONES, Paso, TipoDatos } from './pasos';

/** Ids de las páginas de esta sección dentro de #/ver/. */
export const IDS_ORDENACION = [...ALGORITMOS.map((a) => a.id), 'carrera'] as string[];

const OPCIONES = [
  ...ALGORITMOS.map((a) => ({ id: a.id, corto: a.nombre, familia: a.id === 'binaria' ? 'Búsqueda' : 'Ordenación' })),
  { id: 'carrera', corto: 'Carrera', familia: 'Comparar' },
];

const VELOCIDADES = [
  { nombre: 'Lenta', ms: 1600 },
  { nombre: 'Normal', ms: 900 },
  { nombre: 'Rápida', ms: 380 },
  { nombre: 'Muy rápida', ms: 120 },
];

const DATOS: { id: TipoDatos; nombre: string }[] = [
  { id: 'clase', nombre: 'El de clase: 5 2 8 1 4' },
  { id: 'aleatorio', nombre: 'Aleatorio' },
  { id: 'casi', nombre: 'Casi ordenado' },
  { id: 'reves', nombre: 'Al revés' },
  { id: 'propio', nombre: 'Escríbelo tú' },
];

const COLORES =
  'Los colores significan siempre lo mismo: en rojo lo que cambia en ese paso, sombreado lo que ya está en su sitio definitivo, y en discontinuo lo que sigue escrito pero ya no cuenta.';

// ---------------------------------------------------------------- galería

/** Tarjetas de la sección, en la portada de Visualizar. */
export function OrdenacionGallery() {
  return (
    <>
      <p className="ord-idea">
        <span className="ord-familia">Tema 7</span> Cada algoritmo trabajando sobre un array, con su código al lado y la línea que se ejecuta. {COLORES}
      </p>
      <section className="galeria-listas">
        {ALGORITMOS.map((a) => (
          <a key={a.id} className="tarjeta-lista" href={`#/ver/${a.id}`}>
            <span className="fila-tema">
              <strong>{a.nombre}</strong>
              <span className="cuenta">Verlo paso a paso →</span>
            </span>
            <span className="ord-familia ord-familia-sola">{a.familia}</span>
            <span className="resumen">{a.idea}</span>
          </a>
        ))}
        <a className="tarjeta-lista" href="#/ver/carrera">
          <span className="fila-tema">
            <strong>Carrera</strong>
            <span className="cuenta">Comparar →</span>
          </span>
          <span className="ord-familia ord-familia-sola">dos algoritmos, los mismos datos</span>
          <span className="resumen">Hasta 100 elementos en barras, avanzando por operaciones y no por segundos, con las cifras de los cinco debajo. Con pocos datos casi empatan; sube n y se separan.</span>
        </a>
      </section>
    </>
  );
}

// ---------------------------------------------------------------- página

function leerPropio(txt: string): number[] {
  return txt
    .split(/[\s,;]+/)
    .filter(Boolean)
    .map(Number)
    .filter((x) => Number.isFinite(x))
    .map((x) => Math.trunc(x))
    .slice(0, 12);
}

function useTeclas(atras: () => void, adelante: () => void) {
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        adelante();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        atras();
      }
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [atras, adelante]);
}

export function OrdenacionRoute({ id }: { id: string }) {
  const activo = id === 'carrera' ? 'carrera' : (ALGORITMOS.find((a) => a.id === id)?.id ?? 'seleccion');
  const info = ALGORITMOS.find((a) => a.id === activo);
  return (
    <main className="contenido ancho">
      <SelectorTipo grupo="ordenacion" actual={activo} opciones={OPCIONES} />
      <h1>
        <span className="num-ej">Tema 7</span> {info ? info.nombre : 'Carrera'}
      </h1>
      {activo === 'carrera' ? <Carrera /> : <Animacion key={activo} id={activo} />}
    </main>
  );
}

function Animacion({ id }: { id: AlgId }) {
  const info = ALGORITMOS.find((a) => a.id === id)!;
  // la binaria necesita algo más largo que el de clase para que se vean varias vueltas
  const [tipo, setTipo] = useState<TipoDatos>(id === 'binaria' ? 'aleatorio' : 'clase');
  const [semilla, setSemilla] = useState(7);
  const [n, setN] = useState(id === 'binaria' ? 12 : 8);
  const [propio, setPropio] = useState('9, 4, 7, 1, 8, 2');
  const [x, setX] = useState<number | null>(null);

  const datos = useMemo(() => {
    const d = generarDatos(tipo, n, semilla, leerPropio(propio));
    return d.length ? d : [5, 2, 8, 1, 4];
  }, [tipo, n, semilla, propio]);
  const ordenados = useMemo(() => [...datos].sort((a, b) => a - b), [datos]);
  const buscado = x ?? ordenados[Math.floor((ordenados.length * 2) / 3)];
  const { pasos, etiquetaMov } = useMemo(() => ejecutar(id, datos, buscado), [id, datos, buscado]);

  const [idx, setIdx] = useState(0);
  const [enMarcha, setEnMarcha] = useState(false);
  const [vel, setVel] = useState(1);
  useEffect(() => {
    setIdx(0);
    setEnMarcha(false);
  }, [pasos]);
  useEffect(() => {
    if (!enMarcha) return;
    if (idx >= pasos.length - 1) {
      setEnMarcha(false);
      return;
    }
    const t = setTimeout(() => setIdx((i) => i + 1), VELOCIDADES[vel].ms);
    return () => clearTimeout(t);
  }, [enMarcha, idx, pasos, vel]);
  const ultimo = pasos.length - 1;
  const atras = () => {
    setEnMarcha(false);
    setIdx((i) => Math.max(0, i - 1));
  };
  const adelante = () => {
    setEnMarcha(false);
    setIdx((i) => Math.min(ultimo, i + 1));
  };
  useTeclas(atras, adelante);

  const paso: Paso = pasos[Math.min(idx, ultimo)];
  const esBin = id === 'binaria';

  return (
    <>
      <p className="ord-idea">
        <span className="ord-familia">{info.familia}</span> {info.idea}
      </p>

      <div className="ord-datos">
        <label>
          Datos
          <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoDatos)}>
            {DATOS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        </label>
        {(tipo === 'aleatorio' || tipo === 'casi' || tipo === 'reves') && (
          <>
            <label>
              n
              <select value={n} onChange={(e) => setN(Number(e.target.value))}>
                {[5, 6, 8, 10, 12].map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn secundario" onClick={() => setSemilla((s) => s + 1)}>
              Otros datos
            </button>
          </>
        )}
        {tipo === 'propio' && (
          <label className="ord-propio">
            Números separados por comas (hasta 12)
            <input value={propio} onChange={(e) => setPropio(e.target.value)} />
          </label>
        )}
        {esBin && (
          <label>
            Buscar el
            <input className="ord-x" type="number" value={buscado} onChange={(e) => setX(e.target.value === '' ? null : Math.trunc(Number(e.target.value)))} />
          </label>
        )}
        {esBin && <span className="nota">La binaria necesita el array ordenado: se ordena antes de empezar.</span>}
      </div>

      <div className="ord-rejilla">
        <section className="panel">
          <div className="lienzo-memoria ord-lienzo-caja">
            <Lienzo paso={paso} mano={id === 'insercion'} />
          </div>
          <div className="nota-paso" aria-live="polite">
            <span className="cuenta-paso">
              Paso {idx} de {ultimo}
            </span>
            {paso.nota}
          </div>
          <div className="controles">
            <button className="btn-icono" onClick={() => setIdx(0)} disabled={idx === 0} aria-label="Al principio">
              ⏮
            </button>
            <button className="btn-icono" onClick={atras} disabled={idx === 0} aria-label="Paso anterior">
              ◀
            </button>
            <button
              className="btn-icono principal"
              onClick={() => {
                if (idx >= ultimo) setIdx(0);
                setEnMarcha(!enMarcha);
              }}
              aria-label={enMarcha ? 'Pausa' : 'Reproducir'}
            >
              {enMarcha ? '⏸' : '▶'}
            </button>
            <button className="btn-icono" onClick={adelante} disabled={idx >= ultimo} aria-label="Paso siguiente">
              ▶|
            </button>
            <button className="btn-icono" onClick={() => setIdx(ultimo)} disabled={idx >= ultimo} aria-label="Al final">
              ⏭
            </button>
            <input
              type="range"
              min={0}
              max={ultimo}
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
          <p className="nota ord-teclas">También con las flechas ← y → del teclado.</p>
          <LeyendaOrd id={id} />
        </section>

        <section className="panel">
          <div className="panel-cab">
            <h2>El código</h2>
            <span className="nota">línea {paso.linea}</span>
          </div>
          <EditorCodigo valor={info.codigo} soloLectura estados={{ [paso.linea]: 'actual' }} etiquetaAria={`Código de ${info.nombre}`} minLineas={4} />
          <div className="ord-cuentas">
            <div>
              <span className="ord-cifra">{paso.comp}</span>
              <span>{esBin ? 'vueltas (comparaciones)' : 'comparaciones'}</span>
            </div>
            {!esBin && (
              <div>
                <span className="ord-cifra">{paso.mov}</span>
                <span>{etiquetaMov}</span>
              </div>
            )}
          </div>
          {paso.pila.length > 0 && (
            <div className="ord-pila">
              <h3>Pila de llamadas</h3>
              <ol reversed>
                {[...paso.pila].reverse().map((l, k) => (
                  <li key={k} className={k === 0 ? 'cima' : ''}>
                    <code>{l}</code>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function LeyendaOrd({ id }: { id: AlgId }) {
  return (
    <ul className="ord-leyenda" aria-label="Leyenda">
      <li>
        <span className="mu cambia" /> cambia en este paso
      </li>
      {id !== 'binaria' && (
        <li>
          <span className="mu definitiva" /> en su sitio definitivo
        </li>
      )}
      <li>
        <span className="mu descartada" /> {id === 'binaria' ? 'descartado' : id === 'mezcla' ? 'ya copiado a aux' : 'sigue escrito, pero ya no cuenta'}
      </li>
      {id === 'insercion' && (
        <li>
          <span className="mu llave" /> ordenado entre sí (no definitivo)
        </li>
      )}
      {id === 'rapida' && (
        <li>
          <span className="mu raya" /> ya son ≤ pivote
        </li>
      )}
      {(id === 'mezcla' || id === 'rapida') && (
        <li>
          <span className="mu tenue" /> fuera del tramo de esta llamada
        </li>
      )}
      {(id === 'seleccion' || id === 'burbuja' || id === 'rapida') && (
        <li>
          <span className="mu arco" /> intercambio
        </li>
      )}
    </ul>
  );
}

// ---------------------------------------------------------------- carrera

/** El paso que se ve cuando se llevan `t` operaciones (comparaciones + movimientos). */
function pasoEn(pasos: Paso[], ops: number[], t: number): Paso {
  let lo = 0;
  let hi = ops.length - 1;
  while (lo < hi) {
    const m = (lo + hi + 1) >> 1;
    if (ops[m] <= t) lo = m;
    else hi = m - 1;
  }
  return pasos[lo];
}

const RITMOS = [
  { nombre: '×1', ops: 1 },
  { nombre: '×4', ops: 4 },
  { nombre: '×15', ops: 15 },
  { nombre: '×50', ops: 50 },
];

function Carrera() {
  const [n, setN] = useState(32);
  const [tipo, setTipo] = useState<TipoDatos>('aleatorio');
  const [semilla, setSemilla] = useState(3);
  const [a, setA] = useState<AlgId>('insercion');
  const [b, setB] = useState<AlgId>('mezcla');
  const [ritmo, setRitmo] = useState(1);
  const [t, setT] = useState(0);
  const [enMarcha, setEnMarcha] = useState(false);

  const datos = useMemo(() => generarDatos(tipo, n, semilla, []), [tipo, n, semilla]);
  const carriles = useMemo(
    () =>
      [a, b].map((id) => {
        const r = ejecutar(id, datos);
        const ops = r.pasos.map((p) => p.comp + p.mov);
        return { id, r, ops, total: ops[ops.length - 1] };
      }),
    [a, b, datos],
  );
  const tabla = useMemo(
    () =>
      ORDENACIONES.map((al) => {
        const r = ejecutar(al.id, datos);
        const f = r.pasos[r.pasos.length - 1];
        return { al, comp: f.comp, mov: f.mov, etiqueta: r.etiquetaMov };
      }),
    [datos],
  );
  const max = Math.max(...carriles.map((c) => c.total));

  useEffect(() => {
    setT(0);
    setEnMarcha(false);
  }, [carriles]);
  useEffect(() => {
    if (!enMarcha) return;
    if (t >= max) {
      setEnMarcha(false);
      return;
    }
    const h = setTimeout(() => setT((x) => Math.min(max, x + RITMOS[ritmo].ops)), 40);
    return () => clearTimeout(h);
  }, [enMarcha, t, max, ritmo]);

  return (
    <>
      <p className="ord-idea">
        Los mismos datos para los dos, y el reloj cuenta <strong>operaciones</strong> (comparaciones más movimientos), no segundos. Con pocos elementos casi empatan; sube n y
        mira cómo se separan.
      </p>
      <div className="ord-datos">
        <label>
          n
          <select value={n} onChange={(e) => setN(Number(e.target.value))}>
            {[16, 32, 64, 100].map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <label>
          Datos
          <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoDatos)}>
            {DATOS.filter((d) => d.id !== 'clase' && d.id !== 'propio').map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        </label>
        <button className="btn secundario" onClick={() => setSemilla((s) => s + 1)}>
          Otros datos
        </button>
        <label>
          Ritmo
          <select value={ritmo} onChange={(e) => setRitmo(Number(e.target.value))}>
            {RITMOS.map((r, i) => (
              <option key={i} value={i}>
                {r.nombre}
              </option>
            ))}
          </select>
        </label>
        <button
          className="btn"
          onClick={() => {
            if (t >= max) setT(0);
            setEnMarcha(!enMarcha);
          }}
        >
          {enMarcha ? 'Pausa' : t >= max ? 'Otra vez' : t > 0 ? 'Seguir' : 'Salida'}
        </button>
        <button
          className="btn secundario"
          onClick={() => {
            setEnMarcha(false);
            setT(0);
          }}
        >
          Al principio
        </button>
      </div>

      <div className="ord-carrera">
        {carriles.map((c, k) => {
          const p = pasoEn(c.r.pasos, c.ops, t);
          const acabado = t >= c.total;
          return (
            <section key={k} className={`panel ${acabado ? 'ord-meta' : ''}`}>
              <div className="panel-cab">
                <label className="ord-elige">
                  <span className="oculto">Algoritmo {k + 1}</span>
                  <select value={c.id} onChange={(e) => (k === 0 ? setA : setB)(e.target.value as AlgId)}>
                    {ORDENACIONES.map((al) => (
                      <option key={al.id} value={al.id}>
                        {al.nombre}
                      </option>
                    ))}
                  </select>
                </label>
                <span className="nota">{acabado ? `en meta: ${c.total} operaciones` : `${Math.min(t, c.total)} operaciones`}</span>
              </div>
              <div className="ord-barras-caja">
                <Barras paso={p} />
              </div>
              <div className="ord-cuentas">
                <div>
                  <span className="ord-cifra">{p.comp}</span>
                  <span>comparaciones</span>
                </div>
                <div>
                  <span className="ord-cifra">{p.mov}</span>
                  <span>{c.r.etiquetaMov}</span>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <section className="panel ord-tabla">
        <h2>Los cinco con estos mismos datos</h2>
        <table>
          <thead>
            <tr>
              <th>Algoritmo</th>
              <th>Comparaciones</th>
              <th>Movimientos</th>
              <th>Qué se cuenta como movimiento</th>
            </tr>
          </thead>
          <tbody>
            {tabla.map((f) => (
              <tr key={f.al.id}>
                <td>{f.al.nombre}</td>
                <td className="mono">{f.comp}</td>
                <td className="mono">{f.mov}</td>
                <td>{f.etiqueta}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="nota">Prueba «Casi ordenado»: insertion sort y bubble sort se disparan a la cabeza. Y «Al revés»: quicksort, con el último como pivote, cae en su peor caso.</p>
      </section>
    </>
  );
}
