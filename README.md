# OSINT Terminal

<div align="center">

![OSINT Terminal](https://img.shields.io/badge/OSINT-Terminal-00ff41?style=for-the-badge)
![Version](https://img.shields.io/badge/version-2.1.0-00cc33?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-00e5ff?style=for-the-badge)

**Suite de reconocimiento de inteligencia de código abierto con interfaz de terminal estilo Matrix**

[Demo](#) · [Reportar Bug](../../issues) · [Solicitar Feature](../../issues)

</div>

---

## 📋 Tabla de Contenidos

- [Acerca del Proyecto](#-acerca-del-proyecto)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [APIs Utilizadas](#-apis-utilizadas)
- [Roadmap](#-roadmap)
- [Contribuciones](#-contribuciones)
- [Licencia](#-licencia)
- [Contacto](#-contacto)
- [Agradecimientos](#-agradecimientos)

---

## 🎯 Acerca del Proyecto

OSINT Terminal es una aplicación web de reconocimiento de inteligencia de código abierto (OSINT) diseñada con una estética de terminal hacker. Permite realizar investigaciones sobre usuarios, dominios, direcciones IP y generar consultas Google Dorks de manera eficiente y visual.

### ¿Por qué OSINT Terminal?

- **Interfaz Unificada**: Centraliza múltiples fuentes OSINT en una sola aplicación
- **Estética Terminal**: Diseño inspirado en Matrix para una experiencia inmersiva
- **Sin Backend**: Funciona completamente en el navegador, sin necesidad de servidor
- **Historial Local**: Guarda tus escaneos automáticamente en localStorage
- **Exportación**: Descarga resultados en formato TXT para análisis posterior

---

## ✨ Características

### 🔍 Modos de Reconocimiento

#### 1. **Username Reconnaissance**
- Búsqueda de perfiles en GitHub (repos, seguidores, organizaciones)
- Consulta de usuarios en HackerNews (karma, submissions)
- Enumeración de presencia digital

#### 2. **Domain Analysis**
- Logs de certificados SSL via crt.sh
- Enumeración de subdominios
- Geolocalización de servidores
- Información de ISP y ASN

#### 3. **IP Intelligence**
- Geolocalización precisa (ciudad, región, país)
- Detección de proxies y hosting
- Información de ASN y reverse DNS
- Evaluación de nivel de amenaza

#### 4. **Google Dorks Generator**
- 10 categorías predefinidas (archivos expuestos, login pages, etc.)
- Generación automática de queries
- Búsqueda directa en Google
- Copiar queries al portapapeles

### 🛠️ Funcionalidades Adicionales

- **Historial de Escaneos**: Almacenamiento local con filtrado y búsqueda
- **Panel de Herramientas OSINT**: Enlaces rápidos a 12+ herramientas externas
- **Terminal Interactiva**: Salida en tiempo real con animaciones
- **Exportación de Resultados**: Descarga reportes en formato TXT
- **Indicadores de Progreso**: Visualización de etapas de escaneo
- **Responsive Design**: Optimizado para desktop y móvil

---

## 🚀 Tecnologías

### Core
- **React 19** - Biblioteca UI con nuevas características
- **Vite 7** - Build tool ultrarrápido
- **Tailwind CSS 3** - Framework CSS utility-first

### UI Components
- **Radix UI** - Componentes accesibles y sin estilos
- **Lucide React** - Iconos modernos
- **class-variance-authority** - Gestión de variantes de componentes

### Fuentes
- **Orbitron** - Títulos y headers
- **Share Tech Mono** - Terminal output
- **JetBrains Mono** - Código y datos
- **Roboto Mono** - Métricas

### APIs Externas
- GitHub API
- HackerNews Firebase API
- crt.sh (Certificate Transparency)
- ip-api.com (Geolocalización)

---

## � Instalación

### Prerrequisitos

- Node.js 20 o superior
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/KevPatterson/OSINT_Terminal_App.git
cd osint-terminal
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

4. **Abrir en el navegador**
```
http://localhost:4028
```

### Scripts Disponibles

```bash
npm run dev      # Inicia servidor de desarrollo
npm run build    # Construye para producción
npm run preview  # Preview del build de producción
npm run lint     # Ejecuta ESLint
```

---

## 💻 Uso

### Reconocimiento de Usuario

1. Selecciona el modo **USERNAME**
2. Ingresa un nombre de usuario (ej: `torvalds`)
3. Click en **EXECUTE SCAN**
4. Revisa resultados en terminal y tarjetas

### Análisis de Dominio

1. Selecciona el modo **DOMAIN**
2. Ingresa un dominio (ej: `example.com`)
3. Espera el escaneo de certificados y geolocalización
4. Explora subdominios encontrados

### Inteligencia de IP

1. Selecciona el modo **IP ADDRESS**
2. Ingresa una IP (ej: `8.8.8.8`)
3. Obtén información de geolocalización y amenazas
4. Revisa nivel de riesgo (LOW/MEDIUM/HIGH)

### Generador de Dorks

1. Selecciona el modo **DORKS**
2. Ingresa el target
3. Selecciona categorías de dorks
4. Click en **GENERATE DORKS**
5. Usa botones SEARCH o COPY

---

## 📁 Estructura del Proyecto

```
osint-terminal/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Checkbox.jsx
│   │   │   ├── GoogleDorksPanel.jsx
│   │   │   ├── HistoryPanel.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── ModeSelectorTabs.jsx
│   │   │   ├── OsintToolsPanel.jsx
│   │   │   ├── ProgressIndicatorSystem.jsx
│   │   │   ├── ResultsDisplayManager.jsx
│   │   │   ├── Select.jsx
│   │   │   └── TerminalOutputController.jsx
│   │   ├── AppIcon.jsx
│   │   ├── AppImage.jsx
│   │   ├── ErrorBoundary.jsx
│   │   └── ScrollToTop.jsx
│   ├── pages/
│   │   ├── osint-terminal-dashboard/
│   │   │   ├── components/
│   │   │   │   ├── HeaderSection.jsx
│   │   │   │   ├── SearchPanel.jsx
│   │   │   │   └── VignetteOverlay.jsx
│   │   │   └── index.jsx
│   │   └── NotFound.jsx
│   ├── styles/
│   │   ├── index.css
│   │   └── tailwind.css
│   ├── utils/
│   │   └── cn.js
│   ├── App.jsx
│   ├── index.jsx
│   └── Routes.jsx
├── .gitignore
├── .vercelignore
├── components.json
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🌐 APIs Utilizadas

### GitHub API
- **Endpoint**: `https://api.github.com/users/{username}`
- **Rate Limit**: 60 requests/hora (sin auth)
- **Datos**: Perfil, repos, organizaciones

### HackerNews API
- **Endpoint**: `https://hacker-news.firebaseio.com/v0/user/{username}.json`
- **Rate Limit**: Sin límite
- **Datos**: Karma, submissions, about

### crt.sh
- **Endpoint**: `https://crt.sh/?q={domain}&output=json`
- **Rate Limit**: Sin límite oficial
- **Datos**: Certificados SSL, subdominios

### ip-api.com
- **Endpoint**: `https://ip-api.com/json/{ip}`
- **Rate Limit**: 45 requests/minuto
- **Datos**: Geolocalización, ISP, ASN, flags

---

## 🗺️ Roadmap

- [ ] Modo de escaneo de email
- [ ] Integración con Shodan API
- [ ] Exportación a JSON/CSV
- [ ] Gráficos de visualización de datos
- [ ] Modo oscuro/claro toggle
- [ ] Búsqueda de breaches (HIBP)
- [ ] Análisis de redes sociales extendido
- [ ] Guardado de escaneos en la nube
- [ ] Comparación de escaneos históricos
- [ ] API REST propia para backend opcional

---

## 🤝 Contribuciones

Las contribuciones son lo que hace que la comunidad open source sea un lugar increíble para aprender, inspirar y crear. Cualquier contribución que hagas será **muy apreciada**.

### Cómo Contribuir

1. **Fork el proyecto**
2. **Crea tu Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit tus cambios**
   ```bash
   git commit -m 'Add: nueva funcionalidad increíble'
   ```
4. **Push a la Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Abre un Pull Request**

### Guías de Contribución

- Usa commits semánticos (Add, Fix, Update, Remove, Refactor)
- Documenta nuevas funcionalidades
- Añade tests si es posible
- Mantén el estilo de código consistente
- Actualiza el README si es necesario

### Reportar Bugs

Si encuentras un bug, por favor abre un [issue](../../issues) con:
- Descripción clara del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si aplica
- Información del navegador/OS

---

## 📄 Licencia

Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.

```
MIT License

Copyright (c) 2024 OSINT Terminal

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📧 Contacto

**Proyecto**: [https://github.com/KevPatterson/OSINT_Terminal_App.git](https://github.com/KevPatterson/OSINT_Terminal_App.git)

**Issues**: [https://github.com/KevPatterson/OSINT_Terminal_App.git/issues](https://github.com/KevPatterson/OSINT_Terminal_App.git/issues)

---

## 🙏 Agradecimientos

- [GitHub API](https://docs.github.com/en/rest) - API de perfiles de usuario
- [HackerNews API](https://github.com/HackerNews/API) - Datos de usuarios HN
- [crt.sh](https://crt.sh/) - Certificate Transparency logs
- [ip-api.com](https://ip-api.com/) - Geolocalización de IPs
- [Radix UI](https://www.radix-ui.com/) - Componentes accesibles
- [Lucide Icons](https://lucide.dev/) - Iconos hermosos
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Vite](https://vitejs.dev/) - Build tool increíble

---

<div align="center">

**⭐ Si este proyecto te fue útil, considera darle una estrella ⭐**

Hecho con 💚 y mucho ☕

</div>
