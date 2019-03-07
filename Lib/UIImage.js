class UIImage {
    constructor(canvasContext, imagePath, x, y, width, height, enabled=true) {
        this.canvasContext = canvasContext
        this.enabled = enabled
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.image = new Image();
        this.image.src = imagePath
        if (enabled) {
            this.image.onload = function() {
                this.canvasContext.drawImage(this.image, this.x, this.y, this.width, this.height);
            }.bind(this)
        }
    }

    draw() {
        if (this.image.complete && this.enabled) {
            this.canvasContext.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }
}