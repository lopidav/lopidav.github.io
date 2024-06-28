//Tetris Snake

document.addEventListener("DOMContentLoaded", onStart);
let gameState = {};
function onStart()
{
  localStorage.setItem("SnakeMinesweeperDiscovered", "true");
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
  
      // queueUpdates(numTicks);
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
  gameState.gridHeight = 15;
  gameState.gridWidth = 15;
  for (let wrap of document.getElementsByClassName("gridWrap")) wrap.style.aspectRatio = gameState.gridWidth / gameState.gridHeight;
  gameState.score = 0;
  gameState.scoreToWin = 3;
  gameState.direction = 3;
  gameState.lastDirection = 3;
  gameState.snakeHead = [1,0];
  gameState.snakeTailCoords = [];
  gameState.snakeLength = 3;
  gameState.face = `<pre><b>o_o`;
  gameState.faceIsUpsideDown = false;
  gameState.bombsNumber = 15;
  createGrid();
  createRandomApple(true);
  createTrackers();
  document.addEventListener("keydown", keyHandler, false);
  updateGrid();
}
function lvlUp() {
  gameState.score++;
  gameState.bombsNumber *=1.5;

  gameState.direction = 3;
  gameState.lastDirection = 3;
  gameState.snakeHead = [1,0];
  gameState.snakeTailCoords = [];
  gameState.snakeLength = 3;
  gameState.face = `<pre><b>o_o`;
  gameState.faceIsUpsideDown = false;
  createGrid();
  createRandomApple(true);
  createTrackers();
  console.log("score:", gameState.score);
  console.log("n of bombs:", gameState.bombsNumber);
  updateGrid();
}
function render()
{
  if (gameState.doRedraw)
    updateGridVisuals();
}

function update(lastTick)
{
  if (gameState.gameLost) return;
  let left = gameState.direction % 2 * (gameState.direction == 1 ? -1 : 1);
  let down = !left * (gameState.direction == 0 ? -1 : 1);
  gameState.nextSnakeHead = [gameState.snakeHead[0]+down, gameState.snakeHead[1]+left];

  // if (gameState.nextSnakeHead[0] < 0 || gameState.nextSnakeHead[1] < 0 || gameState.nextSnakeHead[0] >= gameState.gridHeight || gameState.nextSnakeHead[1] >= gameState.gridWidth)
  //   {gameState.direction = gameState.lastDirection;return;}
  if (gameState.snakeTailCoords.some(x=> x[0] == gameState.nextSnakeHead[0] && x[1] == gameState.nextSnakeHead[1]))
    {gameState.direction = gameState.lastDirection;return;}
  if (gameState.grid[gameState.nextSnakeHead[0]][gameState.nextSnakeHead[1]] == 4)
    {gameState.direction = gameState.lastDirection;return;}
  gameState.lastDirection = gameState.direction;

  if (gameState.nextSnakeHead[0] < 0 || gameState.nextSnakeHead[1] < 0 || gameState.nextSnakeHead[0] >= gameState.gridHeight || gameState.nextSnakeHead[1] >= gameState.gridWidth) {
  // if (gameState.grid[gameState.nextSnakeHead[0]][gameState.nextSnakeHead[1]] == 2) {
    
    if (gameState.score+1 >= gameState.scoreToWin) gameWon();
    else lvlUp();
    return;
  }
  if (gameState.grid[gameState.nextSnakeHead[0]][gameState.nextSnakeHead[1]] == 3) {
    gameLost();
    return;
    // gameState.grid[gameState.nextSnakeHead[0]][gameState.nextSnakeHead[1]] = 0;
  }

  gameState.snakeTailCoords.push([gameState.snakeHead[0], gameState.snakeHead[1]]);
  // gameState.snakeTailCoords = gameState.snakeTailCoords.slice(-gameState.snakeLength);
  gameState.snakeHead = gameState.nextSnakeHead;

  updateGrid();
  if (!gameState.grid.some(x=>x.some(y => y == 2))) {createRandomApple(); gameState.appleCounter = 0}
  else {gameState.appleCounter = gameState.appleCounter ? gameState.appleCounter+1 : 1;} 
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
    else if (direction == 3) {gameState.gameWon = false; gameWon = _=>{lvlUp()};gameWon();document.getElementById("winScreen").style.display="none";}
    else if (direction == 2) {document.getElementById("winScreen").style.display="none"; gameState.looking = true;}
    return;
  }
  else if (direction == (gameState.lastDirection + 2) % 4) {undoMove(direction);updateGrid();}
  else if (direction == gameState.lastDirection) update();
  else if (direction != (gameState.lastDirection + 2) % 4) {gameState.direction = direction; update()}

  gameState.doingStuff = false;
}
function undoMove(direction) {
  if (!gameState.snakeTailCoords.length) return;
  gameState.snakeHead = gameState.snakeTailCoords.pop();
  let lastTail = gameState.snakeTailCoords[gameState.snakeTailCoords.length-1];
  if (!lastTail) return;
  gameState.lastDirection = gameState.direction = (lastTail[0] - gameState.snakeHead[0] ? -lastTail[0] + gameState.snakeHead[0] + 1 : -lastTail[1] + gameState.snakeHead[1] +2);
}
function updateFace() {
  let numbGrid = gameState.grid.map((a,i)=>a.map((x,j)=>{
    let minesFound = 0;
    for(let l = -1; l <= 1; l++) for(let k = -1; k <= 1; k++) {
      if (gameState.grid[i+l] && gameState.grid[i+l][j+k] && gameState.grid[i+l][j+k] == 3) minesFound ++;
    }
    return minesFound;
  }));
  let headcell = document.getElementById("grid").children[gameState.snakeHead[0]].children[gameState.snakeHead[1]];
  headcell.innerHTML = gameState.face;
  headcell.style.transform = `rotate(${gameState.faceIsUpsideDown ? -(gameState.direction) * 90 : -(gameState.direction+2) * 90}deg)`;
  headcell.style.backgroundColor = snakeColorFromBombs(numbGrid[gameState.snakeHead[0]][gameState.snakeHead[1]]);
  headcell.style.color = numbGrid[gameState.snakeHead[0]][gameState.snakeHead[1]] > 0 ? "white" : "rgb(44,44,44)";
  headcell.innerHTML = gameState.face.replace(/o/gi, numbGrid[gameState.snakeHead[0]][gameState.snakeHead[1]]);
  headcell.style.borderColor = headcell.style.backgroundColor;
  gameState.snakeTailCoords.forEach((x,i)=> {
    let cell = document.getElementById("grid").children[x[0]].children[x[1]];
    cell.style.backgroundColor = snakeColorFromBombs(numbGrid[x[0]][x[1]]);
    cell.style.color = numbGrid[x[0]][x[1]] > 0 ? "white" : "rgb(44,44,44)";
    cell.innerHTML = numbGrid[x[0]][x[1]];
    // cell.style.borderColor = cell.style.backgroundColor;
    // cell.style.color = colorForNumber(gameState.snakeTailNumbers[i]);
  })
}
function snakeColorFromBombs(num) {
  return num < 3 ? `rgb(10,${200-num*40},40)`
  : num < 10 ? `rgb(10,80,${-160+num*40})`
  : `rgb(${400-num*40},${600-num*40},${400-num*40})`;
}

