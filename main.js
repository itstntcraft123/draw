FONT_SIZE = 26;
// This project was made for 1920x1080, however it will be automatically scaled to any resolution.
SCALING_MODE = "min";
UI_OFFSET = 450; // The x coordinate of the separator between UI and graph 
MIN_TEXT_WIDTH = 250;
MAX_TEXT_WIDTH = 400;
CHECKBOX_SIZE = 3; // checkbox size multiplier

EXAMPLE = `-600, 400
-600, -400
-500, -400
-500, -50
-300, -50
-300, -400
-200, -400
-200, 400
-300, 400
-300, 50
-500, 50
-500, 400
-600, 400
STOP
0, 400
400, 400
400, 300
250, 300
250, -300
400, -300
400, -400
0, -400
0, -300
150, -300
150, 300
0, 300
0, 400
STOP
550, 400
650, 400
650, -200
550, -200
550, 400
STOP
550, -300
650, -300
650, -400
550, -400
550, -300`

function setup() {
    createCanvas(1920, 1080);
    data = createElement("textarea");
    data.style("resize", "none");
    data.input(drawit);
    grid = createCheckbox("Grid", true);
    grid.input(drawit);
    grid.style("transform-origin", "left top");
    grid.style("user-select", "none");
    exampleBtn = createButton("example");
    exampleBtn.mousePressed(drawExample);
    clearBtn = createButton("clear");
    clearBtn.mousePressed(clearBtnGraph);
    zoomIn = createButton("+");
    zoomIn.style("font-family", "monospace");
    zoomIn.mousePressed(() => (zoom /= 0.8, drawit()));
    zoomOut = createButton("-");
    zoomOut.style("font-family", "monospace");
    zoomOut.mousePressed(() => (zoom *= 0.8, drawit()));
    resetZoom = createButton("reset zoom");
    resetZoom.mousePressed(() => (zoom = 1, drawit()));
    prevwidth = 1920;
    prevheight = 1080;
    zoom = 1;
    document.addEventListener("pointerdown", (e) => {
        if (e.target !== data.elt && document.activeElement === data.elt) {
            data.elt.blur();
        }
    })
    scaleCanvas();
    drawit();
}

function drawExample() {
    data.value(EXAMPLE);
    drawit();
}

function clearBtnGraph() {
    data.value("");
    drawit();
}

// only redraw when window size changes or input changes
function draw() {
    if (document.documentElement.clientWidth !== prevwidth || document.documentElement.clientHeight !== prevheight) {
        drawit();
    }
    prevwidth = document.documentElement.clientWidth;
    prevheight = document.documentElement.clientHeight;
}

function drawit() {
    background("white");
    setDrawSettings(false, "black", 2);
    scaleCanvas();
    rect(UI_OFFSET, 0, 1920 - UI_OFFSET, 1080);
    drawPolygon();
    setDrawSettings("white", false);
    rect(0, 0, UI_OFFSET, 1080); // prevent graph from going into UI area
    rect(1920, 0, 1000, 1080);
    rect(0, 1080, 1920, 2000);
    setDrawSettings("black", false);
    textFont("monospace");
    textAlign(CENTER, BASELINE);
    textSize(44);
    text("draw something", UI_OFFSET / 2, 80);
    textSize(22);
    text("use one coordinate pair (x,y)\nper line to draw something!\n\nyour points are automatically\nconnected, type END or\nSTOP to break!", UI_OFFSET / 2, 135);
    textAlign(CENTER, CENTER);
    textFont("sans-serif");
    text("zoom", UI_OFFSET / 2, 990);
    textAlign(LEFT, BASELINE);
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
            .map(str => {
                if (/^(stop|end)$/i.test(str)) {
                    return "end";
                }
                const num = Number(str)
                return isNaN(num) ? null : num;
            }) // change strings to numbers
            .filter(num => num !== null) // remove broken numbers
        ).filter(line => {
            if (typeof line[0] === "string") {
                return line.length == 1
            }
            if (typeof line[0] === "number") {
                return line.length == 2
            }
        }); // only allow [x, y] for 2d positions
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

