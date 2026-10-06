#include "ListaCircular.h"

#include <stdio.h>
#include <stdlib.h>

struct ListaCircular {
    Nodo* acceso;   // el ÚLTIMO nodo; el primero es su siguiente. NULL si está vacía
};

// ==================== Auxiliares (no están en el .h) ====================
// Solo se usan dentro de este archivo. Llevan el sufijo ListaCircular para no chocar
// con las de las otras listas.

// Devuelve el primer nodo (el siguiente del último). La lista no puede estar vacía.
Nodo* primeroListaCircular(ListaCircular* lista) {
    return obtenerSiguiente(lista->acceso);
}

// Engancha "nodo" justo detrás de "anterior". Es la única inserción de verdad:
// principio, final y en medio la reutilizan; solo cambia si se mueve el acceso.
void enlazarTrasListaCircular(Nodo* anterior, Nodo* nodo) {
    asignarSiguiente(nodo, obtenerSiguiente(anterior));     // 1: el nuevo mira al resto
    asignarSiguiente(anterior, nodo);                       // 2: y el anterior mira al nuevo
}

// Quita "muerto" (que va justo detrás de "anterior") y lo libera,
// manteniendo el acceso correcto.
int desenlazarListaCircular(ListaCircular* lista, Nodo* anterior, Nodo* muerto) {
    if (anterior == muerto) {
        lista->acceso = NULL;                   // era el único: la lista queda vacía
    } else {
        asignarSiguiente(anterior, obtenerSiguiente(muerto));   // 1: se le salta desde fuera
        if (muerto == lista->acceso) {
            lista->acceso = anterior;           // borrábamos el último: el acceso retrocede
        }
    }
    return borrarNodo(muerto);                  // 2: y ahora sí se libera
}

// ==================== Creación ====================

ListaCircular* crearListaCircular(void) {
    ListaCircular* lista = malloc(sizeof(ListaCircular));
    if (lista == NULL) {
        return NULL;
    }
    lista->acceso = NULL;
    return lista;
}

// ==================== Consulta ====================

int obtenerPosicionListaCircular(ListaCircular* lista, int valor) {
    if (estaVacioListaCircular(lista)) {
        return -1;
    }
    // Aquí sí se empieza en el primero (el siguiente del último), porque la posición
    // se cuenta desde él.
    Nodo* nodo = primeroListaCircular(lista);
    int posicion = 0;
    // do-while: el primer nodo hay que mirarlo antes de comprobar si hemos dado la vuelta
    do {
        if (obtenerValor(nodo) == valor) {
            return posicion;
        }
        posicion++;
        nodo = obtenerSiguiente(nodo);
    } while (nodo != primeroListaCircular(lista));  // he vuelto al primero: vuelta completa
    return -1;
}

Nodo* obtenerNodoListaCircular(ListaCircular* lista, int posicion) {
    if (posicion < 0 || posicion >= obtenerLongitudListaCircular(lista)) {
        return NULL;
    }
    Nodo* nodo = primeroListaCircular(lista);
    for (int i = 0; i < posicion; i++) {
        nodo = obtenerSiguiente(nodo);
    }
    return nodo;
}

int obtenerLongitudListaCircular(ListaCircular* lista) {
    if (estaVacioListaCircular(lista)) {
        return 0;
    }
    // Para contar o comprobar si está un nodo el orden da igual, así que se empieza
    // directamente en el acceso (el último) y se para al volver a él.
    int longitud = 0;
    Nodo* nodo = lista->acceso;
    do {
        longitud++;
        nodo = obtenerSiguiente(nodo);
    } while (nodo != lista->acceso);
    return longitud;
}

int estaVacioListaCircular(ListaCircular* lista) {
    return lista->acceso == NULL;
}

int existeNodoListaCircular(ListaCircular* lista, Nodo* nodo) {
    if (estaVacioListaCircular(lista)) {
        return 0;
    }
    Nodo* recorrer = lista->acceso;             // el orden da igual: se empieza en el acceso
    do {
        if (recorrer == nodo) {
            return 1;
        }
        recorrer = obtenerSiguiente(recorrer);
    } while (recorrer != lista->acceso);
    return 0;
}

int existeValorListaCircular(ListaCircular* lista, int valor) {
    return obtenerPosicionListaCircular(lista, valor) != -1;
}

// ==================== Inserción ====================
// Detrás del último es delante del primero: lo único que cambia es si se mueve el acceso.

int insertarPrincipioListaCircular(ListaCircular* lista, Nodo* nodo) {
    if (nodo == NULL) {
        return 0;
    }
    if (estaVacioListaCircular(lista)) {
        asignarSiguiente(nodo, nodo);           // el primer nodo se apunta a sí mismo
        lista->acceso = nodo;
        return 1;
    }
    enlazarTrasListaCircular(lista->acceso, nodo);  // detrás del último, sin mover el acceso
    return 1;
}

int insertarListaCircular(ListaCircular* lista, Nodo* nodo, int posicion) {
    if (nodo == NULL || posicion < 0) {
        return 0;
    }
    if (posicion == 0) {
        return insertarPrincipioListaCircular(lista, nodo);
    }
    if (posicion >= obtenerLongitudListaCircular(lista)) {
        // Al final: se mete en el mismo sitio que al principio (detrás del último)...
        insertarPrincipioListaCircular(lista, nodo);
        lista->acceso = nodo;                   // ...y además pasa a ser el último
        return 1;
    }
    enlazarTrasListaCircular(obtenerNodoListaCircular(lista, posicion - 1), nodo);
    return 1;
}

