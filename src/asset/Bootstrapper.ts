import { Vector3, Vector2 } from "three/src/Three";
import {
    Bootstrapper as BaseBootstrapper,
    BoxCollider2D,
    Camera,
    Color,
    CssSpriteRenderer,
    Physics2DLoader,
    SceneBuilder
} from "the-world-engine";
import { ImageSpawner } from "./script/ImageSpawner";

export class Bootstrapper extends BaseBootstrapper {
    public run(): SceneBuilder {
        this.setting.physics
            .loader(Physics2DLoader);

        const instantiater = this.instantiater;

        return this.sceneBuilder
            .withChild(instantiater.buildGameObject("Camera")
                .withComponent(Camera, c => {
                    c.backgroundColor = new Color(0.1, 0.1, 0.1);
                }))

            .withChild(instantiater.buildGameObject("Spawner", new Vector3(0, 6, 0))
                .withComponent(ImageSpawner, c => {
                    (globalThis as any).spawner = c;
                }))
        
            .withChild(instantiater.buildGameObject("Ground", new Vector3(0, -5, 0))
                .withComponent(CssSpriteRenderer, c => {
                    c.imageWidth = 30;
                    c.imageHeight = 1;
                })
                .withComponent(BoxCollider2D, c => {
                    c.size = new Vector2(30, 1);
                    c.debugDraw = false;
                }))
        ;
    }
}
