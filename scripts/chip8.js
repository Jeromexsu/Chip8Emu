import Renderer from "./renderer.js";
import Keyboard from "./keyboard.js";
import Speaker from "./speaker.js";
import CPU from "./cpu.js";

const renderer = new Renderer(10);
const keyboard = new Keyboard();
const speaker = new Speaker();
const cpu = new CPU(renderer,speaker,keyboard);

let loop;
let fps = 60, interval = 1000/fps;
let now, then, elapsed;

const playButton = document.querySelector('playButton');
const stopButton = document.querySelector('stopButton');
function init() {
    if (playButton) {
        playButton.addEventListener('click', () => {
            speaker.play();
        });
    }
    if(stopButton){
        stopButton.addEventListener('click',()=>{
            speaker.stop()
        })
    }
    cpu.loadSpritesIntoMemory();
    cpu.loadRom();

    then = Date.now();
    loop = requestAnimationFrame(step);
}

function step() {
    now = Date.now();
    elapsed = now - then;

    if(elapsed > interval) {
        // time to Cycle the CPU
        cpu.cycle();
    }

    loop = requestAnimationFrame(step);
}
init();
