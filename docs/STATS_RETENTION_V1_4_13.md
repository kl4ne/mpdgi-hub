# MPDGI Stats — Retención y diagnóstico de datos (v1.4.13)

## Estado vigente
- Este documento es una política operativa y un plan de verificación. **No autoriza ni ejecuta borrados de producción.**
- Los eventos de D1 actualmente alimentan directamente los reportes. No existe aún un almacén independiente de agregados históricos permanentes.
- El objetivo de conservar eventos detallados por hasta 24 meses **no se ejecuta automáticamente**. No afirmar que los agregados se conservan indefinidamente si no hay materialización real.
- Las campañas, visitas, sesiones y eventos están interrelacionados. Borrar una sola tabla cambiaría las estadísticas históricas.

## Cambios de v1.4.13
1. Respuesta HTTP **429** y `Retry-After: 600` cuando el presupuesto del colector está agotado. No responder 204 por un evento que no se guardó. Los eventos rechazados por límite no incrementan métricas para preservar el presupuesto de escrituras.
2. El estado de salud se calcula desde métricas de **hoy y ayer en America/New_York**, independientemente del período consultado. Se marca degradación si la muestra reciente tiene al menos 20 solicitudes y 25% o más rechazadas, o al menos 10 solicitudes sin ningún evento aceptado o duplicado. Una avalancha de tráfico inválido también puede generar advertencias: no equivale a avería de D1.
3. Los histogramas horarios/semanales cuentan una vez cada sesión del Hub que tenga eventos en el período, usando la hora del **primer evento almacenado dentro del período**. Así se alinean con las visitas del resumen. Se excluyen las tarjetas digitales en ambos casos.
4. Las métricas `received/rejected/accepted` del reporteo respetan el período seleccionado; los nuevos campos `health.recent_*` representan solamente la ventana reciente de dos fechas de calendario.
5. Los límites de tráfico no son un contador de pérdidas: deliberadamente no se escriben métricas D1 cuando ya están agotados. No interpretar `received - accepted` como cantidad exacta de pérdida.

## Plan previo a cualquier futura purga
**Requiere una aprobación posterior y separada**:
1. Generar respaldo/exportación verificable y ensayar restauración usando un destino de prueba, no la base de producción.
2. Tomar inventario read-only de las fechas, filas y tamaños por tabla; registrar índices y límites de D1.
3. Diseñar y validar tablas materializadas de agregados que permitan conservar todos los reportes históricos y la desduplicación necesaria. Verificar contra los resultados actuales de `dashboard` y `export` para intervalos antiguos.
4. Probar migraciones y conteos en copia de D1, incluyendo fronteras de fecha de America/New_York, transiciones DST y dependencias de `visitors`, `sessions` y `events`.
5. Obtener autorización explícita del propietario con un corte fechado, backup y plan de rollback. Solo entonces programar una limpieza por lotes auditada. No activar cron ni SQL `DELETE` antes.

## Consulta orientativa de inventario (solo lectura; usar corte de fecha explícito)
```sql
SELECT COUNT(*) AS eventos_anteriores, MIN(server_day_et) AS dia_mas_antiguo, MAX(server_day_et) AS dia_mas_reciente
FROM events WHERE server_day_et < '2024-10-01';
```
La fecha mostrada es un ejemplo y **no es una fecha de purga aprobada**.

## Verificación y publicación
- Validar sintaxis, pruebas de unidad, autenticación, Pages+D1 local y Playwright Chromium/WebKit.
- Verificar en producción el despliegue de la versión, headers y funcionamiento sin generar eventos artificiales en D1.
- No cambiar los bindings, los secretos, las tablas ni los registros existentes en esta versión.
