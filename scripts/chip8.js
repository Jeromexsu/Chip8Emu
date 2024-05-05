import Renderer from "./renderer.js";
import Keyboard from "./keyboard.js";
import Speaker from "./speaker.js";

const renderer = new Renderer(10);
const keyboard = new Keyboard();
const speaker = new Speaker();

let loop;
let fps = 60, interval = 1000/fps;
let now, then, elapsed;

function init() {
    renderer.testRender();

    then = Date.now();
    loop = requestAnimationFrame(step);

    playButton.addEventListener('click', () => {
        speaker.play();
    });
    stopButton.addEventListener('click',()=>{
        speaker.stop()
    })
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
