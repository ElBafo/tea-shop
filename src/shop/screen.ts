import { isSecondEdition } from "../game/mode";
import { APP_VERSION } from "../game/version";
import { readGoal, saveGoal } from "../game/goal";
import { readPuzzle } from '../game/resume';
import { rewardCard } from '../ui/reward';
import { collectionUnlocked } from './upgrades';
import { guideStage, setGuide, guideCard } from "../game/guide";
import { audioToggle, themeToggle, updateAudioToggle, updateThemeToggle } from "../ui/toggles";
import { isOfflinePreview } from "../game/offline";
import { cloneInventory as clone, storeItem, placeItem, returnValue, returnItem } from "./inventory";
import { styleThumbnail } from "./icons";
import { imageFile, saveImage } from "./share";
import { loadNight, saveNight, setBrowserNight } from "../game/appearance";
import { isGuidePreview, isPreview, isShowroom, resetPreviewProgress } from "../game/preview";
import { playChime, playClick, playFinale } from "../game/audio";
import { isBakeryOpen, saveShop, spendableStars } from "../game/storage";
import type { Placement, Progress, ShopState, UpgradeId } from "../game/types";
import { Diorama } from "./diorama";
import { canPlace, findOpenPlacement, nextRotation } from "./grid";
import {
  UPGRADE_BY_ID,
  DECORATIONS,
  canPurchaseCopy,
  isStored,
  kindOf,
  isOwned,
  shopComplete,
  styleOf,
} from "./upgrades";

const STAR = "✦";
interface DecorationDraft { id: UpgradeId; style: number; place: Placement | null; }


export interface ShopHost {
  progress: Progress;
  save(next: Progress): void;
  goLevels(): void;
  playNext(): void;
  toggleMute(): void;
  resumePuzzle(): void;
  backups(): void;
}

export interface ShopScreen {
  ready(): Promise<void>;
  refresh(): void;
  dispose(): void;
}

