# 📅 Calendario de Turnos — Sierra Gorda SCM

Aplicación web para visualizar la rotación de turnos 7×7 en faena minera.

## Ciclo de Rotación (28 días)

| Días   | Turno     | Horario        |
|--------|-----------|----------------|
| 1–7    | 🌙 Noche  | 20:00 – 08:00 |
| 8–14   | 🏠 Descanso | Libre        |
| 15–21  | ☀️ Día    | 08:00 – 20:00 |
| 22–28  | 🏠 Descanso | Libre        |

**Fecha ancla:** 18 de Febrero 2026 = Inicio Turno Noche

---

## 🚀 Despliegue en Vercel (Paso a Paso)

### Requisitos previos
- Cuenta en [GitHub](https://github.com) (gratis)
- Cuenta en [Vercel](https://vercel.com) (gratis, puedes registrarte con GitHub)

### Paso 1: Crear repositorio en GitHub

1. Ve a [github.com/new](https://github.com/new)
2. Nombre del repositorio: `calendario-turnos`
3. Déjalo como **Public** o **Private** (tu elección)
4. Clic en **Create repository**

### Paso 2: Subir el código

Abre una terminal en la carpeta de este proyecto y ejecuta:

```bash
# Inicializar git
git init

# Agregar todos los archivos
git add .

# Primer commit
git commit -m "Calendario de turnos 7x7 - Sierra Gorda SCM"

# Conectar con tu repositorio (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/calendario-turnos.git

# Subir el código
git branch -M main
git push -u origin main
```

### Paso 3: Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub
2. Clic en **"Add New..." → "Project"**
3. Selecciona el repositorio `calendario-turnos`
4. Vercel detectará automáticamente que es Vite + React
5. Clic en **"Deploy"**
6. ¡Listo! En ~60 segundos tendrás tu URL: `https://calendario-turnos.vercel.app`

### Paso 4: Compartir

Copia la URL y compártela con tus colegas por WhatsApp, email, o donde quieras.

**Tip para el celular:** Abre la URL en Chrome/Safari → menú ⋮ → "Agregar a pantalla de inicio". Queda como una app.

---

## 💻 Desarrollo local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar la versión de producción
npm run preview
```

---

## 🛠️ Tecnologías

- **Vite** — Bundler ultrarrápido
- **React 18** — UI reactiva
- **DM Sans** — Tipografía profesional (Google Fonts)

---

## 📝 Personalización

### Cambiar la fecha ancla
En `src/components/MiningShiftCalendar.jsx`, busca:
```javascript
const anchor = new Date(2026, 1, 18); // 18 Feb 2026
```
Modifica la fecha según tu ciclo (mes indexado desde 0: enero=0, febrero=1, etc.)

### Cambiar horarios
En el objeto `SHIFT_TYPES` al inicio del archivo, modifica los campos `hours`.

---

Desarrollado para el equipo de Dispatch Operations · Sierra Gorda SCM
