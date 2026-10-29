import { ReactNode, useMemo, useState } from 'react';
import { comprobarCaso, comprobarTodo, InformeCaso } from '../../ejercicios/comprobar';
import { EjFallo, NOMBRE_FALLO, TipoFallo } from '../../ejercicios/tipos';
import { Resultado } from '../../interprete/ejecutar';
import { construir } from '../../memoria/construir';
import { useBorrador } from '../../progreso';
import { Informe, Rico } from '../comun';
import { EditorCodigo, EstadoLinea } from '../EditorCodigo';
import { Chuleta, estadosLineas } from '../piezas';
import { Reproductor, useReproductor } from '../Reproductor';

const TIPOS: TipoFallo[] = ['nulo', 'liberado', 'fuga', 'pierde', 'colgante', 'array', 'bucle', 'caso'];

interface Avance {
  caso?: string; // el caso que falla, en cuanto lo encuentra
  linea?: number;
  tipo?: TipoFallo;
}

export function Fallo({ ej, onResuelto }: { ej: EjFallo; onResuelto: () => void }) {
  const [av, setAv] = useBorrador<Avance>(ej.id, 'avance', () => ({}));
  const [codigo, setCodigo, restaurar] = useBorrador(ej.id, 'codigo', () => ej.codigo);
  const [casoSel, setCasoSel] = useState(0);
  const [res, setRes] = useState<Resultado | null>(null);
  const [probados, setProbados] = useState<Record<number, boolean>>({});
  const [avisoLinea, setAvisoLinea] = useState<string | null>(null);
  const [avisoTipo, setAvisoTipo] = useState<string | null>(null);
  const [informes, setInformes] = useState<InformeCaso[] | null>(null);
  const [infSel, setInfSel] = useState<InformeCaso | null>(null);
  /** Result of the last «Comprobar el arreglo» and how many times it did not pass. */
  const [arreglo, setArreglo] = useState<{ ok: boolean; sinCambios?: boolean; falla?: InformeCaso } | null>(null);
  const [fallidos, setFallidos] = useState(0);
  const [verSolucion, setVerSolucion] = useState(false);
  const rep = useReproductor(res?.pasos ?? null);
  const caso = ej.casos[casoSel];
  const memInicial = useMemo(() => construir(ej.ctx, caso.inicial), [ej, caso]);

  const paso = !av.caso ? 1 : !av.linea ? 2 : !av.tipo ? 3 : 4;
  const editando = paso === 4;
  const original = codigo === ej.codigo;

  const ejecutarSel = (animar: boolean) => {
    const inf = comprobarCaso(codigo, ej, caso);
    setRes(inf.resultado);
    setInfSel(inf);
    rep.setIdx(0);
    rep.setEnMarcha(animar);
    if (original) {
      setProbados({ ...probados, [casoSel]: inf.ok });
      if (!inf.ok && !av.caso) setAv({ ...av, caso: caso.nombre });
    }
  };

  const marcarLinea = (n: number) => {
    if (paso !== 2) return;
    if (ej.lineasFallo.includes(n)) {
      setAv({ ...av, linea: n });
      setAvisoLinea(null);
    } else setAvisoLinea(`La línea ${n} no es. Vuelve a ejecutar el caso que falla y fíjate en qué línea se para o deja la memoria mal.`);
  };

  const elegirTipo = (t: TipoFallo) => {
    if (paso !== 3) return;
    if (ej.tiposFallo.includes(t)) {
      setAv({ ...av, tipo: t });
      setAvisoTipo(null);
    } else setAvisoTipo(`No exactamente. Mira otra vez qué muestra el dibujo en el paso donde falla.`);
  };

  const comprobarArreglo = () => {
    if (original) {
      setArreglo({ ok: false, sinCambios: true });
      return;
    }
    const inf = comprobarTodo(codigo, ej);
    setInformes(inf);
    const malo = inf.findIndex((i) => !i.ok);
    const k = malo >= 0 ? malo : casoSel;
    setCasoSel(k);
    setRes(inf[k].resultado);
    rep.setEnMarcha(false);
    rep.setIdx(inf[k].resultado.pasos.length - 1);
    setArreglo({ ok: malo < 0, falla: malo >= 0 ? inf[malo] : undefined });
    if (malo < 0) onResuelto();
    else setFallidos(fallidos + 1);
  };

  const estados: Record<number, EstadoLinea> = { ...estadosLineas(res?.pasos ?? null, rep.idx) };
  const etiquetas: Record<number, string> = {};
  if (av.linea && original) {
    estados[av.linea] = 'marcada';
    etiquetas[av.linea] = 'marcada';
  }

  const Estado = ({ n, children }: { n: number; children: ReactNode }) => (
    <li className={`paso-fallo ${paso > n ? 'hecho' : paso === n ? 'actual' : 'pendiente'}`}>
      <span className="circulo" aria-hidden>
        {paso > n ? '✓' : n}
      </span>
      <div>{children}</div>
    </li>
  );

  return (
    <div className="ej-rejilla fallo">
      <section className="panel panel-pasos">
        <ol className="pasos-fallo">
          <Estado n={1}>
            <strong>Encuentra el caso que falla</strong>
            <p>{av.caso ? `Con «${av.caso}».` : 'Ejecuta la función con los casos de abajo hasta que uno salga mal.'}</p>
          </Estado>
          <Estado n={2}>
            <strong>{ej.preguntaLinea ?? 'Marca la línea donde está el fallo'}</strong>
            <p>{av.linea ? `Línea ${av.linea}.` : paso === 2 ? 'Pulsa su número en el código.' : ''}</p>
            {avisoLinea && paso === 2 && <p className="aviso-corto">{avisoLinea}</p>}
          </Estado>
          <Estado n={3}>
            <strong>¿Qué tipo de fallo es?</strong>
            {paso >= 3 && (
              <div className="chips">
                {TIPOS.map((t) => (
                  <button key={t} className={`chip-texto ${av.tipo === t ? 'on' : ''}`} onClick={() => elegirTipo(t)} disabled={paso !== 3}>
                    {NOMBRE_FALLO[t]}
                  </button>
                ))}
              </div>
            )}
            {avisoTipo && paso === 3 && <p className="aviso-corto">{avisoTipo}</p>}
            {av.tipo && (
              <p className="explicacion">
                <Rico texto={ej.explicacion} />
              </p>
            )}
          </Estado>
          <Estado n={4}>
            <strong>Arréglalo</strong>
            {paso === 4 && !arreglo?.ok && <p>Edita el código y pulsa «Comprobar el arreglo»: tiene que pasar todos los casos, sin errores ni fugas.</p>}
            {paso === 4 && arreglo?.sinCambios && <p className="aviso-corto">Todavía no has cambiado nada: edita el código y vuelve a comprobar.</p>}
            {paso === 4 && arreglo && !arreglo.ok && arreglo.falla && (
              <p className="aviso-corto">
                Aún no está: falla con «{arreglo.falla.caso.nombre}» ({arreglo.falla.titulo.toLowerCase().replace(/\.$/, '')}). Míralo en la memoria y vuelve a intentarlo.
              </p>
            )}
            {paso === 4 && arreglo?.ok && <p className="explicacion">¡Bien arreglado! Pasa todos los casos, sin errores ni fugas.</p>}
            {paso === 4 && !arreglo?.ok && fallidos >= 2 && !verSolucion && (
              <button className="btn-texto" onClick={() => setVerSolucion(true)}>
                Ver la solución
              </button>
            )}
            {paso === 4 && verSolucion && !arreglo?.ok && (
              <div className="solucion-fallo">
                <p>Así queda arreglado:</p>
                <EditorCodigo valor={ej.solucion} soloLectura minLineas={1} etiquetaAria="Solución" />
                <button
                  className="btn secundario"
                  onClick={() => {
                    setCodigo(ej.solucion);
                    setArreglo(null);
                  }}
                >
                  Copiarla al editor
                </button>
              </div>
            )}
          </Estado>
        </ol>
      </section>

      <section className="panel panel-codigo">
        <div className="panel-cab">
          <h2>{editando ? 'Tu arreglo' : 'El código'}</h2>
          <span className="nota">{editando ? 'Ya puedes editar' : paso === 2 ? 'Pulsa un número de línea' : 'Solo lectura hasta el paso 4'}</span>
        </div>
        <EditorCodigo
          valor={codigo}
          onChange={
            editando
              ? (v) => {
                  setCodigo(v);
                  setRes(null);
                  setInformes(null);
                  if (arreglo?.sinCambios) setArreglo(null);
                }
              : undefined
          }
          soloLectura={!editando}
          estados={estados}
          etiquetas={etiquetas}
          onLinea={paso === 2 ? marcarLinea : undefined}
          etiquetaAria="Código con el fallo"
        />
        <div className="casos" role="group" aria-label="Caso de prueba">
          <span className="rotulo">Ejecutar con</span>
          {ej.casos.map((c, i) => {
            const ok = informes ? informes[i].ok : probados[i];
            return (
              <button
                key={c.nombre}
                className={`caso ${i === casoSel ? 'on' : ''} ${ok === undefined ? '' : ok ? 'bien' : 'mal'}`}
                aria-pressed={i === casoSel}
                onClick={() => {
                  setCasoSel(i);
                  setRes(null);
                  setInfSel(null);
                }}
              >
                {ok !== undefined && (ok ? '✓ ' : '✗ ')}
                {c.nombre}
              </button>
            );
          })}
        </div>
        {caso.llamada && (
          <p className="llamada">
            Llamada: <code>{caso.llamada}</code>
          </p>
        )}
        <div className="acciones">
          <button className="btn" onClick={() => ejecutarSel(true)}>
            ▶ Ejecutar
          </button>
          <button className="btn secundario" onClick={() => ejecutarSel(false)}>
            Paso a paso
          </button>
          {editando && (
            <>
              <button className="btn secundario" onClick={comprobarArreglo}>
                Comprobar el arreglo
              </button>
              <button
                className="btn-texto"
                onClick={() => {
                  restaurar();
                  setRes(null);
                  setInformes(null);
                  setArreglo(null);
                }}
              >
                Volver al código original
              </button>
            </>
          )}
        </div>
        {editando && <Chuleta ctx={ej.ctx} />}
      </section>

      <section className="panel panel-memoria">
        <div className="panel-cab">
          <h2>Memoria</h2>
          <span className="nota">{caso.nombre}</span>
        </div>
        <Reproductor pasos={res?.pasos ?? null} rep={rep} ctx={ej.ctx} memInicial={memInicial} />
        {res?.error && !informes && (
          <div className="caja-error" role="alert">
            <strong>{res.error.linea > 0 ? `Línea ${res.error.linea}: ` : ''}</strong>
            {res.error.mensaje}
          </div>
        )}
        {res && !res.error && !informes && infSel && !infSel.ok && (
          <div className="caja-error" role="alert">
            <strong>{infSel.titulo}</strong>
            {infSel.detalle?.map((d, k) => (
              <div key={k} className="mono">
                {d}
              </div>
            ))}
          </div>
        )}
        {res && !res.error && !informes && infSel?.ok && <div className="caja-bien">Con este caso funciona.</div>}
        {informes && (
          <Informe
            lineas={informes.map((i) => ({
              nivel: i.ok ? 'ok' : 'mal',
              titulo: `${i.caso.nombre}: ${i.titulo}`,
              detalle: i.detalle ? (
                <>
                  {i.detalle.map((d, k) => (
                    <div key={k} className="mono">
                      {d}
                    </div>
                  ))}
                </>
              ) : undefined,
            }))}
          />
        )}
      </section>
    </div>
  );
}
