document.addEventListener("DOMContentLoaded", onStart);
function onStart() {
}
function httpGetAsync(theUrl, callback) //https://stackoverflow.com/questions/247483/http-get-request-in-javascript
{
    var xmlHttp = new XMLHttpRequest();
    // xmlHttp.setRequestHeader("Origin", )
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

(function($) {
  $.dragScroll = function(options) {
    var settings = $.extend({
      scrollVertical: true,
      scrollHorizontal: true,
      cursor: null
    }, options);

    var clicked = false,
      clickY, clickX,
      zoomY, zoomX,
      clientClickX, clientClickY;
    
    var getCursor = function() {
      if (settings.cursor) return settings.cursor;
      if (settings.scrollVertical && settings.scrollHorizontal) return 'move';
      if (settings.scrollVertical) return 'row-resize';
      if (settings.scrollHorizontal) return 'col-resize';
    }

    var updateScrollPos = function(e, el) {
      $('html').css('cursor', getCursor());
      var $el = $(el);
      settings.scrollVertical && $el.scrollTop($el.scrollTop() + (clickY - e.pageY));
      settings.scrollHorizontal && $el.scrollLeft($el.scrollLeft() + (clickX - e.pageX));
    }

    $(document).on({
      'mousemove': function(e) {
        if (e.button == 0) clicked && updateScrollPos(e, this);
      },
      'mousedown': function(e) {
        if (e.button == 0) {
          clicked = true;
          clickY = e.pageY;
          clickX = e.pageX;
          clientClickX = e.clientX;
          clientClickY = e.clientY;
        }
      },
      'mouseup': function(e) {
        if (e.button == 0) {
          clicked = false;
          $('html').css('cursor', 'auto');

          if (Math.abs(e.clientY-clientClickY) < 5 && Math.abs(e.clientX-clientClickX) < 5) {
            clickEvent(e);
          }
        }
      }
    });

    document.addEventListener("mousewheel", function(e) {
      e.preventDefault()
      console.log(e);
      const thePanel = $('#thePanel')
      var scale = +thePanel.css('zoom');
      zoomY = e.pageY/scale;
      zoomX = e.pageX/scale;
      console.log(zoomX/scale);
      scale *= (1 - (e.deltaY||e.deltaX)/4000);
      if (scale > 600) scale = 600;
      thePanel.css('zoom', scale);
      scale = +thePanel.css('zoom');
      const $el = $(this);
      settings.scrollVertical && $el.scrollTop($el.scrollTop() + (zoomY*scale - e.pageY));
      settings.scrollHorizontal && $el.scrollLeft($el.scrollLeft() + (zoomX*scale - e.pageX));

    },{ passive: false });

  }
}(jQuery))

$.dragScroll();


function clickEvent(e) {
  const scale = +$('#thePanel').css('zoom');
  createNode(e.pageX /scale, e.pageY/scale);
} 
function createNode(x,y) {
  const node = document.createElement("button");
  node.classList.add("node","standard");
  node.textContent = "🖉";
  document.getElementById("thePanel").appendChild(node);
  console.log(node);
  $(node).offset({ top: y - node.clientHeight/2, left: x - node.clientWidth/2})
  return node;
}