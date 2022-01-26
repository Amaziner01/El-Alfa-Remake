
interface Vector {
    x: number,
    y: number
};

namespace Vector {
    export function init(x: number, y: number): Vector {
        return { x: x, y: y };
    }

    export function zero(): Vector {
        return { x: 0, y: 0 }
    }
};

interface GameObject {
    position: Vector;

    draw(ctx: CanvasRenderingContext2D): void;
    update(dt: number, keys: Array<boolean>, objects: Array<GameObject>): void;
};

class Paddle implements GameObject {
    position: Vector;
    size: Vector;

    constructor(position: Vector, size: Vector) {
        this.position = position;
        this.size = size;
    }

    update(dt: number, keys: Array<boolean>) {
        let vel = 500 * dt;
        if (keys[0]) this.position.x -= vel;
        if (keys[1]) this.position.x += vel;
    };

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "red";
        ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
    };
}

class Ball implements GameObject {
    position: Vector;
    velocity: Vector;
    radius: number;

    collX: boolean;
    collY: boolean;

    constructor(position: Vector, radius: number) {
        this.position = position;
        this.radius = radius;
        this.velocity = Vector.init(200, 200);

        this.collX = false;
        this.collY = false;
    }

    update(dt: number, keys: Array<boolean>, objects: Array<GameObject>) {
        // Collision with outer walls
        let futureY = this.position.y + this.velocity.y * dt;
        let futureX = this.position.x + this.velocity.x * dt;

        if (futureY + this.radius >= height) {
            let velY = height - this.position.y - this.radius;
            this.position.x += (velY * this.velocity.x) / this.velocity.y;
            this.position.y += velY;

            this.velocity.y = -this.velocity.y;
        }
        else if (futureY - this.radius <= 0) {
            let velY = this.position.y - this.radius;
            this.position.x += (velY * this.velocity.x) / this.velocity.y;
            this.position.y += velY;

            this.velocity.y = -this.velocity.y;
        }
        

        if (futureX + this.radius >= width) {
            let velX = width - this.position.x - this.radius;
            this.position.y += (velX * this.velocity.y) / this.velocity.x;
            this.position.x += velX;

            this.velocity.x = -this.velocity.x;
        }
        else if (futureX - this.radius <= 0) {
            let velX = this.position.x - this.radius;
            this.position.y += (velX * this.velocity.y) / this.velocity.x;
            this.position.x += velX;

            this.velocity.x = -this.velocity.x;
        }

        // paddle collision

        let bottomLimit = objects[1].position.y + (objects[1] as Paddle).size.y;
        let rightLimit = objects[1].position.x + (objects[1] as Paddle).size.x;
        let quadlimit = this.radius*Math.sin(Math.PI/4);


        if (this.position.x - quadlimit >= objects[1].position.x && this.position.x + quadlimit <= rightLimit) {
            if (futureY + this.radius >= objects[1].position.y) {
                let velY = objects[1].position.y - this.position.y - this.radius;
                this.position.x += (velY * this.velocity.x) / this.velocity.y;
                this.position.y += velY;
    
                this.velocity.y = -this.velocity.y;
            }
        }
        

        this.position.y += this.velocity.y * dt;
        this.position.x += this.velocity.x * dt;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();

        ctx.fillStyle = "green";
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fill();
    }
}

let keys = new Array(false, false);

function setUpInput() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        const leftBtn = document.getElementById('left-btn');
        const rightBtn = document.getElementById('right-btn');

        leftBtn!.addEventListener('touchstart', (e) => {
            keys[0] = true;
        });

        leftBtn!.addEventListener('touchend', (e) => {
            keys[0] = false;
        });

        rightBtn!.addEventListener('touchstart', (e) => {
            keys[1] = true;
        });

        rightBtn!.addEventListener('touchend', (e) => {
            keys[1] = false;
        });
    }
    else {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'a': keys[0] = true; break;
                case 'd': keys[1] = true; break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch (e.key) {
                case 'a': keys[0] = false; break;
                case 'd': keys[1] = false; break;
            }
        });
    }
}

const cvs = document.getElementById('cvs') as HTMLCanvasElement;
const ctx = cvs.getContext('2d');

const width = cvs.width;
const height = cvs.height;

let objectList = Array<GameObject>();
let last: number, dt: number = 0;

function main() {

    let paddle = new Paddle(Vector.init(10, height - 20), Vector.init(40, 10));
    let ball = new Ball(Vector.init(50, 50), 10);

    objectList.push(ball, paddle);

    setUpInput();

    last = performance.now();

    let update = () => {
        ctx!.clearRect(0, 0, width, height);

        objectList.forEach(obj => obj.draw(ctx!));
        objectList.forEach(obj => obj.update(dt, keys, objectList));

        let current = performance.now();
        dt = (current - last) / 1000;
        last = current;

        requestAnimationFrame(update);
    };

    update();
}

window.onload = main;