# Node.js DevOps Project - Dashboard Profesional

Este proyecto consiste en una aplicación Node.js diseñada para demostrar un pipeline de despliegue moderno y robusto. Incluye un dashboard visualmente atractivo, endpoints de salud para orquestadores y está totalmente contenedorizada.

## 🚀 Características

- **Dashboard UI**: Interfaz moderna construida con Tailwind CSS y Glassmorphism.
- **Seguridad**: Dockerfile optimizado con ejecución mediante usuario no-root y actualización de dependencias de la imagen base.
- **Arquitectura Multietapa**: Construcción de imagen en dos etapas (Multi-stage build) para minimizar el tamaño de la imagen final.
- **Preparado para Kubernetes**: Configuración de Helm Chart incluida para despliegues escalables y estrategias Blue-Green.

## 🛠️ Tecnologías

- **Runtime**: Node.js 20-alpine
- **Framework**: Express.js
- **Estilos**: Tailwind CSS (via CDN)
- **Contenedores**: Docker / Docker Compose
- **Orquestación**: Kubernetes (Helm)

## 📂 Estructura del Proyecto

- `/app`: Código fuente de la aplicación (index.js, package.json).
- `Dockerfile`: Instrucciones de construcción de la imagen.
- `docker-compose.yaml`: Configuración para entorno de desarrollo local.
- `/infra`: Archivos de configuración de Terraform para el aprovisionamiento de recursos en Azure (AKS, VPC, etc.).
- `/app-chart`: Helm Chart para despliegue en Kubernetes.

## 💻 Ejecución Local

Para levantar la aplicación en un entorno de desarrollo con Docker Compose:

```bash
docker compose up --build
```

La aplicación estará disponible en: http://localhost:3000

## 🚢 Despliegue con Helm

Para desplegar en un clúster de Kubernetes:

```bash
helm install node-app ./node-app
```

## 🛡️ Seguridad y Mejores Prácticas

1. **Usuario No-Root**: El contenedor no corre como root para mitigar riesgos de seguridad.
2. **Imagen Ligera**: Se utiliza la variante `alpine` de Node.js para reducir la superficie de ataque.
3. **Actualización de Paquetes**: El proceso de build ejecuta `apk upgrade` para asegurar que las vulnerabilidades del sistema operativo base estén parcheadas.
4. **Variables de Entorno**: Configuración desacoplada del código mediante variables de entorno.
