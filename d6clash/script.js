
function swapNodes(n1, n2) {

    var p1 = n1.parentNode;
    var p2 = n2.parentNode;
    var i1, i2;

    if ( !p1 || !p2 || p1.isEqualNode(n2) || p2.isEqualNode(n1) ) return;

    for (var i = 0; i < p1.children.length; i++) {
        if (p1.children[i].isEqualNode(n1)) {
            i1 = i;
        }
    }
    for (var i = 0; i < p2.children.length; i++) {
        if (p2.children[i].isEqualNode(n2)) {
            i2 = i;
        }
    }

    if ( p1.isEqualNode(p2) && i1 < i2 ) {
        i2++;
    }
    p1.insertBefore(n2, p1.children[i1]);
    p2.insertBefore(n1, p2.children[i2]);
}
function getRandDiceLine(len) {
  let ret = [];
  for(let i = 1; i <= len; i++) ret[i] = (Math.random()*6|0)+1;
  return ret;
}
/*
function createDice(props) {
  let dice = {};
  dice.power = 0;
  dice.defence = -1;
  dice.clash( 
  let owner = props[owner];
  if (
}*/
document.addEventListener('DOMContentLoaded', (event) => {
  
  
  var lines = {'enemy':getRandDiceLine(6),'player':getRandDiceLine(6)};
	
  function updateDesigh() {
    let diceItems = document.querySelectorAll('.diceLine .dice');
    diceItems.forEach(function(item) {
      let dice = lines[item.getAttribute("owner")][item.getAttribute("pos")];
      if (dice !== undefined) item.innerHTML = dice;
    })
    console.log(lines);
  }
  
  var dragSrcEl = null;
  
  function handleDragStart(e) {
    this.style.opacity = '0.4';
    
    dragSrcEl = this;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
  }

  function handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }

    e.dataTransfer.dropEffect = 'move';
    
    return false;
  }

  function handleDragEnter(e) {
    this.classList.add('over');
  }

  function handleDragLeave(e) {
    this.classList.remove('over');
  }

  function handleDrop(e) {
    if (e.stopPropagation) {
      e.stopPropagation(); // stops the browser from redirecting.
    }
    
    if (dragSrcEl != this && dragSrcEl.getAttribute("owner") == this.getAttribute("owner")) {
      if(this.classList.contains('dice')) {
        let owner = dragSrcEl.getAttribute("owner");
        let pos1 = +dragSrcEl.getAttribute("pos");
        let pos2 = +this.getAttribute("pos");
        [lines[owner][pos1], lines[owner][pos2]] = [lines[owner][pos2], lines[owner][pos1]];
        //dragSrcEl. = this.innerHTML;
        //this.innerHTML = e.dataTransfer.getData('text/html');
      } else if (this.classList.contains('divider')) {
        let owner = dragSrcEl.getAttribute("owner");
        let pos1 = +dragSrcEl.getAttribute("pos");
        let pos2 = +this.getAttribute("pos");
        if (pos1 > pos2) {
          lines[owner] = lines[owner].slice(0, pos2 + 1).concat([lines[owner][pos1]].concat(lines[owner].slice(pos2+1, pos1).concat(lines[owner].slice(pos1 + 1))));
        } else if (pos1 < pos2) {
          lines[owner] = lines[owner].slice(0, pos1).concat(lines[owner].slice(pos1 + 1, pos2 + 1).concat([lines[owner][pos1]].concat(lines[owner].slice(pos2+1))));
        }
      }
    }
    updateDesigh();
    
    return false;
  }

  function handleDragEnd(e) {
    this.style.opacity = '1';
    
    diceItems.forEach(function (item) {
      item.classList.remove('over');
    });
    betweenDiceItems.forEach(function (item) {
      item.classList.remove('over');
    });
  }
  
  
  let diceItems = document.querySelectorAll('.diceLine .dice');
  diceItems.forEach(function(item) {
    item.addEventListener('dragstart', handleDragStart, false);
    item.addEventListener('dragenter', handleDragEnter, false);
    item.addEventListener('dragover', handleDragOver, false);
    item.addEventListener('dragleave', handleDragLeave, false);
    item.addEventListener('drop', handleDrop, false);
    item.addEventListener('dragend', handleDragEnd, false);
  });
  
  let betweenDiceItems = document.querySelectorAll('.diceLine .divider');
  betweenDiceItems.forEach(function(item) {
    item.addEventListener('dragenter', handleDragEnter, false);
    item.addEventListener('dragover', handleDragOver, false);
    item.addEventListener('dragleave', handleDragLeave, false);
    item.addEventListener('drop', handleDrop, false);
    item.addEventListener('dragend', handleDragEnd, false);
  });
  updateDesigh();
});