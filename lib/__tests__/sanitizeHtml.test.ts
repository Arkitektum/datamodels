import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from '@/lib/sanitizeHtml';

describe('sanitizeHtml', () => {
  it('fjerner script og innholdet i det', () => {
    expect(sanitizeHtml('<p>ok</p><script>alert(1)</script>')).toBe('<p>ok</p>');
  });

  it('fjerner hendelses-attributter', () => {
    expect(sanitizeHtml('<p onclick="alert(1)">tekst</p>')).toBe('<p>tekst</p>');
  });

  it('slipper ikke gjennom javascript:- og data:-lenker', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).toBe('<a>x</a>');
    expect(sanitizeHtml('<a href="data:text/html,<script>">x</a>')).toBe('<a>x</a>');
  });

  it('setter alltid vårt eget rel på lenker, selv om en tom rel er lagret', () => {
    const ut = sanitizeHtml('<a href="https://x.test" target="_blank" rel="">x</a>');
    expect(ut).toContain('rel="noopener noreferrer"');
    // Kun én rel – ellers vinner den første ved HTML-parsing og vernet ryker.
    expect((ut.match(/rel=/g) ?? []).length).toBe(1);
  });

  it('pakker ut ukjente tagger, men beholder teksten', () => {
    expect(sanitizeHtml('<custom-tag>tekst</custom-tag>')).toBe('tekst');
  });

  it('krasjer ikke på tagnavn som finnes på Object.prototype', () => {
    // `tag in ALLOWED_TAGS` ville sagt ja til disse og gitt en funksjon i
    // stedet for en attributt-liste — som kastet og tok ned hele visningen.
    expect(() => sanitizeHtml('<constructor>x</constructor>')).not.toThrow();
    expect(sanitizeHtml('<constructor>x</constructor>')).toBe('x');
    expect(sanitizeHtml('<tostring>y</tostring>')).toBe('y');
    expect(sanitizeHtml('<valueof>z</valueof>')).toBe('z');
  });

  it('beholder vanlig formatering', () => {
    expect(sanitizeHtml('<p><strong>a</strong> <em>b</em><br></p>')).toBe(
      '<p><strong>a</strong> <em>b</em><br></p>',
    );
  });

  it('escaper tekstinnhold', () => {
    expect(sanitizeHtml('<p>1 < 2 & 3</p>')).toContain('1 &lt; 2 &amp; 3');
  });
});
