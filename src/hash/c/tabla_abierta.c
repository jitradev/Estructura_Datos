/* EDA - Tema 6: tabla de dispersion con direccionamiento abierto.
 * Ver tabla_abierta.h. */
#include <stdio.h>
#include "tabla_abierta.h"

/* --- D12 ----------------------------------------------------------------- */
int hash(int clave) { return clave % TAM; }

void crearTabla(TablaHash *t) {
    for (int i = 0; i < TAM; i++) t->marca[i] = VACIA;
    t->n = 0;
}

/* --- D15, corregida ------------------------------------------------------ */
/* Devuelve la casilla donde esta la clave, o -1. Es el bucle de la caza del
 * error con la tercera marca: la casilla BORRADA no para la busqueda. */
static int posicion(TablaHash *t, int clave) {
    int i = hash(clave), pasos = 0;
    while (pasos < TAM) {
        if (t->marca[i] == VACIA) return -1;      /* aqui si: nunca hubo nada */
        if (t->marca[i] == OCUPADA && t->claves[i] == clave) return i;
        i = (i + 1) % TAM;       /* SONDEO lineal; BORRADA tambien pasa por aqui */
        pasos++;
    }
    return -1;                   /* vuelta completa sin encontrar VACIA */
}

int buscar(TablaHash *t, int clave) { return posicion(t, clave) >= 0; }

/* --- D11 y D14 ----------------------------------------------------------- */
int insertar(TablaHash *t, int clave) {
    if (buscar(t, clave)) return 0;      /* ya estaba: no se duplica */
    int i = hash(clave), pasos = 0;
    while (pasos < TAM) {
        if (t->marca[i] != OCUPADA) {    /* VACIA o BORRADA: las dos sirven */
            t->claves[i] = clave;
            t->marca[i]  = OCUPADA;
            t->n++;
            return 1;
        }
        i = (i + 1) % TAM;       /* SONDEO lineal: ocupada, prueba la siguiente */
        pasos++;
    }
    return 0;                            /* tabla llena */
}

/* --- D14: la casilla NO se vacia, se marca ------------------------------- */
int eliminar(TablaHash *t, int clave) {
    int i = posicion(t, clave);
    if (i < 0) return 0;
    t->marca[i] = BORRADA;
    t->n--;
    return 1;
}

/* ------------------------------------------------------------------------- */
int  tamano(TablaHash *t)  { return t->n; }
void limpiar(TablaHash *t) { crearTabla(t); }   /* no hay nada que liberar */

void mostrar(TablaHash *t) {
    for (int i = 0; i < TAM; i++) printf("%4d", i);
    printf("\n");
    for (int i = 0; i < TAM; i++) {
        if (t->marca[i] == OCUPADA)      printf("%4d", t->claves[i]);
        else if (t->marca[i] == BORRADA) printf("%4s", "B");
        else                             printf("%4s", ".");
    }
    printf("     (n=%d; . vacia, B borrada)\n", t->n);
}
