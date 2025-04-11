

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
MyGame.characterWidth = 600;
MyGame.characterHeight = 770;

MyGame.step1CharacterWidth = 300;
MyGame.step1CharacterHeight = 360;

MyGame.step2CharacterWidth = 120;
MyGame.step2CharacterHeight = 154;

MyGame.miniCharacterWidth = 60;
MyGame.miniCharacterHeight = 77;
MyGame.difficulty = 1;

MyGame.setCanvasHeight = 6000;
MyGame.setCanvasWidth = 8000;
MyGame.allLoaded = false;

function createCharacterCanvas(character) //character.file must be the path to the file
{
  character.canvas = document.createElement("canvas");
  character.canvas.width = character.width;
  character.canvas.height = character.height;
  character.ctx = character.canvas.getContext("2d");
  var charImage = new Image();
  // charImage.crossOrigin = "Anonymous";


  // character.canvasStep1 = document.createElement("canvas");
  // character.canvasStep1.width = MyGame.step1CharacterWidth;
  // character.canvasStep1.height = MyGame.step1CharacterHeight;
  // character.ctxStep1= character.canvasStep1.getContext("2d");
  
  // character.canvasStep2 = document.createElement("canvas");
  // character.canvasStep2.width = MyGame.step2CharacterWidth;
  // character.canvasStep2.height = MyGame.step2CharacterHeight;
  // character.ctxStep2= character.canvasStep2.getContext("2d");

  // character.canvasMini = document.createElement("canvas");
  // character.canvasMini.width = MyGame.miniCharacterWidth;
  // character.canvasMini.height = MyGame.miniCharacterHeight;
  // character.ctxMini = character.canvasMini.getContext("2d");

  // character.canvasMiniDark = document.createElement("canvas");
  // character.canvasMiniDark.width = MyGame.miniCharacterWidth;
  // character.canvasMiniDark.height = MyGame.miniCharacterHeight;
  // character.ctxMiniDark = character.canvasMiniDark.getContext("2d");

  character.canvasDark = document.createElement("canvas");
  character.canvasDark.width = MyGame.characterWidth;
  character.canvasDark.height = MyGame.characterHeight;
  character.ctxDark = character.canvasDark.getContext("2d");
  


  charImage.onload = function () {
    character.ctx.drawImage(charImage, 0, 0);
    // character.ctxStep1.drawImage(character.canvas, 0,0,character.canvasStep1.width,character.canvasStep1.height)
    // character.ctxStep2.drawImage(character.canvasStep1, 0,0,character.canvasStep2.width,character.canvasStep2.height)
    // character.ctxMini.drawImage(character.canvasStep2, 0,0,character.canvasMini.width,character.canvasMini.height)

    character.ctxDark.drawImage(character.canvas, 0,0)
    character.ctxDark.globalCompositeOperation = "multiply"
    character.ctxDark.fillStyle = "rgb(100,100,100)"
    character.ctxDark.fillRect(0,0,character.canvasDark.width,character.canvasDark.height)
    character.ctxDark.globalCompositeOperation = "destination-in";
    character.ctxDark.drawImage(character.canvas,0,0);

      // ctx.fillStyle = "rgba(200, 0, 0, 0.5)";
      // character.ctx.fillRect(0, 0, 500, 500);
    console.log("loaded " + character.name);
    // MyGame.requestRedraw = true;
    character.loaded = true;
  };

  charImage.src = character.file;

  return character.canvas;
}

