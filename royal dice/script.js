var height = 20;
var width = 20;
var turn;
var numUserSubmarines = 0;
var numKillerSubmarines = 0;
var numFuel = 0;
var numObstacles = 0;
var running = false;
var gameOver = false;
var lvl =
`1111111
1000001
1000001
1000001
1000001
1000001
1111111`.split`
`.map(x=>x.split``);
var cube = {
  'top': 1,
  'up': 2,
  'left': 5,
  'right': 4,
  'down: 3,
  'bottom': 6,
  'x': 4,
  'y': 4,
  'z': 0,
  'moveUpByOne': () => {
    if (checkMoveBlock(this.x-1, this.y)) {
      this.x = this.x - 1;
      [this.top, this.down, this.bottom, this.up] = [this.down, this.bottom, this.up, this.top];
      reRender();
      return true;
    } else {
      return false;
    }},
  'moveDownByOne': () => {
    if (checkMoveBlock(this.x + 1, this.y)) {
      this.x = this.x + 1;
      [this.top, this.down, this.bottom, this.up] = [this.up, this.top, this.down, this.bottom];
      reRender();
      return true;
    } else {
      return false;
    }},
  'moveLeftByOne': () => {
    if (checkMoveBlock(this.x, this.y - 1)) {
      this.y = this.y - 1;
      [this.top, this.right, this.bottom, this.left] = [this.right, this.bottom, this.left, this.top];
      reRender();
      return true;
    } else {
      return false;
    }},
  'moveRightByOne': () => {
    if (checkMoveBlock(this.x, this.y + 1)) {
      this.y = this.y + 1;
      [this.top, this.right, this.bottom, this.left] = [this.left, this.top, this.right, this.bottom];
      reRender();
      return true;
    } else {
      return false;
    }},
  'moveUp': () => {
    var steps = this.top;
    for (var i = 0; i < steps && this.moveUpByOne(); i++) ;
    reRender();
  }
  'moveDown': () => {
    var steps = this.top;
    for (var i = 0; i < steps && this.moveDownByOne(); i++) ;
    reRender();
  }
  'moveLeft': () => {
    var steps = this.top;
    for (var i = 0; i < steps && this.moveLeftByOne(); i++) ;
    reRender();
  }
  'moveRight': () => {
    var steps = this.top;
    for (var i = 0; i < steps && this.moveRightByOne(); i++) ;
    reRender();
  }
}

//entry point

 function run(){
init();
}

function init(){
createGrid();
}

//generate the grid

function createGrid(){

  document.write("<table>");

  for (var y = 0; y < height; y++){
      document.write("<tr>");
      for (var x = 0; x < width; x++){
        switch (lvl[x][y]) {
          case '1':
              document.write("<td class = 'wall' id = "+ x + "-" + y +"></td>");
            break;
          case '0':
              document.write("<td class = 'blank' id = "+ x + "-" + y +"></td>");
            break;
          default:
            document.write("<td class = 'ground' id = "+ x + "-" + y +"></td>");
        }
        if (cube.x == x && cube.y == y){
          
        }
      }
      document.write("</tr>");
  }

  document.write("</table>");

}


run();

function reRender() {
  
}










// keys
var keys={};
function keyObject(name) {
  return {
    'key': name,
    'pressed': false,
    'down':e=>{},
    'up':e=>{},
    'downTrue':e=>{if (!pressed) {pressed = true;down(e);}},
    'upTrue':e=>{pressed = false;up(e);}
  }
}
[...`1234567890-=qwertyuiop[]\\asdfghjkl;'zxcvbnm,.\/ !@#\$%^&*()_+AAAAWERTYUIOP\{\}|ASDFGHJKL:"ZXCVBNM<>?`].forEach(x=>keys[x]=keyObject(x))

function keyDown(event) {
  keys[event.key] ? keys[event.key].down(event) : (keys[event.key]=keyObject(event.key)).down(event);
}

function keyUp(event) {
  keys[event.key] ? keys[event.key].up(event) : (keys[event.key]=keyObject(event.key)).up(event);
}

keys['w'].down = keys['8'].down = e => {
  rollCubeUp();
}

keys['s'].down = keys['2'].down = e => {
  rollCubeDown();
}

keys['s'].down = keys['2'].down = e => {
  rollCubeDown();
}