function createTrackers()
{
  let bar;
  document.getElementById("scoreWrap").replaceChildren()
  for(let i=0; i < gameState.scoreToWin; i++)
  {
    bar = document.createElement('div');
    bar.classList.add("bar");
    if (i < gameState.score) bar.classList.add("active");
    document.getElementById("scoreWrap").appendChild(bar);
  }
  // for(let i=0; i < gameState.movesLeft; i++)
  // {
  //   bar = document.createElement('div');
  //   bar.classList.add("bar");
  //   bar.classList.add("active");
  //   document.getElementById("movesLeftWrap").appendChild(bar);
  // }
  
}
function createGrid()
{
  let cell;
  let row;
  document.getElementById("grid").replaceChildren()
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
  for(let i=0; i < gameState.gridHeight; i++)
  {
    if (gameState.grid[i][0]==0) gameState.grid[i][0]= 4;
    if (gameState.grid[i][gameState.gridWidth-1]==0) gameState.grid[i][gameState.gridWidth-1]= 4;
  }
  for(let j=0; j < gameState.gridWidth; j++)
  {
    if (gameState.grid[0][j]==0) gameState.grid[0][j]= 4;
    if (gameState.grid[gameState.gridHeight-1][j]==0) gameState.grid[gameState.gridHeight-1][j]= 4;
  }
  createBombs();
}
function createBombs() {
  let a = gameState.snakeHead[0], b = gameState.snakeHead[1]+1;
  gameState.grid[gameState.snakeHead[0]][gameState.snakeHead[1]] = -1;
  while (a < gameState.gridHeight-1 && b < gameState.gridWidth-1) {
    gameState.grid[a][b] = -1;
    if (Math.random() < 0.3 && a > 0 && gameState.grid[a-1][b] ==0) a--;
    else if (Math.random() < 0.2 && b > 0 && gameState.grid[a][b-1] == 0) b--;
    else if (Math.random() < 0.5 && a < gameState.gridHeight -1) a++; else b++;
    if (b >= gameState.gridWidth - 1 && a < gameState.gridHeight -2) b --;
    if (a >= gameState.gridHeight - 1 && b < gameState.gridWidth -2) a --;
  }
  let candidates = [];
  for(let i=0; i < gameState.gridHeight; i++)
  {
    for(let j=0; j < gameState.gridWidth; j++)
    {
      if (gameState.grid[i][j] == 0) candidates.push([i,j]);
    }
  }
  candidates.sort(_=>Math.random()*2-1);
  for(let i = 0; candidates.length && i < gameState.bombsNumber; i++) {gameState.grid[candidates[0][0]][candidates[0][1]] = 3; candidates.shift()};
  gameState.grid = gameState.grid.map(a=>a.map(x=>x==-1?0:x));
}
function createRandomApple(first) {
  // if (gameState.grid.reduce((y,x)=> y+ x.reduce((k,l)=> (l >0 ? k+1 : k), 0), 0) > 10) return;
  gameState.grid[gameState.gridHeight-2][gameState.gridWidth-1] = 2;
  // for(let i = 0; i < 10; i++) {
  //   let coord = [Math.random() * gameState.gridHeight|0, Math.random() * gameState.gridWidth|0];
  //   if (gameState.grid[coord[0]][coord[1]] != 0) continue;
  //   if (coord[0] == gameState.snakeHead[0] ||   coord[1] == gameState.snakeHead[1]) continue;
  //   gameState.grid[coord[0]][coord[1]] = 2;
  //   break;
  // }
  
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
  // console.log("score:", gameState.score);
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
      cell.style.transform = `rotate(0deg)`;
      cell.innerHTML = "";
      cell.style.backgroundColor = gameState.grid[i][j] == 2 ? `rgb(44,44,44)` : gameState.grid[i][j] == 4 ? `rgb(200,200,200)` : gameState.grid[i][j] == 3 ?`rgb(44,44,44)` :`rgb(44,44,44)`;
      // cell.style.border = "solid";
      // cell.style.borderColor = gameState.grid[i][j] == 2 ? `rgb(44,44,44)`: cell.style.backgroundColor
      // `rgb(${
      //   gameState.grid[i][j] >= 2 ?
      //   `${100+20*Math.log2(gameState.grid[i][j])},${ 50 + 10*Math.log2(gameState.grid[i][j]) },${ 50 + 10*Math.log2(gameState.grid[i][j]) }` :
      //   gameState.grid[i][j] == 0 || gameState.grid[i][j] == -1 ?
      //   "44,44,44" :
      //   "0,0,0"
      // })`;
      // cell.style.textShadow = "-1px -1px 1px #000, 1px -1px 1px #000, -1px 1px 1px #000, 1px 1px 1px #000";
      cell.style.color = 
        gameState.grid[i][j] >= 2 ?
        colorForNumber(gameState.grid[i][j]) :
        gameState.grid[i][j] == 0 || gameState.grid[i][j] == -1 ?
        "rgb(44,44,44)" :
        "rgb(0,0,0)";
      if (gameState.grid[i][j] == -1 )
          cell.classList.add("scored");
      // if (gameState.grid[i][j] >= 2 )
      //     cell.classList.add("newOne");
    }
  }
  updateFace();

}


