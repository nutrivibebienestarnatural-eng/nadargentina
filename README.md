# Gestor Tienda Nube PRO V5 — Web App

Sistema completo de gestión de pedidos, envíos y kits para Tienda Nube.

## ✅ Funciones
- 📊 Dashboard con KPIs y gráficos
- 📦 Importar pedidos CSV/Excel **sin duplicados**
- 🔍 Filtros por producto, cliente, estado
- 🔄 Consolidar pedidos seleccionados (con lógica de kits)
- 🚚 Control de envíos y seguimientos
- ⊛ Editor de kits con exportación JSON

---

## 🚀 GUÍA DE DEPLOY — PASO A PASO

### PASO 1 — Instalar Node.js (solo la primera vez)
1. Ir a https://nodejs.org
2. Descargar la versión **LTS**
3. Instalarlo (siguiente, siguiente, instalar)
4. Verificar: abrir CMD y escribir `node --version`

---

### PASO 2 — Subir a GitHub

1. Ir a https://github.com y loguearte
2. Click en **"New repository"** (botón verde)
3. Nombre: `gestor-tienda-nube`
4. Dejarlo en **Public** o **Private** (como prefieras)
5. Click **"Create repository"**
6. GitHub te va a mostrar comandos — copialos

7. Abrir **CMD** en la carpeta del proyecto:
   ```
   cd C:\ruta\a\tu\carpeta\gestor-app
   ```

8. Ejecutar estos comandos uno por uno:
   ```
   git init
   git add .
   git commit -m "Primera versión del Gestor"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/gestor-tienda-nube.git
   git push -u origin main
   ```
   (Reemplazá `TU_USUARIO` con tu nombre de usuario de GitHub)

---

### PASO 3 — Deploy en Vercel

1. Ir a https://vercel.com
2. Click **"Sign Up"** → elegir **"Continue with GitHub"**
3. Autorizar Vercel a acceder a tu GitHub
4. En el dashboard de Vercel, click **"Add New Project"**
5. Buscar y seleccionar el repo `gestor-tienda-nube`
6. Click **"Deploy"** (no tocar nada más)
7. Esperar ~2 minutos

¡Listo! Vercel te da una URL tipo:
```
https://gestor-tienda-nube.vercel.app
```

---

### PASO 4 — Actualizar la app en el futuro

Cada vez que hagas cambios en los archivos:
```
git add .
git commit -m "descripcion del cambio"
git push
```
Vercel se actualiza automático en ~1 minuto.

---

## 🛠️ Desarrollo local

```bash
npm install
npm run dev
```
Abrí http://localhost:3000

---

## 📁 Estructura del proyecto

```
gestor-app/
├── src/
│   ├── app/
│   │   ├── page.js          # Shell principal con navegación
│   │   ├── layout.js        # Layout con fuentes
│   │   └── globals.css      # Estilos globales
│   ├── components/
│   │   ├── Dashboard.js     # KPIs y gráficos
│   │   ├── Pedidos.js       # Importar y filtrar pedidos
│   │   ├── Consolidado.js   # Consolidar + exportar PDF/CSV
│   │   ├── Envios.js        # Seguimientos
│   │   └── EditorKits.js    # Editor de kits
│   └── lib/
│       └── store.js         # Estado global compartido
├── package.json
└── next.config.js
```
