---
title: "Signals en JavaScript: Por Qué Todos los Frameworks los Están Adoptando (Y Qué Significa para React)"
source_url: "https://dev.to/pockit_tools/signals-en-javascript-por-que-todos-los-frameworks-los-estan-adoptando-y-que-significa-para-react-437h"
crawled_at: "2026-08-07T09:30:14.704Z"
---

Algo inusual está pasando en el mundo frontend. Angular adoptó Signals. Svelte reemplazó su modelo de reactividad con Runes. Solid.js fue construido sobre ellos desde el primer día. El sistema de reactividad de Vue siempre fue similar a signals por debajo. Qwik, Preact, e incluso frameworks legacy como Ember — todos convergen hacia la misma primitiva.

Mientras tanto, React — el framework que domina el mercado — está yendo deliberadamente en la dirección opuesta, apostando todo a un compilador para solucionar los problemas de rendimiento que los signals resuelven por diseño.

La propuesta TC39 Signals, que ya avanza en el proceso de estandarización de JavaScript, busca incorporar esta primitiva reactiva directamente en el lenguaje. Si tiene éxito, los signals no serán solo una funcionalidad de framework — serán parte de JavaScript, como `Promise` o `Array`.

Este es el cambio arquitectónico más significativo en el desarrollo frontend desde que se introdujo el Virtual DOM hace más de una década. Vamos a analizar qué está pasando realmente, por qué importa y qué significa para el código que escribes hoy.

---

## [](#qu%C3%A9-son-los-signals-exactamente)¿Qué Son los Signals, Exactamente?

Si quitamos las APIs específicas de cada framework, un signal es un concepto engañosamente simple: **un contenedor reactivo para un valor que notifica automáticamente a sus dependientes cuando cambia**.

Pensalo como una variable observable con tracking automático de dependencias. Cuando leés un signal dentro de una computación, el runtime recuerda esa dependencia. Cuando el valor del signal cambia, solo las computaciones que realmente dependen de él se re-ejecutan.  

```
// Crear un valor reactivo
const count = signal(0);

// Computación derivada — trackea dependencias automáticamente
const doubled = computed(() => count.value * 2);

// Efecto secundario — se re-ejecuta cuando las dependencias cambian
effect(() => {
  console.log(`Count: ${count.value}, doubled: ${doubled.value}`);
});

// Solo se re-ejecutan las computaciones que dependen de `count`
count.value = 5;
// Consola: "Count: 5, doubled: 10"
```

 

No hay array de dependencias. No hay gestión manual de suscripciones. No hay algoritmo de diffing. El runtime sabe exactamente qué depende de qué porque observó el grafo de dependencias en tiempo de ejecución.

### [](#las-tres-primitivas)Las Tres Primitivas

Toda implementación de signals, sin importar el framework, está construida sobre tres primitivas:

**1\. Signal (Estado)** — Un contenedor reactivo que mantiene un único valor.  

```
const name = signal("Alice");
console.log(name.value); // "Alice"
name.value = "Bob";      // Notifica a los dependientes
```

 

**2\. Computed (Estado Derivado)** — Un valor derivado de uno o más signals. Es lazy: solo recalcula cuando se lee, y solo si una dependencia cambió.  

```
const firstName = signal("Alice");
const lastName = signal("Smith");

const fullName = computed(() => `${firstName.value} ${lastName.value}`);
// fullName no recalcula hasta que lo leas Y una dependencia haya cambiado
```

 

**3\. Effect (Efectos Secundarios)** — Una función que se ejecuta cuando sus dependencias trackeadas cambian. Acá es donde hacés updates del DOM, requests de red o logging.  

```
effect(() => {
  document.title = fullName.value; // Se re-ejecuta solo cuando fullName cambia
});
```

 

Este modelo de tres primitivas es la base. Ahora veamos qué tan profundo llega esto.

---

## [](#c%C3%B3mo-funcionan-los-signals-internamente)Cómo Funcionan los Signals Internamente

La magia de los signals no está en la API — está en el **tracking automático de dependencias**. Vamos a construir un runtime simplificado de signals desde cero para entender la mecánica interna.

### [](#el-grafo-de-dependencias)El Grafo de Dependencias

En su núcleo, un runtime de signals mantiene un grafo acíclico dirigido (DAG) de dependencias:  

