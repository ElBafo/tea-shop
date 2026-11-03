// Existing gameplay suites exercise returning players; splash/onboarding has its
// own real-touch suite. Automatically enter the app after each fixture reload.
export async function installReturningPlayerStart(send) {
  const {identifier} = await send('Page.addScriptToEvaluateOnNewDocument',{source:`
    (() => {
      const enter = () => {
        const start = document.querySelector('#launch-start');
        if (start && !start.disabled) {
          start.click();
          document.querySelector('[data-welcome-skip]')?.click();
          document.querySelector('[data-guide-skip]')?.click();
        }
      };
      new MutationObserver(enter).observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled']});
    })();`});
  return () => send('Page.removeScriptToEvaluateOnNewDocument', {identifier});
}
