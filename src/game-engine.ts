import type { ColliderState, Game, GameState, Vec2 } from "./game.model";
import { ease, getBoundingBox } from "./utils";

/**
   * Todo:
   * 1. Add circular platform paths
   * 2. Add support for sprites
   * 3. Add New levels
   * 4. Add enemies and game over screen
   * 5. Add timer and high score at end screen.
   */
export class GameEngine {
    // Consts
    zoom = 100.0;
    gravity = -0.001;
    drag = -0.01;
    friction = -0.01;
    ground = 10.0;

    // Canvas and related stuff
    dx;

    // The spec for the game
    game: Game;

    // Current state of the game
    state: GameState;

    constructor(ctx: CanvasRenderingContext2D, width: number, height: number, game: Game) {
        this.dx = { ctx, width, height };
        this.game = game;
        this.state = GameEngine.reset(game)
    }

    static reset(game: Game, level_index: number = 0): GameState {
        const level = game.levels[level_index];

        return {
            completed: false,
            current_level: 0,
            current_level_state: {
                completed: false,
                camera_state: {
                    pos: [...level.camera.start_pos]
                },
                user_state: {
                    pos: [...level.user.start_pos],
                    movement: [0, 0],
                    velocity: [0, 0],
                    keyJump: false,
                    keyMove: undefined,
                    rest: true,
                    parent: null
                },
                colliders_state: level.colliders.map((collider): ColliderState => ({
                    pos: [...collider.start_pos],
                    path: collider.path && {
                        percent: 0,
                        direction: 'forward',
                    }
                })),
            }
        }
    }

    scale([x, y]: Vec2) {
        const scale = this.dx.height / this.zoom;
        return [x * scale, y * scale] as Vec2;
    }

    transformPos([x, y]: Vec2) {
        const camera_pos = this.state.current_level_state.camera_state.pos;
        return [
            x - camera_pos[0],
            this.zoom - (y - camera_pos[1]),
        ] as Vec2;
    }

    get current_level() {
        return this.game.levels[this.state.current_level]
    }

    play() {
        let prevTime = -1;
        const advanceFrame: FrameRequestCallback = (time) => {
            if (prevTime == -1) {
                prevTime = time;
            }

            const delta = time - prevTime;
            prevTime = time;

            const user = this.state.current_level_state.user_state;
            const user_size = this.current_level.user.size

            // movement x
            if (Math.abs(user.movement[0]) > 0.0) {
                user.velocity[0] += user.movement[0] * delta;
                user.movement[0] += user.movement[0] * this.drag * delta;
            }

            // movement y
            if (Math.abs(user.movement[1]) > 0.0) {
                user.velocity[1] += user.movement[1] * delta;
                user.movement[1] += user.movement[1] * this.drag * delta;
            }

            // gravity reduces velocity y
            user.velocity[1] += this.gravity * delta;

            // Friction reduces velocity x
            if (Math.abs(user.velocity[0]) > 0.0) {
                user.velocity[0] +=
                    user.velocity[0] * this.friction * delta;
            }

            if (Math.abs(user.velocity[0]) < 0.0001) {
                user.velocity[0] = 0;
            }
            if (Math.abs(user.velocity[1]) < 0.0001) {
                user.velocity[1] = 0;
            }

            // move platforms

            // update pos
            let newX = user.pos[0] + user.velocity[0] * delta;
            let newY = user.pos[1] + user.velocity[1] * delta;

            if (!user.rest) {
                user.parent = null;
            }
            user.rest = false;

            // user collided with a platform
            this.state.current_level_state.colliders_state.forEach((collider_state, index) => {
                const collider = this.current_level.colliders[index];

                // update collider pos
                const colliderOldPos = collider_state.pos;

                this.updateCollider(index, delta);

                const colliderRelativePos = [
                    collider_state.pos[0] - colliderOldPos[0],
                    collider_state.pos[1] - colliderOldPos[1],
                ];

                const colliderBox = getBoundingBox({
                    pos: collider_state.pos,
                    size: collider.size
                });

                const userBox = getBoundingBox({
                    pos: [newX, newY] as Vec2,
                    size: user_size,
                });

                if (index === user.parent) {
                    newX += colliderRelativePos[0];
                    newY += colliderRelativePos[1];
                    user.rest = true;
                }

                if (
                    userBox.bottom < colliderBox.top &&
                    userBox.top > colliderBox.bottom &&
                    userBox.left < colliderBox.right &&
                    userBox.right > colliderBox.left
                ) {
                    if (collider.type === "goal") {
                        this.state.current_level_state.completed = true;
                    }

                    // collided
                    if (
                        user.velocity[1] < 0 &&
                        (userBox.right > colliderBox.left ||
                            userBox.left < colliderBox.right) &&
                        userBox.top >= colliderBox.top
                    ) {
                        user.velocity[1] = 0;
                        user.movement[1] = 0;
                        newY = colliderBox.top + user_size[1];
                        user.rest = true;
                        user.parent = index;
                    }

                    if (
                        user.velocity[1] > 0 &&
                        (userBox.right > colliderBox.left ||
                            userBox.left < colliderBox.right) &&
                        userBox.bottom <= colliderBox.bottom
                    ) {
                        user.velocity[1] = 0;
                        user.movement[1] = 0;
                        newY = colliderBox.bottom;
                        user.rest = true;
                    } else if (
                        user.velocity[0] &&
                        userBox.top <= colliderBox.top &&
                        (userBox.left < colliderBox.left ||
                            userBox.right > colliderBox.right)
                    ) {
                        user.velocity[0] = 0;
                        user.movement[0] = 0;
                        if (userBox.left < colliderBox.left) {
                            newX = colliderBox.left - user_size[0];
                        } else {
                            newX = colliderBox.right;
                        }
                    }
                }
            });

            user.pos = [newX, newY] as Vec2;

            // moment dead-zone
            if (Math.abs(user.movement[0]) < 0.001) {
                user.movement[0] = 0;
            }
            if (Math.abs(user.movement[1]) < 0.001) {
                user.movement[1] = 0;
            }

            this.updateCamera(delta);

            this.render();

            if (user.keyMove) {
                this.keyDown(user.keyMove);
            }

            window.requestAnimationFrame(advanceFrame);
        };

        window.requestAnimationFrame(advanceFrame);
    }