```
┌─────────┐     ┌─────────┐
│ signal A │────▶│computed C│────▶ effect E
└─────────┘     └─────────┘
┌─────────┐        ▲
│ signal B │────────┘
└─────────┘
```

 

Cuando Signal A cambia, el runtime recorre el grafo y solo re-ejecuta Computed C y Effect E. Los otros dependientes de Signal B (si existen) quedan intactos.

### [](#una-implementaci%C3%B3n-m%C3%ADnima)Una Implementación Mínima

Acá hay una implementación funcional de signals en ~50 líneas de JavaScript:  

```
let currentObserver = null;

function signal(initialValue) {
  let value = initialValue;
  const subscribers = new Set();

  return {
    get value() {
      // Track: si alguien está observando, registrar este signal
      if (currentObserver) {
        subscribers.add(currentObserver);
      }
      return value;
    },
    set value(newValue) {
      if (newValue === value) return; // Skip si no cambió
      value = newValue;
      // Notificar: re-ejecutar todos los suscriptores
      for (const subscriber of subscribers) {
        subscriber();
      }
    }
  };
}

function computed(fn) {
  let cachedValue;
  let dirty = true;

  const computation = () => { dirty = true; };

  return {
    get value() {
      if (dirty) {
        const prevObserver = currentObserver;
        currentObserver = computation;
        cachedValue = fn();
        currentObserver = prevObserver;
        dirty = false;
      }
      return cachedValue;
    }
  };
}

function effect(fn) {
  const execute = () => {
    const prevObserver = currentObserver;
    currentObserver = execute;
    fn();
    currentObserver = prevObserver;
  };
  execute(); // Ejecutar inmediatamente para establecer dependencias
}
```

 

La técnica clave es el **stack global de observers** (`currentObserver`). Cuando un computed o effect se ejecuta, se establece como el observer actual. Cualquier signal que se lea durante esa ejecución agrega automáticamente al observer a su conjunto de suscriptores. Por eso nunca necesitás declarar dependencias manualmente.

### [](#optimizaciones-de-producci%C3%B3n)Optimizaciones de Producción

Las implementaciones reales agregan varias optimizaciones críticas:

**1\. Evaluación Push-Pull** — En vez de re-ejecutar todos los suscriptores cuando un signal cambia, las implementaciones modernas marcan las computaciones downstream como "dirty" (push) y solo recalculan cuando se lee su valor (pull).

**2\. Ejecución Libre de Glitches** — Si Signal A y Signal B cambian en la misma microtarea, un computed que depende de ambos debería ejecutarse una sola vez, no dos.  

```
const a = signal(1);
const b = signal(2);
const sum = computed(() => a.value + b.value);

batch(() => {
  a.value = 10;
  b.value = 20;
});
// sum solo se ejecuta una vez con (10, 20)
```

 

**3\. Limpieza Automática** — Cuando un effect se re-ejecuta, sus suscripciones previas se limpian automáticamente. Adiós memory leaks.

**4\. Checks de Igualdad** — Los signals omiten notificaciones si el nuevo valor es idéntico al anterior (usando `Object.is` por defecto).

---

## [](#la-propuesta-tc39-signals)La Propuesta TC39 Signals

Lo más emocionante no está pasando dentro de ningún framework — está pasando a nivel del lenguaje. La propuesta TC39 Signals busca estandarizar la primitiva reactiva directamente en JavaScript.

### [](#por-qu%C3%A9-estandarizar)¿Por Qué Estandarizar?

Cada framework tiene su propia implementación de signals. Los Angular Signals no pueden interoperar con `createSignal` de Solid. Una librería de date picker hecha con Preact Signals no funciona en una app Vue sin wrappers.

La propuesta TC39 resuelve esto con una API estándar `Signal` sobre la que todos los frameworks pueden construir:  

```
// API de la Propuesta TC39 (Stage 1, sujeto a cambios)
const counter = new Signal.State(0);
const isEven = new Signal.Computed(() => (counter.get() & 1) === 0);

// Los frameworks envuelven esto con sus propias APIs ergonómicas
// pero el grafo reactivo subyacente es compartido
```

 

### [](#lo-que-proporciona-la-propuesta)Lo Que Proporciona la Propuesta

