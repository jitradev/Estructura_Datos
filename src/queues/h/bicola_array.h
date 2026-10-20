/* EDA - Tema 4: bicola sobre ARRAY CIRCULAR (diapositivas 30 a 34).
 *
 * Se guarda el frente y el numero de elementos; el ultimo se calcula. El frente
 * se mueve en los dos sentidos: avanza al extraer por delante y retrocede al
 * insertar por delante. Retroceder es lo que suspende: (0 - 1) % MAX vale -1
 * en C, asi que se suma MAX antes del modulo.
 *
 * Copiado tal cual del deck: el tipo, avanza, retrocede y ultimo (D30),
 * insertarFrente e insertarFinal (D32), extraerFrente y extraerFinal (D34).
 * Lo demas completa la especificacion de la D28.
 *
 * MAX vale 5, el de los dibujos: con eso la vuelta del array llega enseguida.
 */
#ifndef BICOLA_ARRAY_H
#define BICOLA_ARRAY_H

#define MAX 5

typedef struct {
    int datos[MAX];
    int frente;   /* indice del primer elemento */
    int n;        /* elementos ocupados: el ultimo se calcula */
} Bicola;

void crearBicola(Bicola *b);
void liberarBicola(Bicola *b);          /* en el array no hay nada que liberar */
int  esVacia(Bicola *b);
int  esLlena(Bicola *b);
int  tamano(Bicola *b);

int  insertarFrente(Bicola *b, int x);  /* 0 si no cabe */
int  insertarFinal(Bicola *b, int x);
int  extraerFrente(Bicola *b, int *x);  /* 0 si esta vacia */
int  extraerFinal(Bicola *b, int *x);
int  verFrente(Bicola *b, int *x);
int  verFinal(Bicola *b, int *x);

void mostrar(Bicola *b);                /* frente < ... > final */
const char *implementacion(void);

#endif
