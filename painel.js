const erro=document.querySelector('#erro');
try{
 const {db,auth}=await import('./firebase.js');
 const {signInWithEmailAndPassword,onAuthStateChanged,signOut}=await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js');
 const {collection,query,where,onSnapshot,doc,updateDoc}=await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js');
 let unsubscribe=()=>{},audioCtx=null,first=true;
 document.querySelector('#entrar').onclick=async()=>{try{await signInWithEmailAndPassword(auth,document.querySelector('#email').value,document.querySelector('#senha').value)}catch(e){erro.textContent='Falha no login. Confira suas credenciais e autorização.'}};
 document.querySelector('#sair').onclick=()=>signOut(auth);
 document.querySelector('#som').onclick=()=>{const A=window.AudioContext||window.webkitAudioContext;if(!A){erro.textContent='Áudio não disponível neste navegador.';return;}audioCtx=new A();audioCtx.resume();document.querySelector('#som').textContent='Som ativado';};
 const beep=()=>{if(!audioCtx)return;const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);o.frequency.value=880;g.gain.value=.05;o.start();o.stop(audioCtx.currentTime+.22)};
 onAuthStateChanged(auth,async user=>{
  unsubscribe();document.querySelector('#login').classList.toggle('hidden',!!user);document.querySelector('#painel').classList.toggle('hidden',!user);document.querySelector('#lista').replaceChildren();if(!user)return;
  first=true;let previous=new Set();
  const q=query(collection(db,'chamados'),where('status','==','pendente'));
  unsubscribe=onSnapshot(q,s=>{
   const docs=s.docs.sort((a,b)=>(a.data().criadoEm?.seconds||0)-(b.data().criadoEm?.seconds||0));
   const ids=new Set(docs.map(d=>d.id));if(!first&&docs.some(d=>!previous.has(d.id)))beep();first=false;previous=ids;
   const lista=document.querySelector('#lista');lista.replaceChildren();
   if(!docs.length){const p=document.createElement('p');p.textContent='Nenhum chamado pendente.';lista.append(p)}
   for(const item of docs){const c=item.data(),box=document.createElement('article');box.className='card alert';const h=document.createElement('h3');h.textContent='Mesa '+c.numero+' — Salão '+c.salao;const p=document.createElement('p');p.textContent=c.tipo==='conta'?'Solicitou a conta':'Chamou o garçom';const b=document.createElement('button');b.textContent='Marcar como atendido';b.onclick=async()=>{b.disabled=true;try{await updateDoc(doc(db,'chamados',item.id),{status:'atendido'})}catch(e){erro.textContent='Não foi possível concluir o chamado.';b.disabled=false}};box.append(h,p,b);lista.append(box)}
  },e=>{erro.textContent='Sem permissão para visualizar chamados. Autorize o UID do funcionário nas regras. '+e.code});
 });
}catch(e){erro.textContent=e.message;console.error(e)}
