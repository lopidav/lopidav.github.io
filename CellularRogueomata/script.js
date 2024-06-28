

document.addEventListener("DOMContentLoaded", onStart);
let gameState = {};
function onStart()
{
  gameState.gridHeight = 100;
  gameState.gridWidth = 100;
  createGrid();
  gameState.transformRules = [[ [[1],[0]], [[0],[1]]  ]];
}
function transformAll(startErr, endErr) {
  console.log(startErr, endErr)
  for (let i = 0; i <= gameState.gridHeight - startErr.length; i++) {
    for (let j = 0; j <= gameState.gridWidth - startErr[0].length; j++) {
      if (checkMatch(i, j, startErr)) pasteToGrid(i, j, endErr);
    }
  }
}
function checkMatch(i, j, startErr)
{
  for (let k = 0; k < startErr.length; k++)
    for (let l = 0; l < startErr[0].length; l++)
      if (startErr[k][l] != -1 && gameState.grid[i+k][j+l] != startErr[k][l]) return false;
  return true;
}
function pasteToGrid(i, j, endErr)
{
  for (let k = 0; k < endErr.length; k++)
    for (let l = 0; l < endErr[0].length; l++)
      if (endErr[k][l] != -1) gameState.nextGrid[i+k][j+l] = endErr[k][l];
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
      cell.addEventListener('click', function() {
        cellClicked(i,j);
      });
    }
  }
  gameState.grid = Array.from(Array(gameState.gridHeight), () => new Array(gameState.gridWidth).fill(0));
  
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
      cell.setAttribute("state", gameState.grid[i][j]);
    }
  }
}

function cellClicked(i,j) {
  console.log("clicked",i,j);
  let cell = document.getElementById("grid").children[i].children[j];
  if (!cell) {console.log("Cell clicked but not found");};
  let state = +cell.getAttribute("state");
  cell.setAttribute("state", (state+1)%2);
  gameState.grid[i][j] = (state+1)%2;
}

function doStep() {
  doTransformRules();
  updateGridVisuals();
}
function doTransformRules() {
  if (!gameState.transformRules.length) return;
  gameState.nextGrid = gameState.grid.map(a=>a.slice(0));
  gameState.transformRules.forEach( rule => transformAll(rule[0],rule[1]));
  gameState.grid = gameState.nextGrid
}
function resume() {

}
function pause() {

}