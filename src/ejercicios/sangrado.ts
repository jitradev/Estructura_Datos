/** Quita el primer salto de línea y el sangrado común: así los números de línea son los que se ven. */
export function c(s: string): string {
  const lineas = s.replace(/^\n/, '').replace(/\s+$/, '').split('\n');
  const sangria = Math.min(...lineas.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length));
  return lineas.map((l) => l.slice(sangria)).join('\n');
}
