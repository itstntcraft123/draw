FONT_SIZE = 20;
// This project was made for 1920x1080, however it will be automatically scaled to any resolution.
SCALING_MODE = "min";
UI_OFFSET = 400; // The x coordinate of the separator between UI and graph 

function setup() {
    createCanvas(1920, 1080);
    data = createElement("textarea", "");
    data.position(100, 100);
    data.size(150, 400);
    data.style("resize", "none");
    data.style("font-size", FONT_SIZE + "px")
    scaleCanvas();
}

function draw() {
    background("white");
    setDrawSettings(false, "black", 2);
    scaleCanvas();
    line(UI_OFFSET, 0, UI_OFFSET, 1200);
    drawPolygon();
    setDrawSettings("white", false);
    rect(0, 0, UI_OFFSET, 1200);
    noStroke();
}

function setDrawSettings(setFill, setStroke, setStrokeWeight) {
    function setDrawSetting(input, noAction, action) {
        if (input === undefined) doNothing();
        else if (input === false) noAction();
        else action(input);
    }

    const actions = [[setFill, noFill, fill], [setStroke, noStroke, stroke], [setStrokeWeight, doNothing, strokeWeight]]
    for (const action of actions) {
        setDrawSetting(action[0], action[1], action[2])
    }
}

function doNothing() { }

// textarea input to nested arrays
function textToArray(element) {
    const text = element.value();
    return text.split(/\r?\n/)
        .filter(line => line.trim() !== "") // remove empty lines
        .map(line => line.replace(/[()\[\]\{\}]/g, "") // remove brackets
            .split(/,\s*/) // change into array
            .map(str => Number(str)) // change strings to numbers
            .filter(num => !isNaN(num)) // remove non-numbers
        ).filter(line => line.length == 2); // only allow [x, y] for 2d positions
}

function drawPolygon(text) {
    const centerX = (1920 + UI_OFFSET) / 2;
    const centerY = 1080 / 2;
    const array = textToArray(data);
    setDrawSettings(false, "black", 5)
    beginShape();
    for (const pair of array) {
        vertex(pair[0] + centerX, pair[1] * -1 + centerY);
    }
    endShape();
}

function scaleCanvas() {
    let func;
    switch (SCALING_MODE) {
        case "min":
            func = min;
            break;
        case "max":
            func = max;
            break;
        case "mid":
            func = function (a, b) {
                return (min(a, b) + max(a, b)) / 2
            };
            break;
    }
    const scaleFactor = func(window.innerWidth / 1920, window.innerHeight / 1080);
    const fontSize = FONT_SIZE * scaleFactor + "px";
    resizeCanvas(window.innerWidth, window.innerHeight);
    scale(scaleFactor);
    data.position(100 * scaleFactor, 100 * scaleFactor);
    data.size(150 * scaleFactor, 400 * scaleFactor);
    data.style("font-size", fontSize);
}