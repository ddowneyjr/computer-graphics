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

    // sphere mesh for use with our shader

    // load a glb model
    // set the flags to false to avoid BabylonJS from changing the model's coordinate system
    LOADERS.GLTFFileLoader.IncrementalLoading = false;
    LOADERS.GLTFFileLoader.HomogeneousCoordinates = false;

    // sphere mesh to see how BabylonJS renders light
    const controlSphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2}); 
    controlSphere.position.y = 1;
    controlSphere.position.x = -1.5;
    controlSphere.material = new BABYLON.StandardMaterial("control material", scene);
    (controlSphere.material as BABYLON.StandardMaterial).diffuseColor = BABYLON.Color3.Red();

    const vertex_shader = `
        attribute vec3 position;
        attribute vec3 normal;
        uniform mat4 world;
        uniform mat4 view;
        uniform mat4 projection;
        uniform mat3 inverseTranspose;

        varying vec3 worldNormal;
        varying vec3 worldPos;
                
        void main() {
            vec4 localPosition = vec4(position, 1.);
            vec4 worldPosition = world * localPosition;     
            vec4 viewPosition  = view * worldPosition;
            vec4 clipPosition  = projection * viewPosition;

            worldPos = worldPosition.xyz;

            // transform normal to world space, so light direction 
            // and normal are in the same space.
            worldNormal = inverseTranspose * normal;

            gl_Position = clipPosition;
        }
    `;

    const lambertian = `
        uniform vec3 surfaceColor;
        uniform vec3 lightDirection;
        uniform float lightIntensity;
        uniform vec3 lightColor;
        uniform vec3 ambientLightColor;
        uniform float ambientIntensity;

        varying vec3 worldNormal;

        void main() {
            vec3 normalizedLightDirection = normalize(lightDirection);
            vec3 normalizedNormal = normalize(worldNormal);

            vec3 pixelColor = vec3(1,0,0);
            float d = dot(normalizedNormal, -normalizedLightDirection);
            pixelColor = surfaceColor * lightIntensity * d;
            pixelColor = pixelColor * lightColor;
            pixelColor = pixelColor + (ambientLightColor * ambientIntensity);
            gl_FragColor = vec4(pixelColor,1);
        }
    `;

    const blinn = `
        uniform vec3 surfaceColor;
        uniform vec3 lightDirection;
        uniform float lightIntensity;
        uniform vec3 lightColor;
        uniform vec3 ambientLightColor;
        uniform float ambientIntensity;
        uniform vec3 specularColor;
        uniform float specularIntensity;
        uniform vec3 viewPosition;

        varying vec3 worldNormal;
        varying vec3 worldPos;

        void main() {

            // l
            vec3 normalizedLightDirection = normalize(lightDirection);
            
            // n
            vec3 normalizedNormal = normalize(worldNormal);

            // v
            vec3 normalizedViewDirection = normalize(viewPosition);

            // h
            vec3 normalizedhalfVector = normalize(normalizedViewDirection - normalizedLightDirection);

            float cosTheta = dot(normalizedNormal, -normalizedLightDirection);
            float cosRho = max(0.0, dot(normalizedNormal, normalizedhalfVector));


            vec3 specularTerm = (pow(cosRho, specularIntensity)) * specularColor;
            
            vec3 diffuseTerm = lightIntensity * lightColor * surfaceColor * cosTheta;
            vec3 ambientTerm = ambientIntensity * ambientLightColor;
            
            vec3 pixelColor;

            if (cosTheta > 0.0) {
                pixelColor = diffuseTerm + specularTerm + ambientTerm;
            }
            else {
                pixelColor = ambientTerm;
            }
            gl_FragColor = vec4(pixelColor, 1);
        }

    `;

    const shaderMaterial = new BABYLON.ShaderMaterial('myMaterial', scene, { 
        // assign source code for vertex and fragment shader (string)
        vertexSource: vertex_shader, 
        fragmentSource: blinn 
    },
    {
        // assign shader inputs
        attributes: ["position", "normal"], // position and normal are BabylonJS build-in
        uniforms: ["world", "view", "projection", // world, view, projection are BabylonJS build-in
                    "inverseTranspose", "surfaceColor", 
                    "lightDirection", "lightIntensity", "lightColor", "ambientLightColor", "ambientIntensity"] 
    });

    const suzanneMaterial = new BABYLON.ShaderMaterial('suzanneMaterial', scene, {
        vertexSource: vertex_shader,
        fragmentSource: blinn
    },
    {
        attributes: ["position", "normal"],
        uniforms: ["world", "view", "projection",
                    "inverseTranspose", "surfaceColor",
                    "lightDirection", "lightIntensity", "lightColor", "ambientLightColor", "ambientIntensity",
                    "specularColor", "specularIntensity", "viewPosition"]
    });

    const surfaceColor = hexToVec3("#892bb6");
    const lightColor = hexToVec3("#f4f39d");
    const ambientIntensity = 0.05;
    const ambientLightColor = hexToVec3("#ffffff");
    const specularColor = hexToVec3("#ffffff");
    

    let sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2});
    sphere.position.y = 1;
    sphere.position.x = 1.5;
    sphere.material = shaderMaterial;

    const mesh = BABYLON.SceneLoader.ImportMesh("", "./assets/", "suzanne.glb", scene, (newMeshes) => {
        console.log("newMeshes", newMeshes);
        newMeshes.forEach((mesh) => {
            console.log("mesh", mesh);
            mesh.position = new BABYLON.Vector3(0, 1, 0);
            mesh.rotation = new BABYLON.Vector3(0, Math.PI, 0);
            mesh.registerAfterWorldMatrixUpdate(() => {
                mesh.material = suzanneMaterial;
                let world4x4 = mesh.getWorldMatrix();
                let normalMatrix4x4 = new BABYLON.Matrix();
                world4x4.toNormalMatrix(normalMatrix4x4);
                let inverseTranspose3x3 = BABYLON.Matrix.GetAsMatrix3x3(normalMatrix4x4);
                suzanneMaterial.setMatrix3x3("inverseTranspose", inverseTranspose3x3);
            })
        });
    });

    function update(): void {
        let world4x4 = sphere.getWorldMatrix();
        let normalMatrix4x4 = new BABYLON.Matrix();
        world4x4.toNormalMatrix(normalMatrix4x4);
        let inverseTranspose3x3 = BABYLON.Matrix.GetAsMatrix3x3(normalMatrix4x4);
        shaderMaterial.setMatrix3x3("inverseTranspose", inverseTranspose3x3);
        shaderMaterial.setVector3("surfaceColor", surfaceColor);
        shaderMaterial.setVector3("lightDirection", lightDirection);
        shaderMaterial.setFloat("lightIntensity", light.intensity);
        shaderMaterial.setVector3("lightColor", lightColor);
        shaderMaterial.setVector3("ambientLightColor", ambientLightColor);
        shaderMaterial.setFloat("ambientIntensity", ambientIntensity);
        shaderMaterial.setVector3("viewPosition", camera.position);
        shaderMaterial.setVector3("specularColor", specularColor);
        shaderMaterial.setFloat("specularIntensity", 50);

                suzanneMaterial.setVector3("surfaceColor", surfaceColor);
        suzanneMaterial.setVector3("lightDirection", lightDirection);
        suzanneMaterial.setFloat("lightIntensity", light.intensity);
        suzanneMaterial.setVector3("lightColor", lightColor);
        suzanneMaterial.setVector3("ambientLightColor", ambientLightColor);
        suzanneMaterial.setFloat("ambientIntensity", ambientIntensity);
        suzanneMaterial.setVector3("viewPosition", camera.position);
        suzanneMaterial.setVector3("specularColor", specularColor);
        suzanneMaterial.setFloat("specularIntensity", 50);
    }
    scene.registerBeforeRender(update);

    return scene;
}

function hexToVec3(hex: string): BABYLON.Vector3 {
    return BABYLON.Vector3.FromArray(BABYLON.Color3.FromHexString(hex).toLinearSpace().asArray());
}
