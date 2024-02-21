import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

class Playground {
    public static CreateScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
        var scene = new BABYLON.Scene(engine);

        const camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI/2, 1, 10, new BABYLON.Vector3(0, 0, 0), scene);
        camera.attachControl(canvas, true);

        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 0.7;

        let rightGround = BABYLON.MeshBuilder.CreateGround("rightGround", {width: 6, height: 6, subdivisions: 500}, scene);
        let leftGround = BABYLON.MeshBuilder.CreateGround("leftGround", {width: 6, height: 6, subdivisions: 500}, scene);
        leftGround.position.x = -4;
        rightGround.position.x = 4;
        

        let lightBlue = BABYLON.Vector3.FromArray([100.0/255.0, 180.0/255.0, 220.0/255.0]);
        let avocado = BABYLON.Vector3.FromArray([118.0/255.0, 148.0/255.0, 86.0/255.0]);


        var normalVertex = `
        attribute vec3 position;
        uniform mat4 worldViewProjection;
        varying vec3 v_position;
        void main() {
            v_position = position;
            gl_Position = worldViewProjection * vec4(position, 1.0);
        }
        `;

        var solidColorFragment= `
        uniform vec3 color;

        void main() {
            gl_FragColor = vec4(color, 1.0);

        }
        `;

        var crazyVertex= `
        attribute vec3 position;
        uniform mat4 worldViewProjection;

        varying vec3 v_position;

        void main() {
            v_position = position;
            vec4 p = vec4(position, 1.0);
            gl_Position = worldViewProjection * p;
            gl_Position.y = gl_Position.y + sin(gl_Position.x + gl_Position.z);
            gl_Position.x = gl_Position.x - cos(gl_Position.y + gl_Position.z);
            gl_Position.z = gl_Position.z + sin(gl_Position.x + gl_Position.y);
        }
        `;

        var vertexWave = `
            precision highp float;
            attribute vec3 position;
            uniform mat4 worldViewProjection;
            uniform float time;
            float frequency = 1.3; 
            float frequency2 = 0.8;
            float amp = 3.2;
            float amp2 = 3.7;

        
            void main() {
                vec4 p = vec4(position, 1.);
                p.y += sin(p.x*amp + time * frequency);
                p.z += cos(p.y*amp2 + time * frequency2);
                gl_Position = worldViewProjection * p;
            }
        `;

        var waveFragment = `
            uniform vec3 color;
            varying vec3 v_position;
            void main() {
                gl_FragColor = vec4(v_position,1);
            }
        `;

        var spiralFragment = `
        precision highp float;
        uniform float time;
        varying vec3 v_position;
        void main() {
            vec3 color = vec3(0.5 * v_position.x + 0.5 * sin(time), 0.5 * v_position.y + 0.5 * cos(time), 0.5 * v_position.z + 0.5 * sin(time));
            gl_FragColor = vec4(color, 1.0);
        }

        `;
        
        var vertexIDShader = `
        attribute vec3 position;
        uniform mat4 worldViewProjection;

        varying vec3 v_position;

        void main() {
            v_position = position;
            vec4 p = vec4(position, 1.0);
            gl_Position = worldViewProjection * p;
            gl_Position.y = gl_Position.y + sin(gl_Position.x * float(gl_VertexID));
            gl_Position.x = gl_Position.x - cos(gl_Position.y / float(gl_VertexID));
            gl_Position.z = gl_Position.z + sin(gl_Position.x + float(gl_VertexID));
        }
        `;

        let varyingTest = new BABYLON.ShaderMaterial("varyingTest", scene, {
            vertexSource: vertexIDShader,
            fragmentSource: spiralFragment,
        },
        {
            attributes: ["position"],
            uniforms: ["worldViewProjection", "color"]
        });

        let greenBoring = new BABYLON.ShaderMaterial('boringMaterial', scene, { 
            vertexSource: normalVertex,
            fragmentSource: solidColorFragment
        },
        {
            attributes: ["position"],
            uniforms: ["worldViewProjection", "color"]
        });

        let blueBoring = new BABYLON.ShaderMaterial("boringMaterial", scene, {
            vertexSource: normalVertex,
            fragmentSource: solidColorFragment
        },
        {
            attributes: ["position"],
            uniforms: ["worldViewProjection", "color"]
        });

        let blueWave = new BABYLON.ShaderMaterial("waveMaterial", scene, {
            vertexSource: vertexWave,
            fragmentSource: solidColorFragment 
        },
        {
            attributes: ["position"],
            uniforms: ["worldViewProjection", "time", "color"]
        });

        let greenCrazy = new BABYLON.ShaderMaterial("crazyMaterial", scene, {
            vertexSource: crazyVertex,
            fragmentSource: spiralFragment 
        },
        {
            attributes: ["position"],
            uniforms: ["worldViewProjection", "time"]
        });

        blueBoring.setVector3("color", lightBlue);
        greenBoring.setVector3("color", avocado);
        blueWave.setVector3("color", lightBlue);
        blueWave.backFaceCulling = false;
        greenCrazy.setVector3("color", avocado);
        greenCrazy.backFaceCulling = false;
        varyingTest.setVector3("color", lightBlue);


        leftGround.material = blueWave;
        rightGround.material = varyingTest;

        function update() {
            blueWave.setFloat("time", performance.now() / 1000);
            greenCrazy.setFloat("time", performance.now() / 1000);
            varyingTest.setFloat("time", performance.now() / 1000);

        }
        scene.registerBeforeRender(update);

        return scene;
    }
}

export function CreatePlaygroundScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
    return Playground.CreateScene(engine, canvas);
}
