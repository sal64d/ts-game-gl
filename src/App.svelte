<script lang="ts">
    import { game } from "./game";
    import { GameEngine } from "./game-engine";

  let root: HTMLCanvasElement;

  $effect(() => {
    const ctx: CanvasRenderingContext2D = root.getContext("2d")!;
    const gameEngine = new GameEngine(ctx, root.clientWidth, root.clientHeight, game);
    gameEngine.play();

    const onKeyDown = (event: KeyboardEvent) => {
      console.log("user pressed:", event.key);
      gameEngine.keyDown(event.key);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      gameEngine.keyUp(event.key);
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
  width="800px"
  height="480px"
  style="border: solid 1px white; background: #000;"
></canvas>
