"use strict";

/**
 * Class for a cube GameObject
 */
class MeshObject extends GameObject{
    constructor(_name, position, renderData) {
        super(_name, position);
        this.transform.position = position;
        this.renderData = renderData
    }
}
