// Modelo SEIDP v1.0 — pesos y escalas centralizados aquí (propuesta de diseño, no validada científicamente)
const MODEL={version:"1.0",minCoverage:0.7,
dims:{humano:"Capital humano",estructural:"Capital estructural personal",social:"Capital social o relacional",objetivos:"Cumplimiento de objetivos"},
ind:[
{id:"salud",dim:"humano",n:"Salud y autocuidado",w:.10},{id:"bien",dim:"humano",n:"Bienestar personal percibido",w:.10},
{id:"conoc",dim:"humano",n:"Conocimientos y aprendizaje",w:.10},{id:"comp",dim:"humano",n:"Competencias y desarrollo profesional",w:.10},
{id:"habit",dim:"estructural",n:"Hábitos y planificación",w:.10},{id:"tiempo",dim:"estructural",n:"Gestión del tiempo",w:.08},
{id:"org",dim:"estructural",n:"Organización y herramientas",w:.06},{id:"fin",dim:"estructural",n:"Gestión financiera básica",w:.06},
{id:"rel",dim:"social",n:"Relaciones y apoyo percibido",w:.10},{id:"com",dim:"social",n:"Comunicación y colaboración",w:.10},
{id:"meta",dim:"objetivos",n:"Cumplimiento de metas",w:.10}],
q:[ // [indicador,id,texto,tipo] l=escala 1–5, h=horas de sueño
["salud","sue","Horas habituales de sueño por noche","h"],["salud","act","Actividad física (1 nunca – 5 casi todos los días)","l"],
["salud","aut","Regularidad de tus hábitos de autocuidado","l"],["salud","ene","Percepción general de energía","l"],
["bien","b1","Valoración subjetiva de tu bienestar","l"],["bien","b2","Equilibrio entre actividades y descanso","l"],
["bien","b3","Satisfacción con tu situación actual","l"],["bien","b4","Capacidad percibida para afrontar tus actividades diarias","l"],
["conoc","c1","Constancia de estudio o aprendizaje","l"],["conoc","c2","Avance en las competencias que quieres adquirir","l"],["conoc","c3","Aplicas lo aprendido en ejercicios o proyectos","l"],
["comp","p1","Experiencia práctica en tus habilidades clave","l"],["comp","p2","Avance en tus objetivos académicos o profesionales","l"],["comp","p3","Proyectos completados que demuestran tus conocimientos","l"],
["habit","h1","Planificas tu día y tu semana","l"],["habit","h2","Regularidad de tus hábitos","l"],["habit","h3","Revisas periódicamente tus metas","l"],
["tiempo","t1","Cumples tus tareas dentro del plazo","l"],["tiempo","t2","Usas tu tiempo según tus prioridades","l"],
["org","o1","Organización de tu entorno físico","l"],["org","o2","Organización de tu entorno digital","l"],["org","o3","Tienes un sistema de seguimiento (agenda, lista, app)","l"],
["fin","f1","Llevas control de tus gastos","l"],
["rel","r1","Calidad percibida de tus relaciones","l"],["rel","r2","Apoyo social percibido cuando lo necesitas","l"],
["com","m1","Comunicas con claridad lo que necesitas","l"],["com","m2","Colaboras bien en equipos o grupos","l"]],
norm:v=>(v-1)/4*100,
sleep:h=>{const d=h<7?7-h:h>9?h-9:0;return Math.max(0,100-100*d/3)}, // 7–9 h = 100; propuesta propia
savings:(i,e)=>Math.max(0,Math.min(1,((i-e)/i)/0.2))*100, // ahorro 20 % = 100; propuesta propia
goalState:(g,now)=>(g.target>0&&g.cur>=g.target)?"completado":(g.date&&new Date(g.date)<now?"vencido":"activo")};
function compute(a,goals,fin,now=new Date()){
 const s={};
 goals.forEach(g=>{g.p=g.target>0?Math.min(1,g.cur/g.target):0;g.st=MODEL.goalState(g,now)});
 MODEL.ind.forEach(i=>{const vals=[];
  MODEL.q.filter(q=>q[0]==i.id).forEach(q=>{const v=a[q[1]];if(v===""||v==null||isNaN(v))return;vals.push(q[3]=="h"?MODEL.sleep(+v):MODEL.norm(+v))});
  if(i.id=="fin"&&fin.inc>0&&fin.exp!==""&&fin.exp!=null)vals.push(MODEL.savings(fin.inc,+fin.exp));
  if(i.id=="meta")goals.forEach(g=>vals.push(g.p*100));
  s[i.id]=vals.length?vals.reduce((x,y)=>x+y)/vals.length:null});
 let cov=0,sum=0;MODEL.ind.forEach(i=>{if(s[i.id]!=null){cov+=i.w;sum+=i.w*s[i.id]}});
 const dim={};Object.keys(MODEL.dims).forEach(d=>{const L=MODEL.ind.filter(i=>i.dim==d&&s[i.id]!=null),w=L.reduce((x,i)=>x+i.w,0);dim[d]=w?L.reduce((x,i)=>x+i.w*s[i.id],0)/w:null});
 return{s,dim,cov,idx:cov?sum/cov:null,ok:cov>=MODEL.minCoverage&&Object.values(dim).every(v=>v!=null),missing:MODEL.ind.filter(i=>s[i.id]==null).map(i=>i.n)}}
