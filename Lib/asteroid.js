"use strict";

/**
 * Class for a Asteroid GameObject
 */
class Asteroid extends MeshObject{
    constructor(_name, position, renderData) {
        super(_name, position);
        this.tag = "Asteroid"
        this.transform.position = position;
        this.renderData = renderData

        // Set random initial rotation
        var initialRotation = new Vector3(Math.random() * 360, Math.random() * 360, Math.random() * 360)
        var newRotationQuaternion = new Float32Array(4);
        glMatrix.quat.fromEuler(newRotationQuaternion, initialRotation.x, initialRotation.y, initialRotation.z);
        glMatrix.quat.mul(this.transform.rotation, this.transform.rotation, newRotationQuaternion)

        // Generate a random rotation to rotate asteroid every fixed update
        const rotationSpeed = .5
        var rotationType = Math.random()
        var deltaRotation = Vector3.random(-1,1)
        deltaRotation.scale(rotationSpeed)
        this.deltaRotationQuat = new Float32Array(4);
        glMatrix.quat.fromEuler(this.deltaRotationQuat, deltaRotation.x, deltaRotation.y, deltaRotation.z);

        // Set size of asteroid
        this.transform.scale = new Vector3(.05, .05, .04)
        var scaleFactor = 1 + Math.floor(Math.random() * 8)
        this.mass = (4/3) * Math.PI * (Math.pow(scaleFactor - .99, 3))
        this.transform.scale.scale(scaleFactor)

        // Add sphere collider
        this.collider = new SphereCollider(this.transform.position, scaleFactor, scaleFactor, scaleFactor)
    }

    onCollisionEnter(other) {
        if (other.tag == "Player") {
           if (other.iFrames >= 0) {
                return
            }
            var forceDir = this.transform.position.difference(other.transform.position)
            forceDir.scale(100)
            this.addForce(forceDir)
        }
        if (other.tag == "Asteroid") {
            var forceDir = this.transform.position.difference(other.transform.position)
            forceDir.scale(other.mass)
            this.addForce(forceDir)
        }
        if (other.tag == "Laser") {
            var forceDir = this.transform.position.difference(other.transform.position)
            forceDir.scale(5)
            this.addForce(forceDir)
        }
    }

    fixedUpdate(deltaTime) {
        // Rotate by the set amount
        glMatrix.quat.mul(this.transform.rotation, this.transform.rotation, this.deltaRotationQuat)
        super.fixedUpdate(deltaTime)
    }
}
