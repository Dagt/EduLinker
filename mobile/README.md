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

## Asignación de vocales

Los directores y maestros titulares pueden administrar las asignaciones de vocales desde la app móvil. La pantalla **Vocales** permite:

- Ver los vocales activos de un grupo.
- Seleccionar un padre disponible del grupo para asignarlo como vocal.
- Revocar asignaciones existentes.

Antes de acceder a la pantalla se debe indicar el ID del grupo sobre el que se trabajará.

