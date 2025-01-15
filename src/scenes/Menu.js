import { Scene } from "phaser";
import Portrait from "../objects/Portrait.js";

/**
 *
 */
export default class Menu extends Scene {
  create() {
    this.add
      .text(
        this.sys.canvas.width / 2,
        this.sys.canvas.height / 10,
        "[Name of the game]",
        {
          fontSize: "64px",
          stroke: "#000000",
          strokeThickness: 4,
        },
      )
      .setOrigin(0.5);

    this.add
      .text(
        this.sys.canvas.width / 2,
        (this.sys.canvas.height / 10) * 2,
        "Choisis ta faction",
        {
          fontSize: "64px",
          stroke: "#000000",
          strokeThickness: 4,
        },
      )
      .setOrigin(0.5, 0);

    this.add.existing(
      new Portrait(
        this,
        (this.sys.canvas.width / 10) * 4,
        this.sys.canvas.height / 2,
        "MiniSwordMan",
        "Chevaliers",
      ),
    );

    this.add.existing(
      new Portrait(
        this,
        (this.sys.canvas.width / 10) * 6,
        this.sys.canvas.height / 2,
        "MiniPirateCrew",
        "Pirates",
      ),
    );
  }

  preload() {
    Portrait.preLoad(this, "MiniSwordMan");
    Portrait.preLoad(this, "MiniPirateCrew");
  }
}
