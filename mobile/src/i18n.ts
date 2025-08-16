/* istanbul ignore file */
import { I18n } from 'i18n-js';

const translations = {
  en: {
    general: {
      error: 'Error',
      unauthorized: 'Unauthorized',
    },
    menu: {
      feed: 'Feed',
      chat: 'Chat',
      complaints: 'Complaints',
      homeworks: 'Homeworks',
      surveys: 'Surveys',
      events: 'Events',
    },
    login: {
      title: 'EduLinker',
      email: 'Email',
      password: 'Password',
      signIn: 'Sign in',
      invalid: 'Invalid credentials',
      missingEmail: 'Please enter an email',
      missingPassword: 'Please enter a password',
    },
    complaints: {
      title: 'Complaints',
      placeholder: 'Write your complaint',
      send: 'Send',
      none: 'No complaints',
      messagesNone: 'No messages',
      messagePlaceholder: 'Message',
      back: 'Back',
      requiredComplaint: 'Please enter a complaint',
      requiredMessage: 'Please enter a message',
    },
    suggestions: {
      title: 'Suggestions',
      unauthorized: 'Unauthorized',
      fieldTitle: 'Title',
      fieldDescription: 'Description',
      send: 'Send',
      messagesNone: 'No messages',
      messagePlaceholder: 'Message',
      back: 'Back',
    },
  },
  es: {
    general: {
      error: 'Error',
      unauthorized: 'No autorizado',
    },
    menu: {
      feed: 'Feed',
      chat: 'Chat',
      complaints: 'Quejas',
      homeworks: 'Tareas',
      surveys: 'Encuestas',
      events: 'Eventos',
    },
    login: {
      title: 'EduLinker',
      email: 'Email',
      password: 'Contraseña',
      signIn: 'Entrar',
      invalid: 'Credenciales inválidas',
      missingEmail: 'Ingrese un correo',
      missingPassword: 'Ingrese una contraseña',
    },
    complaints: {
      title: 'Quejas',
      placeholder: 'Escribe tu queja',
      send: 'Enviar',
      none: 'No hay quejas',
      messagesNone: 'No hay mensajes',
      messagePlaceholder: 'Mensaje',
      back: 'Volver',
      requiredComplaint: 'Ingresa una queja',
      requiredMessage: 'Ingresa un mensaje',
    },
    suggestions: {
      title: 'Sugerencias',
      unauthorized: 'No autorizado',
      fieldTitle: 'Título',
      fieldDescription: 'Descripción',
      send: 'Enviar',
      messagesNone: 'Sin mensajes',
      messagePlaceholder: 'Mensaje',
      back: 'Volver',
    },
  },
};

const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.locale = 'en';

export default i18n;
