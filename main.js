FONT_SIZE = 24;
// This project was made for 1920x1080, however it will be automatically scaled to any resolution.
SCALING_MODE = "min";
UI_OFFSET = 400; // The x coordinate of the separator between UI and graph 
MIN_TEXT_WIDTH = 150;
MAX_TEXT_WIDTH = 300;

function setup() {
    createCanvas(1920, 1080);
    data = createElement("textarea", "");
    data.style("resize", "none");
    scaleCanvas();
}

function draw() {
    background("white");
    setDrawSettings(false, "black", 2);
    scaleCanvas();
    rect(UI_OFFSET, 0, 1920, 1080)
    drawPolygon();
    setDrawSettings("white", false);
    rect(0, 0, UI_OFFSET, 1200); // prevent graph from going into UI area
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
    return text.split(/\r?\n/) // split by lines
        .filter(line => line.trim() !== "") // remove empty lines
        .map(line => line.replace(/[()\[\]\{\}]/g, "") // remove brackets
            .split(/,\s*/) // change into array
            .map(str => Number(str)) // change strings to numbers
            .filter(num => !isNaN(num)) // remove non-numbers
        ).filter(line => line.length == 2); // only allow [x, y] for 2d positions
}

function getHighestLength(element) {
    const text = element.value();
    const lines = text.split(/\r?\n/);
    let max = 0;
    for (const line of lines) {
        if (line.length > max) max = line.length;
    }
    return max;
}

function drawPolygon(text) {
    const centerX = (1920 + UI_OFFSET) / 2;
    const centerY = 1080 / 2;
    const array = textToArray(data);
    setDrawSettings(false, "black");
    for (let i = -1000; i < 1000; i += 100) {
        if (i === 0) strokeWeight(2);
        else strokeWeight(1);
        line(0, i + centerY, 1920, i + centerY);
        line(i + centerX, 0, i + centerX, 1080);
    }
    strokeWeight(3);
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
    const textWidth = min(MAX_TEXT_WIDTH, max(MIN_TEXT_WIDTH, getHighestLength(data) * FONT_SIZE * 70 / 100))
    console.log(textWidth * scaleFactor)
    resizeCanvas(window.innerWidth, window.innerHeight);
    scale(scaleFactor);
    data.position((UI_OFFSET / 2 - textWidth / 2) * scaleFactor - 4, 100 * scaleFactor);
    data.size(textWidth * scaleFactor, 400 * scaleFactor);
    data.style("font-size", fontSize);
}