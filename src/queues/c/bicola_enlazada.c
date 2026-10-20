/* EDA - Tema 4: bicola como lista doble. Ver bicola_enlazada.h. */
#include <stdio.h>
#include <stdlib.h>
#include "bicola_enlazada.h"

/* --- D36 y D38 ----------------------------------------------------------------- */
void crearBicola(Bicola *b) { b->frente = b->final = NULL; b->n = 0; }
int  esVacia(Bicola *b)     { return b->frente == NULL; }

int insertarFrente(Bicola *b, int x) {
    NodoB *nuevo = malloc(sizeof(NodoB));
    if (!nuevo) return 0;
    nuevo->dato = x;  nuevo->ant = NULL;
    nuevo->sig = b->frente;                     /* 1 */
    if (esVacia(b)) b->final = nuevo;
    else            b->frente->ant = nuevo;     /* 2 */
    b->frente = nuevo;                          /* 3 */
    b->n++;
    return 1;
}

/* El espejo de insertarFrente: frente por final y ant por sig. */
int insertarFinal(Bicola *b, int x) {
    NodoB *nuevo = malloc(sizeof(NodoB));
    if (!nuevo) return 0;
    nuevo->dato = x;  nuevo->sig = NULL;
    nuevo->ant = b->final;                      /* 1 */
    if (esVacia(b)) b->frente = nuevo;
    else            b->final->sig = nuevo;      /* 2 */
    b->final = nuevo;                           /* 3 */
    b->n++;
    return 1;
}

/* --- D40 ----------------------------------------------------------------- */
int extraerFrente(Bicola *b, int *x) {
    if (esVacia(b)) return 0;
    NodoB *v = b->frente;  *x = v->dato;
    b->frente = v->sig;
    if (b->frente) b->frente->ant = NULL; else b->final = NULL;
    free(v); b->n--;
    return 1;
}

int extraerFinal(Bicola *b, int *x) {
    if (esVacia(b)) return 0;
    NodoB *v = b->final;  *x = v->dato;
    b->final = v->ant;                          /* 1: sin recorrer */
    if (b->final) b->final->sig = NULL;         /* 2 */
    else          b->frente = NULL;             /* era el unico */
    free(v); b->n--;
    return 1;
}

/* ------------------------------------------------------------------------- */
int esLlena(Bicola *b) { (void)b; return 0; }
int tamano(Bicola *b)  { return b->n; }

int verFrente(Bicola *b, int *x) {
    if (esVacia(b)) return 0;
    *x = b->frente->dato;
    return 1;
}

int verFinal(Bicola *b, int *x) {
    if (esVacia(b)) return 0;
    *x = b->final->dato;
    return 1;
}

void liberarBicola(Bicola *b) {
    int basura;
    while (extraerFrente(b, &basura)) { }   /* extraerFrente ya libera cada nodo */
}

void mostrar(Bicola *b) {
    printf("frente <");
    for (NodoB *p = b->frente; p != NULL; p = p->sig)
        printf(" %d", p->dato);
    printf(" > final   (n=%d)\n", b->n);
}

const char *implementacion(void) { return "lista doble"; }
