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

## Asignación de vocales

Los usuarios con rol **MAESTRO_TITULAR** o **DIRECTOR** pueden gestionar los vocales de un grupo desde la app móvil.

1. En el menú principal, elige *Vocales*.
2. Selecciona el grupo deseado.
3. La pantalla mostrará los vocales activos y los padres disponibles.
4. Toca un padre disponible y pulsa **Asignar** para nombrarlo vocal.
5. Para revocar a un vocal activo, utiliza el botón **Revocar** junto a su nombre.

Internamente se utilizan las peticiones `POST /groups/vocal-assignments/` y `POST /groups/vocal-assignments/{id}/deactivate/`.

