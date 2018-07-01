
const robots = [];

function getPlayerName() {
  return document.getElementById('player_name').value || 'Your robot';
}

function getEnemyName() {
  var e = document.getElementById('enemy_selected');
  return e.options[e.selectedIndex].text;
}

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
