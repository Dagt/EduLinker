# Permissions Overview

EduLinker aplica controles basados en roles y en el identificador de la
escuela (`school_id`) enviado mediante el encabezado `X-SCHOOL-ID`.

## Roles y acciones

- **DIRECTOR**: puede gestionar eventos globales, asignar docentes y vocals,
  registrar y editar eventos de recaudación. No puede participar en los chats
  de grupo.
- **MAESTRO_TITULAR**: gestiona los grupos que tutela; puede crear tareas,
  anuncios y eventos de grupo, además de participar en los chats.
- **MAESTRO_ITINERANTE**: puede crear eventos para los grupos donde está
  asignado y subir fotos de actividades.
- **VOCAL**: además de las capacidades de un padre, puede registrar ingresos
  y gastos de recaudaciones para los grupos donde fue asignado.
- **PADRE**: accede al contenido de los grupos de sus hijos, puede crear
  sugerencias y participar en los chats correspondientes.

## Reglas clave

- Todas las vistas establecen `permission_classes` y filtran por `school_id`.
- La exportación ICS de eventos exige el encabezado `X-SCHOOL-ID` y
  valida que corresponda con la escuela del usuario autenticado. Un
  encabezado de otra escuela produce un error de permiso.
- Los reportes de analítica y los registros de auditoría verifican que el
  encabezado `X-SCHOOL-ID` coincida con la escuela del usuario. Cualquier
  discrepancia resulta en un error 403 y evita el acceso cruzado entre
  instituciones.
- Los registros de recaudación y las evidencias de gasto requieren que el
  evento, el grupo y el usuario pertenezcan a la misma escuela, y sólo pueden
  ser registrados por directores, maestros de grupo o vocals asignados.
- Las quejas privadas sólo están disponibles para su creador, el maestro
  involucrado, el director y los participantes autorizados; cualquier otro
  usuario recibe un error de permiso.
- Las sugerencias sólo pueden ser creadas por padres, vocals o maestros
  titulares; los directores quedan excluidos.
- La administración de usuarios está reservada a **ADMIN_TENANT** (puede
  cambiar roles y desactivar cuentas) y **DIRECTOR** (puede listar y crear
  usuarios dentro de su escuela). Los directores no pueden modificar roles.
- Los endpoints de usuarios, alumnos y relaciones padre-alumno siempre
  filtran por `school_id` y validan que los registros pertenezcan a la misma
  escuela, evitando fugas de información entre instituciones.

Estas normas garantizan que cada usuario interactúe únicamente con la
información de su propia institución y según las responsabilidades de su rol.
