import Renderer from "./renderer.js";
const renderer = new Renderer(10);

let loop;
let fps = 60, interval = 1000/fps;
let now, then, elapsed;

function init() {
    renderer.testRender();

    then = Date.now();
    loop = requestAnimationFrame(step);
}

function step() {
    now = Date.now();
    elapsed = now - then;

    if(elapsed > interval) {
        // time to Cycle the CPU
    }

    loop = requestAnimationFrame(step);
}

init();