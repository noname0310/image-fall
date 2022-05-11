import { Vector2, Vector3, Quaternion } from "three/src/Three";
import { BoxCollider2D, Component, CoroutineIterator, CssSpriteRenderer, PrefabRef, RigidBody2D, WaitForSeconds, WaitWhile } from "the-world-engine";
import { ImageSearch, SearchResult } from "./ImageSearch";

export class ImageSpawner extends Component {
    public maxSpawnDelay = 2;
    public minSpawnDelay = 0.3;

    public spawnMaxX = 5;
    public spawnMinY = -5;
    public spawnY = 0;
    public spawnRotationMax = Math.PI / 2;
    public spawnRotationMin = 0;

    public maxSpawnCount = 20;
    public imageScale = 2;

    private readonly _spawnedImages: CssSpriteRenderer[] = [];

    private generateRandomNumber(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    public spawn(query: string): void {
        this.startCoroutine(this.spawnInternal(query));
    }

    public clear(): void {
        for (let i = 0; i < this._spawnedImages.length; i++) {
            this._spawnedImages[i].gameObject.destroy();
        }
        this._spawnedImages.length = 0;
    }

    private *spawnInternal(query: string): CoroutineIterator {
        let imageSearchResults: SearchResult[]|null = null;
        ImageSearch.fatch(query).then(images => imageSearchResults = images);
        yield new WaitWhile(() => imageSearchResults === null);

        for (const image of imageSearchResults!) {
            if (this._spawnedImages.length >= this.maxSpawnCount) {
                const imageToRemove = this._spawnedImages.shift();
                if (imageToRemove) {
                    imageToRemove.gameObject.destroy(); 
                }
            }

            const renderer = new PrefabRef<CssSpriteRenderer>();
            const collider = new PrefabRef<BoxCollider2D>();

            const position = new Vector3(this.generateRandomNumber(this.spawnMinY, this.spawnMaxX), this.spawnY, 0)
                .add(this.gameObject.transform.position);
            const rotation = new Quaternion().setFromAxisAngle(
                new Vector3(0, 0, 1),
                this.generateRandomNumber(this.spawnRotationMin, this.spawnRotationMax)
            );

            this.engine.scene.addChildFromBuilder(
                this.engine.instantiater.buildGameObject(image.title, position, rotation)
                    .withComponent(CssSpriteRenderer, c => {
                        c.asyncSetImageFromPath(image.imageUrl,  () => {
                            const width = c.imageWidth;
                            const height = c.imageHeight;

                            c.imageWidth = 1 * this.imageScale;
                            c.imageHeight = height / width * c.imageWidth;

                            collider.ref!.size = new Vector2(c.imageWidth, c.imageHeight);
                        });
                    })
                    .withComponent(RigidBody2D)
                    .withComponent(BoxCollider2D)
                    .getComponent(CssSpriteRenderer, renderer)
                    .getComponent(BoxCollider2D, collider));
                
            this._spawnedImages.push(renderer.ref!);

            yield new WaitForSeconds(this.generateRandomNumber(this.minSpawnDelay, this.maxSpawnDelay));
        }
    }
}
