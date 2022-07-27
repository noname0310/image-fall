import { Vector3, Vector2 } from "three/src/Three";
import {
    Bootstrapper as BaseBootstrapper,
    BoxCollider2D,
    Camera,
    Color,
    CssHtmlElementRenderer,
    CssSpriteRenderer,
    Physics2DLoader,
    PrefabRef,
    SceneBuilder
} from "the-world-engine";
import { ImageSpawner } from "./script/ImageSpawner";

export class Bootstrapper extends BaseBootstrapper {
    public run(): SceneBuilder {
        this.setting.physics
            .loader(Physics2DLoader);

        const instantiater = this.instantiater;

        const spawner = new PrefabRef<ImageSpawner>();

        return this.sceneBuilder
            .withChild(instantiater.buildGameObject("Camera")
                .withComponent(Camera, c => {
                    c.backgroundColor = new Color(0.1, 0.1, 0.1);
                })

                .withChild(instantiater.buildGameObject("TextInput", new Vector3(0, 0, 1))
                    .withComponent(CssHtmlElementRenderer, c => {
                        const div = document.createElement("div");
                        const input = document.createElement("input");
                        input.type = "text";
                        input.placeholder = "Search for an image";
                        input.style.width = "100%";
                        input.style.height = "100%";
                        input.style.border = "none";
                        input.style.opacity = "0.5";

                        let lastQueryTime = 0;
                        let lastQueryString = "";
                        input.addEventListener("keyup", e => {
                            if (e.key === "Enter") {
                                if (Date.now() - lastQueryTime < 1000) {
                                    return;
                                }

                                if (input.value == lastQueryString) {
                                    return;
                                }

                                if (input.value === "") {
                                    spawner.ref!.clear();
                                    return;
                                }
                                
                                const imageSpawner = spawner.ref!;
                                if (imageSpawner) {
                                    imageSpawner.spawn(input.value);
                                }
                                lastQueryTime = Date.now();
                                lastQueryString = input.value;
                            }
                        });
                        div.appendChild(input);
                        c.element = div;
                        c.elementWidth = 8;
                        c.viewScale = 0.04;
                    })))

            .withChild(instantiater.buildGameObject("Spawner", new Vector3(0, 6, 0))
                .withComponent(ImageSpawner, c => {
                    (globalThis as any).spawner = c;
                })
                .getComponent(ImageSpawner, spawner))
        
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
