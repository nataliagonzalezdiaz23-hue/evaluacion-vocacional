# 🎓 GUÍA PASO A PASO — Publicar tu Plataforma de Evaluación Vocacional

## Tiempo estimado: 20-30 minutos (solo la primera vez)

---

## PASO 1: Crear la base de datos (Firebase) — 10 min

Firebase es gratis para tu volumen de datos (67 estudiantes).

1. Ve a **https://console.firebase.google.com/**
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Agregar proyecto"** (o "Add project")
4. Ponle nombre: `evaluacion-pablo-neruda`
5. Desmarca Google Analytics (no lo necesitas) → Clic en **Crear proyecto**
6. Una vez creado, en el menú izquierdo haz clic en **"Realtime Database"**
7. Clic en **"Crear base de datos"** (Create database)
8. Selecciona la ubicación más cercana (us-central1 está bien)
9. Selecciona **"Iniciar en modo de prueba"** (Start in test mode) → Clic en **Habilitar**
10. ¡Listo! Verás una URL como esta:
    ```
    https://evaluacion-pablo-neruda-default-rtdb.firebaseio.com
    ```
11. **Copia esa URL** — la necesitas para el siguiente paso

### ⚠️ IMPORTANTE: Cambiar reglas de seguridad
En la pestaña "Reglas" de Realtime Database, reemplaza el contenido con:
```json
{
  "rules": {
    "students": {
      ".read": true,
      ".write": true
    }
  }
}
```
Clic en **Publicar**. (Esto permite que la app lea y escriba datos. Para tu investigación con 67 estudiantes esto es suficiente.)

---

## PASO 2: Configurar la app con tu base de datos — 2 min

1. Abre el archivo `src/App.jsx`
2. En la línea 7 encontrarás:
   ```
   const DB_URL = "https://TU-PROYECTO-default-rtdb.firebaseio.com";
   ```
3. **Reemplaza** `https://TU-PROYECTO-default-rtdb.firebaseio.com` con la URL que copiaste en el paso anterior
4. Guarda el archivo

---

## PASO 3: Crear cuenta en Vercel y subir — 10 min

### Opción A: Subir con GitHub (recomendada)

1. Ve a **https://github.com** y crea una cuenta (o inicia sesión)
2. Crea un nuevo repositorio:
   - Nombre: `evaluacion-vocacional`
   - Privado: ✅ (para que nadie más lo vea)
3. Sube todos los archivos de la carpeta `evaluacion-vocacional/` al repositorio
   - Puedes arrastrar y soltar los archivos en GitHub
4. Ve a **https://vercel.com** y crea cuenta con tu GitHub
5. Clic en **"Add New" → "Project"**
6. Selecciona tu repositorio `evaluacion-vocacional`
7. Framework: **Vite** (Vercel lo detecta automáticamente)
8. Clic en **Deploy**
9. ¡En 1-2 minutos tendrás tu URL! Algo como:
   ```
   https://evaluacion-vocacional.vercel.app
   ```

### Opción B: Subir directamente (sin GitHub)

1. Instala Node.js en tu computador: https://nodejs.org (versión LTS)
2. Abre la terminal/CMD en la carpeta del proyecto
3. Ejecuta estos comandos:
   ```
   npm install
   npm run build
   ```
4. Instala Vercel CLI:
   ```
   npm install -g vercel
   ```
5. Ejecuta:
   ```
   vercel
   ```
6. Sigue las instrucciones en pantalla
7. ¡Listo! Te dará la URL

---

## PASO 4: Compartir con los estudiantes

Una vez publicada, comparte la URL con tus estudiantes por WhatsApp o en clase:

```
🎓 Evaluación Vocacional — I.E. Pablo Neruda
Ingresa aquí: https://tu-url.vercel.app

1. Abre el enlace desde tu celular o computador
2. Ingresa tu número de documento y nombre
3. Selecciona tu grupo (A o B)
4. Completa las pruebas

¡Recuerda responder con calma y sinceridad!
```

---

## PASO 5: Ver resultados y exportar datos

1. Entra a tu URL
2. En número de documento escribe: **admin2025**
3. En nombre escribe tu nombre (cualquier cosa)
4. Verás el panel con todos los resultados
5. Haz clic en **"Exportar datos (CSV)"** para descargar todo a Excel

---

## INFORMACIÓN TÉCNICA

| Dato | Valor |
|------|-------|
| Login admin | Documento: `admin2025` |
| Grupo A | = 11-01 (experimental) |
| Grupo B | = 11-02 (control) |
| Pruebas pre-test | Rosenberg + MSPSS + AETDC + EFT |
| Pruebas post-test | Rosenberg + MSPSS + AETDC |
| EFT | Solo se aplica una vez (pre-test) |
| Datos exportados | CSV con todos los puntajes y subescalas |

---

## ¿PROBLEMAS?

- **La app no carga:** Verifica que la URL de Firebase esté bien escrita en App.jsx
- **No se guardan datos:** Revisa las reglas de Firebase (paso 1, sección de reglas)
- **Un estudiante no puede entrar:** Debe ingresar documento Y nombre
- **Quiero cambiar algo:** Edita App.jsx y vuelve a hacer deploy en Vercel

---

*Maestría en Innovación Educativa — Politécnico Grancolombiano 2025*
