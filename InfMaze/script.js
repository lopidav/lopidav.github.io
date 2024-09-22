

document.addEventListener("DOMContentLoaded", onStart);
function onStart(event) { 
  ;(() => {
    function main(tFrame) {
      MyGame.stopMain = window.requestAnimationFrame(main);
      const nextTick = MyGame.lastTick + MyGame.tickLength;
      let numTicks = 0;
  
      // If tFrame < nextTick then 0 ticks need to be updated (0 is default for numTicks).
      // If tFrame = nextTick then 1 tick needs to be updated (and so forth).
      // Note: As we mention in summary, you should keep track of how large numTicks is.
      // If it is large, then either your game was asleep, or the machine cannot keep up.
      if (tFrame > nextTick) {
        const timeSinceTick = tFrame - MyGame.lastTick;
        numTicks = Math.floor(timeSinceTick / MyGame.tickLength);
      }
  
      queueUpdates(numTicks);
      render(tFrame);
      MyGame.lastRender = tFrame;
    }
  
    function queueUpdates(numTicks) {
      for (let i = 0; i < numTicks; i++) {
        MyGame.lastTick += MyGame.tickLength; // Now lastTick is this tick.
        update(MyGame.lastTick);
      }
    }
  
    MyGame.lastTick = performance.now();
    MyGame.lastRender = MyGame.lastTick; // Pretend the first draw was on first update.
    MyGame.tickLength = 50; // This sets your simulation to run at 20Hz (50ms)
  
    setInitialState();
    main(performance.now()); // Start the cycle
  })();
}
var MyGame = {};

