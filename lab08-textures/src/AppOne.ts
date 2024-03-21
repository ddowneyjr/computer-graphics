import * as BABYLON from 'babylonjs' 
import * as LOADERS from 'babylonjs-loaders'

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


function createScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene { 
    // Scene, Camera and Light setup
    const scene = new BABYLON.Scene(engine);
	const camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI/2, 1, 10, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);

    // we will use a directional light
    const lightDirection = new BABYLON.Vector3(-0.5, -1, 0.7);
    const light = new BABYLON.DirectionalLight("DirectionalLight", lightDirection, scene);

    // 'ground' mesh for reference.
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 6, height: 6}, scene);

    return scene;
}

function hexToVec3(hex: string): BABYLON.Vector3 {
    return BABYLON.Vector3.FromArray(BABYLON.Color3.FromHexString(hex).toLinearSpace().asArray());
}
