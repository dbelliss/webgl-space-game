class UIImage {
    constructor(canvasContext, imagePath, x, y, width, height) {
        this.canvasContext = canvasContext
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.image = new Image();
        this.image.src = imagePath
        this.image.onload = function() {
            this.canvasContext.drawImage(this.image, this.x, this.y, this.width, this.height);
        }.bind(this)
    }

    draw() {
        if (this.image.complete) {
            this.canvasContext.drawImage(this.image, this.x, this.y, this.width, this.height);
        }

    }
}