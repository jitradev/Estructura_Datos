// Arrow paths with rounded elbows. A cubic curve between two points that are far apart
// sideways but close vertically twists into a tight S; these go straight with round corners.

export interface Pt {
  x: number;
  y: number;
}

/** True when a vertical-to-vertical curve between s and t would twist too much. */
export const tuerce = (s: Pt, t: Pt) => Math.abs(t.x - s.x) > Math.abs(t.y - s.y) * 0.8 && Math.abs(t.y - s.y) > 18;

/** Leaves s vertically, crosses horizontally half-way, arrives at t vertically. */
export function codoVertical(s: Pt, t: Pt, medio = (s.y + t.y) / 2, r = 14): string {
  const sx = Math.sign(t.x - s.x);
  const d1 = Math.sign(medio - s.y) || 1;
  const d2 = Math.sign(t.y - medio) || 1;
  const rr = Math.min(r, Math.abs(t.x - s.x) / 2, Math.abs(medio - s.y), Math.abs(t.y - medio));
  if (rr < 1 || !sx) return `M${s.x} ${s.y} L${t.x} ${t.y}`;
  return [
    `M${s.x} ${s.y}`,
    `L${s.x} ${medio - d1 * rr}`,
    `Q${s.x} ${medio} ${s.x + sx * rr} ${medio}`,
    `L${t.x - sx * rr} ${medio}`,
    `Q${t.x} ${medio} ${t.x} ${medio + d2 * rr}`,
    `L${t.x} ${t.y}`,
  ].join(' ');
}

/** Leaves s horizontally and turns once to arrive at t vertically. */
export function codoLado(s: Pt, t: Pt, r = 16): string {
  const sx = Math.sign(t.x - s.x);
  const sy = Math.sign(t.y - s.y);
  const rr = Math.min(r, Math.abs(t.x - s.x), Math.abs(t.y - s.y));
  if (rr < 1 || !sx || !sy) return `M${s.x} ${s.y} L${t.x} ${t.y}`;
  return `M${s.x} ${s.y} L${t.x - sx * rr} ${s.y} Q${t.x} ${s.y} ${t.x} ${s.y + sy * rr} L${t.x} ${t.y}`;
}

/** A path through the given corners, with every corner rounded. */
export function polilinea(pts: Pt[], r = 14): string {
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [a, b, c] = [pts[i - 1], pts[i], pts[i + 1]];
    const l1 = Math.hypot(b.x - a.x, b.y - a.y);
    const l2 = Math.hypot(c.x - b.x, c.y - b.y);
    const rr = Math.min(r, l1 / 2, l2 / 2);
    if (rr < 1) {
      d += ` L${b.x} ${b.y}`;
      continue;
    }
    const p1 = { x: b.x - ((b.x - a.x) / l1) * rr, y: b.y - ((b.y - a.y) / l1) * rr };
    const p2 = { x: b.x + ((c.x - b.x) / l2) * rr, y: b.y + ((c.y - b.y) / l2) * rr };
    d += ` L${p1.x} ${p1.y} Q${b.x} ${b.y} ${p2.x} ${p2.y}`;
  }
  const z = pts[pts.length - 1];
  return d + ` L${z.x} ${z.y}`;
}
