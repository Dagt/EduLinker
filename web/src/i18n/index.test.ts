import i18n from './index';

describe('i18n initialization', () => {
  it('loads english and spanish resources', () => {
    i18n.changeLanguage('en');
    expect(i18n.t('Nav.calendar')).toBe('Calendar');
    i18n.changeLanguage('es');
    expect(i18n.t('Nav.calendar')).toBe('Calendario');
  });
});
