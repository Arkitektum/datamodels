// Typer og hjelpere for valideringsregler — portet fra index.html.

export interface RegelStatusDef {
  id: string;
  navn: string;
  cls: string;
}

/** Regel i standarddataene (felt kan mangle). */
export interface RegelRuleDef {
  p: string;
  t: string;
  r?: string;
  b?: string;
  f?: string;
  k?: string;
  sjekkpunkt?: string;
}
export interface RegelGruppeDef {
  g: string;
  std?: boolean;
  rules: RegelRuleDef[];
}

/** Normalisert regel (alle felt finnes). */
export interface RegelRule {
  p: string;
  sjekkpunkt: string;
  t: string;
  r: string;
  b: string;
  f: string;
  k: string;
}
export interface RegelGruppe {
  g: string;
  std: boolean;
  rules: RegelRule[];
}

/** Flat opplastings-/nedlastingsformat (matcher ekstern valideringsregel-JSON). */
export interface FlatRegel {
  Regelnr: string;
  sjkPkt: string;
  Beskrivelse: string;
  Valideringsresultat: string;
  Betingelse: string | null;
  Forutsetning: string | null;
  Kommentarer: string | null;
}

export function normalizeRegelData(grupper: RegelGruppeDef[] | undefined): RegelGruppe[] {
  return (grupper || []).map((g) => ({
    g: g.g || '',
    std: !!g.std,
    rules: (g.rules || []).map((r) => ({
      p: r.p || '',
      sjekkpunkt: r.sjekkpunkt || '',
      t: r.t || '',
      r: r.r || '',
      b: r.b || '',
      f: r.f || '',
      k: r.k || '',
    })),
  }));
}

export function fullRegelnr(root: string, p: string): string {
  return root ? root + '.' + p : p;
}

export function stripRoot(root: string, regelnr: string): string {
  const pre = root + '.';
  regelnr = regelnr || '';
  return regelnr.indexOf(pre) === 0 ? regelnr.slice(pre.length) : regelnr;
}

export function serializeRegler(grupper: RegelGruppe[], root: string): FlatRegel[] {
  const out: FlatRegel[] = [];
  grupper.forEach((g) =>
    g.rules.forEach((r) => {
      out.push({
        Regelnr: fullRegelnr(root, r.p),
        sjkPkt: r.sjekkpunkt || '',
        Beskrivelse: r.t || '',
        Valideringsresultat: r.r || '',
        Betingelse: r.b ? r.b : null,
        Forutsetning: r.f ? r.f : null,
        Kommentarer: r.k ? r.k : null,
      });
    }),
  );
  return out;
}

export function deserializeRegler(
  flat: Array<Record<string, unknown>>,
  root: string,
  stdByGroup: Record<string, boolean>,
): RegelGruppe[] {
  const groups: RegelGruppe[] = [];
  const byName: Record<string, RegelGruppe> = {};
  (flat || []).forEach((item) => {
    const raw = (item.Regelnr != null ? item.Regelnr : item.regelnr || '') as string;
    const p = stripRoot(root, raw);
    if (!p) return;
    const gname = p.split('.')[0];
    let grp = byName[gname];
    if (!grp) {
      grp = { g: gname, std: !!stdByGroup[gname], rules: [] };
      byName[gname] = grp;
      groups.push(grp);
    }
    grp.rules.push({
      p,
      sjekkpunkt: (item.sjkPkt as string) || '',
      t: (item.Beskrivelse as string) || '',
      r: (item.Valideringsresultat as string) || '',
      b: (item.Betingelse as string) || '',
      f: (item.Forutsetning as string) || '',
      k: (item.Kommentarer as string) || '',
    });
  });
  return groups;
}

/** Godtar både flat liste og gruppert format. */
export function parseRegelInput(
  parsed: unknown,
  root: string,
  stdByGroup: Record<string, boolean>,
): RegelGruppe[] {
  const obj = parsed as Record<string, unknown> | unknown[];
  const arr = Array.isArray(obj)
    ? obj
    : ((obj as Record<string, unknown>)?.grupper ||
        (obj as Record<string, unknown>)?.regler) as unknown[] | undefined;
  if (!Array.isArray(arr)) throw new Error('Forventet en JSON-liste med regler.');
  const first = arr[0] as Record<string, unknown> | undefined;
  return first && first.rules
    ? normalizeRegelData(arr as RegelGruppeDef[])
    : deserializeRegler(arr as Array<Record<string, unknown>>, root, stdByGroup);
}

export function statusInfo(statuser: RegelStatusDef[], id: string): RegelStatusDef {
  return statuser.find((s) => s.id === id) || statuser[0];
}

export function resultatClass(val: string): string {
  return val === 'Feil' ? 'res-feil' : val === 'Advarsel' ? 'res-advarsel' : '';
}

export function groupKey(name: string): string {
  return name.replace(/[^A-Za-z0-9]/g, '_');
}

export function stdByGroupFrom(def: RegelGruppeDef[]): Record<string, boolean> {
  const m: Record<string, boolean> = {};
  def.forEach((g) => {
    m[g.g] = !!g.std;
  });
  return m;
}