int insertarTrasListaCircular(ListaCircular* lista, Nodo* nodo, int valor) {
    if (nodo == NULL || estaVacioListaCircular(lista)) {
        return 0;
    }
    Nodo* anterior = primeroListaCircular(lista);
    do {
        if (obtenerValor(anterior) == valor) {
            enlazarTrasListaCircular(anterior, nodo);
            if (anterior == lista->acceso) {
                lista->acceso = nodo;           // era el último: ahora lo es el nuevo
            }
            return 1;
        }
        anterior = obtenerSiguiente(anterior);
    } while (anterior != primeroListaCircular(lista));
    return 0;
}

// ==================== Eliminación ====================
// Hace falta el anterior, y se consigue dando la vuelta: se empieza en el último,
// cuyo siguiente es el primero, así que se revisan todos los nodos.
// Los casos límite (borrar el único nodo o el último) los resuelve desenlazarListaCircular.

int eliminarNodoPosicionListaCircular(ListaCircular* lista, int posicion) {
    if (posicion < 0 || posicion >= obtenerLongitudListaCircular(lista)) {
        return 0;
    }
    // El anterior del primero es el último (el acceso)
    Nodo* anterior = (posicion == 0)
                     ? lista->acceso
                     : obtenerNodoListaCircular(lista, posicion - 1);
    return desenlazarListaCircular(lista, anterior, obtenerSiguiente(anterior));
}

int eliminarPorReferenciaListaCircular(ListaCircular* lista, Nodo* nodo) {
    if (estaVacioListaCircular(lista) || nodo == NULL) {
        return 0;
    }
    // Como en la lista simple, referencia apunta al ENLACE que lleva al candidato
    // (el siguiente de "anterior"), y borrar es reescribir ese enlace: *referencia = ...
    //
    // Diferencia con la lista simple: allí el puntero doble servía para no tratar la
    // cabeza como caso aparte. Aquí ese caso no existe, porque en la circular todos los
    // nodos tienen anterior (el del primero es el último). Lo que sí hace falta es
    // recordar el nodo "anterior", porque si se borra el último el acceso tiene que
    // retroceder hasta él, y desde un Nodo** no se puede llegar al nodo que lo contiene.
    Nodo* anterior = lista->acceso;             // se empieza en el último: su enlace lleva al primero
    do {
        Nodo** referencia = obtenerReferenciaSiguiente(anterior);
        if (*referencia == nodo) {
            if (anterior == nodo) {
                lista->acceso = NULL;           // era el único (es su propio anterior)
            } else {
                *referencia = obtenerSiguiente(nodo);   // 1: se le salta desde fuera
                if (nodo == lista->acceso) {
                    lista->acceso = anterior;   // borrábamos el último: el acceso retrocede
                }
            }
            return borrarNodo(nodo);            // 2: y ahora sí se libera
        }
        anterior = *referencia;                 // avanza al siguiente enlace
    } while (anterior != lista->acceso);        // ha vuelto al último: vuelta completa
    return 0;
}

int eliminarNodoListaCircular(ListaCircular* lista, Nodo* nodo) {
    if (estaVacioListaCircular(lista) || nodo == NULL) {
        return 0;
    }
    Nodo* anterior = lista->acceso;
    do {
        if (obtenerSiguiente(anterior) == nodo) {
            return desenlazarListaCircular(lista, anterior, nodo);
        }
        anterior = obtenerSiguiente(anterior);
    } while (anterior != lista->acceso);
    return 0;
}

int eliminarPorValorListaCircular(ListaCircular* lista, int valor) {
    if (estaVacioListaCircular(lista)) {
        return 0;
    }
    Nodo* anterior = lista->acceso;
    do {
        Nodo* actual = obtenerSiguiente(anterior);
        if (obtenerValor(actual) == valor) {
            return desenlazarListaCircular(lista, anterior, actual);
        }
        anterior = actual;
    } while (anterior != lista->acceso);
    return 0;
}

void eliminarListaCircular(ListaCircular* lista) {
    if (!estaVacioListaCircular(lista)) {
        // Se rompe el círculo (el último pasa a apuntar a NULL) y queda una
        // lista simple que se libera igual que en Lista.c
        Nodo* nodo = primeroListaCircular(lista);
        asignarSiguiente(lista->acceso, NULL);
        while (nodo != NULL) {
            Nodo* siguiente = obtenerSiguiente(nodo);
            borrarNodo(nodo);
            nodo = siguiente;
        }
    }
    free(lista);
}

// ==================== Salida ====================

void mostrarListaCircular(ListaCircular* lista) {
    printf("Lista circular: ");
    if (estaVacioListaCircular(lista)) {
        printf("(vacia)\n");
        return;
    }
    Nodo* nodo = primeroListaCircular(lista);
    do {
        printf("%d -> ", obtenerValor(nodo));
        nodo = obtenerSiguiente(nodo);
    } while (nodo != primeroListaCircular(lista));
    printf("(vuelve al %d)\n", obtenerValor(primeroListaCircular(lista)));
}
