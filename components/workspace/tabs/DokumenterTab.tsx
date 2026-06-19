'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDokumentData } from '@/lib/useDokumentData';
import {
  type Dokument,
  type DokKind,
  type DokStatus,
  fetchDokumenter,
  createTekstDok,
  lastOppFil,
  oppdaterDok,
  slettDok,
  lastNedDok,
  signertUrl,
  dokStorrelse,
} from '@/lib/dokumenter';
import { ModellView } from '../types';
import DokumentModal from '../DokumentModal';
import { sanitizeHtml } from '@/lib/sanitizeHtml';

const STATUS_META: Record<DokStatus, { label: string; cls: string }> = {
  utkast: { label: 'Utkast', cls: 'pill pill--warning' },
  gjennomgang: { label: 'Til gjennomgang', cls: 'pill pill--info' },
  godkjent: { label: 'Godkjent', cls: 'pill pill--success' },
};
const KIND_LABEL: Record<DokKind, string> = { pdf: 'PDF', word: 'Word', xml: 'XML', bilde: 'Bilde', text: 'Dokument' };
const ICON_LABEL: Record<DokKind, string> = { pdf: 'PDF', word: 'DOC', xml: 'XML', bilde: 'IMG', text: 'DOK' };
const ICON_COLOR: Record<DokKind, [string, string]> = {
  pdf: ['var(--danger-tinted)', 'var(--danger-text)'],
  word: ['var(--info-tinted)', 'var(--info-text)'],
  xml: ['var(--warning-tinted)', 'var(--warning-text)'],
  bilde: ['var(--success-tinted)', 'var(--success-text)'],
  text: ['var(--neutral-bg-input)', 'var(--fg-2)'],
};
const UTEN = '__uten__';

const ACCEPT =
  '.pdf,.doc,.docx,.xml,.xsd,.png,.jpg,.jpeg,.gif,.webp,.tif,.tiff,image/*,application/pdf,application/msword,application/xml,text/xml,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const TOOLBAR: { label: string; cmd: string; title: string; extra?: React.CSSProperties }[] = [
  { label: 'B', cmd: 'bold', title: 'Fet', extra: { fontWeight: 800 } },
  { label: 'I', cmd: 'italic', title: 'Kursiv', extra: { fontStyle: 'italic' } },
  { label: 'U', cmd: 'underline', title: 'Understrek', extra: { textDecoration: 'underline' } },
  { label: 'H', cmd: 'formatBlock:h2', title: 'Overskrift' },
  { label: '¶', cmd: 'formatBlock:p', title: 'Avsnitt' },
  { label: '• Liste', cmd: 'insertUnorderedList', title: 'Punktliste' },
  { label: '1. Liste', cmd: 'insertOrderedList', title: 'Nummerert liste' },
  { label: 'Lenke', cmd: 'createLink', title: 'Sett inn lenke' },
];

