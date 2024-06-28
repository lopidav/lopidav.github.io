//main

document.addEventListener("DOMContentLoaded", onStart);
let gameState = {};
gameState.baseGames = ["Snake", "Minesweeper","2048", "Tetris"]

function onStart()
{
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
  gameState.games =[];
  gameState.gamesIcons = [];
  for (let i = 0; i < gameState.baseGames.length;i++)
    for (let j = i+1; j < gameState.baseGames.length;j++)
      {
        gameState.games.push(gameState.baseGames[i]+gameState.baseGames[j]);
        let icon = new Image();
        icon.src = `${gameState.baseGames[i]+gameState.baseGames[j]}.png`;
        gameState.gamesIcons.push(icon);
      }
  
  gameState.baseGamesIcons = [];
  for (let i = 0; i < gameState.baseGames.length;i++) {
    let icon = new Image();
    icon.src = `${gameState.baseGames[i]}.png`;
    gameState.baseGamesIcons.push(icon);

  }


  gameState.gridWidth = 7;
  gameState.gridHeight = 3;
  gameState.currentGame1 = "";
  gameState.currentGame2 = "";
  gameState.selectedCoord = [1,1];
  createGrid();
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
  // else if (event.keyCode == '8') {
  //    // backspace
  //    window.location.assign("../index.html");
  //     move(3);
  // }
}
function move(direction) {
  if (gameState.gameLost) return;
  if (gameState.doingStuff) return;
  // updateGrid()

  if (direction == 3) {
    if (gameState.selectedCoord[1] == 5) { runSelectedGame();return;}
    gameState.selectedCoord[1] +=2;}
  else if (direction == 1) {
    if (gameState.selectedCoord[1] == 1) {return;}
    gameState.selectedCoord[1] -=2;}
  else if (direction == 0) {
    if (gameState.selectedCoord[1] == 1) rotateCurrentGame(1,-1);
    else if (gameState.selectedCoord[1] == 3) rotateCurrentGame(2,-1);
  }
  else if (direction == 2) {
    if (gameState.selectedCoord[1] == 1) rotateCurrentGame(1,1);
    else if (gameState.selectedCoord[1] == 3) rotateCurrentGame(2,1);
  }
  updateGrid();

  gameState.doingStuff = false;
}
function rotateCurrentGame(num, direction) {
  let currIndex = num == 1 ? gameState.baseGames.indexOf(gameState.currentGame1) : gameState.baseGames.indexOf(gameState.currentGame2);
  if (currIndex == -1) currIndex = 0;
  let currOtherGame =  num == 1 ? gameState.baseGames.indexOf(gameState.currentGame2) : gameState.baseGames.indexOf(gameState.currentGame1);
  
  currIndex = (currIndex + direction + gameState.baseGames.length) % gameState.baseGames.length;
  if (currIndex == currOtherGame) currIndex = (currIndex + direction + gameState.baseGames.length) % gameState.baseGames.length;
  
  if (num == 1) gameState.currentGame1 = gameState.baseGames[currIndex];
  else gameState.currentGame2 = gameState.baseGames[currIndex];
}

function runSelectedGame() {
  console.log("run",amalgamedGameName());
  if (amalgamedGameName()) window.location.assign("./"+amalgamedGameName()+"/index.html");
}

function createTrackers()
{
  let bar;
  document.getElementById("scoreWrap").replaceChildren();
  
  for(let i=0; i < gameState.games.length; i++)
  {
    bar = document.createElement('div');
    bar.classList.add("bar");
    if (!!localStorage.getItem(gameState.games[i] + "Discovered"))
      bar.appendChild(gameState.gamesIcons[i]);
    if (!!localStorage.getItem(gameState.games[i] + "Won"))
      bar.style.backgroundColor = "rgb(157 157 15)";
    // bar.innerHTML = `<img>`;
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
      // cell.setAttribute("state", "0");
      row.appendChild(cell);
      // cell.addEventListener('click', function() {
      //   cellClicked(i,j);
      // });
    }
  }
  document.getElementById("grid").style.aspectRatio = gameState.gridWidth / gameState.gridHeight;
  document.getElementById("gridWrap").style.aspectRatio = gameState.gridWidth / gameState.gridHeight;
  gameState.grid = Array.from(Array(gameState.gridHeight), () => new Array(gameState.gridWidth).fill(""));
}

function amalgamedGameName() {
  return gameState.currentGame1 && gameState.currentGame2 ? 
  [gameState.currentGame1, gameState.currentGame2].sort((a,b)=> gameState.baseGames.indexOf(a) - gameState.baseGames.indexOf(b)).join``
  : "";
}
function updateGrid()
{
  gameState.grid[0][1] = gameState.selectedCoord[1] == 1 ? "▲" : "△";
  gameState.grid[1][1] = gameState.currentGame1;
  gameState.grid[2][1] = gameState.selectedCoord[1] == 1 ? "▼" : "▽";
  gameState.grid[1][2] = "+";
  
  gameState.grid[0][3] = gameState.selectedCoord[1] == 3 ? "▲" : "△";
  gameState.grid[1][3] = gameState.currentGame2;
  gameState.grid[2][3] = gameState.selectedCoord[1] == 3 ? "▼" : "▽";

  if (gameState.currentGame1 != "" && gameState.currentGame2 != "") {
    gameState.grid[1][4] = "=";
    gameState.grid[1][5] = amalgamedGameName();
    gameState.grid[1][6] = gameState.selectedCoord[1] == 5 ? "▶" : "▷";
  }
  else {
    gameState.grid[1][4] = "≠";
    gameState.grid[1][5] = "";
    gameState.grid[1][6] = "";
  }
  updateGridVisuals();
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
      if (gameState.games.includes(gameState.grid[i][j]))
        cell.innerHTML = gameState.gamesIcons[gameState.games.indexOf(gameState.grid[i][j])].outerHTML;
      else if (gameState.baseGames.includes(gameState.grid[i][j]))
        cell.appendChild(gameState.baseGamesIcons[gameState.baseGames.indexOf(gameState.grid[i][j])]);
      else cell.innerHTML = gameState.grid[i][j];
      // cell.style.backgroundColor = gameState.grid[i][j] == 2 ? `rgb(44,44,44)` : gameState.grid[i][j] == 4 ? `rgb(200,200,200)` : gameState.grid[i][j] == 3 ?`rgb(44,44,44)` :`rgb(44,44,44)`;
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
      // cell.style.color = 
      //   gameState.grid[i][j] >= 2 ?
      //   colorForNumber(gameState.grid[i][j]) :
      //   gameState.grid[i][j] == 0 || gameState.grid[i][j] == -1 ?
      //   "rgb(44,44,44)" :
      //   "rgb(0,0,0)";

      if (i == 1 && j%2==1) {
        cell.style.backgroundColor = `rgb(64,64,64)`;
        cell.style.fontSize = "3vmin";
        cell.style.borderColor = cell.style.backgroundColor;
      } else {
        cell.style.backgroundColor = `#4e4e4e`;
        cell.style.borderColor = cell.style.backgroundColor;
      }
      if (gameState.selectedCoord[0] == i && gameState.selectedCoord[1] == j) {
        cell.style.borderColor = `rgb(200,200,200)`;
      }
      if (gameState.grid[i][j] == -1 )
          cell.classList.add("scored");
      // if (gameState.grid[i][j] >= 2 )
      //     cell.classList.add("newOne");
    }
  }

}

