"use strict";

/**
 * All rendering should be done in this class
 * GameObject are added to a renderer instance along with their texture
 * When the render function is called, all previously added objects are rendered in groups
 *
 * All objects with the same texture have their vetices and indices
 * concatenated before being sent to GPU for performance reasons
 *
 */
class Renderer {
    constructor(gl, textureLoader, program) {
        this.gl = gl
        this.textureLoader = textureLoader;
        this.program = program;
        this.textureToGameObjects = {} // Stores a list of gameObjects for each texture
    }



    /**
     * Render all enabled gameObjects
     *
     * If the texture on the gameObject has not been seen before, add a new entry to the map
     * @param {gameObject} GameObject to render for each frame
     */
    render(textureLoader) {
        var allVertices = []
        var allIndices = []
        var renderData = null
        var texture = null
        var drawType = null
        var program = this.program
        var gl = this.gl
        var renderData = RenderData.getAllRenderData()
        for (var i = 0; i < renderData.length; i++) {
            for (const [textureName, vertices] of Object.entries(renderData[0])) {
                var indices = renderData[1][textureName]
                texture = this.textureLoader.getTexture(textureName)
                drawType = gl.DYNAMIC_DRAW
                program.draw(gl, vertices, indices, texture, drawType, renderData[3][textureName])
            }
        }
    }
}
