# Working on Tea Shop

Read `README.md`, `docs/PRODUCT.md`, and `docs/ARCHITECTURE.md` before substantial changes. For the next art milestone, read `docs/POLISH_PLAN.md`.

- Preserve the cozy, phone-first experience: no clock or fail state, unlimited undo, and stars earned through puzzle completion.
- Keep puzzle and placement rules separate from rendering. Use Babylon.js for the 3D shop and preserve explicit Edit mode.
- Preserve existing local progress and the scene disposal lifecycle.
- Treat the Bakery as a placeholder until its implementation is explicitly in scope.
- Run `npm run verify` and `npm run build` for relevant code changes. For art or interaction changes, check the browser at phone and desktop sizes and provide screenshots.
- If sandbox restrictions block the `tsx` CLI IPC socket, run the same verifier with `node --import tsx scripts/verify-levels.ts`.
- Keep documentation honest about implemented behavior versus planned work.
- Future implementation should be presented in a reviewable PR with screenshots where relevant. Merge or publish when explicitly authorized by the user; session instructions take precedence.
