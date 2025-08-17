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

## Crear encuestas

Los usuarios con permisos de **director**, **maestro titular**, **maestro itinerante** o **vocal** pueden crear encuestas desde la app móvil. Para ejecutar los tests o desarrollar esta funcionalidad:

```bash
cd mobile
npm test
```

En la aplicación, navega a *Encuestas* y selecciona **Crear encuesta** para registrar título, descripción, opciones, alcance, grupo y fechas.

