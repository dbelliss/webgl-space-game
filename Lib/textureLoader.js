"use strict";

/**
 * Creates and initializes all textures to be used
 * Textures that have not yet loaded will default to a blue sprite
 * Textures can be retrieved later with getTexture("textureName")
 * Texture names are saved in textures object
 *
 * @param {gl} WebGL object being used
 */
class TextureLoader {
    constructor(gl) {
        this.gl = gl
        this.textures = {}
        this.loadTextures()
    }

    /**
     * Creates and initializes all textures to be used
     * Textures that have not yet loaded will default to a blue sprite
     *
     * @param {canvasID} string ID of the canvas object on the HTML page
     * @returns {gl} the initialized webGL object, or {undefined} if any errors occurred
     */
    loadTextures() {
        var gl = this.gl;
        gl.activeTexture(gl.TEXTURE0);
        this.loadTexture("./Assets/Textures/defaultTexture.png", "default")
        this.loadTexture("./Assets/Textures/crate.png", "crate")
        this.loadTexture("./Assets/Textures/rocketTexture.png", "redRocket");
        this.loadTexture("./Assets/Textures/rocketTexture2.png", "blueRocket");
        this.loadTexture("./Assets/Textures/rocky-texture.jpg", "rock");
        this.loadTexture("./Assets/Textures/laser.png", "laser");
        this.loadTexture("./Assets/Textures/simpleSky.png", "space");
    }

    /**
     * Asynchronously creates and initializes all textures to be used
     * Textures that have not yet loaded will default to a blue sprite
     * Credit: Mozilla https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
     *
     * @param {url} string url to the image
     * @param {textureNum} gl.TEXTURE{0-8} to mark which texture slot the texture should be loaded to
     * @returns {texture} the default blue texture
     */
    loadTexture(url, textureName) {
          var gl = this.gl
          console.log("Setting default for ", textureName)


          const texture = gl.createTexture();
          var textureObj = new Texture(textureName, texture)
          this.textures[textureName] = textureObj;
          gl.bindTexture(gl.TEXTURE_2D, texture); // Work on this texture

          // Because images have to be download over the internet
          // they might take a moment until they are ready.
          // Until then put a single pixel in the texture so we can
          // use it immediately. When the image has finished downloading
          // we'll update the texture with the contents of the image.
          const level = 0;
          const internalFormat = gl.RGBA;
          const width = 1;
          const height = 1;
          const border = 0;
          const srcFormat = gl.RGBA;
          const srcType = gl.UNSIGNED_BYTE;
          const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
          gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                        width, height, border, srcFormat, srcType,
                        pixel);

          const image = new Image();
          image.onload = function() {
            gl.bindTexture(gl.TEXTURE_2D, textureObj.texture); // Work on this texture
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                          srcFormat, srcType, image);

            // WebGL1 has different requirements for power of 2 images
            // vs non power of 2 images so check if the image is a
            // power of 2 in both dimensions.

            function isPowerOf2(value) {
                return (value & (value - 1)) == 0;
            }

            if (textureName == "space") {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }
            else if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
               // Yes, it's a power of 2. Generate mips.
               gl.generateMipmap(gl.TEXTURE_2D);
            } else {
               // No, it's not a power of 2. Turn off mips and set
               // wrapping to clamp to edge
               gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
               gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
               gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
               gl.bindTexture(gl.TEXTURE_2D, null);
            }
          };
          image.src = url;
          gl.bindTexture(gl.TEXTURE_2D, null);
    }




    getTexture(textureName) {
        return this.textures[textureName]
    }
}