const label=v=>v<40?"Requiere atención prioritaria":v<60?"Área en desarrollo":v<80?"Evolución favorable":"Resultado alto";
const ACT={salud:"Fija una rutina mínima de sueño y 3 sesiones semanales de actividad ligera.",bien:"Reserva un espacio diario de descanso; si el malestar persiste, consulta a un profesional.",conoc:"Programa bloques de estudio fijos de 30 min, 3 veces por semana.",comp:"Elige un proyecto pequeño que aplique la habilidad que quieres mejorar.",habit:"Planifica la semana cada domingo y reduce a 2–3 hábitos clave.",tiempo:"Estima la duración de cada tarea y agrupa las 3 prioritarias del día.",org:"Dedica 15 min semanales a ordenar tu entorno y elige una sola herramienta de seguimiento.",fin:"Registra gastos durante una semana y define una meta de ahorro realista.",rel:"Contacta esta semana a una persona de confianza para conversar.",com:"Practica expresar una necesidad concreta por semana.",meta:"Revisa tus metas y divídelas en pasos con fecha."};
function recommend(r,goals,now=new Date()){const R=[];
 if(!r.ok)R.push({a:"Información",why:`Cobertura ${(r.cov*100).toFixed(0)} % (mínimo 70 % y datos en las 4 dimensiones).`,act:"Completa: "+r.missing.join(", "),ind:"Cobertura",goal:"≥ 70 %",term:"Hoy"});
 MODEL.ind.filter(i=>r.s[i.id]!=null&&r.s[i.id]<60).sort((x,y)=>r.s[x.id]-r.s[y.id]).forEach(i=>R.push({a:i.n,why:`Tu puntuación es ${r.s[i.id].toFixed(0)}/100 según tus respuestas.`,act:ACT[i.id],ind:"Puntuación de "+i.n,goal:"+10 puntos",term:"4 semanas"}));
 goals.filter(g=>g.st=="vencido").forEach(g=>R.push({a:"Objetivos",why:`«${g.name}» venció con ${(g.p*100).toFixed(0)} % de avance.`,act:"Redefine plazo o meta, o divídela en pasos pequeños.",ind:"% de avance",goal:"Nueva fecha",term:"1 semana"}));
 goals.filter(g=>g.st=="activo"&&g.date&&(new Date(g.date)-now)/864e5<=14).forEach(g=>R.push({a:"Objetivos",why:`«${g.name}» vence en menos de 14 días (avance ${(g.p*100).toFixed(0)} %).`,act:"Define las acciones mínimas para cerrarla a tiempo.",ind:"% de avance",goal:"100 %",term:"Antes de la fecha límite"}));
 return R}