function getRealZoom(currentZoom) {
    if (currentZoom > 3 / 2) {
        return getRealZoom(currentZoom / 2);
    }
    else if (currentZoom < 2 / 3) {
        return getRealZoom(currentZoom * 2);
    }
    else {
        return currentZoom;
    }
}

function drawPolygon() {
    const centerX = (1920 + UI_OFFSET) / 2;
    const centerY = 1080 / 2;
    const array = textToArray(data);
    setDrawSettings(false, "black");
    if (grid.checked()) {
        const realZoom = getRealZoom(zoom);
        const accuracy = ceil(Math.log10(zoom / realZoom)) - 1;
        console.log(zoom / realZoom);
        for (let i = -1000 * realZoom; i < 1000 * realZoom; i += 100 * realZoom) {
            if (i > -100 * realZoom + 1 && i < 100 * realZoom - 1) setDrawSettings(false, "black", 2);
            else setDrawSettings(false, "black", 1);
            line(0, i + centerY, 1920, i + centerY);
            line(i + centerX, 0, i + centerX, 1080);
            textSize(22);
            setDrawSettings("black", false);
            if ((accuracy < 4 && accuracy > -3) || (i > -100 * realZoom + 1 && i < 100 * realZoom - 1)) {
                text(round(i / zoom, accuracy), centerX + i + 5, centerY - 5);
                text(round(-i / zoom, accuracy), centerX + 5, centerY + i - 5);
            }
            else {
                text((i / zoom).toExponential(1), centerX + i + 5, centerY - 5);
                text((-i / zoom).toExponential(1), centerX + 5, centerY + i - 5);
            }
        }
    }
    setDrawSettings(false, "black", 4);
    beginShape();
    for (const pair of array) {
        if (pair[0] == "end") {
            endShape();
            beginShape();
        }
        else {
            vertex(pair[0] * zoom + centerX, pair[1] * zoom * -1 + centerY);
        }
    }
    endShape();
}

function scaleCanvas() {
    window.scrollTo(0, 0);
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
    const scaleFactor = func(document.documentElement.clientWidth / 1920, document.documentElement.clientHeight / 1080);
    let body = select("body");
    body.style("transform", "scale(" + scaleFactor + ")");
    body.style("transform-origin", "top left");
    body.style("width", 100 / scaleFactor + "%");
    const fontSize = FONT_SIZE + "px";
    const textWidth = min(MAX_TEXT_WIDTH, max(MIN_TEXT_WIDTH, getHighestLength(data) * FONT_SIZE * 70 / 100))
    resizeCanvas(document.documentElement.clientWidth / scaleFactor, document.documentElement.clientHeight / scaleFactor);
    data.position((UI_OFFSET / 2 - textWidth / 2) - 4, 320);
    data.size(textWidth, 400);
    data.style("font-size", fontSize);

    centerUI(grid, -55, 770)
    grid.style("transform", "scale(" + CHECKBOX_SIZE + ")");

    centerUI(exampleBtn, 0, 860);
    exampleBtn.style("font-size", fontSize);
    exampleBtn.style("padding", 2 + "px " + 8 + "px");

    centerUI(clearBtn, 0, 920);
    clearBtn.style("font-size", fontSize);
    clearBtn.style("padding", 2 + "px " + 8 + "px");

    centerUI(zoomIn, 60, 990);
    zoomIn.style("font-size", fontSize);
    zoomIn.style("padding", 0 + "px " + 8 + "px " + 2 + "px " + 8 + "px");

    centerUI(zoomOut, -60, 990);
    zoomOut.style("font-size", fontSize);
    zoomOut.style("padding", 0 + "px " + 8 + "px " + 2 + "px " + 8 + "px");

    centerUI(resetZoom, 0, 1050);
    resetZoom.style("font-size", fontSize);
    resetZoom.style("padding", 2 + "px " + 8 + "px");
}

function centerUI(element, xOffset, y) {
    element.position(UI_OFFSET / 2 + xOffset - element.elt.offsetWidth / 2, y - element.elt.offsetHeight / 2);
}