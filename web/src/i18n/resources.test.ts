import en from './en.json';
import es from './es.json';

function collectKeys(obj: any, prefix = ''): string[] {
  return Object.keys(obj).flatMap((k) => {
    const val = (obj as any)[k];
    const newPrefix = prefix ? `${prefix}.${k}` : k;
    return typeof val === 'object' ? collectKeys(val, newPrefix) : [newPrefix];
  });
}

describe('i18n resources', () => {
  it('has the same keys in English and Spanish', () => {
    const enKeys = collectKeys(en).sort();
    const esKeys = collectKeys(es).sort();
    expect(esKeys).toEqual(enKeys);
  });
});
