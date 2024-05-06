import Renderer from "./renderer.js";
import Keyboard from "./keyboard.js";
import Speaker from "./speaker.js";
import CPU from "./cpu.js";

const renderer = new Renderer(10);
const keyboard = new Keyboard();
const speaker = new Speaker();
var cpu = new CPU(renderer,speaker,keyboard);

let loop;
let fps = 60, interval = 1000/fps;
let now, then, elapsed;
const romSelector = document.querySelector('#rom-selector');

const enableSoundButton = document.querySelector('#enableSoundButton');

function init() {
    if (enableSoundButton) {
        enableSoundButton.addEventListener('click', () => {
            speaker.init();
            // console.log('Sound enabled');
        });
    }
    if (romSelector instanceof HTMLInputElement) {
        romSelector.addEventListener('change', (event) => {
            console.log(romSelector.files)
            if(romSelector.files) {
                loadRom(romSelector.files[0]).then((program) => {
                    renderer.clear();
                    cpu = new CPU(renderer,speaker,keyboard);
                    cpu.loadSpritesIntoMemory()
                    cpu.loadProgramIntoMemory(program)
                    then = Date.now();
                    loop = requestAnimationFrame(step);
                })
            }

        })
    }
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

function loadRom(file) {
    return new Promise((resolve,reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const program = new Uint8Array(reader.result);
            resolve(program); 
        }
        reader.onerror = () => {
            reject(reader.error); // Reject the promise if there's an error
        };    
        reader.readAsArrayBuffer(file);
    
    })
}
init();
