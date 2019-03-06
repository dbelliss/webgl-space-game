class UIButton extends UIImage{
    constructor(canvasContext, imagePath, x, y, width, height, onTouch, onRelease) {
        super(canvasContext, imagePath, x, y, width, height)
        this.onTouchFunc = onTouch
        this.onReleaseFunc = onRelease
    }

    isTouched (touchX, touchY) {
        return touchX >= this.x && touchX <= this.x + this.width &&
                touchY >= this.y && touchY <= this.y + this.height;
    }

    onTouch() {
        this.onTouchFunc();
    }

    onRelease() {
        if (this.onReleaseFunc != undefined) {
            this.onReleaseFunc();
        }
    }
}