"use strict";

/**
 * Class for a Crate GameObject
 */
class Crate extends GameObject{
    constructor(_name, position, texture) {
        super(_name, position);
        this.tag = "Crate"
        var box = this.generateTexturedBox();
        this.renderData = [new RenderData(texture, box[0], box[2], box[1])]
        this.transform.position = position;

        // Give crate a random initial rotation
        var initialRotation = new Vector3(Math.random() * 360, Math.random() * 360, Math.random() * 360)
        glMatrix.quat.fromEuler(this.transform.rotation, initialRotation.x, initialRotation.y, initialRotation.z);

        // Set up delta rotation for every fixed update
        var deltaRotation = Vector3.random(-1,1); // How much to rotate crate by each update
        this.deltaRotationQuat = new Float32Array(4);
        glMatrix.quat.fromEuler(this.deltaRotationQuat, deltaRotation.x, deltaRotation.y, deltaRotation.z);

        // Set up box collider
        var collision_modifier = 1; // Make it easier to players to collect crates
        this.collider = new BoxCollider(this.transform.position, this.transform.scale.x + collision_modifier, this.transform.scale.y + collision_modifier, this.transform.scale.z + collision_modifier)
    }

    onCollisionEnter(other) {
        if (other.tag == "Player") {
            this.isDestroyed = true
            console.log("Crate!");
            Game.instance.crateCollected()
        }
    }

    generateTexturedBox() {
        var boxVertices =
        [ // X, Y, Z           U, V
            // Top
            -1.0 , 1.0, -1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, -1.0,
    
            // Left
            -1.0, 1.0, 1.0,
            -1.0, -1.0, 1.0,
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
    
            // Right
            1.0, 1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, -1.0, -1.0,
            1.0, 1.0, -1.0,
    
            // Front
            1.0, 1.0, 1.0,
            1.0, -1.0, 1.0,
            -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
    
            // Back
            1.0, 1.0, -1.0,
            1.0, -1.0, -1.0,
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
    
            // Bottom
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, -1.0, -1.0,
        ];
    
        const textureVertices =
        [
            0,0,
            0,1,
            1,1,
            1,0,
    
            0,0,
            1,0,
            1,1,
            0,1,
    
            1,1,
            0,1,
            0,0,
            1,0,
    
            1,1,
            1,0,
            0,0,
            0,1,
    
            0,0,
            0,1,
            1,1,
            1,0,
    
            1,1,
            1,0,
            0,0,
            0,1
    
        ]
    
        const boxIndices =
        [
            // Top
            0, 1, 2,
            0, 2, 3,
    
            // Left
            5, 4, 6,
            6, 4, 7,
    
            // Right
            8, 9, 10,
            8, 10, 11,
    
            // Front
            13, 12, 14,
            15, 14, 12,
    
            // Back
            16, 17, 18,
            16, 18, 19,
    
            // Bottom
            21, 20, 22,
            22, 20, 23
        ];
        return [boxVertices, textureVertices, boxIndices];
    }

    fixedUpdate(deltaTime) {
        // Rotate by the set amount
        glMatrix.quat.mul(this.transform.rotation, this.transform.rotation, this.deltaRotationQuat)
        super.fixedUpdate(deltaTime)
    }
}
