//Tetris Snake

document.addEventListener("DOMContentLoaded", onStart);
let gameState = {};
function onStart()
{
  localStorage.setItem("Snake2048Discovered", "true");
  ;(() => {
    function main(tFrame) {
      gameState.stopMain = window.requestAnimationFrame(main);
      const nextTick = gameState.lastTick + gameState.tickLength;
      let numTicks = 0;
  
      // If tFrame < nextTick then 0 ticks need to be updated (0 is default for numTicks).
      // If tFrame = nextTick then 1 tick needs to be updated (and so forth).
      // Note: As we mention in summary, you should keep track of how large numTicks is.
      // If it is large, then either your game was asleep, or the machine cannot keep up.
      if (tFrame > nextTick) {
        const timeSinceTick = tFrame - gameState.lastTick;
        numTicks = Math.floor(timeSinceTick / gameState.tickLength);
      }
  
      queueUpdates(numTicks);
      render(tFrame);
      gameState.lastRender = tFrame;
    }
  
    function queueUpdates(numTicks) {
      for (let i = 0; i < numTicks; i++) {
        gameState.lastTick += gameState.tickLength; // Now lastTick is this tick.
        update(gameState.lastTick);
      }
    }
  
    gameState.lastTick = performance.now();
    gameState.lastRender = gameState.lastTick; // Pretend the first draw was on first update.
    gameState.tickLength = 400; 
  
    setInitialState();
    main(performance.now()); // Start the cycle
  })();
}

function setInitialState() {
  gameState.gridHeight = 9;
  gameState.gridWidth = 9;
  gameState.score = 0;
  gameState.scoreToWin = 50;
  gameState.direction = 0;
  gameState.lastDirection = 0;
  gameState.snakeHead = [5,6];
  gameState.snakeTailNumbers = [];
  gameState.snakeTailCoords = [];
  gameState.face = `<pre><b>o_o`;
  gameState.faceIsUpsideDown = false;
  createGrid();
  createRandomApple(true);
  // createTrackers();
  document.addEventListener("keydown", keyHandler, false);
  updateGrid();
}
function render()
{
  if (gameState.doRedraw)
    updateGridVisuals();
}

function update(lastTick)
{
  if (gameState.gameWon) return;
  gameState.grid = gameState.grid.map(a=>a.map(x=> x == -1 ? 0 : x));
  for(let i = gameState.snakeTailNumbers.length-1; i >0 ; i--) {
    if (gameState.snakeTailNumbers[i-1] == gameState.snakeTailNumbers[i]) {
      gameState.snakeTailNumbers[i-1] += gameState.snakeTailNumbers[i];
      gameState.snakeTailNumbers.splice(i,1);
      gameState.snakeTailCoords = gameState.snakeTailCoords.slice(-gameState.snakeTailNumbers.length);
      if (!gameState.snakeTailNumbers.length)gameState.snakeTailCoords = [];
      gameState.grid[gameState.snakeTailCoords[i-1][0]][gameState.snakeTailCoords[i-1][1]] = -1;
      updateGridVisuals();
      return;
    }
  }

  switch(gameState.direction) {
    case 0:
      gameState.nextSnakeHead = [(gameState.snakeHead[0]-1 + gameState.gridHeight) % gameState.gridHeight,gameState.snakeHead[1]];
      break;
    case 1:
      gameState.nextSnakeHead = [gameState.snakeHead[0],(gameState.snakeHead[1]-1 + gameState.gridWidth) % gameState.gridWidth];
      break;
    case 2:
      gameState.nextSnakeHead = [(gameState.snakeHead[0]+1) % gameState.gridHeight,gameState.snakeHead[1]];
      break;
    case 3:
      gameState.nextSnakeHead = [gameState.snakeHead[0],(gameState.snakeHead[1]+1) % gameState.gridWidth];
      break;
  }

  if (gameState.snakeTailCoords.some(x=> x[0] == gameState.nextSnakeHead[0] && x[1] == gameState.nextSnakeHead[1])) {
    let cutoffIndex = -1;
    for (let i = gameState.snakeTailCoords.length - 1; i>=0;i--) {
      if (gameState.snakeTailCoords[i][0] == gameState.nextSnakeHead[0] && gameState.snakeTailCoords[i][1] == gameState.nextSnakeHead[1]) {
        cutoffIndex = i;
      }
      if (i <= cutoffIndex) {
        gameState.grid[gameState.snakeTailCoords[i][0]][gameState.snakeTailCoords[i][1]] = gameState.snakeTailNumbers[i];
      }
    }
    if (cutoffIndex != -1) {
      gameState.snakeTailCoords = gameState.snakeTailCoords.slice(cutoffIndex+1);
      gameState.snakeTailNumbers = gameState.snakeTailNumbers.slice(cutoffIndex+1);
    }
  }

  if (gameState.grid[gameState.nextSnakeHead[0]][gameState.nextSnakeHead[1]] > 0) {
    gameState.snakeTailNumbers.push(gameState.grid[gameState.nextSnakeHead[0]][gameState.nextSnakeHead[1]]);
    gameState.grid[gameState.nextSnakeHead[0]][gameState.nextSnakeHead[1]] = 0;
  }

  gameState.snakeTailCoords.push([gameState.snakeHead[0], gameState.snakeHead[1]]);
  gameState.snakeTailCoords = gameState.snakeTailCoords.slice(-gameState.snakeTailNumbers.length);
  if (!gameState.snakeTailNumbers.length)gameState.snakeTailCoords = [];
  gameState.snakeHead = gameState.nextSnakeHead;

  gameState.lastDirection = gameState.direction;
  updateGrid();
  if (!gameState.grid.some(x=>x.some(y => y != 0)) || (+gameState.appleCounter > 6 && Math.random() < .4)) {createRandomApple(); gameState.appleCounter = 0}
  else {gameState.appleCounter = gameState.appleCounter ? gameState.appleCounter+1 : 1;} 
  
  if (gameState.snakeTailNumbers.some(x => x == 2048)) gameWon();
  // console.log(lastTick);
}


