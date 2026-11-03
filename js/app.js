let R=null,GOALS=[],charts=[];
const $=id=>document.getElementById(id),pct=v=>v==null?"s/d":v.toFixed(0);
const scale=["","1 – Muy bajo / nunca","2","3","4","5 – Muy alto / siempre"];
function build(){let h="",cur="";MODEL.ind.filter(i=>i.id!="meta").forEach(i=>{
 h+=`<section class="card" style="border-top:5px solid ${DC[i.dim]}"><h2>${MODEL.dims[i.dim]}: ${i.n}</h2>`;
 MODEL.q.filter(q=>q[0]==i.id).forEach(q=>{h+=`<div class="q"><label for="${q[1]}">${q[2]}</label>`+(q[3]=="h"?`<input type="number" id="${q[1]}" min="0" max="24" step="0.5">`:`<select id="${q[1]}"><option value="">Prefiero no responder</option>${[1,2,3,4,5].map(n=>`<option value="${n}">${scale[n]}</option>`).join("")}</select>`)+`</div>`});h+="</section>"});
 $("qs").innerHTML=h;$("fecha").valueAsDate=new Date();goals();goals();goals();prog()}
function goals(){const d=document.createElement("div");d.className="goal";
 d.innerHTML=`<input placeholder="Nombre" aria-label="Nombre del objetivo"><input placeholder="Meta (número)" type="number" min="0" step="any" aria-label="Meta"><input placeholder="Avance actual" type="number" min="0" step="any" aria-label="Avance"><input type="date" aria-label="Fecha límite"><select aria-label="Prioridad"><option>Media</option><option>Alta</option><option>Baja</option></select><button type="button" class="sec">Quitar</button>`;
 d.querySelector("button").onclick=()=>{d.remove();prog()};$("goals").appendChild(d)}
function read(){const a={};MODEL.q.forEach(q=>a[q[1]]=$(q[1]).value);
 const g=[...document.querySelectorAll(".goal")].map(r=>{const i=r.querySelectorAll("input,select");return{name:i[0].value.trim(),target:i[1].value===""?NaN:+i[1].value,cur:i[2].value===""?0:+i[2].value,date:i[3].value,prio:i[4].value}}).filter(x=>x.name||!isNaN(x.target));
 return{a,g,fin:{inc:+$("inc").value,exp:$("exp").value}}}
function validate(d){const e=[];d.g.forEach((x,i)=>{if(!x.name)e.push(`Objetivo ${i+1}: escribe un nombre.`);if(!(x.target>0))e.push(`Objetivo ${i+1}: la meta debe ser un número mayor que 0.`);if(x.cur<0)e.push(`Objetivo ${i+1}: el avance no puede ser negativo.`)});
 const s=$("sue").value;if(s!==""&&(s<0||s>24))e.push("Horas de sueño: ingresa un valor entre 0 y 24.");
 if($("inc").value!==""&&+$("inc").value<=0)e.push("Ingresos: ingresa un valor mayor que 0 o deja el campo vacío.");
 if($("exp").value!==""&&+$("exp").value<0)e.push("Gastos: no pueden ser negativos.");return e}
function prog(){const t=MODEL.q.length;const n=MODEL.q.filter(q=>$(q[1])&&$(q[1]).value!=="").length;$("prog").style.width=(n/t*100)+"%";$("review").textContent=`Preguntas respondidas: ${n} de ${t}; objetivos: ${document.querySelectorAll(".goal").length}. Puedes volver a cambiar cualquier respuesta antes de calcular.`}
const DC={humano:"#0f9d8a",estructural:"#3b6cf0",social:"#e8590c",objetivos:"#8e44ad"};
const col=v=>v==null?"#b8c0c8":v<40?"#d64545":v<60?"#f0a020":v<80?"#3b9ae1":"#1fa971";
const rgb=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));
function show(){const d=read(),e=validate(d);$("errs").innerHTML=e.join("<br>");if(e.length)return;
 GOALS=d.g;R=compute(d.a,GOALS,d.fin);R.fin=d.fin;R.recs=recommend(R,GOALS);R.date=$("fecha").value||new Date().toISOString().slice(0,10);
 const ks=Object.keys(MODEL.dims),idx=R.ok?R.idx:null;
 $("gv").innerHTML=`<b style="color:${col(idx)}">${idx==null?"—":pct(idx)}</b><span>${idx==null?"Índice no disponible":label(idx)}</span>`;
 $("meta").innerHTML=`<span class="pill">Cobertura ${(R.cov*100).toFixed(0)} %</span><span class="pill">${R.date}</span>`+(R.ok?"":`<br><small>Faltan: ${R.missing.join(", ")}</small>`);
 $("dm").innerHTML=ks.map(k=>`<div class="dc" style="border-left-color:${DC[k]}"><b style="color:${DC[k]}">${pct(R.dim[k])}</b><span>${MODEL.dims[k]}</span><div class="bar"><i style="width:${R.dim[k]||0}%;background:${DC[k]}"></i></div></div>`).join("");
 const L=MODEL.ind.filter(i=>R.s[i.id]!=null).sort((a,b)=>R.s[b.id]-R.s[a.id]);R.L=L;
 const chip=i=>`<div class="chip" style="border-color:${DC[i.dim]}"><span>${i.n}</span><b style="color:${col(R.s[i.id])}">${pct(R.s[i.id])}</b></div>`;
 $("st").innerHTML=L.slice(0,3).map(chip).join("")||"<small>Sin datos</small>";$("pr").innerHTML=L.slice(-3).reverse().map(chip).join("")||"<small>Sin datos</small>";
 R.c=GOALS.reduce((o,g)=>(o[g.st]++,o),{completado:0,activo:0,vencido:0});
 $("gl").innerHTML=GOALS.map(g=>`<p><b>${g.name}</b> · ${(g.p*100).toFixed(0)} %<span class="bar"><i style="width:${g.p*100}%;background:${{completado:"#1fa971",activo:"#3b9ae1",vencido:"#d64545"}[g.st]}"></i></span></p>`).join("");
 $("recs").innerHTML=R.recs.length?R.recs.slice(0,5).map((r,n)=>`<div class="rec"><i style="background:${["#d64545","#f0a020","#3b9ae1","#8e44ad","#0f9d8a"][n]}"></i><div><b>${r.a}</b> — ${r.act}<br><small>${r.why} Meta: ${r.goal} · ${r.term}</small></div></div>`).join(""):"<small>Sin áreas bajo 60.</small>";
 $("dash").classList.remove("hide");draw();$("dash").scrollIntoView()}