function createGridChunkCanvas(gridChunk, scale)
{
  gridChunk.canvas = document.createElement("canvas");
  gridChunk.canvas.width = gridChunk.canvas.height = gridChunk.length;
  gridChunk.ctx = gridChunk.canvas.getContext("2d");
  let newImageData = gridChunk.ctx.createImageData(gridChunk.canvas.width, gridChunk.canvas.width);
  let newImageDataData = newImageData.data;

  
  
  // gridChunk.ctx.fillStyle = "black";
  // gridChunk.ctx.fillRect(0, 0, gridChunk.canvas.width, gridChunk.canvas.height);
  let currentColor = [0,0,0,0];
  let redPosition;
  let avarageCol = [0,0,0];
  let counter = 0;
  gridChunk.forEach((row , i) => {
    row.forEach((x, j) => {
      switch (x)
      {
        case -1:
          currentColor = [0,128,0,255];
          break;
        case 0:
          currentColor = [0,0,0,255];
          break;
        case 5:
          currentColor = [0,0,128,255];
          break;
        case 6:
          currentColor = [128,0,128,255];
          break;
        case 1:
        case 2:
        case 3:
        case 4:
          currentColor = [128,128,128,255];
          break;
      }
      redPosition = i*gridChunk.canvas.width*4 + j*4;
      newImageDataData[redPosition] = currentColor[0];
      newImageDataData[redPosition+1] = currentColor[1];
      newImageDataData[redPosition+2] = currentColor[2];//255;
      newImageDataData[redPosition+3] = currentColor[3];
      avarageCol[0]+=currentColor[0];
      avarageCol[1]+=currentColor[1];
      avarageCol[2]+=currentColor[2];
      counter++
      // if (x == -1) {
      //   gridChunk.ctx.fillStyle = "green";
      // } else if (x >= 5) {
      //   gridChunk.ctx.fillStyle = "blue";
      // } 
      // if (x)
      // {
      //   gridChunk.ctx.fillRect(j, i, 1, 1);
      // }
    })
  });
  gridChunk.ctx.putImageData(newImageData,0,0);

  gridChunk.canvasHalf = document.createElement("canvas");
  gridChunk.canvasHalf.width = gridChunk.length/2;
  gridChunk.canvasHalf.height = gridChunk[0].length/2;
  gridChunk.ctxHalf = gridChunk.canvasHalf.getContext("2d");
  gridChunk.ctxHalf.drawImage(gridChunk.canvas, 0,0,gridChunk.canvasHalf.width,gridChunk.canvasHalf.height)
  
  gridChunk.canvasSmall = document.createElement("canvas");
  gridChunk.canvasSmall.width = gridChunk.length/5;
  gridChunk.canvasSmall.height = gridChunk[0].length/5;
  gridChunk.ctxSmal = gridChunk.canvasSmall.getContext("2d");
  gridChunk.ctxSmal.drawImage(gridChunk.canvasHalf, 0,0,gridChunk.canvasSmall.width,gridChunk.canvasSmall.height)

  gridChunk.canvasSmallSmall = document.createElement("canvas");
  gridChunk.canvasSmallSmall.width = gridChunk.length/10;
  gridChunk.canvasSmallSmall.height = gridChunk[0].length/10;
  gridChunk.ctxSmalSmall = gridChunk.canvasSmallSmall.getContext("2d");
  gridChunk.ctxSmalSmall.drawImage(gridChunk.canvasSmall, 0,0,gridChunk.canvasSmallSmall.width,gridChunk.canvasSmallSmall.height)

  gridChunk.avarageColor = [avarageCol[0]/counter, avarageCol[1]/counter, avarageCol[2]/counter];

  // gridChunk.canvasScaleDown = downScaleCanvas(gridChunk.canvas, 0.75);
  // gridChunk.canvasScaleDownDown = downScaleCanvas(gridChunk.canvas, 0.1);
  return gridChunk.canvas;
}
function creatMetaChunkCanvas(gridChunk)
{
  gridChunk.canvas = document.createElement("canvas");
  gridChunk.canvas.width = gridChunk.length;
  gridChunk.canvas.height = gridChunk[0].length;
  gridChunk.ctx = gridChunk.canvas.getContext("2d");
  let newImageData = gridChunk.ctx.createImageData(gridChunk.canvas.width, gridChunk.canvas.height);
  let newImageDataData = newImageData.data;

  let currentColor = [0,0,0,0];
  let redPosition;
  let avarageCol = [0,0,0];
  let counter = 0;
  gridChunk.forEach((row , i) => {
    row.forEach((x, j) => {
      if (x > 0 && !(i==0 && j ==0))
      {
        if(x >= 5)
        {
          currentColor = [0,90,0,255];
        }
        else {
          currentColor = [0,95,0,255];
        }
      }
      else
      {
        if(x <= -6 || (i==0 && j ==0))
        {
          currentColor = [0,62,0,255];
        }
        else if (x <= -4)
        {
          currentColor = [0,44,0,255];
        } 
        else {
          currentColor = [0,65,0,255];
        }
      }
      redPosition = i*gridChunk.canvas.width*4 + j*4;
      newImageDataData[redPosition] = currentColor[0];
      newImageDataData[redPosition+1] = currentColor[1];
      newImageDataData[redPosition+2] = currentColor[2];//255;
      newImageDataData[redPosition+3] = currentColor[3];
      avarageCol[0]+=currentColor[0];
      avarageCol[1]+=currentColor[1];
      avarageCol[2]+=currentColor[2];
      counter++
      // if (x == -1) {
      //   gridChunk.ctx.fillStyle = "green";
      // } else if (x >= 5) {
      //   gridChunk.ctx.fillStyle = "blue";
      // } 
      // if (x)
      // {
      //   gridChunk.ctx.fillRect(j, i, 1, 1);
      // }
    })
  });
  gridChunk.ctx.putImageData(newImageData,0,0);

  gridChunk.canvasHalf = document.createElement("canvas");
  gridChunk.canvasHalf.width = gridChunk.length/2;
  gridChunk.canvasHalf.height = gridChunk[0].length/2;
  gridChunk.ctxHalf = gridChunk.canvasHalf.getContext("2d");
  gridChunk.ctxHalf.drawImage(gridChunk.canvas, 0,0,gridChunk.canvasHalf.width,gridChunk.canvasHalf.height)
  
  gridChunk.canvasSmall = document.createElement("canvas");
  gridChunk.canvasSmall.width = gridChunk.length/5;
  gridChunk.canvasSmall.height = gridChunk[0].length/5;
  gridChunk.ctxSmal = gridChunk.canvasSmall.getContext("2d");
  gridChunk.ctxSmal.drawImage(gridChunk.canvasHalf, 0,0,gridChunk.canvasSmall.width,gridChunk.canvasSmall.height)

  gridChunk.canvasSmallSmall = document.createElement("canvas");
  gridChunk.canvasSmallSmall.width = gridChunk.length/10;
  gridChunk.canvasSmallSmall.height = gridChunk[0].length/10;
  gridChunk.ctxSmalSmall = gridChunk.canvasSmallSmall.getContext("2d");
  gridChunk.ctxSmalSmall.drawImage(gridChunk.canvasSmall, 0,0,gridChunk.canvasSmallSmall.width,gridChunk.canvasSmallSmall.height)

  gridChunk.avarageColor = [avarageCol[0]/counter, avarageCol[1]/counter, avarageCol[2]/counter];
  return gridChunk.canvas;
}
function checkPathPropagate( ) {
  if (MyGame.currentChunk[MyGame.hoveringCellY][MyGame.hoveringCellX] != 0 && MyGame.currentChunk[MyGame.hoveringCellY][MyGame.hoveringCellX] != 6) return;
  
  let prevValue = MyGame.currentChunk[MyGame.hoveringCellY][MyGame.hoveringCellX];
  let dist = cellDistance(MyGame.currentChunk, MyGame.hoveringCellY, MyGame.hoveringCellX, MyGame.previousChunk, MyGame.previousHoveringCellY, MyGame.previousHoveringCellX);
  let temp;
  if (MyGame.previousChunk[MyGame.previousHoveringCellY][MyGame.previousHoveringCellX] > 0 && MyGame.previousChunk[MyGame.previousHoveringCellY][MyGame.previousHoveringCellX] < 6 && (Math.abs(dist[0])+ Math.abs(dist[1]) == 1))
  {
    if (dist[0] == 1)
    {
      MyGame.currentChunk[MyGame.hoveringCellY][MyGame.hoveringCellX] = 1;
    }
    else if (dist[0] == -1)
    {
      MyGame.currentChunk[MyGame.hoveringCellY][MyGame.hoveringCellX] = 2;
    }
    else if (dist[1] == 1)
    {
      MyGame.currentChunk[MyGame.hoveringCellY][MyGame.hoveringCellX] = 3;
    }
    else if (dist[1] == -1)
    {
      MyGame.currentChunk[MyGame.hoveringCellY][MyGame.hoveringCellX] = 4;
    }
  }
  else if ((temp = getNeighbour(1, MyGame.currentChunk, MyGame.hoveringCellY, MyGame.hoveringCellX)) >= 1 && temp <6)
  {
    MyGame.currentChunk[MyGame.hoveringCellY][MyGame.hoveringCellX] = 1;
  }
  else if ((temp = getNeighbour(2, MyGame.currentChunk, MyGame.hoveringCellY, MyGame.hoveringCellX)) >= 1 && temp <6)
  {
    MyGame.currentChunk[MyGame.hoveringCellY][MyGame.hoveringCellX] = 2;
  }
  else if ((temp = getNeighbour(3, MyGame.currentChunk, MyGame.hoveringCellY, MyGame.hoveringCellX)) >= 1 && temp <6)
  {
    MyGame.currentChunk[MyGame.hoveringCellY][MyGame.hoveringCellX] = 3;
  }
  else if ((temp = getNeighbour(4, MyGame.currentChunk, MyGame.hoveringCellY, MyGame.hoveringCellX)) >= 1 && temp <6)
  {
    MyGame.currentChunk[MyGame.hoveringCellY][MyGame.hoveringCellX] = 4;
  }
  if (prevValue != MyGame.currentChunk[MyGame.hoveringCellY][MyGame.hoveringCellX])
  {
    if (prevValue == 6)
    {
      MyGame.propagationQueue.push([MyGame.currentChunk, MyGame.hoveringCellY, MyGame.hoveringCellX])
      let rand = sfc32(MyGame.currentChunk.coordinates[0],MyGame.currentChunk.coordinates[1])
      MyGame.propagationCounter = 500 + rand()*1000;
    }
    MyGame.visited.push(
      [MyGame.currentChunk.coordinates[0]*MyGame.chunkSize + MyGame.hoveringCellY,
      MyGame.currentChunk.coordinates[1]*MyGame.chunkSize +MyGame.hoveringCellX,
      MyGame.currentChunk[MyGame.hoveringCellY][MyGame.hoveringCellX]]);
    window.localStorage.setItem("visitedCells", JSON.stringify(MyGame.visited));
  }
  else 
  if (MyGame.visited.length && MyGame.visited[MyGame.visited.length-1])
  {
    let hoveredY = MyGame.hoveringCellY;
    let hoveredX = MyGame.hoveringCellX;
    let hoveredchunk = MyGame.currentChunk;
    let lastVisited = MyGame.visited[MyGame.visited.length-1];
    let visitedChunk = getChunk(Math.floor(lastVisited[0]/MyGame.chunkSize), Math.floor(lastVisited[1]/MyGame.chunkSize));
    let toVisit = [];
    let toPropagate = [];
    let doFillIn = true;
    if (visitedChunk && lastVisited[2] > 0 && lastVisited[2] < 6) 
    {
      let lastVisitedY = (lastVisited[0]%MyGame.chunkSize+MyGame.chunkSize)%MyGame.chunkSize;
      let lastVisitedX = (lastVisited[1]%MyGame.chunkSize+MyGame.chunkSize)%MyGame.chunkSize;
      let dist = cellDistance(hoveredchunk, hoveredY, hoveredX, visitedChunk, lastVisitedY, lastVisitedX);
      if (dist[1]==0)
      {
        let currY = lastVisitedY;
        let currCoords;
        let currChunk = visitedChunk;
        let lim = 50;
        do {
          lim--;
          currCoords = getNeighbourCoordinats(dist[0]>0 ? 2 : 1, currChunk, currY, hoveredX);
          currChunk = currCoords[0];
          currY = (currCoords[1]%MyGame.chunkSize+MyGame.chunkSize)%MyGame.chunkSize;
          if (currChunk[currY][hoveredX] == 6)
          {
            toPropagate.push(
              [currChunk,currY,hoveredX]);
          }
          if (currChunk[currY][hoveredX] == 0 || currChunk[currY][hoveredX] == 6)
          {
            toVisit.push(
              [currChunk,currY,hoveredX,dist[0]>0 ? 1 : 2]);
          }
        } while ((currChunk[currY][hoveredX] >= 0 && currChunk[currY][hoveredX] <= 6)&& lim > 0 && (currChunk != hoveredchunk || currY != hoveredY));
        doFillIn = (currChunk == hoveredchunk && currY == hoveredY) || lim == 0;
      }
      else if (dist[0]==0)
      {
        let currX = lastVisitedX  ;
        let currCoords;
        let currChunk = visitedChunk;
        let lim = 50;
        do {
          lim--;
          currCoords = getNeighbourCoordinats(dist[1]>0 ? 4 : 3, currChunk, hoveredY, currX);
          currChunk = currCoords[0];
          currX = (currCoords[2]%MyGame.chunkSize+MyGame.chunkSize)%MyGame.chunkSize;
          if (currChunk[hoveredY][currX] == 6)
          {
            toPropagate.push(
              [currChunk,hoveredY,currX]);
          }
          if (currChunk[hoveredY][currX] == 0 || currChunk[hoveredY][currX] == 6)
          {
            toVisit.push(
              [currChunk,hoveredY,currX, dist[1]>0 ? 3 : 4]);
          }
        } while ((currChunk[hoveredY][currX] >= 0 && currChunk[hoveredY][currX] <= 6) && lim > 0 && (currChunk != hoveredchunk || currX != hoveredX));
        doFillIn = (currChunk == hoveredchunk && currX == hoveredX) || lim == 0;
      }
    }
    if (doFillIn)
    {
      toVisit.forEach(x=>{
        x[0][x[1]][x[2]] = x[3];
        MyGame.visited.push(
          [x[0].coordinates[0]*MyGame.chunkSize + x[1],
          x[0].coordinates[1]*MyGame.chunkSize +x[2],
          x[0][x[1]][x[2]]]);
      });
      // MyGame.visited = MyGame.visited.concat(toVisit);

      window.localStorage.setItem("visitedCells", JSON.stringify(MyGame.visited));
      
      toPropagate.forEach(x=>{
        MyGame.propagationQueue.push(x)
        let rand = sfc32(x[0].coordinates[0],x[0].coordinates[1])
        MyGame.propagationCounter = 500 + rand()*1000;
      });
    }
  }
  
}
function getNeighbour(direction, chank, y, x) {// 1^ 2v 3< 4>
  switch (direction)
  {
    case 1:
      if (y == 0)
      {
        if (!MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[0]+chank.coordinates[0]-1] || ! MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[0]+chank.coordinates[0]-1][-MyGame.gridChunks[0][0].coordinates[1]+chank.coordinates[1]]) return;
        return MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[0]+chank.coordinates[0]-1][-MyGame.gridChunks[0][0].coordinates[1]+chank.coordinates[1]][MyGame.chunkSize-1][x];
      } else {
        return chank[y-1][x]
      }
      break;
    case 2:
      if (y == MyGame.chunkSize-1)
      {
        if (!MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[0]+chank.coordinates[0]+1] || ! MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[0]+chank.coordinates[0]+1][-MyGame.gridChunks[0][0].coordinates[1]+chank.coordinates[1]]) return;
        return MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[0]+chank.coordinates[0]+1][-MyGame.gridChunks[0][0].coordinates[1]+chank.coordinates[1]][0][x]
      } else {
        return chank[y+1][x]
      }
      break;
    case 3:
      if (x == 0)
      {
        if (!MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[0]+chank.coordinates[0]][-MyGame.gridChunks[0][0].coordinates[1]+chank.coordinates[1]-1]) return;
        return MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[0]+chank.coordinates[0]][-MyGame.gridChunks[0][0].coordinates[1]+chank.coordinates[1]-1][y][MyGame.chunkSize-1]
      } else {
        return chank[y][x-1]
      }
      break;
    case 4:
      if (x == MyGame.chunkSize-1)
      {
        if (!MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[0]+chank.coordinates[0]][-MyGame.gridChunks[0][0].coordinates[1]+chank.coordinates[1]+1]) return;
        return MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[0]+chank.coordinates[0]][-MyGame.gridChunks[0][0].coordinates[1]+chank.coordinates[1]+1][y][0]
      } else {
        return chank[y][x+1]
      }
      break;
  }
}
function getNeighbourCoordinats(direction, chank, y, x) {// 1^ 2v 3< 4>
  switch (direction)
  {
    case 1:
      if (y == 0)
      {
        if (!MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[0]+chank.coordinates[0]-1] || ! MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[0]+chank.coordinates[0]-1][-MyGame.gridChunks[0][0].coordinates[1]+chank.coordinates[1]]) return;
        return [MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[0]+chank.coordinates[0]-1][-MyGame.gridChunks[0][0].coordinates[1]+chank.coordinates[1]],MyGame.chunkSize-1,x];
      } else {
        return [chank,y-1,x]
      }
      break;
    case 2:
      if (y == MyGame.chunkSize-1)
      {
        if (!MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[0]+chank.coordinates[0]+1] || ! MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[0]+chank.coordinates[0]+1][-MyGame.gridChunks[0][0].coordinates[1]+chank.coordinates[1]]) return;
        return [MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[0]+chank.coordinates[0]+1][-MyGame.gridChunks[0][0].coordinates[1]+chank.coordinates[1]],0,x]
      } else {
        return [chank,y+1,x]
      }
      break;
    case 3:
      if (x == 0)
      {
        if (!MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[1]+chank.coordinates[0]][-MyGame.gridChunks[0][0].coordinates[1]+chank.coordinates[1]-1]) return;
        return [MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[0]+chank.coordinates[0]][-MyGame.gridChunks[0][0].coordinates[1]+chank.coordinates[1]-1],y,MyGame.chunkSize-1]
      } else {
        return [chank,y,x-1]
      }
      break;
    case 4:
      if (x == MyGame.chunkSize-1)
      {
        if (!MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[0]+chank.coordinates[0]][-MyGame.gridChunks[0][0].coordinates[1]+chank.coordinates[1]+1]) return;
        return [MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[0]+chank.coordinates[0]][-MyGame.gridChunks[0][0].coordinates[1]+chank.coordinates[1]+1],y,0]
      } else {
        return [chank,y,x+1]
      }
      break;
  }
}
function pathFillNeighbour(direction, chank, y, x) {// 1^ 2v 3< 4>
  switch (direction)
  {
    case 1:
      if (y == 0)
      {
        if (!MyGame.gridChunks[chank.coordinates[0]-1] || ! MyGame.gridChunks[chank.coordinates[0]-1][chank.coordinates[1]]) return;
        MyGame.gridChunks[chank.coordinates[0]-1][chank.coordinates[1]][MyGame.chunkSize-1][x] = 1;
      } else {
        chank[y-1][x] = 1;
      }
      break;
    case 2:
      if (y == MyGame.chunkSize-1)
      {
        if (!MyGame.gridChunks[chank.coordinates[0]+1] || ! MyGame.gridChunks[chank.coordinates[0]+1][chank.coordinates[1]]) return;
        MyGame.gridChunks[chank.coordinates[0]+1][chank.coordinates[1]][0][x] = 2;
      } else {
        chank[y+1][x] = 1;
      }
      break;
    case 3:
      if (x == 0)
      {
        if (!MyGame.gridChunks[chank.coordinates[0]][chank.coordinates[1]-1]) return;
        MyGame.gridChunks[chank.coordinates[0]][chank.coordinates[1]-1][y][MyGame.chunkSize-1] = 3;
      } else {
        chank[y][x-1] = 3;
      }
      break;
    case 4:
      if (x == MyGame.chunkSize-1)
      {
        if (!MyGame.gridChunks[chank.coordinates[0]][chank.coordinates[1]+1]) return;
        MyGame.gridChunks[chank.coordinates[0]][chank.coordinates[1]+1][y][0] = 4;
      } else {
        chank[y][x+1] = 4;
      }
      break;
  }
}
function cellDistanceAbs(chunk1, y1, x1, chunk2, y2, x2) {
  return Math.abs((chunk1.coordinates[0] - chunk2.coordinates[0]) * MyGame.chunkSize + y1 - y2)
    + Math.abs((chunk1.coordinates[1] - chunk2.coordinates[1]) * MyGame.chunkSize + x1 - x2);
}
function cellDistance(chunk1, y1, x1, chunk2, y2, x2) {
  return [(chunk1.coordinates[0] - chunk2.coordinates[0]) * MyGame.chunkSize + y1 - y2
    , (chunk1.coordinates[1] - chunk2.coordinates[1]) * MyGame.chunkSize + x1 - x2]
}
function cellFill(chunk, x, y, color)
{
  chunk.ctx.fillStyle=color;
  chunk.ctx.fillRect(x,y,1,1);
  MyGame.requestRedraw = true;
}
function cellFillOverlay(chunk, x, y)
{
  MyGame.overlayCtx.fillRect(
    MyGame.offsetX + (x + (chunk.coordinates[1] - MyGame.gridChunks[0][0].coordinates[1]) * MyGame.chunkSize) * MyGame.scale - MyGame.scale/30,
    MyGame.offsetY + (y + (chunk.coordinates[0] - MyGame.gridChunks[0][0].coordinates[0]) * MyGame.chunkSize) * MyGame.scale - MyGame.scale/30,
    MyGame.scale + MyGame.scale/15, MyGame.scale + MyGame.scale/15);
}
function cellStroke(chunk, x, y)
{
  // MyGame.overlayCtx.fillStyle = color;
  MyGame.overlayCtx.strokeRect(
    MyGame.offsetX + (x + (chunk.coordinates[1] - MyGame.gridChunks[0][0].coordinates[1]) * MyGame.chunkSize) * MyGame.scale - MyGame.scale/30,
    MyGame.offsetY + (y + (chunk.coordinates[0] - MyGame.gridChunks[0][0].coordinates[0]) * MyGame.chunkSize) * MyGame.scale - MyGame.scale/30,
    MyGame.scale + MyGame.scale/15, MyGame.scale + MyGame.scale/15);
}
function getChunk(y, x)
{
  let i = MyGame.gridChunks[0][0].coordinates[0];
  let j = MyGame.gridChunks[0][0].coordinates[1];
  if (MyGame.gridChunks[-i+y]) return MyGame.gridChunks[-i+y][-j+x];
  else return undefined;
}
function render(tFrame) {
  MyGame.offsetX = Math.floor(MyGame.realOffsetX);
  MyGame.offsetY = Math.floor(MyGame.realOffsetY);
  if (MyGame.requestRedraw)
  {
    MyGame.canvas.width = document.body.clientWidth;
    MyGame.canvas.height = document.body.clientHeight; 
    MyGame.ctx.webkitImageSmoothingEnabled = MyGame.scale < 1;
    MyGame.ctx.mozImageSmoothingEnabled = MyGame.scale < 1;
    MyGame.ctx.imageSmoothingEnabled = MyGame.scale < 1;
    if (MyGame.ctx.imageSmoothingEnabled) MyGame.ctx.imageSmoothingQuality = "medium";
    MyGame.ctx.clearRect(0, 0, MyGame.canvas.width, MyGame.canvas.height);
    let gc;
    if (MyGame.scale > 1/MyGame.chunkSize*15)
      for (let i = -MyGame.chunksZoneSize; i <= MyGame.chunksZoneSize; i++)
        for (let j = -MyGame.chunksZoneSize; j <= MyGame.chunksZoneSize; j++)
    {
      gc = MyGame.gridChunks[i][j];
      if (!gc.canvas) {
        createGridChunkCanvas(gc);
      }
      if (MyGame.scale >=0.8)
        MyGame.ctx.drawImage(gc.canvas, MyGame.offsetX + MyGame.scale * gc[0].length * j , MyGame.offsetY + MyGame.scale * gc.length * i, MyGame.scale * gc[0].length, MyGame.scale * gc.length);
      else if (MyGame.scale >0.5)
        MyGame.ctx.drawImage(gc.canvasHalf, MyGame.offsetX + MyGame.scale * gc[0].length * j , MyGame.offsetY + MyGame.scale * gc.length * i, MyGame.scale * gc[0].length, MyGame.scale * gc.length);
      else if (MyGame.scale > 1/MyGame.chunkSize*15)
        MyGame.ctx.drawImage(gc.canvasSmall, MyGame.offsetX + MyGame.scale * gc[0].length * j , MyGame.offsetY + MyGame.scale * gc.length * i, MyGame.scale * gc[0].length, MyGame.scale * gc.length);
      else 
      {
        MyGame.ctx.fillStyle = `rgb(${gc.avarageColor[0]}, ${gc.avarageColor[1]}, ${gc.avarageColor[2]})`;
        MyGame.ctx.fillRect(MyGame.offsetX + MyGame.scale * gc[0].length * j -1, MyGame.offsetY + MyGame.scale * gc.length * i-1, MyGame.scale * gc[0].length+1, MyGame.scale * gc.length+1);
      }
    }
    if (MyGame.scale < 1) {
      fillMetaFromTo(MyGame.gridChunks[0][0].coordinates[1]/MyGame.metachunkSize - MyGame.offsetX / MyGame.scale / MyGame.chunkSize / MyGame.metachunkSize,
        MyGame.gridChunks[0][0].coordinates[0]/MyGame.metachunkSize - MyGame.offsetY / MyGame.scale / MyGame.chunkSize / MyGame.metachunkSize,
        MyGame.gridChunks[0][0].coordinates[1]/MyGame.metachunkSize + MyGame.offsetX / MyGame.scale / MyGame.chunkSize / MyGame.metachunkSize,
        MyGame.gridChunks[0][0].coordinates[0]/MyGame.metachunkSize + MyGame.offsetY / MyGame.scale / MyGame.chunkSize / MyGame.metachunkSize);
      // if (MyGame.underlayCtx.imageSmoothingEnabled) MyGame.ctx.imageSmoothingQuality = "medium";
      MyGame.underlayCanvas.width = MyGame.canvas.width;
      MyGame.underlayCanvas.height = MyGame.canvas.height;
      MyGame.underlayCtx.webkitImageSmoothingEnabled = false;
      MyGame.underlayCtx.mozImageSmoothingEnabled = false;
      MyGame.underlayCtx.imageSmoothingEnabled = false;   
      for (let i = 0; i < MyGame.metametametachunkSize; i++) if (MyGame.metaChunks[i]) for (let j = 0; j < MyGame.metametametachunkSize; j++) if (MyGame.metaChunks[i][j] && MyGame.metaChunks[i][j].canvas){
          MyGame.underlayCtx.drawImage(MyGame.metaChunks[i][j].canvas,  MyGame.offsetX - MyGame.gridChunks[0][0].coordinates[1]*MyGame.scale*MyGame.chunkSize + MyGame.scale * MyGame.metachunkSize * MyGame.chunkSize * MyGame.metaChunks[i][j].coordinates[1] * MyGame.metametachunkSize  , MyGame.offsetY -MyGame.gridChunks[0][0].coordinates[0]*MyGame.scale*MyGame.chunkSize + MyGame.scale * MyGame.metachunkSize * MyGame.chunkSize * MyGame.metaChunks[i][j].coordinates[0] * MyGame.metametachunkSize, MyGame.scale * MyGame.chunkSize * MyGame.metachunkSize * MyGame.metametachunkSize, MyGame.scale * MyGame.chunkSize * MyGame.metachunkSize * MyGame.metametachunkSize);
      }
    }
      
    MyGame.requestRedraw = false;
  }
  MyGame.overlayCtx.clearRect(0, 0, MyGame.canvas.width, MyGame.canvas.height);
  if (MyGame.scale > 1/MyGame.chunkSize*15)
  {
    deturmineCurrentHovered();
    
    let prevValue =  MyGame.currentChunk[MyGame.hoveringCellY][MyGame.hoveringCellX];
    if(MyGame.hoveredCellChanged)
    {
      checkPathPropagate();
    }
  
    let visitedChunk;
    
    MyGame.visited.forEach(x=>{
      if (x.drawn) return;
      visitedChunk = getChunk(Math.floor(x[0]/MyGame.chunkSize), Math.floor(x[1]/MyGame.chunkSize))
      if (visitedChunk) cellFill(visitedChunk,(x[1]%MyGame.chunkSize+MyGame.chunkSize)%MyGame.chunkSize,(x[0]%MyGame.chunkSize+MyGame.chunkSize)%MyGame.chunkSize, "gray");
      x.drawn = true;
    });
    
    var currX = MyGame.hoveringCellX;
    var currY = MyGame.hoveringCellY;
    var currChunk = MyGame.currentChunk;
    var limit = 10000;
  
    
    MyGame.overlayCtx.fillStyle = "rgb(255, 200, 0)";
    while (currChunk[currY][currX] > 0 && currChunk[currY][currX] != 5 && limit > 0 && currChunk)
    {
      limit--;
      cellFillOverlay(currChunk, currX,currY);
      if (currChunk[currY][currX] == 1)
      {
        currY--;
      } else if (currChunk[currY][currX] == 2)
      {
        currY++;
      } else if (currChunk[currY][currX] == 3)
      {
        currX--;
      } else if (currChunk[currY][currX] == 4)
      {
        currX++;
      }
      if (currX < 0)
      {
        currChunk = MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[0]+currChunk.coordinates[0]][-MyGame.gridChunks[0][0].coordinates[1]+currChunk.coordinates[1]-1];
        currX = MyGame.chunkSize - 1;
      }
      else if (currX >= MyGame.chunkSize)
      {
        currChunk = MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[0]+currChunk.coordinates[0]][-MyGame.gridChunks[0][0].coordinates[1]+currChunk.coordinates[1]+1];
        currX = 0;
      }
      if (currY < 0)
      {
        currChunk = MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[0]+currChunk.coordinates[0]-1] ? MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[0]+currChunk.coordinates[0]-1][-MyGame.gridChunks[0][0].coordinates[1]+currChunk.coordinates[1]] : undefined;
        currY = MyGame.chunkSize - 1;
      }
      else if (currY >= MyGame.chunkSize)
      {
        currChunk = MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[0]+currChunk.coordinates[0]+1] ? MyGame.gridChunks[-MyGame.gridChunks[0][0].coordinates[0]+currChunk.coordinates[0]+1][-MyGame.gridChunks[0][0].coordinates[1]+currChunk.coordinates[1]] : undefined;
        currY = 0;
      }
    }
    if (currChunk[currY][currX] == 5)
    {
      MyGame.overlayCtx.fillStyle = "rgb(255, 100, 0)";
      cellFill(currChunk, currX,currY);
    }
    
    MyGame.overlayCtx.strokeStyle = "white";
    cellStroke(MyGame.currentChunk, MyGame.hoveringCellX, MyGame.hoveringCellY);
    MyGame.hoveredCellChanged = false;
  }
  if (MyGame.autoZoomOut) {
    MyGame.requestRedraw = true;
    let oldScale = MyGame.scale;
    MyGame.scale *= 0.995;
    MyGame.realOffsetX += (MyGame.canvas.width/2 - MyGame.realOffsetX) - (MyGame.canvas.width/2 - MyGame.realOffsetX) / oldScale * MyGame.scale;
    MyGame.realOffsetY += (MyGame.canvas.height/2 - MyGame.realOffsetY) - (MyGame.canvas.height/2 - MyGame.realOffsetY) / oldScale * MyGame.scale;
  }
}
function deturmineCurrentHovered()
{
  if (!MyGame.currentChunk) MyGame.currentChunk = MyGame.gridChunks[0] ? MyGame.gridChunks[0][0] : undefined;
  let cHoveringCellX = Math.floor((MyGame.currentMouseX-MyGame.realOffsetX) / MyGame.scale);
  let hoveringCellChunkX = Math.floor(cHoveringCellX / MyGame.chunkSize);

  let cHoveringCellY = Math.floor((MyGame.currentMouseY-MyGame.realOffsetY ) / MyGame.scale);
  let hoveringCellChunkY = Math.floor(cHoveringCellY / MyGame.chunkSize);
  
  let hoveredChunk =  MyGame.gridChunks[hoveringCellChunkY] ? MyGame.gridChunks[hoveringCellChunkY][hoveringCellChunkX] : undefined;
  cHoveringCellX %= MyGame.chunkSize;
  if (cHoveringCellX < 0) cHoveringCellX += MyGame.chunkSize;
  cHoveringCellY %= MyGame.chunkSize;
  if (cHoveringCellY < 0) cHoveringCellY += MyGame.chunkSize;
  if ((hoveredChunk && hoveredChunk != MyGame.currentChunk) || cHoveringCellX != MyGame.hoveringCellX || cHoveringCellY != MyGame.hoveringCellY)
  {
    MyGame.previousChunk = MyGame.currentChunk;
    MyGame.currentChunk = hoveredChunk;
    MyGame.previousHoveringCellX = MyGame.hoveringCellX;
    MyGame.previousHoveringCellY = MyGame.hoveringCellY;
    MyGame.hoveringCellX = cHoveringCellX;
    MyGame.hoveringCellY = cHoveringCellY;
    MyGame.hoveredCellChanged = true;
  }
}
function fillMetaFromTo(x1,y1,x2,y2) {
  x1 = Math.floor(x1);
  x2 = Math.floor(x2);
  y1 = Math.floor(y1);
  y2 = Math.floor(y2);
  // console.log("filling meta", x1,y1,x2,y2);
  let metametaY, metametaX;
  for(let k = y1; k <= y2; k++)
    for(let l = x1; l <= x2; l++)
  {
    metametaY = k < 0 ? MyGame.metametametachunkSize + k : k;
    metametaX = l < 0 ? MyGame.metametametachunkSize + l : l;
    // console.log("filling meta chunk", metametaY, metametaX);
    if (!MyGame.metaChunks[metametaY])
    {
      MyGame.metaChunks[metametaY] = [];
    }
    if(!MyGame.metaChunks[metametaY][metametaX])
    {
      MyGame.metaChunks[metametaY][metametaX] = [];
      let metaRand = sfc32(metametaY,metametaX);
      for(var i = 0; i < MyGame.metametachunkSize; i++)
      {
        MyGame.metaChunks[metametaY][metametaX][i]=[];
        for(var j = 0; j < MyGame.metametachunkSize; j++) MyGame.metaChunks[metametaY][metametaX][i][j]= Math.ceil(+(i%2 ? j%2 ? -1 : (metaRand()<0.6 ? -1 : 1) : j%2 ? metaRand()<0.5 ? -1 : 1 : 1) * metaRand() * 10);
      }
      MyGame.metaChunks[metametaY][metametaX].coordinates = [MyGame.metametametachunkSize-metametaY < metametaY ? -MyGame.metametametachunkSize+metametaY : metametaY, MyGame.metametametachunkSize-metametaX < metametaX ? -MyGame.metametametachunkSize+metametaX : metametaX];
      creatMetaChunkCanvas(MyGame.metaChunks[metametaY][metametaX]);
    }
  }

  
}
function fillChunk(chunk, method) {
  
  let metaY = Math.floor(chunk.coordinates[0]/MyGame.metachunkSize);
  let metametaY = Math.floor(metaY/MyGame.metametachunkSize);
  if (metaY<0) metaY += MyGame.metametachunkSize;
  if (metametaY<0) metametaY += MyGame.metametametachunkSize;

  let metaX = Math.floor(chunk.coordinates[1]/MyGame.metachunkSize);
  let metametaX = Math.floor(metaX/MyGame.metametachunkSize);
  if (metaX<0) metaX += MyGame.metametachunkSize;
  if (metametaX<0) metametaX += MyGame.metametametachunkSize;

  if (!MyGame.metaChunks[metametaY])
  {
    MyGame.metaChunks[metametaY] = [];
  }
  if(!MyGame.metaChunks[metametaY][metametaX])
  {
    fillMetaFromTo(metametaX,metametaY,metametaX,metametaY)
  }
  
  if (MyGame.metaChunks[metametaY][metametaX]
    && MyGame.metaChunks[metametaY][metametaX][metaY%MyGame.metametachunkSize])
  {
    if(MyGame.metaChunks[metametaY][metametaX][metaY%MyGame.metametachunkSize][metaX%MyGame.metametachunkSize] > 0 && !(metaY==0 && metaX ==0))
    {
      let rand = sfc32(chunk.coordinates[0],chunk.coordinates[1], 0, 0);
      if(MyGame.metaChunks[metametaY][metametaX][metaY%MyGame.metametachunkSize][metaX%MyGame.metametachunkSize] >= 5)
      {
        for(i = 0; i < MyGame.chunkSize; i++)
        {
          chunk[i]=[];
          for(j = 0; j < MyGame.chunkSize; j++) chunk[i][j]= +(i%2 ? j%2 ? -1 : (rand()<0.9 ? -1 : 0) : j%2 ? rand()<0.8 ? -1 : 0 : 0);
        }
      }
      else {
        for(i = 0; i < MyGame.chunkSize; i++)
        {
          chunk[i]=[];
          for(j = 0; j < MyGame.chunkSize; j++) chunk[i][j]= rand()<0.7 ? -1 : 0;
        }
      }
    }
    else
    {
      let half = Math.floor(MyGame.chunkSize/2)
      let rand = sfc32(chunk.coordinates[0],chunk.coordinates[1], 0, 0);
      // if ((metaY==0 && metaX ==0))
      // {
      //   let sortFunction;
      //   let dontPrefill = true;
      //   let dirX = 1, dirY = 1;
      //   sortFunction = (cX,cY,pX,pY)=>(x,y)=> -((x[0] - cX) - dirX) - ((x[1] - cY) - dirY) + ((y[0] - cX - dirX) + (y[1] - cY) - dirY ) + rand()*0.0001-0.00005;
      //   for(i = 0; i <= MyGame.chunkSize; i++)
      //   {
      //     chunk[i]=[];
      //     for(j = 0; j <= MyGame.chunkSize; j++) chunk[i][j]= -1;//i%2 || j%2 ? -1 : 0;
      //   }
      //   half += half%2;
      //   let waitList = [[half,half,half,half]];
      //   let cX,cY,pX,pY;
      //   let candidates = [];
      //   while(waitList.length)
      //   {
      //     [cY,cX,pY,pX] = waitList.pop();
      //     if (cX<0 || cX>MyGame.chunkSize || cY<0 || cY>MyGame.chunkSize) continue;
      //     if (dontPrefill && chunk[cY][cX] == 0) continue;
      //     chunk[cY][cX] = 0;
      //     dirX = Math.clamp(dirX + rand()*0.01-0.005, -1, 1); dirY = Math.clamp(dirY+rand()*0.01-0.005, -1, 1);
      //     candidates = [[cY-2,cX,cY,cX],[cY+2,cX,cY,cX],[cY,cX-2,cY,cX],[cY,cX+2,cY,cX]].filter(c=>chunk[c[0]] && c[1]>=0 && c[1]<=MyGame.chunkSize && chunk[c[0]][c[1]]!=0).sort(sortFunction(cX,cY,pX,pY));
      //     // console.log(candidates.length);
      //     if (!dontPrefill) {
      //       candidates.forEach(c=>{chunk[(c[0]+cY)/2][(c[1]+cX)/2]=0;chunk[c[0]][c[1]]=0;});
      //     } else {
      //       chunk[(pY+cY)/2][(pX+cX)/2]=0;
      //     }
      //     if(candidates.length) waitList = waitList.concat(candidates);
      //   }
      //   chunk[half-3][half] = 0;
      //   chunk[half+3][half] = 0;
      //   chunk[half][half-3] = 0;
      //   chunk[half][half+3] = 0;
      //   chunk.pop();
      //   for(i = 0; i < MyGame.chunkSize; i++)
      //   {
      //     chunk[i].pop();
      //   }
      // }
      // else
      if(MyGame.metaChunks[metametaY][metametaX][metaY%MyGame.metametachunkSize][metaX%MyGame.metametachunkSize] <= -8 || (metaY==0 && metaX ==0))
      {
        for(i = 0; i < MyGame.chunkSize; i++)
        {
          chunk[i]=[];
          for(j = 0; j < MyGame.chunkSize; j++) chunk[i][j]= +(i%2 ? j%2 ? -1 : (rand()<0.5 ? -1 : 0) : j%2 ? rand()<0.4 ? -1 : 0 : 0);
        }
      }
      else if (MyGame.metaChunks[metametaY][metametaX][metaY%MyGame.metametachunkSize][metaX%MyGame.metametachunkSize] <= -6 )
      {
        for(i = 0; i < MyGame.chunkSize; i++)
        {
          chunk[i]=[];
          for(j = 0; j < MyGame.chunkSize; j++) chunk[i][j]= rand()<0.35 ? -1 : 0;
        }
      }
      else {
        let sortFunction;
        let dontPrefill = false;
        switch (MyGame.metaChunks[metametaY][metametaX][metaY%MyGame.metametachunkSize][metaX%MyGame.metametachunkSize])
        {
          case -5:
            sortFunction = (cX,cY)=>(x,y)=>rand()*2-(x[0]==cY ? 0.5:1)
            break;
          case -4:
            sortFunction = (cX,cY)=>(x,y)=>rand()*2-1;
            break;
          case -3: {
              sortFunction = (cX,cY)=>(x,y)=>rand()*2-(Math.abs(cX - MyGame.chunkSize/2)>Math.abs(cY - MyGame.chunkSize/2) ? x[0]==cY ? 0.1:1.9:x[1]==cX ? 0.1:1.9);
              dontPrefill = true;
            }
            break;
          case -2: {
            sortFunction = (cX,cY)=>(x,y)=>rand()*2-(x[0]==cY ? 0.3:1.7);
            dontPrefill = true;
          }
            break;
          case -1: {
            sortFunction = (cX,cY,pX,pY)=>(x,y)=>rand()*2-(x[1]-cX == cX - pX && x[0]-cY == cY - pY ? 1.7:0.3);
            dontPrefill = true;
          }
            break;
          default: {
            sortFunction = (cX,cY)=>(x,y)=>rand()*2-1;
          }

        }
        for(i = 0; i <= MyGame.chunkSize; i++)
        {
          chunk[i]=[];
          for(j = 0; j <= MyGame.chunkSize; j++) chunk[i][j]= -1;//i%2 || j%2 ? -1 : 0;
        }
        half += half%2;
        // chunk[half][half] = 0;
        let waitList = [[half,half,half,half]];
        let cX,cY,pX,pY;
        let candidates = [];
        // pX=cX;pY=cY;
        while(waitList.length)
        {
          [cY,cX,pY,pX] = waitList.pop();
          if (cX<0 || cX>MyGame.chunkSize || cY<0 || cY>MyGame.chunkSize) continue;
          if (dontPrefill && chunk[cY][cX] == 0) continue;
          chunk[cY][cX] = 0;
          candidates = [[cY-2,cX,cY,cX],[cY+2,cX,cY,cX],[cY,cX-2,cY,cX],[cY,cX+2,cY,cX]].filter(c=>chunk[c[0]] && c[1]>=0 && c[1]<=MyGame.chunkSize && chunk[c[0]][c[1]]!=0).sort(sortFunction(cX,cY,pX,pY));
          // console.log(candidates.length);
          if (!dontPrefill) {
            candidates.forEach(c=>{chunk[(c[0]+cY)/2][(c[1]+cX)/2]=0;chunk[c[0]][c[1]]=0;});
          } else {
            chunk[(pY+cY)/2][(pX+cX)/2]=0;
          }
          if(candidates.length) waitList = waitList.concat(candidates);
        }
        chunk[half-3][half] = 0;
        chunk[half+3][half] = 0;
        chunk[half][half-3] = 0;
        chunk[half][half+3] = 0;
        chunk.pop();
        for(i = 0; i < MyGame.chunkSize; i++)
        {
          chunk[i].pop();
        }
      }
    chunk[half+1][half] = 6;
    chunk[half][half] = 6;
    chunk[half-1][half] = 6;
    chunk[half+1][half-1] = 6;
    chunk[half][half-1] = 6;
    chunk[half-1][half-1] = 6;
    chunk[half+1][half+1] = 6;
    chunk[half][half+1] = 6;
    chunk[half-1][half+1] = 6;
    }

  }

  createGridChunkCanvas(chunk);
}
function registerVisit(chunk,y,x, value, dontUpdateStorage)
{
  if (chunk[y][x] == 6) MyGame.propagationCounter += 100;
  MyGame.visited.push(
    [chunk.coordinates[0]*MyGame.chunkSize + y,
    chunk.coordinates[1]*MyGame.chunkSize +x,
    value ? value : chunk[y][x]]);
  if (!dontUpdateStorage)window.localStorage.setItem("visitedCells", JSON.stringify(MyGame.visited));
  if (value && chunk[y][x] !=value)chunk[y][x] =value;
}
function update(DOMHighResTimeStamp) {
  if (MyGame.propagationCounter >0 && MyGame.propagationQueue.length)
  {
    let wavePower = Math.min(20, Math.ceil(MyGame.propagationCounter/10), MyGame.propagationQueue.length);
    MyGame.propagationCounter-= wavePower;
    let newPropagationQueue = [];
    let c,c1,c2,c3,c4;
    for (let i = 0;i < wavePower && MyGame.propagationQueue.length; i++)
    {
      c= MyGame.propagationQueue.pop();
      if(!c) continue;
      var rand = MyGame.propagationQueue.length > 3 ? sfc32(c[0].coordinates[0],c[0].coordinates[1]) : _=>0;
      c1=getNeighbourCoordinats(1,c[0],c[1],c[2]);
      c2=getNeighbourCoordinats(2,c[0],c[1],c[2]);
      c3=getNeighbourCoordinats(3,c[0],c[1],c[2]);
      c4=getNeighbourCoordinats(4,c[0],c[1],c[2]);
      if (c1 && (c1[0][c1[1]][c1[2]] == 0 || c1[0][c1[1]][c1[2]] == 6)) {newPropagationQueue.push(c1);registerVisit(c1[0],c1[1],c1[2], 2,true);}
      if (c2 && (c2[0][c2[1]][c2[2]] == 0 || c2[0][c2[1]][c2[2]] == 6)) {newPropagationQueue.push(c2);registerVisit(c2[0],c2[1],c2[2], 1,true);}
      if (c3 && (c3[0][c3[1]][c3[2]] == 0 || c3[0][c3[1]][c3[2]] == 6)) {newPropagationQueue.push(c3);registerVisit(c3[0],c3[1],c3[2], 4, true);}
      if (c4 && (c4[0][c4[1]][c4[2]] == 0 || c4[0][c4[1]][c4[2]] == 6)) {newPropagationQueue.push(c4);registerVisit(c4[0],c4[1],c4[2], 3, true);}
    }
    window.localStorage.setItem("visitedCells", JSON.stringify(MyGame.visited));
    MyGame.propagationQueue = MyGame.propagationQueue.concat(newPropagationQueue.sort(_=>rand()*2-1));
    if (MyGame.propagationQueue.length == 0) MyGame.propagationCounter = 0;
  }
  if (MyGame.propagationCounter <= 0 && MyGame.propagationQueue.length)
  {
    MyGame.propagationQueue = [];
  }
  if (MyGame.scale > 1/MyGame.chunkSize*15)
  {
    if (MyGame.realOffsetX - MyGame.canvas.width/2 > 0) {shiftChunks(0, Math.ceil((MyGame.realOffsetX - MyGame.canvas.width/2) / (MyGame.chunkSize * MyGame.scale)));
    }else if (MyGame.realOffsetX + MyGame.scale * MyGame.chunkSize - MyGame.canvas.width/2 < 0) shiftChunks(0,Math.floor((MyGame.realOffsetX + MyGame.scale * MyGame.chunkSize - MyGame.canvas.width/2) / (MyGame.chunkSize * MyGame.scale)));
    if (MyGame.realOffsetY - MyGame.canvas.height/2 > 0){
      shiftChunks(Math.ceil((MyGame.realOffsetY - MyGame.canvas.height/2) / (MyGame.chunkSize * MyGame.scale)),0);
    }
    else if (MyGame.realOffsetY + MyGame.scale * MyGame.chunkSize - MyGame.canvas.height/2 < 0) shiftChunks(Math.floor((MyGame.realOffsetY + MyGame.scale * MyGame.chunkSize - MyGame.canvas.height/2) / (MyGame.chunkSize * MyGame.scale)),0);
  }
}
function shiftChunks(y,x)
{
  console.log("shifting",y,x)
  let newGrid = [];
  for (let i = -MyGame.chunksZoneSize ; i <= MyGame.chunksZoneSize; i++) for (let j = -MyGame.chunksZoneSize; j <= MyGame.chunksZoneSize; j++) {
    if (!newGrid[i]) newGrid[i] = [];
    if(MyGame.gridChunks[i-y] && MyGame.gridChunks[i-y][j-x])
    {
      newGrid[i][j] = MyGame.gridChunks[i-y][j-x];
      // newGrid[i][j].coordinates = [i,j];
    }
    else
    {
      newGrid[i][j] = [];
      newGrid[i][j].coordinates = [];
      newGrid[i][j].coordinates[0] = MyGame.gridChunks[0][0].coordinates[0] + i - y;
      newGrid[i][j].coordinates[1] = MyGame.gridChunks[0][0].coordinates[1] + j - x;
      fillChunk(newGrid[i][j]);
    }
  }
  MyGame.gridChunks =  newGrid;
  MyGame.realOffsetX -= x*MyGame.chunkSize * MyGame.scale;
  MyGame.realOffsetY -= y*MyGame.chunkSize * MyGame.scale;
  MyGame.requestRedraw = true;
}
function setInitialState() {
  MyGame.requestRedraw = true;
  MyGame.canvas = document.getElementById("canvas");
  MyGame.canvas.width = document.body.clientWidth;
  MyGame.canvas.height = document.body.clientHeight; 
  MyGame.ctx = MyGame.canvas.getContext("2d");

  MyGame.overlayCanvas = document.getElementById("overlayCanvas");
  MyGame.overlayCanvas.width = MyGame.canvas.width;
  MyGame.overlayCanvas.height = MyGame.canvas.height; 
  MyGame.overlayCtx = MyGame.overlayCanvas.getContext("2d");

  MyGame.underlayCanvas = document.getElementById("underlayCanvas");
  MyGame.underlayCanvas.width = MyGame.canvas.width;
  MyGame.underlayCanvas.height = MyGame.canvas.height; 
  MyGame.underlayCtx = MyGame.underlayCanvas.getContext("2d");

  MyGame.chunkSize = 100;
  MyGame.chunksZoneSize = 20;
  MyGame.metachunkSize=2;
  MyGame.metametachunkSize=10;
  MyGame.metametametachunkSize=100000;
  MyGame.metaChunks = [];
  MyGame.gridChunks = [];
  MyGame.propagationQueue = [];
  for (var i = -MyGame.chunksZoneSize; i <= MyGame.chunksZoneSize; i++)
  {
    MyGame.gridChunks[i] =[];
    for (var j = -MyGame.chunksZoneSize; j <= MyGame.chunksZoneSize; j++)
    {
      MyGame.gridChunks[i][j] =[];
      MyGame.gridChunks[i][j].coordinates = [i,j];
      fillChunk(MyGame.gridChunks[i][j]);
    }
  }
  // window.localStorage.removeItem("visitedCells");
  let v = window.localStorage.getItem("visitedCells");
  MyGame.visited = v ? JSON.parse(v) : [];
  let visitedChunk;
  MyGame.visited.forEach(x=>{
    visitedChunk = getChunk(Math.floor(x[0]/MyGame.chunkSize), Math.floor(x[1]/MyGame.chunkSize));
    if (visitedChunk) visitedChunk[(x[0]%MyGame.chunkSize+MyGame.chunkSize)%MyGame.chunkSize][(x[1]%MyGame.chunkSize+MyGame.chunkSize)%MyGame.chunkSize] = x[2];
    visitedChunk = undefined;
  })
  
  MyGame.gridChunks[0][0][MyGame.chunkSize/2+1][MyGame.chunkSize/2-1]=5;
  MyGame.gridChunks[0][0][MyGame.chunkSize/2][MyGame.chunkSize/2-1]=5;
  MyGame.gridChunks[0][0][MyGame.chunkSize/2-1][MyGame.chunkSize/2-1]=5;
  MyGame.gridChunks[0][0][MyGame.chunkSize/2+1][MyGame.chunkSize/2]=5;
  MyGame.gridChunks[0][0][MyGame.chunkSize/2][MyGame.chunkSize/2]=5;
  MyGame.gridChunks[0][0][MyGame.chunkSize/2-1][MyGame.chunkSize/2]=5;
  MyGame.gridChunks[0][0][MyGame.chunkSize/2+1][MyGame.chunkSize/2+1]=5;
  MyGame.gridChunks[0][0][MyGame.chunkSize/2][MyGame.chunkSize/2+1]=5;
  MyGame.gridChunks[0][0][MyGame.chunkSize/2-1][MyGame.chunkSize/2+1]=5;
  createGridChunkCanvas(MyGame.gridChunks[0][0]);

  MyGame.scale = 15;
  MyGame.realOffsetX = - MyGame.gridChunks[0][0].length / 2 * MyGame.scale + MyGame.canvas.width/2;
  MyGame.realOffsetY = - MyGame.gridChunks[0][0].length / 2 * MyGame.scale + MyGame.canvas.height/2;
  document.onmousemove = handleMouseMove;

  function handleMouseMove(event) {
      var eventDoc, doc, body;

      event = event || window.event; // IE-ism

      // If pageX/Y aren't available and clientX/Y are,
      // calculate pageX/Y - logic taken from jQuery.
      // (This is to support old IE)
      if (event.pageX == null && event.clientX != null) {
          eventDoc = (event.target && event.target.ownerDocument) || document;
          doc = eventDoc.documentElement;
          body = eventDoc.body;

          event.pageX = event.clientX +
            (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
            (doc && doc.clientLeft || body && body.clientLeft || 0);
          event.pageY = event.clientY +
            (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
            (doc && doc.clientTop  || body && body.clientTop  || 0 );
      }

      if (MyGame.leftPressed)
      {
        MyGame.requestRedraw = true;
        MyGame.realOffsetX +=  event.pageX - MyGame.currentMouseX;
        MyGame.realOffsetY +=  event.pageY - MyGame.currentMouseY;
      }
      MyGame.currentMouseX = event.pageX;
      MyGame.currentMouseY = event.pageY;
  }
  document.addEventListener("mousedown", mouseDownHandler, false);
  document.addEventListener("mouseup", mouseUpHandler, false);
  document.addEventListener("wheel", wheelHandler, false);
  document.addEventListener("keydown", keyHandler, false);
  MyGame.rightPressed = false;
  MyGame.leftPressed = false;
  MyGame.upPressed = false;
  MyGame.downPressed = false;
  function mouseDownHandler(event) {
    if (event.button  === 2) {
      MyGame.rightPressed = true;
    }
    if (event.button === 0) {
      MyGame.leftPressed = true;
    }
  }
  function mouseUpHandler(event) {
    if (event.button  === 2) {
      MyGame.rightPressed = false;
    }
    if (event.button === 0) {
      MyGame.leftPressed = false;
    }
  }
  function wheelHandler(event) {
    MyGame.requestRedraw = true;
    let oldScale = MyGame.scale;
    MyGame.scale *= 1 - event.deltaY/5000;
    // if (MyGame.scale > 1) MyGame.scale = Math.floor(MyGame.scale*10) /10;
    // if (MyGame.scale == oldScale) MyGame.scale = oldScale + (event.deltaY < 0 ? -0.1 : 0.1);
    // if (MyGame.scale < 1) MyGame.scale = 1;
    MyGame.realOffsetX += (MyGame.currentMouseX - MyGame.realOffsetX) - (MyGame.currentMouseX - MyGame.realOffsetX) / oldScale * MyGame.scale;
    MyGame.realOffsetY += (MyGame.currentMouseY - MyGame.realOffsetY) - (MyGame.currentMouseY - MyGame.realOffsetY) / oldScale * MyGame.scale;
  }
  function keyHandler(event) {
    if (event.key == "-") {
      MyGame.autoZoomOut = !MyGame.autoZoomOut;
    } 
  }
}




function downScaleCanvas(cv, scale) {//taken from https://itecnote.com/tecnote/javascript-html5-canvas-resize-downscale-image-high-quality/
  if (!(scale < 1) || !(scale > 0)) throw ('scale must be a positive number <1 ');
  var sqScale = scale * scale; // square scale = area of source pixel within target
  var sw = cv.width; // source image width
  var sh = cv.height; // source image height
  var tw = Math.floor(sw * scale); // target image width
  var th = Math.floor(sh * scale); // target image height
  var sx = 0, sy = 0, sIndex = 0; // source x,y, index within source array
  var tx = 0, ty = 0, yIndex = 0, tIndex = 0; // target x,y, x,y index within target array
  var tX = 0, tY = 0; // rounded tx, ty
  var w = 0, nw = 0, wx = 0, nwx = 0, wy = 0, nwy = 0; // weight / next weight x / y
  // weight is weight of current source point within target.
  // next weight is weight of current source point within next target's point.
  var crossX = false; // does scaled px cross its current px right border ?
  var crossY = false; // does scaled px cross its current px bottom border ?
  var sBuffer = cv.getContext('2d').
  getImageData(0, 0, sw, sh).data; // source buffer 8 bit rgba
  var tBuffer = new Float32Array(3 * tw * th); // target buffer Float32 rgb
  var sR = 0, sG = 0,  sB = 0; // source's current point r,g,b
  /* untested !
  var sA = 0;  //source alpha  */    

  for (sy = 0; sy < sh; sy++) {
      ty = sy * scale; // y src position within target
      tY = 0 | ty;     // rounded : target pixel's y
      yIndex = 3 * tY * tw;  // line index within target array
      crossY = (tY != (0 | ty + scale)); 
      if (crossY) { // if pixel is crossing botton target pixel
          wy = (tY + 1 - ty); // weight of point within target pixel
          nwy = (ty + scale - tY - 1); // ... within y+1 target pixel
      }
      for (sx = 0; sx < sw; sx++, sIndex += 4) {
          tx = sx * scale; // x src position within target
          tX = 0 |  tx;    // rounded : target pixel's x
          tIndex = yIndex + tX * 3; // target pixel index within target array
          crossX = (tX != (0 | tx + scale));
          if (crossX) { // if pixel is crossing target pixel's right
              wx = (tX + 1 - tx); // weight of point within target pixel
              nwx = (tx + scale - tX - 1); // ... within x+1 target pixel
          }
          sR = sBuffer[sIndex    ];   // retrieving r,g,b for curr src px.
          sG = sBuffer[sIndex + 1];
          sB = sBuffer[sIndex + 2];

          /* !! untested : handling alpha !!
             sA = sBuffer[sIndex + 3];
             if (!sA) continue;
             if (sA != 0xFF) {
                 sR = (sR * sA) >> 8;  // or use /256 instead ??
                 sG = (sG * sA) >> 8;
                 sB = (sB * sA) >> 8;
             }
          */
          if (!crossX && !crossY) { // pixel does not cross
              // just add components weighted by squared scale.
              tBuffer[tIndex    ] += sR * sqScale;
              tBuffer[tIndex + 1] += sG * sqScale;
              tBuffer[tIndex + 2] += sB * sqScale;
          } else if (crossX && !crossY) { // cross on X only
              w = wx * scale;
              // add weighted component for current px
              tBuffer[tIndex    ] += sR * w;
              tBuffer[tIndex + 1] += sG * w;
              tBuffer[tIndex + 2] += sB * w;
              // add weighted component for next (tX+1) px                
              nw = nwx * scale
              tBuffer[tIndex + 3] += sR * nw;
              tBuffer[tIndex + 4] += sG * nw;
              tBuffer[tIndex + 5] += sB * nw;
          } else if (crossY && !crossX) { // cross on Y only
              w = wy * scale;
              // add weighted component for current px
              tBuffer[tIndex    ] += sR * w;
              tBuffer[tIndex + 1] += sG * w;
              tBuffer[tIndex + 2] += sB * w;
              // add weighted component for next (tY+1) px                
              nw = nwy * scale
              tBuffer[tIndex + 3 * tw    ] += sR * nw;
              tBuffer[tIndex + 3 * tw + 1] += sG * nw;
              tBuffer[tIndex + 3 * tw + 2] += sB * nw;
          } else { // crosses both x and y : four target points involved
              // add weighted component for current px
              w = wx * wy;
              tBuffer[tIndex    ] += sR * w;
              tBuffer[tIndex + 1] += sG * w;
              tBuffer[tIndex + 2] += sB * w;
              // for tX + 1; tY px
              nw = nwx * wy;
              tBuffer[tIndex + 3] += sR * nw;
              tBuffer[tIndex + 4] += sG * nw;
              tBuffer[tIndex + 5] += sB * nw;
              // for tX ; tY + 1 px
              nw = wx * nwy;
              tBuffer[tIndex + 3 * tw    ] += sR * nw;
              tBuffer[tIndex + 3 * tw + 1] += sG * nw;
              tBuffer[tIndex + 3 * tw + 2] += sB * nw;
              // for tX + 1 ; tY +1 px
              nw = nwx * nwy;
              tBuffer[tIndex + 3 * tw + 3] += sR * nw;
              tBuffer[tIndex + 3 * tw + 4] += sG * nw;
              tBuffer[tIndex + 3 * tw + 5] += sB * nw;
          }
      } // end for sx 
  } // end for sy

  // create result canvas
  var resCV = document.createElement('canvas');
  resCV.width = tw;
  resCV.height = th;
  var resCtx = resCV.getContext('2d');
  var imgRes = resCtx.getImageData(0, 0, tw, th);
  var tByteBuffer = imgRes.data;
  // convert float32 array into a UInt8Clamped Array
  var pxIndex = 0; //  
  for (sIndex = 0, tIndex = 0; pxIndex < tw * th; sIndex += 3, tIndex += 4, pxIndex++) {
      tByteBuffer[tIndex] = Math.ceil(tBuffer[sIndex]);
      tByteBuffer[tIndex + 1] = Math.ceil(tBuffer[sIndex + 1]);
      tByteBuffer[tIndex + 2] = Math.ceil(tBuffer[sIndex + 2]);
      tByteBuffer[tIndex + 3] = 255;
  }
  // writing result to canvas.
  resCtx.putImageData(imgRes, 0, 0);
  return resCV;
}
function sfc32(a, b, c, d) {// from there: https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
  return function() {
    a |= 0; b |= 0; c |= 0; d |= 0; 
    var t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}
Math.clamp = (num, min, max) => Math.min(Math.max(num, min), max)
