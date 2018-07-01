
  var Robot = function() {
  };

  Robot.prototype.onIdle = function(robot) {
    robot.ahead(60);
    robot.rotateCannon(360);
    robot.back(60);
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
