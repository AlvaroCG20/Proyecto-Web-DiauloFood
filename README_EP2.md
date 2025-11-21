# Como entrar iniciar el proyecto

- Para acceder debe correr la base de datos en xampp, importe diaulofood.sql (archivo ubicado dentro de la carpeta ../backend/database) , luego utilice la siguiente query para crear el usuario para acceder:
  
insert into usuarios(email, rut, nombre_usuario, id_rol, contrasena) values ('ejemplo@gmail.com', 123456789, 'usuario ejemplo', 1, '123456')

- Una vez la base de datos esté activa, en la terminal, vaya a la carpeta backend usando 'cd backend' y ejecute
el comando 'node index.js', deberia aparecer el mensaje "Conectado a la base de datos" y "Corriendo en el puerto 3000"

- Luego, en una nueva terminal en la carpeta principal del proyecto ejecute 'ionic serve'


- Una vez iniciada la página haga click en el botón "Inicar Sesion" y utilice las credenciales:

email: ejemplo@gmail.com
contraseña: 123456

- Esto debido a que aun no está creado el frontend para registro de usuarios dentro de la plataforma, solo se tiene formulario de registro para garzones
- 
# Implementaciones de la segunda entrega
## Frontend
- En la sección de administrador se habilitó la opción de cambiar usuarios.

## Base de datos
- Se creó la base de datos utilizando MySQL
- Se utilizó Xampp para correr el servidor de base de datos.
- MER:
- <img width="3480" height="1712" alt="erdplus (2)" src="https://github.com/user-attachments/assets/4c1352dd-9856-4877-a107-a2bd037df9b9" />


## Backend
- Se creó el servidor mediante Express en la carpeta: backend.
- En la misma carpeta Backend se configuró la conexión con el login.
- Se definieron los observables para el login y registro de usuarios en backend/services.
- Se establecieron las autenticaciones con JWT en la carpeta app/routes.
- Se actualizó el apartado de garzones para que se mostraran los cambios en este campo y se reflejaran en la base de datos.

## Pruebas en PostMan:
<img width="1362" height="697" alt="Captura de pantalla 2025-11-02 224219" src="https://github.com/user-attachments/assets/ce51983e-16c5-4d24-a93f-36b4e3eb7375" />

<img width="797" height="490" alt="Captura de pantalla 2025-11-02 223011" src="https://github.com/user-attachments/assets/d52a26ab-8636-4c00-bc9d-e2808d1c0a12" />

<img width="1362" height="697" alt="Captura de pantalla 2025-11-02 224219" src="https://github.com/user-attachments/assets/1aa233cf-6bf1-4691-a138-21309feab5a9" />
