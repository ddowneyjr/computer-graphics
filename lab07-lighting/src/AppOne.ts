import * as BABYLON from 'babylonjs'
export class AppOne {
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;

    constructor(readonly canvas: HTMLCanvasElement) {
        this.engine = new BABYLON.Engine(canvas)
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
        this.scene = createScene(this.engine, this.canvas)

    }

    debug(debugOn: boolean = true) {
        if (debugOn) {
            this.scene.debugLayer.show({ overlay: true });
        } else {
            this.scene.debugLayer.hide();
        }
    }

    run() {
        this.debug(true);
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }



}


var createScene = function (engine: BABYLON.Engine, canvas: HTMLCanvasElement) {
    // Scene, Camera and Light setup
    const scene = new BABYLON.Scene(engine);
    // Arc rotation camera allows an orbiting camera controller
	const camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI/2, 1, 10, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);
    const light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(-1, -1, -1), scene);

    return scene;
};
