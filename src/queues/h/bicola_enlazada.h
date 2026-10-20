/* EDA - Tema 4: bicola como LISTA DOBLEMENTE ENLAZADA (diapositivas 35 a 40).
 *
 * Con una lista simple, extraer por el final obligaria a recorrer hasta el
 * penultimo para dejarlo como nuevo final. Con el enlace ant, el penultimo es
 * final->ant, y los cuatro extremos se manejan sin recorrer nada.
 *
 * Copiado tal cual del deck: los tipos, crearBicola, esVacia e insertarFrente
 * (D36 y D38), extraerFrente y extraerFinal (D40). insertarFinal es el espejo de
 * insertarFrente, que la D38 deja en una frase: aqui esta escrito.
 */
#ifndef BICOLA_ENLAZADA_H
#define BICOLA_ENLAZADA_H

typedef struct NodoB { int dato; struct NodoB *ant, *sig; } NodoB;
typedef struct { NodoB *frente; NodoB *final; int n; } Bicola;

void crearBicola(Bicola *b);
void liberarBicola(Bicola *b);          /* libera todos los nodos */
int  esVacia(Bicola *b);
int  esLlena(Bicola *b);                /* siempre 0: solo la limita la memoria */
int  tamano(Bicola *b);

int  insertarFrente(Bicola *b, int x);  /* 0 si no hay memoria */
int  insertarFinal(Bicola *b, int x);
int  extraerFrente(Bicola *b, int *x);  /* 0 si esta vacia */
int  extraerFinal(Bicola *b, int *x);
int  verFrente(Bicola *b, int *x);
int  verFinal(Bicola *b, int *x);

void mostrar(Bicola *b);
const char *implementacion(void);

#endif
