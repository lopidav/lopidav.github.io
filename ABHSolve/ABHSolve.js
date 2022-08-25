/*const shaveOfOpp = (x)=>{
    var q={}, b=[];
    for(var i in x){
        b.push(i.slice(0,-1));
    }
    b=[...new Set(b)];
    for(var i of b) q[i]=(x[i+'A']===undefined||x[i+'A']>-1)
        &&(x[i+'B']===undefined||x[i+'B']>-1)
        &&(x[i+'H']===undefined||x[i+'H']>-1)?1:-1;
    return q;
};

const shaveOfPlr=(x)=>{
    var q={}, b=[];
    for(var i in x){
        b.push(i.slice(0,-1));
    }
    b=[...new Set(b)];
    for(var i of b) q[i]=x[i+'A']>-1||x[i+'B']>-1||x[i+'H']>-1?1:-1;
    return q;
};*/


const shaveOfOpp = (x)=>{
    var q={}, b=[];
    for(var i in x){
        b.push(i.slice(0,-1));
    }
    b=[...new Set(b)];
    for(var i of b) q[i]=(x[i+'A']===undefined?0:x[i+'A']<0?x[i+'A']*2:x[i+'A'])
        +(x[i+'B']===undefined?0:x[i+'B']<0?x[i+'B']*2:x[i+'B'])
        +(x[i+'H']===undefined?0:x[i+'H']<0?x[i+'H']*2:x[i+'H']);
    return q;
};
const shaveOfPlr=(x)=>{
    var q={}, b=[];
    for(var i in x){
        b.push(i.slice(0,-1));
    }
    b=[...new Set(b)];
    for(var i of b) q[i]=Math.max(x[i+'A']==undefined?-9999:x[i+'A'],x[i+'B']==undefined?-9999:x[i+'B'],x[i+'H']==undefined?-9999:x[i+'H']);
    return q;
};



const permutator = (inputArr) => {
  let result = [];

  const permute = (arr, m = []) => {
    if (arr.length === 0) {
      result.push(m)
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next))
     }
   }
 }

 permute(inputArr)

 return result;
}

const clash=(x,y)=>{
    var o=p=3;
    for(var i=0; i<9 && o>0 && p>0; i++){
        switch(x[i]+y[i]) {
            case 'AA':
                o--;p--;
                break;
            case 'AB':
                break;
            case 'AH':
                p--;
                break;
            case 'BA':
                break;
            case 'BB':
                break;
            case 'BH':
                p++;
                break;
            case 'HA':
                o--;
                break;
            case 'HB':
                o++
                break;
            case 'HH':
                o++;
                p++;
                break;
        }
        o=o>3?3:o;
        p=p>3?3:p;
    }
    return o==p?0:o>p?1:-1;                       
}

var a=[1,1,1,2,2,2,3,3,3]
var b=permutator(a)
b=b.map(x=>x.map(e=>'ABH'[e-1]).join``)
b=[...new Set(b)]
var m=[];m=b.flatMap(x=>b.map(y=>[x,y]))
m=m.map(x=>[x[0],x[1],clash(x[0],x[1])])
var q={};m.map(x=>{var r=[...x[0]].map((y,i)=>y+x[1][i]).join``;if(q[r]==undefined)q[r]=0;q[r]+=x[2];})
var w=[q];for(var j = 1;j<18;j++)w[j]=j%2?shaveOfOpp(w[j-1]):shaveOfPlr(w[j-1]);
strat=x=>{var q= [['A',w[17-x.length][x+'A']],['B',w[17-x.length][x+'B']],['H',w[17-x.length][x+'H']]].filter(x=>x[1]!==undefined);return q.sort((x,y)=>(x[1]==y[1]?Math.floor(Math.random() * 3)-1:y[1]-x[1]))[0][0];} 


/* -----test
var g=[];for(var i of b){
    var me='';var hist = '';
    for(var j = 0; j < 9;j++){var step=strat(hist);me+=step;hist+=step;hist+=i[j];}
    g.push([me,i,clash(me,i)]);
}*/