La propuesta se enfoca en el **algoritmo del grafo reactivo**, no en la capa de renderizado:

-   `Signal.State` — Valor reactivo de lectura/escritura
-   `Signal.Computed` — Valor reactivo derivado (lazy, cacheado)
-   `Signal.subtle.Watcher` — API de bajo nivel para integración con frameworks

Dato clave: la propuesta **no incluye `effect()`**. Los efectos son específicos del framework — cómo actualizás el DOM, programás renders o agrupás cambios queda en manos de cada framework. El estándar solo provee las primitivas del grafo reactivo.

### [](#la-visi%C3%B3n-de-interoperabilidad)La Visión de Interoperabilidad

Imaginá un futuro donde:

-   Una librería de gráficos usa `Signal.State` internamente
-   La usás en una app Angular con Angular Signals (construido sobre `Signal.State`)
-   Tu colega usa la misma librería en una app Solid
-   La reactividad fluye sin problemas porque el grafo es compartido

Ese es el sueño — reactividad de estado compartida en todo el ecosistema JavaScript.

---

## [](#el-panorama-de-los-frameworks-qui%C3%A9n-usa-signals-y-c%C3%B3mo)El Panorama de los Frameworks: Quién Usa Signals y Cómo

### [](#angular-signals-v17)Angular Signals (v17+)

La adopción de signals por parte de Angular fue un evento sísmico. El framework famoso por RxJS, Zones y change detection reescribió su modelo de reactividad:  

```
import { signal, computed, effect } from '@angular/core';

@Component({
  template: `
    <h1>{{ fullName() }}</h1>
    <button (click)="updateName()">Cambiar Nombre</button>
  `
})
export class UserComponent {
  firstName = signal('Alice');
  lastName = signal('Smith');

  fullName = computed(() => `${this.firstName()} ${this.lastName()}`);

  logger = effect(() => {
    console.log(`Nombre cambió a: ${this.fullName()}`);
  });

  updateName() {
    this.firstName.set('Bob');
  }
}
```

 

El cambio arquitectónico clave: Angular ahora puede saltarse Zone.js completamente para change detection. En vez de hacer dirty-checking del árbol completo de componentes en cada evento, Angular solo actualiza los nodos DOM específicos vinculados a signals que cambiaron. Resultado: **renderizado 30-50% más rápido** en benchmarks reales.

### [](#solidjs-signals-desde-el-d%C3%ADa-uno)Solid.js — Signals Desde el Día Uno

Solid.js demostró que los signals podían impulsar un framework UI de nivel producción:  

```
import { createSignal, createMemo, createEffect } from "solid-js";

function Counter() {
  const [count, setCount] = createSignal(0);
  const doubled = createMemo(() => count() * 2);

  createEffect(() => {
    console.log(`Count: ${count()}, Doubled: ${doubled()}`);
  });

  return (
    <button onClick={() => setCount(c => c + 1)}>
      {count()} × 2 = {doubled()}
    </button>
  );
}
```

 

La diferencia crítica con React: **Solid no re-ejecuta componentes**. La función `Counter` se ejecuta exactamente una vez. El JSX se compila a instrucciones de actualización DOM granulares. Cuando `count` cambia, solo los nodos de texto que muestran `count()` y `doubled()` se actualizan — la función del componente nunca se re-ejecuta.

Sin diffing de Virtual DOM, sin re-renders, sin necesidad de memoización. Nunca.

### [](#svelte-runes-v5)Svelte Runes (v5)

Svelte 5 reemplazó su reactividad anterior (la sintaxis de etiqueta `$:`) con Runes — esencialmente signals en tiempo de compilación:  

```
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);

  $effect(() => {
    console.log(`Count: ${count}, Doubled: ${doubled}`);
  });
</script>

<button onclick={() => count++}>
  {count} × 2 = {doubled}
</button>
```

 

La elegancia de Runes está en que parecen variables normales. El compilador transforma `$state`, `$derived` y `$effect` en primitivas signal internas, pero la experiencia del desarrollador se siente como escribir JavaScript plano.

### [](#la-reactividad-de-vue-composition-api)La Reactividad de Vue (Composition API)

Vue ha usado un sistema de reactividad similar a signals desde la Composition API de Vue 3:  

