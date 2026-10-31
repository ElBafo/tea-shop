import { decorationIcon } from "./icons";
import { imageFile, saveImage } from "./share";
import { loadNight, saveNight } from "../game/appearance";
import { isPreview, isShowroom } from "../game/preview";
import { playChime, playClick, playFinale } from "../game/audio";
import { isBakeryOpen, saveShop, spendableStars } from "../game/storage";
import type { Placement, Progress, ShopState, UpgradeId } from "../game/types";
import { Diorama } from "./diorama";
import { canPlace, findOpenPlacement, nextRotation } from "./grid";
import {
  UPGRADE_BY_ID,
  UPGRADES,
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
  toggleMute(): void;
}

export interface ShopScreen {
  refresh(): void;
  dispose(): void;
}

export function mountShop(root: HTMLElement, host: ShopHost): ShopScreen {
  root.innerHTML = `
    <div class="frame shop-room">
      <header class="topbar shop-overlay shop-toolbar">
        <h2 class="visually-hidden">Tea Shop</h2>
        <p class="shop-stars" id="shop-stars"></p>
        <button id="theme-toggle" class="icon-btn" type="button" aria-pressed="false">Day</button>
        <button id="mute" class="icon-btn" type="button">Sound</button>
        <div class="room-actions">
          <button id="showcase-toggle" class="icon-btn" type="button">Showcase</button>
          <button id="edit-toggle" class="icon-btn" type="button">Edit</button>
        </div>
      </header>
      ${isPreview ? `<aside class="preview-bar"><span>${isShowroom ? "Showroom · temporary" : "Preview"}</span><a href="${import.meta.env.BASE_URL}${isShowroom ? "" : "?showroom=1"}">${isShowroom ? "Back to my shop" : "See finished shop"}</a></aside>` : ""}
      <div class="shop-stage">
        <canvas id="shop-canvas" aria-label="The tea shop room"></canvas>
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
        <div class="catalog-tabs" role="group" aria-label="Decoration collection">
          <button data-filter="all" type="button">Decorations</button>
          <button data-filter="owned" type="button">My decorations</button>
        </div>
        <div class="editor-content">
          <div class="upgrade-detail hidden" id="upgrade-detail"></div>
          <div class="upgrade-rail" id="upgrade-rail"></div>
        </div>
        </section>
        <div class="shop-actions">
          <button class="shop-card open" id="play-tea" type="button">
            <span class="card-art tea-art" aria-hidden="true"></span>
            <span class="card-copy">
              <strong>Play puzzles</strong>
              <em>Earn stars for your shop</em>
            </span>
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

  const appearanceKey = `tea-shop-${isPreview ? "preview-" : ""}appearance-v1`;
  let night = loadNight(appearanceKey);
  let edit = false;
  let showcasing = false;
  let sharing = false;
  let focus: UpgradeId | null = null;
  let selected: UpgradeId | null = null;
  let finaleOpen = false;
  let bakeryNote = false;
  let filter: "all" | "owned" = "all";
  let draft: DecorationDraft | null = null;

  const diorama = new Diorama(canvas, host.progress.shop, {
    onSelect: (id) => {
      selected = id;
      if (id) {
        if (draft?.id !== id) clearPreview();
        focus = id;
        filter = isOwned(host.progress.shop, id) ? "owned" : "all";
      }
      paintChrome();
    },
    onMove: (id, place) => {
      if (draft?.id === id) {
        draft.place = place;
        diorama.sync(previewShop());
        paintChrome();
        return;
      }
      const shop = clone(host.progress.shop);
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
    root.querySelector(".shop-room")?.classList.toggle("is-night", night);
    const themeToggle = root.querySelector("#theme-toggle");
    if (themeToggle) {
      themeToggle.textContent = night ? "Night" : "Day";
      themeToggle.setAttribute("aria-pressed", String(night));
      themeToggle.setAttribute("aria-label", `Switch to ${night ? "day" : "night"}`);
    }
    root.querySelector(".shop-room")?.classList.toggle("showcasing", showcasing);
    root.querySelector(".showcase-tools")?.classList.toggle("hidden", !showcasing);
    root.querySelector("#share-status")?.classList.toggle("hidden", !showcasing);
    root.querySelector("#showcase-toggle")?.classList.toggle("hidden", edit);
    const progress = host.progress;
    const spendable = spendableStars(progress);
    const available = UPGRADES.filter((item) => !isOwned(progress.shop, item.id) && item.cost <= spendable).length;
    const mute = root.querySelector("#mute");
    if (mute) mute.textContent = progress.muted ? "Sound off" : "Sound on";

    const starLine = root.querySelector("#shop-stars");
    if (starLine) {
      starLine.innerHTML = `<span class="star-glyph" aria-hidden="true">${STAR}</span> ${spendable}`;
      starLine.setAttribute("aria-label", `${spendable} stars available`);
    }

    const toggle = root.querySelector("#edit-toggle");
    if (toggle) toggle.textContent = edit ? "Done" : "Edit";
    root.querySelector("h2")!.textContent = edit ? "Decorate" : "Tea Shop";
    root.querySelector("#decorate-panel")?.classList.toggle("hidden", !edit);
    root.querySelector(".shop-actions")?.classList.toggle("hidden", edit);
    const notice = root.querySelector("#upgrade-notice");
    notice?.classList.toggle("hidden", edit || available === 0);
    if (notice) notice.textContent = `${available} ${available === 1 ? "upgrade" : "upgrades"} ready · Decorate`;
    root.querySelector(".shop-room")?.classList.toggle("decorating", edit);

    const rail = root.querySelector("#upgrade-rail");
    root.querySelectorAll<HTMLButtonElement>("[data-filter]").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
    });
    const collection = UPGRADES.filter(item => isOwned(progress.shop, item.id) === (filter === "owned"));
    if (rail) rail.innerHTML = collection.map((upgrade) => {
      const owned = isOwned(progress.shop, upgrade.id);
      const active = focus === upgrade.id;
      return `
        <button aria-pressed="${active}" class="upgrade-chip ${owned ? "owned" : ""} ${active ? "active" : ""}" data-upgrade="${upgrade.id}" type="button">
          <span class="deco-icon" aria-hidden="true">${decorationIcon(upgrade.id)}</span><strong>${label(upgrade.id)}</strong>
          <span>${owned ? UPGRADE_BY_ID[upgrade.id].variants[styleOf(progress.shop, upgrade.id)].name : `${upgrade.cost} ${STAR}`}</span>
        </button>`;
    }).join("");

    rail?.classList.toggle("hidden", Boolean(focus));
    if (rail && !collection.length) rail.innerHTML = `<p class="editor-empty">${filter === "owned" ? "Your collection starts here. Explore Decorations to try something for your shop." : "You have every decoration in this collection. Arrange them in My decorations."}</p>`;
    const detail = root.querySelector("#upgrade-detail");
    detail?.classList.toggle("hidden", !focus);
    if (detail) detail.innerHTML = focus ? `<button class="collection-back" data-act="browse" type="button">← ${filter === "owned" ? "My decorations" : "Decorations"}</button>${draft ? taskDetail(progress, focus, draft) : isOwned(progress.shop, focus) ? editDetail(progress.shop, focus) : taskDetail(progress, focus, null)}` : "";

    if (detail && focus) {
      const purchase = detail.querySelector(".purchase-row");
      const scroll = document.createElement("div");
      scroll.className = "detail-scroll";
      for (const child of Array.from(detail.childNodes)) {
        if (child !== purchase) scroll.append(child);
      }
      detail.prepend(scroll);
    }

    const bakery = root.querySelector<HTMLButtonElement>("#bakery");
    const bakeryCopy = root.querySelector("#bakery-copy");
    const bakeryLock = root.querySelector("#bakery-lock");
    const open = isBakeryOpen(progress);
    if (bakery) bakery.disabled = !open;
    bakery?.classList.toggle("locked", !open);
    bakery?.classList.toggle("open", open);
    if (bakeryCopy) {
      bakeryCopy.textContent = open
        ? "Coming soon"
        : "Finish the tea shop to unlock";
    }
    if (bakeryLock) bakeryLock.classList.toggle("hidden", open);

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
        await navigator.share({ files: [file], title: "My Tea Shop" });
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

  const bind = () => {
    root.querySelector("#showcase-toggle")?.addEventListener("click", () => {
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
      if (!isShowroom) saveNight(appearanceKey, night);
      diorama.setNight(night);
      playClick(host.progress.muted);
      paintChrome();
    });
    root.querySelector("#mute")?.addEventListener("click", () => {
      host.toggleMute();
      paintChrome();
    });
    root.querySelector("#edit-toggle")?.addEventListener("click", () => {
      playClick(host.progress.muted);
      clearPreview();
      edit = !edit;
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
    root.querySelector("#play-tea")?.addEventListener("click", () => host.goLevels());
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
      } else if (act === "rotate") {
        rotateSelected();
      }
    });
    root.querySelector("#shop-modal")?.addEventListener("click", (event) => {
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
    clearPreview();
    filter = tab;
    focus = null;
    selected = null;
    diorama.select(null);
    root.querySelector(".editor-content")!.scrollTop = 0;
    paintChrome();
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
    if (isOwned(progress.shop, id) || spendableStars(progress) < def.cost) return;
    const shop = clone(progress.shop);
    const place = draft?.id === id ? draft.place : findOpenPlacement(id, shop);
    if (!place || !canPlace(id, place, shop)) return;
    clearPreview();
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
    if (!id) return;
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
    shop.place[id] = next;
    commit(shop);
  };

  bind();
  paintChrome();

  return {
    refresh: () => paintChrome(),
    dispose: () => diorama.dispose(),
  };
}

function clone(shop: ShopState): ShopState {
  return {
    owned: shop.owned.slice(),
    style: { ...shop.style },
    place: Object.fromEntries(
      Object.entries(shop.place).map(([id, place]) => [id, { ...place }]),
    ) as ShopState["place"],
    finaleSeen: shop.finaleSeen,
  };
}

function label(id: UpgradeId): string {
  const name = UPGRADE_BY_ID[id].moveName;
  return name[0].toUpperCase() + name.slice(1);
}

function taskDetail(progress: Progress, focus: UpgradeId | null, draft: DecorationDraft | null): string {
  const id = focus ?? "counter";
  const def = UPGRADE_BY_ID[id];
  if (isOwned(progress.shop, id)) return editDetail(progress.shop, id);
  const chosen = draft?.id === id ? draft.style : null;
  const affordable = spendableStars(progress) >= def.cost;
  const fits = draft?.id === id && draft.place !== null;
  return `<div class="detail-copy"><strong>${label(id)}</strong>
    <p class="detail-note">${chosen === null ? "Choose a style to preview in your shop." : def.variants[chosen].blurb}</p></div>
    <div class="style-row">${def.variants.map((variant, index) => `<button class="style-chip ${chosen === index ? "active" : ""}" aria-pressed="${chosen === index}" data-act="preview" data-id="${id}" data-style="${index}" type="button">${variant.name}</button>`).join("")}</div>
    ${draft?.place && def.movable ? `<button class="style-chip rotate-action" data-act="rotate" type="button">${def.surface === "wall" ? "Other wall" : "Rotate"}</button>` : ""}
    ${chosen === null ? "" : `<p class="detail-note" role="status">${!fits ? "Make room by moving your decorations first." : !affordable ? `${def.cost - spendableStars(progress)} more stars needed · Preview is free` : "Not purchased · Styles included"}</p><div class="purchase-row"><button class="buy-decoration" data-act="buy" data-id="${id}" data-style="${chosen}" type="button" ${!affordable || !fits ? "disabled" : ""}>Buy ${def.variants[chosen].name} · ${def.cost} ✦</button><button class="style-chip" data-act="cancel-preview" type="button">Cancel</button></div>`}`;

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
        `<button class="style-chip ${current === index ? "active" : ""}" data-act="style" data-id="${selected}" data-style="${index}" type="button">${variant.name}</button>`,
    )
    .join("");
  const rotate = def.movable
    ? `<button class="style-chip rotate-action" data-act="rotate" type="button">${def.surface === "wall" ? "Other wall" : "Rotate"}</button>`
    : "";
  return `
    <div class="detail-copy">
      <strong>${label(selected)}</strong>
      <p class="detail-note">${def.variants[current]?.blurb ?? def.blurb}</p>
    </div>
    <p class="section-label">Style · Free to change</p>
    <div class="style-row">${styles}</div>
    ${rotate}
    <p class="editor-saved" role="status">Changes saved automatically</p>`;
}

function finaleModal(): string {
  return `
    <div class="modal">
      <p class="kicker">All tidy</p>
      <h3>The tea shop is open</h3>
      <p class="lede tight">The lamps warm up, the shopkeeper is ready to serve, and the bakery door is unlocked.</p>
      <div class="modal-actions">
        <button data-dismiss type="button">Lovely</button>
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