export function mountShop(root: HTMLElement, host: ShopHost, startInEdit = false, initialReward?: UpgradeId): ShopScreen {
  root.innerHTML = `
    <div class="frame shop-room">
      <header class="topbar shop-overlay shop-toolbar">
        <h2 class="visually-hidden">Tea Shop</h2>
        <p class="shop-stars" id="shop-stars"></p>
        <div class="room-actions">
          ${themeToggle(false)}
          ${audioToggle(host.progress.muted)}
          <details class="settings-menu">
            <summary aria-label="More shop options" title="More shop options"><span aria-hidden="true">⋯</span></summary>
            <div class="settings-popover">
              <span class="build-version">Decopu · v${APP_VERSION}</span>
              ${isSecondEdition ? '<button id="browse-puzzles" type="button">All puzzles</button>' : ""}
              ${!isShowroom && !isGuidePreview ? '<button id="backup-progress" type="button">Progress & backups</button>' : ''}
              ${isPreview ? '<button id="reset-preview" type="button">Reset preview progress</button>' : ""}
              <button id="showcase-toggle" class="icon-btn" type="button">Showcase</button>
            </div>
          </details>
          <button id="edit-toggle" class="icon-btn" type="button">Edit</button>
        </div>
      </header>
      ${isPreview ? `<aside class="preview-bar"><span>${isGuidePreview ? "Tour · temporary" : isShowroom ? "Showroom · temporary" : isOfflinePreview ? "Offline preview" : isSecondEdition ? "Second edition · v" + APP_VERSION : "Preview · v" + APP_VERSION}</span><a href="${import.meta.env.BASE_URL}${isSecondEdition ? (isShowroom ? "?edition=2" : "?edition=2&showroom=1") : isShowroom ? "" : "?showroom=1"}">${isShowroom ? "Back to my shop" : "See finished shop"}</a></aside>` : ""}
      <div id="shop-guide"></div>
      <div class="shop-stage">
        <canvas id="shop-canvas" aria-label="The tea shop room. Pinch to zoom."></canvas>
      ${isSecondEdition ? '<button id="undo-move" class="move-undo" type="button" disabled>Undo move</button>' : ""}
      <p id="placement-status" class="placement-status hidden" role="status" aria-live="polite"></p>
        <div class="shop-zoom" role="group" aria-label="Shop view">
          <button data-zoom="out" type="button" aria-label="Zoom out">−</button>
          <button data-zoom="fit" type="button" aria-label="Reset shop view">Fit</button>
          <button data-zoom="in" type="button" aria-label="Zoom in">+</button>
        </div>
      </div>
      <div class="showcase-tools hidden">
        <button id="showcase-back" class="icon-btn" type="button">Back</button>
        <button id="share-shop" class="icon-btn" type="button">Share image</button>
        <button id="save-shop" class="icon-btn" type="button">Save image</button>
      </div>
      <p id="share-status" class="share-status hidden" role="status" aria-live="polite"></p>
      <button id="upgrade-notice" class="upgrade-notice hidden" type="button"></button>
      <div class="shop-dock">
        <section id="decorate-panel" class="hidden" aria-label="Decorations">
        <div class="editor-nav"><button id="editor-back" class="collection-back hidden" data-act="browse" type="button">← Browse</button><button id="tray-toggle" class="tray-toggle" type="button" aria-expanded="true" aria-controls="editor-body">Hide panel <span aria-hidden="true">⌄</span></button></div>
        <div id="editor-body">
        <div class="catalog-tabs" role="group" aria-label="Decoration collection">
          <button data-filter="all" type="button">Decorations</button>
          <button data-filter="owned" type="button">My decorations</button>
        </div>
        <div class="editor-content">
          <div class="upgrade-detail hidden" id="upgrade-detail"></div>
          <div class="upgrade-rail" id="upgrade-rail"></div>
        </div>
        </div>
        </section>
        <div class="shop-actions">
          <button class="shop-card open" id="play-tea" type="button">
            <span class="home-play-icon" aria-hidden="true">▤</span>
            <span class="card-copy">
              <strong>${isSecondEdition ? "Play next puzzle" : "Play puzzles"}</strong>
              <em>Earn stars to decorate</em>
            </span><span class="home-arrow" aria-hidden="true">→</span>
          </button>
          <button class="shop-card" id="bakery" type="button">
            <span class="card-art bake-art" aria-hidden="true"></span>
            <span class="card-copy">
              <strong>Bakery</strong>
              <em id="bakery-copy"></em>
            </span>
            <span class="lock-pill" id="bakery-lock">Locked</span>
          </button>
        </div>
      </div>
      <div class="overlay hidden" id="shop-modal" role="dialog" aria-label="Shop note"></div>
    </div>`;

  const canvas = root.querySelector<HTMLCanvasElement>("#shop-canvas");
  if (!canvas) throw new Error("Missing shop canvas");

  const appearanceKey = isSecondEdition ? "tea-shop-preview-edition2-appearance-v1" : `tea-shop-${isPreview ? "preview-" : ""}appearance-v1`;
  let night = loadNight(appearanceKey);
  let edit = startInEdit;
  let showcasing = false;
  let trayCollapsed = false;
  let sharing = false;
  let returnDialog: HTMLDialogElement | null = null;
  let focus: UpgradeId | null = null;
  let selected: UpgradeId | null = null;
  let finaleOpen = false;
  let bakeryNote = false;
  let filter: "all" | "owned" = "all";
  let draft: DecorationDraft | null = null;
  let lastMove: {id: UpgradeId; place: Placement} | null = null;
  const browseScroll = {all:0, owned:0};

  const diorama = new Diorama(canvas, host.progress.shop, {
    onZoom: zoom => {
      root.querySelector<HTMLButtonElement>('[data-zoom="out"]')!.disabled = zoom <= 0.85;
      root.querySelector<HTMLButtonElement>('[data-zoom="in"]')!.disabled = zoom >= 1.9;
    },
    onPlacementBlocked: () => {
      const status = root.querySelector<HTMLElement>("#placement-status")!;
      status.textContent = isSecondEdition ? "That spot is unavailable. Try another place." : "No room on that wall. Move or store another decoration first.";
      status.classList.remove("hidden");
    },
    onSelect: (id) => {
      root.querySelector("#placement-status")?.classList.add("hidden");
      selected = id;
      if (id) {
        if (draft?.id !== id) clearPreview();
        focus = id;
        filter = isOwned(host.progress.shop, id) ? "owned" : "all";
      }
      paintChrome();
    },
    onMove: (id, place) => {
      root.querySelector("#placement-status")?.classList.add("hidden");
      if (draft?.id === id) {
        draft.place = place;
        diorama.sync(previewShop());
        paintChrome();
        return;
      }
      const shop = clone(host.progress.shop);
      if (isSecondEdition) lastMove = {id, place:{...(shop.place[id] ?? UPGRADE_BY_ID[id].defaultPlace)}};
      shop.place[id] = place;
      commit(shop);
      playChime(host.progress.muted);
    },
    onPlaced: () => {
      playChime(host.progress.muted);
    },
  });

  diorama.setNight(night);

  const paintChrome = () => {
    setBrowserNight(night);
    const undoMove = root.querySelector<HTMLButtonElement>('#undo-move');
    if (undoMove) { undoMove.disabled = !lastMove; undoMove.classList.toggle('hidden', !edit); }
    root.querySelector(".shop-room")?.classList.toggle("is-night", night);
    root.querySelector(".shop-room")?.classList.toggle("tray-collapsed", edit && trayCollapsed);
    const tray = root.querySelector<HTMLButtonElement>("#tray-toggle")!;
    tray.setAttribute("aria-expanded", String(!trayCollapsed));
    tray.innerHTML = trayCollapsed ? 'Show panel <span aria-hidden="true">⌃</span>' : 'Hide panel <span aria-hidden="true">⌄</span>';
    root.querySelector<HTMLElement>("#editor-body")!.inert = trayCollapsed;
    updateThemeToggle(root.querySelector("#theme-toggle"), night);
    root.querySelector(".settings-menu")?.classList.toggle("hidden", edit);
    root.querySelector(".shop-room")?.classList.toggle("showcasing", showcasing);
    root.querySelector(".showcase-tools")?.classList.toggle("hidden", !showcasing);
    root.querySelector("#share-status")?.classList.toggle("hidden", !showcasing);
    root.querySelector("#showcase-toggle")?.classList.toggle("hidden", edit);
    const progress = host.progress;
    if (guideStage() === 'decorate' && progress.shop.owned.length) setGuide('arrange');
    const guide = root.querySelector<HTMLElement>('#shop-guide')!;
    const stage = guideStage();
    guide.innerHTML = stage === 'puzzle' ? guideCard('1 · Sort a shelf', 'Play the first puzzle to earn stars for your shop.', '<button type="button" data-guide-play>Play puzzles →</button>')
      : stage === 'decorate' && spendableStars(progress) < 2 ? guideCard('2 · Save for your first piece', 'Decorations start at 2 stars. Play another puzzle or improve your best score to earn more.', '<button type="button" data-guide-play>Play puzzles →</button>')
      : stage === 'decorate' ? guideCard('2 · Make it yours', edit ? 'Pick a decoration, try a style, then buy it with your stars. A counter costs 2 stars.' : 'Your stars buy decorations. Open Edit to choose your first piece.', edit ? '' : '<button type="button" data-guide-edit>Decorate →</button>')
      : stage === 'arrange' ? guideCard('3 · Make it personal', progress.shop.owned.some(id => UPGRADE_BY_ID[id].movable) ? isSecondEdition ? 'Select furniture, then tap an open spot or drag it. Try Rotate and Undo move.' : 'In Edit, drag your furniture to move it. Try another style or rotate it. Changes save automatically.' : 'Try a different wall style. When you add furniture, you can drag and rotate it in Edit. Changes save automatically.', '<button type="button" data-guide-done>Got it — my shop, my way</button>') : '';
    guide.classList.toggle('hidden', !guide.innerHTML);
    root.querySelector('.shop-room')?.classList.toggle('has-guide', Boolean(guide.innerHTML));
    const spendable = spendableStars(progress);
    if (isSecondEdition) {
      const unfinished = readPuzzle(progress);
      const complete = progress.bestStars.every(stars => stars > 0);
      const maxed = progress.bestStars.every(stars => stars === 3);
      root.querySelector('#play-tea strong')!.textContent = unfinished ? 'Continue puzzle' : maxed ? 'Revisit puzzles' : complete ? 'Improve your scores' : 'Play next puzzle';
      root.querySelector('#play-tea em')!.textContent = unfinished ? 'Pick up where you left off' : maxed ? 'All ten finished · Play a favourite' : complete ? 'Earn more stars for your favourite pieces' : 'Earn stars to decorate';
    }
    const available = DECORATIONS.filter((item) => collectionUnlocked(item.id,progress.bestStars) && !isOwned(progress.shop, item.id) && canPurchaseCopy(progress.shop, item.id) && item.cost <= spendable).length;
    updateAudioToggle(root.querySelector("#mute"), progress.muted);

    const starLine = root.querySelector("#shop-stars");
    if (starLine) {
      starLine.innerHTML = `<span class="star-glyph" aria-hidden="true">${STAR}</span> <strong>${spendable}</strong>`;
      starLine.setAttribute("aria-label", `${spendable} stars available`);
    }

    const toggle = root.querySelector("#edit-toggle");
    if (toggle) toggle.textContent = edit ? "Done" : "Edit";
    root.querySelector("h2")!.textContent = edit ? "Decorate" : "Tea Shop";
    root.querySelector("#decorate-panel")?.classList.toggle("hidden", !edit);
    root.querySelector(".shop-actions")?.classList.toggle("hidden", edit);
    const notice = root.querySelector("#upgrade-notice");
    notice?.classList.toggle("hidden", edit || available === 0);
    if (notice) notice.textContent = `${available} ${available === 1 ? "decoration" : "decorations"} available · Browse`;
    root.querySelector(".shop-room")?.classList.toggle("decorating", edit);
    if (!edit) root.querySelector("#placement-status")?.classList.add("hidden");

    root.querySelector('.shop-room')?.classList.toggle('has-selection',Boolean(focus));
    root.querySelector('#editor-back')?.classList.toggle('hidden',!focus);
    const rail = root.querySelector("#upgrade-rail");
    root.querySelectorAll<HTMLButtonElement>("[data-filter]").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
    });
    const collection = DECORATIONS.filter(item => isOwned(progress.shop, item.id) === (filter === "owned") && (filter === "owned" || canPurchaseCopy(progress.shop, item.id)));
    if (rail) rail.innerHTML = collection.map((upgrade) => {
      const owned = isOwned(progress.shop, upgrade.id);
      const active = focus === upgrade.id;
      return `
        <button aria-pressed="${active}" class="upgrade-chip ${owned ? "owned" : ""} ${active ? "active" : ""}" data-upgrade="${upgrade.id}" type="button">
          <span class="deco-icon" aria-hidden="true">${styleThumbnail(upgrade.id,styleOf(progress.shop,upgrade.id))}</span><strong>${label(upgrade.id)}</strong>
          <span>${owned ? `${isStored(progress.shop, upgrade.id) ? "Stored" : "In shop"} · ${UPGRADE_BY_ID[upgrade.id].variants[styleOf(progress.shop, upgrade.id)].name}` : `${upgrade.cost} ${STAR}${!collectionUnlocked(upgrade.id,progress.bestStars) ? ` · ${isSecondEdition ? 'Unlock at ' : ''}${upgrade.unlockAfter} puzzles` : upgrade.collection ? ` · ${upgrade.collection}` : ""}`}</span>
        </button>`;
    }).join("");

    rail?.classList.toggle("hidden", Boolean(focus));
    if (rail && !collection.length) rail.innerHTML = `<p class="editor-empty">${filter === "owned" ? "Your collection starts here. Explore Decorations to try something for your shop." : "You have every decoration in this collection. Arrange them in My decorations."}</p>`;
    const detail = root.querySelector("#upgrade-detail");
    detail?.classList.toggle("hidden", !focus);
    if (detail) detail.innerHTML = focus ? `${draft ? taskDetail(progress, focus, draft) : isOwned(progress.shop, focus) ? editDetail(progress.shop, focus) : taskDetail(progress, focus, null)}` : "";

    if (detail && focus) {
      const title = detail.querySelector(".detail-copy")!;
      const purchase = detail.querySelector(".purchase-row, .inventory-actions");
      const scroll = document.createElement("div");
      scroll.className = "detail-scroll";
      for (const child of Array.from(detail.childNodes)) {
        if (child !== purchase && child !== title) scroll.append(child);
      }
      title.after(scroll);
    }

    const bakery = root.querySelector<HTMLButtonElement>("#bakery");
    const bakeryCopy = root.querySelector("#bakery-copy");
    const bakeryLock = root.querySelector("#bakery-lock");
    const open = isBakeryOpen(progress);
    if (bakery) bakery.disabled = true;
    bakery?.classList.toggle("locked", !open);
    bakery?.classList.toggle("open", open);
    if (bakeryCopy) {
      bakeryCopy.textContent = "Future room · Not playable yet";
    }
    if (bakeryLock) bakeryLock.classList.add("hidden");

    const actions=root.querySelector('.shop-actions');
    if(actions){
      actions.querySelector('.journey-goal, .reward-card')?.remove();actions.insertAdjacentHTML('beforeend',rewardCard(progress));
      actions.querySelector('[data-resume-shop]')?.remove();
      if(!isSecondEdition && readPuzzle(progress)) {const button=document.createElement('button');button.dataset.resumeShop='';button.className='resume-card';button.textContent='Resume unfinished puzzle →';button.onclick=()=>host.resumePuzzle();actions.prepend(button);}
    }
    const modal = root.querySelector("#shop-modal");
    if (modal) {
      if (finaleOpen) modal.innerHTML = finaleModal();
      else if (bakeryNote) modal.innerHTML = bakeryModal();
      modal.classList.toggle("hidden", !finaleOpen && !bakeryNote);
    }
  };

  const exportImage = async (share: boolean) => {
    if (sharing) return;
    sharing = true;
    const status = root.querySelector("#share-status");
    if (status) status.textContent = "";
    try {
      const file = imageFile(diorama.captureImage());
      if (share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My Decopu tea shop" });
      } else {
        saveImage(file);
        if (status) status.textContent = "Image ready to save.";
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError") && status) {
        status.textContent = "Could not share the image. Try Save image instead.";
      }
    } finally {
      sharing = false;
    }
  };

  const openDecoration = (id: UpgradeId) => {
    clearPreview(); edit = true; showcasing = false; trayCollapsed = false;
    focus = id; selected = isOwned(host.progress.shop, id) ? id : null;
    filter = selected ? 'owned' : 'all';
    diorama.setEditMode(true); diorama.select(selected);
    if (!selected) preview(id, readGoal(host.progress)?.id === id ? readGoal(host.progress)!.style : 0);
    paintChrome();
  };

  const confirmReturn = (id: UpgradeId) => {
    const value = returnValue(host.progress.shop, id);
    if (!value || returnDialog) return;
    const dialog = document.createElement('dialog'); returnDialog = dialog;
    dialog.className = 'backup-dialog return-dialog';
    dialog.setAttribute('aria-labelledby', 'return-title');
    dialog.innerHTML = `<h3 id="return-title">Return ${label(id)}?</h3><p>Get all ${value} stars back. This piece leaves your room and collection. You can buy it again later; unlocks stay yours.</p><button data-confirm-return type="button">Return for ${value} ✦</button><button data-cancel-return type="button" autofocus>Keep decoration</button>`;
    document.body.append(dialog);
    const close = () => { dialog.close(); dialog.remove(); returnDialog = null; (root.querySelector<HTMLButtonElement>('[data-act="return"]') ?? root.querySelector<HTMLButtonElement>(`[data-upgrade="${id}"]`) ?? root.querySelector<HTMLButtonElement>('[data-filter="all"]'))?.focus({preventScroll:true}); };
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    dialog.querySelector('[data-cancel-return]')!.addEventListener('click', close);
    dialog.querySelector('[data-confirm-return]')!.addEventListener('click', () => {
      const next = returnItem(host.progress.shop, id);
      if (next) { lastMove = null; clearPreview(); selected = null; focus = null; diorama.select(null); commit(next); browse('all'); }
      close();
    });
    dialog.showModal();
  };

  const bind = () => {
    root.querySelector('#browse-puzzles')?.addEventListener('click',()=>host.goLevels());
    root.querySelector('#undo-move')?.addEventListener('click',()=>{
      if (!lastMove) return;
      const {id,place}=lastMove;
      if (!isOwned(host.progress.shop,id) || isStored(host.progress.shop,id) || !canPlace(id,place,host.progress.shop)) return;
      clearPreview(); const shop=clone(host.progress.shop); shop.place[id]={...place}; lastMove=null;
      commit(shop); selected=id; focus=id; filter='owned'; diorama.select(id); paintChrome();
    });
    root.querySelector('#reset-preview')?.addEventListener('click', () => {
      if (!isPreview || returnDialog) return;
      root.querySelector('.settings-menu')?.removeAttribute('open');
      const dialog = document.createElement('dialog'); returnDialog = dialog;
      dialog.className = 'backup-dialog';
      dialog.setAttribute('aria-labelledby', 'reset-preview-title');
      dialog.innerHTML = `<h3 id="reset-preview-title">Start the preview again?</h3><p>This clears this device’s preview progress, decorations and settings, then restarts onboarding. Your main game stays untouched.</p><p role="status" data-reset-error></p><button data-reset-confirm type="button">Clear preview & restart</button><button data-reset-cancel type="button" autofocus>Keep my progress</button>`;
      const close = () => { dialog.close(); dialog.remove(); returnDialog = null; root.querySelector<HTMLElement>('.settings-menu summary')?.focus(); };
      dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
      dialog.querySelector('[data-reset-cancel]')!.addEventListener('click', close);
      dialog.querySelector('[data-reset-confirm]')!.addEventListener('click', () => {
        try { resetPreviewProgress(); location.replace(import.meta.env.BASE_URL + (isSecondEdition ? "?edition=2" : "")); }
        catch { dialog.querySelector('[data-reset-error]')!.textContent = 'Could not clear preview storage. Check browser storage access and try again.'; }
      });
      document.body.append(dialog); dialog.showModal();
    });
    root.querySelector('.shop-actions')?.addEventListener('click', event => {
      const button = (event.target as Element).closest<HTMLElement>('[data-reward]');
      if (button) openDecoration(button.dataset.reward as UpgradeId);
    });
    root.querySelectorAll<HTMLButtonElement>("[data-zoom]").forEach(button => button.addEventListener("click", () => {
      if (button.dataset.zoom === "fit") diorama.resetView();
      else diorama.zoomBy(button.dataset.zoom === "in" ? 1.2 : 1/1.2);
    }));
    root.querySelector("#backup-progress")?.addEventListener("click",()=>host.backups());
    root.querySelector("#showcase-toggle")?.addEventListener("click", () => {
      root.querySelector(".settings-menu")?.removeAttribute("open");
      showcasing = true;
      root.querySelector(".shop-room")!.scrollTop = 0;
      paintChrome();
      root.querySelector<HTMLButtonElement>("#showcase-back")?.focus({preventScroll:true});
    });
    root.querySelector("#showcase-back")?.addEventListener("click", () => {
      showcasing = false;
      paintChrome();
      root.querySelector<HTMLButtonElement>("#showcase-toggle")?.focus({preventScroll:true});
    });
    root.querySelector("#share-shop")?.addEventListener("click", () => { void exportImage(true); });
    root.querySelector("#save-shop")?.addEventListener("click", () => { void exportImage(false); });
    root.querySelector("#theme-toggle")?.addEventListener("click", () => {
      night = !night;
      if (!isShowroom && !isGuidePreview) saveNight(appearanceKey, night);
      diorama.setNight(night);
      playClick(host.progress.muted);
      paintChrome();
    });
    root.querySelector("#mute")?.addEventListener("click", () => {
      host.toggleMute();
      paintChrome();
    });
    root.querySelector("#editor-back")?.addEventListener("click",()=>browse(filter));
    root.querySelector("#tray-toggle")?.addEventListener("click", () => {
      trayCollapsed = !trayCollapsed;
      paintChrome();
    });
    root.querySelector("#edit-toggle")?.addEventListener("click", () => {
      playClick(host.progress.muted);
      clearPreview();
      edit = !edit;
      lastMove = null;
      trayCollapsed = false;
      selected = null;
      focus = null;
      filter = host.progress.shop.owned.length ? "owned" : "all";
      root.querySelector(".shop-room")!.scrollTop = 0;
      diorama.setEditMode(edit);
      if (selected) diorama.select(selected);
      else diorama.select(null);
      paintChrome();
    });
    root.querySelector("#upgrade-notice")?.addEventListener("click", () => {
      root.querySelector<HTMLButtonElement>("#edit-toggle")?.click();
      browse("all");
    });
    root.querySelector("#play-tea")?.addEventListener("click", () => isSecondEdition ? host.playNext() : host.goLevels());
    root.querySelector("#bakery")?.addEventListener("click", () => {
      if (!isBakeryOpen(host.progress)) return;
      playClick(host.progress.muted);
      bakeryNote = true;
      paintChrome();
    });
    root.querySelector("#upgrade-rail")?.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-upgrade]");
      if (!button) return;
      playClick(host.progress.muted);
      clearPreview();
      if (isSecondEdition) browseScroll[filter] = root.querySelector(".editor-content")!.scrollTop;
      focus = button.dataset.upgrade as UpgradeId;
      selected = isOwned(host.progress.shop, focus) ? focus : null;
      diorama.select(selected);
      if (!selected) preview(focus, 0);
      diorama.setEditMode(edit);
      root.querySelector(".editor-content")!.scrollTop = 0;
      paintChrome();
    });
    root.querySelectorAll("[data-filter]").forEach(button => button.addEventListener("click", () => {
      browse((button as HTMLElement).dataset.filter as "all" | "owned");
    }));
    root.querySelector("#upgrade-detail")?.addEventListener("click", (event) => {
      const target = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-act]");
      if (!target) return;
      const act = target.dataset.act;
      if (act === "browse") {
        browse(filter);
      } else if (act === "preview") {
        preview(target.dataset.id as UpgradeId, Number(target.dataset.style));
      } else if (act === "cancel-preview") {
        browse(filter);
      } else if (act === "buy") {
        const id = target.dataset.id as UpgradeId;
        const variant = Number(target.dataset.style ?? "0");
        buy(id, variant);
      } else if (act === "style") {
        const id = target.dataset.id as UpgradeId;
        const variant = Number(target.dataset.style ?? "0");
        restyle(id, variant);
      } else if (act === "pin-goal" && focus) {
        const goal=readGoal(host.progress);
        saveGoal(goal?.id===focus && goal.style===(draft?.style??0) ? null : {id:focus,style:draft?.style??0});
        paintChrome();
      } else if (act === "return" && selected) {
        confirmReturn(selected);
      } else if (act === "rotate") {
        rotateSelected();
      } else if ((act === "store" || act === "place") && selected) {
        clearPreview();
        const next = act === "store" ? storeItem(host.progress.shop, selected) : placeItem(host.progress.shop, selected);
        if (next) {
          lastMove=null;
          commit(next);
          diorama.select(selected);
          playClick(host.progress.muted);
        }
      }
    });
    root.querySelector("#shop-modal")?.addEventListener("click", (event) => {
      if((event.target as HTMLElement).closest('[data-finale-showcase]')) {
        finaleOpen=false;edit=false;showcasing=true;clearPreview();diorama.setEditMode(false);paintChrome();
        root.querySelector<HTMLButtonElement>('#showcase-back')?.focus();return;
      }
      const button = (event.target as HTMLElement).closest("[data-dismiss]");
      if (!button) return;
      playClick(host.progress.muted);
      finaleOpen = false;
      bakeryNote = false;
      paintChrome();
    });
  };

  const clearPreview = () => {
    if (draft) {
      draft = null;
      diorama.sync(host.progress.shop);
    }
    // Previewing must never turn off the active editing session.
    diorama.setEditMode(edit);
  };

  const browse = (tab: "all" | "owned") => {
    trayCollapsed = false;
    clearPreview();
    filter = tab;
    focus = null;
    selected = null;
    diorama.select(null);
    root.querySelector(".editor-content")!.scrollTop = 0;
    paintChrome();
    if(isSecondEdition) root.querySelector(".editor-content")!.scrollTop=browseScroll[tab];
  };

  const previewShop = (): ShopState => {
    const shop = clone(host.progress.shop);
    if (draft?.place) {
      shop.owned.push(draft.id);
      shop.style[draft.id] = draft.style;
      shop.place[draft.id] = draft.place;
    }
    return shop;
  };

  const preview = (id: UpgradeId, variant: number) => {
    if (isOwned(host.progress.shop, id)) return;
    const place = draft?.id === id ? draft.place : findOpenPlacement(id, host.progress.shop);
    draft = {id, style: variant, place};
    diorama.setEditMode(edit);
    diorama.sync(previewShop());
    if (place) diorama.select(id);
    paintChrome();
  };

  const commit = (shop: ShopState, opts: { animate?: UpgradeId } = {}) => {
    host.save(saveShop(host.progress, shop));
    diorama.sync(host.progress.shop, opts);
    paintChrome();
  };

  const buy = (id: UpgradeId, variant: number) => {
    const progress = host.progress;
    const def = UPGRADE_BY_ID[id];
    if (!collectionUnlocked(id,progress.bestStars) || isOwned(progress.shop, id) || !canPurchaseCopy(progress.shop, id) || spendableStars(progress) < def.cost) return;
    const shop = clone(progress.shop);
    const place = draft?.id === id ? draft.place : findOpenPlacement(id, shop);
    if (!place || !canPlace(id, place, shop)) return;
    clearPreview();
    lastMove=null;
    if (readGoal(progress)?.id===id) saveGoal(null);
    shop.owned.push(id);
    shop.style[id] = variant;
    shop.place[id] = place;
    selected = id;
    focus = id;
    filter = "owned";
    const finished = shopComplete(shop) && !shop.finaleSeen;
    if (finished) shop.finaleSeen = true;
    commit(shop, { animate: id });
    diorama.select(id);
    if (finished) {
      finaleOpen = true;
      diorama.playFinale();
      playFinale(progress.muted);
      paintChrome();
    }
  };

  const restyle = (id: UpgradeId, variant: number) => {
    if (!isOwned(host.progress.shop, id)) return;
    playClick(host.progress.muted);
    const shop = clone(host.progress.shop);
    shop.style[id] = variant;
    commit(shop);
  };

  const rotateSelected = () => {
    const id = selected;
    if (!id || isStored(host.progress.shop, id)) return;
    const next = nextRotation(id, draft?.id === id ? previewShop() : host.progress.shop);
    if (!next) return;
    if (draft?.id === id) {
      draft.place = next;
      diorama.sync(previewShop());
      paintChrome();
      return;
    }
    playClick(host.progress.muted);
    const shop = clone(host.progress.shop);
    if (isSecondEdition) lastMove={id,place:{...(shop.place[id]??UPGRADE_BY_ID[id].defaultPlace)}};
    shop.place[id] = next;
    commit(shop);
  };

  root.querySelector('#shop-guide')!.addEventListener('click', event => {
    const target = event.target as Element;
    if (target.closest('[data-guide-skip], [data-guide-done]')) { setGuide('done'); paintChrome(); }
    if (target.closest('[data-guide-play]')) { if(isSecondEdition)host.playNext();else host.goLevels(); }
    if (target.closest('[data-guide-edit]')) root.querySelector<HTMLButtonElement>('#edit-toggle')?.click();
  });
  bind();
  diorama.setEditMode(edit);
  paintChrome();
  if (initialReward && UPGRADE_BY_ID[initialReward]) openDecoration(initialReward);

  return {
    ready: () => diorama.ready(),
    refresh: () => paintChrome(),
    dispose: () => { returnDialog?.remove(); returnDialog = null; diorama.dispose(); setBrowserNight(false); },
  };
}