function draw(){charts.forEach(c=>c.destroy());Chart.defaults.font.family="Segoe UI,Arial,sans-serif";Chart.defaults.color="#1b2430";const o={animation:false},idx=R.ok?R.idx:0,L=R.L;
 charts=[new Chart($("cg"),{type:"doughnut",data:{datasets:[{data:[idx,100-idx],backgroundColor:[col(R.ok?idx:null),"#e6eaf0"],borderWidth:0}]},options:{...o,rotation:-90,circumference:180,cutout:"74%",plugins:{tooltip:{enabled:false}},maintainAspectRatio:false}}),
 new Chart($("cr"),{type:"radar",data:{labels:MODEL.ind.map(i=>i.n.split(" ")[0]),datasets:[{label:"Puntuación",data:MODEL.ind.map(i=>R.s[i.id]),backgroundColor:"rgba(59,108,240,.25)",borderColor:"#3b6cf0",pointBackgroundColor:MODEL.ind.map(i=>DC[i.dim]),pointRadius:5}]},options:{...o,scales:{r:{min:0,max:100,ticks:{stepSize:25,backdropColor:"transparent"}}},plugins:{legend:{display:false}}}}),
 new Chart($("cb"),{type:"bar",data:{labels:L.map(i=>i.n),datasets:[{data:L.map(i=>R.s[i.id]),backgroundColor:L.map(i=>DC[i.dim])}]},options:{...o,indexAxis:"y",scales:{x:{min:0,max:100}},plugins:{legend:{display:false}}}}),
 new Chart($("cgo"),{type:"doughnut",data:{labels:["Completados","Activos","Vencidos"],datasets:[{data:[R.c.completado,R.c.activo,R.c.vencido],backgroundColor:["#1fa971","#3b9ae1","#d64545"]}]},options:{...o,cutout:"60%",plugins:{legend:{position:"right"}}}})]}
