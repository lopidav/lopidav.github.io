//Tetris 2048

document.addEventListener("DOMContentLoaded", onStart);
let gameState = {};
function onStart()
{
  localStorage.setItem("2048TetrisDiscovered", "true");
  gameState.gridHeight = 9;
  gameState.gridWidth = 9;
  gameState.lastBrick = 0;
  gameState.brickColors = [[44,44,44]];
  gameState.score = 0;
  gameState.movesLeft = 50;
  gameState.scoreToWin = 50;
  createGrid();
  createTrackers();
  document.addEventListener("keydown", keyHandler, false);
  updateGrid();
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
  gameState.doingStuff = true;
  gameState.movesLeft--;
  gameState.nextGrid =  gameState.grid.map(a=>a.map(x=> x == -1 ? 0 : x));

  for (let i = 0; i < direction; i++) gameState.nextGrid = rotate(gameState.nextGrid);
  for (let o = 0; o <10; o++){
    for (let i = 1; i <= gameState.lastBrick; i++) {
      if (gameState.nextGrid[0].includes(i)) continue;
      let successfulMove = true;
      let existsABrick = false;
      let tempGrid =  JSON.parse(JSON.stringify(gameState.nextGrid));
  
      while (successfulMove) {
        for(let k=0; successfulMove && k < gameState.gridHeight-1; k++)
          for(let l=0; successfulMove && l < gameState.gridWidth; l++) {
            if (tempGrid[k+1][l] == i) {
              existsABrick = true;
              if (tempGrid[k][l] != 0) successfulMove = false;
              else {tempGrid[k][l] = i; tempGrid[k+1][l] = 0;}
            }
        }
        
        if (successfulMove) gameState.nextGrid = JSON.parse(JSON.stringify(tempGrid));
        successfulMove = successfulMove && existsABrick && !tempGrid[0].includes(i);
      }
    }
  }
  for (let i = 4; direction!= 0 && i > direction; i--) gameState.nextGrid = rotate(gameState.nextGrid);

  updateGrid()
  if (gameState.movesLeft == 0) {gameLost();}
  else if (gameState.score >= gameState.scoreToWin) {gameWon();}
  gameState.doingStuff = false;

}
function scoreLines()
{
  let linesScored = 0;
  if (!gameState.nextGrid) gameState.nextGrid =  gameState.grid.map(a=>a.map(x=> x == -1 ? 0 : x));
  let tempGrid = gameState.nextGrid.map(a=>a.map(x=>x));
  for(let i=0; i < gameState.gridHeight; i++)
  {
    if (!gameState.nextGrid[i].includes(0)) {
      linesScored++;
      for(let j=0; j < gameState.gridWidth; j++)
      {
        tempGrid[i][j] = -1;
      }
    }
  }
  for(let j=0; j < gameState.gridWidth; j++)
  {
    let columnScored = true;
    for(let k=0; columnScored && k < gameState.gridHeight; k++)
    {
      columnScored = gameState.nextGrid[k][j] != 0;
    }
    if (columnScored) {
      linesScored++;
      for(let k=0; k < gameState.gridHeight; k++)
      {
        tempGrid[k][j] = -1;
      }
    }
  }
  gameState.score += linesScored**2;
  gameState.movesLeft += linesScored * 3;
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
  gameState.grid = Array.from(Array(gameState.gridHeight), () => new Array(gameState.gridWidth).fill(0));
  
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
  for(let i=0; i < gameState.movesLeft; i++)
  {
    bar = document.createElement('div');
    bar.classList.add("bar");
    bar.classList.add("active");
    document.getElementById("movesLeftWrap").appendChild(bar);
  }
  
}
function createRandomBrick() {
  gameState.lastBrick++;
  gameState.brickColors.push([Math.random() >.5 ? Math.random()*250 : Math.random()*100 + 100, Math.random() >.5 ? Math.random()*250 : Math.random()*100 + 100, Math.random() >.5 ? Math.random()*250 : Math.random()*100 + 100]);

  if (!gameState.nextGrid) gameState.nextGrid =  gameState.grid.map(a=>a.map(x=> x == -1 ? 0 : x));
  // let heightCenterSumm = 0, centerCount = 0, wighthCenterSumm = 0;
  let candidates = [];
  for(let i=0; i < gameState.gridHeight - 1; i++)
  {
    for(let j=0; j < gameState.gridWidth - 1; j++)
    {
      let empty = true;
      for (let k = 0; empty && k < 2; k++)
        for (let l = 0; empty && l < 2; l++)
          if (gameState.nextGrid[i + k][j + l] != 0) empty = false;
      if (empty) candidates.push([i,j]);
    }
  }
  if (candidates.length == 0) {console.log("LOST!"); return;}
  candidates = candidates[Math.random() * candidates.length |0];
  pasteToGrid(candidates[0], candidates[1], gameState.brickPresets[Math.random() * gameState.brickPresets.length |0], gameState.lastBrick);
  
}
gameState.brickPresets = [
  // [[0, 0, 1],
  //  [1, 1, 1]]
  // ,
  // [[1, 1],
  //  [1, 1]]
  // ,
  // [[1]]
  // ,
  [[1,1]]
  ,
  [[1],
   [1]]
  ,
  [[0, 1],
   [1, 1]]
  ,
  [[1, 1],
   [1, 0]]
  // ,
  // [[1, 1],
  //  [1, 1]]
  ,
  // [[1]]
  // ,
  [[1,1]]
  ,
  [[1],
   [1]]
  ,
  // [[1]]
  // ,
  [[1,1]]
  ,
  [[1],
  [1]]
  // ,
  // [[0, 1, 0],
  //  [1, 1, 1]]
  // ,
  // [[0, 1],
  //  [1, 1],
  //  [0, 1]]
  // ,
  // [[1, 0],
  //  [1, 1],
  //  [1, 0]]
  // ,
  // [[0, 1],
  //  [0, 1],
  //  [1, 1]]
  // ,
  // [[1, 1],
  //  [1, 0],
  //  [1, 0]]
  
]
function pasteToGrid(i, j, brick, brickNmb)
{
  for (let k = 0; k < brick.length; k++)
    for (let l = 0; l < brick[0].length; l++)
      if (brick[k][l] != 0) gameState.nextGrid[i+k][j+l] = brickNmb;
}
function updateGrid()
{
  createRandomBrick();
  scoreLines();
  gameState.grid = gameState.nextGrid;
  updateGridVisuals();
  console.log("score:", gameState.score);
  console.log("moves left:", gameState.movesLeft);
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
      if (gameState.grid[i][j] != -1 ) cell.classList.remove("scored");
      cell.classList.remove("newOne");
      cell.style.backgroundColor = `rgb(${gameState.brickColors[gameState.grid[i][j] == -1 ? 0 : gameState.grid[i][j]].join(',') })`;
      if (gameState.grid[i][j] == -1 )
          cell.classList.add("scored");
      if (gameState.grid[i][j] == gameState.lastBrick )
          cell.classList.add("newOne");
    }
  }
  row = document.getElementById("movesLeftWrap").children;
  for(let j=0; j < row.length; j++)
  {
    cell = row[j];
    if (j >= gameState.movesLeft) cell.classList.remove("active");
    else cell.classList.add("active");
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
  localStorage.setItem("2048TetrisWon", "true");
  gameState.gameWon = true;
  document.getElementById("winScreen").style.display = "";
  console.log("GAME WON!!!");
}
function gameLost()
{
  gameState.gameLost = true;
  document.getElementById("lossScreen").style.display = "";
  
}