"use strict";

/**
 * WebGL Program to render objects with a single color (no texture)
 */
class SimpleProgram extends Program {

    static getVertexShaderText() {
        var vertexShaderText = `
            precision lowp float;
            attribute vec3 vertPosition;
            attribute vec3 vertColor;
            varying vec3 fragColor;

            uniform mat4 mWorld;
            uniform mat4 mView;
            uniform mat4 mProj;

            void main()
            {
               fragColor = vertColor;
               gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
            }
        `;
        return vertexShaderText;
    }

    static getFragmentShaderText() {
        var fragmentShaderText = `
        precision lowp float;
        varying vec3 fragColor;
        void main()
        {
           gl_FragColor = vec4(fragColor, 1.0);
        }
        `;
        return fragmentShaderText;
    }

    constructor(gl, worldMatrix, viewMatrix, projMatrix, aspectRatio) {
        super(gl, SimpleProgram.getVertexShaderText(), SimpleProgram.getFragmentShaderText(), worldMatrix, viewMatrix, projMatrix)
        gl.useProgram(this.program);
        var matWorldUniformLocation = gl.getUniformLocation(this.program, 'mWorld');
        var matViewUniformLocation = gl.getUniformLocation(this.program, 'mView');
        var matProjUniformLocation = gl.getUniformLocation(this.program, 'mProj');

        glMatrix.mat4.identity(this.worldMatrix);
        glMatrix.mat4.lookAt(this.viewMatrix, [0, -20, 10], [0, 0, 0], [0, 1, 0]);
        glMatrix.mat4.perspective(this.projMatrix, glMatrix.glMatrix.toRadian(45), aspectRatio, 0.1, 1000.0);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, this.worldMatrix);
        gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, this.viewMatrix);
        gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, this.projMatrix);
        this.name = "SimpleProgram"
    }

    updateCamera() {
        var matViewUniformLocation = this.gl.getUniformLocation(this.program, 'mView');
        this.gl.uniformMatrix4fv(matViewUniformLocation, this.gl.FALSE, this.viewMatrix);
    }

    /**
     * Draws
     * @param {boxVertices} WebGL object
     * @param {boxIndices} List of which indices should be used to make a single triangle
     */
    draw(gl, boxVertices, boxIndices) {
        // Create buffer object to send data between CPU and GPU
        var boxVertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

        var boxIndexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

        var positionAttribLocation = gl.getAttribLocation(this.program, 'vertPosition');
        var colorAttribLocation = gl.getAttribLocation(this.program, 'vertColor');
        gl.vertexAttribPointer(
            positionAttribLocation, // Attribute location
            3, // Number of elements per attribute
            gl.FLOAT, // Type of elements
            gl.FALSE,
            6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
            0 // Offset from the beginning of a single vertex to this attribute
        );
        gl.vertexAttribPointer(
            colorAttribLocation, // Attribute location
            3, // Number of elements per attribute
            gl.FLOAT, // Type of elements
            gl.FALSE,
            6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
            3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
        );

        gl.enableVertexAttribArray(positionAttribLocation);
        gl.enableVertexAttribArray(colorAttribLocation);

        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
        gl.deleteBuffer(boxVertexBufferObject)
        gl.deleteBuffer(boxIndexBufferObject)
    }
}