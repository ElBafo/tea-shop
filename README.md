# Tea Shop

A cozy little sort puzzle. Line up the tea tins, cups, and treats — there is no clock and no fail state. Stars you earn dress up a tiny 3D tea shop.

**Play it here:** [https://elbafo.github.io/tea-shop/](https://elbafo.github.io/tea-shop/)

Made for a quiet moment on a phone. Add it to your Home Screen from Safari if you like.

## How to play

Tap a jar to lift the matching treats on top. Tap another jar to set them down. A drop only works on an empty jar, or on the same kind, and only when there is room.

A shelf is finished when every jar holds one kind, or is empty. Undo as much as you like. Restart whenever you want.

From level 6, some jars wear a little lid. You can see the top treat, but not what waits underneath until you lift it.

From level 16, a few shelves use taller jars that can hold five treats.

## Stars

Each shelf has a par. Finish at or under par for three stars, a little over for two, and any finish for one. Your best stars are saved on this device.

Spend those stars on the home screen to repair and decorate the tea shop: pick a style, then later move plants, rugs, lamps, and tables. When the room is finished, the bakery unlocks.

## Develop

```bash
npm install
npm run verify   # proves all 20 levels are solvable
npm run dev      # http://localhost:5173/tea-shop/
npm run build
```

The GitHub Actions workflow on `main` verifies the levels, builds the site, and deploys it to GitHub Pages.

## Project direction and architecture

- [Product direction](docs/PRODUCT.md): the experience, established decisions, and implemented baseline.
- [Architecture](docs/ARCHITECTURE.md): modules, state, persistence, rendering, and deployment.
- [Shop polish plan](docs/POLISH_PLAN.md): the next art and camera milestone and its acceptance criteria.

The tea shop decorating foundation is implemented. The Bakery currently unlocks a coming-soon message; a playable Bakery and the planned shop art polish have not shipped in this checkout.
