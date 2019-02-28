"use strict";

/**
 * Class for a Crate GameObject
 */
class Crate extends GameObject{
    constructor(_name, position, texture, deltaRotation) {
        super(_name, position);
        this.tag = "Crate"
        var box = this.generateTexturedBox();
        this.renderData = [new RenderData(texture, box[0], box[2], box[1])]
        this.transform.position = position;
        this.deltaRotation = deltaRotation; // How much to rotate crate by each update

        // Give crate a random initial rotation
        this.transform.rotation.x = Math.random() * 360;
        this.transform.rotation.y = Math.random() * 360;
        this.transform.rotation.z = Math.random() * 360;
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
        this.transform.rotation.x = (this.transform.rotation.x + this.deltaRotation.x) % 360;
        this.transform.rotation.y = (this.transform.rotation.y + this.deltaRotation.y) % 360;
        this.transform.rotation.z = (this.transform.rotation.z + this.deltaRotation.z) % 360;
        super.fixedUpdate(deltaTime)
    }
}