function pdf(){const{jsPDF}=window.jspdf,D=new jsPDF({format:"a4"}),hs=$("hideSens").checked,W=210,N=[18,33,59];let y;
 const H=t=>{if(y>262){D.addPage();y=20}D.setFontSize(13);D.setTextColor(...N);D.text(t,15,y);y+=6;D.setTextColor(30)},P=(t,s=9)=>{D.setFontSize(s);D.splitTextToSize(t,180).forEach(l=>{if(y>282){D.addPage();y=20}D.text(l,15,y);y+=4.5});y+=2},
 T=(hd,b,sc)=>{D.autoTable({startY:y,head:[hd],body:b,styles:{fontSize:8.5},headStyles:{fillColor:N},alternateRowStyles:{fillColor:[245,247,251]},margin:{left:15,right:15},didParseCell:x=>{if(sc!=null&&x.section=="body"&&x.column.index==sc){const v=parseFloat(x.cell.raw);if(!isNaN(v)){x.cell.styles.textColor=rgb(col(v));x.cell.styles.fontStyle="bold"}}}});y=D.lastAutoTable.finalY+7},
 I=(c,x,yy,w)=>{const h=w*c.height/c.width;D.addImage(c.toDataURL("image/png"),"PNG",x,yy,w,h);return h};
 D.setFillColor(...N);D.rect(0,0,W,34,"F");D.setFillColor(15,157,138);D.rect(0,34,W,2.5,"F");D.setTextColor(255);D.setFontSize(15);D.text("INFORME DE EVALUACIÓN INTEGRAL",15,15);D.text("DEL DESARROLLO PERSONAL",15,23);D.setFontSize(8.5);
 D.text(`${R.date}  ·  ${hs||!$("alias").value?"":$("alias").value+"  ·  "}${$("periodo").value?$("periodo").value+"  ·  ":""}Modelo v${MODEL.version}  ·  Generado ${new Date().toLocaleDateString("es")}`,15,30);D.setTextColor(30);
 const idx=R.ok?R.idx:null;D.setFontSize(46);D.setTextColor(...rgb(col(idx)));D.text(idx==null?"—":pct(idx),15,62);D.setFontSize(10);D.setTextColor(30);D.text(idx==null?"Índice no disponible (información insuficiente)":"de 100 · "+label(idx),15,69);D.text(`Cobertura de información: ${(R.cov*100).toFixed(0)} %`,15,75);
 D.addImage($("cg").toDataURL("image/png"),"PNG",120,44,75,75*$("cg").height/$("cg").width);y=92;
 Object.keys(MODEL.dims).forEach(k=>{D.setFontSize(9);D.setTextColor(30);D.text(MODEL.dims[k],15,y+3);D.setFillColor(228,232,240);D.rect(78,y,95,4.5,"F");const c=rgb(DC[k]);D.setFillColor(...c);D.rect(78,y,95*(R.dim[k]||0)/100,4.5,"F");D.setFont(undefined,"bold");D.text(pct(R.dim[k]),178,y+3.5);D.setFont(undefined,"normal");y+=9});y+=4;
 H("Fortalezas");P(R.L.slice(0,3).map(i=>`${i.n}: ${pct(R.s[i.id])}`).join("   |   ")||"Sin datos");H("Prioridades");P(R.L.slice(-3).reverse().map(i=>`${i.n}: ${pct(R.s[i.id])}`).join("   |   ")||"Sin datos");
 D.addPage();y=18;H("Visualizaciones");const w=88;let h1=I($("cr"),15,y,w);I($("cb"),107,y,w);y+=Math.max(h1,w*$("cb").height/$("cb").width)+6;I($("cgo"),15,y,w);
 D.setFontSize(9);D.text(`Objetivos: ${R.c.completado} completados · ${R.c.activo} activos · ${R.c.vencido} vencidos`,107,y+10);y+=60;
 H("Indicadores");T(["Indicador","Dimensión","Peso","Puntuación"],MODEL.ind.map(i=>[i.n,MODEL.dims[i.dim],(i.w*100)+" %",R.s[i.id]==null?"s/d":pct(R.s[i.id])]),3);
 if(GOALS.length){H("Objetivos");T(["Objetivo","Estado","Avance %","Fecha límite"],GOALS.map(g=>[g.name,g.st,(g.p*100).toFixed(0),g.date||"—"]),2)}
 if(!hs&&R.fin.inc>0&&R.fin.exp!=="")P(`Tasa de ahorro: ${(((R.fin.inc-R.fin.exp)/R.fin.inc)*100).toFixed(1)} %`);
 H("Plan de mejora");T(["Área","Acción","Meta","Plazo"],R.recs.slice(0,5).map(r=>[r.a,r.act,r.goal,r.term]));
 H("Ficha técnica y alcance");P("Índice = Σ(peso × puntuación) renormalizado sobre indicadores con datos. Escala 1–5: ((r−1)/4)×100. Sueño: 100 con 7–9 h. Ahorro: 20 % = 100. Metas: avance/meta (máx. 100). Provisional si cobertura ≥ 70 % y las 4 dimensiones tienen datos. Rangos: 0–39, 40–59, 60–79, 80–100 (orientativos). Referencias conceptuales: OMS-5, OCDE, IFRS, SMART, Rueda de la Vida. Datos autorreportados; pesos y fórmulas son propuesta propia, sin escalas validadas. Faltantes: "+(R.missing.join(", ")||"ninguno")+". Autoevaluación informativa: no es diagnóstico clínico, prueba validada ni certificación; no sustituye a profesionales.",8);
 const n=D.getNumberOfPages();for(let i=1;i<=n;i++){D.setPage(i);D.setFontSize(8);D.setTextColor(120);D.text(`Página ${i} de ${n}`,W-15,291,{align:"right"})}
 D.save(`Informe_Evaluacion_Personal_${R.date}.pdf`)}
function reset(){if(!confirm("Se eliminarán todos los datos de la evaluación actual (no afecta PDF ya descargados). ¿Continuar?"))return;
 $("form").reset();charts.forEach(c=>c.destroy());charts=[];R=null;GOALS=[];$("goals").innerHTML="";goals();goals();goals();$("fecha").valueAsDate=new Date();$("dash").classList.add("hide");$("errs").textContent="";prog();scrollTo(0,0)}
$("form").addEventListener("submit",e=>{e.preventDefault();show()});$("form").addEventListener("input",prog);
$("addG").onclick=()=>{goals();prog()};$("btnPdf").onclick=()=>R&&pdf();$("btnNew").onclick=reset;build();
