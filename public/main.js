"use strict";
;
var Vector;
(function (Vector) {
    function init(x, y) {
        return { x: x, y: y };
    }
    Vector.init = init;
    function zero() {
        return { x: 0, y: 0 };
    }
    Vector.zero = zero;
})(Vector || (Vector = {}));
;
;
class Paddle {
    constructor(position, size) {
        this.position = position;
        this.size = size;
    }
    update(dt, keys) {
        let vel = 500 * dt;
        if (keys[0])
            this.position.x -= vel;
        if (keys[1])
            this.position.x += vel;
    }
    ;
    draw(ctx) {
        ctx.fillStyle = "red";
        ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
    }
    ;
}
class Ball {
    constructor(position, radius) {
        this.position = position;
        this.radius = radius;
        this.velocity = Vector.init(200, 200);
        this.collX = false;
        this.collY = false;
    }
    update(dt, keys, objects) {
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
        let bottomLimit = objects[1].position.y + objects[1].size.y;
        let rightLimit = objects[1].position.x + objects[1].size.x;
        let quadlimit = this.radius * Math.sin(Math.PI / 4);
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
    draw(ctx) {
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
        leftBtn.addEventListener('touchstart', (e) => {
            keys[0] = true;
        });
        leftBtn.addEventListener('touchend', (e) => {
            keys[0] = false;
        });
        rightBtn.addEventListener('touchstart', (e) => {
            keys[1] = true;
        });
        rightBtn.addEventListener('touchend', (e) => {
            keys[1] = false;
        });
    }
    else {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'a':
                    keys[0] = true;
                    break;
                case 'd':
                    keys[1] = true;
                    break;
            }
        });
        document.addEventListener('keyup', (e) => {
            switch (e.key) {
                case 'a':
                    keys[0] = false;
                    break;
                case 'd':
                    keys[1] = false;
                    break;
            }
        });
    }
}
const cvs = document.getElementById('cvs');
const ctx = cvs.getContext('2d');
const width = cvs.width;
const height = cvs.height;
let objectList = Array();
let last, dt = 0;
function main() {
    let paddle = new Paddle(Vector.init(10, height - 20), Vector.init(40, 10));
    let ball = new Ball(Vector.init(50, 50), 10);
    objectList.push(ball, paddle);
    setUpInput();
    last = performance.now();
    let update = () => {
        ctx.clearRect(0, 0, width, height);
        objectList.forEach(obj => obj.draw(ctx));
        objectList.forEach(obj => obj.update(dt, keys, objectList));
        let current = performance.now();
        dt = (current - last) / 1000;
        last = current;
        requestAnimationFrame(update);
    };
    update();
}
window.onload = main;
