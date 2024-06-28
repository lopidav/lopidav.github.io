//Tetris minesweeper

document.addEventListener("DOMContentLoaded", onStart);
let gameState = {};
function onStart()
{
  localStorage.setItem("MinesweeperTetrisDiscovered", "true");
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
  gameState.gridWidth = 7;
  gameState.score = 0;
  gameState.scoreToWin = 50;
  // gameState.currentBrickPos = [0,0];
  // gameState.currentBrick = [[0]];
  createGrid();
  createRandomBrick();
  createTrackers();
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
  if (gameState.gameWon || gameState.gameLost) return;
  if (gameState.score > gameState.scoreToWin) gameWon();
  gameState.grid = gameState.grid.map(a=>a.map(x=> x==3 ? 4:x==4?5 :x));
  for (let i = 0; i < gameState.gridHeight; i++) {
    if (gameState.grid[i][0] == -1) {
      pasteToGrid(gameState.currentBrickPos[0], gameState.currentBrickPos[1], gameState.currentBrick, 0);
      for (let j = i; j > 0; j--) {
        gameState.grid[j] = gameState.grid[j-1];
      }
      gameState.grid[0] = new Array(gameState.gridWidth).fill(0);
      pasteToGrid(gameState.currentBrickPos[0], gameState.currentBrickPos[1], gameState.currentBrick, 0, true);
      updateGrid();
      return;

    }
  }
  moveCurrentBrick(2);

  updateGrid();
  // if (+gameState.appleCounter > 5 && Math.random() < .4) {createRandomApple(); gameState.appleCounter = 0}
  // else {gameState.appleCounter = gameState.appleCounter ? gameState.appleCounter+1 : 1;} 
  // console.log(lastTick);
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
  else if (direction == 2) update();
  else if (direction == 1 || direction == 3) {moveCurrentBrick(direction)}

  gameState.doingStuff = false;
}
function moveCurrentBrick(direction) {
  let side = direction == 3 ? 1 : direction == 1 ? -1 : 0;
  let down = direction == 2 ? 1 : 0;
  pasteToGrid(gameState.currentBrickPos[0], gameState.currentBrickPos[1], gameState.currentBrick, 0);
  let collided = collides(gameState.currentBrickPos[0]+down, gameState.currentBrickPos[1]+side, gameState.currentBrick);
  console.log(collided)
  if (down && collided) {
    pasteToGrid(gameState.currentBrickPos[0], gameState.currentBrickPos[1], gameState.currentBrick, 0, true);
    brickPlaced();
  }
  else if (!collided){
    gameState.currentBrickPos[0] += down;
    gameState.currentBrickPos[1] += side;
    pasteToGrid(gameState.currentBrickPos[0], gameState.currentBrickPos[1], gameState.currentBrick, 0, true);
  }
  else {
    pasteToGrid(gameState.currentBrickPos[0], gameState.currentBrickPos[1], gameState.currentBrick, 0, true);
  }
  updateGrid();
}
function brickPlaced() {
  if (mineTriggered(gameState.currentBrickPos[0]+1, gameState.currentBrickPos[1], gameState.currentBrick)) {
    
  };
  scoreLines();
  createRandomBrick();
}
function mineTriggered(i, j, brick) {
  if (i + brick.length > gameState.gridHeight) return false;
  for (let k = 0; k < brick.length; k++)
    for (let l = 0; l < brick[0].length; l++)
      if (brick[k][l] != 0 && gameState.grid[i+k][j+l] == 2) {
        gameState.grid[i+k][j+l] = 3;
        return true;
      }
}
function collides(i, j, brick) {
  if (j + brick[0].length > gameState.gridWidth) return true;
  if (j < 0)  return true;
  if (i + brick.length > gameState.gridHeight) return true;
  for (let k = 0; k < brick.length; k++)
    for (let l = 0; l < brick[0].length; l++)
      if (brick[k][l] != 0 && gameState.grid[i+k][j+l] != 0) return true;
}
function createRandomBrick() {
  gameState.brickCount = gameState.brickCount ?  gameState.brickCount+1 : 1;
  if (gameState.brickCount % 4) {
    gameState.currentBrick = gameState.safeBrickPresets[Math.random()*gameState.safeBrickPresets.length|0];
  }
  else {
    gameState.currentBrick = gameState.minedBrickPresets[Math.random()*gameState.minedBrickPresets.length|0];
  }
  gameState.currentBrickPos = [0,gameState.gridWidth/2 - gameState.currentBrick[0].length/2 |0];
  if (collides(gameState.currentBrickPos[0], gameState.currentBrickPos[1], gameState.currentBrick)) gameLost();
  pasteToGrid(gameState.currentBrickPos[0], gameState.currentBrickPos[1], gameState.currentBrick, 0, true);
  
}
gameState.safeBrickPresets = [
  [
    [0,1],
    [1,1]
  ],
  [
    [1,1],
    [1,0]
  ],
  [
    [1,1],
    [0,1]
  ],
  [
    [1,1]
  ],
  [
    [1],
    [1]
  ],
  [
    [1],
    [1]
  ],
  [
    [1]
  ]
]
gameState.minedBrickPresets = [
  [
    [1,2]
  ],
  [
    [0,1],
    [2,1]
  ],
  [
    [2,1]
  ],
  [
    [1,0],
    [1,2]
  ],
  [
    [2],
    [1]
  ],
  [
    [2]
  ]
]
function gameLost()
{

}
function scoreLines()
{
  let linesScored = 0;

  let tempGrid = gameState.grid.map(a=>a.map(x=>x));
  for(let i=0; i < gameState.gridHeight; i++)
  {
    if (gameState.grid[i].reduce((x,y)=>y==1 || y==2?x+1:x,0) == gameState.gridWidth) {
      linesScored++;
      for(let j=0; j < gameState.gridWidth; j++)
      {
        tempGrid[i][j] = -1;
      }
    }
  }
  gameState.score += linesScored**2;
  // gameState.movesLeft += linesScored * 3;
  if (linesScored) gameState.grid = tempGrid.map(a=>a.map(x=>x))// == -1 ? 0 : x));
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
  gameState.grid = gameState.grid.map(a=>a.map(x => x==3 ? 0 :  x > 100 ? x-1 : x == 100 ? 0 : x));
  
}