```
<script setup>
import { ref, computed, watchEffect } from 'vue';

const count = ref(0);
const doubled = computed(() => count.value * 2);

watchEffect(() => {
  console.log(`Count: ${count.value}, Doubled: ${doubled.value}`);
});
</script>

<template>
  <button @click="count++">
    {{ count }} × 2 = {{ doubled }}
  </button>
</template>
```

 

El `ref` de Vue es Signal. `computed` es Computed. `watchEffect` es Effect. Los nombres son diferentes, pero el grafo reactivo subyacente es arquitectónicamente idéntico. Vue estaba haciendo signals antes de que los signals fueran cool.

### [](#preact-signals)Preact Signals

Preact tomó un enfoque único al agregar signals como una librería compañera que se integra con el Virtual DOM:  

```
import { signal, computed } from "@preact/signals";

const count = signal(0);
const doubled = computed(() => count.value * 2);

function Counter() {
  return (
    <button onClick={() => count.value++}>
      {count} × 2 = {doubled}
    </button>
  );
}
```

 

Lo especial de Preact Signals: podés pasar un signal directamente al JSX (`{count}` en vez de `{count.value}`), y Preact lo suscribe a nivel DOM, salteando el diff del Virtual DOM para ese nodo. Rendimiento cercano a Solid manteniendo el modelo familiar de componentes tipo React.

---

## [](#el-camino-divergente-de-react-hooks-compilador-vs-signals)El Camino Divergente de React: Hooks + Compilador vs. Signals

Acá es donde la cosa se pone controversial. Todos los frameworks principales convergen en signals, pero React — el más usado — eligió explícitamente no adoptarlos. Entender por qué revela diferencias filosóficas fundamentales.

### [](#el-argumento-de-react-contra-los-signals)El Argumento de React Contra los Signals

**1\. Flujo de Datos Top-Down** — React está diseñado sobre la idea de que los componentes son funciones de sus props y estado. Signals rompen este modelo porque actualizan nodos DOM directamente, sin pasar por la función del componente.

**2\. Facilidad de Debugging** — En el modelo de React, podés poner un breakpoint en cualquier componente y ver el render completo en cada cambio de estado. Con signals, las actualizaciones pasan de forma granular y no hay "ciclo de render" que inspeccionar.

**3\. La Apuesta por el Compilador** — La posición de React es que el compilador puede entregar rendimiento nivel signals sin cambiar el modelo de programación.

### [](#los-contraargumentos)Los Contra-Argumentos

**1\. Overhead Fundamental** — Incluso con memoización perfecta, React sigue re-ejecutando funciones de componente y haciendo diff de árboles Virtual DOM. Signals se saltean ambos pasos.  

```
React (con compilador):
  Cambio de estado → Re-ejecutar función → Diff vDOM → Patch DOM

Signals:
  Cambio de estado → Patch DOM directamente
```

 

**2\. Costo de Runtime** — La memoización del React Compiler agrega overhead de runtime (lookups de cache, checks de igualdad). Los signals solo trabajan cuando los valores realmente cambian.

**3\. Las "Reglas de React"** — El compilador requiere que el código siga las "Reglas de React" (componentes puros, sin mutaciones durante render). Las violaciones causan bugs de correctitud silenciosos. Los signals no tienen esas restricciones.

**4\. Fragmentación del Ecosistema** — Si TC39 estandariza signals, todos los frameworks excepto React compartirán una primitiva reactiva común.

### [](#comparaci%C3%B3n-de-rendimiento)Comparación de Rendimiento

Miremos números aproximados basados en los resultados públicos del js-framework-benchmark para una tabla de 10,000 filas:

| Operación | React 19 + Compiler | Solid.js (Signals) | Angular (Signals) | Svelte 5 (Runes) |
| --- | --- | --- | --- | --- |
| Crear 10k filas | ~420ms | ~190ms | ~230ms | ~200ms |
| Actualizar cada 10 filas | ~80ms | ~18ms | ~25ms | ~20ms |
| Intercambiar dos filas | ~45ms | ~12ms | ~15ms | ~14ms |
| Seleccionar fila | ~8ms | ~2ms | ~3ms | ~2ms |
| Eliminar fila | ~38ms | ~6ms | ~9ms | ~7ms |
| Memoria (post-create) | ~9 MB | ~4 MB | ~4.5 MB | ~3.5 MB |

