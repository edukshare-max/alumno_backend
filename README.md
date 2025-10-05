# UAGro Carnet - Micro-Backend Node.js

Micro-backend desarrollado en Node.js + Express + JWT + Azure Cosmos DB para proporcionar acceso de solo lectura a carnets y citas de estudiantes de la Universidad Autónoma de Guerrero (UAGro).

## Características

- **Tecnologías**: Node.js, Express, JWT, Azure Cosmos DB
- **Acceso**: Solo lectura a base de datos SASU
- **Contenedores**: `carnets_id` y `cita_id`
- **Autenticación**: JWT con expiración configurable (default: 120 minutos)
- **CORS**: Configurado para dominios específicos de producción
- **Seguridad**: Validación de matrícula, sin acceso cruzado entre estudiantes

## Variables de Entorno

### Archivo `.env` requerido

```env
# Puerto del servidor
PORT=10000

# CORS - Orígenes permitidos (separados por coma)
CORS_ALLOW_ORIGINS=https://carnetdigital.space,https://www.carnetdigital.space,http://localhost:5173,http://127.0.0.1:3000

# Azure Cosmos DB
COSMOS_ENDPOINT=https://<TU-ACCOUNT>.documents.azure.com:443/
COSMOS_KEY=<TU-KEY>
COSMOS_DB=SASU
COSMOS_CONTAINER_CARNETS=carnets_id
COSMOS_CONTAINER_CITAS=cita_id

# JWT
JWT_SECRET=<cadena_hex_aleatoria_de_64>
JWT_EXPIRES_MIN=120
```

### Generar JWT_SECRET

Para generar una clave JWT segura de 64 caracteres hexadecimales:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Desarrollo Local

### Instalación y configuración

```bash
# Instalar dependencias
npm ci

# Crear archivo de configuración (Linux/macOS)
cp .env.example .env

# Crear archivo de configuración (Windows PowerShell)
Copy-Item .env.example .env -Force

# Editar .env con tus credenciales reales de Azure Cosmos DB
# Rellenar todas las variables listadas arriba
```

### Ejecución local

```bash
# Desarrollo con autoreload
npm run dev

# Producción local
npm start
```

El servidor estará disponible en `http://localhost:10000`

## Despliegue en Render

### Configuración del Servicio Web

1. **Crear nuevo Web Service** en Render
2. **Conectar repositorio** de GitHub
3. **Configuración básica**:
   - **Root Directory**: (dejar vacío)
   - **Build Command**: `npm ci`
   - **Start Command**: `npm start`
   - **Branch**: `main`
   - **Auto-Deploy**: `Yes`

### Variables de Entorno en Render

En la sección **Environment** → **Environment Variables**, agregar todas las variables del archivo `.env`:

```
PORT=10000
CORS_ALLOW_ORIGINS=https://carnetdigital.space,https://www.carnetdigital.space
COSMOS_ENDPOINT=https://<TU-ACCOUNT>.documents.azure.com:443/
COSMOS_KEY=<TU-KEY>
COSMOS_DB=SASU
COSMOS_CONTAINER_CARNETS=carnets_id
COSMOS_CONTAINER_CITAS=cita_id
JWT_SECRET=<cadena_hex_aleatoria_de_64>
JWT_EXPIRES_MIN=120
```

### Despliegue

1. **Deploy** desde el dashboard de Render
2. Si hay problemas, usar **"Clear build cache & deploy"**
3. **Verificar logs** para confirmar:
   - `listening on port 10000`
   - Orígenes CORS configurados correctamente

## API Endpoints

### Rutas disponibles

- `GET /_health` - Health check del servicio
- `POST /auth/login` - Autenticación con email y matrícula
- `GET /me/carnet` - Obtener carnet del estudiante autenticado
- `GET /me/citas` - Obtener citas del estudiante autenticado

## Verificación del Servicio

### 1. Health Check

```bash
curl -sS https://TU_BACKEND/_health
```

