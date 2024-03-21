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

    LOADERS.GLTFFileLoader.IncrementalLoading = false;
    LOADERS.GLTFFileLoader.HomogeneousCoordinates = false;

    const texture = new BABYLON.Texture("https://www.babylonjs.com/assets/wood.jpg", scene);

    const box = BABYLON.MeshBuilder.CreateBox("box", {size: 1}, scene);
    box.position.y = 1.0;
    box.position.x = 1.5;


    var vertex_shader = `
        attribute vec3 position;

        attribute vec2 uv;
        varying vec2 vUv;

        uniform mat4 world;
        uniform mat4 view;
        uniform mat4 projection;
        uniform mat3 inverseTranspose;

        void main() {
            vUv = uv;
            vec4 localPosition = vec4(position, 1.);
            vec4 worldPosition = world * localPosition;
            vec4 viewPosition  = view * worldPosition;
            vec4 clipPosition  = projection * viewPosition;

            gl_Position = clipPosition;
        }
    `;

    var fragment_shader = `
        varying vec2 vUv;

        uniform sampler2D mainTexture;

        void main() {
            // gl_FragColor = vec4(vUv, 0.0, 1.0);
            vec4 color = texture2D(mainTexture, vUv);
            gl_FragColor = color;
        }
    `;

    var shaderMaterial = new BABYLON.ShaderMaterial('myMaterial', scene, {
        // assign source code for vertex and fragment shader (string)
        vertexSource: vertex_shader,
        fragmentSource: fragment_shader
    },
    {
        // assign shader inputs
        attributes: ["position", "uv"], // position and uv are BabylonJS build-in
        uniforms: ["world", "view", "projection"], // world, view, projection are BabylonJS build-in
        samplers: ["mainTexture"]
    });

    box.material = shaderMaterial;
    shaderMaterial.setTexture("mainTexture", texture);

    let pyramid = createPyramid();
    pyramid.position.y = 1.0;
    pyramid.position.x = -1;
    pyramid.position.z = 0;
    pyramid.material = shaderMaterial;
    pyramid.material.backFaceCulling = false;


    var fishMaterial = new BABYLON.ShaderMaterial('myMaterial', scene, {
        // assign source code for vertex and fragment shader (string)
        vertexSource: vertex_shader,
        fragmentSource: fragment_shader
    },
    {
        // assign shader inputs
        attributes: ["position", "uv"], // position and uv are BabylonJS build-in
        uniforms: ["world", "view", "projection"], // world, view, projection are BabylonJS build-in
        samplers: ["mainTexture"]
    });

    let fishTexture = new BABYLON.Texture("./assets/fishtexture.png", scene, false, false);
    fishMaterial.setTexture("mainTexture", fishTexture);

    // load the fish
    const mesh = BABYLON.SceneLoader.ImportMesh("", "./assets/", "fish.glb", scene, (meshes) => {
        meshes.forEach((mesh) => {
            mesh.position.y = 2;
            mesh.position.x = -1.5;
            mesh.material = fishMaterial;
            mesh.material.backFaceCulling = false;
            mesh.material.alphaMode = BABYLON.Engine.ALPHA_DISABLE;
        })
    });

    return scene;
}

function hexToVec3(hex: string): BABYLON.Vector3 {
    return BABYLON.Vector3.FromArray(BABYLON.Color3.FromHexString(hex).toLinearSpace().asArray());
}

function createPyramid() :BABYLON.Mesh {
    const pyramid = new BABYLON.Mesh("pyramid");
    const vertexData = new BABYLON.VertexData();

    const positions = [
        0, 1, 0, // vertex 0
        1, 0, 1, // vertex 1
        1, 0, -1, // vertex 2
        -1, 0, -1, // vertex 3
        -1, 0, 1, // vertex 4
    ];

    const indices = [
        0, 1, 2,
        0, 2, 3,
        0, 3, 4,
        0, 4, 1,
        1, 3, 2,
        1, 4, 3,
    ];

    //calculate uv
    const uvs = [
        0.5, 0,
        0, 1,
        1, 1,
        1, 0,
        1, 1,
    ];
    vertexData.uvs = uvs;

    vertexData.positions = positions;
    vertexData.indices = indices;

    vertexData.applyToMesh(pyramid);

    return pyramid;
}
