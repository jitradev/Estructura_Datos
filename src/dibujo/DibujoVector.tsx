// Drawing of the topic 7 memory: every int array as a row of cells with its index, the
// index variables of the running function (i, j, min...) as marks under their cell, and
// the variables of every call, from main to the one that is running.

import { Marco, Memoria, Objeto, TIPO_ARRAY, Valor } from '../memoria/modelo';

/** Int variables that are drawn as a mark under the cell they point at. */
const INDICES = new Set(['i', 'j', 'k', 'min', 'max', 'ini', 'fin', 'medio', 'med', 'p', 'pos', 'izq', 'der', 'lo', 'hi']);

const verValor = (v: Valor, m: Memoria): string => {
  if (v.k === 'int') return String(v.v);
  if (v.k === 'nulo') return 'NULL';
  if (v.k === 'basura') return '?';
  const r = v.r;
  if (r.k === 'elem') {
    const o = m.objetos[r.id];
    const nombre = o?.nombre ?? r.campo;
    return r.i === 0 ? `→ ${nombre}` : `→ &${nombre}[${r.i}]`;
  }
  if (r.k === 'var') return `→ &${r.nombre}`;
  return '→ …';
};

const arraysDe = (m: Memoria): Objeto[] =>
  Object.values(m.objetos)
    .filter((o) => o.tipo === TIPO_ARRAY)
    .sort((a, b) => a.id - b.id);

/** The array a frame works on: the first one its variables point into. */
function arrayDelMarco(mc: Marco): number | null {
  for (const v of mc.vars) if (v.valor.k === 'ref' && v.valor.r.k === 'elem') return v.valor.r.id;
  return null;
}

export function DibujoVector({ mem, prev, compacto }: { mem: Memoria; prev?: Memoria; compacto?: boolean }) {
  const arrays = arraysDe(mem);
  const arriba = mem.marcos[mem.marcos.length - 1];
  const destino = arrayDelMarco(arriba) ?? arrays[0]?.id;
  const marcas = arriba.vars.filter((v) => INDICES.has(v.nombre) && v.valor.k === 'int');
  const valorPrevio = (id: number, campo: string, i: number) => {
    const o = prev?.objetos[id];
    return o ? (o.campos[campo] as Valor[] | undefined)?.[i] : undefined;
  };

  if (!arrays.length && mem.marcos.every((mc) => !mc.vars.length)) return <p className="nota vector-vacio">Todavía no hay ningún array. Declara uno, como int v[] = {'{'}5, 2, 8{'}'};</p>;

  return (
    <div className={`dibujo-vector ${compacto ? 'compacto' : ''}`}>
      {arrays.map((o) => {
        const [campo, celdas] = Object.entries(o.campos)[0] as [string, Valor[]];
        const suyas = o.id === destino ? marcas.filter((v) => (v.valor as { v: number }).v >= -1 && (v.valor as { v: number }).v <= celdas.length) : [];
        return (
          <div key={o.id} className="vector-fila">
            <span className="vector-nombre mono">{o.nombre}</span>
            <div className="vector-celdas" role="img" aria-label={`${o.nombre} = [${celdas.map((c) => (c.k === 'int' ? c.v : '?')).join(', ')}]`}>
              {celdas.map((c, i) => {
                const antes = valorPrevio(o.id, campo, i);
                const cambia = !!prev && !!antes && (antes.k !== c.k || (antes.k === 'int' && c.k === 'int' && antes.v !== c.v));
                const aqui = suyas.filter((v) => (v.valor as { v: number }).v === i).map((v) => v.nombre);
                return (
                  <span key={i} className={`vector-celda ${cambia ? 'cambia' : ''} ${c.k === 'basura' ? 'basura' : ''}`}>
                    <b>{c.k === 'int' ? c.v : '?'}</b>
                    <small>{i}</small>
                    {!compacto && <em className="vector-marcas">{aqui.join(' ')}</em>}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
      {!compacto && (
        <div className="vector-marcos">
          {mem.marcos.map((mc, k) => {
            const previo = prev?.marcos[k]?.funcion === mc.funcion ? prev.marcos[k] : undefined;
            const vars = mc.vars.filter((v) => !v.array);
            return (
              <div key={k} className={`vector-marco ${k === mem.marcos.length - 1 ? 'actual' : ''}`}>
                <span className="vector-funcion mono">{mc.funcion}</span>
                {vars.length ? (
                  vars.map((v) => {
                    const a = previo?.vars.find((x) => x.nombre === v.nombre);
                    const cambia = !!prev && (!a || verValor(a.valor, prev) !== verValor(v.valor, mem));
                    return (
                      <span key={v.nombre} className={`vector-var mono ${cambia ? 'cambia' : ''}`}>
                        {v.nombre} = {verValor(v.valor, mem)}
                      </span>
                    );
                  })
                ) : (
                  <span className="nota">sin variables</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