function keyHandler(event) {
  if (event.keyCode == '38' || event.keyCode == '87' || event.keyCode == '90') {
      // up arrow
      event.preventDefault();
      move(0);
  }
  else if (event.keyCode == '37'  || event.keyCode == '65' || event.keyCode == '81') {
     // left arrow
      event.preventDefault();
      move(1);
  }
  else if (event.keyCode == '40' || event.keyCode == '83') {
      // down arrow
      event.preventDefault();
      move(2);
  }
  else if (event.keyCode == '39' || event.keyCode == '68') {
     // right arrow
      event.preventDefault();
      move(3);
  }
  else if (event.keyCode == '8') {
     // backspace
     window.location.assign("../index.html");
  }
}
function move(direction) {
  if (gameState.doingStuff) return;
  else if (gameState.looking) {
    gameState.looking = false;
    if (gameState.gameLost) document.getElementById("lossScreen").style.display="";
    else if (gameState.gameWon) document.getElementById("winScreen").style.display="";
    return;
  }
  else if (gameState.gameLost) {
    if (direction == 1) window.location.assign("../index.html");
    else if (direction == 0) location.replace(location.href);
    else if (direction == 2) {document.getElementById("lossScreen").style.display="none"; gameState.looking = true;}
    return;
  }
  else if (gameState.gameWon) {
    if (direction == 1) window.location.assign("../index.html");
    else if (direction == 0) location.replace(location.href);
    else if (direction == 3) {gameState.gameWon = false; gameWon = _=>{};gameWon();document.getElementById("winScreen").style.display="none";}
    else if (direction == 2) {document.getElementById("winScreen").style.display="none"; gameState.looking = true;}
    return;
  }
  else if (direction == gameState.lastDirection) update();
  else if (direction != (gameState.lastDirection + 2) % 4) {gameState.direction = direction;  updateFace()}

  gameState.doingStuff = false;
}
function updateFace() {
  let headcell = document.getElementById("grid").children[gameState.snakeHead[0]].children[gameState.snakeHead[1]];
  headcell.innerHTML = gameState.face;
  headcell.style.transform = `rotate(${gameState.faceIsUpsideDown ? -(gameState.direction) * 90 : -(gameState.direction+2) * 90}deg)`;
  headcell.style.backgroundColor = `rgb(10,200,40)`;
  headcell.style.color = "rgb(44,44,44)";
  gameState.snakeTailCoords.forEach((x,i)=> {
    let cell = document.getElementById("grid").children[x[0]].children[x[1]];
    cell.innerHTML = gameState.snakeTailNumbers[i];
    cell.style.backgroundColor = `rgb(10,200,40)`;
    cell.style.color = "rgb(44,44,44)";
    // cell.style.color = colorForNumber(gameState.snakeTailNumbers[i]);
  })
}
function gameLost()
{

}

