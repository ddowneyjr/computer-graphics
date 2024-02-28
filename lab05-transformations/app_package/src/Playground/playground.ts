import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

class Playground {
    public static CreateScene(
        engine: BABYLON.Engine,
        canvas: HTMLCanvasElement
    ): BABYLON.Scene {
        var scene = new BABYLON.Scene(engine);

        // make a ArcRotateCamera, often a little easier to navigate the scene with this. It rotates around the cameraTarget.
        const horizontalAngle = -Math.PI / 2; // initial horizontal camera angle
        const verticalAngle = Math.PI / 2; // initial vertical camera angle
        const distance = 20; // initial camera distance
        // @ts-ignore
        const cameraTarget = new BABYLON.Vector3.Zero();
        const camera = new BABYLON.ArcRotateCamera(
            "camera",
            horizontalAngle,
            verticalAngle,
            distance,
            cameraTarget,
            scene
        );
        camera.attachControl(canvas, true);

        // light source only for ground (our shader does not process light)
        const light = new BABYLON.HemisphericLight(
            "light",
            new BABYLON.Vector3(0, 1, 0),
            scene
        );
        light.intensity = 0.7;

        const box = BABYLON.MeshBuilder.CreateBox("box", { size: 5 }, scene);
        const childBox = BABYLON.MeshBuilder.CreateBox("childBox", { size: 2 }, scene);
        
        // ground for spacial reference
        const ground = BABYLON.MeshBuilder.CreateGround(
            "ground",
            { width: 10, height: 10 },
            scene
        );

        ground.material = new BABYLON.StandardMaterial("groundMat", scene);
        ground.material.backFaceCulling = false;

        const vertex_shader = `
        attribute vec3 position;
        uniform mat4 myWorld;
        uniform mat4 world;
        uniform mat4 view;
        uniform mat4 projection;
        uniform float time;
        varying mat4 woldPosition;
                
        void main() {
            vec4 localPosition = vec4(position, 1.);
            vec4 worldPosition = myWorld * localPosition;     
            vec4 viewPosition  = view * worldPosition;
            vec4 clipPosition  = projection * viewPosition;
            gl_Position = clipPosition;
        }
    `;

        const fragment_shader = `
        uniform vec3 color;
        // simply assign solid color
        void main() {
            gl_FragColor = vec4(color,1);
        }
    `;

        // make custom ShaderMaterial for your shader code
        const boxMaterial = new BABYLON.ShaderMaterial(
            "myMaterial",
            scene,
            {
                vertexSource: vertex_shader,
                fragmentSource: fragment_shader,
            },
            {
                attributes: ["position"], // position is BabylonJS build-in
                uniforms: ["myWorld", "world", "view", "projection", "color", "time"], // view, projection are BabylonJS build-in
            }
        );

        const childBoxMaterial = new BABYLON.ShaderMaterial(
            "childMaterial",
            scene,
            {
                vertexSource: vertex_shader,
                fragmentSource: fragment_shader,
            },
            {
                attributes: ["position"], // position is BabylonJS build-in
                uniforms: ["myWorld", "world", "view", "projection", "color", "time"], // view, projection are BabylonJS build-in
            }
        );

        box.material = boxMaterial;
        childBox.material = childBoxMaterial;

        // assign color uniform
        const boxColor = BABYLON.Vector3.FromArray([
            100 / 255,
            180 / 255,
            220 / 255,
        ]); // green
        boxMaterial.setVector3("color", boxColor);
        childBoxMaterial.setVector3("color", BABYLON.Vector3.FromArray([1, 0, 0]));

        // assign custom myWorld uniform

        // Translation Matrices

        // const boxWorldMatrix = boxTranslationMatrix;
        // const boxWorldMatrix = boxScaleMatrix;

        function update() {
            // get current time in seconds
            // let time = performance.now() / 1000;
            const time = 1
            boxMaterial.setFloat("time", time);

            const boxTranslationMatrixArray = makeTranslationMatrix(0 + 5 * Math.sin(time), 3, 0);
            const boxTranslationMatrix = BABYLON.Matrix.FromArray(
                boxTranslationMatrixArray
            );

            // Scaling Matrices
            const boxScaleMatrixArray = makeScaleMatrix(0.5 + Math.sin(time), 0.5 - Math.cos(time), 0.5);
            const boxScaleMatrix = BABYLON.Matrix.FromArray(boxScaleMatrixArray);

            // Rotation Matrices
            const boxRotateXMatrixArray = makeRotateXMatrix(30 + (0.1 * time));
            const boxRotateXMatrix = BABYLON.Matrix.FromArray(
                boxRotateXMatrixArray
            );

            const boxRotateYMatrixArray = makeRotateYMatrix(30 - (0.1 * time));
            const boxRotateYMatrix = BABYLON.Matrix.FromArray(
                boxRotateYMatrixArray
            );

            const boxRotateZMatrixArray = makeRotateZMatrix(3 * time);
            const boxRotateZMatrix = BABYLON.Matrix.FromArray(
                boxRotateZMatrixArray
            );

            let boxCombinationMatrix = composeWorldMatrix(
                boxScaleMatrix,
                boxRotateXMatrix,
                boxRotateYMatrix,
                boxRotateZMatrix,
                boxTranslationMatrix
            );

            boxMaterial.setMatrix("myWorld", boxCombinationMatrix);

            const childTranslationMatrixArray = makeTranslationMatrix(0, 0, 0);
            const childTranslationMatrix = BABYLON.Matrix.FromArray(childTranslationMatrixArray);
            const childScaleMatrixArray = makeScaleMatrix(1, 1, 1);
            const childScaleMatrix = BABYLON.Matrix.FromArray(childScaleMatrixArray);
            const childRorationXMartixArray = makeRotateXMatrix(0);
            const childRorationXMartix = BABYLON.Matrix.FromArray(childRorationXMartixArray);
            const childRorationYMartixArray = makeRotateYMatrix(0);
            const childRorationYMartix = BABYLON.Matrix.FromArray(childRorationYMartixArray);
            const childRorationZMartixArray = makeRotateZMatrix(0);
            const childRorationZMartix = BABYLON.Matrix.FromArray(childRorationZMartixArray);

            let childCombinationMatrix = composeWorldMatrix(
                childScaleMatrix,
                childRorationXMartix,
                childRorationYMartix,
                childRorationZMartix,
                childTranslationMatrix
            );

            childBoxMaterial.setMatrix("myWorld", applyParentMatrix(boxCombinationMatrix, childCombinationMatrix));
        }

        scene.registerBeforeRender(update);

        function makeTranslationMatrix(x: number, y: number, z: number) {
            var translationMatrix = [
                1,
                0,
                0,
                0, // <- i
                0,
                1,
                0,
                0, // <- j
                0,
                0,
                1,
                0, // <- k
                x,
                y,
                z,
                1, // <- t
            ];
            return translationMatrix;
        }

        function makeScaleMatrix(x: number, y: number, z: number) {
            var scaleMatrix = [
                x,
                0,
                0,
                0, // <- i
                0,
                y,
                0,
                0, // <- j
                0,
                0,
                z,
                0, // <- k
                0,
                0,
                0,
                1,
            ];
            return scaleMatrix;
        }

        function makeRotateXMatrix(a: number) {
            var rotateMatrix = [
                1,
                0,
                0,
                0, // <- i
                0,
                Math.cos(a),
                -Math.sin(a),
                0, // <- j
                0,
                Math.sin(a),
                Math.cos(a),
                0, // <- k
                0,
                0,
                0,
                1,
            ];
            return rotateMatrix;
        }

        function makeRotateYMatrix(a: number) {
            var rotateMatrix = [
                Math.cos(a),
                0,
                Math.sin(a),
                0, // <- i
                0,
                1,
                0,
                0, // <- j
                -Math.sin(a),
                0,
                Math.cos(a),
                0, // <- k
                0,
                0,
                0,
                1,
            ];
            return rotateMatrix;
        }

        function makeRotateZMatrix(a: number) {
            var rotateMatrix = [
                Math.cos(a),
                -Math.sin(a),
                0,
                0, // <- i
                Math.sin(a),
                Math.cos(a),
                0,
                0, // <- j
                0,
                0,
                1,
                0, // <- k
                0,
                0,
                0,
                1,
            ];
            return rotateMatrix;
        }

        function composeWorldMatrix(
            scaling: BABYLON.Matrix,
            rotationX: BABYLON.Matrix,
            rotationY: BABYLON.Matrix,
            rotationZ: BABYLON.Matrix,
            translate: BABYLON.Matrix
        ) {
            let worldMatrix = rotationY.multiply(translate);
            worldMatrix = rotationX.multiply(worldMatrix);
            worldMatrix = rotationZ.multiply(worldMatrix);
            worldMatrix = scaling.multiply(worldMatrix);
            return worldMatrix;
        }

        function applyParentMatrix(child: BABYLON.Matrix, parent: BABYLON.Matrix) {
            return parent.multiply(child);
        }


        return scene;
    }
}

export function CreatePlaygroundScene(
    engine: BABYLON.Engine,
    canvas: HTMLCanvasElement
): BABYLON.Scene {
    return Playground.CreateScene(engine, canvas);
}
