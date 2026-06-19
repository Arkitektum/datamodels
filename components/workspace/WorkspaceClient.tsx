'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DATAMODELLER } from '@/lib/datamodeller';
import {
  type CustomModell,
  listCustomModels,
  createCustomModel,
  deleteCustomModel,
  setModellStatus,
} from '@/lib/customModels';
import type { ModellStatus } from '@/lib/datamodeller';
import { useRolle } from '@/lib/roller';
import {
  type Melding,
  type ForslagStatus,
  type MeldingType,
  fetchAllDiskusjon,
  insertMelding,
  oppdaterMelding,
  slettMelding,
  setForslagStatus,
  deleteTraad,
  traadFor,
  feltCount,
  aapneForslagCount,
} from '@/lib/diskusjon';
import ValideringsreglerView from '@/components/regler/ValideringsreglerView';
import Header from './Header';
import Sidebar from './Sidebar';
import DiskusjonPanel from './DiskusjonPanel';
import DatamodellTab from './tabs/DatamodellTab';
import DokumenterTab from './tabs/DokumenterTab';
import XsdTab from './tabs/XsdTab';
import EksempelTab from './tabs/EksempelTab';
import DiskusjonTab from './tabs/DiskusjonTab';
import { ModellView, STATUS_META, SUBTABS } from './types';

const STICKY_TOP = 64;

