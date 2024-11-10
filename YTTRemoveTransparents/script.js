$( document ).ready(()=>{$("#theButton").on('click', function(e){
  console.log(1);
  var oText = $("#inputCode").val();
  text = oText.replace(/></gi, `>
    <`);
  var transPenIds = [];
  var match;
  var expr = /<pen id="(.*?)" .*? fc="#FFFFFF".*?fo="0"/ig;
  console.log(3);
  while (match = expr.exec(text)) transPenIds.push(match);
  console.log(4);
  transPenIds = transPenIds.map(x=>x[1]);

  var spans = [];
  expr = /<p .*?\/p>/gi;
  while (match = expr.exec(oText)) spans.push(match[0]);
  console.log(transPenIds);
  if (transPenIds.length == 0) return;
  transPenIds = transPenIds.join(`|`);
  spans = spans.filter(x=>new RegExp(`<s p="(${transPenIds})">`,"i").test(x));
  console.log(spans);
  if (spans.length == 0) return;
  
  for(var j = 0; j < spans.length; j++ ) {
    oText = oText.replaceAll(spans[j], "");
  }
  console.log(oText);
  $("#outputCode").val(oText);
});})