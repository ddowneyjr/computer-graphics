import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

class Playground {
    public static CreateScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
        var scene = new BABYLON.Scene(engine);

        const camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI/2, 1, 10, new BABYLON.Vector3(0, 0, 0), scene);
        camera.attachControl(canvas, true);

        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 0.7;

        const vertex_shader = `
            precision highp float;
            attribute vec3 position;
            uniform mat4 myWorld;
            uniform mat4 world;
            unifrorm mat4 view;
            uniform mat4 projection;

            void main() {
                vec4 localPosition = vec4(position, 1.);
                vec4 worldPosition = myWorld * localPosition;
                vec4 viewPosition = view * worldPosition;
                vec4 clipPosition = projection * viewPosition;
                gl_Position = clipPosition;
            }
        `;

        const fragment_shader = `
            uniform vec3 color;
            void main() {
                gl_FragColor = vec4(color,1);
            }
        `;

        const shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, {
            vertex: "vertex_shader",
            fragment: "fragment_shader",
        },
        {
            attributes: ["position"],
            uniforms: ["world", "view", "projection", "myWorld", "color"]
        });

        let lightBlue = BABYLON.Vector3.FromArray([100.0/255.0, 180.0/255.0, 220.0/255.0]);
        shaderMaterial.setVector3("color", lightBlue);

        const box = BABYLON.MeshBuilder.CreateBox("box", {size: 2}, scene);
        box.material = shaderMaterial;
        
        const boxTranslationMatrix = BABYLON.Matrix.FromArray(makeTranslationMatrix(0, 0, 0));
        const boxWorldMatrix = boxTranslationMatrix;
        // box.setMatrix

        function makeTranslationMatrix(x: number, y: number, z: number): number[] {
            const translationMatrix = 
                [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                x, y, z, 1
            ];
            return translationMatrix;
        }

        function update() {
            const time = performance.now() / 1000;
        }
        scene.registerBeforeRender(update);

        return scene;
    }

}

export function CreatePlaygroundScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
    return Playground.CreateScene(engine, canvas);
}
