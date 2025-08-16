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

- Todas las consultas de la API filtran por `school_id`.
- La exportación ICS de eventos exige el encabezado `X-SCHOOL-ID` y sólo
  devuelve eventos de la escuela indicada y filtrados según la audiencia del
  usuario; intentar usar el encabezado de otra escuela no expone eventos.
- Los registros de recaudación y las evidencias de gasto requieren que el
  evento, el grupo y el usuario pertenezcan a la misma escuela, y sólo pueden
  ser registrados por directores, maestros de grupo o vocals asignados.
- Las quejas privadas sólo están disponibles para su creador, el maestro
  involucrado, el director y los participantes autorizados; cualquier otro
  usuario recibe un error de permiso.
- Las sugerencias sólo pueden ser creadas por padres, vocals o maestros
  titulares; los directores quedan excluidos.

Estas normas garantizan que cada usuario interactúe únicamente con la
información de su propia institución y según las responsabilidades de su rol.