function label(id: UpgradeId): string {
  const name = UPGRADE_BY_ID[id].moveName;
  return name[0].toUpperCase() + name.slice(1) + (kindOf(id) !== id ? " · 2" : "");
}

function taskDetail(progress: Progress, focus: UpgradeId | null, draft: DecorationDraft | null): string {
  const id = focus ?? "counter";
  const def = UPGRADE_BY_ID[id];
  if (isOwned(progress.shop, id)) return editDetail(progress.shop, id);
  const chosen = draft?.id === id ? draft.style : null;
  const unlocked = collectionUnlocked(id,progress.bestStars);
  const affordable = spendableStars(progress) >= def.cost;
  const fits = draft?.id === id && draft.place !== null;
  return `<div class="detail-copy"><strong>${label(id)}</strong>
    <p class="detail-note">${chosen === null ? "Choose a style to preview in your shop." : def.variants[chosen].blurb}</p></div>
    ${isSecondEdition ? `<button class="goal-pin" type="button" data-act="pin-goal">${readGoal(progress)?.id===id && readGoal(progress)?.style===(chosen??0) ? "Your goal ✓ · Clear" : "Make this my goal"}</button>` : ""}
    <div class="style-row">${def.variants.map((variant, index) => `<button class="style-chip ${chosen === index ? "active" : ""}" aria-pressed="${chosen === index}" data-act="preview" data-id="${id}" data-style="${index}" type="button">${styleThumbnail(id, index)}<span>${variant.name}</span></button>`).join("")}</div>
    ${draft?.place && def.movable ? `<button class="style-chip rotate-action" data-act="rotate" type="button">${def.surface === "wall" ? "Other wall" : "Rotate"}</button>` : ""}
    ${chosen === null ? "" : `<p class="detail-note" role="status">${!unlocked ? `Complete ${def.unlockAfter} puzzles to unlock · Preview is free` : !fits ? "Make room by moving your decorations first." : !affordable ? `${def.cost - spendableStars(progress)} more stars needed · Preview is free` : "Styles included · Free to change"}</p><div class="purchase-row"><button class="buy-decoration" data-act="buy" data-id="${id}" data-style="${chosen}" type="button" ${!unlocked || !affordable || !fits ? "disabled" : ""}> ${!unlocked ? `Unlock at ${def.unlockAfter} puzzles` : !fits ? "Make room to buy" : !affordable ? `Need ${def.cost - spendableStars(progress)} more stars` : "Buy"} · ${def.cost} ✦</button></div>`}`;

}

