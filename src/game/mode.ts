// The second edition is an isolated development prototype, never the released game.
export const isSecondEdition = import.meta.env?.BASE_URL === '/tea-shop/preview/'
  && typeof location !== 'undefined'
  && location.pathname.startsWith('/tea-shop/preview/')
  && new URLSearchParams(location.search).get('edition') === '2';
