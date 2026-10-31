import { mountApp } from "./ui/app";
import "./style.css";

const root = document.querySelector<HTMLDivElement>("#app");
if (!root) {
  throw new Error("Missing #app");
}

mountApp(root);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    if (import.meta.env.DEV || import.meta.env.BASE_URL === "/tea-shop/preview/") return;
    void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
  });
}
