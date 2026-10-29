// Breadcrumb of every page, with a «Volver» button in front. It goes back in the history
// when the previous page is one of the app's; opened from a link, it goes up to the parent.

import { MouseEvent } from 'react';

/** How many pages of the app there are behind the current one, kept in each history entry. */
let profundidad = (window.history.state as { prof?: number } | null)?.prof ?? 0;
if (window.history.state?.prof === undefined) window.history.replaceState({ ...window.history.state, prof: 0 }, '');
window.addEventListener('hashchange', () => {
  const p = (window.history.state as { prof?: number } | null)?.prof;
  if (p === undefined) {
    profundidad++;
    window.history.replaceState({ ...window.history.state, prof: profundidad }, '');
  } else profundidad = p;
});

export function Miga({ pasos }: { pasos: [texto: string, href: string][] }) {
  const padre = pasos[pasos.length - 1][1];
  const volver = (e: MouseEvent) => {
    if (profundidad > 0) {
      e.preventDefault();
      window.history.back();
    }
  };
  return (
    <nav className="miga">
      <a className="volver" href={padre} onClick={volver}>
        <span aria-hidden>←</span> Volver
      </a>
      {pasos.map(([texto, href], i) => (
        <span key={href} className="paso-miga">
          {i > 0 && <span className="sep">/</span>}
          <a href={href}>{texto}</a>
        </span>
      ))}
    </nav>
  );
}
