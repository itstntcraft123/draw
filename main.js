function setup() {
    createCanvas(1920, 1080);
    scaleCanvas();
    data = createElement("textarea", "");
    data.position(100, 100);
    data.size(100,400);
    data.style("resize", "none");
}

function draw() {
    scaleCanvas();

    rect(0, 0, 1920, 1080);
}

function heheh(){
    console.log(textToArray(data));
}

// textarea input to nested arrays
function textToArray(element) {
    const text = element.value();
    return text.split(/\r?\n/)
        .map(line => line.replace(/[()\[\]\{\}]/g, "") // remove brackets
            .split(/,\s*/) // change into array
            .map(str => Number(str)) // change strings to numbers
            .filter(num => !isNaN(num)) // remove non-numbers
        ).filter(line => line.length > 0); // remove empty lines
}

function drawPolygon(text) {
    
}

function scaleCanvas() {
    resizeCanvas(window.innerWidth, window.innerHeight);
    scale(min(window.innerWidth / 1920, window.innerHeight / 1080));
}