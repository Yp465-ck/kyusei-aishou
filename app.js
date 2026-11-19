const names=['','一白水星','二黒土星','三碧木星','四緑木星','五黄土星','六白金星','七赤金星','八白土星','九紫火星'];
const elements='木火土金水', element=[0,4,2,0,0,2,3,3,2,1], colors=['#47795b','#ab5547','#926e42','#9b8241','#527689'];
const stars=['本命星','月命星'], people=['あなた','お相手'];
const get=id=>document.getElementById(id),mod=(n,b)=>(n%b+b)%b;
function diagram(a,b,from,to){
 const p=Array.from(elements,(_,i)=>[90+63*Math.sin(i*2*Math.PI/5),85-63*Math.cos(i*2*Math.PI/5)]);
 let lines=p.map(([x,y],i)=>[1,2].map(k=>'<line x1="'+x+'" y1="'+y+'" x2="'+p[(i+k)%5][0]+'" y2="'+p[(i+k)%5][1]+'" stroke="#cdc6af" '+(k===2?'stroke-dasharray="3 4"':'')+'/>').join('')).join('');
 if(from!==undefined&&from!==to){const [x,y]=p[from],[z,w]=p[to],angle=Math.atan2(w-y,z-x),ex=z-19*Math.cos(angle),ey=w-19*Math.sin(angle);lines+='<g transform="translate('+x+' '+y+') rotate('+angle*180/Math.PI+')"><path d="M18 0 H'+Math.hypot(ex-x,ey-y)+' l-7 -4 m7 4 l-7 4" fill="none" stroke="#274e42" stroke-width="2.5"/></g>'}
 return '<svg viewBox="0 0 180 165" aria-label="五行の関係図">'+lines+p.map(([x,y],i)=>'<circle cx="'+x+'" cy="'+y+'" r="16" fill="'+(a===undefined||i===a||i===b?colors[i]:'#e3e1d7')+'"/><text x="'+x+'" y="'+(y+5)+'" text-anchor="middle" fill="'+(a===undefined||i===a||i===b?'white':'#63695e')+'">'+elements[i]+'</text>').join('')+'</svg>'
}
get('crest').innerHTML=diagram();
get('inputs').innerHTML=people.map((p,i)=>'<fieldset aria-label="'+p+'"><h3>'+p+'</h3><label>生年月日<input type="date" id="d'+i+'" required min="1900-01-01" max="2100-12-31" value="'+['1994-04-03','1995-06-17'][i]+'"></label><details id="extra'+i+'"><summary>出生時刻（任意）</summary><label>出生時刻（日本時間） <input type="time" id="t'+i+'"></label><label><input type="checkbox" id="u'+i+'">不明（12:00で仮判定）</label></details><label hidden id="gender'+i+'">五黄同数の読み替えに使う性別 <select id="g'+i+'"><option value="">選択</option><option>男性</option><option>女性</option></select></label><p role="alert" class="err" id="err'+i+'"></p></fieldset>').join('');
function person(i){
 const day=get('d'+i).value,time=get('t'+i).value,unknown=get('u'+i).checked;
 const instant=day+'T'+(unknown?'12:00':time||'12:00');
 const boundary=terms.find(t=>t.startsWith(day));
 if(boundary&&!time&&!unknown){get('extra'+i).open=true;get('err'+i).textContent='節替わりの日です。出生時刻を入力するか「不明」を選んでください。';return}
 const start=terms.findLast(t=>t<=instant),month=+start.slice(5,7),year=+start.slice(0,4)-(month===1?1:0),n=mod(1-year,9)+1;
 const feb=[0,8,2,5][(n-1)%3+1],raw=mod(feb-1-mod(month-2,12),9)+1;
 get('gender'+i).hidden=!(raw===5&&n===5);
 const sex=get('g'+i).value;
 if(raw===5&&n===5&&!sex){get('err'+i).textContent='五黄・五黄のため、性別を選択してください。';return}
 const m=raw===n?[0,9,6,4,3,sex==='男性'?7:6,2,8,7,1][n]:raw;
 return {n,m,raw,month,start,unknown,year}
}
function render(){
 get('result').innerHTML='';people.forEach((_,i)=>get('err'+i).textContent='');
 const [a,b]=people.map((_,i)=>person(i));if(!a||!b)return;
 let sum=0,special=false,cards='';
 [a.n,a.m].forEach((n,i)=>[b.n,b.m].forEach((m,j)=>{
 const x=element[n],y=element[m],diff=mod(y-x,5),score=diff===0?0:[1,4].includes(diff)?1:-1;
 const f=diff===1||diff===2?x:y,t=f===x?y:x,rule=n+m===10&&Math.min(n,m)===1;
 special||=rule;sum+=score;
 cards+='<article><h3>あなたの'+stars[i]+' × お相手の'+stars[j]+'</h3><div class="pair">'+diagram(x,y,f,t)+'<div>'+names[n]+' × '+names[m]+'<h2 class="score">'+['相克 −1','比和 0','相生 ＋1'][score+1]+'点</h2>'+ (score===0?'同じ五行':elements[f]+'が'+elements[t]+(score>0?'を生む':'を剋す'))+(rule?'<p>一白・九紫の特例</p>':'')+'</div></div></article>'
 }));
 get('result').innerHTML='<h2>鑑定結果</h2><section class="summary">4つの関係の合計　<strong>'+sum+' 点</strong><p>'+(special?'一白・九紫の特例を優先します。講座では、短期的には結びつきが強く、親密な関係を長く続けるには難しさがあると読みます。':sum>=0?'総合的に相性は良好です。':'総合的には、歩み寄りが必要な相性です。')+'</p></section><h2>ふたりの星</h2><div class="grid">'+[a,b].map((p,i)=>'<article><h3>'+people[i]+'</h3>本命　'+names[p.n]+'　／　月命　'+names[p.m]+(p.raw!==p.m?'<p>同数の読み替え　'+names[p.raw]+' → '+names[p.m]+'</p>':'')+(p.unknown?'<p>出生時刻は12:00で仮判定</p>':'')+'<details><summary>早見表で確認</summary><p>'+p.year+'年の本命星は'+names[p.n]+'。'+p.start.replace('T',' ')+'（日本時間）から始まる'+p.month+'月の行と、本命星の列の交点は'+names[p.raw]+'です。</p></details></article>').join('')+'</div><h2>五行で見る4つの関係</h2><div class="grid">'+cards+'</div>'
}
get('form').oninput=e=>{get('result').innerHTML='';const i=e.target.id.slice(-1);if(e.target.id.startsWith('d')){get('gender'+i).hidden=true;get('g'+i).value='';get('err'+i).textContent=''}if(e.target.id.startsWith('t'))get('u'+i).checked=false;if(e.target.id.startsWith('u')&&e.target.checked)get('t'+i).value=''};
get('form').onsubmit=e=>{e.preventDefault();render();(document.querySelector('.err:not(:empty)')||get('result')).scrollIntoView({behavior:'smooth',block:'center'})};render();
