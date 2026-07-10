# Bank Management System - Monorepo

Sistema de gestión bancaria organizado como monorepo usando pnpm workspaces. Este proyecto incluye microservicios backend, frontend web y aplicación móvil.

## 📁 Estructura del Proyecto

```
bank-management-system/
├── Backend/           # Microservicios con Docker Compose
│   ├── services/      # 7 microservicios (auth, users, accounts, etc.)
│   └── docker-compose.yml
├── Frontend/          # Aplicación web React + Vite
├── BancoApp/          # Aplicación móvil Expo (React Native)
└── package.json       # Configuración del monorepo
```

## 🚀 Comandos Disponibles

### Iniciar todo el proyecto
```bash
# Inicia Backend (Docker), Frontend y App móvil simultáneamente
pnpm dev
```

### Iniciar componentes individuales
```bash
# Solo Backend (Docker Compose)
pnpm dev:backend

# Backend en modo detached (segundo plano)
pnpm dev:backend:detached

# Solo Frontend (React + Vite)
pnpm dev:frontend

# Solo App móvil (Expo)
pnpm dev:mobile

# Backend + Frontend (ideal para desarrollo web)
pnpm dev:web
```

### Gestión de Backend (Docker)
```bash
# Detener contenedores Docker
pnpm down:backend

# Ver logs de Docker
pnpm logs:backend
```

### Build
```bash
# Build de Frontend y App móvil
pnpm build

# Build individual
pnpm build:frontend
pnpm build:mobile
```

### Limpieza
```bash
# Detener Docker y limpiar builds
pnpm clean
```

## 📋 Requisitos Previos

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker y Docker Compose (para Backend)
- Expo CLI (para BancoApp)

## 🔧 Instalación

```bash
# Instalar dependencias de todos los proyectos
pnpm install
```

## 🔐 Variables de Entorno

Crea un archivo `.env` en la carpeta `Backend/` con las variables necesarias para los microservicios. Consulta el archivo `docker-compose.yml` para ver las variables requeridas.

## 📝 Notas Importantes

- **Backend**: Usa Docker Compose para orquestar 7 microservicios (auth, users, accounts, transactions, finance, products, api-gateway)
- **Frontend**: React 19 con Vite, TailwindCSS y Zustand para state management
- **BancoApp**: Expo con React Native para desarrollo móvil multiplataforma

## 🐛 Troubleshooting

Si tienes problemas con los puertos:
- Backend: 3000-3006 (API Gateway y microservicios)
- Frontend: 5173 (Vite default)
- PostgreSQL: 5436
- MongoDB: 27017

Asegúrate de que estos puertos estén disponibles antes de iniciar el proyecto.
