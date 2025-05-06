
$( document ).ready(function() {
  
})


const width = 60;// width amd height of the captions
const height = 40;
var fps = 6; // framerate of the captions. If your video is long you might walla lower the fps.

async function toBase64(file) {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
  });
}
var frames = [];
var frameArrays = [];
var colors = [];
async function videoUploaded() {
  const input = document.getElementById('inputVideo');
  console.log(input.files)

  frames = await extractFramesFromVideo(window.URL.createObjectURL(input.files[0]),fps)
  console.log(frames);
  frameArrays = frames.map(x=>imageDataToArr(x));
  console.log(frameArrays);
  constructFromErrays(frameArrays,colors,5000);
}
function imageDataToArr(imgData) {

  // const imgData = ctx.getImageData(0, 0, width, height);
  var canvas = document.getElementById("secondaryCanvas");
  var ctx = canvas.getContext("2d");
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  ctx.putImageData(imgData,0,0);
  downScaleCanvas(canvas, width, height)
  const imgData2 = ctx.getImageData(0, 0, width, height);
  const data = imgData2.data;
  var j=0;
  var k = 0;
  var arr = new Array(height).fill``.map(_=>[]);
  for(let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];
    const alpha = data[i + 3];
    const col = rgbToHex(red,green,blue).toUpperCase();// capturing colors. Also rgbToHex here cuts colors significantly so the result is smaller. Go into the function and change it to make colors better
    if (!colors.includes(col)) colors.push(col)
    arr[k].push(col)
    j++;
    if (j>=width){j=0;k++;}
  }
  return arr; //buttonPress(arr);
}
async function extractFramesFromVideo(videoSrc, fps=25) {
  return new Promise(async (resolve) => {
    let video = document.getElementById("videoInput");
    let seekResolve;
    video.addEventListener('seeked', async function() {
      if(seekResolve) seekResolve();
    });

    video.addEventListener('loadeddata', async function() {
      let canvas = document.createElement('canvas');
      let context = canvas.getContext('2d');
      let [w, h] = [video.videoWidth, video.videoHeight]
      canvas.width =  w;
      canvas.height = h;

      let frames = [];
      let interval = 1 / fps;
      let currentTime = 0;
      let duration = video.duration;

      while(currentTime < duration) {
        video.currentTime = currentTime;
        await new Promise(r => seekResolve=r);

        context.drawImage(video, 0, 0, w, h);
        // let base64ImageData = canvas.toDataURL();
        frames.push(context.getImageData(0,0,canvas.width,canvas.height));

        currentTime += interval;
        console.log(currentTime)
      }
      resolve(frames);
    });

    // set video src *after* listening to events in case it loads so fast
    // that the events occur before we were listening.
    video.src = videoSrc; 

  });
}
function constructFromErrays(arrArr, colorsArray,startTime) {
  const output = document.getElementById("output");
  console.log(arrArr.length);
  output.innerHTML = `<?xml version="1.0" encoding="utf-8"?>
<timedtext format="3">
<head>
<wp id="0" ap="7" ah="0" av="0" />
<wp id="1" ap="4" ah="50" av="45" />
<wp id="2" ap="4" ah="50" av="45" />
<wp id="3" ap="4" ah="50" av="45" />
<wp id="4" ap="4" ah="50" av="45" />
<ws id="0" ju="2" pd="0" sd="0" />
<ws id="1" ju="2" pd="4" sd="4" />

<pen id="0" sz="100" fc="#000000" fo="0" bo="0" />
<pen id="1" sz="100" fc="#A0AAB4" fo="0" bo="0" />
${
  colorsArray.map((x,i)=>
    `<pen id="${i+2}" sz="50" fc="${x}" fo="255" bo="0"/>`
  ).join`
`
}
</head>
<body>${

arrArr.map((arr,frameN)=>
  
  
  `<p t="${startTime + frameN*(1000/fps)|0}" d="${(1000/fps)+1|0}" wp="${frameN%4+1}" ws="1"><s p="1">​</s>
${
  new Array(height/2|0).fill``.map((_,i) =>
      new Array(width).fill``.map((_,j) =>
        (arr[i*2][j-1]!=arr[i*2][j] ? `<s p="${colorsArray.indexOf(arr[i*2][j])+2}">` : "")+`█`+(arr[i*2][j+1]!=arr[i*2][j] ? `</s>` : "")
      ).join``
     )
  .join`
`}
<s p="1">​</s></p>`

+`<p t="${startTime + frameN*(1000/fps)+1|0}" d="${(1000/fps)|0}" wp="${frameN%4+1}" ws="1"><s p="1">​</s>
${
  new Array(height/2|0).fill``.map((_,i) =>
      new Array(width).fill``.map((_,j) =>
        (arr[i*2+1][j-1]!=arr[i*2+1][j] ? `<s p="${colorsArray.indexOf(arr[i*2+1][j])+2}">` : "")+`▄`+(arr[i*2+1][j+1]!=arr[i*2+1][j] ? `</s>` : "")
      ).join``
     )
  .join`
`}
<s p="1">​</s></p>`



).join``
  

}
</body>
</timedtext>`
}
async function buttonPress(arr, startTime, endTime) {

  if (!arr) {
    arr = new Array(height).fill``.map((_,i)=>new Array(width).fill``.map((_,j)=>rgbToHex(255*j/width|0,0,255/height*i|0).toUpperCase()))
  }
  if (!startTime) startTime = 1;
  if (!endTime) endTime = 100000;
  const output = document.getElementById("output");
  const colorsArray = [];
  arr.forEach(x=>x.forEach(y=>{
    if (!colorsArray.includes(y)) colorsArray.push(y);
  }))
  output.innerHTML = `<?xml version="1.0" encoding="utf-8"?>
<timedtext format="3">
<head>
<wp id="0" ap="7" ah="0" av="0" />
<wp id="1" ap="4" ah="50" av="45" />
<wp id="2" ap="4" ah="50" av="45" />
<ws id="0" ju="2" pd="0" sd="0" />
<ws id="1" ju="2" pd="4" sd="4" />

<pen id="0" sz="100" fc="#000000" fo="0" bo="0" />
<pen id="1" sz="100" fc="#A0AAB4" fo="0" bo="0" />
${
  colorsArray.map((x,i)=>
    `<pen id="${i+2}" sz="50" fc="${x}" fo="255" bo="0"/>`
  ).join`
`
//   new Array(width*height).fill``.map((x,i)=>
//     `<pen id="${i+2}" sz="50" fc="${arr[i/width|0][i%width]}" fo="255" bo="0"/>`
//   ).join`
// `
}
</head>
<body>${
  `<p t="${startTime}" d="${endTime-startTime}" wp="1" ws="1"><s p="1">​</s>
${
  new Array(height/2|0).fill``.map((_,i) =>
      new Array(width).fill``.map((_,j) =>`<s p="${colorsArray.indexOf(arr[i*2][j])+2}">█</s>`).join``
     )//making the background out of █s
  .join`
`}
<s p="1">​</s></p>`

+`<p t="${startTime+1}" d="${endTime-startTime-1}" wp="1" ws="1"><s p="1">​</s>
${
  new Array(height/2|0).fill``.map((_,i) =>
      new Array(width).fill``.map((_,j) =>`<s p="${colorsArray.indexOf(arr[i*2+1][j])+2}">▄</s>`).join``
     )//adding ▄s in the foreground so the pixels are shorter in height.
  .join`
`}
<s p="1">​</s></p>`

}
</body>
</timedtext>`
  
}
function componentToHex(c) {
var hex = (c>>4<<4).toString(16); // the >>4<<4 makes it so there's only 16 values instead of 255.
return hex.length == 1 ? "0" + hex : hex;
}

function rgbToAss(r, g, b) {
return "&H"+ componentToHex(b) + componentToHex(g) + componentToHex(r)+"&";
}
function rgbToHex(r, g, b) {
return "#"+componentToHex(r) + componentToHex(g) + componentToHex(b);// The colors are cut in the componentToHex actually
}
function alphaToAss(a) {
if (a == 255) return"";
if (a == 0) a = 1;
return "&H"+ componentToHex(255-a)+"&";
}

`<?xml version="1.0" encoding="utf-8"?>
<timedtext format="3">
<head>
<wp id="0" ap="7" ah="0" av="0" />
<wp id="1" ap="4" ah="44" av="81" />
<ws id="0" ju="2" pd="0" sd="0" />
<ws id="1" ju="2" pd="4" sd="4" />
<pen id="0" sz="100" fc="#000000" fo="0" bo="0" />
<pen id="1" sz="100" fc="#A0AAB4" fo="0" bo="0" />
<pen id="2" sz="100" fc="#E30C0B" fo="255" />
</head>
<body>
<p t="1" d="4988" wp="1" ws="1"><s p="1">​</s>​<s p="2">▄</s><s p="1">​</s></p>
</p>
</body>
</timedtext>`//that's just a reference. Disregard


function downScaleCanvas(canvas,desieredWidth,desieredHeight) //for better quality we're downscaling in steps.  
{
  var ctx = canvas.getContext("2d", {willReadFrequently: true});
  if (desieredWidth > canvas.width) return;
  if (desieredHeight > canvas.height) return;
  var data = ctx.getImageData( 0, 0, canvas.width, canvas.height );

  if (canvas.width / canvas.height != desieredWidth/desieredHeight) {
    if (canvas.width / canvas.height >= desieredWidth/desieredHeight) {
      ctx.drawImage(canvas,0,0, canvas.height*desieredWidth/desieredHeight, canvas.height)
      data = ctx.getImageData( 0, 0, canvas.width, canvas.height );
      canvas.width = canvas.height*desieredWidth/desieredHeight;
      ctx.putImageData( data, 0, 0, 0,0,canvas.width, canvas.height );
    }
    else {
      ctx.drawImage(canvas,0,0, canvas.width, canvas.width*desieredHeight/desieredWidth)
      data = ctx.getImageData( 0, 0, canvas.width, canvas.height );
      canvas.height = canvas.width*desieredHeight/desieredWidth;
      ctx.putImageData( data, 0, 0, 0,0,canvas.width, canvas.height );
    }
  }
  const scaleStep = 0.75
  while (desieredWidth<canvas.width)
  {
    if (desieredWidth/canvas.width > scaleStep) {
      ctx.drawImage(canvas,0,0, desieredWidth, desieredHeight)
      data = ctx.getImageData( 0, 0, canvas.width, canvas.height );
      canvas.width = desieredWidth;
      canvas.height = desieredHeight;
      ctx.putImageData( data, 0, 0, 0,0,canvas.width, canvas.height );
    } else {
      ctx.drawImage(canvas,0,0, canvas.width*scaleStep|0, canvas.height*scaleStep|0)
      data = ctx.getImageData( 0, 0, canvas.width, canvas.height );
      canvas.width = canvas.width*scaleStep|0;
      canvas.height = canvas.height*scaleStep|0;
      ctx.putImageData( data, 0, 0, 0,0,canvas.width, canvas.height );
    }
  }
  return;
}