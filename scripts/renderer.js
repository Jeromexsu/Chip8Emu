// renderer handles all graphic related stuff
class Renderer {
    cols = 64
    rows = 32
    display = new Array(this.cols*this.rows).fill(false)
    color = 'black'
    constructor(scale) {
        this.scale = scale;
        this.canvas = document.querySelector('canvas')
        // canvas cannot be null, or fatal error
        if(this.canvas === null) return
        this.ctx = this.canvas.getContext('2d')
        this.canvas.width = this.cols*scale
        this.canvas.height = this.rows*scale
    }
    /**
     * toggle value of pixel at given location
     * @param {number} x 
     * @param {number} y
     * @returns {boolean} true if a pixel is turned off, false if a pixel is turned on
     */
    togglePixel(x,y) {
        // according to the technical reference, if a pixel is positioned outside of the bounds of the display, it should wrap around to the opposite side
        x %= this.cols
        if(x<0) x += this.cols
        y %=  this.rows
        if(y<0) y += this.rows
        let loc = y*this.cols+x
        this.display[loc] = 1 - this.display[loc]
        return !this.display[loc]
    }

    /**
     * clear the display
     */
    clear() {
        this.display.fill(false)
    }

    /**
     * render the display to canvas for each cycle
     */
    render() {
        if(this.ctx === undefined || this.ctx === null) return
        // clear the canvas
        this.ctx.clearRect(0,0,this.cols*this.scale,this.rows*this.scale)
        // fill canvas 
        for(let y=0;y<this.rows;y++) {
            for(let x=0;x<this.cols;x++) {
                if(this.display[y*this.cols+x]) {
                    this.ctx.fillStyle = this.color
                    this.ctx.fillRect(x*this.scale,y*this.scale,this.scale,this.scale)
                }
            }
        }
    }

    testRender() {
        this.togglePixel(0,0)
        this.togglePixel(63,31)
        this.render()
    }

}

export default Renderer