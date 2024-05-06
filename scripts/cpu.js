class CPU {
    memory = new Uint8Array(4096);
    registers = new Uint8Array(16);
    i = 0; // memory address register
    delayTimer = 0;
    soundTimer = 0;
    pc = 0x200;
    stack = new Array();
    pause = false;
    speed = 10
    speaker;
    renderer;
    keyboard;
    constructor(renderer,speaker,keyboard) {
        this.renderer = renderer;
        this.speaker = speaker;
        this.keyboard = keyboard;
    }

    loadSpritesIntoMemory() {
        // Array of hex values for each sprite. Each sprite is 5 bytes.
        // The technical reference provides us with each one of these values.
        const sprites = [
            0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
            0x20, 0x60, 0x20, 0x20, 0x70, // 1
            0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
            0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
            0x90, 0x90, 0xF0, 0x10, 0x10, // 4
            0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
            0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
            0xF0, 0x10, 0x20, 0x40, 0x40, // 7
            0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
            0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
            0xF0, 0x90, 0xF0, 0x90, 0x90, // A
            0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
            0xF0, 0x80, 0x80, 0x80, 0xF0, // C
            0xE0, 0x90, 0x90, 0x90, 0xE0, // D
            0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
            0xF0, 0x80, 0xF0, 0x80, 0x80  // F
        ];
    
        // According to the technical reference, sprites are stored in the interpreter section of memory starting at hex 0x000
        for (let i = 0; i < sprites.length; i++) {
            this.memory[i] = sprites[i];
        }
    }

    loadProgramIntoMemory(program) {
        for (let i = 0; i < program.length; i++) {
            // console.log(program[i]);
            this.memory[0x200 + i] = program[i];
        }
    }

    loadRom() {
        var xhr = new XMLHttpRequest();
        var self = this;

        xhr.onload = function() {
            if (xhr.response) {
                // Create a Uint8Array from the ArrayBuffer
                let program = new Uint8Array(xhr.response);
                // Load the ROM into memory
                self.loadProgramIntoMemory(program);
            }
        };

        xhr.open('GET', 'roms/15PUZZLE');
        xhr.responseType = 'arraybuffer'
        xhr.send();
    }

    cycle() {
        for(let i = 0; i < this.speed; i++) {
            if(!this.pause) {
                // Fetch instruction
                let instruction = (this.memory[this.pc] << 8) | this.memory[this.pc + 1];
                // console.log(opcode);
                // Increment Program Counter
                this.pc += 2;
                // Decode Opcode
                this.execute(instruction);
            }
        }

        if(!this.pause) this.updateTimers();
        this.playSound();
        this.renderer.render();
    }

    updateTimers() {
        if(this.delayTimer > 0) {
            this.delayTimer--;
        }

        if(this.soundTimer > 0) {
            this.soundTimer--;
        }
    }

    playSound() {
        if(this.soundTimer > 0) {
            this.speaker.play();
        } else {
            this.speaker.stop();
        }
    }

    execute(instruction) {
        let opcode = instruction & 0xF000;
        let x = (instruction & 0x0F00) >> 8;
        let y = (instruction & 0x00F0) >> 4;
        let NNN = (instruction & 0x0FFF);
        let NN = (instruction & 0xFF);
        let n = (instruction & 0xF);
        switch(opcode) {
            case(0x0000):
                switch(instruction & 0x00FF) {
                    case(0xE0):
                        // Clear the display
                        this.renderer.clear();
                        break;
                    case(0xEE):
                        // Return from a subroutine
                        this.pc = this.stack.pop();
                        break;
                    default:
                        // Call RCA 1802 program at address NNN
                        break;
                }
                break;
            case(0x1000):
                // Jump to address NNN
                this.pc = NNN;
                break;
            case(0x2000):
                // Call subroutine at NNN
                this.stack.push(this.pc);
                this.pc = NNN;
                break;
            case(0x3000):
                // Skip next instruction if Vx = NN
                if(this.registers[x] === NN) {
                    this.pc += 2;
                }
                break;
            case(0x4000):
                // Skip next instruction if Vx != NN
                if(this.registers[x] !== NN) {
                    this.pc += 2;
                }
                break;
            case(0x5000):
                // Skip next instruction if Vx = Vy
                if(this.registers[x] === this.registers[y]) {
                    this.pc += 2;
                }
                break;
            case(0x6000): 
                // Set Vx = NN
                this.registers[x] = NN;
                break;
            case(0x7000):
                // Set Vx = Vx + NN
                this.registers[x] += NN;
                break;
            case(0x8000):
                switch(instruction & 0x000F) {
                    case(0x0000):
                        // Set Vx = Vy
                        this.registers[x] = this.registers[y];
                        break;
                    case(0x0001):
                        // Set Vx = Vx OR Vy
                        this.registers[x] |= this.registers[y];
                        break;
                    case(0x0002):
                        // Set Vx = Vx AND Vy
                        this.registers[x] &= this.registers[y];
                        break;
                    case(0x0003):
                        // Set Vx = Vx XOR Vy
                        this.registers[x] ^= this.registers[y];
                        break;
                    case(0x0004):
                        // Set Vx = Vx + Vy, set VF = carry
                        let sum = this.registers[x] + this.registers[y];
                        this.registers[0xF] = sum > 0xFF ? 1 : 0;
                        this.registers[x] = sum & 0xFF;
                        break;
                    case(0x0005):
                        // Set Vx = Vx - Vy, set VF = NOT borrow
                        this.registers[0xF] = this.registers[x] > this.registers[y] ? 1 : 0;
                        this.registers[x] -= this.registers[y];
                        break;
                    case(0x0006):
                        // Set Vx = Vx SHR 1
                        this.registers[0xF] = this.registers[x] & 0x1;
                        this.registers[x] >>= 1;
                        break;
                    case(0x0007):
                        // Set Vx = Vy - Vx, set VF = NOT borrow
                        this.registers[0xF] = this.registers[y] > this.registers[x] ? 1 : 0;
                        this.registers[x] = this.registers[y] - this.registers[x];
                        break;
                    case(0x000E):
                        // Set Vx = Vx SHL 1
                        this.registers[0xF] = this.registers[x] >> 7;
                        this.registers[x] <<= 1;
                        break;
                }
                break;
            case(0x9000):
                // Skip next instruction if Vx != Vy
                if(this.registers[x] !== this.registers[y]) {
                    this.pc += 2;
                }
                break;
            case(0xA000):
                // Set I = NNN
                this.i = NNN;
                break;
            case(0xB000):
                // Jump to location NNN + V0
                this.pc = NNN + this.registers[0];
                break;
            case(0xC000):
                // Set Vx = random byte AND NN
                this.registers[x] = Math.floor(Math.random() * 0xFF) & NN;
                break;
            case(0xD000):                
                let width = 8;
                let height = n;

                this.registers[0xF] = 0;

                for(let row = 0; row < height; row++) {
                    let sprite = this.memory[this.i + row];
                    for(let col = 0; col < width; col++) {
                        if((sprite & 0x80) > 0) {
                            var erased = this.renderer.togglePixel(this.registers[x] + col, this.registers[y] + row);
                            if(erased) {
                                this.registers[0xF] = 1;
                            }
                        }
                        sprite <<= 1;
                    }
                }

                break;
            case(0xE000):
                switch(instruction & 0xFF) {
                    case(0x9E):
                        // Skip next instruction if key with the value of Vx is pressed
                        if(this.keyboard.isKeyPressed(this.registers[x])) {
                            this.pc += 2;
                        }
                        break;
                    case(0xA1):
                        // Skip next instruction if key with the value of Vx is not pressed
                        if(!this.keyboard.isKeyPressed(this.registers[x])) {
                            this.pc += 2;
                        }
                        break;
                }
                break;
            case(0xF000):
                switch(NN) {
                    case(0x07):
                        // Set Vx = delay timer value
                        this.registers[x] = this.delayTimer;
                        break;
                    case(0x0A):
                        // Wait for a key press, store the value of the key in Vx
                        this.pause = true;
                        this.keyboard.waitForKey = (key) => {
                            this.registers[x] = key;
                            this.pause = false;
                        }
                        break;
                    case(0x15):
                        // Set delay timer = Vx
                        this.delayTimer = this.registers[x];
                        break;
                    case(0x18):
                        // Set sound timer = Vx
                        this.soundTimer = this.registers[x];
                        break;
                    case(0x1E):
                        // Add Vx to I
                        this.i += this.registers[x];
                        break;
                    case(0x29):
                        // Set I = location of sprite for digit Vx
                        this.i = this.registers[x] * 5;
                        break;
                    case(0x33):
                        // Store BCD representation of Vx in memory locations I, I+1, and I+2
                        this.memory[this.i] = this.registers[x] / 100;
                        this.memory[this.i + 1] = (this.registers[x] / 10) % 10;
                        this.memory[this.i + 2] = (this.registers[x] % 100) % 10;
                        break;
                    case(0x55):
                        // Store registers V0 through Vx in memory starting at location I
                        for(let ri = 0; ri <= x; ri++) {
                            this.memory[this.i + ri] = this.registers[ri];
                        }
                        break;
                    case(0x65):
                        // Read registers V0 through Vx from memory starting at location I
                        for(let ri = 0; ri <= x; ri++) {
                            this.registers[ri] = this.memory[this.i + ri];
                        }
                        break;
                }

        }
    }

        

}

export default CPU;