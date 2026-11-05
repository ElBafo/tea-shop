// The released second edition starts its own journey. Original and preview
// progress stay in their existing namespaces; no score or furniture conversion.
const base = import.meta.env?.BASE_URL;
const path = typeof location === 'undefined' ? '' : location.pathname;
const edition = typeof location === 'undefined' ? null : new URLSearchParams(location.search).get('edition');
export const isProduction = base === '/tea-shop/' && path.startsWith('/tea-shop/')
  && !path.startsWith('/tea-shop/preview/');
const previewBuild = base === '/tea-shop/preview/';
const preview = previewBuild && path.startsWith('/tea-shop/preview/');
export const isSecondEdition = isProduction ? edition !== '1' : preview && edition === '2';
export const APPEARANCE_KEY = isSecondEdition
  ? `tea-shop-${isProduction ? '' : 'preview-'}edition2-appearance-v1`
  : `tea-shop-${previewBuild ? 'preview-' : ''}appearance-v1`;
