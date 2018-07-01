
const robots = [];

function getPlayerName() {
  return document.getElementById('player_name').value || 'Your robot';
}

function getEnemyName() {
  var e = document.getElementById('enemy_selected');
  return e.options[e.selectedIndex].text;
}

getRobot('robot.js', (robotCode) => {
  const robotName = getPlayerName();
  addRobot({ code: robotCode, name: robotName });
  var editor = ace.edit('editor');
  editor.setValue(robotCode);
  getRobot('dummy-robot.js', (robotCode) => {
    document.querySelector('.enemy_1 > textarea').value = robotCode;
    addRobot({ code: robotCode, name: getEnemyName() });
    getRobot('advanced-robot.js', (robotCode) => {
      addRobot({ code: robotCode, name: 'Advanced robot' });
      window.launchGame([robots[0], robots[1]]);
    });
  });
});

function addRobot(robotCode) {
  try {
    const robot = eval('(() => { ' + robotCode.code + ' })();');
    robots.push({ code: robot, name: robotCode.name, asStr: robotCode.code });
  } catch (e) {
    console.error(e);
  }
}

function modifyRobot(index, robotCode) {
  try {
    const robot = eval('(() => { ' + robotCode.code + ' })();');
    robots[index] = { code: robot, name: robotCode.name, asStr: robotCode.code };
  } catch (e) {
    console.error(e);
  }
}

function getRobot(url, cb) {
  fetch(url).then(response => response.text()).then(html => cb(html));
}
