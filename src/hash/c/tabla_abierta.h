/* EDA - Tema 6: el TAD Tabla de dispersion (diapositiva 6) con
 * DIRECCIONAMIENTO ABIERTO y exploracion lineal (diapositivas 11 a 15).
 *
 * Todas las claves viven en el mismo array. Si la casilla que da hash(x) esta
 * ocupada, se prueba la siguiente: h_i(x) = (hash(x) + i) mod TAM (D11).
 * Las claves son enteros no negativos, como en los ejemplos del deck, y TAM y
 * hash son los de la D12: TAM = 10 y hash(x) = x mod 10.
 *
 * Cada casilla lleva una de las tres marcas de la D14: VACIA, OCUPADA o
 * BORRADA. eliminar no vacia la casilla: la marca BORRADA, y buscar sigue
 * explorando al encontrarla. buscar es el bucle de la caza del error de la D15
 * con el error corregido: solo para en VACIA, nunca en BORRADA.
 *
 * Para exploracion cuadratica o doble hashing (D13) solo cambia la linea
 * marcada con SONDEO en tabla_abierta.c, en los dos sitios donde aparece.
 */
#ifndef TABLA_ABIERTA_H
#define TABLA_ABIERTA_H

#define TAM 10

typedef enum { VACIA, OCUPADA, BORRADA } Marca;

typedef struct {
    int   claves[TAM];
    Marca marca[TAM];
    int   n;          /* casillas OCUPADA */
} TablaHash;

int  hash(int clave);                    /* clave % TAM */

void crearTabla(TablaHash *t);           /* todas las casillas VACIA */
int  insertar(TablaHash *t, int clave);  /* 0 si ya estaba o si la tabla esta llena */
int  buscar(TablaHash *t, int clave);    /* 1 si esta */
int  eliminar(TablaHash *t, int clave);  /* 0 si no estaba; marca BORRADA */
int  tamano(TablaHash *t);               /* el contador n */
void limpiar(TablaHash *t);              /* vuelve a dejarlo todo VACIA */

void mostrar(TablaHash *t);              /* las TAM casillas, con su marca */

#endif
