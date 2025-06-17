<script lang="ts">
  import type { KeyboardEventHandler } from "svelte/elements";

  type Vec2 = [number, number];
  let root: HTMLCanvasElement;

  function abs([x, y]: Vec2) {
    return Math.sqrt(x * x + y * y);
  }

  function getBoundingBox({ pos, size }: { pos: Vec2; size: Vec2 }) {
    return {
      top: pos[1],
      bottom: pos[1] - size[1],
      left: pos[0],
      right: pos[0] + size[0],
    };
  }

  function ease(x: number){
    return Math.max(Math.min(1.01/(1+(Math.exp(-4*(2*x - 1)))), 1), -1)
  }

  class Game {
    user;
    camera;
    dx;
    zoom = 100.0;
    gravity = -0.001;
    drag = -0.01;
    friction = -0.01;
    ground = 10.0;
    colliders = [
      { size: [1000, 1000] as Vec2, pos: [-500, this.ground] as Vec2 },
      { size: [30, 10] as Vec2, pos: [30, 20] as Vec2 },
      { size: [30, 10] as Vec2, pos: [70, 30] as Vec2 },
      { size: [30, 10] as Vec2, pos: [120, 50] as Vec2 },
      { size: [30, 10] as Vec2, pos: [60, 80] as Vec2 },
      { size: [30, 10] as Vec2, pos: [20, 60] as Vec2 },
      {
        size: [30, 10] as Vec2,
        pos: [-40, 40] as Vec2,
        path: {
          from: [-40, 40],
          to: [-40, 80],
          duration: 1,
          percent: 0.0,
          dir: 0,
          ease: true,
        },
      },
      {
        size: [30, 10] as Vec2,
        pos: [-80, 80] as Vec2,
        path: {
          from: [-80, 80],
          to: [-140, 80],
          duration: 1,
          percent: 0.0,
          dir: 0,
          ease: true,
        },
      },
    ];

    constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
      this.dx = { ctx, width, height };
      this.user = {
        pos: [0.0, this.zoom] as Vec2,
        size: [10, 10] as Vec2,
        movement: [0, 0] as Vec2,
        velocity: [0, 0] as Vec2,
        keyJump: false,
        keyMove: undefined as string | undefined,
        rest: true,
      };
      this.camera = {
        pos: [0, 0] as Vec2,
        padding: [30, 30],
        inertia: [0.01, 0.01] as Vec2,
      };
    }

    scale([x, y]: Vec2) {
      const scale = this.dx.height / this.zoom;
      return [x * scale, y * scale] as Vec2;
    }

    transformPos([x, y]: Vec2) {
      return [
        x - this.camera.pos[0],
        this.zoom - (y - this.camera.pos[1]),
      ] as Vec2;
    }

    play() {
      let prevTime = -1;
      const advanceFrame: FrameRequestCallback = (time) => {
        if (prevTime == -1) {
          prevTime = time;
        }

        const delta = time - prevTime;
        prevTime = time;

        // movement x
        if (Math.abs(this.user.movement[0]) > 0.0) {
          this.user.velocity[0] += this.user.movement[0] * delta;
          this.user.movement[0] += this.user.movement[0] * this.drag * delta;
        }

        // movement y
        if (Math.abs(this.user.movement[1]) > 0.0) {
          this.user.velocity[1] += this.user.movement[1] * delta;
          this.user.movement[1] += this.user.movement[1] * this.drag * delta;
        }

        // gravity reduces velocity y
        this.user.velocity[1] += this.gravity * delta;

        // Friction reduces velocity x
        if (Math.abs(this.user.velocity[0]) > 0.0) {
          this.user.velocity[0] +=
            this.user.velocity[0] * this.friction * delta;
        }

        if (Math.abs(this.user.velocity[0]) < 0.0001) {
          this.user.velocity[0] = 0;
        }
        if (Math.abs(this.user.velocity[1]) < 0.0001) {
          this.user.velocity[1] = 0;
        }

        // move platforms

        // update pos
        let newX = this.user.pos[0] + this.user.velocity[0] * delta;
        let newY = this.user.pos[1] + this.user.velocity[1] * delta;

        this.user.rest = false;

        // user collided with a platform
        this.colliders.forEach((collider) => {
          // update collider pos
          this.updateCollider(collider, delta)

          const colliderBox = getBoundingBox(collider);
          const userBox = getBoundingBox({
            pos: [newX, newY] as Vec2,
            size: this.user.size,
          });

          if (
            userBox.bottom < colliderBox.top &&
            userBox.top > colliderBox.bottom &&
            userBox.left < colliderBox.right &&
            userBox.right > colliderBox.left
          ) {
            // collided
            if (
              this.user.velocity[1] < 0 &&
              (userBox.right > colliderBox.left ||
                userBox.left < colliderBox.right) &&
              userBox.top >= colliderBox.top
            ) {
              this.user.velocity[1] = 0;
              this.user.movement[1] = 0;
              newY = colliderBox.top + this.user.size[1];
              this.user.rest = true;
            }

            if (
              this.user.velocity[1] > 0 &&
              (userBox.right > colliderBox.left ||
                userBox.left < colliderBox.right) &&
              userBox.bottom <= colliderBox.bottom
            ) {
              this.user.velocity[1] = 0;
              this.user.movement[1] = 0;
              newY = colliderBox.bottom;
              this.user.rest = true;
            } else if (
              this.user.velocity[0] &&
              userBox.top <= colliderBox.top &&
              (userBox.left < colliderBox.left ||
                userBox.right > colliderBox.right)
            ) {
              this.user.velocity[0] = 0;
              this.user.movement[0] = 0;
              if (userBox.left < colliderBox.left) {
                newX = colliderBox.left - this.user.size[0];
              } else {
                newX = colliderBox.right;
              }
            }
          }
        });

        this.user.pos = [newX, newY] as Vec2;

        // moment dead-zone
        if (Math.abs(this.user.movement[0]) < 0.001) {
          this.user.movement[0] = 0;
        }
        if (Math.abs(this.user.movement[1]) < 0.001) {
          this.user.movement[1] = 0;
        }

        this.updateCamera(delta);
        
        this.render();

        if (this.user.keyMove) {
          this.keyDown(this.user.keyMove);
        }

        window.requestAnimationFrame(advanceFrame);
      };

      window.requestAnimationFrame(advanceFrame);
    }

    updateCollider(collider: typeof this.colliders[number], delta: number){
      const path = collider.path;

      if (path) {
        if (path.dir === 0) {
          path.percent += delta / (path.duration * 1000);
        } else {
          path.percent -= delta / (path.duration * 1000);
        }

        if (path.percent < 0) {
          path.dir = 0;
        } else if (path.percent > 1) {
          path.dir = 1;
        }

        const t = path.ease ? ease(path.percent) : path.percent;

        const pX =
          path.from[0] + (path.to[0] - path.from[0]) * t;
        const pY =
          path.from[1] + (path.to[1] - path.from[1]) * t;

        collider.pos = [pX, pY];
      }
    }

    updateCamera(delta: number){
      const rightScroll =
          this.camera.pos[0] + this.camera.padding[0] - this.user.pos[0];
        const leftScroll =
          this.user.pos[0] -
          (100 - this.camera.padding[0] + this.camera.pos[0]);

        const topScroll =
          this.user.pos[1] -
          (100 - this.camera.padding[1] + this.camera.pos[1]);
        const bottomScroll =
          this.camera.pos[1] + (60 - this.camera.padding[1]) - this.user.pos[1];

        // camera
        if (rightScroll > 0) {
          this.camera.pos[0] -= rightScroll * this.camera.inertia[0] * delta;
        } else if (leftScroll > 0) {
          this.camera.pos[0] += leftScroll * this.camera.inertia[0] * delta;
        }

        if (topScroll > 0) {
          this.camera.pos[1] += topScroll * this.camera.inertia[1] * delta;
        } else if (bottomScroll > 0) {
          this.camera.pos[1] -= bottomScroll * this.camera.inertia[1] * delta;
        }

    }

    render() {
      // draw user
      const pos = this.scale(
        this.transformPos([this.user.pos[0], this.user.pos[1]]),
      );
      const size = this.scale(this.user.size);

      this.dx.ctx.clearRect(0, 0, this.dx.width, this.dx.height);

      // user
      this.dx.ctx.fillStyle = "#555";
      this.dx.ctx.fillRect(...pos, ...size);

      // colliders
      this.dx.ctx.fillStyle = "#3a5";

      this.colliders.forEach((collider) => {
        this.dx.ctx.fillRect(
          ...this.scale(this.transformPos(collider.pos)),
          ...this.scale(collider.size),
        );
      });
    }

    keyDown(key: string) {
      switch (key) {
        case "ArrowUp":
          if (this.user.rest && !this.user.keyJump) {
            this.user.rest = false;
            this.user.movement[1] = 0.004;
          }
          this.user.keyJump = true;
          break;
        case "ArrowLeft":
          this.user.movement[0] = -0.001;
          this.user.keyMove = "ArrowLeft";
          break;
        case "ArrowRight":
          this.user.movement[0] = +0.001;
          this.user.keyMove = "ArrowRight";
          break;
      }
    }

    keyUp(key) {
      if (key === "ArrowUp" && this.user.keyJump) {
        this.user.keyJump = false;
      }
      if (key === this.user.keyMove) this.user.keyMove = undefined;
    }
  }

  $effect(() => {
    const ctx: CanvasRenderingContext2D = root.getContext("2d");
    console.log(ctx);
    const game = new Game(ctx, root.clientWidth, root.clientHeight);
    game.play();

    const onKeyDown = (event: KeyboardEvent) => {
      console.log("user pressed:", event.key);
      game.keyDown(event.key);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      game.keyUp(event.key);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.addEventListener("keyup", onKeyUp);
    };
  });
</script>

<canvas
  bind:this={root}
  width="400px"
  height="280px"
  style="border: solid 1px white; background: #000;"
></canvas>
