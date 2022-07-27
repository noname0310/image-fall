import { Component, CoroutineIterator, CssRenderer, RigidBody2D, WaitWhile } from "the-world-engine";
import { Vector2 } from "three/src/Three";

export class DragController extends Component {
    public override requiredComponents = [RigidBody2D, CssRenderer]; 
    public override disallowMultipleComponent = true;

    private _rigidBody: RigidBody2D|null = null;
    private _renderer: CssRenderer<HTMLElement>|null = null;
    private _isDragging = false;
    private readonly _mousePosition: Vector2 = new Vector2();

    private readonly onPointerMove = (e: MouseEvent): void => {
        const screen = this.engine.screen;
        const viewSize2 = this.engine.cameraContainer.camera!.viewSize * 2;
        const aspect = screen.width / screen.height;
        const x = (e.pageX / this.engine.screen.width - 0.5) * viewSize2 * aspect;
        const y = (-e.pageY / this.engine.screen.height + 0.5) * viewSize2;
        this._mousePosition.set(x, y);
    };

    private readonly onPointerLeave = (): void => {
        this._isDragging = false;
    };

    public awake(): void {
        this._rigidBody = this.gameObject.getComponent(RigidBody2D);
        this._renderer = this.gameObject.getComponent(CssRenderer);

        this.engine.input.onPointerMove.addListener(this.onPointerMove);
        this.engine.input.onPointerLeave.addListener(this.onPointerLeave);
        this.engine.input.onPointerUp.addListener(this.onPointerLeave);
        this.startCoroutine(this.waitAndInitialize());
    }

    private *waitAndInitialize(): CoroutineIterator {
        yield new WaitWhile(() => this._renderer!.htmlElementEventHandler === null);
        this._renderer!.htmlElementEventHandler!.onmousedown = (): void => {
            this._isDragging = true;
        };
    }

    public onDestroy(): void {
        this.engine.input.onPointerMove.removeListener(this.onPointerMove);
        this.engine.input.onPointerLeave.removeListener(this.onPointerLeave);
        this.engine.input.onPointerUp.removeListener(this.onPointerLeave);

        this._renderer!.htmlElementEventHandler!.onmousedown = null;
        this._rigidBody = null;
        this._renderer = null;
    }

    private readonly _tempVector2 = new Vector2();

    public update(): void {
        if (this._isDragging) {
            const mousePosition = this._mousePosition;
            const rigidBody = this._rigidBody!;
            const rigidBodyPosition = rigidBody.transform.position;
            const force = this._tempVector2
                .set(rigidBodyPosition.x, rigidBodyPosition.y)
                .sub(mousePosition)
                .multiplyScalar(-40);
            console.log(force.x, force.y);
            rigidBody.addForce(force);
        }
    }
}
