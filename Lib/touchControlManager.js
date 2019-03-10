class TouchControlManager {
    constructor() {
        if (TouchControlManager.instance !== undefined) {
            console.error("Error: Two instances of TouchControlManager were created");
            return;
        }
        TouchControlManager.instance = this
        this.touchControlsInitialized = false;
        this.touchControlsEnabled = false;
        this.touchControlsCheckbox = document.getElementById("touchControlsEnabledCheckBox");
        this.touches = {} // Map touch ID to the button they are on
        this.touchControlsCheckbox.onclick = function() {
            if (TouchControlManager.instance.touchControlsCheckbox.checked) {
                TouchControlManager.instance.enableTouchControls();
            }
            else {
                TouchControlManager.instance.disableTouchControls();
            }
        }
    }

    enableTouchControls() {
        console.log("Enabling touch controls");
        this.initializeTouchControls();
        this.touchControlsEnabled = true;
        UI.instance.enableTouchButtons();
    }

    disableTouchControls() {
        console.log("Disabling touch controls");
        this.touchControlsEnabled = false;
        UI.instance.disableTouchButtons();
    }

    goFunction() {
        console.log("Going")
        Game.instance.shouldMove = true
    }

    goReleaseFunction() {
        Game.instance.shouldMove = false
    }

    laserFunction() {
        Game.instance.shouldFireLaser = true
    }

    initializeTouchControls() {
        if (this.touchControlsInitialized) {
            return;
        }
        this.touchControlsInitialized = true;
        document.addEventListener("touchstart", touchStartHandler, { passive: false });
        document.addEventListener("touchmove", touchHandler, { passive: false });
        document.addEventListener("touchend", touchEndHandler, { passive: false });

        var canvasHeight = Game.instance.canvasHeight;
        var canvasWidth = Game.instance.canvasWidth;

        this.touchStartX = 0;
        this.touchStartY = 0;
        this.deltaX = 0;
        this.deltaY = 0;
        var canvasHeight = Game.instance.canvasHeight;
        var canvasWidth = Game.instance.canvasWidth;
        var canvas = Game.instance.canvas;
        this.touches = {}
        function touchStartHandler(e) {
            if(e.touches) {
                var playerX = e.touches[0].pageX - canvas.offsetLeft;
                var playerY = e.touches[0].pageY - canvas.offsetTop;
                if (playerX <= canvasWidth && playerX >= 0 && playerY >= 0 && playerY <= canvasHeight) {
                    console.log("Touch start");
                    console.log("Touch: "+ " x: " + playerX + ", y: " + playerY);
                    var buttons = UI.instance.buttons;
                    for (var i = 0; i < buttons.length; i++) {
                        var button = buttons[i]
                        if (button.isTouched(playerX, playerY)) {
                            button.onTouch();
                            TouchControlManager.instance.touches[e.changedTouches[0].identifier] = button
                            e.preventDefault();
                            return;
                        }
                    }

                    TouchControlManager.instance.touchStartX = playerX
                    TouchControlManager.instance.touchStartY = playerY
                    TouchControlManager.instance.deltaX = 0
                    TouchControlManager.instance.deltaY = 0

                    e.preventDefault();
                }
            }
        }

        function touchEndHandler(e) {
            console.log("Touch end");
            TouchControlManager.instance.touchStartX = 0
            TouchControlManager.instance.touchStartY = 0
            TouchControlManager.instance.deltaX = 0
            TouchControlManager.instance.deltaY = 0
            if (TouchControlManager.instance.touches[e.changedTouches[0].identifier] != undefined) {
                // If this touch started on a button, call the onRelease function on it
                TouchControlManager.instance.touches[e.changedTouches[0].identifier].onRelease()
                TouchControlManager.instance.touches[e.changedTouches[0].identifier] = undefined
            }
        }

        function touchHandler(e) {
            if(e.touches) {

                if (TouchControlManager.instance.touches[e.changedTouches[0].identifier] != undefined) {
                    // This is a touch for a button, don't change direction
                    e.preventDefault();
                    return
                }
                var playerX = e.touches[0].pageX - canvas.offsetLeft;
                var playerY = e.touches[0].pageY - canvas.offsetTop;
                if (playerX <= canvasWidth && playerX >= 0 && playerY >= 0 && playerY <= canvasHeight) {
                    TouchControlManager.instance.deltaX = playerX - TouchControlManager.instance.touchStartX
                    TouchControlManager.instance.deltaY = playerY - TouchControlManager.instance.touchStartY
                    e.preventDefault();
                }
            }
        }
    }
}