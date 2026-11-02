import { mountApp } from "./ui/app";
import "./style.css";
import { setupOffline, setupOfflinePreview } from "./game/offline";

const root = document.querySelector<HTMLDivElement>("#app");
if (!root) {
  throw new Error("Missing #app");
}

mountApp(root);

setupOfflinePreview();

if ("serviceWorker" in navigator) {
  setupOffline();
}
