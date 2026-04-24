# OSINT Terminal

Aplicación de reconocimiento OSINT con interfaz de terminal interactiva.

## Características

- Reconocimiento de usuarios (GitHub, HackerNews)
- Análisis de dominios (certificados SSL, geolocalización)
- Inteligencia de IPs (ASN, ISP, detección de proxies)
- Generador de Google Dorks
- Historial de escaneos con almacenamiento local
- Exportación de resultados

## Instalación

```bash
npm install
npm run dev
```

## Stack

- React 19
- Vite 7
- Tailwind CSS 3
- Radix UI

## Estructura

```
src/
  components/     Componentes reutilizables
  pages/          Páginas de la aplicación
  styles/         Estilos globales
  utils/          Utilidades
```

## Despliegue

Compatible con Vercel, Netlify y otros servicios de hosting estático.
