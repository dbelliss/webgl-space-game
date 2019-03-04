"use strict";

/**
 * Class to represent how a GameObject is positioned, scaled, and rotated
 * Transform will also stored the parent GameObject if any, and any children GameObjects
 */
class Transform {
    constructor(position) {
        this.position = position
        this.scale = new Vector3(1, 1, 1);
        this.rotation = glMatrix.quat.fromValues(0, 0, 0, 1);
        this.children = [];
        this.parentTransform = undefined;
    }

    addChild(childTransform) {
        this.children.push(childTransform)
        this.childTransform.parentTransform = this
    }

    debugInfo() {
        return `(${this.x},${this.y},${this.z}), Parent:${this.parentTransform}, Children:${this.children}`
    }
}