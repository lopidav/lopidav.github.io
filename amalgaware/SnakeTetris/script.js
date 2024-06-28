//Tetris Snake

document.addEventListener("DOMContentLoaded", onStart);
let gameState = {};
function onStart()
{
  localStorage.setItem("SnakeTetrisDiscovered", "true");
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
  gameState.gridHeight = 20;
  gameState.gridWidth = 11;
  gameState.score = 0;
  gameState.scoreToWin = 15;
  gameState.direction = 3;
  gameState.lastDirection = 3;
  gameState.snakeHead = [5,0];
  gameState.snakeLength = 3;
  gameState.face = `<pre><b>o_o`;
  gameState.faceIsUpsideDown = false;
  for (let wrap of document.getElementsByClassName("gridWrap")) wrap.style.aspectRatio = gameState.gridWidth / gameState.gridHeight;
  createGrid();
  createRandomApple();
  createTrackers();
  document.addEventListener("keydown", keyHandler, false);
  gameState.nextSnakeGrid[gameState.snakeHead[0]][gameState.snakeHead[1]] = 100 + gameState.snakeLength;
  updateGrid();
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
function render()
{
  if (gameState.doRedraw)
    updateGridVisuals();
}

function update(lastTick)
{
  if (gameState.gameLost || gameState.gameWon) return;
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

  gameState.nextGrid = gameState.grid.map(a=>a.map(x => x==3 ? 0 :  x > 100 ? x-1 : x == 100 ? 0 : x));
  for (let i = 0; i < gameState.gridHeight; i++) {
    if (gameState.nextGrid[i][0] == -1) {

      for (let j = i; j > 0; j--) {
        gameState.nextGrid[j] = gameState.nextGrid[j-1];
      }
      gameState.nextGrid[0] = new Array(gameState.gridWidth).fill(0);
    }
  }
  gameState.nextSnakeGrid = gameState.snakeGrid.map(a=>a.map(x => x==3 ? 0 :  x > 100 ? x-1 : x == 100 ? 0 : x));
  switch (gameState.nextSnakeGrid[gameState.nextSnakeHead[0]][gameState.nextSnakeHead[1]]) {
    case 2:
      // gameState.snakeLength++;
      doTheShapeDrop(false);
  }
  gameState.nextSnakeGrid[gameState.nextSnakeHead[0]][gameState.nextSnakeHead[1]] = 100 + gameState.snakeLength;
  doTheShapeDrop(true);
  gameState.grid = gameState.nextGrid;
  gameState.snakeGrid = gameState.nextSnakeGrid;
  gameState.snakeHead = gameState.nextSnakeHead;

  gameState.lastDirection = gameState.direction;
  updateGrid();
  if (+gameState.appleCounter > 5 && Math.random() < .4) {createRandomApple(); gameState.appleCounter = 0}
  else {gameState.appleCounter = gameState.appleCounter ? gameState.appleCounter+1 : 1;} 
  // console.log(lastTick);
}
function doTheShapeDrop(isShadow) {
  let snakeShape = gameState.nextSnakeGrid.map(a=>a.map(x => x >= 100 ? 1 : 0));
  snakeShape[gameState.nextSnakeHead[0]][gameState.nextSnakeHead[1]] = 1;
  if (snakeShape[0].some(x=>x==1) && snakeShape[snakeShape.length-1].some(x=>x==1)) {
    let mid = snakeShape.length/2|0;
    snakeShape = snakeShape.slice(-mid).concat(snakeShape.slice(0, snakeShape.length-mid));
  }

  let collisionDetected = false;
  let shift = -gameState.gridHeight+1;
  let edge = 20;
  for (let i = snakeShape.length-1; i>=0 ; i--) {
    if (snakeShape[i].includes(1)) {edge = i; break}
  }
  while(!collisionDetected && shift < gameState.gridHeight && shift < gameState.gridHeight - edge) {
    for(let i= Math.max(0, shift); i < gameState.gridHeight && i < gameState.gridHeight + shift; i++)
      for(let j=0; j < gameState.gridWidth; j++)
      {
        if (snakeShape[i - shift][j] == 1  && gameState.nextGrid[i][j] == 1) collisionDetected = true;
      }
    shift+=!collisionDetected;
  }
  shift--;
  console.log(shift);
  console.log(collisionDetected);
  console.log(edge);
  if (shift < 0 && !isShadow) {
    let startsAt =0;
    while (snakeShape[startsAt] && !snakeShape[startsAt].some(x=>x==1)) startsAt++;
    if (shift + startsAt < 0 ) {gameLost();}
  } 

  for(let i=Math.max(0, shift); i < gameState.gridHeight && i < gameState.gridHeight + shift; i++)
    for(let j=0; j < gameState.gridWidth; j++)
    {
      if (snakeShape[i - shift][j] == 1 && gameState.nextGrid[i][j] == 0) gameState.nextGrid[i][j] =  isShadow ? 3 : 1;
    }
}

function keyHandler(event) {
  if (event.keyCode == '38' || event.keyCode == '87') {
      // up arrow
      event.preventDefault();
      move(0);
  }
  else if (event.keyCode == '37'  || event.keyCode == '65') {
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
}
function scoreLines()
{
  let linesScored = 0;
  if (!gameState.nextGrid) gameState.nextGrid =  gameState.grid.map(a=>a.map(x=> x == -1 ? 0 : x));

  let tempGrid = gameState.nextGrid.map(a=>a.map(x=>x));
  for(let i=0; i < gameState.gridHeight; i++)
  {
    if (gameState.nextGrid[i].reduce((x,y)=>y==1?x+y:x,0) == gameState.gridWidth) {
      linesScored++;
      for(let j=0; j < gameState.gridWidth; j++)
      {
        tempGrid[i][j] = -1;
      }
    }
  }
  gameState.score += linesScored;
  // gameState.movesLeft += linesScored * 3;
  gameState.nextGrid = tempGrid.map(a=>a.map(x=>x))// == -1 ? 0 : x));
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
  gameState.snakeGrid = Array.from(Array(gameState.gridHeight), () => new Array(gameState.gridWidth).fill(0));
  gameState.nextGrid = gameState.grid.map(a=>a.map(x => x==3 ? 0 :  x > 100 ? x-1 : x == 100 ? 0 : x));
  gameState.nextSnakeGrid = gameState.snakeGrid.map(a=>a.map(x => x==3 ? 0 :  x > 100 ? x-1 : x == 100 ? 0 : x));
  
}

// function createTrackers()
// {
//   let bar;
//   for(let i=0; i < gameState.scoreToWin; i++)
//   {
//     bar = document.createElement('div');
//     bar.classList.add("bar");
//     document.getElementById("scoreWrap").appendChild(bar);
//   }
//   for(let i=0; i < gameState.movesLeft; i++)
//   {
//     bar = document.createElement('div');
//     bar.classList.add("bar");
//     bar.classList.add("active");
//     document.getElementById("movesLeftWrap").appendChild(bar);
//   }
  
// }
function createRandomApple() {
  if (gameState.snakeGrid.reduce((y,x)=> y+ x.reduce((k,l)=> (l == 2 ? k+1 : k), 0), 0) > 10) return;
  for(let i = 0; i < 10; i++) {
    let coord = [Math.random() * gameState.gridHeight|0, Math.random() * gameState.gridWidth|0];
    if (gameState.snakeGrid[coord[0]][coord[1]] != 0) continue;
    if (coord[0] == gameState.snakeHead[0] ||   coord[1] == gameState.snakeHead[1]) continue;
    gameState.snakeGrid[coord[0]][coord[1]] = 2;
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
  scoreLines();
  gameState.grid = gameState.nextGrid;
  gameState.snakeGrid = gameState.nextSnakeGrid;
  updateGridVisuals();
  if (gameState.score >= gameState.scoreToWin) gameWon();
  console.log("score:", gameState.score);
  // console.log("moves left:", gameState.movesLeft);
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
      cell.innerHTML = "";
      cell.style.backgroundColor = `rgb(${
        gameState.snakeGrid[i][j] >= 100 ?
        "10,200,40" :
        gameState.snakeGrid[i][j] == 2 ?
        "200,100,100" :
        gameState.grid[i][j] == 0 || gameState.grid[i][j] == -1 ?
        "44,44,44" :
        gameState.grid[i][j] == 1 ?
        "200,200,200" :
        gameState.grid[i][j] == 3 ?
        "100,100,100" :
        "0,0,0"
      })`;
      cell.style.borderColor = `rgb(${
        gameState.grid[i][j] == 0 || gameState.grid[i][j] == -1 ?
        "44,44,44" :
        gameState.grid[i][j] == 1 ?
        "200,200,200" :
        gameState.grid[i][j] == 3 ?
        "100,100,100" :
        "0,0,0"
      })`;
      if (gameState.grid[i][j] == -1 )
          cell.classList.add("scored");
      if (gameState.snakeGrid[i][j] == 2 )
          cell.classList.add("newOne");
    }
  }
  updateFace();
  // row = document.getElementById("movesLeftWrap").children;
  // for(let j=0; j < row.length; j++)
  // {
  //   cell = row[j];
  //   if (j >= gameState.movesLeft) cell.classList.remove("active");
  //   else cell.classList.add("active");
  // }
  
  row = document.getElementById("scoreWrap").children;
  for(let j=0; j < row.length; j++)
  {
    cell = row[j];
    if (j >= gameState.score) cell.classList.remove("active");
    else cell.classList.add("active");
  }

}

// function cellClicked(i,j) {
//   console.log("clicked",i,j);
//   let cell = document.getElementById("grid").children[i].children[j];
//   if (!cell) {console.log("Cell clicked but not found");};
//   let state = +cell.getAttribute("state");
//   cell.setAttribute("state", (state+1)%2);
//   gameState.grid[i][j] = (state+1)%2;
// }

function doStep() {
  doTransformRules();
  updateGridVisuals();
}
// function doTransformRules() {
//   if (!gameState.transformRules.length) return;
//   gameState.nextGrid = gameState.grid.map(a=>a.slice(0));
//   gameState.transformRules.forEach( rule => transformAll(rule[0],rule[1]));
//   gameState.grid = gameState.nextGrid
// }

function rotate (grid) {
  let newGrid= new Array();
  for (let j = 0; j < gameState.gridWidth; j++){
    newGrid.push([]);
    for (let i = gameState.gridHeight-1; i >-1; i--){
      newGrid[j].push(grid[i][j]);
    };
  };
  return newGrid;
}

function gameWon() {
  localStorage.setItem("SnakeTetrisWon", "true");
  gameState.gameWon = true;
  document.getElementById("winScreen").style.display = "";
  console.log("GAME WON!!!");
}
function gameLost()
{
  gameState.gameLost = true;
  document.getElementById("lossScreen").style.display = "";
  
}