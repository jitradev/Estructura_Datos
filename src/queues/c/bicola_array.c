/* EDA - Tema 4: bicola sobre array circular. Ver bicola_array.h. */
#include <stdio.h>
#include "bicola_array.h"

/* --- D30 ----------------------------------------------------------------- */
static int avanza(int i)     { return (i + 1) % MAX; }
static int retrocede(int i)  { return (i - 1 + MAX) % MAX; }   /* nunca negativo */
static int ultimo(Bicola *b) { return (b->frente + b->n - 1) % MAX; }

void crearBicola(Bicola *b)   { b->frente = 0; b->n = 0; }
void liberarBicola(Bicola *b) { (void)b; }
int  esVacia(Bicola *b) { return b->n == 0; }
int  esLlena(Bicola *b) { return b->n == MAX; }
int  tamano(Bicola *b)  { return b->n; }

/* --- D32 ----------------------------------------------------------------- */
int insertarFrente(Bicola *b, int x) {
    if (esLlena(b)) return 0;
    b->frente = retrocede(b->frente);   /* 1: se hace sitio delante */
    b->datos[b->frente] = x;            /* 2: y se escribe */
    b->n++;
    return 1;
}

int insertarFinal(Bicola *b, int x) {
    if (esLlena(b)) return 0;
    b->datos[(b->frente + b->n) % MAX] = x;   /* el hueco tras el ultimo */
    b->n++;
    return 1;
}

/* --- D34 ----------------------------------------------------------------- */
int extraerFrente(Bicola *b, int *x) {
    if (esVacia(b)) return 0;
    *x = b->datos[b->frente];
    b->frente = avanza(b->frente);
    b->n--;
    return 1;
}

int extraerFinal(Bicola *b, int *x) {
    if (esVacia(b)) return 0;
    *x = b->datos[ultimo(b)];
    b->n--;                             /* el frente no se mueve */
    return 1;
}

/* ------------------------------------------------------------------------- */
int verFrente(Bicola *b, int *x) {
    if (esVacia(b)) return 0;
    *x = b->datos[b->frente];
    return 1;
}

int verFinal(Bicola *b, int *x) {
    if (esVacia(b)) return 0;
    *x = b->datos[ultimo(b)];
    return 1;
}

void mostrar(Bicola *b) {
    printf("frente <");
    for (int k = 0, i = b->frente; k < b->n; k++, i = avanza(i))
        printf(" %d", b->datos[i]);
    printf(" > final   (frente en la casilla %d, n=%d de %d)\n", b->frente, b->n, MAX);
}

const char *implementacion(void) { return "array circular"; }
