
$( document ).ready(function() {
  
})


const width = 60; //width and height of the subtitles 
const height = 40;

async function toBase64(file) {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
  });
}

async function imageUploaded() {
  const input = document.getElementById('inputImage');
  console.log(input.files)

  const base64 = await toBase64(input.files[0]);
  console.log(base64)

  const src = base64;

  var img = new Image();
  var arr = new Array(height).fill``.map(_=>[]);
  img.onload = function () {
      console.log(this);

      var canvas = document.getElementById("secondaryCanvas");
      canvas.height = img.height;
      canvas.width = img.width;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      downScaleCanvas(canvas, width, height)

      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      var j=0;
      var k = 0;
      for(let i = 0; i < data.length; i += 4) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];
        const alpha = data[i + 3];
        arr[k].push(rgbToHex(red,green,blue).toUpperCase())
        j++;
        if (j>=width){j=0;k++;}
      }
      buttonPress(arr);
  }
  img.src = src;
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
${
  `<wp id="1" ap="4" ah="50" av="45" />`+
  `<wp id="2" ap="4" ah="50" av="45" />`
//   new Array(height).fill``.map((x,i)=>
//     `<wp id="${i+1}" ap="4" ah="${0}}" av="${i*2+52-(height/2|0)*2}" />`
//   ).join`
// `
}
<ws id="0" ju="2" pd="0" sd="0" />
${
  `<ws id="1" ju="2" pd="4" sd="4" />`
//   new Array(width*height).fill``.map((x,i)=>
//     `<ws id="${i+1}" ju="2" pd="4" sd="4" />`
//   ).join`
// `
}
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
     )
  .join`
`}
<s p="1">​</s></p>`

+`<p t="${startTime+1}" d="${endTime-startTime-1}" wp="1" ws="1"><s p="1">​</s>
${
  new Array(height/2|0).fill``.map((_,i) =>
      new Array(width).fill``.map((_,j) =>`<s p="${colorsArray.indexOf(arr[i*2+1][j])+2}">▄</s>`).join``
     )
  .join`
`}
<s p="1">​</s></p>`

}
</body>
</timedtext>`
  
}
function componentToHex(c) {
var hex = c.toString(16);
return hex.length == 1 ? "0" + hex : hex;
}

function rgbToAss(r, g, b) {
return "&H"+ componentToHex(b) + componentToHex(g) + componentToHex(r)+"&";
}
function rgbToHex(r, g, b) {
return "#"+componentToHex(r) + componentToHex(g) + componentToHex(b);
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
</timedtext>`


function downScaleCanvas(canvas,desieredWidth,desieredHeight)
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