_Nota: Estos son valores aproximados basados en tendencias de benchmarks públicos. Los números reales varían según hardware, navegador y versión del framework. Consultá [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) para resultados actualizados._

El patrón es consistente: los frameworks basados en signals superan a la abordaje del compilador de React por aproximadamente 2-4x en la mayoría de las operaciones. La diferencia de memoria es aún más dramática porque los signals no mantienen un árbol Virtual DOM.

---

## [](#migraci%C3%B3n-pr%C3%A1ctica-agregando-signals-a-tu-stack)Migración Práctica: Agregando Signals a Tu Stack

### [](#si-est%C3%A1s-en-angular)Si Estás en Angular

Ya estás ahí. Angular 17+ signals están listos para producción. Empezá a migrar desde patrones pesados en RxJS:  

```
// Antes: RxJS Observables
@Component({...})
export class UserComponent implements OnInit, OnDestroy {
  user$!: Observable<User>;
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.user$ = this.userService.getUser().pipe(
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// Después: Angular Signals + resource API
@Component({...})
export class UserComponent {
  userId = input.required<string>();
  user = resource({
    request: () => this.userId(),
    loader: ({ request: id }) => this.userService.getUser(id)
  });
}
```

 

Sin gestionar suscripciones. Sin patrones `takeUntil`. Sin cleanup en `OnDestroy`.

### [](#si-est%C3%A1s-en-react-usando-preact-signals)Si Estás en React (Usando Preact Signals)

Podés usar signals en React hoy con `@preact/signals-react`:  

```
import { signal, computed } from "@preact/signals-react";

const count = signal(0);
const doubled = computed(() => count.value * 2);

function Counter() {
  return (
    <div>
      <p>{count.value} × 2 = {doubled.value}</p>
      <button onClick={() => count.value++}>Incrementar</button>
    </div>
  );
}
```

 

Advertencia: es una integración de terceros. Funciona enganchándose al ciclo de render de React, así que no obtenés los beneficios completos de performance de signals nativos. Pero sí obtenés la ergonomía del tracking automático de dependencias sin `useMemo`/`useCallback` manual.

### [](#si-empez%C3%A1s-de-cero)Si Empezás de Cero

Si estás eligiendo un framework para un proyecto nuevo en 2026 y el rendimiento es crítico:

1.  **Solid.js** — Máximo rendimiento, bundle más pequeño, experiencia signals más "pura"
2.  **Svelte 5** — Mejor experiencia de desarrollo (Runes parecen JS normal), excelente rendimiento
3.  **Angular** — Mejor opción para equipos enterprise grandes (TypeScript nativo, tooling integral)
4.  **Vue** — Gran balance entre rendimiento y madurez del ecosistema

---

## [](#ejemplo-real-validaci%C3%B3n-reactiva-de-formularios)Ejemplo Real: Validación Reactiva de Formularios

Construyamos algo práctico para ver los signals en acción.

### [](#vanilla-signals-estilo-propuesta-tc39)Vanilla Signals (Estilo Propuesta TC39)

```
const email = new Signal.State("");
const password = new Signal.State("");

const emailError = new Signal.Computed(() => {
  const value = email.get();
  if (!value) return "El email es requerido";
  if (!value.includes("@")) return "Formato de email inválido";
  return null;
});

const passwordStrength = new Signal.Computed(() => {
  const value = password.get();
  if (value.length === 0) return "empty";
  if (value.length < 8) return "weak";
  if (/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%])/.test(value)) return "strong";
  return "medium";
});

const isFormValid = new Signal.Computed(() => {
  return emailError.get() === null
    && passwordStrength.get() !== "weak"
    && passwordStrength.get() !== "empty";
});
```

 

### [](#implementaci%C3%B3n-con-solidjs)Implementación con Solid.js

