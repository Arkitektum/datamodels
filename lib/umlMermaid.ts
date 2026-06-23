// Bygger en Mermaid `classDiagram`-definisjon fra en datamodell-struktur.
// Objekter → klasser, felt → attributter, og felt med `ref` til en annen
// objekttype → relasjonspiler (med kardinalitet som multiplisitet).
import type { Struktur } from './struktur';

// Gyldig Mermaid-id (kun bokstaver/tall/_) per objekt, garantert unik. Det
// opprinnelige navnet vises via en alias-etikett ["…"], så æøå/mellomrom og
// egendefinerte navn beholdes i visningen.
function lagIdKart(struktur: Struktur): Map<string, string> {
  const kart = new Map<string, string>();
  const brukt = new Set<string>();
  struktur.forEach((o, i) => {
    let base = (o.navn || `Objekt${i + 1}`).replace(/[^A-Za-z0-9_]/g, '_');
    if (!base || /^[0-9]/.test(base)) base = 'O_' + base;
    let id = base;
    let n = 2;
    while (brukt.has(id)) id = `${base}_${n++}`;
    brukt.add(id);
    kart.set(o.navn, id);
  });
  return kart;
}

// Fjerner tegn som ville brutt en Mermaid-linje (member, etikett, relasjon).
function trygg(s: string | undefined): string {
  return (s || '').replace(/[(){}[\]:;,<>"|~`\n\r]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Kort, trygg ledetekst (beskrivelse) til bruk i diagrammet – avkortet så det
// ikke sprenger boksene.
function kortLedetekst(s: string | undefined, maks: number): string {
  const t = trygg(s);
  return t.length > maks ? t.slice(0, maks - 1).trimEnd() + '…' : t;
}

export interface MermaidOpts {
  /** Ta med `beskrivelse` som ledetekst: objekt-beskrivelse som UML-note og
   *  felt-beskrivelse kort på attributt-linja. */
  ledetekster?: boolean;
}

export function strukturTilMermaid(struktur: Struktur, opts: MermaidOpts = {}): string {
  const objekter = Array.isArray(struktur) ? struktur : [];
  if (!objekter.length) return '';
  const id = lagIdKart(objekter);
  const linjer: string[] = ['classDiagram'];
  const relasjoner: string[] = [];
  const noter: string[] = [];

  for (const obj of objekter) {
    const klasseId = id.get(obj.navn) as string;
    const etikett = trygg(obj.navn) || klasseId;
    const medlemmer: string[] = [];

    for (const f of obj.felt ?? []) {
      if (!f.navn) continue;
      // Alle felt vises som attributter: «navn : Type [kardinalitet]» (@ for
      // XSD-attributter), slik at typen og kardinaliteten er lesbar i boksen.
      const pre = f.attributt ? '@' : '';
      const navn = trygg(f.navn);
      const type = trygg(f.type) || 'string';
      const kard = f.kardinalitet ? ` [${trygg(f.kardinalitet)}]` : '';
      const ledetekst =
        opts.ledetekster && f.beskrivelse ? ` — ${kortLedetekst(f.beskrivelse, 60)}` : '';
      medlemmer.push(`    ${pre}${navn} : ${type}${kard}${ledetekst}`);

      // Peker feltet på en annen objekttype, tegnes i tillegg en relasjonspil
      // med kardinaliteten som multiplisitet.
      const refId = f.ref ? id.get(f.ref) : undefined;
      if (refId) {
        const mult = f.kardinalitet ? ` "${trygg(f.kardinalitet)}"` : '';
        relasjoner.push(`  ${klasseId} -->${mult} ${refId} : ${navn}`);
      }
    }

    if (medlemmer.length) {
      linjer.push(`  class ${klasseId}["${etikett}"] {`, ...medlemmer, '  }');
    } else {
      linjer.push(`  class ${klasseId}["${etikett}"]`);
    }

    // Objekt-beskrivelse som UML-note (ledetekst på objektnivå).
    if (opts.ledetekster && obj.beskrivelse) {
      noter.push(`  note for ${klasseId} "${kortLedetekst(obj.beskrivelse, 120)}"`);
    }
  }

  return [...linjer, ...relasjoner, ...noter].join('\n');
}
