# App móvil

## Captura y selección de fotos

El componente `PhotoPicker` utiliza [`expo-image-picker`](https://docs.expo.dev/versions/latest/sdk/imagepicker/) para tomar una foto con la cámara o elegir una imagen de la galería.

### Permisos

Al usar el componente se solicitan los permisos de cámara y acceso a la galería. Asegúrate de aceptarlos en el dispositivo o emulador:

```ts
await ImagePicker.requestCameraPermissionsAsync();
await ImagePicker.requestMediaLibraryPermissionsAsync();
```

### Pasos de uso

1. Instala las dependencias del proyecto si aún no lo has hecho:
   ```bash
   cd mobile
   npm install
   ```
2. Inicia la app:
   ```bash
   npx expo start
   ```
3. Importa y utiliza el componente:
   ```tsx
   import PhotoPicker from "./src/components/PhotoPicker";

   <PhotoPicker onPhoto={(base64) => console.log(base64)} />
   ```

La función `onPhoto` recibe la imagen codificada en Base64 lista para enviarse a la API.

## Tareas y anuncios

Los usuarios con rol **MAESTRO_TITULAR** o **MAESTRO_ITINERANTE** pueden crear nuevas tareas y anuncios desde la aplicación.

1. Inicia la app y abre el menú principal.
2. Selecciona *Nueva tarea* o *Nuevo anuncio*.
3. Completa el formulario con título, descripción, grupo, fecha y adjunta archivos si es necesario.
4. Al guardar se envía una petición `POST` al API utilizando las funciones `createHomework` o `createAnnouncement`.

Los adjuntos se suben con `uploadFile`, que devuelve la URL remota lista para almacenarse en el backend.

## Encuestas

Los roles **MAESTRO_TITULAR**, **MAESTRO_ITINERANTE**, **VOCAL** activo y **DIRECTOR** pueden crear encuestas desde la pantalla de encuestas.

1. Abre el menú principal y selecciona *Encuestas*.
2. Presiona *Crear encuesta*.
3. Completa título, descripción, opciones, alcance (escuela o grupo), anonimato y fechas.
4. Al guardar se envía una petición `POST` al API mediante la función `createSurvey`.

## Vocales del grupo

Los roles **MAESTRO_TITULAR** y **DIRECTOR** pueden gestionar los vocales activos de un grupo.

1. Abre el menú principal y selecciona *Vocales*.
2. Elige el grupo deseado.
3. La pantalla muestra los vocales activos y los padres disponibles del grupo.
4. Usa los botones *Asignar* o *Revocar* para activar o desactivar a un vocal mediante las funciones `assignVocal` y `deactivateVocal`.

