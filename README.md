# Dónde estuve

Mapa mundial interactivo: marcás los países que visitaste y ves en tiempo real
cuántos llevás, qué porcentaje del mundo es y cómo te comparás con el resto de la
gente.

Todo el roadmap original está construido. La app funciona entera sin backend: el
mapa, las estadísticas, el tema y la tarjeta compartible no necesitan cuenta. Lo
que agrega Supabase es guardar el progreso entre dispositivos, comparar con pares
y el ranking de amigos.

## Correr el proyecto

```bash
npm install
npm run dev
```

Al cambiar `world-atlas` o `world-countries`, regenerá la data derivada:

```bash
npm run build:data
```

Las subdivisiones salen de un dataset de 63 MB que no está en el repo. Si falta,
el script imprime el comando para bajarlo:

```bash
curl -L -o vendor/ne_10m_admin_1_states_provinces.json "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/10m/cultural/ne_10m_admin_1_states_provinces.json"
```

El generador procesa **todos** los países con al menos dos divisiones: son 214,
7 MB repartidos en un archivo por país que se pide solo al abrirlo. La etiqueta
("provincias", "estados", "prefecturas") sale del tipo de división dominante que
declara Natural Earth. `OVERRIDES` en el script solo se toca cuando hace falta
otra proyección o traducir nombres.

### Conectar Supabase (opcional)

Sin esto la app corre igual y el progreso queda en `localStorage`.

1. Crear un proyecto en Supabase.
2. Aplicar `supabase/migrations/0001_init.sql` y `0002_seed_country_averages.sql`.
3. Copiar `.env.example` a `.env.local` y completar URL y anon key.
4. En Supabase: habilitar el proveedor Google y agregar
   `https://TU-DOMINIO/auth/callback` a las redirect URLs.

## Cómo está armado

| Pieza | Dónde | Qué hace |
| --- | --- | --- |
| Metadata de países | `scripts/build-country-data.mjs` → `src/data/countries.ts` | ISO, nombre en español, continente y si suma al recuento de 195 |
| Metadata de subdivisiones | `scripts/build-subdivision-data.mjs` → `src/data/subdivisions.ts` | Estados y provincias por país, con su propio total |
| Comparación con pares | `src/components/PeerComparison.tsx` + `src/data/benchmarks.ts` | País de origen sin login y dato publicado de ese país |
| Geometría | `public/geo/` | TopoJSON servido como asset estático |
| Proyección y paths | `src/lib/geo.ts`, `src/lib/subdivisionGeo.ts` | Natural Earth 1 para el mundo, Albers USA para Estados Unidos |
| Mapa | `src/components/WorldMap.tsx` | Render, zoom, paneo, hover, teclado |
| Tema claro/oscuro | `src/lib/theme.ts` + `ThemeToggle.tsx` | Preferencia del sistema con override manual |
| Estadísticas y percentiles | `src/lib/stats.ts` | Total, % del mundo, % por continente, mensajes de gancho |
| Progreso | `src/lib/store.ts` | Zustand + localStorage, con réplica remota opcional |
| Tarjeta compartible | `src/lib/shareCard.ts` + `ShareCardDialog.tsx` | Canvas 1080x1920 y 1080x1080, Web Share API |
| Cuentas | `src/lib/supabase/`, `AccountSync.tsx`, `AuthDialog.tsx` | Google y mail, merge del progreso local al entrar |
| Social | `src/lib/peers.ts`, `AccountDialog.tsx` | Perfil, comparación con pares, referidos, ranking |
| Analítica | `src/lib/analytics.ts` | Embudo de eventos, sin proveedor atado |

### Decisiones que conviene conocer antes de tocar el código

- **El denominador es 195 y no depende del mapa.** Son los 193 miembros de la ONU
  más el Vaticano y Palestina. A 1:50m Natural Earth no dibuja a Tuvalu, y aun así
  el total sigue siendo 195. Lo mismo para Estados Unidos: 50 estados más DC, y
  los territorios se pueden marcar pero no cuentan.
