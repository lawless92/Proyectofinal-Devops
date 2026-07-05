const express = require('express');
const client = require('prom-client');

// --- OpenTelemetry Instrumentation ---
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');

function createTraceExporter() {
  // Si existe la cadena de conexión de Application Insights, usamos el exportador de Azure.
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    const { AzureMonitorTraceExporter } = require('@azure/monitor-opentelemetry-exporter');
    return new AzureMonitorTraceExporter();
  }
  // De lo contrario, usamos el exportador OTLP genérico (para Jaeger, etc.).
  const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
  return new OTLPTraceExporter(); // El endpoint se configura con OTEL_EXPORTER_OTLP_ENDPOINT
}

const sdk = new NodeSDK({
  traceExporter: createTraceExporter(),
  instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
});

sdk.start();
// --- End OpenTelemetry Instrumentation ---

const app = express();
const port = process.env.PORT || 3000;

// Configuración de métricas de Prometheus
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

// Middleware para contar métricas
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestsTotal.inc({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

app.get('/', (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>DevOps Dashboard | Final Project</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
      <style>
          body { font-family: 'Inter', sans-serif; background-color: #0f172a; }
          .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }
          .pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
      </style>
  </head>
  <body class="text-slate-200 min-h-screen flex flex-col items-center justify-center p-6">
      <div class="max-w-4xl w-full">
          <!-- Header -->
          <header class="flex justify-between items-center mb-12">
              <div>
                  <h1 class="text-4xl font-bold tracking-tight text-white">DevOps <span class="text-blue-500">NodeApp</span></h1>
                  <p class="text-slate-400">Proyecto Final - Pipeline de Despliegue Continuo</p>
              </div>
              <div class="flex items-center gap-2 px-4 py-2 rounded-full glass">
                  <span class="w-3 h-3 bg-green-500 rounded-full pulse"></span>
                  <span class="text-sm font-medium">SISTEMA ONLINE</span>
              </div>
          </header>

          <!-- Grid de Status -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div class="glass p-6 rounded-2xl shadow-xl">
                  <h3 class="text-slate-400 text-sm font-semibold uppercase mb-2">Despliegue</h3>
                  <p class="text-2xl font-bold">Blue-Green</p>
                  <p class="text-xs text-blue-400 mt-2 italic">Estrategia Kubernetes activa</p>
              </div>
              <div class="glass p-6 rounded-2xl shadow-xl">
                  <h3 class="text-slate-400 text-sm font-semibold uppercase mb-2">Runtime</h3>
                  <p class="text-2xl font-bold">Node.js 20</p>
                  <p class="text-xs text-slate-500 mt-2">v${process.version}</p>
              </div>
              <div class="glass p-6 rounded-2xl shadow-xl">
                  <h3 class="text-slate-400 text-sm font-semibold uppercase mb-2">Monitorización</h3>
                  <p class="text-2xl font-bold text-orange-400">Prometheus</p>
                  <p class="text-xs text-slate-500 mt-2">Métricas activas</p>
              </div>
          </div>

          <!-- Call to Action -->
          <div class="glass p-8 rounded-3xl text-center border-blue-500/30">
              <h2 class="text-2xl font-bold mb-4">¡Aplicación funcionando con éxito!</h2>
              <p class="text-slate-400 mb-8 max-w-md mx-auto">
                  Este contenedor está siendo orquestado con un helm charty está listo para ser escalado en un clúster de Kubernetes.
              </p>
          </div>
      </div>
  </body>
  </html>`;
  res.send(html);
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

const HOST = '0.0.0.0';

app.listen(port, HOST, () => {
  console.log(`App escuchando en http://${HOST}:${port}`);
  console.log(`Métricas disponibles en http://localhost:${port}/metrics`);
});