    updateCollider(collider_index: number, delta: number) {
        const collider = this.current_level.colliders[collider_index];
        const collider_state = this.state.current_level_state.colliders_state[collider_index];

        const path = collider.path;
        const path_state = collider_state.path;

        if (path && path_state) {
            if (path_state.direction === 'forward') {
                path_state.percent += delta / (path.duration * 1000);
            } else {
                path_state.percent -= delta / (path.duration * 1000);
            }

            if (path_state.percent < 0) {
                path_state.direction = 'forward';
            } else if (path_state.percent > 1) {
                path_state.direction = 'backward';
            }

            const t = path.ease ? ease(path_state.percent) : path_state.percent;

            if (path.type === 'linear') {
                const pX = path.from[0] + (path.to[0] - path.from[0]) * t;
                const pY = path.from[1] + (path.to[1] - path.from[1]) * t;
                collider_state.pos = [pX, pY];
            } else if (path.type === 'functional') {
                collider_state.pos = path.func(t);
            }
        }
    }

    updateCamera(delta: number) {
        const camera_state = this.state.current_level_state.camera_state;
        const camera = this.current_level.camera;
        const user_state = this.state.current_level_state.user_state;

        const rightScroll =
            camera_state.pos[0] + camera.padding[0] - user_state.pos[0];
        const leftScroll =
            user_state.pos[0] - (100 - camera.padding[0] + camera_state.pos[0]);

        const topScroll =
            user_state.pos[1] - (100 - camera.padding[1] + camera_state.pos[1]);
        const bottomScroll =
            camera_state.pos[1] + (60 - camera.padding[1]) - user_state.pos[1];

        // camera
        if (rightScroll > 0) {
            camera_state.pos[0] -= rightScroll * camera.inertia[0] * delta;
        } else if (leftScroll > 0) {
            camera_state.pos[0] += leftScroll * camera.inertia[0] * delta;
        }

        if (topScroll > 0) {
            camera_state.pos[1] += topScroll * camera.inertia[1] * delta;
        } else if (bottomScroll > 0) {
            camera_state.pos[1] -= bottomScroll * camera.inertia[1] * delta;
        }
    }

    render() {
        const user = this.current_level.user;
        const user_state = this.state.current_level_state.user_state;

        // draw user
        const pos = this.scale(
            this.transformPos([user_state.pos[0], user_state.pos[1]]),
        );
        const size = this.scale(user.size);

        this.dx.ctx.clearRect(0, 0, this.dx.width, this.dx.height);

        if (this.state.current_level_state.completed) {
            this.dx.ctx.fillStyle = "#ee5";
            this.dx.ctx.scale(4, 4);
            this.dx.ctx.fillText("You win!", ...this.scale([17, 12]));
            this.dx.ctx.scale(1 / 4, 1 / 4);

            this.dx.ctx.scale(2, 2);
            this.dx.ctx.fillText("Press space to restart", ...this.scale([32, 28]));
            this.dx.ctx.scale(1 / 2, 1 / 2);
            return;
        }

        // user
        if (user_state.parent !== null) {
            this.dx.ctx.fillStyle = "#f00";
        } else {
            this.dx.ctx.fillStyle = "#555";
        }
        this.dx.ctx.fillRect(...pos, ...size);

        // colliders

        this.state.current_level_state.colliders_state.forEach((collider_state, index) => {
            const collider = this.current_level.colliders[index];

            if (collider.type === "goal") {
                this.dx.ctx.fillStyle = "#ff0";
            } else {
                this.dx.ctx.fillStyle = "#3a5";
            }

            this.dx.ctx.fillRect(
                ...this.scale(this.transformPos(collider_state.pos)),
                ...this.scale(collider.size),
            );
        });
    }

    keyDown(key: string) {
        const user = this.current_level.user;
        const user_state = this.state.current_level_state.user_state;

        switch (key) {
            case "ArrowUp":
                if (user_state.rest && !user_state.keyJump) {
                    user_state.rest = false;
                    user_state.movement[1] = 0.004;
                }
                user_state.keyJump = true;
                break;
            case "ArrowLeft":
                user_state.movement[0] = -0.001;
                user_state.keyMove = "ArrowLeft";
                break;
            case "ArrowRight":
                user_state.movement[0] = +0.001;
                user_state.keyMove = "ArrowRight";
                break;
            case " ":
                this.state = GameEngine.reset(this.game, this.state.current_level);
                break;
        }
    }

    keyUp(key: string) {
        const user_state = this.state.current_level_state.user_state;

        if (key === "ArrowUp" && user_state.keyJump) {
            user_state.keyJump = false;
        }

        if (key === user_state.keyMove) {
            user_state.keyMove = undefined;
        }
    }
}