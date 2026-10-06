#include "ListaCircularDoble.h"

#include <stdio.h>
#include <stdlib.h>

struct ListaCircularDoble {
    NodoDoble* acceso;  // el PRIMER nodo; el último es su anterior. NULL si está vacía
};

// ==================== Auxiliares (no están en el .h) ====================
// Solo se usan dentro de este archivo. Llevan el sufijo ListaCircularDoble para no
// chocar con las de las otras listas.

// Devuelve el último nodo (el anterior del acceso). La lista no puede estar vacía.
NodoDoble* ultimoListaCircularDoble(ListaCircularDoble* lista) {
    return obtenerAnteriorNodoDoble(lista->acceso);
}

// Engancha "nodo" justo detrás de "anterior". Cuatro enlaces, ni un solo NULL:
// en la circular doble todos los nodos tienen siguiente y anterior.
void enlazarTrasListaCircularDoble(NodoDoble* anterior, NodoDoble* nodo) {
    NodoDoble* siguiente = obtenerSiguienteNodoDoble(anterior);
    // Primero el nuevo se engancha a sus dos vecinos...
    asignarSiguienteNodoDoble(nodo, siguiente);         // 1: el nuevo mira al de la derecha
    asignarAnteriorNodoDoble(nodo, anterior);           // 2: y al de la izquierda
    // ...y después los vecinos pasan a mirar al nuevo
    asignarAnteriorNodoDoble(siguiente, nodo);          // 3: el de la derecha mira atrás al nuevo (el que se olvida)
    asignarSiguienteNodoDoble(anterior, nodo);          // 4: el de la izquierda mira al nuevo
}

// Quita "muerto" de la lista y lo libera, manteniendo el acceso correcto.
int desenlazarListaCircularDoble(ListaCircularDoble* lista, NodoDoble* muerto) {
    if (obtenerSiguienteNodoDoble(muerto) == muerto) {
        lista->acceso = NULL;                           // era el único: la lista queda vacía
        return borrarNodoDoble(muerto);
    }
    // Dos enlaces, porque el nodo conoce a sus dos vecinos
    NodoDoble* anterior = obtenerAnteriorNodoDoble(muerto);
    NodoDoble* siguiente = obtenerSiguienteNodoDoble(muerto);
    asignarSiguienteNodoDoble(anterior, siguiente);     // 1: el de la izquierda se lo salta
    asignarAnteriorNodoDoble(siguiente, anterior);      // 2: el de la derecha se lo salta hacia atrás
    if (muerto == lista->acceso) {
        lista->acceso = siguiente;                      // borrábamos el de acceso: avanza
    }
    return borrarNodoDoble(muerto);
}

// Devuelve el primer nodo con ese valor, o NULL si no está.
NodoDoble* buscarValorListaCircularDoble(ListaCircularDoble* lista, int valor) {
    if (estaVacioListaCircularDoble(lista)) {
        return NULL;
    }
    NodoDoble* nodo = lista->acceso;
    // do-while: el primero hay que mirarlo antes de comprobar si hemos dado la vuelta
    do {
        if (obtenerValorNodoDoble(nodo) == valor) {
            return nodo;
        }
        nodo = obtenerSiguienteNodoDoble(nodo);
    } while (nodo != lista->acceso);
    return NULL;
}

// ==================== Creación ====================

ListaCircularDoble* crearListaCircularDoble(void) {
    ListaCircularDoble* lista = malloc(sizeof(ListaCircularDoble));
    if (lista == NULL) {
        return NULL;
    }
    lista->acceso = NULL;
    return lista;
}

// ==================== Consulta ====================

int obtenerPosicionListaCircularDoble(ListaCircularDoble* lista, int valor) {
    if (estaVacioListaCircularDoble(lista)) {
        return -1;
    }
    NodoDoble* nodo = lista->acceso;
    int posicion = 0;
    do {
        if (obtenerValorNodoDoble(nodo) == valor) {
            return posicion;
        }
        posicion++;
        nodo = obtenerSiguienteNodoDoble(nodo);
    } while (nodo != lista->acceso);
    return -1;
}

NodoDoble* obtenerNodoListaCircularDoble(ListaCircularDoble* lista, int posicion) {
    if (posicion < 0 || posicion >= obtenerLongitudListaCircularDoble(lista)) {
        return NULL;
    }
    NodoDoble* nodo = lista->acceso;
    for (int i = 0; i < posicion; i++) {
        nodo = obtenerSiguienteNodoDoble(nodo);
    }
    return nodo;
}

int obtenerLongitudListaCircularDoble(ListaCircularDoble* lista) {
    if (estaVacioListaCircularDoble(lista)) {
        return 0;
    }
    int longitud = 0;
    NodoDoble* nodo = lista->acceso;
    do {
        longitud++;
        nodo = obtenerSiguienteNodoDoble(nodo);
    } while (nodo != lista->acceso);
    return longitud;
}

int estaVacioListaCircularDoble(ListaCircularDoble* lista) {
    return lista->acceso == NULL;
}

int existeNodoListaCircularDoble(ListaCircularDoble* lista, NodoDoble* nodo) {
    if (estaVacioListaCircularDoble(lista)) {
        return 0;
    }
    NodoDoble* recorrer = lista->acceso;
    do {
        if (recorrer == nodo) {
            return 1;
        }
        recorrer = obtenerSiguienteNodoDoble(recorrer);
    } while (recorrer != lista->acceso);
    return 0;
}

int existeValorListaCircularDoble(ListaCircularDoble* lista, int valor) {
    return buscarValorListaCircularDoble(lista, valor) != NULL;
}