**Respuesta esperada**: `OK`

### 2. Login de Usuario

```bash
curl -sS -X POST "https://TU_BACKEND/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"correo@uagro.mx","matricula":"2025"}'
```

**Nota**: Usar email y matrícula que existan en el contenedor `carnets_id`

**Respuesta esperada**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 7200
}
```

### 3. Consultar Carnet Autenticado

```bash
curl -sS "https://TU_BACKEND/me/carnet" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 4. Consultar Citas Autenticadas

```bash
curl -sS "https://TU_BACKEND/me/citas" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

## Script de Health Check

El proyecto incluye un script npm para verificar el estado del servicio:

```bash
# Verificar servicio local
npm run health

# Verificar servicio en producción
HEALTH_URL=https://TU_BACKEND/_health npm run health
```

**Uso en Windows PowerShell**:
```powershell
$env:HEALTH_URL="https://TU_BACKEND/_health"; npm run health
```

## Notas de Seguridad

### CORS en Producción
- **Limitar dominios**: Solo `https://carnetdigital.space` y `https://www.carnetdigital.space`
- **Remover localhost**: No incluir `localhost` en producción

### Gestión de Credenciales
- **No exponer `COSMOS_KEY`** en código fuente
- **Usar solo variables de entorno** en Render
- **Generar `JWT_SECRET` único** para cada entorno

### JWT
- **Expiración configurada**: Default 120 minutos
- **Validación estricta**: Solo estudiantes con matrícula válida
- **Sin acceso cruzado**: Cada estudiante solo ve sus propios datos

## Estructura del Proyecto

```
alumno_backend_node/
├── src/
│   ├── server.js          # Servidor Express principal
│   ├── middleware/
│   │   └── auth.js        # Middleware de autenticación JWT
│   └── utils/
│       └── cosmos.js      # Helpers para Azure Cosmos DB
├── .env.example           # Plantilla de variables de entorno
├── package.json           # Dependencias y scripts
└── README.md             # Este archivo
```

## Render (Node.js) - Troubleshooting

### Configuración Requerida en Render Dashboard

1. **Verificar Repository**: Asegurar que el servicio apunte a `alumno_backend_node` (NOT `alumno_backend`)
2. **Runtime**: Node.js (detectado automáticamente por package.json)
3. **Root Directory**: (dejar vacío)
4. **Build Command**: `npm ci`
5. **Start Command**: `npm start`

### Solución a Errores Comunes

#### Error: "npm ci fails - no package-lock.json"

**Si el lockfile no está actualizado o corrupto:**

```bash
# Regenerar lockfile localmente
npm install
git add package-lock.json
git commit -m "chore: add/update lockfile"
git push
```

**Alternativa temporal (NO recomendada para producción):**
- Cambiar Build Command temporalmente a `npm install` en Render Dashboard
- Una vez resuelto el lockfile, volver a `npm ci`

#### Error: "Wrong runtime detected"

- **Verificar**: El servicio debe apuntar al repositorio correcto
- **alumno_backend** = Python/FastAPI
- **alumno_backend_node** = Node.js/Express

#### Deployment Steps

1. **Clear build cache & deploy** desde Render Dashboard
2. **Verificar logs** para confirmar:
   - Node.js runtime detectado
   - `npm ci` ejecutándose exitosamente
   - "listening on port 10000"
   - Variables de entorno cargadas correctamente

### Blueprint automático (render.yaml)

Este repositorio incluye `render.yaml` para deployment automático. Las variables secretas (COSMOS_KEY, JWT_SECRET) deben configurarse manualmente en Render Dashboard.

## Soporte

Para problemas o preguntas relacionadas con el despliegue:

1. **Revisar logs** en Render Dashboard
2. **Verificar variables de entorno** están configuradas correctamente
3. **Confirmar credenciales** de Azure Cosmos DB
4. **Probar health check** antes de endpoints autenticados