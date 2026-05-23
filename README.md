# ElArtesano



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

## Base de datos
- Users: Contendra los usuarios y sus datos correspondientes
- Rol: Contiene el rol admin y el rol usuario. Si no hay un rol asignado se le conocerá como anonimo 
- Reserva: Contiene la información de las reservas.
- Mesa: Contiene los datos de las mesas del restaurante
- Plato: Información de los platos, nombre texto, imagen y etc.
- Plato_Ingrediente: Tabla que gestionará la cantidad de ingredientes que contiene un plato
- Ingrediente: Tabla que contiene todos los ingredientes que podran llevar los platos.
## Esquema entidad-relación de la base de datos, puede ir también con una explicación textual tanto de las entidades que allí aparecen como de las relaciones de las mismas.
<img width="1202" height="738" alt="image" src="https://github.com/user-attachments/assets/c85f5b32-eeb2-4195-96ce-39f79736c918" />

## Backend
El backend es una API REST con Laravel 11. Se encuentra en Laravel gestor-pescaderia 

#1 Entrar al directorio
cd Laravel/gestor-pescaderia 

# 2. Instalar dependencias PHP
composer install

# 3. Crear el archivo de entorno
cp .env.example .env

# 4. Configurar .env:
#   DB_DATABASE=classicgames
#   DB_USERNAME=root
#   DB_PASSWORD=tu_password
#   APP_URL=http://localhost:8000
#   FRONTEND_URL=http://localhost:5173   (para CORS)

# 5. Generar la clave de aplicación
php artisan key:generate

# 6. Ejecutar migraciones y seeders
php artisan migrate --seed

En mi caso. Yo realicé el migrate --seed con un force dentro de RailWay 

##Video 
##Documentación tecnica 
El Artesano es una aplicación compuesta de dos capaas independientes

Frontend, desplegado en Vercel y hecho con React ( Vite + JavaScript) 

Y BackEnd, hecho con Laravel y desplegado en Railway

La base de datos está hecha con MySQL 8
Toda la comunicación entre frontend y backend se realiza mediante fetch nativo sobre endpoints JSON. Las respuestas siempre siguen la misma envoltura:

##Frontend 
React 19
JavaScript 
Vite 8
React Router 7
react-router-dom

##Flujo de autenticación 
- El usuario hace login → el backend devuelve un token Sanctum.
- El token y los datos del usuario se guardan en localStorage.
- AuthContext los expone mediante useAuth() a toda la app.
- Las rutas protegidas (ProtectedRoute, AdminRoute) redirigen a /login si no hay sesión activa.
- Todas las peticiones autenticadas incluyen la cabecera Authorization: Bearer <token>.

##API REST
La url base es http://elartesano-production.up.railway.app


-  GET_PLATOS_ENDPOINT                = Accede a la lista de los platos
-  GET_USUARIOS_ENDPOINT              = Accede a lista de los usuarios
- GET_HORAS_ENDPOINT                 = Accede a las horas disponibles
- POST_RESERVA_ENDPOINT              = formulario para las resservas
- FILTER_PLATO_INGREDIENTES_ENDPOINT = Permite agregar un filtro para los ingredientes
- GET_MESAS_ENDPOINT                 = Accede a la información de las mesas
- LOGIN_ENDPOINT                     = logea al usuario
- ME_ENDPOINT                        = Accede a los datos del usuario
- UPDATE_ME_ENDPOINT                 = Actualiza los datos del usuario
- CREATE_ME_ENDPOINT                 = Registra al usuario en la base de datos
- DELETE_ME_ENDPOINT                 = Borrará al usuario
- GET_INGREDIENTES_ENDPOINT          = Accederá a los ingredientes
- GET_RESERVAS_ENDPOINT              = Accederá a todas las reservas
- DELETE_PLATO_ENDPOINT              = Borrará el plato seleccionado

Pagina desplegada: https://gestor-pescaderia-frontend.vercel.app/

- EntidadRol: nombre(administrador, cliente, anónimo)
- Entidad Reserva: estado(activada, confirmada y cancelada)