function gameWon() {
  localStorage.setItem("SnakeMinesweeperWon", "true");
  gameState.gameWon = true;
  document.getElementById("winScreen").style.display = "";
  console.log("GAME WON!!!");
}
function gameLost()
{
  gameState.gameLost = true;
  updateFace();
  for(let i=0; i < gameState.gridHeight; i++)
  {
    row = document.getElementById("grid").children[i];
    for(let j=0; j < gameState.gridWidth; j++)
    {
      if (gameState.grid[i][j] != 3) continue;
      cell = row.children[j];
      cell.classList.remove("scored");
      cell.classList.remove("newOne");
      cell.style.transform = `rotate(0deg)`;
      cell.innerHTML =
`<pre>v
> o <
^`;
      cell.style.backgroundColor = `rgb(200,44,44)`
      cell.classList.add("newOne");
      // if (gameState.grid[i][j] >= 2 )
      //     cell.classList.add("newOne");
    }
  }

  let headcell = document.getElementById("grid").children[gameState.snakeHead[0]].children[gameState.snakeHead[1]];
  headcell.innerHTML = `<pre>X_X`;
  // headcell.style.transform = `rotate(${gameState.faceIsUpsideDown ? -(gameState.direction) * 90 : -(gameState.direction+2) * 90}deg)`;
  headcell.style.backgroundColor = `rgb(150,100,40)`;
  headcell.style.color = "rgb(44,44,44)";
  document.getElementById("lossScreen").style.display = "";
  
}