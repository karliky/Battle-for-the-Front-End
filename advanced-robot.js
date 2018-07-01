
  var Robot = function() {
    console.log('Advanceddd!!!')
  };

  Robot.prototype.onIdle = function(robot) {
    robot.ahead(20);
    robot.rotateCannon(90);
    robot.turn(20);
  };

  Robot.prototype.onScannedRobot = function(robot) {
    robot.fire();
  };

  Robot.prototype.onWallCollision = function(robot, up, down, left, right) {
    robot.turn(60);
    robot.ahead(30);
  };

  Robot.prototype.onHitByBullet = function(robot) {
    robot.disappear();
    robot.ahead(30);
    robot.turn(30);
  };
  return Robot;
