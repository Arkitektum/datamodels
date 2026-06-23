'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DATAMODELLER } from '@/lib/datamodeller';
import {
  type CustomModell,
  listCustomModels,
  createCustomModel,
  createCustomModelFromXsd,
  deleteCustomModel,
  setModellStatus,
} from '@/lib/customModels';
import type { ModellStatus } from '@/lib/datamodeller';
import { subscribeTable } from '@/lib/realtime';
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
import {
  fetchAllReaksjoner,
  settReaksjon,
  fjernReaksjon,
  type Reaksjon,
  type ReaksjonVerdi,
} from '@/lib/reaksjoner';
import ValideringsreglerView from '@/components/regler/ValideringsreglerView';
import AdminView from '@/components/admin/AdminView';
import Header, { type HeaderView } from './Header';
import Sidebar from './Sidebar';
import DiskusjonPanel from './DiskusjonPanel';
import InnboksView from './InnboksView';
import GlobalSearch from './GlobalSearch';
import DatamodellTab from './tabs/DatamodellTab';
import DokumenterTab from './tabs/DokumenterTab';
import XsdTab from './tabs/XsdTab';
import EksempelTab from './tabs/EksempelTab';
import DiskusjonTab from './tabs/DiskusjonTab';
import ValiderXmlTab from './tabs/ValiderXmlTab';
import HistorikkTab from './tabs/HistorikkTab';
import { ModellView, STATUS_META, SUBTABS } from './types';

