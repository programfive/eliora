# ELIORA - Chatbot de Apoyo Emocional para Estudiantes

## Descripción
ELIORA es una aplicación web que utiliza inteligencia artificial para brindar apoyo psicológico y emocional a estudiantes de la Universidad Bethesda. Ofrece una interfaz conversacional empática, accesible 24/7, que permite a los estudiantes expresar sus emociones, recibir orientación y apoyo emocional de manera confidencial.

También cuenta con un panel administrativo que proporciona estadísticas emocionales y datos analíticos para que la universidad pueda implementar acciones de bienestar estudiantil basadas en información real.

## Características Principales
- Registro y autenticación segura de estudiantes mediante código universitario.
- Chatbot conversacional basado en la API de OpenAI (GPT-4-turbo) para asistencia emocional.
- Respuestas personalizadas y validación emocional.
- Interfaz intuitiva y empática para estudiantes.
- Panel administrativo con métricas en tiempo real sobre el bienestar estudiantil.
- Alertas automáticas para detectar posibles crisis emocionales.
- Historial privado de conversaciones y recursos de autoayuda.
- Escalabilidad para atender múltiples usuarios simultáneamente.

## Tecnologías Utilizadas
- **Frontend:** Next.js, TypeScript, CSS Modules
- **Backend:** Node.js, Prisma ORM, PostgreSQL
- **Autenticación:** Clerk
- **Inteligencia Artificial:** API de OpenAI (GPT-4-turbo)
- **Metodología de desarrollo:** SCRUM (Sprint Planning, Daily Standups, Sprint Review, Retrospective)

## Instalación y Configuración
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tuusuario/ELIORA.git

2. Instalar dependencias:
  ```bash
    npm install

3. Configurar variables de entorno (por ejemplo):
**OPENAI_API_KEY:** clave para la API de OpenAI.
Configuración para Clerk, base de datos PostgreSQL, etc.

4. Desplegar la base de datos con Prisma:
   ```bash
    Run
   Copy code
   npx prisma migrate deploy

5. Ejecutar la aplicación en modo desarrollo:
   ```bash
      Run
      Copy code
      npm run dev

## Uso
- Los estudiantes pueden registrarse y acceder a la interfaz de chat para expresar cómo se sienten.
- El chatbot responde con mensajes empáticos y ofrece técnicas básicas de regulación emocional.
- Los administradores pueden iniciar sesión en el panel para visualizar estadísticas y gestionar el sistema.


## Estructura del Proyecto
- `/frontend` - Código React/Next.js para la interfaz del usuario.
- `/backend` - APIs, lógica del chatbot, módulos de autenticación.
- `/database` - Esquemas y migraciones de Prisma para PostgreSQL.
- `/docs` - Documentación adicional, protocolo SCRUM, especificaciones.

## Equipo de Desarrollo
- **Frontend:** Alizon Cortez Escobar, Juan Luis Chumbe Montaño, James
- **Backend:** Deivy Orlando Ortiz Martinez, Josue David Kennedy Mamani, Jhonatan Gabriel Montesinos Sossa

## Contribuciones
Las contribuciones son bienvenidas. Por favor abrir issues o enviar pull requests para mejoras, correcciones o nuevas funcionalidades.

## Licencia
[Indicar la licencia del proyecto, por ejemplo, MIT License]

## Contacto
Para más información o consultas contactar a:  
- Correo: ejemplo@universidad.edu  
- Link del proyecto en GitHub: https://github.com/tuusuario/ELIORA