function createTrackers()
{
  let bar;
  for(let i=0; i < gameState.scoreToWin; i++)
  {
    bar = document.createElement('div');
    bar.classList.add("bar");
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
function pasteToGrid(i, j, brick, brickNmb, notOverride)
{
  for (let k = 0; k < brick.length; k++)
    for (let l = 0; l < brick[0].length; l++)
      if (brick[k][l] != 0) gameState.grid[i+k][j+l] = notOverride ? brick[k][l] : brickNmb;
}
function updateGrid()
{
  // createRandomBrick();
  // scoreLines();
  // gameState.grid = gameState.grid;
  updateGridVisuals();
  console.log("score:", gameState.score);
  // console.log("moves left:", gameState.movesLeft);
}
function updateGridVisuals()
{
  let row;
  let cell;
  let numbGrid = gameState.grid.map((a,i)=>a.map((x,j)=>{
    let minesFound = 0;
    for(let l = -1; l <= 1; l++)for(let k = -1; k <= 1; k++) {
      if (gameState.grid[i+l] && gameState.grid[i+l][j+k] != 0) minesFound += gameState.grid[i+l][j+k] == 1 ? 1 : gameState.grid[i+l][j+k] == 2 ? 10 : 0;
    }
    return minesFound;
  }));
  
  for(let i=0; i < gameState.gridHeight; i++)
  {
    row = document.getElementById("grid").children[i];
    for(let j=0; j < gameState.gridWidth; j++)
    {
      cell = row.children[j];
      cell.classList.remove("scored");
      cell.classList.remove("newOne");
      cell.innerHTML = gameState.grid[i][j] != 0 || numbGrid[i][j] == 0 ? "" : (numbGrid[i][j]/10 |0);
      switch (gameState.grid[i][j])
      {
        case 3:
          cell.innerHTML = "(⬭)";
          break;
        case 4:
          cell.innerHTML = "(⬬)";
          break;
        case 5:
          cell.innerHTML = "X";
          break;
      }
      cell.style.backgroundColor = `rgb(${
        gameState.grid[i][j] == 0 || gameState.grid[i][j] == -1 ?
        "44,44,44" :
        gameState.grid[i][j] == 1 || gameState.grid[i][j] == 2?
        "200,200,200" :
        gameState.grid[i][j] >= 3 ?
        "200,00,00" :
        "0,0,0"
      })`;
      if (gameState.grid[i][j] == -1 )
          cell.classList.add("scored");
      // if (gameState.grid[i][j] == 2 )
      //     cell.classList.add("newOne");
    }
  }
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
//   gameState.grid = gameState.grid.map(a=>a.slice(0));
//   gameState.transformRules.forEach( rule => transformAll(rule[0],rule[1]));
//   gameState.grid = gameState.grid
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
  localStorage.setItem("MinesweeperTetrisWon", "true");
  gameState.gameWon = true;
  document.getElementById("winScreen").style.display = "";
  console.log("GAME WON!!!");
}
function gameLost()
{
  gameState.gameLost = true;
  document.getElementById("lossScreen").style.display = "";
  
}