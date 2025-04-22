import * as hc from "./heraldCore.js";

Hooks.on("ready", () => {
  setTimeout(async () => {
    if (game.user.isGM) {
      hc.heraldCore_renderAccessButton();
    }
  }, 1000);
});
