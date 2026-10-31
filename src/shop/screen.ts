import { playChime, playClick, playFinale } from "../game/audio";
import { isBakeryOpen, saveShop, spendableStars, totalStars } from "../game/storage";
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
        <span class="icon-btn ghost" aria-hidden="true"></span>
        <h2>Tea Shop</h2>
        <button id="mute" class="icon-btn" type="button">Sound</button>
      </header>
      <div class="shop-stage">
        <canvas id="shop-canvas" aria-label="The tea shop room"></canvas>
        <div class="shop-overlay">
          <p class="shop-stars" id="shop-stars"></p>
          <button id="edit-toggle" class="icon-btn" type="button">Edit</button>
        </div>
        <p class="shop-hint" id="shop-hint"></p>
      </div>
      <div class="shop-dock">
        <div class="upgrade-rail" id="upgrade-rail"></div>
        <div class="upgrade-detail" id="upgrade-detail"></div>
        <div class="shop-actions">
          <button class="shop-card open" id="play-tea" type="button">
            <span class="card-art tea-art" aria-hidden="true"></span>
            <span class="card-copy">
              <strong>Tea Shop</strong>
              <em>Open the jars and play</em>
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

  const paintChrome = () => {
    const progress = host.progress;
    const spendable = spendableStars(progress);
    const stars = totalStars(progress);
    const mute = root.querySelector("#mute");
    if (mute) mute.textContent = progress.muted ? "Quiet" : "Sound";

    const starLine = root.querySelector("#shop-stars");
    if (starLine) {
      const noun = spendable === 1 ? "star" : "stars";
      starLine.innerHTML = `<span class="star-glyph">${STAR}</span> ${spendable} ${noun} to spend<br><span class="star-sub">${stars} collected</span>`;
    }

    const toggle = root.querySelector("#edit-toggle");
    if (toggle) toggle.textContent = edit ? "Done" : "Edit";

    const hint = root.querySelector("#shop-hint");
    if (hint) hint.textContent = hintText(progress.shop, edit, selected, spendable);

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
    if (detail) detail.innerHTML = edit ? editDetail(progress.shop, selected) : taskDetail(progress, focus);

    const bakery = root.querySelector<HTMLButtonElement>("#bakery");
    const bakeryCopy = root.querySelector("#bakery-copy");
    const bakeryLock = root.querySelector("#bakery-lock");
    const open = isBakeryOpen(progress);
    if (bakery) bakery.disabled = !open;
    bakery?.classList.toggle("locked", !open);
    bakery?.classList.toggle("open", open);
    if (bakeryCopy) {
      bakeryCopy.textContent = open
        ? "A second shop to dress up"
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
    root.querySelector("#mute")?.addEventListener("click", () => {
      host.toggleMute();
      paintChrome();
    });
    root.querySelector("#edit-toggle")?.addEventListener("click", () => {
      playClick(host.progress.muted);
      edit = !edit;
      selected = edit ? movablePick(host.progress.shop, selected ?? focus) : null;
      diorama.setEditMode(edit);
      if (selected) diorama.select(selected);
      else diorama.select(null);
      paintChrome();
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

function movablePick(shop: ShopState, preferred: UpgradeId | null): UpgradeId | null {
  if (preferred && isOwned(shop, preferred) && UPGRADE_BY_ID[preferred].movable) return preferred;
  return shop.owned.find((id) => UPGRADE_BY_ID[id].movable) ?? null;
}

function hintText(shop: ShopState, edit: boolean, selected: UpgradeId | null, spendable: number): string {
  if (edit && selected) {
    return `Drag the ${UPGRADE_BY_ID[selected].moveName} with one finger. It snaps so pieces do not overlap.`;
  }
  if (edit) {
    return "Tap a plant, rug, lamp, table, or sign, then drag it. Use Done when you are finished.";
  }
  if (shopComplete(shop)) {
    return "The tea shop is finished. Drag the room with one finger to look around, or tap Edit to rearrange.";
  }
  if (spendable === 0 && shop.owned.length === 0) {
    return "Spend stars from the shelves to fix up this little room.";
  }
  if (spendable === 0) {
    return "Earn more stars on the shelves, then come back to decorate.";
  }
  return "Choose a task below, pick a style, and spend stars to make the room nicer.";
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
