// cell width and height
var CELL_WIDTH = 101;
var CELL_HEIGHT = 83;
var PLAYER_LEFT_LIMIT = 0;
var PLAYER_RIGHT_LIMIT = CELL_WIDTH * 4;
var PLAYER_UP_LIMIT = CELL_HEIGHT * 0.3;
var PLAYER_DOWN_LIMIT = CELL_HEIGHT * (5 - 0.3);

var allPlayers = [
    'images/char-boy.png',
    'images/char-cat-girl.png',
    'images/char-horn-girl.png',
    'images/char-pink-girl.png',
    'images/char-princess-girl.png'
];

var collectItems = [
    'images/Gem Blue.png',
    'images/Gem Green.png',
    'images/Gem Orange.png',
];

/**
 * @description get a random integer between two values
 * @param {number} min - the result is greater than or equal to min
 * @param {number} max - the result is less than or equal to max
 * @returns {number} a integer
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 这是我们的玩家要躲避的敌人 
var Enemy = function () {
    // 要应用到每个敌人的实例的变量写在这里
    // 我们已经提供了一个来帮助你实现更多

    // 敌人的图片或者雪碧图，用一个我们提供的工具函数来轻松的加载文件
    this.sprite = 'images/enemy-bug.png';
};

// 此为游戏必须的函数，用来更新敌人的位置
// 参数: dt ，表示时间间隙
Enemy.prototype.update = function (dt) {
    // 你应该给每一次的移动都乘以 dt 参数，以此来保证游戏在所有的电脑上
    // 都是以同样的速度运行的
    this.x += this.speed * dt;
    if (this.x >= CELL_WIDTH * 5) {
        this.reset();
    }
};

// 此为游戏必须的函数，用来在屏幕上画出敌人，
Enemy.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * @description reset the enemy to left and random a row when it is out of the right boundary
 */
Enemy.prototype.reset = function () {
    this.x = -CELL_WIDTH;
    this.y = CELL_HEIGHT * (getRandomInt(1, 3) - 0.3);
    this.speed = CELL_WIDTH * getRandomInt(2, 5);
};

/**
 * @description check collision between enemies and player
 * @returns {Boolean} collision will return true
 */
Enemy.prototype.checkCollision = function () {
    var collided = false;

    if (this.y - 0.5 < player.y && player.y < this.y + 0.5 &&
        player.x < this.x + CELL_WIDTH * 0.5 && this.x < player.x + CELL_WIDTH * 0.5) {
        player.collided = true;
        collided = true;
    }

    return collided;
};

// 现在实现你自己的玩家类
// 这个类需要一个 update() 函数， render() 函数和一个 handleInput()函数
var Player = function () {
    this.ready = false;
    this.currentSelected = 0;
    this.sprite = '';
    this.score = 0;
};

/**
 * @description reset player's position when collision happened
 */
Player.prototype.update = function () {
    if (this.collided) {
        this.reset();
    }
};

/**
 * @description display all characters that could be selected or the current player afte selected
 */
Player.prototype.render = function () {
    if (this.ready) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    } else {
        ctx.drawImage(Resources.get('images/Selector.png'), CELL_WIDTH * this.currentSelected, PLAYER_DOWN_LIMIT);
        for (var i = 0; i < allPlayers.length; i++) {
            ctx.drawImage(Resources.get(allPlayers[i]), CELL_WIDTH * i, PLAYER_DOWN_LIMIT);
        }

        ctx.clearRect(0, ctx.canvas.height, ctx.canvas.width, -16);
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Press Enter to select a character', ctx.canvas.width / 2, ctx.canvas.height);
    }

    this.displayScore();
};

/**
 * @description display the score on top right
 */
Player.prototype.displayScore = function () {
    ctx.clearRect(505, 0, -100, 20);
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Score ' + this.score, 500, 20);
};

/**
 * @description reset the player's position to the bottom when reach the river or collided by enemy
 */
Player.prototype.reset = function () {
    this.collided = false;
    this.x = CELL_WIDTH * this.currentSelected;
    this.y = PLAYER_DOWN_LIMIT;
};

/**
 * @description select characters or move the player by use of arrows and constrain the player in boundary
 * @param {string} direction - the direction by keyboard input
 */
Player.prototype.handleInput = function (direction) {
    if (!direction) {
        return;
    }

    if (this.ready) {
        if (direction === 'left') {
            this.x -= CELL_WIDTH;
            if (this.x < PLAYER_LEFT_LIMIT) {
                this.x = PLAYER_LEFT_LIMIT;
            }
        } else if (direction === 'right') {
            this.x += CELL_WIDTH;
            if (this.x > PLAYER_RIGHT_LIMIT) {
                this.x = PLAYER_RIGHT_LIMIT;
            }
        } else if (direction === 'up') {
            this.y -= CELL_HEIGHT;
            if (this.y < PLAYER_UP_LIMIT) {
                this.score += 10;
                this.reset();
            }
        } else if (direction === 'down') {
            this.y += CELL_HEIGHT;
            if (this.y > PLAYER_DOWN_LIMIT) {
                this.y = PLAYER_DOWN_LIMIT;
            }
        }
    } else {
        if (direction === 'left') {
            this.currentSelected--;
            if (this.currentSelected < 0) {
                this.currentSelected = allPlayers.length - 1;
            }
        } else if (direction === 'right') {
            this.currentSelected++;
            if (this.currentSelected >= allPlayers.length) {
                this.currentSelected = 0;
            }
        } else if (direction === 'enter') {
            this.sprite = allPlayers[this.currentSelected];
            this.ready = true;
            this.reset();
            ctx.clearRect(0, ctx.canvas.height, ctx.canvas.width, -16);
        }
    }
};

/**
 * @description Collectible item
 * @constructor
 */
var Item = function () {
    this.reset();
};

/**
 * @description add score and genreate a new item when player get item
 */
Item.prototype.update = function () {
    if (this.collided) {
        player.score += 5;
        this.reset();
    }
};

Item.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * @description set item image and position
 */
Item.prototype.reset = function () {
    this.collided = false;
    this.sprite = collectItems[getRandomInt(0, collectItems.length - 1)];
    this.x = CELL_WIDTH * getRandomInt(0, 4);
    this.y = CELL_HEIGHT * (getRandomInt(1, 3) - 0.3);
};

/**
 * @description check player get item
 */
Item.prototype.checkCollision = function () {
    this.collided = this.y - 0.5 < player.y && player.y < this.y + 0.5 &&
        player.x < this.x + CELL_WIDTH * 0.5 && this.x < player.x + CELL_WIDTH * 0.5;
};

// 现在实例化你的所有对象
// 把所有敌人的对象都放进一个叫 allEnemies 的数组里面
// 把玩家对象放进一个叫 player 的变量里面
var allEnemies = [];
var player = new Player();
var item = new Item();

/**
 * @description init the enemies
 */
function Init() {
    var enemy;

    for (var i = 0; i < 3; i++) {
        enemy = new Enemy();
        enemy.reset();
        allEnemies.push(enemy);
    }
}

// 这段代码监听游戏玩家的键盘点击事件并且代表将按键的关键数字送到 Play.handleInput()
// 方法里面。你不需要再更改这段代码了。
document.addEventListener('keyup', function (e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        13: 'enter'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

Init();