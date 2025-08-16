import en from './en.json';
import es from './es.json';

describe('i18n resources', () => {
  it('loads English resources', () => {
    expect(en.Nav.analytics).toBe('Analytics');
  });

  it('loads Spanish resources', () => {
    expect(es.Nav.calendar).toBe('Calendario');
  });
});
