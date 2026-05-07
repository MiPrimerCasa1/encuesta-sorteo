# MVP Encuesta Directa - Mi Primera Casa

## Flujo implementado

1. El cliente escanea el QR del folleto.
2. Se abre WhatsApp con mensaje precargado (`sorteo01_v1`, etc.).
3. El sistema de la empresa responde con enlace a encuesta directa.
4. El usuario completa la encuesta.
5. Se guarda cabecera en `respuestas` y detalle en `respuestas_detalle`.

## Tecnologia elegida para este MVP

- Frontend: React + Vite.
- API: Node.js + Express.
- Base de datos: SQLite local (archivo `data/surveys.db`).

Esta base local permite salir rapido y luego acoplar facilmente a la base corporativa sin rehacer la experiencia.

## Modelo dinamico de encuesta (SQL)

Tablas principales:

- `sorteos`
- `formularios`
- `preguntas`
- `respuestas`
- `respuestas_detalle`

Con este modelo se pueden cambiar preguntas sin alterar columnas de la base.

## Payload actual (en español)

- `participante.nombreCompleto`
- `participante.barrio`
- `respuestas[]` con:
  - `codigoPregunta`
  - `valor`
- Metadatos:
  - `idSorteo`
  - `nombreSorteo`
  - `codigoPromotor`
  - `codigoQr`
  - `mensajeWhatsapp`
  - `origen`

## Formato de enlace recomendado desde WhatsApp

`https://tudominio.com/?id_sorteo=sorteo01&nombre_sorteo=Sorteo%2001&codigo_qr=sorteo01_v1&codigo_promotor=v1`

## Reglas de calidad de datos

- Validacion de campos en backend con Zod.
- Si responde que quiere mas informacion, horario de llamada es obligatorio.
- Duplicado bloqueado por `nombre_completo + barrio + sorteo + promotor + fecha`.

## Ejecucion local

1. Instalar dependencias:
   - `npm install`
2. Levantar API:
   - `npm run iniciar:api`
3. Levantar frontend:
   - `npm run desarrollo`

Tambien funcionan los comandos equivalentes:

- `npm run start:api`
- `npm run dev`

La app usa proxy de Vite para enviar `/api/*` a `http://localhost:3001`.
