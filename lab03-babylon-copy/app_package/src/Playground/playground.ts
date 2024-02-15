import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

class Playground {
    public static CreateScene(
        engine: BABYLON.Engine,
        canvas: HTMLCanvasElement
    ): BABYLON.Scene {
        const scene = new BABYLON.Scene(engine);

        /**** Set camera and light *****/
        const camera = new BABYLON.ArcRotateCamera(
            "camera",
            -Math.PI / 2,
            Math.PI / 2.5,
            10,
            new BABYLON.Vector3(0, 0, 0),
            scene
        );
        camera.attachControl(canvas, true);
        const light = new BABYLON.HemisphericLight(
            "light",
            new BABYLON.Vector3(1, 1, 0),
            scene
        );

        // <!-- create a custom mesh with an array of vertices -->

        const circleMesh: BABYLON.Mesh = this.buildCircle(10, 8, scene);

        const ground: BABYLON.Mesh = this.buildGround(scene);
        const snowman: BABYLON.Mesh = this.buildSnowman(scene);
        const house: BABYLON.Mesh = this.buildHouse(2, 3, scene);
        return scene;
    }

    public static buildCircle(
        count: number,
        radius: number,
        scene: BABYLON.Scene
    ): BABYLON.Mesh {
        let customMesh = new BABYLON.Mesh("custom", scene);
        let positions = [];
        let indices = [];
        positions.push(0, 0, 0);
        for (let i = 0; i < count; i++) {
            let angle = ((Math.PI * 2) / count) * i;
            positions.push(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                1
            );
            if (i > 0) {
                indices.push(0, i, i + 1);
            }
        }
        indices.push(0, count, 1);
        let vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.applyToMesh(customMesh);

        // <!-- add material to custommesh -->
        let customMaterial = new BABYLON.StandardMaterial(
            "customMaterial",
            scene
        );
        customMaterial.diffuseTexture = new BABYLON.Texture(
            "https://www.babylonjs-playground.com/textures/normalMap.jpg",
            scene
        );
        customMesh.material = customMaterial;

        return customMesh;
    }

    public static buildSnowman(scene: BABYLON.Scene): BABYLON.Mesh {
        // <!-- build me a snowman out of three spheres -->
        const sphere1 = BABYLON.MeshBuilder.CreateSphere(
            "sphere1",
            { diameter: 3 },
            scene
        );
        sphere1.position.y = 1.5;
        const sphere2 = BABYLON.MeshBuilder.CreateSphere(
            "sphere2",
            { diameter: 2 },
            scene
        );
        sphere2.position.y = 3.5;
        const sphere3 = BABYLON.MeshBuilder.CreateSphere(
            "sphere3",
            { diameter: 1 },
            scene
        );
        sphere3.position.y = 4.75;

        let customMaterial = new BABYLON.StandardMaterial(
            "customMaterial",
            scene
        );
        customMaterial.diffuseColor = BABYLON.Color3.Teal();
        sphere1.material = customMaterial;
        sphere2.material = customMaterial;
        sphere3.material = customMaterial;

        const mergedMeshes = BABYLON.Mesh.MergeMeshes(
            [sphere1, sphere2, sphere3],
            true,
            false,
            null,
            false,
            true
        );

        if (!mergedMeshes) {
            throw new Error("Failed to merge meshes");
        }

        return mergedMeshes;
    }

    public static buildGround(scene: BABYLON.Scene): BABYLON.Mesh {
        const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
        groundMat.diffuseColor = new BABYLON.Color3(0, 1, 0);
        const ground = BABYLON.MeshBuilder.CreateGround("ground", {
            width: 10,
            height: 10,
        });
        ground.material = groundMat;
        return ground;
    }

    public static buildBox(
        width: number,
        pos_x: number,
        scene: BABYLON.Scene
    ): BABYLON.Mesh {
        const box = BABYLON.MeshBuilder.CreateBox("box", { width: width });
        box.position.x = pos_x;
        box.position.y = 0.5;

        let customMaterial = new BABYLON.StandardMaterial(
            "customMaterial",
            scene
        );
        customMaterial.diffuseTexture = new BABYLON.Texture(
            "https://www.babylonjs-playground.com/textures/floor.png",
            scene
        );
        box.material = customMaterial;

        return box;
    }

    public static buildRoof(
        width: number,
        pos_x: number,
        scene: BABYLON.Scene
    ): BABYLON.Mesh {
        const roof = BABYLON.MeshBuilder.CreateCylinder("roof", {
            diameter: 1.3,
            height: 1.2,
            tessellation: 3,
        });
        roof.position.x = pos_x;
        roof.scaling.x = 0.75;
        roof.scaling.y = width;
        roof.rotation.z = Math.PI / 2;
        roof.position.y = 1.22;
        let customMaterial = new BABYLON.StandardMaterial(
            "customMaterial",
            scene
        );
        customMaterial.diffuseTexture = new BABYLON.Texture(
            "https://assets.babylonjs.com/environments/roof.jpg",
            scene
        );
        roof.material = customMaterial;
        return roof;
    }

    public static buildHouse(
        width: number,
        pos_x: number,
        scene: BABYLON.Scene
    ): BABYLON.Mesh {
        const box = this.buildBox(width, pos_x, scene);
        const roof = this.buildRoof(width, pos_x, scene);

        return BABYLON.Mesh.MergeMeshes(
            [box, roof],
            true,
            false,
            null,
            false,
            true
        );
    }
}

export function CreatePlaygroundScene(
    engine: BABYLON.Engine,
    canvas: HTMLCanvasElement
): BABYLON.Scene {
    return Playground.CreateScene(engine, canvas);
}
