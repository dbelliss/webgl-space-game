"use strict";

/**
 * WebGL program to render objects that have a texture
 */
class TextureProgram extends Program {

    static getVertexShaderText() {
        var vertexShaderText = `
            precision lowp float;
            attribute vec3 vertPosition;
            attribute vec2 vertTexCoord;
            varying vec2 fragTexCoord;
            uniform mat4 mWorld;
            uniform mat4 mView;
            uniform mat4 mProj;

            void main()
            {
              fragTexCoord = vertTexCoord;
              gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
            }
        `;
        return vertexShaderText;
    }

    static getFragmentShaderText() {
        var fragmentShaderText = `
            precision lowp float;
            varying vec2 fragTexCoord;
            uniform sampler2D sampler; // gl.TEXTURE0

            void main()
            {
              gl_FragColor = texture2D(sampler, fragTexCoord);
            }
        `;
        return fragmentShaderText;
    }

    constructor(gl, worldMatrix, viewMatrix, projMatrix, aspectRatio) {
        super(gl, TextureProgram.getVertexShaderText(), TextureProgram.getFragmentShaderText(), worldMatrix, viewMatrix, projMatrix)
        gl.useProgram(this.program);
        this.matWorldUniformLocation = gl.getUniformLocation(this.program, 'mWorld');
        var matViewUniformLocation = gl.getUniformLocation(this.program, 'mView');
        var matProjUniformLocation = gl.getUniformLocation(this.program, 'mProj');

        glMatrix.mat4.identity(this.worldMatrix);
        glMatrix.mat4.lookAt(this.viewMatrix, [0, -20, 10], [0, 0, 0], [0, 1, 0]);
        glMatrix.mat4.perspective(this.projMatrix, glMatrix.glMatrix.toRadian(45), aspectRatio, 0.1, 5000.0);
        gl.uniformMatrix4fv(this.matWorldUniformLocation, gl.FALSE, this.worldMatrix);
        gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, this.viewMatrix);
        gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, this.projMatrix);
        this.name = "TextureProgram"

        this.positionAttribLocation = gl.getAttribLocation(this.program, 'vertPosition');
        this.texCoordAttribLocation = gl.getAttribLocation(this.program, 'vertTexCoord');

        // Create buffer objects to send data between CPU and GPU
        this.vertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBufferObject);
        this.texCoordBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBufferObject);

        this.indexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBufferObject);


        this.identity = glMatrix.mat4.identity(new Float32Array(16))

        this.quat = new Float32Array(4);
        this.position = [0,0,0]
        this.origin = [0,0,0]
        this.scale = [0,0,0]
    }

    /**
     * Update the view matrix to reflect changes to the camera
     */
    updateCamera() {
        var matViewUniformLocation = this.gl.getUniformLocation(this.program, 'mView');
        this.gl.uniformMatrix4fv(matViewUniformLocation, this.gl.FALSE, this.viewMatrix);
    }

    setWorldMatrix(transform) {
        const gl = this.gl

        this.position[0] = transform.position.x
        this.position[1] = transform.position.y
        this.position[2] = transform.position.z

        this.scale[0] = transform.scale.x
        this.scale[1] = transform.scale.y
        this.scale[2] = transform.scale.z

        this.quat = transform.rotation

        glMatrix.mat4.fromRotationTranslationScaleOrigin(this.worldMatrix, this.quat, this.position, this.scale, this.origin)
        gl.uniformMatrix4fv(this.matWorldUniformLocation, gl.FALSE, this.worldMatrix);
    }

    /**
     * Draws using the given data

     * @param {vertices} WebGL object
     * @param {indices} List of which indices should be used to make a single triangle
     * @param {texture} Texture to apply to the object
     */
    drawMesh(meshVertices, meshIndices, meshTexCoords, texture, drawType, transform) {
        const gl = this.gl
        this.setWorldMatrix(transform)
        //
        // Create buffers
        //
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, meshIndices, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, meshVertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(
            this.positionAttribLocation, // Attribute location
            3, // Number of elements per attribute
            gl.FLOAT, // Type of elements
            gl.FALSE,
            3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
            0 // Offset from the beginning of a single vertex to this attribute
        );
        gl.enableVertexAttribArray(this.positionAttribLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, meshTexCoords, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(
            this.texCoordAttribLocation, // Attribute location
            2, // Number of elements per attribute
            gl.FLOAT, // Type of elements
            gl.FALSE,
            2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
            0
        );
        gl.enableVertexAttribArray(this.texCoordAttribLocation);

        // Set texture
    	gl.activeTexture(gl.TEXTURE0);
    	gl.bindTexture(gl.TEXTURE_2D, texture.texture);

		gl.drawElements(gl.TRIANGLES, meshIndices.length, gl.UNSIGNED_SHORT, 0);

        // Cleanup
//        gl.deleteBuffer(this.boxVertexBufferObject)
//        gl.deleteBuffer(this.boxIndexBufferObject)
    }


    batchDraw(gameObjects, meshVertices, meshIndices, meshTexCoords, texture) {
        const gl = this.gl

        //
        // Create buffers
        //
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, meshIndices, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, meshVertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(
            this.positionAttribLocation, // Attribute location
            3, // Number of elements per attribute
            gl.FLOAT, // Type of elements
            gl.FALSE,
            3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
            0 // Offset from the beginning of a single vertex to this attribute
        );
        gl.enableVertexAttribArray(this.positionAttribLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, meshTexCoords, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(
            this.texCoordAttribLocation, // Attribute location
            2, // Number of elements per attribute
            gl.FLOAT, // Type of elements
            gl.FALSE,
            2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
            0
        );
        gl.enableVertexAttribArray(this.texCoordAttribLocation);

        // Set texture
    	gl.activeTexture(gl.TEXTURE0);
    	gl.bindTexture(gl.TEXTURE_2D, texture.texture);


        for (var i = 0; i < gameObjects.length; i++) {
            var gameObject = gameObjects[i]
            if (this.isVisible(gameObject)) {
                this.setWorldMatrix(gameObject.transform);
                gl.drawElements(gl.TRIANGLES, meshIndices.length, gl.UNSIGNED_SHORT, 0);
            }
        }
    }

    isVisible(gameObject) {
        var v1 = Game.instance.player.moveDir;
        return true;
        var v2 = gameObject.transform.position.difference(Camera.instance.position);
        var dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z
        var angle = Math.acos(dot/(v1.magnitude() * v2.magnitude()));
        return angle < Math.PI/4
    }
}