// ==================== Inserción ====================
// Siempre el mismo enlazarTrasListaCircularDoble, con distinto punto de entrada.

int insertarFinalListaCircularDoble(ListaCircularDoble* lista, NodoDoble* nodo) {
    if (nodo == NULL) {
        return 0;
    }
    if (estaVacioListaCircularDoble(lista)) {
        asignarSiguienteNodoDoble(nodo, nodo);  // solo: se apunta a sí mismo por los dos lados
        asignarAnteriorNodoDoble(nodo, nodo);
        lista->acceso = nodo;
        return 1;
    }
    enlazarTrasListaCircularDoble(ultimoListaCircularDoble(lista), nodo);   // detrás del último
    return 1;
}

int insertarPrincipioListaCircularDoble(ListaCircularDoble* lista, NodoDoble* nodo) {
    if (!insertarFinalListaCircularDoble(lista, nodo)) {
        return 0;
    }
    // El nuevo ha quedado como último, justo antes del acceso:
    // si el acceso pasa a él, se convierte en el primero.
    lista->acceso = nodo;
    return 1;
}

int insertarListaCircularDoble(ListaCircularDoble* lista, NodoDoble* nodo, int posicion) {
    if (nodo == NULL || posicion < 0) {
        return 0;
    }
    if (posicion == 0) {
        return insertarPrincipioListaCircularDoble(lista, nodo);
    }
    if (posicion >= obtenerLongitudListaCircularDoble(lista)) {
        return insertarFinalListaCircularDoble(lista, nodo);
    }
    enlazarTrasListaCircularDoble(obtenerNodoListaCircularDoble(lista, posicion - 1), nodo);
    return 1;
}

int insertarTrasListaCircularDoble(ListaCircularDoble* lista, NodoDoble* nodo, int valor) {
    if (nodo == NULL) {
        return 0;
    }
    NodoDoble* anterior = buscarValorListaCircularDoble(lista, valor);
    if (anterior == NULL) {
        return 0;                               // ningún nodo tiene ese valor
    }
    // El acceso (el primero) no cambia: si anterior era el último, el nuevo queda
    // justo antes del acceso y ya es el último sin hacer nada más.
    enlazarTrasListaCircularDoble(anterior, nodo);
    return 1;
}

// ==================== Eliminación ====================
// No hace falta buscar al anterior: el nodo lo lleva encima. Por eso todas acaban
// en desenlazarListaCircularDoble, que solo necesita el nodo a borrar.

int eliminarNodoPosicionListaCircularDoble(ListaCircularDoble* lista, int posicion) {
    NodoDoble* muerto = obtenerNodoListaCircularDoble(lista, posicion);
    if (muerto == NULL) {
        return 0;                               // la posición no existe
    }
    return desenlazarListaCircularDoble(lista, muerto);
}

int eliminarPorReferenciaListaCircularDoble(ListaCircularDoble* lista, NodoDoble* nodo) {
    if (estaVacioListaCircularDoble(lista) || nodo == NULL) {
        return 0;
    }
    // Esta versión existe para que las cuatro listas tengan las mismas operaciones,
    // pero aquí el puntero doble solo sirve para RECORRER: referencia apunta al enlace
    // que lleva al candidato (primero el propio acceso, luego el siguiente de cada nodo).
    // Para BORRAR no aporta nada: en una lista doble el nodo ya conoce a sus dos vecinos,
    // así que al encontrarlo se desengancha igual que en eliminarNodo.
    // Comparadla con la de la lista simple: allí el puntero doble sí se ahorraba un caso.
    NodoDoble** referencia = &lista->acceso;
    do {
        if (*referencia == nodo) {
            return desenlazarListaCircularDoble(lista, nodo);
        }
        referencia = obtenerReferenciaSiguienteNodoDoble(*referencia);
    } while (*referencia != lista->acceso);
    return 0;
}

int eliminarNodoListaCircularDoble(ListaCircularDoble* lista, NodoDoble* nodo) {
    if (nodo == NULL || !existeNodoListaCircularDoble(lista, nodo)) {
        return 0;
    }
    return desenlazarListaCircularDoble(lista, nodo);
}

int eliminarPorValorListaCircularDoble(ListaCircularDoble* lista, int valor) {
    NodoDoble* muerto = buscarValorListaCircularDoble(lista, valor);
    if (muerto == NULL) {
        return 0;                               // ningún nodo tiene ese valor
    }
    return desenlazarListaCircularDoble(lista, muerto);
}

void eliminarListaCircularDoble(ListaCircularDoble* lista) {
    if (!estaVacioListaCircularDoble(lista)) {
        // Se rompe el círculo por el último y se libera como una lista lineal
        asignarSiguienteNodoDoble(ultimoListaCircularDoble(lista), NULL);
        NodoDoble* nodo = lista->acceso;
        while (nodo != NULL) {
            NodoDoble* siguiente = obtenerSiguienteNodoDoble(nodo);
            borrarNodoDoble(nodo);
            nodo = siguiente;
        }
    }
    free(lista);
}

// ==================== Salida ====================

void mostrarListaCircularDoble(ListaCircularDoble* lista) {
    printf("Lista circular doble: ");
    if (estaVacioListaCircularDoble(lista)) {
        printf("(vacia)\n");
        return;
    }
    NodoDoble* nodo = lista->acceso;
    do {
        printf("%d <-> ", obtenerValorNodoDoble(nodo));
        nodo = obtenerSiguienteNodoDoble(nodo);
    } while (nodo != lista->acceso);
    printf("(vuelve al %d)\n", obtenerValorNodoDoble(lista->acceso));
}