function createGrid()
{
  let cell;
  let row;
  for(let i=0; i < gameState.gridHeight; i++)
  {
    row = document.createElement('div');
    row.classList.add("row");
    document.getElementById("grid").appendChild(row);
    for(let j=0; j < gameState.gridWidth; j++)
    {
      cell = document.createElement('div');
      cell.setAttribute("state", "0");
      row.appendChild(cell);
      // cell.addEventListener('click', function() {
      //   cellClicked(i,j);
      // });
    }
  }
  document.getElementById("grid").style.aspectRatio = gameState.gridWidth / gameState.gridHeight;
  gameState.grid = Array.from(Array(gameState.gridHeight), () => new Array(gameState.gridWidth).fill(0));
  
}
function createRandomApple(first) {
  if (gameState.grid.reduce((y,x)=> y+ x.reduce((k,l)=> (l >0 ? k+1 : k), 0), 0) > 10) return;
  for(let i = 0; i < 10; i++) {
    let coord = [Math.random() * gameState.gridHeight|0, Math.random() * gameState.gridWidth|0];
    if (gameState.grid[coord[0]][coord[1]] != 0) continue;
    if (coord[0] == gameState.snakeHead[0] ||   coord[1] == gameState.snakeHead[1]) continue;
    let powerOfTheApple = 1;
    while(!first && Math.random() < .7**powerOfTheApple) powerOfTheApple ++;
    gameState.grid[coord[0]][coord[1]] = 2**powerOfTheApple;
    break;
  }
  
}
function pasteToGrid(i, j, brick, brickNmb)
{
  for (let k = 0; k < brick.length; k++)
    for (let l = 0; l < brick[0].length; l++)
      if (brick[k][l] != 0) gameState.nextGrid[i+k][j+l] = brickNmb;
}
function updateGrid()
{
  // createRandomBrick();
  // scoreLines();
  // gameState.grid = gameState.nextGrid;
  // gameState.grid = gameState.nextGrid;
  updateGridVisuals();
  console.log("score:", gameState.score);
  // console.log("moves left:", gameState.movesLeft);
}
function colorForNumber(n) 
{
  return "white";
  let i = 0;
  while ((n/=2) >= 2) i++;
  let colors = ["black", "white", "springgreen", "orange", "blue", "red"];
  return colors[i%colors.length];
}
function updateGridVisuals()
{
  let row;
  let cell;
  for(let i=0; i < gameState.gridHeight; i++)
  {
    row = document.getElementById("grid").children[i];
    for(let j=0; j < gameState.gridWidth; j++)
    {
      cell = row.children[j];
      cell.classList.remove("scored");
      cell.classList.remove("newOne");
      cell.innerHTML = gameState.grid[i][j] > 0 ? gameState.grid[i][j] : "";
      cell.style.backgroundColor = `rgb(${
        gameState.grid[i][j] >= 2 ?
        `${100+20*Math.log2(gameState.grid[i][j])},${ 50 + 10*Math.log2(gameState.grid[i][j]) },${ 50 + 10*Math.log2(gameState.grid[i][j]) }` :
        gameState.grid[i][j] == 0 || gameState.grid[i][j] == -1 ?
        "44,44,44" :
        "0,0,0"
      })`;
      // cell.style.textShadow = "-1px -1px 1px #000, 1px -1px 1px #000, -1px 1px 1px #000, 1px 1px 1px #000";
      cell.style.color = 
        gameState.grid[i][j] >= 2 ?
        colorForNumber(gameState.grid[i][j]) :
        gameState.grid[i][j] == 0 || gameState.grid[i][j] == -1 ?
        "rgb(44,44,44)" :
        "rgb(0,0,0)";
      // cell.style.borderColor = `rgb(${
      //   gameState.grid[i][j] == 0 || gameState.grid[i][j] == -1 ?
      //   "44,44,44" :
      //   gameState.grid[i][j] == 1 ?
      //   "200,200,200" :
      //   gameState.grid[i][j] == 3 ?
      //   "100,100,100" :
      //   "0,0,0"
      // })`;
      if (gameState.grid[i][j] == -1 )
          cell.classList.add("scored");
      if (gameState.grid[i][j] >= 2 )
          cell.classList.add("newOne");
    }
  }
  updateFace();

}


function gameWon() {
  localStorage.setItem("Snake2048Won", "true");
  gameState.gameWon = true;
  document.getElementById("winScreen").style.display = "";
  console.log("GAME WON!!!");
}
function gameLost()
{
  gameState.gameLost = true;
  document.getElementById("lossScreen").style.display = "";
  
}