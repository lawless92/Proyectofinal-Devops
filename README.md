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
- **Observabilidad**: OpenTelemetry (compatible con Jaeger y Azure Monitor), Prometheus
- **Gestión de Configuración**: GitOps con Helm

## 📂 Estructura del Proyecto

- `/app`: Código fuente de la aplicación (index.js, package.json).
- `Dockerfile`: Instrucciones de construcción de la imagen.
- `docker-compose.yaml`: Configuración para entorno de desarrollo local.
- `/infra`: Archivos de configuración de Terraform para el aprovisionamiento de recursos en Azure (AKS, VPC, etc.).
- `/app-chart`: Helm Chart para despliegue en Kubernetes.
- `/cluster-config`: Helm Chart "umbrella" para gestionar la pila de observabilidad y otras configuraciones del clúster (enfoque GitOps).

## 💻 Ejecución Local

Para levantar la aplicación en un entorno de desarrollo con Docker Compose:

```bash
docker compose up --build
```

La aplicación estará disponible en: http://localhost:3000

## ⚙️ Configuración del Pipeline de CI/CD

El pipeline de GitHub Actions necesita autenticarse en Azure para desplegar recursos y subir imágenes a ACR. Por seguridad, es una buena práctica crear una identidad de servicio (Service Principal) con permisos específicos en lugar de usar credenciales de usuario.

### 1. Crear el Service Principal

Ejecuta el siguiente comando en Azure CLI para crear un Service Principal con el rol de `Contributor` sobre tu grupo de recursos. Reemplaza `<YOUR_SUBSCRIPTION_ID>` con tu ID de suscripción.

```bash
az ad sp create-for-rbac \
  --name "github-actions-sp" \
  --role "Contributor" \
  --scopes "/subscriptions/<YOUR_SUBSCRIPTION_ID>/resourceGroups/Devops-Project-app" \
  --sdk-auth
```

### 2. Configurar los Secrets en GitHub

El comando anterior generará un objeto JSON. Usa los valores de este JSON para configurar los siguientes secrets en tu repositorio de GitHub (`Settings > Secrets and variables > Actions`):

*   **`AZURE_CREDENTIALS`**: Copia y pega el **objeto JSON completo** que generó el comando.

    ```json
    {
      "clientId": "xxxx",
      "clientSecret": "xxxx",
      "subscriptionId": "xxxx",
      "tenantId": "xxxx",
      ...
    }
    ```

*   **`ACR_USERNAME`**: Usa el valor de `clientId` del JSON.
*   **`ACR_PASSWORD`**: Usa el valor de `clientSecret` del JSON.

## 🚢 Despliegue con Helm

Para desplegar o actualizar la aplicación en un clúster de Kubernetes, puedes usar el siguiente comando. Este comando instalará la aplicación si no existe, o la actualizará si ya está desplegada.

```bash
helm upgrade --install node-app ./app-chart --namespace default
```

### Acceder a la Aplicación en AKS

Una vez desplegada, la aplicación se expone a través de un `Service` de tipo `LoadBalancer`. Para obtener la IP pública y acceder a ella, ejecuta:

```bash
kubectl get service node-app --namespace default --watch
```

Espera a que la `EXTERNAL-IP` sea asignada y luego navega a `http://<EXTERNAL-IP>` en tu navegador.

### 🔭 Gestión del Clúster con GitOps (Argo CD)

La configuración completa del clúster, incluida la pila de observabilidad, se gestiona mediante Argo CD, siguiendo un estricto enfoque GitOps.

**1. Bootstrapping de Argo CD (Paso único manual)**

El único paso manual es la instalación inicial de Argo CD en el clúster.
```bash
# Crear el namespace para Argo CD
kubectl create namespace argocd

# Aplicar el manifiesto de instalación oficial
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

## 🛡️ Seguridad y Mejores Prácticas

1. **Usuario No-Root**: El contenedor no corre como root para mitigar riesgos de seguridad.
2. **Imagen Ligera**: Se utiliza la variante `alpine` de Node.js para reducir la superficie de ataque.
3. **Actualización de Paquetes**: El proceso de build ejecuta `apk upgrade` para asegurar que las vulnerabilidades del sistema operativo base estén parcheadas.
4. **Variables de Entorno**: Configuración desacoplada del código mediante variables de entorno.
5. **Identidad de Servicio**: El pipeline utiliza un Service Principal con permisos definidos para interactuar con Azure, siguiendo el principio de menor privilegio.
6. **Exposición con Ingress**: Se utiliza un Ingress para gestionar el tráfico de entrada, una práctica estándar en producción.
