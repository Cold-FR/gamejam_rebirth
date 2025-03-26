import Phaser from "phaser";
import { createAnims, preload } from "../factory/unitFactory.js";
import unitFactory from "../factory/unitFactory.js";
import Base from "../objects/Base.js";

/**
 * @property {import("../objects/Unit.js").default[]} units All units on the map
 */
export default class Game extends Phaser.Scene {
  create(data) {
    this.faction = data.faction;
    this.units = [];
    this.#createAnims();
    this.targetCameraX = 0;
    this.sound.pauseOnBlur = false;

    this.backgroundMusic = this.sound.add(
      `music${Math.floor(Math.random() * 3) + 1}`,
      {
        volume: 0.5,
        loop: true,
      },
    );
    this.backgroundMusic.play();

    this.scene.launch("spawnUI", { faction: this.faction });

    this.layers = {
      bg: this.add.layer(),
      back: this.add.layer(),
      front: this.add.layer(),
      endMessage: this.add.layer(),
    };
    this.layers.bg.setDepth(0);
    this.layers.back.setDepth(1);
    this.layers.front.setDepth(2);
    this.layers.endMessage.setDepth(3);

    const inputText = this.add
      .text(10, 10, "Appuyez sur Q ou D / ← ou → pour bouger", {
        fontSize: 20,
        color: "white",
        align: "center",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0, 0);
    this.layers.front.add(inputText);

    const background = this.add.image(1500, 300, "background").setScale(1.2);
    this.imageWidth = 3000;
    this.imageHeight = 250;

    this.bases = [
      new Base(
        this,
        this.faction === "pirates" ? 400 : 2700,
        275,
        "boat",
      ).setScale(1.4),
      new Base(
        this,
        this.faction === "knights" ? 400 : 2700,
        335,
        "castle",
      ).setScale(2),
    ];

    if (this.faction === "knights") {
      background.flipX = true;
      this.bases[0].setFlipX(true);
      this.bases[1].setFlipX(true);
    }

    this.#setBounds({
      x: 0,
      y: 0,
      width: this.imageWidth,
      height: this.imageHeight,
    });
    this.#handleInput();
    this.units.forEach((unit) => {
      unit.layer = this.layers.front;
      unit.setDepth(1);
    });

    this.#handleSpawnEvent();

    const botFaction = this.faction === "knights" ? "pirates" : "knights";
    this.time.addEvent({
      delay: 10000,
      callback() {
        this.units.push(unitFactory(botFaction, 1, this, "bot"));
      },
      callbackScope: this,
      loop: true,
    });
    this.time.addEvent({
      delay: 20000,
      callback() {
        this.units.push(unitFactory(botFaction, 2, this, "bot"));
      },
      callbackScope: this,
      loop: true,
    });
    this.time.addEvent({
      delay: 50000,
      callback() {
        this.units.push(unitFactory(botFaction, 3, this, "bot"));
      },
      callbackScope: this,
      loop: true,
    });
  }

  get damageables() {
    return [...this.units, ...this.bases];
  }

  update() {
    if (this.bases.some((base) => !base.alive)) {
      let text = "";
      let sound = "";
      this.game.pause();
      if (!this.bases[0].alive) {
        text =
          this.faction === "knights"
            ? "Tu as réussi à repousser les pirates !"
            : "Les chevaliers vous ont repoussé...";
        sound = this.faction === "knights" ? "victory" : "defeat";
      } else if (!this.bases[1].alive) {
        text =
          this.faction === "pirates"
            ? "Tu as réussi à envahir le château !"
            : "Les pirates vous ont envahi...";
        sound = this.faction === "pirates" ? "victory" : "defeat";
      }
      const endText = this.add
        .text(
          this.sys.canvas.width / 2 + this.cameras.main.scrollX,
          this.sys.canvas.height / 2,
          text,
          {
            fontSize: 25,
            color: "white",
            align: "center",
            stroke: "#000000",
            strokeThickness: 4,
          },
        )
        .setOrigin(0.5);
      endText.layer = this.layers.endMessage;
      this.backgroundMusic.stop();
      this.sound.play(sound, {
        volume: 0.5,
      });
    }

    this.units = this.units.filter((unit) => unit.alive);

    const smoothFactor = 0.1;
    const currentX = this.cameras.main.scrollX;
    this.cameras.main.setScroll(
      // eslint-disable-next-line new-cap -- This is phaser not respecting conventions
      Phaser.Math.Linear(currentX, this.targetCameraX, smoothFactor),
      0,
    );

    if (
      (this.keys.left.isDown || this.keys.leftSecond.isDown) &&
      !(this.keys.right.isDown || this.keys.rightSecond.isDown)
    ) {
      this.targetCameraX -= 10;
    } else if (
      (this.keys.right.isDown || this.keys.rightSecond.isDown) &&
      !(this.keys.left.isDown || this.keys.leftSecond.isDown)
    ) {
      this.targetCameraX += 10;
    }

    const cameraBounds = this.cameras.main.getBounds();

    // eslint-disable-next-line new-cap -- This is phaser not respecting conventions
    this.targetCameraX = Phaser.Math.Clamp(
      this.targetCameraX,
      cameraBounds.left,
      2200,
    );
  }

  preload() {
    preload(this);
    this.load.image("background", "./background.png");
    this.load.image("boat", "./boat.png");
    this.load.image("castle", "./castle.png");
    this.load.audio("music1", "./sounds/music1.mp3");
    this.load.audio("music2", "./sounds/music2.mp3");
    this.load.audio("music3", "./sounds/music3.mp3");
    this.load.audio("sword1", "./sounds/swordhit1.wav");
    this.load.audio("sword2", "./sounds/swordhit2.wav");
    this.load.audio("sword3", "./sounds/swordhit3.wav");
    this.load.audio("canonshoot", "./sounds/canonshoot.wav");
    this.load.audio("bowattack1", "./sounds/bowattack1.wav");
    this.load.audio("bowattack2", "./sounds/bowattack2.wav");
    this.load.audio("bowhit1", "./sounds/bowhit1.wav");
    this.load.audio("bowhit2", "./sounds/bowhit2.wav");
    this.load.audio("victory", "./sounds/victory.mp3");
    this.load.audio("defeat", "./sounds/gameover.mp3");
  }

  #createAnims() {
    createAnims(this);
  }

  #handleInput() {
    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.Q,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      leftSecond: Phaser.Input.Keyboard.KeyCodes.LEFT,
      rightSecond: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    });
  }

  #setBounds({ x, y, width, height }) {
    this.cameras.main.setBounds(x, y, width, height);
    this.physics.world.setBounds(x, y, width, height);
  }

  #handleSpawnEvent() {
    const spawnScene = this.scene.get("spawnUI");

    spawnScene.events.on("spawnUnit", (unit) => {
      this.units.push(unitFactory(this.faction, unit, this, "player"));
    });
  }
}
