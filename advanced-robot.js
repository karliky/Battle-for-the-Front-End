
  var Robot = function() {

  };

  Robot.prototype.onIdle = function(robot) {
    robot.ahead(100);
    robot.rotateCannon(360);
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
    robot.turn(30);
    robot.ahead(30);
  };
  return Robot;
