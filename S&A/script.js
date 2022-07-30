var keys={};
function keyObject(name) {
  return {
    'key': name,
    'pressed': false,
    'down':e=>{},
    'up':e=>{},
    'downTrue':e=>{if (!pressed) {pressed = true;down(e);}},
    'upTrue':e=>{pressed = false;up(e);}
  }
}
[...`1234567890-=qwertyuiop[]\\asdfghjkl;'zxcvbnm,.\/ !@#\$%^&*()_+AAAAWERTYUIOP\{\}|ASDFGHJKL:"ZXCVBNM<>?`].forEach(x=>keys[x]=keyObject(x))

function keyDown(event) {
  keys[event.key] ? keys[event.key].down(event) : (keys[event.key]=keyObject(event.key)).down(event);
}

function keyUp(event) {
  keys[event.key] ? keys[event.key].up(event) : (keys[event.key]=keyObject(event.key)).up(event);
}

keys['1'].down = keys['z'].down = e => {
  $("#skill1").addClass("activated");
}
keys['1'].up = keys['z'].up = e => {
  $("#skill1").removeClass("activated");
}


keys['2'].down = keys['x'].down = e => {
  $("#skill2").addClass("activated");
}
keys['2'].up = keys['x'].up = e => {
  $("#skill2").removeClass("activated");
}


keys['3'].down = keys['c'].down = e => {
  $("#skill3").addClass("activated");
}
keys['3'].up = keys['c'].up = e => {
  $("#skill3").removeClass("activated");
}


keys['4'].down = keys['v'].down = e => {
  $("#skill4").addClass("activated");
}
keys['4'].up = keys['v'].up = e => {
  $("#skill4").removeClass("activated");
}


keys['5'].down = keys['b'].down = e => {
  $("#skill5").addClass("activated");
}
keys['5'].up = keys['b'].up = e => {
  $("#skill5").removeClass("activated");
}


keys['6'].down = keys['n'].down = e => {
  $("#skill6").addClass("activated");
}
keys['6'].up = keys['n'].up = e => {
  $("#skill6").removeClass("activated");
}


keys['7'].down = keys['m'].down = e => {
  $("#skill7").addClass("activated");
}
keys['7'].up = keys['m'].up = e => {
  $("#skill7").removeClass("activated");
}


keys['8'].down = keys[','].down = e => {
  $("#skill8").addClass("activated");
}
keys['8'].up = keys[','].up = e => {
  $("#skill8").removeClass("activated");
}


keys['9'].down = keys['.'].down = e => {
  $("#skill9").addClass("activated");
}
keys['9'].up = keys['.'].up = e => {
  $("#skill9").removeClass("activated");
}