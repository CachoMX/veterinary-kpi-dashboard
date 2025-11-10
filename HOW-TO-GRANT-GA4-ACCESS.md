# Cómo Dar Acceso a Tu Cuenta de Servicio en Google Analytics 4

## El Problema
Tu cuenta de servicio (`gtm-tool-386203@appspot.gserviceaccount.com`) NO TIENE PERMISOS para leer datos de tus propiedades de GA4. Por eso todo sale en ceros.

## La Solución (Manual pero Rápida)

### Opción 1: Dar acceso a TODAS las propiedades a la vez (Recomendado)

1. Ve a: https://analytics.google.com
2. Click en **Admin** (⚙️ abajo izquierda)
3. En la columna de **ACCOUNT**, click en **Account Access Management**
4. Click **+** (Add users)
5. Agrega: `gtm-tool-386203@appspot.gserviceaccount.com`
6. Rol: **Viewer**
7. Marca: "Add this user to all current AND FUTURE properties"
8. Click **Add**

**¡Esto da acceso a TODAS las 329 propiedades automáticamente!**

### Opción 2: Dar acceso propiedad por propiedad

Si la Opción 1 no funciona (por permisos de cuenta):

1. Ve a: https://analytics.google.com
2. Selecciona una propiedad (ej: vetcelerator.com)
3. Click en **Admin** (⚙️)
4. En la columna **Property**, click en **Property Access Management**
5. Click **+** (Add users)
6. Agrega: `gtm-tool-386203@appspot.gserviceaccount.com`
7. Rol: **Viewer**
8. Click **Add**
9. Repite para cada propiedad

## ¿Cómo verificar que funcionó?

Después de agregar los permisos, espera **2 minutos** y luego:

```bash
cd c:/Projects/veterinary-kpi-dashboard
node test-ga4-real-data.js
```

Deberías ver datos reales en lugar de ceros.

## Después de dar permisos, re-sincroniza todo:

```bash
node sync-all-2025.js
```

Esto volverá a obtener los datos, ahora CON permisos, y verás métricas reales en el dashboard.

## Email de la Cuenta de Servicio

```
gtm-tool-386203@appspot.gserviceaccount.com
```

(Cópialo y pégalo exactamente así)

## ¿Por qué no se puede hacer automáticamente?

Google Analytics Admin API requiere permisos especiales de "propietario" que tu cuenta de servicio no tiene. La forma más segura y rápida es hacerlo manual desde la interfaz web.
