import { Game } from "the-world-engine";
import { Bootstrapper } from "./asset/Bootstrapper";

function startTestGame(container: HTMLElement): void {
    const game = new Game(container);
    game.run(Bootstrapper);
    game.inputHandler.startHandleEvents();
}

startTestGame(document.body);