```
import { createSignal, createMemo, Show } from "solid-js";

function SignupForm() {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");

  const emailError = createMemo(() => {
    const value = email();
    if (!value) return "El email es requerido";
    if (!value.includes("@")) return "Formato de email inválido";
    return null;
  });

  const passwordStrength = createMemo(() => {
    const value = password();
    if (value.length === 0) return "empty";
    if (value.length < 8) return "weak";
    if (/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%])/.test(value)) return "strong";
    return "medium";
  });

  const isValid = createMemo(() =>
    emailError() === null && !["weak", "empty"].includes(passwordStrength())
  );

  return (
    <form>
      <input
        type="email"
        value={email()}
        onInput={(e) => setEmail(e.target.value)}
        classList={{ error: !!emailError() }}
      />
      <Show when={emailError()}>
        <span class="error">{emailError()}</span>
      </Show>

      <input
        type="password"
        value={password()}
        onInput={(e) => setPassword(e.target.value)}
      />
      <div class={`strength-${passwordStrength()}`}>
        Fortaleza: {passwordStrength()}
      </div>

      <button disabled={!isValid()}>Registrarse</button>
    </form>
  );
}
```

 

Cuando el usuario escribe en el campo de email:

1.  Solo cambia el signal `email`
2.  Solo recalcula `emailError` (no `passwordStrength`)
3.  Solo recalcula `isValid`
4.  Solo se actualizan los nodos DOM vinculados a `emailError()` e `isValid()`

El input de password, el indicador de fortaleza y todos los demás nodos DOM quedan completamente intactos. En React, toda la función del componente se re-ejecutaría, todas las expresiones JSX se re-evaluarían, y React haría diff del subárbol Virtual DOM completo.

---

## [](#hacia-d%C3%B3nde-va-el-frontend)Hacia Dónde Va el Frontend

La convergencia hacia signals no es coincidencia. Varias fuerzas convergen:

### [](#1-el-techo-de-rendimiento-del-virtual-dom)1\. El Techo de Rendimiento del Virtual DOM

El diffing del Virtual DOM fue una idea brillante en 2013 cuando los motores JavaScript eran lentos. En 2026, los motores son extraordinariamente rápidos, y el overhead de "crear árbol virtual → diff → patch" se convirtió en el cuello de botella.

Los signals eliminan al intermediario. Cambio de estado → Actualización DOM. Sin paso de diffing.

### [](#2-el-auge-de-la-arquitectura-islands)2\. El Auge de la Arquitectura Islands

Astro, Qwik, e incluso Next.js (con RSC) se mueven hacia "islas" de interactividad en un mar de HTML estático. Los signals encajan naturalmente porque cada isla puede tener su propio grafo reactivo local sin afectar al resto de la página.

### [](#3-el-endgame-de-tc39)3\. El Endgame de TC39

Si `Signal.State` y `Signal.Computed` se vuelven parte del estándar JavaScript:

-   Todos los frameworks construidos sobre ellos interoperan automáticamente
-   Los motores del navegador pueden optimizar el grafo reactivo a nivel nativo
-   Librerías de terceros usan una primitiva reactiva universal

El fin de la era del "vendor lock-in" para manejo de estado.

---

## [](#conclusi%C3%B3n)Conclusión

El mundo frontend está atravesando una revolución de reactividad. Los signals han demostrado ser un modelo fundamentalmente más eficiente para el manejo de estado UI que el enfoque de diffing del Virtual DOM que React popularizó.

Todos los frameworks principales excepto React adoptaron signals. La propuesta TC39 trabaja en estandarizarlos en JavaScript mismo. Angular vio mejoras de renderizado del 30-50% post-migración. Solid.js entrega 2-4x el rendimiento de React en benchmarks estandarizados.

La apuesta de React por el compilador es audaz y puede reducir la brecha, pero no puede eliminar el overhead arquitectónico fundamental de re-ejecutar componentes y hacer diff de árboles virtuales. Ya sea que React eventualmente adopte signals, o logre demostrar que el enfoque del compilador es superior, la competencia está haciendo que todo el ecosistema sea mejor.

Sin importar qué framework uses hoy, entender signals ya no es opcional — es conocimiento fundamental. El grafo reactivo es el futuro del manejo de estado frontend, y ya está acá.

---

> 🚀 **Explore More:** This article is from the [Pockit Blog](https://pockit.tools/blog/javascript-signals-tc39-framework-reactivity-revolution-guide/).
> 
> If you found this helpful, check out [Pockit.tools](https://pockit.tools/json-formatter/). It’s a curated collection of offline-capable dev utilities. **[Available on Chrome Web Store](https://chromewebstore.google.com/detail/pockit-developer-tools-pd/lojcamfhllebjmcjmipecgecbeopookg)** for free.
