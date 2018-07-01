
  var Robot = function() {
  };

  Robot.prototype.onIdle = function(robot) {
    robot.ahead(30);
    robot.rotateCannon(360);
    robot.back(30);
    robot.rotateCannon(360);
  };

  Robot.prototype.onScannedRobot = function(robot) {
    robot.fire();
  };

  Robot.prototype.onWallCollision = function(robot) {

  };

  Robot.prototype.onHitByBullet = function(robot) {

  };
  return Robot;
