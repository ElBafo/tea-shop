# Tea Shop

A cozy little sort puzzle. Line up the tea tins, cups, and treats — there is no clock and no fail state.

**Play it here:** [https://elbafo.github.io/tea-shop/](https://elbafo.github.io/tea-shop/)

Made for a quiet moment on a phone. Add it to your Home Screen from Safari if you like.

## How to play

Tap a jar to lift the matching treats on top. Tap another jar to set them down. A drop only works on an empty jar, or on the same kind, and only when there is room.

A shelf is finished when every jar holds one kind, or is empty. Undo as much as you like. Restart whenever you want.

From level 6, some jars wear a little lid. You can see the top treat, but not what waits underneath until you lift it.

## Stars

Each shelf has a par. Finish at or under par for three stars, a little over for two, and any finish for one. Your best stars are saved on this device.

## Develop

```bash
npm install
npm run verify   # proves all 10 levels are solvable
npm run dev      # http://localhost:5173/tea-shop/
npm run build
```

The GitHub Actions workflow on `main` verifies the levels, builds the site, and deploys it to GitHub Pages.
