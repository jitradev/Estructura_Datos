import { describe, expect, it } from 'vitest';
import { ejecutar } from '../interprete/ejecutar';
import { construir, CTX_LISTA, CTX_PILA_ARRAY, CTX_COLA_CIRCULAR, CTX_COLA_ENLAZADA, lista, pilaArray, colaCircular, colaEnlazada, entero } from '../memoria/construir';
import { describir, huella } from '../memoria/comparar';

describe('intérprete', () => {
  it('insertar al principio a mano', () => {
    const m = construir(CTX_LISTA, [lista('cab', [9, 3, 7])]);
    const r = ejecutar('Nodo *nuevo = malloc(sizeof(Nodo));\nnuevo->valor = 1;\nnuevo->siguiente = cab;\ncab = nuevo;', CTX_LISTA, m);
    expect(r.error).toBeUndefined();
    expect(describir(r.memFinal, CTX_LISTA, 'cab')).toBe('cab -> 1 -> 9 -> 3 -> 7 -> NULL');
    expect(r.pasos.length).toBe(5);
    expect(r.fugas.length).toBe(0);
  });
  it('uso tras free', () => {
    const m = construir(CTX_LISTA, [lista('cab', [9, 3, 7])]);
    const r = ejecutar('Nodo *aux = cab;\nfree(cab);\ncab = cab->siguiente;', CTX_LISTA, m);
    expect(r.error?.tipo).toBe('liberado');
    expect(r.error?.linea).toBe(3);
  });
  it('insertarFinal sin caso vacío revienta con NULL', () => {
    const code = `void insertarFinal(Nodo **cab, int x)
{
    Nodo *nuevo = malloc(sizeof(Nodo));
    nuevo->valor = x;
    nuevo->siguiente = NULL;
    Nodo *aux = *cab;
    while (aux->siguiente != NULL)
        aux = aux->siguiente;
    aux->siguiente = nuevo;
}`;
    const vacia = ejecutar(code, CTX_LISTA, construir(CTX_LISTA, [lista('cab', [])]), { llamada: 'insertarFinal(&cab, 5)' });
    expect(vacia.error?.tipo).toBe('nulo');
    expect(vacia.error?.linea).toBe(7);
    const varios = ejecutar(code, CTX_LISTA, construir(CTX_LISTA, [lista('cab', [9, 3])]), { llamada: 'insertarFinal(&cab, 5)' });
    expect(varios.error).toBeUndefined();
    expect(describir(varios.memFinal, CTX_LISTA, 'cab')).toBe('cab -> 9 -> 3 -> 5 -> NULL');
  });
  it('fuga detectada', () => {
    const m = construir(CTX_LISTA, [lista('cab', [9, 3, 7])]);
    const r = ejecutar('cab = cab->siguiente;', CTX_LISTA, m);
    expect(r.fugas.length).toBe(1);
  });
  it('pila con array y cola circular', () => {
    const m = construir(CTX_PILA_ARRAY, [pilaArray('p', [4, 1]), entero('x')]);
    const r = ejecutar(`int pop(Pila *p, int *x) { if (esVacia(p)) return 0; *x = p->datos[p->cima--]; return 1; }`, CTX_PILA_ARRAY, m, { llamada: 'pop(p, &x)' });
    expect(r.error).toBeUndefined();
    expect(describir(r.memFinal, CTX_PILA_ARRAY, 'x')).toBe('x = 1');
    expect(r.devuelve).toEqual({ k: 'int', v: 1 });
    const c = construir(CTX_COLA_CIRCULAR, [colaCircular('c', [8, 4, 9], 1)]);
    const r2 = ejecutar(`c->datos[c->final] = 2; c->final = c->final + 1; c->n++;`, CTX_COLA_CIRCULAR, c);
    expect(r2.error?.tipo).toBeUndefined();
    const r3 = ejecutar(`c->datos[c->final] = 2; c->final = c->final + 1; c->n++; c->datos[c->final] = 3;`, CTX_COLA_CIRCULAR, c);
    expect(r3.error?.tipo).toBe('array');
  });
  it('huella iguala formas', () => {
    const a = construir(CTX_COLA_ENLAZADA, [colaEnlazada('c', [1, 2])]);
    const b = construir(CTX_COLA_ENLAZADA, [colaEnlazada('c', [1, 2])]);
    expect(huella(a, ['c'])).toBe(huella(b, ['c']));
    expect(describir(a, CTX_COLA_ENLAZADA, 'c')).toContain('c->frente -> 1 -> 2 -> NULL');
  });
  it('bucle infinito', () => {
    const m = construir(CTX_LISTA, [lista('cab', [9])]);
    const r = ejecutar('Nodo *p = cab;\nwhile (p != NULL) { p->valor = 1; }', CTX_LISTA, m);
    expect(r.error?.tipo).toBe('bucle');
  });
  it('error de sintaxis', () => {
    const m = construir(CTX_LISTA, [lista('cab', [9])]);
    const r = ejecutar('Nodo *p = cab\np = p->siguiente;', CTX_LISTA, m);
    expect(r.error?.tipo).toBe('sintaxis');
  });
});
