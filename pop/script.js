
// Simple fun stretched to infinity
// this is what a popped bubble locks like
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

function cellFill(chunk, x, y, color)
{
}
function render(tFrame) {
  MyGame.offsetX = Math.floor(MyGame.realOffsetX);
  MyGame.offsetY = Math.floor(MyGame.realOffsetY);
  if (MyGame.requestRedraw)
  {
    MyGame.canvas.width = document.body.clientWidth;
    MyGame.canvas.height = document.body.clientHeight; 
    // MyGame.ctx.webkitImageSmoothingEnabled = MyGame.scale < 1;
    // MyGame.ctx.mozImageSmoothingEnabled = MyGame.scale < 1;
    // MyGame.ctx.imageSmoothingEnabled = MyGame.scale < 1;
    // if (MyGame.ctx.imageSmoothingEnabled) MyGame.ctx.imageSmoothingQuality = "medium";
    MyGame.ctx.clearRect(0, 0, MyGame.canvas.width, MyGame.canvas.height);
    const pi2 = Math.PI * 2;
    MyGame.radius = 5*MyGame.scale;
    MyGame.space = 3*MyGame.scale;
    MyGame.shift = ((MyGame.radius + MyGame.space) * Math.sqrt(3)) /2;
    if (MyGame.scale < 0.255)
    {
      MyGame.ctx.fillStyle = '#d5d5d5';
      MyGame.ctx.fillRect(0, 0, MyGame.canvas.width, MyGame.canvas.height);
    }
    else
    {
      MyGame.ctx.fillStyle = '#BBB';
      MyGame.ctx.fillRect(0, 0, MyGame.canvas.width, MyGame.canvas.height);
      MyGame.ctx.strokeStyle = '#FFF';
      // MyGame.ctx.fillStyle = '#CCC';
      MyGame.ctx.fillStyle = '#bfbfbf';
      // MyGame.ctx.lineWidth = Math.floor(0.5*MyGame.scale);
      MyGame.ctx.beginPath();
      const firstRowshifted =  (Math.floor(MyGame.offsetY / (MyGame.shift+MyGame.space)) % 2 == 0);// == (Math.floor(MyGame.offsetX / (MyGame.radius*2+MyGame.space*2)) % 2 == 0);
      // console.log (firstRowshifted);
      let thisRowshifted;
      for( let i=(MyGame.offsetX%(MyGame.radius*2+MyGame.space*2))-(MyGame.radius*2+MyGame.space*2), l = MyGame.canvas.width + (MyGame.radius*2+MyGame.space*2); i < l; i+= MyGame.radius*2 + MyGame.space*2)
      {
        thisRowshifted = firstRowshifted;
        for (let j =(MyGame.offsetY%(MyGame.shift+MyGame.space)+(MyGame.shift+MyGame.space))%(MyGame.shift+MyGame.space)-(MyGame.shift+MyGame.space), k=MyGame.canvas.height + (MyGame.shift+MyGame.space); j < k; j+= MyGame.shift + MyGame.space)
        {
          MyGame.ctx.moveTo( thisRowshifted ? i + MyGame.radius : i + MyGame.radius*2 + MyGame.space, j); 
          MyGame.ctx.arc( thisRowshifted ? i : i + MyGame.radius + MyGame.space, j, MyGame.radius, 0, pi2 );
          thisRowshifted = !thisRowshifted;
        }
      }
      MyGame.ctx.stroke();
      MyGame.ctx.fill();
    }

    if (MyGame.offsetX - 200*MyGame.scale < MyGame.canvas.width && MyGame.offsetX + 500*MyGame.scale > 0
      &&  MyGame.offsetY + 60*MyGame.scale < MyGame.canvas.height && MyGame.offsetY + 100*MyGame.scale >0)
    {
      MyGame.ctx.font = `${MyGame.scale*37}px consolas`;
      MyGame.ctx.fillStyle = '#101010';
      MyGame.ctx.fillText("Simple fun, stretched to infinity", MyGame.offsetX - 200*MyGame.scale , MyGame.offsetY + 90*MyGame.scale);
    }

    if (MyGame.offsetX + 500*MyGame.scale < MyGame.canvas.width && MyGame.offsetX + 700*MyGame.scale > 0
      &&  MyGame.offsetY + 120*MyGame.scale < MyGame.canvas.height && MyGame.offsetY + 160*MyGame.scale >0)
    {
      MyGame.ctx.font = `${MyGame.scale*20}px consolas`;
      MyGame.ctx.fillStyle = '#707070';
      MyGame.ctx.fillText("made by lopidav", MyGame.offsetX + 500*MyGame.scale , MyGame.offsetY + 140*MyGame.scale);
    }
      
      
    // MyGame.ctx.strokeStyle = '#CCC';
    MyGame.ctx.strokeStyle = '#B5B5B5';
    MyGame.ctx.fillStyle = '#BBB';
    MyGame.ctx.beginPath();
    MyGame.pressed.forEach(x=>{
      const currX = MyGame.offsetX + (x[0] + (x[1]%2+2)%2*0.5)  * (MyGame.radius*2 + MyGame.space*2);
      const currY = -(MyGame.shift + MyGame.space)+MyGame.offsetY + x[1]/2 * (MyGame.shift*2 + MyGame.space*2);
      if (currX < MyGame.canvas.width + (MyGame.radius*2+MyGame.space*2) && currX > -(MyGame.radius*2+MyGame.space*2) && currY <MyGame.canvas.height + (MyGame.shift+MyGame.space) && currY>-(MyGame.shift+MyGame.space))
      {
        MyGame.ctx.moveTo(currX,currY);
        MyGame.ctx.arc(currX, currY, MyGame.radius, 0, pi2 );
      } 
    });
    MyGame.ctx.lineWidth = 2
    MyGame.ctx.stroke();
    MyGame.ctx.fill();
    
    MyGame.requestRedraw = false;
  }
  
}
function deturmineCurrentHovered()
{
  let cHoveringCellX = (MyGame.currentMouseX-MyGame.realOffsetX) / (MyGame.radius*2 + MyGame.space*2);
  let cHoveringCellY = (MyGame.currentMouseY-MyGame.realOffsetY) / (MyGame.shift*2 + MyGame.space*2)+0.5;
  let cHoveringCellX1 = Math.floor(cHoveringCellX)+0.5;
  let cHoveringCellY1 = Math.floor(cHoveringCellY)+0.5;
  let cHoveringCellX2 = Math.floor(cHoveringCellX+0.5);
  let cHoveringCellY2 = Math.floor(cHoveringCellY+0.5);
  // console.log(cHoveringCellX, cHoveringCellX1, cHoveringCellX2);
  MyGame.hoverCellX = Math.floor((cHoveringCellX - cHoveringCellX1)**2+(cHoveringCellY - cHoveringCellY1)**2 < (cHoveringCellX - cHoveringCellX2)**2+(cHoveringCellY - cHoveringCellY2)**2 ? cHoveringCellX1 : cHoveringCellX2);
  MyGame.hoverCellY = 2*((cHoveringCellX - cHoveringCellX1)**2+(cHoveringCellY - cHoveringCellY1)**2 < (cHoveringCellX - cHoveringCellX2)**2+(cHoveringCellY - cHoveringCellY2)**2 ? cHoveringCellY1 : cHoveringCellY2);
  
}
function registerPress(x,y)
{
  if (!x && !y)
  {
    deturmineCurrentHovered();
    x= MyGame.hoverCellX;
    y= MyGame.hoverCellY;
  }
  // MyGame.requestRedraw = true;
  if (!MyGame.pressed.find(a=>a[0] == x && a[1] == y))
  {
    MyGame.pressed.push([x,y]);
    MyGame.ctx.strokeStyle = '#B5B5B5';
    MyGame.ctx.fillStyle = '#BBB';
    MyGame.ctx.beginPath();
    const currX = MyGame.offsetX + (x + (y%2+2)%2*0.5)  * (MyGame.radius*2 + MyGame.space*2);
    const currY = -(MyGame.shift + MyGame.space)+MyGame.offsetY + y/2 * (MyGame.shift*2 + MyGame.space*2);
    if (currX < MyGame.canvas.width + (MyGame.radius*2+MyGame.space*2) && currX > -(MyGame.radius*2+MyGame.space*2) && currY <MyGame.canvas.height + (MyGame.shift+MyGame.space) && currY>-(MyGame.shift+MyGame.space))
    {
      MyGame.ctx.moveTo(currX,currY);
      MyGame.ctx.arc(currX, currY, MyGame.radius, 0, Math.PI * 2 );
    } 
    MyGame.ctx.stroke();
    MyGame.ctx.fill();
    // MyGame.specialEvents[0]();
    if (Math.random() < 0.995)
    {
      MyGame.popSounds[Math.floor(Math.random()*MyGame.popSounds.length)].play();
    }
    else
    {
      if (Math.random() < 0.995) MyGame.specialPopSounds[Math.floor(Math.random()*MyGame.specialPopSounds.length)].play();
      else MyGame.specialEvents[Math.floor(Math.random()*MyGame.specialEvents.length)]();
    }
    //  MyGame.specialEvents[1]();
  }

  // console.log(MyGame.pressed);
  if (!MyGame.dontUpdateStorage) window.localStorage.setItem("pressedCells", JSON.stringify(MyGame.pressed));
}
function update(DOMHighResTimeStamp) {
  // deturmineCurrentHovered();  
}
function setInitialState() {
  MyGame.pressed = [];
  let pressedFromStorage = window.localStorage.getItem("pressedCells");
  if (pressedFromStorage) MyGame.pressed = JSON.parse(pressedFromStorage);
  // MyGame.pressed = [];
  // for(let t = 0;t<1000;t++)
  // for(let r= 0;r<1000;r++) MyGame.pressed.push([t,r]);

  MyGame.requestRedraw = true;
  MyGame.canvas = document.getElementById("canvas");
  MyGame.canvas.width = document.body.clientWidth;
  MyGame.canvas.height = document.body.clientHeight; 
  MyGame.ctx = MyGame.canvas.getContext("2d");

  // MyGame.overlayCanvas = document.getElementById("overlayCanvas");
  // MyGame.overlayCanvas.width = MyGame.canvas.width;
  // MyGame.overlayCanvas.height = MyGame.canvas.height; 
  // MyGame.overlayCtx = MyGame.overlayCanvas.getContext("2d");

  MyGame.underlayCanvas = document.getElementById("underlayCanvas");
  MyGame.underlayCanvas.width = MyGame.canvas.width;
  MyGame.underlayCanvas.height = MyGame.canvas.height; 
  MyGame.underlayCtx = MyGame.underlayCanvas.getContext("2d");

  MyGame.scale = 3 * 1800/MyGame.canvas.width;
  MyGame.realOffsetX = MyGame.canvas.width/2-515 + 210*MyGame.scale;
  MyGame.realOffsetY = MyGame.canvas.height/2;
  document.onmousemove = handleMouseMove;

  function handleMouseMove(event) {
      var eventDoc, doc, body;

      event = event || window.event; // IE-ism
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

  document.addEventListener("touchstart", touchStartHandler, false);
  document.addEventListener("touchmove", touchMoveHandler, false);

  function touchStartHandler(e) {
    if (e.touches) {
      // MyGame.requestRedraw = true;
      [...e.touches].forEach(touch => {
        MyGame.currentMouseX = touch.pageX;
        MyGame.currentMouseY = touch.pageY;
        registerPress();
      })
      MyGame.currentMouseX = e.touches[0].pageX;
      MyGame.currentMouseY = e.touches[0].pageY;
      // e.preventDefault();
    }
  }
  function touchMoveHandler(e) {
    if (e.touches) {
      MyGame.requestRedraw = true;
      MyGame.realOffsetX +=  e.touches[0].pageX - MyGame.currentMouseX;
      MyGame.realOffsetY +=  e.touches[0].pageY - MyGame.currentMouseY;
      MyGame.currentMouseX = e.touches[0].pageX;
      MyGame.currentMouseY = e.touches[0].pageY;
      // e.preventDefault();
    }
    if (e.touches && e.touches.length > 1) {
      const oldDistance = MyGame.touchDistance;
      MyGame.touchDistance = (e.touches[0].pageX-e.touches[1].pageX)**2 + (e.touches[0].pageY-e.touches[1].pageY)**2;
      if (oldDistance && oldDistance != MyGame.touchDistance)
      {
        let touchCenterX = 0;
        let touchCenterY = 0;
        [...e.touches].forEach(t => {touchCenterX+=t.pageX;touchCenterY+=t.pageY;});
        touchCenterX /= e.touches.length;
        touchCenterY /= e.touches.length;
        Zoom ((oldDistance - MyGame.touchDistance)**0.5 /1000000,touchCenterX, touchCenterY)
      }
    }
    else 
    {
      MyGame.touchDistance = 0;
    }
  }
  MyGame.rightPressed = false;
  MyGame.leftPressed = false;
  function mouseDownHandler(event) {
    if (event.button  === 2) {
      MyGame.rightPressed = true;
    }
    if (event.button === 0) {
      MyGame.leftPressed = true;
      registerPress();
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
    Zoom(event.deltaY, MyGame.currentMouseX, MyGame.currentMouseY);
  }
  function keyHandler(event) {
    if (event.key == "-") {
      MyGame.autoZoomOut = !MyGame.autoZoomOut;
    } 
  }
  MyGame.popSounds =[];
  for(var i=1;i<=10;i++)
  {
    MyGame.popSounds.push(new Audio(`media/newPop${i}.wav`))
  }
  MyGame.specialPopSounds =[];
  for(var i=1;i<=5;i++)
  {
    MyGame.specialPopSounds.push(new Audio(`media/specialPop${i}.wav`))
  }
  MakeSpecialEvents();
  // const track = MyGame.audioContext.createMediaElementSource(MyGame.sounds[0]);
  // track.connect(MyGame.audioContext.destination);
  
}

function Zoom(howMuch, fromPointX, fromPointY)
{
  MyGame.requestRedraw = true;
  let oldScale = MyGame.scale;
  MyGame.scale *= 1 - howMuch/10000;
  MyGame.realOffsetX += (fromPointX - MyGame.realOffsetX) - (fromPointX - MyGame.realOffsetX) / oldScale * MyGame.scale;
  MyGame.realOffsetY += (fromPointY - MyGame.realOffsetY) - (fromPointY - MyGame.realOffsetY) / oldScale * MyGame.scale;
}
function MakeSpecialEvents()
{
  MyGame.specialEvents = [];
  MyGame.specialEvents.push(_=>{
    console.log("special event 0");
    if (Math.random() > 0.8) registerPress(MyGame.hoverCellX-1, MyGame.hoverCellY);
    if (Math.random() > 0.8) registerPress(MyGame.hoverCellX+1, MyGame.hoverCellY);
    if (Math.random() > 0.8) registerPress(MyGame.hoverCellX, MyGame.hoverCellY-1);
    if (Math.random() > 0.8) registerPress(MyGame.hoverCellX, MyGame.hoverCellY+1);
    if (Math.random() > 0.8) registerPress(MyGame.hoverCellX+((MyGame.hoverCellY%2+2)%2-0.5)*2, MyGame.hoverCellY-1);
    if (Math.random() > 0.8) registerPress(MyGame.hoverCellX+((MyGame.hoverCellY%2+2)%2-0.5)*2, MyGame.hoverCellY+1);
  });
  MyGame.specialEvents.push(_=>{
    console.log("special event 1");
    // MyGame.overlayCanvas.width = document.body.clientWidth;
    // MyGame.overlayCanvas.height = document.body.clientHeight; 
    MyGame.ctx.font = `${MyGame.scale*20}px serif`;
    MyGame.ctx.fillStyle = Math.random() < 0.1 ? "red" : Math.random() < 0.1 ? Math.random() > 0.1 ? "white" : "black" : "green";
    MyGame.ctx.fillText(Math.random() < 0.9 ? "You've won! =)" : Math.random() < 0.9 ? "Don't abandon the others! >=(" : Math.random() < 0.9 ? "Extra rare pop!" : Math.random() < 0.9 ? "So the lore of the game is that it's a purgatory" : Math.random() < 0.9 ? "Actually, the game is a critique of intrinsic goals fetish" : Math.random() < 0.9 ? "So the lore is that you loughed at gods about how pointless their life is so they put you on this infinite field where the only thing you can do is bubbles, but in reality they just have putten a hex in your eyes and the bubbles are people that you're killing" : Math.random() < 0.9 ? "So the lore is that you have super speed like flesh, and the bobbles are days of your life. Your brain is at superspeed naturaly and you need to make an effort for time to go forward, but you also have depression and no friends so days are just the same with an accasional supermarket sale, so at first you come up with little projects to do but then it becomes harder and harder to not just stop the time":  Math.random() < 0.9 ? "I made the board hexagonal so srawings would be more creepy, it adds to the creeppeenness of infinity" : Math.random() < 0.9 ? "It's only me and you now" : Math.random() < 0.9 ? "So the lore is that you're a game developer who pops and pops bubbles in hopes of going viral (wow, i've outdone myself on badness on this one (i was going for bad so that's a success) )" : Math.random() < 0.9 ? "btw, should I make a multiplayer version of the game? I was planning to but now i'm not sure" : Math.random() < 0.9 ? "https://docs.google.com/document/d/11nNxghj4afOgYBcqoIQJ9sZU22jPpKE_RXrCMh1Q6hg/edit?usp=sharing" : Math.random() < 0.9 ? "are you free after this?" : console.image("./media/bob.gif"), MyGame.offsetX + (MyGame.hoverCellX + (MyGame.hoverCellY%2+2)%2*0.5)  * (MyGame.radius*2 + MyGame.space*2), -(MyGame.shift + MyGame.space)+MyGame.offsetY + MyGame.hoverCellY/2 * (MyGame.shift*2 + MyGame.space*2));
    // setTimeout(_=>MyGame.ctx.clearRect(0,0,MyGame.overlayCanvas.width,MyGame.overlayCanvas.height), 20000);
  });
  MyGame.specialEvents.push(_=>{
    console.log("special event 2");
    const currX = MyGame.hoverCellX;
    const currY = MyGame.hoverCellY;
    setTimeout(_=>{MyGame.pressed.splice(MyGame.pressed.findIndex(x=>x[0]==currX&& x[1]==currY),1);MyGame.requestRedraw= true;}, 5000);
  });
  MyGame.specialEvents.push(_=>{
    console.log("special event 3");
  });
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
console.image = (url) =>{
  var xhr = new XMLHttpRequest();
  xhr.open('get', url);
  xhr.responseType = 'blob';
  xhr.onload = function(){
      var fr = new FileReader();

      fr.onload = function(){
          const style = `font-size: 300px; background-image: url("${this.result}"); background-size: contain; background-repeat: no-repeat;`;
          console.log("%c     ", style);
      };
      fr.readAsDataURL(xhr.response); // async call
  };
  xhr.send();
}