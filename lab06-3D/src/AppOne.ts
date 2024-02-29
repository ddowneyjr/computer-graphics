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

    // 'ground' mesh for reference.
    // var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 6, height: 6}, scene);

    // box mesh for use with our shader
    var box = BABYLON.MeshBuilder.CreateBox("box", {size: 2});
    
    // ` ` these quatioan marks allow a multi-line string in Javascript (" " or ' ' is single line)
    var vertex_shader = `
        attribute vec3 position;
        uniform mat4 myWorld;
        uniform mat4 myView;
        uniform mat4 myProjection;
                
        void main() {
            vec4 localPosition = vec4(position, 1.);
            vec4 worldPosition = myWorld * localPosition;     
            vec4 viewPosition  = myView * worldPosition;
            vec4 clipPosition  = myProjection * viewPosition;
            gl_Position = clipPosition;
        }
    `;

    var fragment_shader = `
        uniform vec3 color;

        void main() {
            gl_FragColor = vec4(color,1);
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
        // define custom world matrix myWorld
        uniforms: ["myWorld", "myView", "myProjection", "color"], // view, projection are BabylonJS build-in
    });
    var boxColor = BABYLON.Vector3.FromArray([1,0,0]) // red
    shaderMaterial.setVector3("color", boxColor); // assign color uniform value
    
    box.material = shaderMaterial;
    
    // Remember BabylonJS uses Column Major matrices
    function makeTranslationMatrix(x: number, y: number, z: number){
        var translationMatrix = 
        [1, 0, 0, 0 ,   // <- i
         0, 1, 0, 0 ,   // <- j
         0, 0, 1, 0 ,   // <- k
         x, y, z, 1 ,   // <- t
        ];
        return translationMatrix;
    }

    function makeRotationMatrixX(angle: number){
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        var rotationMatrixX = 
        [1, 0,   0,   0,   // <- i
         0, cos, sin, 0,   // <- j
         0,-sin, cos, 0,   // <- k
         0, 0,   0,   1,   // <- t
        ];
        return rotationMatrixX;
    }

    function makeRotationMatrixY(angle: number){
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        var rotationMatrixY = 
        [cos, 0, -sin, 0,   // <- i
         0,   1, 0,    0,   // <- j
         sin, 0, cos,  0,   // <- k
         0,   0, 0,    1,   // <- t
        ];
        return rotationMatrixY;
    }

    function makeRotationMatrixZ(angle: number){
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        var rotationMatrixZ = 
        [cos,  sin, 0, 0,   // <- i
         -sin, cos, 0, 0,   // <- j
         0,    0,   1, 0,   // <- k
         0,    0,   0, 1,   // <- t
        ];
        return rotationMatrixZ;
    }

    function makeScaleMatrix(x: number, y: number, z: number){
        var scaleMatrix = 
        [x, 0, 0, 0,   // <- i
         0, y, 0, 0,   // <- j
         0, 0, z, 0,   // <- k
         0, 0, 0, 1,   // <- t
        ];
        return scaleMatrix;
    }

    function makeWorldMatrix(scaling: BABYLON.Vector3, rotation: BABYLON.Vector3, translation: BABYLON.Vector3){
        const translationMatrix = BABYLON.Matrix.FromArray(makeTranslationMatrix(translation.x,translation.y,translation.z));
        const rotationMatrixX = BABYLON.Matrix.FromArray(makeRotationMatrixX(rotation.x));
        const rotationMatrixY = BABYLON.Matrix.FromArray(makeRotationMatrixY(rotation.y));
        const rotationMatrixZ = BABYLON.Matrix.FromArray(makeRotationMatrixZ(rotation.z));
        const scaleMatrix = BABYLON.Matrix.FromArray(makeScaleMatrix(scaling.x,scaling.y,scaling.z));
        
        let world = scaleMatrix.multiply(rotationMatrixZ);
        world = world.multiply(rotationMatrixX);
        world = world.multiply(rotationMatrixY);
        world = world.multiply(translationMatrix);
        return world;
    }

    const scaling = new BABYLON.Vector3(1,1,1);
    const rotation = new BABYLON.Vector3(0,0,0);
    const translation = new BABYLON.Vector3(0,1,0);

    let world = makeWorldMatrix(scaling, rotation, translation);
    shaderMaterial.setMatrix("myWorld", world);
    shaderMaterial.setMatrix("myProjection", BABYLON.Matrix.PerspectiveFovLH(Math.PI/4, 1.3, 1, 1000));

    let cameraX = 0;
    let cameraY = 0;
    let cameraZ = -15;
    function cameraStuff() {
        let cameraMatrix = BABYLON.Matrix.FromArray(makeTranslationMatrix(cameraX, cameraY, cameraZ));
        let view = cameraMatrix.invert();
        shaderMaterial.setMatrix("myView", view);
    }
    cameraStuff();

    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
            case BABYLON.KeyboardEventTypes.KEYDOWN:
                switch (kbInfo.event.key) {
                    case "ArrowUp":
                        console.log("ArrowUp");
                        cameraZ += 0.3;
                        cameraStuff();
                        break;
                    case "ArrowDown":
                        cameraZ -= 0.3;
                        cameraStuff();
                        break;
                    case "ArrowLeft":
                        cameraX -= 0.3;
                        cameraStuff();
                        break;
                    case "ArrowRight":
                        cameraX += 0.3;
                        cameraStuff();
                        break;
                }
                break;
            case BABYLON.KeyboardEventTypes.KEYUP:
            break;
        }
    });
    return scene;
   };
