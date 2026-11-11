// Gives every array cell a stable identity across steps, so the bars view can
// slide a bar to its new position (swap, shift) instead of redrawing it.
//
// Steps only store values, so identities are inferred by diffing each step with
// the previous one: a cell that keeps its value keeps its id; a changed cell takes
// the id of a freed cell with the same value (nearest first), which is how a swap
// becomes two bars crossing. A value copied one cell to the side (insertion sort
// shift) moves the original bar and leaves a fresh copy behind.

export function identidades(vs: number[][]): number[][] {
  if (vs.length === 0) return [];
  let siguiente = vs[0].length;
  const res: number[][] = [vs[0].map((_, k) => k)];
  for (let s = 1; s < vs.length; s++) {
    const ant = vs[s - 1];
    const cur = vs[s];
    const pids = res[s - 1];
    if (ant.length !== cur.length) {
      res.push(cur.map(() => siguiente++));
      continue;
    }
    const ids: number[] = cur.map(() => -1);
    const usados = new Set<number>();
    cur.forEach((x, k) => {
      if (x === ant[k]) {
        ids[k] = pids[k];
        usados.add(pids[k]);
      }
    });
    cur.forEach((x, k) => {
      if (ids[k] !== -1) return;
      let mejor = -1;
      ant.forEach((y, j) => {
        if (y !== x || usados.has(pids[j])) return;
        if (mejor === -1 || Math.abs(j - k) < Math.abs(mejor - k)) mejor = j;
      });
      if (mejor !== -1) {
        ids[k] = pids[mejor];
        usados.add(pids[mejor]);
        return;
      }
      // copied from a neighbour: that bar slides over, a new copy stays behind
      const vecino = [k - 1, k + 1].find((j) => j >= 0 && j < cur.length && ant[j] === x && cur[j] === x && ids[j] === pids[j]);
      if (vecino !== undefined) {
        ids[k] = pids[vecino];
        ids[vecino] = siguiente++;
        return;
      }
      if (!usados.has(pids[k])) {
        ids[k] = pids[k]; // overwritten in place: the bar just changes height
        usados.add(pids[k]);
      } else ids[k] = siguiente++;
    });
    res.push(ids);
  }
  return res;
}
