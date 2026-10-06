import { useMemo, useState } from 'react';
import { comprobarTodo, ejecutarCaso, InformeCaso } from '../../ejercicios/comprobar';
import { EjProgramar } from '../../ejercicios/tipos';
import { Resultado } from '../../interprete/ejecutar';
import { construir } from '../../memoria/construir';
import { useBorrador } from '../../progreso';
import { Informe } from '../comun';
import { EditorCodigo } from '../EditorCodigo';
import { Chuleta, estadosLineas } from '../piezas';
import { Reproductor, useReproductor } from '../Reproductor';

export function Programar({ ej, onResuelto }: { ej: EjProgramar; onResuelto: () => void }) {
  const [codigo, setCodigo, reiniciar] = useBorrador(ej.id, 'codigo', () => ej.codigoInicial ?? '');
  const [casoSel, setCasoSel] = useState(0);
  const [res, setRes] = useState<Resultado | null>(null);
  const [informes, setInformes] = useState<InformeCaso[] | null>(null);
  const rep = useReproductor(res?.pasos ?? null);
  const caso = ej.casos[casoSel];
  const memInicial = useMemo(() => construir(ej.ctx, caso.inicial), [ej, caso]);

  const lanzar = (animar: boolean) => {
    const r = ejecutarCaso(codigo, ej, caso);
    setRes(r);
    rep.setIdx(animar ? 0 : 0);
    rep.setEnMarcha(animar);
  };

  const comprobar = () => {
    const inf = comprobarTodo(codigo, ej);
    setInformes(inf);
    // se enseña el primer caso que falla, o el seleccionado si todo va bien
    const malo = inf.findIndex((i) => !i.ok);
    const k = malo >= 0 ? malo : casoSel;
    setCasoSel(k);
    setRes(inf[k].resultado);
    rep.setEnMarcha(false);
    rep.setIdx(inf[k].resultado.pasos.length - 1);
    if (malo < 0) onResuelto();
  };

  const estados = estadosLineas(res?.pasos ?? null, rep.idx);

  return (
    <div className="ej-rejilla">
      <section className="panel panel-codigo">
        <div className="panel-cab">
          <h2>Tu código</h2>
          {caso.llamada && (
            <span className="llamada">
              Se llama así: <code>{caso.llamada}</code>
            </span>
          )}
        </div>
        <EditorCodigo
          valor={codigo}
          onChange={(v) => {
            setCodigo(v);
            setRes(null);
            setInformes(null);
          }}
          estados={estados}
          etiquetaAria="Tu código"
        />
        {ej.casos.length > 1 && (
          <div className="casos" role="group" aria-label="Caso de prueba">
            <span className="rotulo">Probar con</span>
            {ej.casos.map((c, i) => {
              const inf = informes?.[i];
              return (
                <button
                  key={c.nombre}
                  className={`caso ${i === casoSel ? 'on' : ''} ${inf ? (inf.ok ? 'bien' : 'mal') : ''}`}
                  aria-pressed={i === casoSel}
                  onClick={() => {
                    setCasoSel(i);
                    setRes(null);
                  }}
                >
                  {inf && (inf.ok ? '✓ ' : '✗ ')}
                  {c.nombre}
                </button>
              );
            })}
          </div>
        )}
        <div className="acciones">
          <button className="btn" onClick={() => lanzar(true)}>
            ▶ Ejecutar
          </button>
          <button className="btn secundario" onClick={() => lanzar(false)}>
            Paso a paso
          </button>
          <button className="btn secundario" onClick={comprobar}>
            Comprobar{ej.casos.length > 1 ? ` los ${ej.casos.length} casos` : ''}
          </button>
          <button
            className="btn-texto"
            onClick={() => {
              reiniciar();
              setRes(null);
              setInformes(null);
            }}
          >
            Borrar
          </button>
        </div>
        <Chuleta ctx={ej.ctx} />
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
        {informes && (
          <Informe
            lineas={informes.map((i) => ({
              nivel: i.ok ? 'ok' : 'mal',
              titulo: ej.casos.length > 1 ? `${i.caso.nombre}: ${i.titulo}` : i.titulo,
              detalle: i.detalle ? (
                <>
                  {i.detalle.map((d, k) => (
                    <div key={k} className={d.startsWith('Tienes') || d.startsWith('Se esperaba') ? 'mono' : ''}>
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