function cellStroke(chunk, x, y)
{
  // MyGame.overlayCtx.fillStyle = color;
  MyGame.overlayCtx.strokeRect(
    MyGame.offsetX + (x + (chunk.coordinates[1] - MyGame.gridChunks[0][0].coordinates[1]) * MyGame.chunkSize) * MyGame.scale - MyGame.scale/30,
    MyGame.offsetY + (y + (chunk.coordinates[0] - MyGame.gridChunks[0][0].coordinates[0]) * MyGame.chunkSize) * MyGame.scale - MyGame.scale/30,
    MyGame.scale + MyGame.scale/15, MyGame.scale + MyGame.scale/15);
}
function render(tFrame) {
  if (MyGame.requestRedraw && MyGame.allLoaded)
  {
    // MyGame.canvas.width = MyGame.setCanvasWidth;
    // MyGame.canvas.height = MyGame.setCanvasHeight; 
    MyGame.ctx.clearRect(0, 0, MyGame.canvas.width, MyGame.canvas.height);

    MyGame.characters.forEach(x=> {
      if (MyGame.characterDarkenFilter && MyGame.characterDarkenFilter(x)) MyGame.ctx.drawImage(x.prefab.canvasDark, x.positionX, x.positionY);
      else MyGame.ctx.drawImage(x.prefab.canvas, x.positionX, x.positionY);
    })
    
    // console.log(HowMuchIsVisible(MyGame.target));

    // MyGame.ctx.fillStyle = 
    //MyGame.ctx.drawImage(gc.canvas, MyGame.offsetX + MyGame.scale * gc[0].length * j , MyGame.offsetY + MyGame.scale * gc.length * i, MyGame.scale * gc[0].length, MyGame.scale * gc.length);
     
    
    MyGame.requestRedraw = false;
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
function update(DOMHighResTimeStamp) {
  if(!MyGame.allLoaded){
    MyGame.allLoaded = MyGame.characterPreafabs && MyGame.characterPreafabs.every(x=>x.loaded);
    if (MyGame.allLoaded) {
      MyGame.requestRedraw = true;
      startLvl("grid")
    }
  }
}
function loadCharacters() {
  MyGame.characterPreafabs = ["omni","debbie","invincible","twin","eve","alien"];

  MyGame.characterPreafabs = MyGame.characterPreafabs.map(x=>{return {
    name: x,
    file: x+".png",
    width: MyGame.characterWidth,
    height: MyGame.characterHeight,
    miniWidth: MyGame.miniCharacterWidth,
    miniHeight: MyGame.miniCharacterHeight
  }})
  MyGame.characterPreafabs.forEach(x=>createCharacterCanvas(x));
}
function startLvl(style, lvl)
{
  MyGame.targetPrefab = MyGame.characterPreafabs[0];
  let fillerChars = MyGame.characterPreafabs.filter(x=>x!=MyGame.targetPrefab);
  let visibility = 0, tries = 50;
  while(tries-- > 0 && (visibility < Math.max(7000, 100000 - MyGame.difficulty * 2000) || visibility > 296000 - MyGame.difficulty * 2000))
  {
    MyGame.characters = [];
    switch (style)
    {
      case "grid":
        let howManyX = 8;
        let howManyY = 8;
        let grid = Array(howManyY).fill(0);
        grid = grid.map(_=>Array(howManyX).fill(0));
        let targetX = Math.random()*grid[0].length|0;
        let targetY = Math.random()*grid.length|0;
        grid[targetY][targetX] = 1;
        
        grid.forEach((x,i)=>x.forEach((y,j)=>{
          MyGame.characters.push({
            prefab: y ? MyGame.targetPrefab : selectRandom(fillerChars),
            positionX: MyGame.canvas.width/howManyX*j,
            positionY: MyGame.canvas.height/howManyY*i
          });
          if (y) MyGame.target = MyGame.characters[MyGame.characters.length-1];
        }))
        break;
      case "random":
      default:
        MyGame.characters.push({
          prefab: MyGame.targetPrefab,
          positionX: (Math.random() * (MyGame.canvas.width - MyGame.characterWidth)),
          positionY: (Math.random() * (MyGame.canvas.height - MyGame.characterHeight))
        })
        MyGame.target = MyGame.characters[MyGame.characters.length-1];
        for (let i = 0; i < MyGame.difficulty*10; i++) MyGame.characters.push(
          {
            prefab: selectRandom(fillerChars),
            positionX: (Math.random() * (MyGame.canvas.width - MyGame.characterWidth)),
            positionY: (Math.random() * (MyGame.canvas.height - MyGame.characterHeight))
          });
          MyGame.characters.sort(x=>Math.random()*2-1);
        // let tries1 = 100;
        // let nm = document.querySelector("#canvas").width / MyGame.setCanvasWidth * Math.max(1000/(MyGame.difficulty), 300);
        // while (MyGame.characters.some((x,i)=>i !=0 && (x.positionX - MyGame.characters[0].positionX)**2 + (x.positionY - MyGame.characters[0].positionY)**2 < nm ) && tries1-- > 0)
        //   {MyGame.characters[0].positionX = (Math.random() * (MyGame.canvas.width - MyGame.characterWidth));
        //     MyGame.characters[0].positionY = (Math.random() * (MyGame.canvas.height - MyGame.characterHeight));}
    }
    visibility = HowMuchIsVisible(MyGame.target);
    console.log(visibility);
  }
}
function HowMuchIsVisible(character)
{
  MyGame.testCtx.clearRect(0,0,MyGame.testCanvas.width,MyGame.testCanvas.height);
  MyGame.testCtx.globalCompositeOperation = "destination-out";
  var distX, distY;
  MyGame.characters.forEach(x=> {
    
    if (x == character) {MyGame.testCtx.globalCompositeOperation="source-over";MyGame.testCtx.drawImage(x.prefab.canvas, x.positionX, x.positionY);MyGame.testCtx.globalCompositeOperation = "destination-out";}
    else {
      distX = Math.abs(x.positionX - character.positionX);
      distY = Math.abs(x.positionY - character.positionY);
      if ((distX < x.prefab.canvas.width || distX < character.prefab.canvas.width)
        && (distY < x.prefab.canvas.height || distY < character.prefab.canvas.height))
      MyGame.testCtx.drawImage(x.prefab.canvas, x.positionX, x.positionY);
    }
  })

  var buffer1 = MyGame.testCtx.getImageData(character.positionX, character.positionY, character.prefab.canvas.width, character.prefab.canvas.height).data;
  var visiblePixels = 0;
  for(var i = 0; i < buffer1.length; i+=4)
  {
    if (buffer1[i+3]>0 && buffer1[i]>0) visiblePixels++;
  }
  // var buffer2 = character.prefab.ctx.getImageData(0,0,character.prefab.canvas.width,character.prefab.canvas.height).data;
  
  return visiblePixels;
}
function selectRandom(ar)
{
  return ar[Math.random()*ar.length|0];
}
function setInitialState() {
  loadCharacters();
  MyGame.canvas = document.getElementById("canvas");
  MyGame.canvas.width = MyGame.setCanvasWidth;
  MyGame.canvas.height = MyGame.setCanvasHeight;
  MyGame.ctx = MyGame.canvas.getContext("2d");
  MyGame.ctx.webkitImageSmoothingEnabled = true;
  MyGame.ctx.mozImageSmoothingEnabled = true;
  MyGame.ctx.imageSmoothingEnabled = true;
  if (MyGame.ctx.imageSmoothingEnabled) MyGame.ctx.imageSmoothingQuality = "medium";

  
  MyGame.testCanvas = document.createElement("canvas");
  MyGame.testCanvas.width = MyGame.setCanvasWidth;
  MyGame.testCanvas.height = MyGame.setCanvasHeight;
  MyGame.testCtx = MyGame.testCanvas.getContext("2d",{ willReadFrequently: true });
  MyGame.testCtx.webkitImageSmoothingEnabled = true;
  MyGame.testCtx.mozImageSmoothingEnabled = true;
  MyGame.testCtx.imageSmoothingEnabled = true;
  MyGame.testCtx.willReadFrequently = true;
  if (MyGame.testCtx.imageSmoothingEnabled) MyGame.testCtx.imageSmoothingQuality = "medium";

  MyGame.lvl = window.localStorage.getItem("lvl");
  
  document.addEventListener("mousedown", mouseDownHandler, false);
  document.addEventListener("mouseup", mouseUpHandler, false);
  MyGame.rightPressed = false;
  MyGame.leftPressed = false;
  MyGame.upPressed = false;
  MyGame.downPressed = false;
  function mouseDownHandler(event) {
    if (event.button === 0) {
      MyGame.leftPressed = true;
      leftDown();
    }
  }
  function mouseUpHandler(event) {
    if (event.button === 0) {
      MyGame.leftPressed = false;
    }
  }

  // startLvl("grid");
  // MyGame.requestRedraw = true;
}
function leftDown() {
  if (!MyGame.characterDarkenFilter) {
    // MyGame.characters = [MyGame.characters[0]];
    MyGame.characterDarkenFilter = x=>x.prefab.name!=MyGame.targetPrefab.name;
    // MyGame.ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
    // MyGame.ctx.fillRect(0, 0, MyGame.canvas.width, MyGame.canvas.height);
  }
  else {MyGame.difficulty+=1;startLvl();MyGame.characterDarkenFilter = undefined;}
  
  MyGame.requestRedraw = true;
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
