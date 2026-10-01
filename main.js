const screen = 0
let changedscreen = false //true for one frame when the screen is changed

function setup() {
    createCanvas(1920, 1080);
    scalecanvas();
    data = createInput('');
    data.position(100, 100);
}

function draw() {
    scalecanvas();

    if (screen == 0) draw0();
    if (screen == 1) draw1();
}

function scalecanvas() {
    resizeCanvas(window.innerWidth, window.innerHeight);
    scale(min(window.innerWidth / 1920, window.innerHeight / 1080));
}

function draw0() {
    rect(0, 0, 1920, 1080);
}

function draw1() {

}