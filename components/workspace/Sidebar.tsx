'use client';

import { ModellView, STATUS_META, STATUS_ORDER } from './types';
import SidebarReferanse from './SidebarReferanse';

export default function Sidebar({
  models,
  activeId,
  activeModel,
  search,
  onSearch,
  onSelect,
  openCount,
  onOpenCreate,
}: {
  models: ModellView[];
  activeId: string;
  activeModel: ModellView;
  search: string;
  onSearch: (v: string) => void;
  onSelect: (id: string) => void;
  openCount: (id: string) => number;
  onOpenCreate: () => void;
}) {
  const q = search.trim().toLowerCase();
  const matches = (m: ModellView) =>
    !q ||
    m.navn.toLowerCase().includes(q) ||
    (m.root || '').toLowerCase().includes(q) ||
    (m.short || '').toLowerCase().includes(q);

  const groups = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_META[status].label,
    items: models.filter((m) => m.status === status && matches(m)),
  })).filter((g) => g.items.length);

  return (
    <aside className="ws-rail pv-scroll">
      <div style={{ marginBottom: 14 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          Datamodeller
        </div>
        <input
          className="input input--sm"
          placeholder="Søk i modeller…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      <button className="btn btn--secondary btn--sm" onClick={onOpenCreate} style={{ width: '100%', marginBottom: 16 }}>
        + Ny modell
      </button>

      {groups.length === 0 && (
        <p style={{ fontSize: '0.82rem', color: 'var(--fg-2)' }}>Ingen modeller treffer søket.</p>
      )}

      {groups.map((grp) => (
        <div key={grp.status} style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className="eyebrow" style={{ margin: 0 }}>
              {grp.label}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--fg-3)' }}>{grp.items.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {grp.items.map((m) => {
              const active = m.id === activeId;
              const open = openCount(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => onSelect(m.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 9,
                    width: '100%',
                    textAlign: 'left',
                    appearance: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 10px',
                    background: active ? 'var(--accent-tinted)' : 'transparent',
                    borderLeft: `3px solid ${active ? 'var(--accent-base)' : 'transparent'}`,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: STATUS_META[m.status].dot,
                      flexShrink: 0,
                      marginTop: 6,
                    }}
                  />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: active ? 600 : 500,
                        color: active ? 'var(--accent-text)' : 'var(--fg-1)',
                        lineHeight: 1.25,
                      }}
                    >
                      {m.navn}
                    </span>
                    <span
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.68rem',
                        color: 'var(--fg-2)',
                        marginTop: 2,
                      }}
                    >
                      {m.short}
                    </span>
                  </span>
                  {open > 0 && (
                    <span
                      style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        background: 'var(--warning-base)',
                        color: '#3e2700',
                        borderRadius: 999,
                        padding: '1px 7px',
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      {open}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <SidebarReferanse key={activeModel.id} model={activeModel} />
    </aside>
  );
}
