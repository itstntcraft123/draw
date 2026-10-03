FONT_SIZE = 26;
// This project was made for 1920x1080, however it will be automatically scaled to any resolution.
SCALING_MODE = "min";
UI_OFFSET = 400; // The x coordinate of the separator between UI and graph 
MIN_TEXT_WIDTH = 200;
MAX_TEXT_WIDTH = 300;
CHECKBOX_SIZE = 3; // checkbox size multiplier

EXAMPLE = `-500, 400
-500, -400
-400, -400
-400, -50
-200, -50
-200, -400
-100, -400
-100, 400
-200, 400
-200, 50
-400, 50
-400, 400
-500, 400
STOP
100, 400
500, 400
500, 300
350, 300
350, -300
500, -300
500, -400
100, -400
100, -300
250, -300
250, 300
100, 300
100, 400`

function setup() {
    createCanvas(1920, 1080);
    data = createElement("textarea");
    data.style("resize", "none");
    data.input(drawit);
    grid = createCheckbox("Grid", true);
    grid.input(drawit);
    exampleBtn = createElement("button", "example");
    exampleBtn.mousePressed(drawExample);
    clearBtn = createElement("button", "clear");
    clearBtn.mousePressed(clearBtnGraph);
    prevwidth = 1920;
    prevheight = 1080;
    document.addEventListener("pointerdown", (e) => {
        if (e.target !== data.elt && document.activeElement === data.elt) {
            data.elt.blur();
        }
    })
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
    textAlign(CENTER);
    textSize(35);
    text("draw something", 200, 80);
    textSize(21);
    text("use one coordinate pair (x,y)\nper line to draw something!\n\nyour points are automatically\nconnected, type END or\nSTOP to break!", 200, 130);
    textFont("sans-serif");
    textAlign(LEFT);
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

function drawPolygon() {
    const centerX = (1920 + UI_OFFSET) / 2;
    const centerY = 1080 / 2;
    const array = textToArray(data);
    setDrawSettings(false, "black");
    if (grid.checked()) {
        for (let i = -1000; i < 1000; i += 100) {
            if (i === 0) setDrawSettings(false, "black", 2);
            else setDrawSettings(false, "black", 1);
            line(0, i + centerY, 1920, i + centerY);
            line(i + centerX, 0, i + centerX, 1080);
            textSize(22);
            setDrawSettings("black", false);
            text(i, centerX + i + 5, centerY - 5);
            text(-i, centerX + 5, centerY + i - 5);
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
            vertex(pair[0] + centerX, pair[1] * -1 + centerY);
        }
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
    const scaleFactor = func(document.documentElement.clientWidth / 1920, document.documentElement.clientHeight / 1080);
    const fontSize = FONT_SIZE * scaleFactor + "px";
    const textWidth = min(MAX_TEXT_WIDTH, max(MIN_TEXT_WIDTH, getHighestLength(data) * FONT_SIZE * 70 / 100))
    resizeCanvas(document.documentElement.clientWidth, document.documentElement.clientHeight);
    scale(scaleFactor);
    data.position((UI_OFFSET / 2 - textWidth / 2) * scaleFactor - 4, 325 * scaleFactor);
    data.size(textWidth * scaleFactor, 400 * scaleFactor);
    data.style("font-size", fontSize);

    grid.position(115 * scaleFactor, 800 * scaleFactor);
    grid.style("transform", "scale(" + CHECKBOX_SIZE * scaleFactor + ")");
    grid.style("transform-origin", "left top");

    exampleBtn.position((162 - exampleBtn.width / 2) * scaleFactor, (940 - exampleBtn.height / 2) * scaleFactor);
    exampleBtn.style("font-size", fontSize);
    exampleBtn.style("padding", scaleFactor * 2 + "px " + scaleFactor * 8 + "px");

    clearBtn.position((172 - clearBtn.width / 2) * scaleFactor, (1000 - clearBtn.height / 2) * scaleFactor);
    clearBtn.style("font-size", fontSize);
    clearBtn.style("padding", scaleFactor * 2 + "px " + scaleFactor * 8 + "px");
}