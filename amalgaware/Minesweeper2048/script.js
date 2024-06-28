//Minesweeper 2048

document.addEventListener("DOMContentLoaded", onStart);
let gameState = {};
function onStart()
{
  localStorage.setItem("Minesweeper2048Discovered", "true");
  gameState.gridHeight = 5;
  gameState.gridWidth = 5;
  gameState.score = 0;
  gameState.movesLeft = 50;
  gameState.scoreToWin = 7;
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
  // else if (gameState.movesLeft == 0) {gameLost();return;}
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

  for (let i = 0; i < (direction+3)%4; i++) gameState.grid = rotate(gameState.grid);
  
  for (let i = 0; i < gameState.gridHeight; i++) {
    gameState.grid[i] = gameState.grid[i].filter(x=>x!=0);
    for(let j = 0; j < gameState.grid[i].length-1; j++) if (gameState.grid[i][j] == gameState.grid[i][j+1]) {gameState.grid[i][j] *=2; gameState.grid[i][j+1] = 0;}
    gameState.grid[i] = gameState.grid[i].filter(x=>x!=0);
    for(let j = 0; j < gameState.gridWidth; j++) gameState.grid[i][j] = gameState.grid[i][j] ?? 0;
  }

  for (let i = 4; (direction+3)%4!= 0 && i > (direction+3)%4; i--) gameState.grid = rotate(gameState.grid);
  updateGrid()
  gameState.doingStuff = false;

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
  // for(let i=0; i < gameState.movesLeft; i++)
  // {
  //   bar = document.createElement('div');
  //   bar.classList.add("bar");
  //   bar.classList.add("active");
  //   document.getElementById("movesLeftWrap").appendChild(bar);
  // }
  
}
function createRandomBrick() {
  
  let candidates = [];
  for(let i=0; i < gameState.gridHeight; i++)
  {
    for(let j=0; j < gameState.gridWidth; j++)
    {
      if (gameState.grid[i][j] == 0) candidates.push([i,j]);
    }
  }
  if (candidates.length == 0) {gameLost(); return;}
  candidates = candidates[Math.random() * candidates.length |0];
  gameState.grid[candidates[0]][candidates[1]] = Math.random() > .6 ? 4 : 2;
  
}
function updateGrid()
{
  createRandomBrick();
  gameState.score = Math.log2(gameState.grid.reduce((x,y)=>{let r =y.reduce((l,k) => k > l ? k : l, 0); return r > x ? r : x;}, 0))
  if ( gameState.score >= gameState.scoreToWin) gameWon();
  updateGridVisuals();
  console.log("moves left:", gameState.movesLeft);
}
function updateGridVisuals()
{
  let numbGrid = gameState.grid.map((a,i)=>a.map((x,j)=>{
    let minesFound = 0;
    for(let l = -1; l <= 1; l++) for(let k = -1; k <= 1; k++) {
      if (gameState.grid[i+l] && gameState.grid[i+l][j+k] && gameState.grid[i+l][j+k] != 0) minesFound += gameState.grid[i+l][j+k];
    }
    return minesFound;
  }));

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
      cell.innerHTML = gameState.grid[i][j] != 0 || numbGrid[i][j] == 0 ? "" : numbGrid[i][j];
      cell.style.backgroundColor = `rgb(${gameState.grid[i][j] == 0 ? "44,44,44" : "200,200,200"})`;
      if (gameState.grid[i][j] == -1 )
          cell.classList.add("scored");
      if (gameState.grid[i][j] == gameState.lastBrick )
          cell.classList.add("newOne");
    }
  }
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
  localStorage.setItem("Minesweeper2048Won", "true");
  gameState.gameWon = true;
  document.getElementById("winScreen").style.display = "";
  console.log("GAME WON!!!");
}
function gameLost()
{
  gameState.gameLost = true;
  document.getElementById("lossScreen").style.display = "";
  
}