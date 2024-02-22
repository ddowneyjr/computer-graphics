import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

class Playground {
    public static CreateScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
        var scene = new BABYLON.Scene(engine);

        const camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI/2, 1, 10, new BABYLON.Vector3(0, 0, 0), scene);
        camera.attachControl(canvas, true);

        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 0.7;



        return scene;
    }
}

export function CreatePlaygroundScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
    return Playground.CreateScene(engine, canvas);
}
