import { mountApp } from "./ui/app";
import "./style.css";
import * as offline from "./game/offline";

const root = document.querySelector<HTMLDivElement>("#app");
if (!root) {
  throw new Error("Missing #app");
}

mountApp(root);

offline.setupOfflinePreview();

if ("serviceWorker" in navigator) {
  offline.setupOffline();
}
