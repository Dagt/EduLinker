import i18n from '../i18n';

describe('i18n translations', () => {
  it('provides english texts', () => {
    i18n.locale = 'en';
    expect(i18n.t('login.signIn')).toBe('Sign in');
    expect(i18n.t('complaints.title')).toBe('Complaints');
    expect(i18n.t('notificationSettings.register')).toBe('Register');
  });

  it('provides spanish texts', () => {
    i18n.locale = 'es';
    expect(i18n.t('login.signIn')).toBe('Entrar');
    expect(i18n.t('complaints.title')).toBe('Quejas');
    expect(i18n.t('notificationSettings.register')).toBe('Registrar');
  });
});
