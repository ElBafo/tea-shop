import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { LEVELS } from "../src/game/levels";
import { starsForMoves } from "../src/game/engine";

// Released board identities are part of the unfinished-puzzle replay contract.
// An intentional board migration must update this contract and migrate replay logs.
const original = [
  { id: 1, par: 3, hash: "bfbc01992afda250d5ccfaf9ade0bd14bacd1cbe63c34138310d09b0b0f435c7" },
  { id: 2, par: 7, hash: "93257909c0045caddd133bcc9315a8e2a80a045d7108851d5c4649a82153c71a" },
  { id: 3, par: 7, hash: "0314f8371123c03d023f12a57e5b88a90f9aeceee222a84e809a09cdf3c17666" },
  { id: 4, par: 10, hash: "31031b5ccf0feaec5bd3547e754731eb35a32467b1b19ff3c7b551ed814426e2" },
  { id: 5, par: 13, hash: "c3e73a0eceb3bcc6f935e2aa6fdffc9924698860301ff5d1028de9673517d98d" },
  { id: 6, par: 12, hash: "95a043ccc121d1d600600dd611f1721d36bc45543986bc0ffc61989f61d5480d" },
  { id: 7, par: 13, hash: "138b0c3f385cee1d6cf8ae89ef7b2eb46611f4437fc7cce2dfc38011b5184470" },
  { id: 8, par: 16, hash: "bafd92c641704180c90fa47322539ce5d4b055dea84d916650af0d248177116d" },
  { id: 9, par: 19, hash: "744431d26c4258c801ffd0da6ee89853da0aaa3693365582c32feb3c6c27cfe2" },
  { id: 10, par: 19, hash: "e5344cfb8528171910b999f0919412074553ff6e81dcdca672c410e4fc3b1b00" },
  { id: 11, par: 11, hash: "4f6651c84042f2ecf84b4411e665db12d48350569816cdffcf3ca915fa47c875" },
  { id: 12, par: 13, hash: "91134083b86bb377e02a7e796af412d6fcada60871d93171c2296ca8ce12d871" },
  { id: 13, par: 13, hash: "06c6d339255cdb71b741433c72510cbc55bf402132b09f6f162934553bc9e3e1" },
  { id: 14, par: 14, hash: "fcaa9333a59efd9f1f9b8e4c50822e36393a413ad2eb53c8acc8bda93438fbe3" },
  { id: 15, par: 15, hash: "3b687527ca3d82a66cdb9fc33d13f482902103508c361c37b0ef77245b251e82" },
  { id: 16, par: 14, hash: "dfbb495c4fe52ac3dc4a48dafc97a993d3fcec916df6c28fd13d6b5527775bd4" },
  { id: 17, par: 20, hash: "44a156173ccccc994f84c0afbd18625be0f75e5d6b527f258ba4bc3c43899dbc" },
  { id: 18, par: 19, hash: "80474befbb747c9d97837091978ead2339a943d05f960ff863e302e089fabfed" },
  { id: 19, par: 19, hash: "6fafadd60a0d0b7afcdc10f48c8e00ca046a5ea16ced37f82e5277bfa702b0a2" },
  { id: 20, par: 18, hash: "6d58274b6237961090e55a74f522f69aac1be18e61369dbaef549956113f7988" },
  { id: 21, par: 13, hash: "03e56bf7dc07dafc8dd1f5659fdf26536e46817312ad0affd40fcf7abf4d6d0d" },
  { id: 22, par: 11, hash: "8f8b56fcf0b3d70f5727f616ccaf1abb6a7598ee9445a28017cb4771f0fd9edc" },
  { id: 23, par: 16, hash: "77e08316c546d5fcd6849c70b12e799bd416f6335694f46ccf8cd0d6712809ec" },
  { id: 24, par: 17, hash: "3c0133ae110fc9adba29df9ccdda136a66f4cb3b9156bed12f02c7a2c02d0e8d" },
  { id: 25, par: 17, hash: "26f299e1a5b435871f69ac0fed3ae0df54d9684843ce416f1c73e5cd46433598" },
  { id: 26, par: 17, hash: "fb99fdbff25d6035b63c9ff8ddf723f2083546a49831fe0a5f57231949a74bbc" },
  { id: 27, par: 19, hash: "c841c03c5666d1746a291da9ea37fdee084d6c5f11109a7e838dd9844786647a" },
  { id: 28, par: 15, hash: "5067f1a3439bbc7b36a2e1f51708610f11a80d5ccac658f576327a1cd61065c6" },
  { id: 29, par: 18, hash: "e6a55e0475fcd525390ee71c0236d5eacfe80492bbe56b6bba7a5c679e7b9773" },
  { id: 30, par: 20, hash: "9cbd9d7cfd7b29785aa7ddb359b54d8f333328d74ca91243a6427dc9fcfa140f" },
  { id: 31, par: 17, hash: "e9fcb885a346130be39ad6337baf2ea88cfc36d00d79066a0d959dc82ae20cb7" },
  { id: 32, par: 14, hash: "da790ac274f92c6b56fb8d0f35ad8926133913b4ebda861b0d2865954e3eca87" },
  { id: 33, par: 15, hash: "651b64ba4e6735bb30216b81ef1205f7ae3034e63e817d5ed7144a5cdf940a55" },
  { id: 34, par: 20, hash: "7af1124314643b037acc82a1bb68d0747349d5bb30ae01ce37d75d58a1fa22af" },
  { id: 35, par: 19, hash: "88d1273597c11a32fc3d6bb50ddb9036da11308751a0c75fa26f564268fc6a7e" },
  { id: 36, par: 18, hash: "2fa549955983ebf2ffbae95d864930663af51b57cd80538cd5b9d78a8f3d39fc" },
  { id: 37, par: 20, hash: "20e87198c720b5685308fd54d21cfbcb74842572df2409a65ef65ff37f2282a4" },
  { id: 38, par: 19, hash: "2a79d4d0ba8f2a368202a4823284f6f300349d536407919f327c1178c4d9c065" },
];
assert.equal(LEVELS.length, original.length);
for (const [index, level] of LEVELS.entries()) {
  const saved = original[index];
  const identity = { id: level.id, capacity: level.capacity, tubes: level.tubes, sealed: level.sealed ?? level.tubes.map(() => false) };
  assert.equal(level.id, saved.id);
  assert.equal(createHash("sha256").update(JSON.stringify(identity)).digest("hex"), saved.hash, `Level ${level.id}: migrate existing replay logs before changing a board`);
  const allowance = level.sealed?.filter(Boolean).length ?? 0;
  assert.equal(level.par, saved.par + allowance);
  for (let moves = 1; moves <= 100; moves++) {
    assert.ok(starsForMoves(moves, level.par) >= starsForMoves(moves, saved.par), `Level ${level.id} must not become harder to score`);
    assert.ok(starsForMoves(moves, level.par) <= 3);
  }
}
assert.equal(LEVELS.length * 3, 114, "Puzzle earning ceiling stays unchanged");
console.log("PASS: all 38 released board identities unchanged; hidden-jar allowances never reduce rewards; 114 puzzle-star ceiling preserved.");
