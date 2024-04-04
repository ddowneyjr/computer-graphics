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
    var scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI/2, 1, 10, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);
    var reflectionTexture = new BABYLON.CubeTexture("./assets/skybox", scene);


    // sphere mesh for use with our shader
    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 1}, scene);
    sphere.position.y = 1;

    // let skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size: 4, sideOrientation: BABYLON.Mesh.BACKSIDE}, scene);
    // skyboxMaj

    var vertex_shader = `
        attribute vec3 position;
        attribute vec3 normal;
 
        uniform mat4 world;
        uniform mat4 view;
        uniform mat4 projection;

        varying vec3 worldNormal;
        varying vec3 vWorldPosition;
                
        void main() {
            vec4 localPosition = vec4(position, 1.);
            vec4 worldPosition = world * localPosition;     
            vec4 viewPosition  = view * worldPosition;
            vec4 clipPosition  = projection * viewPosition;

            worldNormal = mat3(world) * normal;
            vWorldPosition = worldPosition.xyz;

            gl_Position = clipPosition;
        }
    `;

    var fragment_shader = `
        varying vec3 worldNormal;
        uniform vec3 viewPosition;
        uniform samplerCube reflectionTexture;
        
        varying vec3 vWorldPosition;

        void main() {
            vec3 viewDirection = normalize(vWorldPosition - viewPosition);
            vec3 reflectionDir = reflect(viewDirection, worldNormal);
            vec3 reflectionColor = textureCube(reflectionTexture, reflectionDir).rgb;
            gl_FragColor = vec4(reflectionColor, 1);
        }
    `;

    var shaderMaterial = new BABYLON.ShaderMaterial('myMaterial', scene, { 
        vertexSource: vertex_shader, 
        fragmentSource: fragment_shader
    },
    {
        attributes: ["position", "normal"], 
        uniforms: ["world", "view", "projection", "viewPosition"],
        samplers: ["reflectionTexture"]
    });
   
    sphere.material = shaderMaterial;
    shaderMaterial.setTexture("reflectionTexture", reflectionTexture);

    var update = function() {
        shaderMaterial.setVector3("viewPosition", camera.position);
    }

    scene.registerBeforeRender(update);

    return scene;
};
