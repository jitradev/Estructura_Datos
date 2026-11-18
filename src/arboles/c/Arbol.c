#include "Arbol.h"

#include <stdio.h>
#include <stdlib.h>


struct Arbol {
    Nodo* raiz;
};

Arbol* crearArbol() {
    Arbol *arbol = malloc(sizeof(Arbol));
    if (arbol == NULL) {
        return NULL;
    }
    arbol->raiz = NULL;
    return arbol;
}

// ============================== Recorridos

// Raíz, subárbol izquierdo y subárbol derecho
void preOrden(Nodo* raiz) {
    if (raiz == NULL) return;
    printf("%d ", obtenerValor(raiz));
    preOrden(obtenerIzquierda(raiz));
    preOrden(obtenerDerecha(raiz));
}

// Subárbol izquierdo, raíz y subárbol derecho (en un ABB, de menor a mayor)
void inOrden(Nodo* raiz) {
    if (raiz == NULL) return;
    inOrden(obtenerIzquierda(raiz));
    printf("%d ", obtenerValor(raiz));
    inOrden(obtenerDerecha(raiz));
}

// Subárbol izquierdo, subárbol derecho y raíz
void postOrden(Nodo* raiz) {
    if (raiz == NULL) return;
    postOrden(obtenerIzquierda(raiz));
    postOrden(obtenerDerecha(raiz));
    printf("%d ", obtenerValor(raiz));
}

// ============================== Consultas de un árbol binario

int contarNodos(Nodo* raiz) {
    if (raiz == NULL) return 0;
    return 1 + contarNodos(obtenerIzquierda(raiz)) + contarNodos(obtenerDerecha(raiz));
}

int contarHojas(Nodo* raiz) {
    if (raiz == NULL) return 0;
    if (obtenerIzquierda(raiz) == NULL && obtenerDerecha(raiz) == NULL) return 1;
    return contarHojas(obtenerIzquierda(raiz)) + contarHojas(obtenerDerecha(raiz));
}

// Niveles del camino más largo: el árbol vacío tiene altura 0 y una hoja, 1
int altura(Nodo* raiz) {
    if (raiz == NULL) return 0;
    int izq = altura(obtenerIzquierda(raiz));
    int der = altura(obtenerDerecha(raiz));
    if (izq > der) return izq + 1;
    return der + 1;
}

// ============================== Árbol binario de búsqueda

// Devuelve 1 si el valor está en el árbol y 0 si no
int buscar(Nodo* raiz, int valor) {
    if (raiz == NULL) return 0;
    if (valor == obtenerValor(raiz)) return 1;
    if (valor < obtenerValor(raiz)) return buscar(obtenerIzquierda(raiz), valor);
    return buscar(obtenerDerecha(raiz), valor);
}

// El menor está bajando siempre por la izquierda
Nodo* minimo(Nodo* raiz) {
    if (raiz == NULL) return NULL;
    while (obtenerIzquierda(raiz) != NULL) {
        raiz = obtenerIzquierda(raiz);
    }
    return raiz;
}

// El mayor está bajando siempre por la derecha
Nodo* maximo(Nodo* raiz) {
    if (raiz == NULL) return NULL;
    while (obtenerDerecha(raiz) != NULL) {
        raiz = obtenerDerecha(raiz);
    }
    return raiz;
}

// Inserta en el subárbol y devuelve su raíz, que solo cambia si estaba vacío
Nodo* insertarNodo(Nodo* raiz, int valor) {
    if (raiz == NULL) return crearNodo(valor);
    if (valor < obtenerValor(raiz)) {
        establecerIzquierda(raiz, insertarNodo(obtenerIzquierda(raiz), valor));
    } else if (valor > obtenerValor(raiz)) {
        establecerDerecha(raiz, insertarNodo(obtenerDerecha(raiz), valor));
    }
    return raiz;
}

// Devuelve 0 si el árbol no existe o el valor ya estaba (no se repiten)
int insertar(Arbol* arbol, int valor) {
    if (arbol == NULL || buscar(arbol->raiz, valor)) return 0;
    arbol->raiz = insertarNodo(arbol->raiz, valor);
    return 1;
}

// Quita el valor del subárbol y devuelve su nueva raíz
Nodo* eliminarNodo(Nodo* raiz, int valor) {
    if (raiz == NULL) return NULL;
    if (valor < obtenerValor(raiz)) {
        establecerIzquierda(raiz, eliminarNodo(obtenerIzquierda(raiz), valor));
        return raiz;
    }
    if (valor > obtenerValor(raiz)) {
        establecerDerecha(raiz, eliminarNodo(obtenerDerecha(raiz), valor));
        return raiz;
    }
    // Es este nodo. Con un hijo o ninguno, el hijo ocupa su sitio
    if (obtenerIzquierda(raiz) == NULL) {
        Nodo* hijo = obtenerDerecha(raiz);
        liberarNodo(raiz);
        return hijo;
    }
    if (obtenerDerecha(raiz) == NULL) {
        Nodo* hijo = obtenerIzquierda(raiz);
        liberarNodo(raiz);
        return hijo;
    }
    // Con dos hijos: se copia el sucesor (el menor de la derecha) y se borra ese
    Nodo* sucesor = minimo(obtenerDerecha(raiz));
    establecerValor(raiz, obtenerValor(sucesor));
    establecerDerecha(raiz, eliminarNodo(obtenerDerecha(raiz), obtenerValor(sucesor)));
    return raiz;
}

// Devuelve 0 si el árbol no existe o el valor no estaba
int eliminar(Arbol* arbol, int valor) {
    if (arbol == NULL || !buscar(arbol->raiz, valor)) return 0;
    arbol->raiz = eliminarNodo(arbol->raiz, valor);
    return 1;
}

// ============================== Liberar

// En postorden: primero los hijos y después el padre
void liberarNodos(Nodo* raiz) {
    if (raiz == NULL) return;
    liberarNodos(obtenerIzquierda(raiz));
    liberarNodos(obtenerDerecha(raiz));
    liberarNodo(raiz);
}

int liberarArbol(Arbol* arbol) {
    if (arbol == NULL) return 0;
    liberarNodos(arbol->raiz);
    free(arbol);
    return 1;
}
