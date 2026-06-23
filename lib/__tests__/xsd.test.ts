// @vitest-environment jsdom
// parseXsd bruker DOMParser (nettleser-API) – jsdom-miljøet gir den.
import { describe, it, expect } from 'vitest';
import { parseXsd, serializeXsd, erGyldigNcName, xsdGyldighetsproblemer } from '@/lib/xsd';
import type { Struktur } from '@/lib/struktur';

function velformet(xml: string): boolean {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  return doc.getElementsByTagName('parsererror').length === 0;
}

const XSD = `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
           xmlns="http://example.com/ns"
           targetNamespace="http://example.com/ns"
           elementFormDefault="qualified">
  <xs:element name="Tiltak" type="TiltakType" />
  <xs:complexType name="TiltakType">
    <xs:annotation>
      <xs:documentation>Et tiltak.</xs:documentation>
    </xs:annotation>
    <xs:sequence>
      <xs:element name="navn" type="xs:string" />
      <xs:element name="antall" type="xs:int" minOccurs="0" maxOccurs="unbounded" />
      <xs:element name="adresse" type="AdresseType" nillable="true" minOccurs="0" />
    </xs:sequence>
    <xs:attribute name="id" type="xs:string" use="required" />
  </xs:complexType>
  <xs:complexType name="AdresseType">
    <xs:sequence>
      <xs:element name="gate" type="xs:string" />
    </xs:sequence>
  </xs:complexType>
</xs:schema>`;

describe('parseXsd', () => {
  it('DOMParser er tilgjengelig i testmiljøet', () => {
    expect(typeof DOMParser).toBe('function');
  });

  it('tolker complexTypes, felt, kardinalitet, attributter og rotelement', () => {
    const struktur = parseXsd(XSD);
    const tiltak = struktur.find((o) => o.navn === 'TiltakType');
    expect(tiltak).toBeDefined();
    expect(tiltak!.rotElement).toBe('Tiltak');
    expect(tiltak!.beskrivelse).toContain('Et tiltak.');
    expect(tiltak!.partikkel).toBe('sequence');
    expect(tiltak!.targetNamespace).toBe('http://example.com/ns');

    const navn = tiltak!.felt.find((f) => f.navn === 'navn')!;
    expect(navn.type).toBe('string');
    expect(navn.kardinalitet).toBe('1..1');

    const antall = tiltak!.felt.find((f) => f.navn === 'antall')!;
    expect(antall.kardinalitet).toBe('0..n');

    const adresse = tiltak!.felt.find((f) => f.navn === 'adresse')!;
    expect(adresse.nillable).toBe(true);

    const idAttr = tiltak!.felt.find((f) => f.navn === 'id')!;
    expect(idAttr.attributt).toBe(true);
    expect(idAttr.kardinalitet).toBe('1..1');
  });

  it('kaster på ugyldig XML', () => {
    expect(() => parseXsd('<ikke gyldig')).toThrow();
  });
});

describe('parseXsd -> serializeXsd round-trip', () => {
  it('re-parsing av serialisert XSD bevarer kjernen', () => {
    const a = parseXsd(XSD);
    const xsdText = serializeXsd(a);
    const b = parseXsd(xsdText);

    // Samme objektnavn.
    expect(b.map((o) => o.navn).sort()).toEqual(a.map((o) => o.navn).sort());

    const ta = a.find((o) => o.navn === 'TiltakType')!;
    const tb = b.find((o) => o.navn === 'TiltakType')!;

    // Rotelement, namespace og partikkel bevares.
    expect(tb.rotElement).toBe('Tiltak');
    expect(tb.targetNamespace).toBe(ta.targetNamespace);
    expect(tb.partikkel).toBe('sequence');

    // Felt (navn, type, kardinalitet, nillable, attributt) bevares.
    for (const fa of ta.felt) {
      const fb = tb.felt.find((f) => f.navn === fa.navn)!;
      expect(fb, `felt ${fa.navn} mangler etter round-trip`).toBeDefined();
      expect(fb.type).toBe(fa.type);
      expect(fb.kardinalitet).toBe(fa.kardinalitet);
      expect(!!fb.nillable).toBe(!!fa.nillable);
      expect(!!fb.attributt).toBe(!!fa.attributt);
    }

    // Beskrivelse på objektet bevares.
    expect(tb.beskrivelse).toContain('Et tiltak.');
  });
});

describe('serializeXsd – velformethet og tom partikkel', () => {
  it('skriver ingen tom xs:sequence for objekt uten elementer', () => {
    const s: Struktur = [{ navn: 'Tom', beskrivelse: '', felt: [] }];
    const xml = serializeXsd(s);
    expect(xml).not.toMatch(/<xs:sequence>/);
    expect(velformet(xml)).toBe(true);
  });

  it('skriver sequence kun for elementer, ikke for rene attributt-objekter', () => {
    const s: Struktur = [
      { navn: 'KunAttr', beskrivelse: '', felt: [{ navn: 'id', type: 'string', kardinalitet: '1..1', beskrivelse: '', attributt: true }] },
    ];
    const xml = serializeXsd(s);
    expect(xml).not.toMatch(/<xs:sequence>/);
    expect(xml).toMatch(/<xs:attribute name="id"/);
    expect(velformet(xml)).toBe(true);
  });

  it('gir velformet XML for navn og beskrivelser med spesialtegn', () => {
    const s: Struktur = [
      {
        navn: 'A',
        beskrivelse: 'a & b < c > d "e"',
        targetNamespace: 'urn:x?a=1&b=2',
        felt: [{ navn: 'x', type: 'string', kardinalitet: '1..1', beskrivelse: '< & >' }],
      },
    ];
    expect(velformet(serializeXsd(s))).toBe(true);
  });
});

describe('erGyldigNcName', () => {
  it('godtar gyldige navn (inkl. norske bokstaver)', () => {
    for (const n of ['Tiltak', '_skjult', 'navn-2', 'a.b_c', 'gårdsnavn', 'Søknad']) {
      expect(erGyldigNcName(n), n).toBe(true);
    }
  });
  it('avviser ugyldige navn', () => {
    for (const n of ['', 'med mellomrom', '2start', 'ns:navn', 'a/b', 'æ ø']) {
      expect(erGyldigNcName(n), n).toBe(false);
    }
  });
});

describe('xsdGyldighetsproblemer', () => {
  it('finner ugyldige objekt-, felt-, attributt- og rotelementnavn', () => {
    const s: Struktur = [
      {
        navn: 'Tiltak Type',
        beskrivelse: '',
        rotElement: '2rot',
        felt: [
          { navn: 'gate navn', type: 'string', kardinalitet: '1..1', beskrivelse: '' },
          { navn: 'id felt', type: 'string', kardinalitet: '1..1', beskrivelse: '', attributt: true },
        ],
      },
    ];
    const p = xsdGyldighetsproblemer(s);
    expect(p.map((x) => x.sti)).toEqual(
      expect.arrayContaining(['Tiltak Type', 'Tiltak Type.gate navn', 'Tiltak Type.id felt']),
    );
    expect(p.some((x) => /Rotelementet/.test(x.melding))).toBe(true);
    expect(p.some((x) => /Attributtnavnet/.test(x.melding))).toBe(true);
  });

  it('returnerer tomt for en gyldig struktur', () => {
    const s: Struktur = [
      { navn: 'Tiltak', beskrivelse: '', rotElement: 'Tiltak', felt: [{ navn: 'navn', type: 'string', kardinalitet: '1..1', beskrivelse: '' }] },
    ];
    expect(xsdGyldighetsproblemer(s)).toEqual([]);
  });
});
