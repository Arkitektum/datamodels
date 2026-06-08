// Brevmal-editor — portet 1:1 fra index.html sin imperative logikk, men lagrer
// via et callback (Supabase) i stedet for localStorage. Opererer på en container
// (root) som inneholder det injiserte datamodell-HTML-et.

export type BrevmalData = Record<string, unknown>;

export interface BrevmalEditorHandle {
  load: (data: BrevmalData) => void;
  destroy: () => void;
}

interface ExtraSpec {
  type: string;
  value: string;
  position: number;
}

export function initBrevmalEditor(
  root: HTMLElement,
  persist: (data: BrevmalData) => void,
): BrevmalEditorHandle {
  let saveTimeout: ReturnType<typeof setTimeout> | null = null;

  const statusEl = () => root.querySelector<HTMLElement>('#toolbarStatus');
  function showStatus(msg: string, cls?: string) {
    const el = statusEl();
    if (!el) return;
    el.textContent = msg;
    el.className = 'toolbar-status ' + (cls || '');
  }
  function showToast(msg: string, isError?: boolean) {
    const t = document.createElement('div');
    t.className = 'toast' + (isError ? ' error' : '');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2400);
  }

  const fieldKey = (el: HTMLElement) => el.dataset.tmpl + '.' + el.dataset.field;
  function autoSize(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 4 + 'px';
  }
  function refreshFilledState(el: HTMLInputElement | HTMLTextAreaElement) {
    el.classList.toggle('filled', !!el.value.trim());
  }

  function getCurrentData(): BrevmalData {
    const data: BrevmalData = {};
    root.querySelectorAll<HTMLTextAreaElement>('textarea[data-tmpl][data-field]').forEach((el) => {
      if (el.value.trim()) data[fieldKey(el)] = el.value;
    });
    root.querySelectorAll<HTMLElement>('.letter[data-tmpl-content]').forEach((letter) => {
      const tmpl = letter.dataset.tmplContent as string;
      const list: ExtraSpec[] = [];
      let fixedCount = 0;
      Array.from(letter.children).forEach((child) => {
        if (child.classList.contains('extra-section')) {
          const inp = child.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
          list.push({
            type: (child as HTMLElement).dataset.extraType || '',
            value: inp ? inp.value : '',
            position: fixedCount,
          });
        } else {
          fixedCount++;
        }
      });
      if (list.length > 0) data[tmpl + '.__extras__'] = list;
    });
    return data;
  }

  function saveNow() {
    persist(getCurrentData());
    showStatus('✓ Lagret (delt)', 'saved');
  }
  function debouncedSave() {
    showStatus('● Lagrer …', 'saving');
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveNow, 400);
  }

  function loadFromData(data: BrevmalData) {
    root.querySelectorAll<HTMLTextAreaElement>('textarea[data-tmpl][data-field]').forEach((el) => {
      const v = data[fieldKey(el)];
      if (v !== undefined) el.value = v as string;
      autoSize(el);
      refreshFilledState(el);
    });
    root.querySelectorAll<HTMLElement>('.letter[data-tmpl-content]').forEach((letter) => {
      const tmpl = letter.dataset.tmplContent as string;
      const extras = data[tmpl + '.__extras__'] as ExtraSpec[] | undefined;
      letter.querySelectorAll(':scope > .extra-section').forEach((e) => e.remove());
      if (!Array.isArray(extras)) return;
      const fixedSiblings = Array.from(letter.children);
      extras.forEach((x) => {
        const wrap = createExtra(letter, x);
        const target = fixedSiblings[x.position];
        if (target) letter.insertBefore(wrap, target);
        else letter.appendChild(wrap);
      });
    });
  }

  function createExtra(letter: HTMLElement, extra: { type: string; value?: string }): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'extra-section';
    wrap.dataset.extraType = extra.type;
    wrap.draggable = true;

    const handle = document.createElement('div');
    handle.className = 'extra-handle';
    handle.title = 'Dra for å flytte';
    handle.textContent = '⋮⋮';

    let input: HTMLInputElement | HTMLTextAreaElement;
    if (extra.type === 'h3') {
      input = document.createElement('input');
      (input as HTMLInputElement).type = 'text';
      input.className = 'editable-field editable-h3';
      input.placeholder = 'Skriv overskrift …';
    } else {
      input = document.createElement('textarea');
      input.className = 'editable-field editable-textarea-extra';
      (input as HTMLTextAreaElement).rows = 3;
      input.placeholder = 'Skriv tekst …';
    }
    input.value = extra.value || '';
    input.addEventListener('input', () => {
      if (extra.type !== 'h3') autoSize(input as HTMLTextAreaElement);
      refreshFilledState(input);
      debouncedSave();
    });

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'extra-remove';
    remove.title = 'Fjern dette feltet';
    remove.textContent = '×';
    remove.onclick = () => {
      wrap.remove();
      debouncedSave();
    };

    wrap.addEventListener('dragstart', (e) => {
      wrap.classList.add('dragging');
      e.dataTransfer!.effectAllowed = 'move';
      e.dataTransfer!.setData('text/plain', '');
    });
    wrap.addEventListener('dragend', () => {
      wrap.classList.remove('dragging');
      clearDropIndicators(letter);
      letter.classList.remove('drop-active');
      debouncedSave();
    });
    input.addEventListener('mousedown', (e) => e.stopPropagation());
    input.addEventListener('dragstart', (e) => e.preventDefault());

    wrap.appendChild(handle);
    wrap.appendChild(input);
    wrap.appendChild(remove);
    if (extra.type !== 'h3') autoSize(input as HTMLTextAreaElement);
    refreshFilledState(input);
    return wrap;
  }

  function clearDropIndicators(letter: HTMLElement) {
    letter
      .querySelectorAll(':scope > .drag-over-above, :scope > .drag-over-below')
      .forEach((el) => el.classList.remove('drag-over-above', 'drag-over-below'));
  }

  function setupLetterDropTarget(letter: HTMLElement) {
    letter.addEventListener('dragover', (e) => {
      const dragging = letter.querySelector(':scope > .dragging');
      if (!dragging) return;
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'move';
      letter.classList.add('drop-active');
      clearDropIndicators(letter);
      const children = Array.from(letter.children).filter((c) => c !== dragging);
      let target: Element | null = null;
      let above = true;
      for (const child of children) {
        const rect = child.getBoundingClientRect();
        if (e.clientY < rect.top + rect.height / 2) {
          target = child;
          above = true;
          break;
        }
      }
      if (!target && children.length > 0) {
        target = children[children.length - 1];
        above = false;
      }
      if (target) target.classList.add(above ? 'drag-over-above' : 'drag-over-below');
    });
    letter.addEventListener('dragleave', (e) => {
      if (e.target === letter) {
        clearDropIndicators(letter);
        letter.classList.remove('drop-active');
      }
    });
    letter.addEventListener('drop', (e) => {
      const dragging = letter.querySelector(':scope > .dragging');
      if (!dragging) return;
      e.preventDefault();
      const children = Array.from(letter.children).filter((c) => c !== dragging);
      let target: Element | null = null;
      let above = true;
      for (const child of children) {
        const rect = child.getBoundingClientRect();
        if (e.clientY < rect.top + rect.height / 2) {
          target = child;
          above = true;
          break;
        }
      }
      if (target) {
        if (above) letter.insertBefore(dragging, target);
        else letter.insertBefore(dragging, target.nextSibling);
      } else {
        letter.appendChild(dragging);
      }
      clearDropIndicators(letter);
      letter.classList.remove('drop-active');
    });
  }

  function addExtra(tmpl: string, type: string) {
    const letter = root.querySelector<HTMLElement>(`.letter[data-tmpl-content="${tmpl}"]`);
    if (!letter) return;
    const wrap = createExtra(letter, { type, value: '' });
    const sig = letter.querySelector(':scope > .signature');
    if (sig) letter.insertBefore(wrap, sig);
    else letter.appendChild(wrap);
    wrap.querySelector<HTMLElement>('input, textarea')?.focus();
    debouncedSave();
  }

  function exportJSON() {
    const data = getCurrentData();
    if (Object.keys(data).length === 0) {
      showToast('Ingen data å eksportere', true);
      return;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brevmaler-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Eksportert til JSON-fil');
  }

  function importJSON(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(String(e.target?.result));
        if (typeof data !== 'object' || Array.isArray(data)) throw new Error('Ugyldig format');
        persist(data);
        loadFromData(data);
        showToast('Importert fra JSON-fil');
        showStatus('✓ Importert', 'saved');
      } catch (err) {
        showToast('Kunne ikke lese fila: ' + (err as Error).message, true);
      }
      input.value = '';
    };
    reader.readAsText(file);
  }

  function resetAll() {
    if (!confirm('Slette ALLE endringer i ALLE maler? Dette kan ikke angres (med mindre du har eksportert til JSON).'))
      return;
    root.querySelectorAll<HTMLTextAreaElement>('textarea[data-tmpl][data-field]').forEach((el) => {
      el.value = '';
      autoSize(el);
      refreshFilledState(el);
    });
    root.querySelectorAll<HTMLElement>('.letter[data-tmpl-content]').forEach((letter) => {
      letter.querySelectorAll(':scope > .extra-section').forEach((e) => e.remove());
    });
    persist({});
    showToast('Alle maler tilbakestilt');
    showStatus('● Klar');
  }

  function resetTemplate(tmpl: string) {
    if (!confirm(`Tilbakestille mal "${tmpl}"?`)) return;
    root.querySelectorAll<HTMLTextAreaElement>(`textarea[data-tmpl="${tmpl}"]`).forEach((el) => {
      el.value = '';
      autoSize(el);
      refreshFilledState(el);
    });
    const letter = root.querySelector<HTMLElement>(`.letter[data-tmpl-content="${tmpl}"]`);
    if (letter) letter.querySelectorAll(':scope > .extra-section').forEach((e) => e.remove());
    saveNow();
    showToast('Mal tilbakestilt');
  }

  function copyTemplate(tmpl: string) {
    const el = root.querySelector<HTMLElement>(`.letter[data-tmpl-content="${tmpl}"]`);
    if (!el) {
      showToast('Fant ikke malen', true);
      return;
    }
    const clone = el.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('textarea').forEach((t) => {
      const p = document.createElement('p');
      p.textContent = (t as HTMLTextAreaElement).value.trim() || '[…]';
      t.replaceWith(p);
    });
    clone.querySelectorAll<HTMLInputElement>('input[type="text"].editable-h3').forEach((i) => {
      const h = document.createElement('h3');
      h.textContent = i.value.trim() || '[…]';
      i.replaceWith(h);
    });
    clone.querySelectorAll('.extra-remove').forEach((b) => b.remove());
    navigator.clipboard.writeText(clone.outerHTML).then(
      () => showToast('Kopiert som HTML til utklippstavlen'),
      () => showToast('Kunne ikke kopiere — prøv manuelt', true),
    );
  }

  // ---- Koble opp DOM ----
  const mainInputHandlers: Array<[HTMLTextAreaElement, () => void]> = [];
  root.querySelectorAll<HTMLTextAreaElement>('textarea[data-tmpl][data-field]').forEach((el) => {
    const handler = () => {
      autoSize(el);
      refreshFilledState(el);
      debouncedSave();
    };
    el.addEventListener('input', handler);
    mainInputHandlers.push([el, handler]);
    autoSize(el);
    refreshFilledState(el);
  });
  root.querySelectorAll<HTMLElement>('.letter[data-tmpl-content]').forEach(setupLetterDropTarget);

  // Inline onclick i det injiserte HTML-et kaller disse globale funksjonene.
  type WinExtra = typeof window & Record<string, unknown>;
  const w = window as WinExtra;
  const globals: Record<string, unknown> = {
    addExtra,
    copyTemplate,
    resetTemplate,
    exportJSON,
    importJSON,
    resetAll,
  };
  Object.keys(globals).forEach((k) => {
    w[k] = globals[k];
  });

  showStatus('● Klar');

  return {
    load: loadFromData,
    destroy() {
      if (saveTimeout) clearTimeout(saveTimeout);
      mainInputHandlers.forEach(([el, h]) => el.removeEventListener('input', h));
      Object.keys(globals).forEach((k) => {
        if (w[k] === globals[k]) delete w[k];
      });
    },
  };
}
