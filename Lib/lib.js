"use strict;"

/**
 * Creates and initializes a WebGL object without culling
 *
 * @param {canvasID} string ID of the canvas object on the HTML page
 * @returns {gl} the initialized webGL object, or {undefined} if any errors occurred
 */
var InitializeGL = function(canvas, fragmentShaderText,) {
    console.log('Initializing WebGL');
    var gl = canvas.getContext('webgl');

    if (!gl) {
        console.log('WebGL is not supported on this browser, falling back to experimental-webgl');
        gl = canvas.getContext('experimental-webgl');
    }

    if (!gl) {
        alert('Your browser does not support WebGL')
        return
    }

    clearGL(gl)
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
    return gl
}

var clearGL = function(gl) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor(0, 0, 0, 1);
}