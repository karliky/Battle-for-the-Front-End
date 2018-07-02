var game;
window.launchGame = (function(robotsCode, cb) {

  var land;
  var enemies;
  var robots;
  var enemiesTotal = 2;
  var explosions;
  var logo;

  var BOARD_SIZE_WIDTH = window.BOARD_SIZE_WIDTH || 800;
  var BOARD_SIZE_HEIGHT = window.BOARD_SIZE_HEIGHT || 500;

  const Phaser = window.Phaser;
  const EnemyTank = function (index, game, bullets) {

    var x = generateRandomInteger(200, game.world.width - 200);
    var y = generateRandomInteger(200, game.world.height - 200);
    this.game = game;
    this.health = 10;
    this.maxhealth = 10;

    this.bullets = bullets;
    this.fireRate = 800;
    this.nextFire = 0;
    this.nextStepTime = 0;
    this.nextStepFireRate = 1000;
    this.alive = true;

    var selectedColor = isEven(index) ? 'tank' : 'enemy';

    this.shadow = game.add.sprite(x, y, selectedColor, 'shadow');
    this.tank = game.add.sprite(x, y, selectedColor, 'tank1');
    this.turret = game.add.sprite(x, y, selectedColor, 'turret');

    this.shadow.anchor.set(0.5);
    this.tank.anchor.set(0.5);
    this.turret.anchor.set(0.3, 0.5);

    this.tank.name = index.toString();
    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.immovable = false;
    this.tank.body.collideWorldBounds = true;
    this.tank.body.bounce.setTo(1, 1);
    var style = {
      font: '16px Arial',
      fill: (this.tank.name === '0') ? '#41f477' : '#f44242'
    };
    this.text = game.add.text(0, 0, robotsCode[this.tank.name].name, style);
    this.text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);

    var healthBar = game.add.bitmapData(128, 128);

    healthBar.ctx.beginPath();
    healthBar.ctx.rect(0, 0, 70, 10);
    healthBar.ctx.fillStyle = '#4286f4';
    healthBar.ctx.fill();

    this.healthBar = game.add.sprite(200, 200, healthBar);

    this.tank.angle = game.rnd.angle();
    this.turret.angle = this.tank.angle;

    //  The enemies bullet group
    this.enemyBullets = game.add.group();
    this.enemyBullets.enableBody = true;
    this.enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.enemyBullets.createMultiple(100, 'bullet');

    this.enemyBullets.setAll('anchor.x', 0.5);
    this.enemyBullets.setAll('anchor.y', 0.5);
    this.enemyBullets.setAll('outOfBoundsKill', true);
    this.enemyBullets.setAll('checkWorldBounds', true);

    this.tank.bringToTop();
    this.turret.bringToTop();

    // world bounds
    this.tank.body.onWorldBounds = new Phaser.Signal();
    this.tank.body.onWorldBounds.add((robotHit, up, down, left, right) => {
      const robot = robots[robotHit.name];
      const robotEnemy = enemies[robotHit.name];
      if (game.time.now > robotEnemy.nextStepTime) {
        robotEnemy.nextStepTime = game.time.now + robotEnemy.nextStepFireRate;
        if (robot && robot.onWallCollision) {
          if (robot.onWallCollision.getBody().length > 5) robotEnemy.resetSteps();
          robot.onWallCollision(robotEnemy, up, down, left, right);
        }
      }
    }, this);
  };

  EnemyTank.prototype.update = function(iteration) {

    this.text.x = this.tank.x - 35;
    this.text.y = this.tank.y + 33;

    this.healthBar.x = this.tank.x - 35;
    this.healthBar.y = this.tank.y + 50;

    this.shadow.x = this.tank.x;
    this.shadow.y = this.tank.y;
    this.shadow.rotation = this.tank.rotation;

    this.turret.x = this.tank.x;
    this.turret.y = this.tank.y;

    for (var i = 0; i < enemies.length; i++) {
      if (iteration === i) continue;
      game.physics.arcade.overlap(this.enemyBullets, enemies[i].tank, bulletHitEnemy, null, this);
    }
  };

  game = new Phaser.Game(BOARD_SIZE_WIDTH, BOARD_SIZE_HEIGHT, Phaser.AUTO, 'phaser-example', {
    preload,
    create,
    update,
    render
  });

  function preload () {
    game.load.atlas('tank', 'tanks.png', 'tanks.json');
    game.load.atlas('enemy', 'enemy-tanks.png', 'tanks.json');
    game.load.image('logo', 'logo.png');
    game.load.image('bullet', 'bullet.png');
    game.load.image('earth', 'scorched_earth.png');
    game.load.spritesheet('kaboom', 'explosion.png', 64, 64, 23);
  }

  function create () {

    //  Resize our game world to be a 2000 x 2000 square
    game.world.setBounds(0, 0, BOARD_SIZE_WIDTH, BOARD_SIZE_HEIGHT);

    //  Our tiled scrolling background
    land = game.add.tileSprite(0, 0, BOARD_SIZE_WIDTH, BOARD_SIZE_HEIGHT, 'earth');
    land.fixedToCamera = true;

    //  Create some baddies to waste :)
    enemies = [];
    robots = [];

    for (var i = 0; i < enemiesTotal; i++) {
      const robot = new EnemyTank(i, game);
      enemies.push(robot);
      const newRobot = robotsCode[i].code;
      const extendedRobot = new newRobot(_extendRobot(robot));
      robots.push(extendedRobot);
    }

    //  Explosion pool
    explosions = game.add.group();

    for (var j = 0; j < 10; j++) {
      var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
      explosionAnimation.anchor.setTo(0.5, 0.5);
      explosionAnimation.animations.add('kaboom');
    }

    game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    game.camera.focusOnXY(0, 0);
    for (var x = 0; x < robots.length; x++) {
      robots[x].onIdle(enemies[x]);
    }

    logo = game.add.sprite(0, 200, 'logo');
    logo.fixedToCamera = true;
    logo.visible = false;
  }

  function update () {
    const aliveEnemies = enemies.filter((enemy) => enemy.alive);
    if (aliveEnemies.length === 1) {
      game.paused = true;
      if (cb) return cb(null, aliveEnemies[0]);
    }
    for (var i = 0; i < enemies.length; i++) {
      if (enemies[i].alive) {
        enemies[i].update(i);
        enemies[i].lookAround();
        enemies[i].nextStep({ robot: enemies[i] });
      }
    }
  }

  function bulletHitEnemy (tank, bullet) {
    bullet.kill();
    if (enemies[tank.name].tank.alpha !== 1) return;
    var destroyed = enemies[tank.name].damage();
    const healthBar = enemies[tank.name].healthBar;
    healthBar.width = healthBar.width - healthBar.width / enemies[tank.name].health + 1;
    const robot = enemies[tank.name];
    if (!destroyed) {
      if (robots[tank.name].onHitByBullet.getBody().length > 5) robot.resetSteps();
      robots[tank.name].onHitByBullet(robot);
    } else {
      var explosionAnimation = explosions.getFirstExists(false);
      explosionAnimation.reset(tank.x, tank.y);
      explosionAnimation.play('kaboom', 30, false, true);
    }
  }


  function render () {
  }

  function _extendRobot(robot) {
    let progress = 0;
    let index = 0;
    let newStep = true;
    let steps = [];
    let disappearCount = 2;
    let nextLookAroundFireRate = 500;
    let nextLookAround = 0;
    robot.damage = function() {
      this.health -= 1;
      if (this.health <= 0) {
        this.alive = false;
        this.shadow.kill();
        this.tank.kill();
        this.turret.kill();
        this.tank.alive = false;
        return true;
      }
      return false;
    };
    robot.clone = () => {};
    robot.ahead = (units) => {
      steps.push({ type: 'ahead', units });
    };
    robot.stop = (units) => {
      steps.push({ type: 'stop', units });
    };
    robot.turnRight = (units) => {
      steps.push({ type: 'turnRight', units });
    };
    robot.turnLeft = (units) => {
      steps.push({ type: 'turnLeft', units });
    };
    robot.back = (units) => {
      steps.push({ type: 'back', units });
    };
    robot.rotateCannon = (units) => {
      steps.push({ type: 'rotateCannon', units });
    };
    robot.turn = (units) => {
      steps.push({ type: 'turn', units });
    };
    robot.disappear = () => {
      robot.makeDisappear();
    };
    robot.fire = () => {
      if (hasDisappeared()) return;
      if (game.time.now > robot.nextFire && robot.enemyBullets.countDead() > 0) {
        robot.nextFire = robot.game.time.now + robot.fireRate;
        var bullet = robot.enemyBullets.getFirstDead();
        bullet.reset(robot.turret.x, robot.turret.y);
        bullet.rotation = robot.turret.rotation;
        game.physics.arcade.velocityFromRotation(robot.turret.rotation, 800, bullet.body.velocity);
      }
    };
    robot.moveBack = (units) => {
      if (newStep) progress = units;
      newStep = false;
      if (progress > 0) {
        game.physics.arcade.velocityFromRotation(robot.tank.rotation, -120, robot.tank.body.velocity);
      } else {
        game.physics.arcade.velocityFromRotation(robot.tank.rotation, 0, robot.tank.body.velocity);
        newStep = true;
        index++;
      }
      progress -= 1;
    };
    robot.moveAhead = (units) => {
      if (newStep) progress = units;
      newStep = false;
      if (progress > 0) {
        game.physics.arcade.velocityFromRotation(robot.tank.rotation, 120, robot.tank.body.velocity);
      } else {
        game.physics.arcade.velocityFromRotation(robot.tank.rotation, 0, robot.tank.body.velocity);
        newStep = true;
        index++;
      }
      progress -= 1;
    };
    function toDegrees(radians) {
      let result = radians * 180 / Math.PI;
      if (result < 0) result += 360;
      return Math.ceil(result);
    }
    robot.lookAround = () => {
      for (var i = 0; i < enemies.length; i++) {
        var enemy = enemies[i];
        if (robot.tank.name === enemy.tank.name) continue;
        if (!enemy.alive || hasDisappeared()) continue;

        var angleRadians = Math.atan2(enemy.tank.y - robot.tank.y, enemy.tank.x - robot.tank.x);
        var rotationDeg = toDegrees(robot.turret.rotation);
        var angleDeg = toDegrees(angleRadians);
        if (enemy.tank.alpha !== 1) continue;
        if (rotationDeg >= angleDeg - 4 && rotationDeg <= angleDeg + 4) {
          var a = enemy.tank.x - robot.tank.x;
          var b = enemy.tank.y - robot.tank.y;
          var distance = Math.sqrt(a * a + b * b);
          if (game.time.now > nextLookAround) {
            if (robots[robot.tank.name].onScannedRobot.getBody().length > 21) robot.resetSteps();
            nextLookAround = game.time.now + nextLookAroundFireRate;
            robots[robot.tank.name].onScannedRobot(robot, Math.ceil(distance));
          }
        }
      }
    };
    robot.rotateTurret = (units) => {
      if (newStep) progress = units;
      newStep = false;
      if (progress > 0) {
        robot.turret.angle += 2;
        game.physics.arcade.velocityFromRotation(robot.tank.rotation, 0, robot.tank.body.velocity);
      } else {
        newStep = true;
        index++;
      }
      robot.lookAround();
      progress -= 2;
    };
    robot.stopMovement = (units) => {
      if (newStep) progress = units;
      newStep = false;
      if (progress > 0) {
        game.physics.arcade.velocityFromRotation(robot.tank.rotation, 0, robot.tank.body.velocity);
      } else {
        game.physics.arcade.velocityFromRotation(robot.tank.rotation, 0, robot.tank.body.velocity);
        newStep = true;
        index++;
      }
      robot.lookAround();
      progress -= 1;
    };
    robot.turnAround = (units) => {
      if (newStep) progress = units;
      newStep = false;
      if (progress > 0) {
        robot.tank.angle += 2;
        robot.turret.angle += 2;
        game.physics.arcade.velocityFromRotation(robot.tank.rotation, 0, robot.tank.body.velocity);
      } else {
        newStep = true;
        index++;
      }
      progress -= 2;
    };
    robot._turnLeft = (units) => robot.turnAround(units);
    robot._turnRight = (units) => {
      if (newStep) progress = units;
      newStep = false;
      if (progress > 0) {
        robot.tank.angle -= 2;
        robot.turret.angle -= 2;
        game.physics.arcade.velocityFromRotation(robot.tank.rotation, 0, robot.tank.body.velocity);
      } else {
        newStep = true;
        index++;
      }
      progress -= 2;
    };
    function hasDisappeared() {
      const myTank = enemies[robot.tank.name];
      return (myTank.tank.alpha === 1) ? false : true;
    }
    robot.makeDisappear = () => {
      const myTank = enemies[robot.tank.name];
      if (disappearCount === 0 || myTank.tank.alpha !== 1) return;
      myTank.tank.alpha = 0.4;
      myTank.turret.alpha = 0.4;
      disappearCount--;
      setTimeout(() => {
        myTank.tank.alpha = 1;
        myTank.turret.alpha = 1;
      }, 2500);
    };
    robot.resetSteps = () => {
      steps = [];
      newStep = true;
      progress = 0;
      index = 0;
    };
    robot.getSteps = () => {
      return steps;
    };
    robot.setSteps = (_steps) => {
      steps = _steps;
    };
    robot.getIndex = () => {
      return index;
    };
    robot.setIndex = (_index) => {
      steps = _index;
    };
    robot.nextStep = () => {
      const currStep = steps[index];
      if (!currStep) {
        robot.resetSteps();
        robots[robot.tank.name].onIdle(enemies[robot.tank.name]);
        return;
      }
      if (currStep.type === 'ahead') robot.moveAhead(currStep.units || 10);
      if (currStep.type === 'back') robot.moveBack(currStep.units || 10);
      if (currStep.type === 'rotateCannon') robot.rotateTurret(currStep.units || 10);
      if (currStep.type === 'turn') robot.turnAround(currStep.units || 10);
      if (currStep.type === 'turnRight') robot._turnRight(currStep.units || 10);
      if (currStep.type === 'turnLeft') robot._turnLeft(currStep.units || 10);
      if (currStep.type === 'fire') robot.fire();
      if (currStep.type === 'stop') robot.stopMovement(currStep.units || 10);
      if (currStep.type === 'disappear') robot.makeDisappear(100);
      robot.lookAround();
    };
    return robot;
  }

  function generateRandomInteger(min, max) {
    return Math.floor(min + Math.random() * (max + 1 - min));
  }

  function isEven(n) {
    return n % 2 === 0;
  }

});

window.destroyGame = () => {
  game.destroy();
};

Function.prototype.getBody = function() {
  // Get content between first { and last }
  var m = this.toString().match(/\{([\s\S]*)\}/m)[1];
  // Strip comments
  return m.replace(/^\s*\/\/.*$/mg,'');
};
