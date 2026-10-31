import { loadNight, saveNight } from "../game/appearance";
import { isPreview, isShowroom } from "../game/preview";
import { playChime, playClick, playFinale } from "../game/audio";
import { isBakeryOpen, saveShop, spendableStars } from "../game/storage";
import type { Progress, ShopState, UpgradeId } from "../game/types";
import { Diorama } from "./diorama";
import { findOpenPlacement, nextRotation } from "./grid";
import {
  UPGRADE_BY_ID,
  UPGRADES,
  isOwned,
  shopComplete,
  styleOf,
} from "./upgrades";

const STAR = "✦";

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
      <header class="topbar">
        <button id="theme-toggle" class="icon-btn" type="button" aria-pressed="false">Day</button>
        <h2>Tea Shop</h2>
        <button id="mute" class="icon-btn" type="button">Sound</button>
      </header>
      ${isPreview ? `<aside class="preview-bar"><span>${isShowroom ? "Showroom · changes are temporary" : "Work in progress"}</span><a href="${import.meta.env.BASE_URL}${isShowroom ? "" : "?showroom=1"}">${isShowroom ? "Back to my shop" : "See finished shop"}</a></aside>` : ""}
      <div class="shop-stage">
        <canvas id="shop-canvas" aria-label="The tea shop room"></canvas>
        <div class="shop-overlay">
          <p class="shop-stars" id="shop-stars"></p>
          <button id="edit-toggle" class="icon-btn" type="button">Edit</button>
        </div>
        <p class="shop-hint" id="shop-hint"></p>
      </div>
      <button id="upgrade-notice" class="upgrade-notice hidden" type="button"></button>
      <div class="shop-dock">
        <section id="decorate-panel" class="hidden" aria-label="Decorations">
        <div class="upgrade-rail" id="upgrade-rail"></div>
        <div class="upgrade-detail" id="upgrade-detail"></div>
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
  let focus: UpgradeId | null = "counter";
  let selected: UpgradeId | null = null;
  let finaleOpen = false;
  let bakeryNote = false;

  const diorama = new Diorama(canvas, host.progress.shop, {
    onSelect: (id) => {
      selected = id;
      if (id) focus = id;
      paintChrome();
    },
    onMove: (id, place) => {
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

    const hint = root.querySelector("#shop-hint");
    if (hint) hint.textContent = hintText(edit, selected);

    const rail = root.querySelector("#upgrade-rail");
    if (rail) rail.innerHTML = UPGRADES.map((upgrade) => {
      const owned = isOwned(progress.shop, upgrade.id);
      const active = focus === upgrade.id;
      return `
        <button class="upgrade-chip ${owned ? "owned" : ""} ${active ? "active" : ""}" data-upgrade="${upgrade.id}" type="button">
          <strong>${upgrade.title}</strong>
          <span>${owned ? "Owned" : `${upgrade.cost} ${STAR}`}</span>
        </button>`;
    }).join("");

    const detail = root.querySelector("#upgrade-detail");
    if (detail) detail.innerHTML = selected ? editDetail(progress.shop, selected) : taskDetail(progress, focus);

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

  const bind = () => {
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
      edit = !edit;
      selected = null;
      focus = UPGRADES.find((item) => !isOwned(host.progress.shop, item.id) && item.cost <= spendableStars(host.progress))?.id ?? "counter";
      diorama.setEditMode(edit);
      if (selected) diorama.select(selected);
      else diorama.select(null);
      paintChrome();
    });
    root.querySelector("#upgrade-notice")?.addEventListener("click", () => {
      root.querySelector<HTMLButtonElement>("#edit-toggle")?.click();
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
      focus = button.dataset.upgrade as UpgradeId;
      selected = isOwned(host.progress.shop, focus) ? focus : null;
      diorama.select(selected);
      paintChrome();
    });
    root.querySelector("#upgrade-detail")?.addEventListener("click", (event) => {
      const target = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-act]");
      if (!target) return;
      const act = target.dataset.act;
      if (act === "buy") {
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
    shop.owned.push(id);
    shop.style[id] = variant;
    const place = findOpenPlacement(id, shop);
    if (place) shop.place[id] = place;
    const finished = shopComplete(shop) && !shop.finaleSeen;
    if (finished) shop.finaleSeen = true;
    commit(shop, { animate: id });
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
    const next = nextRotation(id, host.progress.shop);
    if (!next) return;
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

function hintText(edit: boolean, selected: UpgradeId | null): string {
  if (!edit) return "Drag to look around";
  if (selected && UPGRADE_BY_ID[selected].movable) return "Drag to move · Rotate or restyle below";
  return "Choose a decoration or tap a piece in the room";
}

function taskDetail(progress: Progress, focus: UpgradeId | null): string {
  const id = focus ?? "counter";
  const def = UPGRADE_BY_ID[id];
  const owned = isOwned(progress.shop, id);
  const current = styleOf(progress.shop, id);
  const canBuy = !owned && spendableStars(progress) >= def.cost;
  const styles = def.variants
    .map((variant, index) => {
      const active = owned && current === index;
      const act = owned ? "style" : "buy";
      const disabled = !owned && !canBuy ? "disabled" : "";
      return `<button class="style-chip ${active ? "active" : ""}" data-act="${act}" data-id="${id}" data-style="${index}" type="button" ${disabled}>${variant.name}</button>`;
    })
    .join("");
  const action = owned
    ? `<p class="detail-note">${def.variants[current]?.blurb ?? def.blurb} You can change the style whenever you like, for free.</p>`
    : `<p class="detail-note">${def.blurb} ${canBuy ? `Spend ${def.cost} ${def.cost === 1 ? "star" : "stars"} and pick a style.` : `This needs ${def.cost} stars.`}</p>`;
  return `
    <div class="detail-copy">
      <strong>${def.title}</strong>
      ${action}
    </div>
    <div class="style-row">${styles}</div>`;
}

function editDetail(shop: ShopState, selected: UpgradeId | null): string {
  if (!selected) {
    return `<div class="detail-copy"><strong>Move things around</strong><p class="detail-note">Tap a movable piece in the room. Fixed walls and the counter stay put.</p></div>`;
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
    ? `<button class="style-chip" data-act="rotate" type="button">Rotate</button>`
    : "";
  return `
    <div class="detail-copy">
      <strong>${def.title}</strong>
      <p class="detail-note">${def.variants[current]?.blurb ?? def.blurb}</p>
    </div>
    <div class="style-row">${rotate}${styles}</div>`;
}

function finaleModal(): string {
  return `
    <div class="modal">
      <p class="kicker">All tidy</p>
      <h3>The tea shop is open</h3>
      <p class="lede tight">The lamps warm up, a guest finds the counter, and the bakery door is unlocked.</p>
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