function editDetail(shop: ShopState, selected: UpgradeId | null): string {
  if (!selected) {
    return `<div class="detail-copy"><strong>Move things around</strong><p class="detail-note">Tap a movable piece in the room. The wall colour stays put.</p></div>`;
  }
  const def = UPGRADE_BY_ID[selected];
  const current = styleOf(shop, selected);
  const styles = def.variants
    .map(
      (variant, index) =>
        `<button class="style-chip ${current === index ? "active" : ""}" data-act="style" data-id="${selected}" data-style="${index}" aria-pressed="${current === index}" type="button">${styleThumbnail(selected, index)}<span>${variant.name}</span></button>`,
    )
    .join("");
  const stored = isStored(shop, selected);
  const canRestore = stored && Boolean(placeItem(shop, selected));
  const rotate = def.movable && !stored
    ? `<button class="style-chip rotate-action" data-act="rotate" type="button">${def.surface === "wall" ? "Other wall" : "Rotate"}</button>`
    : "";
  return `
    <div class="detail-copy">
      <strong>${label(selected)}</strong>
      <p class="detail-note">${def.variants[current]?.blurb ?? def.blurb}</p>
    </div>

    <div class="style-row">${styles}</div>
    <div class="inventory-actions">${rotate}${def.movable ? `<button class="style-chip" data-act="${stored ? "place" : "store"}" type="button" ${stored && !canRestore ? "disabled" : ""}>${stored ? "Place" : "Store"}</button>` : ""}</div>
    ${stored && !canRestore ? '<p class="editor-saved" role="status">Make room to place this item.</p>' : ''}
    ${returnValue(shop, selected) ? `<button class="return-item" data-act="return" type="button">Return for ${returnValue(shop, selected)} ✦</button>` : ''}`;
}

function finaleModal(): string {
  return `
    <div class="modal">
      <p class="kicker">All tidy</p>
      <h3>Your tea shop is open</h3>
      <p class="lede tight">The lamps warm up, the shopkeeper is ready to serve, and this little corner is yours. Keep collecting, try a new arrangement, or share your finished shop.</p>
      <div class="modal-actions">
        <button data-finale-showcase type="button">Show my shop</button><button data-dismiss type="button">Keep decorating</button>
      </div>
    </div>`;
}

function bakeryModal(): string {
  return `
    <div class="modal">
      <p class="kicker">Coming next</p>
      <h3>The bakery is airing out</h3>
      <p class="lede tight">The ovens are warm, but the cakes are still a later visit. Thank you for finishing the tea shop.</p>
      <div class="modal-actions">
        <button data-dismiss type="button">Back to the tea shop</button>
      </div>
    </div>`;
}
