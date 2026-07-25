# Guía de Deployment - TechStock Inventario

## Requisitos previos

1. **Cuenta en Vercel** (gratuita): https://vercel.com
2. **Cuenta en Neon** (gratuita): https://neon.tech (ya tienes la base de datos)
3. **Cuenta en Clerk** (gratuita): https://clerk.com (ya tienes la autenticación)
4. **GitHub** para subir el código

## Paso 1: Preparar el código

### 1.1 Inicializar Git (si no lo tienes)

```bash
cd C:\Users\Zamix\Tech-Inventory-Manager
git init
git add .
git commit -m "Initial commit - TechStock Inventario"
```

### 1.2 Crear repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre: `tech-inventory-manager`
3. **NO** marques "Add a README file"
4. Crea el repositorio

### 1.3 Subir el código a GitHub

```bash
git remote add origin https://github.com/TU_USUARIO/tech-inventory-manager.git
git branch -M main
git push -u origin main
```

## Paso 2: Configurar Vercel

### 2.1 Conectar repositorio

1. Ve a https://vercel.com/new
2. Importa tu repositorio de GitHub
3. Selecciona el proyecto `tech-inventory-manager`

### 2.2 Configurar variables de entorno

En Vercel, ve a **Settings → Environment Variables** y agrega:

| Nombre | Valor | Descripción |
|--------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | Tu URL de Neon (la que tienes en `.env`) |
| `CLERK_SECRET_KEY` | `sk_live_...` | Tu clave secreta de Clerk |
| `CLERK_PUBLISHABLE_KEY` | `pk_live_...` | Tu clave pública de Clerk |
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_live_...` | Igual que la anterior |

**Importante:** Estas variables están en tu archivo `.env` actual en `artifacts/api-server/.env`.

### 2.3 Configurar Build Settings

Vercel debería detectar automáticamente la configuración de `vercel.json`. Si no, configura:

- **Framework Preset:** Other
- **Build Command:** `pnpm install`
- **Output Directory:** `artifacts/techstock/dist`

### 2.4 Desplegar

1. Haz clic en **Deploy**
2. Espera a que termine el build
3. Si todo está bien, verás "Congratulations!"

## Paso 3: Verificar el deployment

### 3.1 Probar la API

Visita: `https://tu-proyecto.vercel.app/api/healthz`

Deberías ver: `{"status":"ok"}`

### 3.2 Probar el frontend

Visita: `https://tu-proyecto.vercel.app`

Deberías ver la página de login de Clerk.

## Solución de problemas

### Error: "Module not found"

Si ves errores de módulos no encontrados, puede ser porque Vercel no está instalando todas las dependencias.

**Solución:** Agrega un archivo `.npmrc` en la raíz:

```
auto-install-peers=false
strict-peer-dependencies=false
```

### Error: "Clerk publishable key is missing"

Asegúrate de que la variable `VITE_CLERK_PUBLISHABLE_KEY` esté configurada en Vercel.

### Error: "Cannot connect to database"

Verifica que `DATABASE_URL` esté correcta en Vercel y que Neon permita conexiones desde Vercel (Neon lo permite por defecto).

### La API no responde

1. Revisa los logs en Vercel → Logs
2. Verifica que no haya errores de build
3. Prueba el endpoint `/api/healthz` directamente

## Después del deployment

### Actualizaciones

Cada vez que hagas `git push` a GitHub, Vercel desplegará automáticamente los cambios.

### Dominio personalizado (opcional)

1. En Vercel → Settings → Domains
2. Agrega tu dominio
3. Sigue las instrucciones para configurar DNS

### Costos

- **Vercel Hobby:** Gratis (suficiente para tu uso)
- **Neon Free:** Gratis (0.5 GB de almacenamiento)
- **Clerk Free:** Gratis (10,000 usuarios)

**Total: $0/mes** para uso personal
