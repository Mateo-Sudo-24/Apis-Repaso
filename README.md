# APIs Combinadas

Una aplicación móvil híbrida desarrollada con **Ionic** y **Angular** que permite consumir y combinar varias APIs gratuitas de manera interactiva. Incluye autenticación de usuarios con Firebase, gestión de favoritos, y generación de colores aleatorios para añadir creatividad. Ideal para relajarse con chistes, imágenes de mascotas, citas motivacionales y colores vibrantes.

---

## Características

- **Consumo de APIs**: Integra APIs gratuitas para chistes en español, imágenes de gatos y perros, citas motivacionales, y colores aleatorios.
- **Modo Combinado**: Opción "Chiste con Mascota" que combina un chiste con una imagen aleatoria de gato o perro.
- **Autenticación**: Registro, login y recuperación de contraseña con confirmación por email usando Firebase Auth.
- **Favoritos**: Guarda y visualiza tus elementos favoritos en una lista personalizada, almacenados en Firestore.
- **Interfaz Intuitiva**: Navegación por segmentos en el dashboard para seleccionar APIs fácilmente.
- **PWA y APK**: Funciona como Progressive Web App (PWA) y se puede generar como APK para Android.
- **Creatividad**: Incluye colores aleatorios generados por API, con visualización de hex y RGB.

---

## Tecnologías Utilizadas

### Frontend
- **Ionic** con **Angular** (NgModules para estructura modular)

### APIs Consumidas
- [JokeAPI](https://v2.jokeapi.dev/joke/Any?lang=es) - Chistes en español
- [The Cat API](https://api.thecatapi.com/v1/images/search) - Imágenes de gatos
- [Dog CEO API](https://dog.ceo/api/breeds/image/random) - Imágenes de perros
- [Quotable API](https://api.quotable.io/random) - Citas motivacionales
- [ColourLovers API](https://www.colourlovers.com/api/colors/random?format=json) - Colores aleatorios

### Backend/Auth
- **Firebase** (Authentication + Firestore)

### Hosting
- **Firebase Hosting** para despliegue web

### APK
- **Capacitor** para generar APK Android

### Lenguajes
- TypeScript, HTML, SCSS

---

## Instalación

### 1. Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/mi-app-apis.git
cd mi-app-apis
```

### 2. Instala dependencias:

```bash
npm install
```

### 3. Configura Firebase:

- Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
- Habilita **Authentication** (email/password) y **Firestore**
- Copia la configuración de Firebase y pégala en `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "TU_API_KEY",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
  }
};
```

### 4. Ejecuta en desarrollo:

```bash
ionic serve
```

Abre en [http://localhost:8100](http://localhost:8100)

---

##  Uso

1. **Registro/Login**: Crea una cuenta o inicia sesión. Usa "Recuperar Contraseña" si olvidas tu clave (recibirás un email de Firebase).

2. **Dashboard**: Selecciona una API en el segmento:
   - **Chiste** 😂
   - **Gato** 🐱
   - **Perro** 🐶
   - **Chiste con Mascota** 🎭🐾
   - **Cita Motivacional** 💭
   - **Color Aleatorio** 🎨 (se muestra un cuadrado coloreado con hex y RGB)

3. **Guarda en favoritos** haciendo clic en "Guardar en Favoritos"

4. **Favoritos**: Navega a la página de Favoritos para ver tus elementos guardados (chistes, imágenes, citas, colores)

5. **Logout**: Cierra sesión desde el dashboard

---

## APIs Detalladas

| API | Descripción |
|-----|-------------|
| **Chiste** | Muestra un chiste aleatorio en español |
| **Gato/Perro** | Imagen aleatoria de mascota |
| **Chiste con Mascota** | Combina un chiste con una imagen aleatoria |
| **Cita Motivacional** | Cita inspiradora con autor |
| **Color Aleatorio** | Genera un color con visualización y datos hex/RGB |

---

## 📱 Generación de APK

### 1. Agrega Capacitor para Android:

```bash
ionic capacitor add android
ionic capacitor sync
```

### 2. Abre en Android Studio:

```bash
ionic capacitor open android
```

### 3. Construye la APK:

En Android Studio, ve a **Build > Build Bundle(s)/APK(s) > Build APK**.

La APK se genera en: `android/app/build/outputs/apk/debug/`

---

## Despliegue en Firebase Hosting

### 1. Instala Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
```

### 2. Construye para producción:

```bash
ionic build --prod
```

### 3. Inicializa y despliega:

```bash
firebase init hosting  # Selecciona el proyecto Firebase
firebase deploy
```

El enlace de hosting será algo como: `https://tu-proyecto.web.app`

---

## Estructura del Proyecto

```
mi-app-apis/
├── src/
│   ├── app/
│   │   ├── app.module.ts          # Configuración principal de Angular/Firestore
│   │   ├── app-routing.module.ts  # Rutas de navegación
│   │   ├── services/
│   │   │   └── firebase.service.ts # Servicio para Auth y Firestore
│   │   └── pages/
│   │       ├── login/             # Página de login/registro
│   │       ├── dashboard/         # Dashboard con APIs
│   │       └── favorites/         # Lista de favoritos
│   ├── components/
│   │   └── api-display/           # Componente para mostrar APIs
│   └── environments/
│       └── environment.ts         # Config Firebase
├── capacitor.config.ts            # Config Capacitor
└── README.md
```

---

## Video de funcionamiento 
https://vm.tiktok.com/ZMAWkraaL/

