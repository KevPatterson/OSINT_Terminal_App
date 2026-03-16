# Kimi Agent Complete OSINT Terminal App

> Aplicación OSINT de terminal interactiva, construida con React, Vite y Tailwind CSS.

## Características principales

- Interfaz de usuario moderna y responsiva
- Paneles para Google Dorks, historial, herramientas OSINT y resultados
- Terminal interactiva para búsquedas y comandos OSINT
- Gestión de errores y overlays visuales
- Arquitectura modular y escalable

## Estructura del proyecto

```
src/
  App.jsx
  index.jsx
  Routes.jsx
  components/
    AppIcon.jsx
    AppImage.jsx
    ErrorBoundary.jsx
    ScrollToTop.jsx
    ui/
      Button.jsx
      Checkbox.jsx
      GoogleDorksPanel.jsx
      HistoryPanel.jsx
      Input.jsx
      ModeSelectorTabs.jsx
      OsintToolsPanel.jsx
      ProgressIndicatorSystem.jsx
      ResultsDisplayManager.jsx
      Select.jsx
      TerminalOutputController.jsx
  pages/
    NotFound.jsx
    osint-terminal-dashboard/
      index.jsx
      components/
        HeaderSection.jsx
        SearchPanel.jsx
        VignetteOverlay.jsx
  styles/
    index.css
    tailwind.css
  utils/
    cn.js
```

## Instalación y uso

1. Clona el repositorio:
   ```bash
   git clone <url-del-repo>
   cd "Kimi_Agent_Complete OSINT Terminal App"
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Inicia la app en modo desarrollo:
   ```bash
   npm run dev
   ```

## Archivos importantes

- `.gitignore`: Ignora archivos y carpetas que no deben subirse al repositorio (node_modules, .env, build, etc).
- `.vercelignore`: Ignora archivos y carpetas para despliegues en Vercel, optimizando el bundle.

## Despliegue en Vercel

1. Sube el proyecto a un repositorio de GitHub.
2. Conecta el repo a [Vercel](https://vercel.com/).
3. Vercel detectará automáticamente el framework y usará los archivos `.vercelignore` y `.gitignore`.

## Configuración adicional

- Personaliza las variables de entorno en `.env` según tus necesidades.
- Ajusta la configuración de Tailwind en `tailwind.config.js`.
- Modifica los paneles y componentes en `src/components/ui/` para agregar nuevas herramientas OSINT.

---

Proyecto base: React + Vite + Tailwind CSS
Autor: [Tu Nombre]
Licencia: MIT
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
