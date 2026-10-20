/* EDA - Tema 4: cola con prioridad, OPCION 1 de la diapositiva 44: una sola
 * lista enlazada, ordenada por prioridad al insertar.
 *
 * Desencolar es directo: siempre sale la cabeza. El trabajo esta en encolar,
 * que recorre la lista buscando el hueco con el puntero doble del tema 2. Y
 * para que sea ESTABLE, el nuevo va DETRAS de todos los de su misma
 * prioridad: el bucle avanza mientras la prioridad sea <= que la suya, no <.
 *
 * Copiado tal cual del deck: los tipos y encolarPrio (D45 y D47), desencolarPrio,
 * crearColaPrio y esVaciaPrio (D45 y D48). Lo demas completa la especificacion de
 * la D43.
 */
#ifndef COLA_PRIORIDAD_LISTA_H
#define COLA_PRIORIDAD_LISTA_H

#define NPRIO 4      /* prioridades 0..3, las del trabajo individual 2 */

typedef struct NodoP { int dato; int prio; struct NodoP *sig; } NodoP;
typedef struct { NodoP *cabeza; int n; } ColaPrio;   /* cabeza: la siguiente en salir */

void crearColaPrio(ColaPrio *c);
void liberarColaPrio(ColaPrio *c);
int  esVaciaPrio(ColaPrio *c);
int  tamanoPrio(ColaPrio *c);

int  encolarPrio(ColaPrio *c, int x, int prio);   /* 0 si prio no vale o no hay memoria */
int  desencolarPrio(ColaPrio *c, int *x);         /* 0 si esta vacia */
int  frentePrio(ColaPrio *c, int *x, int *prio);  /* consulta, con su prioridad */

void mostrarPrio(ColaPrio *c);                    /* en el orden en que van a salir */
const char *implementacion(void);

#endif
