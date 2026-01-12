# ElArtesano - Anteproyecto

Su elaboración ha de ser en GitHub.

## Autor del proyecto 
Fernando
## Título y temática
El Artesano - Pagina web de pescaderia
## Objetivos/descripción
La pagina mostrará el catalogo de platos contacto, reservar mesa y ubicación.

## Funcionalidades: aquí ya hay que hacer un análisis previo donde de alguna forma se vea que cubre los requisitos mínimos (roles permitidos con sus vistas, especificando vistas estáticas, dinámicas y vistas CRUD de mantenimiento)
### Roles
- Rol: Administrador - Puede gestionar el catalogo, clientes y contactos
- Rol: Cliente - Puede realizar reservas. 
- Rol: Anonimo - no tiene permisos de modificar, solo puede ver el catalogo

### Vistas: 
- Home: Muestra el catalogo de platos.
- Login y registro: Es la vista login
- Crud Usuarios: Permite al administrador gestionar a los usuarios.
- reservas-Cliente: Cuando un usuario está registrado, puede ver una lista de las mesas disponibles en determinada fecha y hora, y solicitar una reserva si está libre o anular su propia reserva.
- Reservas-Administrador: El administrador puede ver todas las reservas y anularlas o modificarlas.
- Perfil de usuario: Permite al usuario ver su historial de reservas y tambien gestionar su cuenta.
- Crud de Platos: Permite al administrador agregar platos.
- vista detalles: Permite ver detalladamente los ingredientes del plato a modo de descripción.
## Arquitectura / tecnología usada en frontend, backend y despliegue:
- Prototipado: Figma
- Maquetación CSS: Modulos CSS
- Logica frontend: React
- Logica backend: PHP
- Base de datos: Mysql
- ORM: ?
- Despliegue: AWS, Docker
## Esquema entidad-relación de la base de datos, puede ir también con una explicación textual tanto de las entidades que allí aparecen como de las relaciones de las mismas.
<img width="1202" height="738" alt="image" src="https://github.com/user-attachments/assets/c85f5b32-eeb2-4195-96ce-39f79736c918" />