- **La topología se sirve como archivo estático**, no importada al bundle. Son
  ~750 KB: dentro del bundle de JS bloquearían el primer render. `worldShapes.ts`
  la cachea a nivel de módulo para que el mapa y la tarjeta la compartan.
- **El zoom no pasa por React.** El transform se escribe directo en el `<g>`; meter
  eso en `useState` re-renderizaría 230 paths por frame. Lo mismo el tooltip que
  sigue al cursor.
- **Un tap con menos de 6 px de desplazamiento cuenta como click**, más que eso es
  un arrastre del mapa. Sin ese umbral, panear marca países sin querer.
- **Los dos temas comparten el mismo naranja de acento.** Lo único que cambia es
  `--accent-ink`, la variante para texto: sobre fondo claro el naranja puro no
  llega al contraste AA. `text-accent-ink` para texto, `--accent` para rellenos y
  bordes.
- **El toggle de tema no guarda estado en React.** Qué icono se ve lo decide el
  CSS con las variantes `theme-light` / `theme-dark`. Un script inline en el
  `<head>` aplica la preferencia guardada antes del primer paint.
- **La tarjeta se dibuja con Canvas 2D en el cliente**, no con `@vercel/og`.
  Satori no renderiza bien 230 paths SVG arbitrarios, y así la generación no
  depende de que haya servidor. Con cuenta, el pie lleva el link de referido
  personal; sin cuenta, el dominio pelado.
- **El encuadre del mapa se calcula, no se fija.** La proyección se ajusta a un
  marco del mundo habitado (84°N a 56°S) y el viewBox toma el alto que salga. Si
  se encuadra al bounding box de las geometrías, las islas del Pacífico estiran
  el marco y el mapa queda chico y rodeado de océano vacío. Lo mismo por país en
  el drill-down: el viewBox toma la forma real, si no Argentina queda diminuta en
  el medio de un lienzo apaisado.
- **Al iniciar sesión se hace la unión de lo local con lo remoto**, no un
  reemplazo. Alguien puede haber marcado países sin cuenta en este dispositivo y
  tener otros guardados de antes; perder cualquiera de los dos es peor que
  quedarse con un país de más.
- **El país de origen se elige sin cuenta** y vive en el store junto al progreso.
  La comparación con los pares es el gancho más fuerte que tiene la app; ponerla
  detrás de un login la desperdicia. Con sesión abierta además se copia al perfil,
  que es lo que alimenta los promedios agregados.
- **Los datos por país son hechos puntuales, no curvas.** Pew publica el
  porcentaje que nunca salió del país y el que llegó a cinco o a diez países, pero
  no la distribución entera. `COUNTRY_TRAVEL_FACTS` guarda solo lo que el informe
  afirma explícitamente y la copy elige cuál mostrar según cuántos países lleva la
  persona. Para los países sin dato, la app dice que la referencia es mundial en
  vez de fingir una cifra nacional.
- **La curva global de percentiles** mezcla las anclas de Pew (21% nunca salió,
  34% entre 1 y 4, 17% entre 5 y 9) con las dos referencias del brief para el
  tramo alto. Está anotada en `src/data/benchmarks.ts`. `home_country_average`
  recién reemplaza al dato publicado con 30 usuarios de muestra (`MIN_SAMPLE` en
  `src/lib/peers.ts`).
- **Las policies de RLS no consultan otras tablas directamente.** Todo lo que
  necesita mirar filas ajenas pasa por `are_connected` y `profile_is_visible`, que
  son `security definer`, para que no se vuelvan recursivas.
- **La analítica no manda nada a ningún lado por sí sola.** `track()` define el
  embudo y expone dos enganches: `window.va` (Vercel Analytics) y el evento
  `travel-tracker:event`. Elegir proveedor es una decisión de producto.

## Pendiente

- **Crear el proyecto Supabase** y aplicar `supabase/migrations/`. Hasta entonces
  la app corre sin cuentas y toda la UI de sesión se oculta sola.
- **Conectar un proveedor de analítica** a `track()`.
- **Elegir dominio** y ponerlo en `NEXT_PUBLIC_SHARE_URL`: es lo que aparece al
  pie de la tarjeta y el único camino de vuelta desde una captura de pantalla.
