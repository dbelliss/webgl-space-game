'use strict';

/**
 * Abstract base class for all programs
 * Each program will contain a vertex shader and fragment shader
 */
class Program {
    constructor(gl, vertexShaderText, fragmentShaderText, worldMatrix, viewMatrix, projMatrix) {
        if (new.target === Program) {
            throw new TypeError("Cannot construct abstract Program class")
        }

        // Save for later use
        this.gl = gl
        this.worldMatrix = worldMatrix
        this.viewMatrix = viewMatrix
        this.projMatrix = projMatrix

        // Create the shaders
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(vertexShader, vertexShaderText);
        gl.shaderSource(fragmentShader, fragmentShaderText);

        gl.compileShader(vertexShader)
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            throw new Error('Error: Could not compile vertex shader: ' + gl.getShaderInfoLog(vertexShader));
        }

        gl.compileShader(fragmentShader)
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            throw new Error('Error: Could not compile fragment shader: ' + gl.getShaderInfoLog(fragmentShader));
        }

        // Create program and attach shaders
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        // Link and validate, like a C program
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error('Error: Could not link program: ' + gl.getProgramInfoLog(program));
        }
        gl.validateProgram(program);
        if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
            throw new Error('Error: Program validation failed: ' + gl.getProgramInfoLog(program));
        }

        this.program = program
    }
}