function tidStr(s: string) {
  return new Date(s).toLocaleString('no-NO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function DokumenterTab({ model }: { model: ModellView }) {
  const [docs, setDocs] = useState<Dokument[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [visId, setVisId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [filter, setFilter] = useState<string>('alle'); // 'alle' | UTEN | mappenavn
  const editorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // Mappenavn lagres delt, så tomme mapper består på tvers av brukere/økter.
  const { value: lagredeMapper, setValue: setMapper, status: mapperStatus } = useDokumentData<string[]>(model.id, 'dok_mapper', []);
  const [mapper, setMapperState] = useState<string[]>([]);
  const adoptedMapper = useRef(false);
  useEffect(() => {
    if (adoptedMapper.current) return;
    if (mapperStatus === 'idle') {
      const server = Array.isArray(lagredeMapper) ? lagredeMapper : [];
      // flett inn evt. mappe brukeren rakk å lage før lasting ble ferdig
      setMapperState((prev) => Array.from(new Set([...server, ...prev])));
      adoptedMapper.current = true;
    }
  }, [mapperStatus, lagredeMapper]);

  const open = openId ? docs.find((d) => d.id === openId) ?? null : null;
  const visDok = visId ? docs.find((d) => d.id === visId) ?? null : null;
  const modal = visDok ? <DokumentModal dok={visDok} onClose={() => setVisId(null)} /> : null;

  const reload = useCallback(async () => {
    setDocs(await fetchDokumenter(model.id));
  }, [model.id]);

  useEffect(() => {
    setOpenId(null);
    setFilter('alle');
    reload();
  }, [reload]);

  useEffect(() => {
    if (!open) return;
    if (editorRef.current) editorRef.current.innerHTML = sanitizeHtml(open.html) || '<p></p>';
    if (titleRef.current) titleRef.current.value = open.navn || '';
    setPreviewUrl('');
    if ((open.kind === 'pdf' || open.kind === 'bilde') && open.lager_sti) {
      signertUrl(open).then((u) => setPreviewUrl(u || ''));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);

  // Alle mapper = lagrede + de som finnes på dokumenter.
  const alleMapper = Array.from(
    new Set([...mapper, ...docs.map((d) => d.mappe).filter((m): m is string => !!m)]),
  ).sort((a, b) => a.localeCompare(b, 'no'));

  const malmappe = filter !== 'alle' && filter !== UTEN ? filter : null;

  async function handleFiles(list: FileList | null) {
    const files = Array.from(list || []);
    if (!files.length) return;
    setBusy(true);
    await Promise.all(files.map((f) => lastOppFil(model.id, f, malmappe)));
    setBusy(false);
    reload();
  }
  async function nyttDok() {
    const d = await createTekstDok(model.id, malmappe);
    if (d) {
      setDocs((prev) => [d, ...prev]);
      setOpenId(d.id);
    }
  }
  function nyMappe() {
    const navn = window.prompt('Navn på ny mappe');
    if (!navn || !navn.trim()) return;
    const n = navn.trim();
    if (!alleMapper.includes(n)) {
      const next = [...mapper, n];
      setMapperState(next);
      setMapper(next, `La til mappe «${n}»`);
    }
    setFilter(n);
  }

  async function lagreInnhold() {
    if (!open || !editorRef.current) return;
    const html = sanitizeHtml(editorRef.current.innerHTML);
    await oppdaterDok(open.id, { html });
    setDocs((prev) => prev.map((d) => (d.id === open.id ? { ...d, html } : d)));
  }
  async function lagreTittel() {
    if (!open || !titleRef.current) return;
    const navn = (titleRef.current.value || '').trim() || 'Uten tittel';
    await oppdaterDok(open.id, { navn });
    setDocs((prev) => prev.map((d) => (d.id === open.id ? { ...d, navn } : d)));
  }
  async function endreStatus(status: DokStatus) {
    if (!open) return;
    await oppdaterDok(open.id, { status });
    setDocs((prev) => prev.map((d) => (d.id === open.id ? { ...d, status } : d)));
  }
  async function flytt(d: Dokument, mappe: string | null) {
    await oppdaterDok(d.id, { mappe });
    setDocs((prev) => prev.map((x) => (x.id === d.id ? { ...x, mappe } : x)));
  }
  async function slett(d: Dokument) {
    if (!window.confirm('Slette dette dokumentet? (delt — påvirker alle)')) return;
    if (openId === d.id) setOpenId(null);
    await slettDok(d);
    reload();
  }

  function exec(cmd: string, val?: string) {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  }

  // ---------------- EDITOR-VISNING ----------------
  if (open) {
    const sm = STATUS_META[open.status] || STATUS_META.utkast;
    const harForhandsvisning = open.kind === 'pdf' || open.kind === 'word' || open.kind === 'xml' || open.kind === 'bilde';
    const erPdf = open.kind === 'pdf' && !!previewUrl;
    const erBilde = open.kind === 'bilde' && !!previewUrl;
    const erXml = open.kind === 'xml' && open.fil_tekst != null;
    const visNote = harForhandsvisning && !erPdf && !erXml && !erBilde;
    const noteText =
      open.kind === 'word'
        ? 'Word-dokumenter kan ikke forhåndsvises i nettleseren. Last ned filen for å åpne den, og skriv innholdet i redigeringsfeltet ved siden av.'
        : 'Forhåndsvisningen lastes … eller er ikke tilgjengelig. Last ned filen for å åpne den.';
    return (
      <div>
        {modal}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <button className="btn btn--pill btn--sm" onClick={() => { lagreInnhold(); setOpenId(null); }}>
            ← Alle dokumenter
          </button>
          <span className={sm.cls}>{sm.label}</span>
          <span style={{ fontSize: '0.74rem', color: 'var(--fg-2)', marginLeft: 'auto' }}>
            Sist lagret {tidStr(open.endret)}
          </span>
        </div>

        <input
          ref={titleRef}
          className="input"
          defaultValue={open.navn}
          onBlur={lagreTittel}
          placeholder="Dokumenttittel"
          style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 10, width: '100%' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <span className="eyebrow" style={{ margin: 0 }}>Status</span>
          <select className="input input--sm" value={open.status} onChange={(e) => endreStatus(e.target.value as DokStatus)} style={{ width: 'auto' }}>
            <option value="utkast">Utkast</option>
            <option value="gjennomgang">Til gjennomgang</option>
            <option value="godkjent">Godkjent</option>
          </select>
          <span className="eyebrow" style={{ margin: '0 0 0 8px' }}>Mappe</span>
          <select className="input input--sm" value={open.mappe ?? UTEN} onChange={(e) => flytt(open, e.target.value === UTEN ? null : e.target.value)} style={{ width: 'auto' }}>
            <option value={UTEN}>Uten mappe</option>
            {alleMapper.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button className="btn btn--secondary btn--sm" onClick={() => setVisId(open.id)}>
            ⤢ Full visning
          </button>
          {open.kind !== 'text' && (
            <button className="btn btn--tertiary btn--sm" onClick={() => lastNedDok(open)}>
              Last ned fil
            </button>
          )}
        </div>

        <div style={harForhandsvisning ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'stretch' } : { display: 'block' }}>
          {harForhandsvisning && (
            <div style={{ border: '1px solid var(--neutral-border-strong)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--bg-2)', minHeight: 480, display: 'flex' }}>
              {erPdf && <iframe src={previewUrl} title="Forhåndsvisning" style={{ width: '100%', height: '100%', minHeight: 480, border: 'none', display: 'block' }} />}
              {erBilde && (
                <img src={previewUrl} alt={open.navn} style={{ maxWidth: '100%', maxHeight: 560, objectFit: 'contain', margin: 'auto', display: 'block' }} />
              )}
              {erXml && (
                <pre className="pv-scroll" style={{ margin: 0, width: '100%', maxHeight: 560, overflow: 'auto', padding: '16px 18px', background: '#0c2230', color: '#d6e3ee', fontFamily: 'var(--font-mono)', fontSize: '0.76rem', lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {open.fil_tekst}
                </pre>
              )}
              {visNote && (
                <div style={{ margin: 'auto', padding: 28, textAlign: 'center', color: 'var(--fg-2)', fontSize: '0.88rem', maxWidth: '32ch', lineHeight: 1.5 }}>{noteText}</div>
              )}
            </div>
          )}

          <div style={{ border: '1px solid var(--neutral-border-strong)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--bg-1)', display: 'flex', flexDirection: 'column', minHeight: 480 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, padding: '6px 8px', borderBottom: '1px solid var(--neutral-border)', background: 'var(--bg-2)' }}>
              {TOOLBAR.map((tb) => (
                <button
                  key={tb.label}
                  title={tb.title}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (tb.cmd === 'createLink') {
                      const u = window.prompt('Lenke (URL)', 'https://');
                      if (u) exec('createLink', u);
                    } else if (tb.cmd.startsWith('formatBlock:')) {
                      exec('formatBlock', tb.cmd.split(':')[1]);
                    } else {
                      exec(tb.cmd);
                    }
                  }}
                  style={{ appearance: 'none', border: '1px solid transparent', background: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)', padding: '5px 9px', fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--fg-1)', minWidth: 30, ...tb.extra }}
                >
                  {tb.label}
                </button>
              ))}
            </div>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onBlur={lagreInnhold}
              className="pv-scroll doc-editor"
              style={{ flex: 1, minHeight: 420, maxHeight: '66vh', overflowY: 'auto', padding: '18px 20px', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--fg-1)' }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ---------------- LISTE-VISNING ----------------
  function docCard(d: Dokument) {
    const sm = STATUS_META[d.status] || STATUS_META.utkast;
    const c = ICON_COLOR[d.kind] || ICON_COLOR.text;
    const sizeStr = dokStorrelse(d.storrelse);
    const meta = [KIND_LABEL[d.kind], sizeStr, 'endret ' + tidStr(d.endret)].filter(Boolean).join(' · ');
    return (
      <div key={d.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 600, flexShrink: 0, background: c[0], color: c[1] }}>
          {ICON_LABEL[d.kind]}
        </span>
        <button
          onClick={() => (d.kind === 'text' ? setOpenId(d.id) : setVisId(d.id))}
          title={d.kind === 'text' ? 'Åpne dokumentet' : 'Åpne i full visning'}
          style={{ flex: 1, minWidth: 160, textAlign: 'left', appearance: 'none', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
        >
          <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-text)' }}>{d.navn}</span>
          <span style={{ display: 'block', fontSize: '0.76rem', color: 'var(--fg-2)', marginTop: 2 }}>{meta}</span>
        </button>
        <select
          className="input input--sm"
          value={d.mappe ?? UTEN}
          onChange={(e) => flytt(d, e.target.value === UTEN ? null : e.target.value)}
          title="Flytt til mappe"
          style={{ width: 'auto', fontSize: '0.78rem' }}
        >
          <option value={UTEN}>Uten mappe</option>
          {alleMapper.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <span className={sm.cls}>{sm.label}</span>
        <button className="btn btn--secondary btn--sm" onClick={() => setVisId(d.id)}>Vis</button>
        <button className="btn btn--tertiary btn--sm" onClick={() => setOpenId(d.id)}>Rediger</button>
        <button className="btn btn--tertiary btn--sm" onClick={() => lastNedDok(d)}>Last ned</button>
        <button className="btn btn--tertiary btn--sm" onClick={() => slett(d)}>Slett</button>
      </div>
    );
  }

  const utenMappe = docs.filter((d) => !d.mappe);
  const chip = (id: string, label: string, n: number) => {
    const aktiv = filter === id;
    return (
      <button
        key={id}
        onClick={() => setFilter(id)}
        style={{
          appearance: 'none',
          cursor: 'pointer',
          padding: '4px 11px',
          borderRadius: 'var(--radius-pill)',
          fontSize: '0.8rem',
          fontWeight: aktiv ? 600 : 500,
          border: `1px solid ${aktiv ? 'var(--accent-base)' : 'var(--neutral-border-strong)'}`,
          background: aktiv ? 'var(--accent-tinted)' : 'var(--bg-1)',
          color: aktiv ? 'var(--accent-text)' : 'var(--fg-1)',
        }}
      >
        {label} <span style={{ color: 'var(--fg-3)', fontWeight: 500 }}>{n}</span>
      </button>
    );
  };

  return (
    <div>
      {modal}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <p className="p p-sm" style={{ color: 'var(--fg-2)', margin: 0, flex: 1, minWidth: 220 }}>
          Dokumenter knyttet til denne datamodellen. Last opp PDF, Word, XML eller bilde (JPG/PNG),
          eller opprett et nytt dokument. Grupper i mapper for å skille innholdet. Lagres delt.
        </p>
        <label className="btn btn--secondary btn--sm" style={{ cursor: 'pointer' }}>
          {busy ? 'Laster opp …' : 'Last opp fil'}
          <input type="file" multiple accept={ACCEPT} onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} style={{ display: 'none' }} />
        </label>
        <button className="btn btn--secondary btn--sm" onClick={nyMappe}>Ny mappe</button>
        <button className="btn btn--primary btn--sm" onClick={nyttDok}>Nytt dokument</button>
      </div>

      {/* Mappe-filtre */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {chip('alle', 'Alle', docs.length)}
        {alleMapper.map((m) => chip(m, m, docs.filter((d) => d.mappe === m).length))}
        {chip(UTEN, 'Uten mappe', utenMappe.length)}
        <span className={`save-status ${mapperStatus}`} style={{ alignSelf: 'center', fontSize: '0.7rem', color: 'var(--fg-3)' }}>
          {mapperStatus === 'saving' ? 'Lagrer mapper …' : ''}
        </span>
      </div>

      <label
        onDragOver={(e) => { e.preventDefault(); if (!dragOver) setDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', cursor: 'pointer', border: `1.5px dashed ${dragOver ? 'var(--accent-base)' : 'var(--neutral-border-strong)'}`, background: dragOver ? 'var(--accent-tinted)' : 'var(--bg-1)', borderRadius: 'var(--radius-lg)', padding: 22, transition: 'background .15s, border-color .15s' }}
      >
        <input type="file" multiple accept={ACCEPT} onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} style={{ display: 'none' }} />
        <span style={{ fontSize: '0.9rem', color: 'var(--fg-2)' }}>
          Slipp PDF, Word, XML eller bilde her{malmappe ? ` (legges i «${malmappe}»)` : ''}, eller klikk for å velge
        </span>
      </label>

      {docs.length === 0 ? (
        <div className="callout callout--info" style={{ marginTop: 14 }}>
          <span className="callout-icon" />
          <div>
            <strong className="callout-title">Ingen dokumenter ennå</strong>
            <div>Last opp en fil eller opprett et nytt dokument for å komme i gang.</div>
          </div>
        </div>
      ) : filter === 'alle' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 14 }}>
          {alleMapper.map((m) => {
            const innhold = docs.filter((d) => d.mappe === m);
            return (
              <div key={m}>
                <div className="eyebrow" style={{ margin: '0 0 8px' }}>📁 {m} · {innhold.length}</div>
                {innhold.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--fg-3)', margin: 0 }}>Tom mappe — flytt dokumenter hit med «Flytt til mappe».</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{innhold.map(docCard)}</div>
                )}
              </div>
            );
          })}
          <div>
            <div className="eyebrow" style={{ margin: '0 0 8px' }}>Uten mappe · {utenMappe.length}</div>
            {utenMappe.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--fg-3)', margin: 0 }}>Ingen.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{utenMappe.map(docCard)}</div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
          {docs.filter((d) => (filter === UTEN ? !d.mappe : d.mappe === filter)).map(docCard)}
        </div>
      )}
    </div>
  );
}
