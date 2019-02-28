"use strict";

/**
 * Stores vertices and indices used to render a GameObject
 * vertices is a list of floats that contain the data use to render and object
 * indices is a list of ints to show which vertices should be used to construct each polygon
 */
class RenderData {
    constructor(texture, vertices, indices, textureIndices) {
        this.vertices = new Float32Array(vertices);
        this.textureIndices = new Float32Array(textureIndices);
        this.indices =  new Uint16Array(indices);
        this.texture = texture
    }
}