export default function WorkspaceClient() {
  const { rolle, navn, epost, isDibk, isAdmin } = useRolle();
  const [custom, setCustom] = useState<CustomModell[]>([]);
  const [customLoaded, setCustomLoaded] = useState(false);
  const [diskusjon, setDiskusjon] = useState<Melding[]>([]);
  const [reaksjoner, setReaksjoner] = useState<Reaksjon[]>([]);
  const [activeId, setActiveId] = useState<string>(DATAMODELLER[0].id);
  const [activeSub, setActiveSub] = useState<string>('datamodell');
  const [threadCtx, setThreadCtx] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editStruktur, setEditStruktur] = useState(false);
  const [view, setView] = useState<HeaderView>('modell');

  // «Ny modell»-modal
  const [showCreate, setShowCreate] = useState(false);
  const [nyNavn, setNyNavn] = useState('');
  const [nyBesk, setNyBesk] = useState('');
  const [nyStatus, setNyStatus] = useState<ModellStatus>('arbeid');
  const [nyXsd, setNyXsd] = useState<{ text: string; file: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const reloadCustom = useCallback(async () => {
    setCustom(await listCustomModels());
    setCustomLoaded(true);
  }, []);
  const reloadDiskusjon = useCallback(async () => setDiskusjon(await fetchAllDiskusjon()), []);
  const reloadReaksjoner = useCallback(async () => setReaksjoner(await fetchAllReaksjoner()), []);

  useEffect(() => {
    reloadCustom();
    reloadDiskusjon();
    reloadReaksjoner();
  }, [reloadCustom, reloadDiskusjon, reloadReaksjoner]);

  // Sanntid: oppdater diskusjon, reaksjoner og modelliste live når andre skriver.
  useEffect(() => {
    const avDiskusjon = subscribeTable('diskusjon', { onChange: () => reloadDiskusjon() });
    const avReaksjon = subscribeTable('diskusjon_reaksjon', { onChange: () => reloadReaksjoner() });
    const avModeller = subscribeTable('datamodell', { onChange: () => reloadCustom() });
    return () => {
      avDiskusjon();
      avReaksjon();
      avModeller();
    };
  }, [reloadCustom, reloadDiskusjon, reloadReaksjoner]);

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
    setView('modell');
    setSearch('');
  }
  // Hopp fra Innboksen til en felt-tråd i riktig modell.
  function goToTraad(modellId: string, kontekst: string | null) {
    setActiveId(modellId);
    setActiveSub('diskusjon');
    setThreadCtx(kontekst);
    setEditStruktur(false);
    setView('modell');
    setSearch('');
  }
  // Hopp fra globalt søk til riktig modell + fane (+ evt. felt-tråd).
  function goToTreff(modellId: string, fane: string, kontekst: string | null) {
    setActiveId(modellId);
    setActiveSub(SUBTABS.some((s) => s.id === fane) ? fane : 'datamodell');
    setThreadCtx(kontekst);
    setEditStruktur(false);
    setView('modell');
    setSearch('');
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
  // Veksle 👍/👎 på en kommentar: samme verdi igjen fjerner reaksjonen.
  async function toggleReaksjon(meldingId: string, verdi: ReaksjonVerdi) {
    if (!epost) {
      window.alert('Du må være innlogget for å reagere.');
      return;
    }
    const mine = reaksjoner.find(
      (r) => r.melding_id === meldingId && r.epost.toLowerCase() === epost.toLowerCase(),
    );
    const ok = mine?.verdi === verdi
      ? await fjernReaksjon(meldingId, epost)
      : await settReaksjon(meldingId, epost, navn, verdi);
    if (!ok) window.alert('Kunne ikke lagre reaksjonen. Du kan ikke reagere på din egen kommentar.');
    reloadReaksjoner();
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    const n = nyNavn.trim();
    if (!n) return;
    setBusy(true);
    let created: CustomModell | null;
    try {
      created = nyXsd
        ? await createCustomModelFromXsd(n, nyBesk.trim() || undefined, nyStatus, nyXsd.text, nyXsd.file)
        : await createCustomModel(n, nyBesk.trim() || undefined, nyStatus);
    } catch (err) {
      // createCustomModelFromXsd lar parseXsd kaste ved ugyldig XSD.
      setBusy(false);
      window.alert('Kunne ikke lese XSD: ' + (err as Error).message);
      return;
    }
    setBusy(false);
    if (!created) {
      window.alert('Kunne ikke opprette modellen. Sjekk at du er innlogget og at databasen tillater det.');
      return;
    }
    setShowCreate(false);
    setNyNavn('');
    setNyBesk('');
    setNyStatus('arbeid');
    setNyXsd(null);
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

  // Globalt søk + topp-visninger (Innboks/Admin) tar hovedområdet i full bredde
  // og skjuler diskusjonspanelet.
  const searchActive = search.trim().length > 0;
  const wide = view !== 'modell' || searchActive;
  const sokModeller = useMemo(() => models.map((m) => ({ id: m.id, navn: m.navn })), [models]);
  const modellNavn = useMemo(() => {
    const map = new Map(models.map((m) => [m.id, m.navn]));
    return (id: string) => map.get(id) ?? id;
  }, [models]);
  const apneForslag = diskusjon.filter((m) => m.type === 'proposal' && m.status === 'open').length;

  return (
    <>
      <Header view={view} onView={setView} innboksCount={apneForslag} />
      <div style={{ minHeight: 'calc(100vh - 60px)', background: 'var(--bg-2)' }}>
        <div className="ws-layout">
          <Sidebar
            models={models}
            activeId={activeId}
            activeModel={model}
            search={search}
            onSearch={setSearch}
            onSelect={selectModel}
            openCount={(id) => aapneForslagCount(diskusjon, id)}
            onOpenCreate={() => setShowCreate(true)}
          />

          <main className={wide ? 'ws-main ws-main--wide' : 'ws-main'}>
            {searchActive ? (
              <GlobalSearch query={search} models={sokModeller} onGoTo={goToTreff} />
            ) : view === 'innboks' ? (
              <InnboksView
                messages={diskusjon}
                modellNavn={modellNavn}
                canDecide={isDibk}
                onGoTo={goToTraad}
                onDecide={decide}
              />
            ) : view === 'admin' ? (
              isAdmin ? (
                <AdminView />
              ) : (
                <p className="p p-sm" style={{ color: 'var(--fg-2)' }}>
                  Du har ikke admin-tilgang.
                </p>
              )
            ) : (
              <>
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
            {activeSub === 'validerxml' && <ValiderXmlTab key={model.id} model={model} />}
            {activeSub === 'diskusjon' && <DiskusjonTab messages={modelMessages} onOpen={openThread} />}
            {activeSub === 'historikk' && <HistorikkTab key={model.id} model={model} />}
            {activeSub === 'validering' &&
              (model.builtin ? (
                <ValideringsreglerView key={model.id} datamodellId={model.id} />
              ) : (
                <ValideringsreglerView key={model.id} datamodellId={model.id} defaultGrupper={[]} root="" />
              ))}
              </>
            )}
          </main>

          {!wide && (
            <DiskusjonPanel
              ctx={threadCtx}
              ctxLabel={ctxLabel}
              modellNavn={model.navn}
              messages={panelMessages}
              reaksjoner={reaksjoner}
              canDecide={isDibk}
              currentEpost={epost}
              currentNavn={navn}
              onBack={() => setThreadCtx(null)}
              onSend={send}
              onDecide={decide}
              onReact={toggleReaksjon}
              onEdit={editMessage}
              onDeleteMessage={deleteMessage}
              onClear={clearThread}
            />
          )}
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
            <label>
              XSD (valgfritt)
              <input
                type="file"
                accept=".xsd,.xml,application/xml,text/xml"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) {
                    setNyXsd(null);
                    return;
                  }
                  setNyXsd({ text: await f.text(), file: f.name });
                }}
                style={{ width: '100%', marginTop: 5, fontSize: '0.9rem' }}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--fg-2)', display: 'block', marginTop: 4 }}>
                {nyXsd
                  ? `Strukturen seedes fra «${nyXsd.file}».`
                  : 'Last opp en XSD for å fylle datamodellen automatisk. Uten fil opprettes en tom modell.'}
              </span>
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
