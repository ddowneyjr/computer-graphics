import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

class Playground {
    public static CreateScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
        // This creates a basic Babylon Scene object (non-mesh)
        var scene = new BABYLON.Scene(engine);

        // This creates and positions a free camera (non-mesh)
        var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

        // This targets the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        

        // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
        var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);


        var box = BABYLON.MeshBuilder.CreateBox("box", {size: 2});
    box.position.y = 1;

    // ` ` these quatioan marks allow a multi-line string in Javascript (" " or ' ' is single line)
    var vertex_shader = `
        attribute vec3 position;
        uniform mat4 worldViewProjection;
        
        void main() {
            vec4 p = vec4(position, 1.);
            gl_Position = worldViewProjection * p;
        }
    `;

    var fragment_shader = `
        uniform vec3 color;

        void main() {
            gl_FragColor = vec4(1,1,0,1); // yellow
        }
    `;

    var shaderMaterial = new BABYLON.ShaderMaterial('myMaterial', scene, { 
        // assign source code for vertex and fragment shader (string)
        vertexSource: vertex_shader, 
        fragmentSource: fragment_shader
    },
    {
        // assign shader inputs
        attributes: ["position"], // position is BabylonJS build-in
        uniforms: ["worldViewProjection"], // worldViewProjection is BabylonJS build-in
    });
    
    box.material = shaderMaterial;

        return scene;
    }
}

export function CreatePlaygroundScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
    return Playground.CreateScene(engine, canvas);
}
