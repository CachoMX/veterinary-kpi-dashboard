# GA4 Auto-Sync Cron Job Setup

## Overview
El sistema ahora sincroniza automáticamente los datos de GA4 el día 1 de cada mes mediante un cron job en Vercel.

**¿Qué hace?**
- Se ejecuta automáticamente el día 1 de cada mes a las 8:00 AM UTC
- Sincroniza los datos del mes anterior para todos los dominios activos
- Ejemplo: El 1 de diciembre sincroniza todos los datos de noviembre

## Configuración en Vercel

### 1. Agregar la Variable de Entorno CRON_SECRET

Necesitas agregar una nueva variable de entorno en Vercel para autenticar el cron job:

**Opción A: Generar un secreto seguro (recomendado)**
```bash
# En tu terminal, genera un secreto aleatorio:
openssl rand -base64 32
```

**Opción B: Usar un string único**
Cualquier string único y complejo (mínimo 32 caracteres)

**Agregar en Vercel:**
1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega una nueva variable:
   - **Name:** `CRON_SECRET`
   - **Value:** El secreto que generaste
   - **Environment:** Production, Preview, Development (selecciona todos)
4. Click "Save"

### 2. Re-deploy el Proyecto

Después de agregar la variable de entorno, necesitas hacer un nuevo deploy:

```bash
git add .
git commit -m "Add GA4 auto-sync cron job"
git push
```

O usa el botón "Redeploy" en Vercel Dashboard.

### 3. Verificar la Configuración del Cron

En el archivo `vercel.json` ya está configurado:

```json
{
  "crons": [
    {
      "path": "/api/analytics/cron-sync-previous-month",
      "schedule": "0 8 1 * *"
    }
  ]
}
```

**Explicación del schedule:**
- `0` = minuto 0
- `8` = hora 8 (8 AM UTC)
- `1` = día 1 del mes
- `*` = todos los meses
- `*` = todos los días de la semana

**Horario en tu zona:**
- 8:00 AM UTC = 12:00 AM PST (medianoche del día 1)
- 8:00 AM UTC = 1:00 AM PDT (1 AM del día 1)

### 4. Verificar el Funcionamiento

**Verificar que el cron está registrado:**
1. Ve a Vercel Dashboard → Tu Proyecto
2. Settings → Cron Jobs
3. Deberías ver: `/api/analytics/cron-sync-previous-month` con schedule `0 8 1 * *`

**Probar manualmente (opcional):**
Puedes probar el endpoint manualmente con curl:

```bash
curl -X GET "https://tu-dominio.vercel.app/api/analytics/cron-sync-previous-month" \
  -H "Authorization: Bearer TU_CRON_SECRET"
```

Reemplaza:
- `tu-dominio.vercel.app` con tu dominio de Vercel
- `TU_CRON_SECRET` con el secreto que configuraste

**Respuesta esperada:**
```json
{
  "success": true,
  "month": "2025-11",
  "totalProperties": 329,
  "synced": 329,
  "errors": 0,
  "durationMinutes": "54.23",
  "timestamp": "2025-12-01T08:15:32.123Z"
}
```

### 5. Monitorear las Ejecuciones

**Ver logs del cron:**
1. Vercel Dashboard → Tu Proyecto
2. Logs → Filter by `/api/analytics/cron-sync-previous-month`
3. Revisa los logs después del día 1 de cada mes

**¿Qué buscar en los logs?**
- ✓ Mensajes de "synced successfully" para cada dominio
- ✓ Resumen final con total de propiedades sincronizadas
- ✗ Cualquier error se loguea pero no detiene el proceso completo

## ¿Qué se sincroniza?

Para cada dominio activo, el cron sincroniza:

1. **Métricas base:**
   - Total Users, Active Users, New Users
   - Sessions
   - Key Events (conversiones)
   - Engagement Rate
   - Average Engagement Time

2. **Traffic Sources:**
   - Top 50 fuentes de tráfico
   - Channel Groups (Organic Search, Direct, Social, etc.)
   - Users y Sessions por fuente

3. **Key Events:**
   - Hasta 100 eventos de conversión diferentes
   - Conteo de eventos
   - Usuarios que dispararon cada evento
   - Event Value

4. **Comparaciones:**
   - Month-to-month trends (comparado con el mes anterior)
   - Percentage changes
   - Trend indicators (up/down/neutral)

## Troubleshooting

### El cron no se ejecuta
- Verifica que `CRON_SECRET` esté configurado en Vercel
- Verifica que el cron aparezca en Settings → Cron Jobs
- Re-deploy el proyecto después de cambios en `vercel.json`

### Errores en la sincronización
- Revisa los logs en Vercel Dashboard
- Verifica que `GA4_SERVICE_ACCOUNT_CREDENTIALS` esté correcto
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` tenga permisos de escritura

### Sincronización incompleta
- El cron continúa aunque algunos dominios fallen
- Revisa `errorDetails` en la respuesta del cron
- Los dominios con error se pueden re-sincronizar manualmente

### Duración muy larga
- Normal: 50-60 minutos para 329 dominios
- Vercel permite hasta 900 segundos (15 minutos) para crons en plan Pro
- Si excede el tiempo, considera dividir en múltiples crons (por lotes de dominios)

## Notas Importantes

1. **Primer día del mes:** El cron se ejecuta el día 1 a las 8 AM UTC, dando tiempo a que GA4 procese completamente los datos del mes anterior

2. **No requiere intervención manual:** Una vez configurado, se ejecuta automáticamente cada mes

3. **El botón "Sync Data" fue eliminado:** Ya no es necesario sincronizar manualmente

4. **Datos históricos:** Si necesitas sincronizar meses anteriores, puedes usar el endpoint manual `/api/analytics/sync-monthly-data`

5. **Timezone:** Todos los datos se almacenan en UTC, el dashboard los muestra correctamente sin importar tu timezone

## Sincronización Manual (si es necesario)

Si por alguna razón necesitas sincronizar manualmente un mes específico:

```bash
curl -X POST "https://tu-dominio.vercel.app/api/analytics/sync-monthly-data" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2025,
    "months": [11],
    "forceRefresh": true
  }'
```

Este endpoint sigue disponible para emergencias o correcciones.