export default function WorkspaceClient() {
  const { rolle, navn, epost, isDibk } = useRolle();
  const [custom, setCustom] = useState<CustomModell[]>([]);
  const [customLoaded, setCustomLoaded] = useState(false);
  const [diskusjon, setDiskusjon] = useState<Melding[]>([]);
  const [activeId, setActiveId] = useState<string>(DATAMODELLER[0].id);
  const [activeSub, setActiveSub] = useState<string>('datamodell');
  const [threadCtx, setThreadCtx] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editStruktur, setEditStruktur] = useState(false);

  // «Ny modell»-modal
  const [showCreate, setShowCreate] = useState(false);
  const [nyNavn, setNyNavn] = useState('');
  const [nyBesk, setNyBesk] = useState('');
  const [nyStatus, setNyStatus] = useState<ModellStatus>('arbeid');
  const [busy, setBusy] = useState(false);

  const reloadCustom = useCallback(async () => {
    setCustom(await listCustomModels());
    setCustomLoaded(true);
  }, []);
  const reloadDiskusjon = useCallback(async () => setDiskusjon(await fetchAllDiskusjon()), []);

  useEffect(() => {
    reloadCustom();
    reloadDiskusjon();
  }, [reloadCustom, reloadDiskusjon]);

  // Deep-link: les ?model=…&fane=… fra URL ved oppstart, og synk URL ved endring.
  const dlKlar = useRef(false);
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const m = sp.get('model');
    const f = sp.get('fane');
    if (m) setActiveId(m);
    if (f && SUBTABS.some((s) => s.id === f)) setActiveSub(f);
    dlKlar.current = true;
    // Lytt på fram/tilbake i nettleseren.
    const onPop = () => {
      const q = new URLSearchParams(window.location.search);
      const qm = q.get('model');
      const qf = q.get('fane');
      if (qm) setActiveId(qm);
      if (qf && SUBTABS.some((s) => s.id === qf)) setActiveSub(qf);
      // unngå at felt-tråd/redigeringsmodus fra forrige modell henger igjen
      setThreadCtx(null);
      setEditStruktur(false);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (!dlKlar.current) return;
    const sp = new URLSearchParams(window.location.search);
    sp.set('model', activeId);
    sp.set('fane', activeSub);
    const url = `${window.location.pathname}?${sp.toString()}`;
    if (url !== window.location.pathname + window.location.search) {
      window.history.replaceState(null, '', url);
    }
  }, [activeId, activeSub]);

  // Felles visningsliste over alle modeller.
  const models: ModellView[] = useMemo(() => {
    const dbById = new Map(custom.map((c) => [c.id, c]));
    const builtinIds = new Set(DATAMODELLER.map((d) => d.id));
    const builtins: ModellView[] = DATAMODELLER.map((d) => ({
      id: d.id,
      navn: d.navn,
      // status kan overstyres via en liten rad i datamodell-tabellen
      status: dbById.get(d.id)?.status ?? d.status,
      short: d.dataFormatId,
      builtin: true,
      dataFormatId: d.dataFormatId,
      provider: d.provider,
      version: d.version,
      root: d.root,
      lede: d.lede,
      eksempel: d.eksempel,
      xsd: d.xsd,
      defaultStruktur: d.struktur ?? [],
      vedleggDefault: d.vedlegg ?? [],
      kodelisterDefault: d.kodelister ?? [],
      slettbar: false,
    }));
    // Ekskluder eventuelle status-rader for innebygde modeller fra «egne».
    const customs: ModellView[] = custom
      .filter((c) => !builtinIds.has(c.id))
      .map((c) => ({
      id: c.id,
      navn: c.navn,
      status: c.status,
      short: 'egen',
      builtin: false,
      lede: c.beskrivelse ?? undefined,
      defaultStruktur: [],
      vedleggDefault: [],
      kodelisterDefault: [],
      slettbar: true,
    }));
    return [...builtins, ...customs];
  }, [custom]);

  const model = models.find((m) => m.id === activeId) ?? models[0];

  // Deep-link til ukjent/slettet modell: når egne modeller er lastet og id-en
  // ikke finnes, fall tilbake til en gyldig modell (unngår at activeId og vist
  // modell spriker, og at nye meldinger lagres på en foreldreløs id).
  useEffect(() => {
    if (!customLoaded) return;
    if (!models.some((m) => m.id === activeId)) setActiveId(DATAMODELLER[0].id);
  }, [customLoaded, models, activeId]);

  function selectModel(id: string) {
    setActiveId(id);
    setThreadCtx(null);
    setActiveSub('datamodell');
    setEditStruktur(false);
  }
  function onComment(ctx: string) {
    setThreadCtx(ctx);
  }
  function openThread(ctx: string | null) {
    setThreadCtx(ctx);
  }

  async function send(p: { type: MeldingType; body: string; felt?: string; endring?: string }) {
    await insertMelding({
      datamodell_id: activeId,
      kontekst: threadCtx,
      type: p.type,
      forfatter: navn,
      epost,
      rolle,
      body: p.body,
      felt: p.felt ?? null,
      endring: p.endring ?? null,
      status: p.type === 'proposal' ? 'open' : null,
    });
    reloadDiskusjon();
  }
  async function editMessage(id: string, patch: { body?: string; endring?: string }) {
    await oppdaterMelding(id, patch);
    reloadDiskusjon();
  }
  async function deleteMessage(id: string) {
    if (!window.confirm('Slette denne meldingen? (delt — påvirker alle)')) return;
    await slettMelding(id);
    reloadDiskusjon();
  }
  async function decide(id: string, status: ForslagStatus) {
    const ok = await setForslagStatus(id, status);
    if (!ok) {
      window.alert('Kunne ikke endre status. Kun DiBK-saksbehandlere kan godkjenne eller avvise.');
    }
    reloadDiskusjon();
  }
  async function clearThread() {
    if (!window.confirm('Tømme denne tråden? (delt — påvirker alle)')) return;
    await deleteTraad(activeId, threadCtx);
    reloadDiskusjon();
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    const n = nyNavn.trim();
    if (!n) return;
    setBusy(true);
    const created = await createCustomModel(n, nyBesk.trim() || undefined, nyStatus);
    setBusy(false);
    if (!created) {
      window.alert('Kunne ikke opprette modellen. Sjekk at du er innlogget og at databasen tillater det.');
      return;
    }
    setShowCreate(false);
    setNyNavn('');
    setNyBesk('');
    setNyStatus('arbeid');
    await reloadCustom();
    selectModel(created.id);
  }
  async function endreModellStatus(status: ModellStatus) {
    const ok = await setModellStatus(model.id, model.navn, status);
    if (ok) reloadCustom();
    else window.alert('Kunne ikke endre status.');
  }
  async function onDeleteModel() {
    if (!model.slettbar) return;
    if (!window.confirm(`Slette modellen «${model.navn}» og alt innholdet? Kan ikke angres.`)) return;
    const ok = await deleteCustomModel(model.id);
    if (ok) {
      await reloadCustom();
      setActiveId(DATAMODELLER[0].id);
      setActiveSub('oversikt');
    } else {
      window.alert('Kunne ikke slette modellen.');
    }
  }

  const smeta = STATUS_META[model.status];
  const metaParts = [
    model.dataFormatId ? `dataFormatId ${model.dataFormatId}` : '',
    model.provider ? `provider ${model.provider}` : '',
    model.version ? `versjon ${model.version}` : '',
    model.root ? `rot ${model.root}` : '',
  ].filter(Boolean);

  const ctxLabel = threadCtx ? threadCtx.split('.').pop() || threadCtx : 'Hele modellen';
  const panelMessages = traadFor(diskusjon, activeId, threadCtx);
  const modelMessages = diskusjon.filter((m) => m.datamodell_id === activeId);

  return (
    <>
      <Header />
      <div style={{ minHeight: 'calc(100vh - 60px)', background: 'var(--bg-2)' }}>
        <div
          style={{
            display: 'grid',
            gap: 24,
            width: '100%',
            margin: '0 auto',
            padding: 24,
            alignItems: 'start',
            maxWidth: '112rem',
            gridTemplateColumns: '284px minmax(0,1fr) 388px',
          }}
        >
          <Sidebar
            models={models}
            activeId={activeId}
            activeModel={model}
            search={search}
            onSearch={setSearch}
            onSelect={selectModel}
            openCount={(id) => aapneForslagCount(diskusjon, id)}
            onOpenCreate={() => setShowCreate(true)}
            stickyTop={STICKY_TOP}
          />

          <main style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span
                style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_META[model.status].dot, flexShrink: 0 }}
                title={smeta.label}
              />
              <select
                className="input input--sm"
                value={model.status}
                onChange={(e) => endreModellStatus(e.target.value as ModellStatus)}
                title="Endre status"
                aria-label="Endre status"
                style={{ width: 'auto', fontSize: '0.78rem' }}
              >
                <option value="publisert">Publisert</option>
                <option value="arbeid">Under arbeid</option>
                <option value="planlagt">Planlagt</option>
              </select>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--fg-2)' }}>{model.short}</span>
              {model.slettbar && (
                <button className="btn btn--tertiary btn--sm" onClick={onDeleteModel} style={{ marginLeft: 'auto' }}>
                  Slett modell
                </button>
              )}
            </div>
            <h1 className="h4" style={{ marginBottom: 6 }}>
              {model.navn}
            </h1>
            {metaParts.length > 0 && (
              <div style={{ fontSize: '0.82rem', color: 'var(--fg-2)', marginBottom: 10 }}>{metaParts.join(' · ')}</div>
            )}
            {model.lede && (
              <p className="p p-sm" style={{ maxWidth: '64ch', color: 'var(--fg-1)', marginBottom: 18 }}>
                {model.lede}
              </p>
            )}

            <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--neutral-border)', marginBottom: 18, flexWrap: 'wrap' }}>
              {SUBTABS.map((s) => {
                const active = activeSub === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSub(s.id)}
                    style={{
                      appearance: 'none',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      padding: '9px 14px',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.875rem',
                      color: active ? 'var(--accent-text)' : 'var(--fg-2)',
                      fontWeight: active ? 600 : 500,
                      borderBottom: `2px solid ${active ? 'var(--accent-base)' : 'transparent'}`,
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>

            {activeSub === 'datamodell' && (
              <DatamodellTab
                key={model.id}
                model={model}
                activeCtx={threadCtx}
                fieldCount={(ctx) => feltCount(diskusjon, activeId, ctx)}
                onComment={onComment}
                isEditing={editStruktur}
                onToggleEdit={setEditStruktur}
              />
            )}
            {activeSub === 'dokumenter' && <DokumenterTab key={model.id} model={model} />}
            {activeSub === 'xsd' && <XsdTab key={model.id} model={model} />}
            {activeSub === 'eksempel' && <EksempelTab model={model} />}
            {activeSub === 'diskusjon' && <DiskusjonTab messages={modelMessages} onOpen={openThread} />}
            {activeSub === 'validering' &&
              (model.builtin ? (
                <ValideringsreglerView key={model.id} datamodellId={model.id} />
              ) : (
                <ValideringsreglerView key={model.id} datamodellId={model.id} defaultGrupper={[]} root="" />
              ))}
          </main>

          <DiskusjonPanel
            ctx={threadCtx}
            ctxLabel={ctxLabel}
            modellNavn={model.navn}
            messages={panelMessages}
            canDecide={isDibk}
            currentEpost={epost}
            currentNavn={navn}
            stickyTop={STICKY_TOP}
            onBack={() => setThreadCtx(null)}
            onSend={send}
            onDecide={decide}
            onEdit={editMessage}
            onDeleteMessage={deleteMessage}
            onClear={clearThread}
          />
        </div>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <form className="card signin-card" onClick={(e) => e.stopPropagation()} onSubmit={submitCreate}>
            <h1 style={{ fontSize: '1.4rem' }}>Ny datamodell</h1>
            <label>
              Navn
              <input value={nyNavn} onChange={(e) => setNyNavn(e.target.value)} autoFocus required />
            </label>
            <label>
              Beskrivelse
              <textarea
                value={nyBesk}
                onChange={(e) => setNyBesk(e.target.value)}
                rows={3}
                placeholder="Kort beskrivelse av modellen (valgfritt)"
                style={{
                  width: '100%',
                  marginTop: 5,
                  padding: '11px 13px',
                  border: '1px solid var(--neutral-border-strong)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem',
                  resize: 'vertical',
                }}
              />
            </label>
            <label>
              Status
              <select
                value={nyStatus}
                onChange={(e) => setNyStatus(e.target.value as ModellStatus)}
                style={{
                  width: '100%',
                  marginTop: 5,
                  padding: '11px 13px',
                  border: '1px solid var(--neutral-border-strong)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem',
                }}
              >
                <option value="publisert">Publisert</option>
                <option value="arbeid">Under arbeid</option>
                <option value="planlagt">Planlagt</option>
              </select>
            </label>
            <button type="submit" className="btn btn--primary btn--md" disabled={busy} style={{ marginTop: 8 }}>
              {busy ? 'Oppretter …' : 'Opprett modell'}
            </button>
            <button type="button" className="btn btn--tertiary btn--sm" style={{ marginTop: 12 }} onClick={() => setShowCreate(false)}>
              Avbryt
            </button>
          </form>
        </div>
      )}
    </>
  );
}
