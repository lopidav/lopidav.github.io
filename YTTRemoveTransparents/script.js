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
  while (match = expr.exec(oText)) spans.push(match);
  console.log(transPenIds);
  if (transPenIds.length == 0) return;
  transPenIds = transPenIds.join(`|`);
  spans = spans.filter(x=>new RegExp(`<s p="(${transPenIds})">`,"i").test(x));
  console.log(spans);
  if (spans.length == 0) return;
  
  oText=oText.replace(new RegExp(spans.join(`|`),"gi"), "");
  console.log(oText);
  $("#outputCode").val(oText);
});})