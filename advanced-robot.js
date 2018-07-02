
  var Robot = function() {
  };

  Robot.prototype.onIdle = function(robot) {
    robot.ahead(30);
    robot.rotateCannon(360);
    robot.back(30);
    robot.rotateCannon(360);
  };

  Robot.prototype.onScannedRobot = function(robot) {
    robot.stop(10);
    robot.fire();
    robot.turnRight(30);
  };

  Robot.prototype.onWallCollision = function(robot) {
    robot.back(50);
    robot.turn(30);
  };

  Robot.prototype.onHitByBullet = function(robot) {
    robot.turn(20);
    robot.ahead(40);
    if (robot.health < 4) { robot.disappear(); }
  };
  return Robot;
