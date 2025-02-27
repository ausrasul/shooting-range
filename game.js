class ElkGame {
    constructor(config) {
        this.config = {
            elkSize: config.elkSize || 100,
            moveSpeed: config.moveSpeed || 2,
            path_width: config.path_width,
        };

        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        //this.resize();
        window.addEventListener('resize', this.resize.bind(this));

        // Image loading with callback
        this.elkImage = new Image();
        this.elkImage.onload = () => {
            // Set initial position AFTER image loads
            this.gameState.x = this.rightBound - this.config.elkSize;
            console.log("rightBound: " + this.rightBound);
            console.log("elkSize: " + this.config.elkSize);
            this.animate();
            console.log('Elk image loaded');
        };
        this.elkImage.onerror = () => console.error('Failed to load elk image');
        this.elkImage.src = 'elk-silhouette.png';

        this.gameState = {
            direction: 1,
            x: 0,
            y: 0,
            isPaused: true,
            lastDirectionChange: Date.now()
        };
        this.resize();

    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gameState.y = this.canvas.height / 2 - this.config.elkSize / 2;
        this.calculateMovementBounds();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.calculateMovementBounds();
        this.gameState.y = this.canvas.height / 2 - this.config.elkSize / 2;
        
        // Keep elk within bounds after resize
        if (this.elkImage.complete) {
            this.gameState.x = Math.max(this.leftBound, 
                Math.min(this.gameState.x, this.rightBound - this.config.elkSize));
        }
    }

    calculateMovementBounds() {
        console.log("canvas width: " + this.canvas.width);

        this.leftBound = (this.canvas.width - this.config.path_width)/2;
        this.rightBound = this.canvas.width - ((this.canvas.width - this.config.path_width)/2);
        console.log("leftBound: " + this.leftBound);
        console.log("rightBound: " + this.rightBound);
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(this.animate.bind(this));
    }

    update() {
        if (!this.elkImage.complete) return;

        const now = Date.now();
        
        if (this.gameState.isPaused) {
            // Handle pause duration (2000ms = 2 seconds)
            if (now - this.gameState.lastDirectionChange > 2000) {
                this.gameState.isPaused = false;
                // Reverse direction after pause
                this.gameState.direction *= -1;
            }
            return;
        }

        // Move elk based on direction (-1 = left, 1 = right)
        this.gameState.x += this.config.moveSpeed * this.gameState.direction;

        // Calculate elk boundaries
        const elkLeft = this.gameState.x;
        const elkRight = elkLeft + this.config.elkSize;

        // Check wall collisions
        const atLeftWall = elkLeft <= this.leftBound;
        const atRightWall = elkRight >= this.rightBound;

        if (atLeftWall || atRightWall) {
            this.gameState.isPaused = true;
            this.gameState.lastDirectionChange = Date.now();
            
            // Clamp position to wall boundary
            this.gameState.x = atLeftWall 
                ? this.leftBound 
                : this.rightBound - this.config.elkSize;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.elkImage.complete) {
            // Draw elk with current position and size
            this.ctx.drawImage(
                this.elkImage,
                this.gameState.x,
                this.gameState.y,
                this.config.elkSize,
                this.config.elkSize * 0.4
            );
        }
    }
}

function start(){
    // Initialize game with configuration
    const frame_per_second = 60
    const game = new ElkGame({
        elkSize: calculate_elk_width(),       // pixels
        moveSpeed: calculate_elk_pixel_per_second() / frame_per_second,       // pixels per frame
        path_width: calculate_path_width(),       // percentage
    });
    console.log(calculate_elk_pixel_per_second());
}

const settings = {
    distance_to_tv: 3, // meter
    tv_width: 0.48, // meter
    px_density_tv: 80,
    width_elk: 3, // meter
    elk_speed: 5.35, // m/s
    elk_path: 23, // meter
    distance_to_elk: 80, // meter
    tv_width_px: 3840,
}
const inch_per_meter = 39.37

function calculate_elk_pixel_per_second(){
    let elk_speed_tv_ms = (settings.elk_speed * settings.distance_to_tv) / settings.distance_to_elk    
    let elk_speed_tv_px_sec = elk_speed_tv_ms * inch_per_meter * settings.px_density_tv
    return elk_speed_tv_px_sec
}
function calculate_elk_width(){
    let width_on_tv = settings.width_elk / settings.distance_to_elk * settings.distance_to_tv
    let width_in_inch = width_on_tv * inch_per_meter
    let width_in_pixel = width_in_inch * settings.px_density_tv
    return width_in_pixel
}
function calculate_path_width(){
    let path_width_tv = settings.elk_path / settings.distance_to_elk * settings.distance_to_tv
    let path_width_in_inch = path_width_tv * inch_per_meter
    let path_width_in_pixel = path_width_in_inch * settings.px_density_tv
    return path_width_in_pixel
}