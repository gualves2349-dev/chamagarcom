const themeBtn=document.getElementById('temaCliente');
function setTheme(theme){document.documentElement.dataset.theme=theme;themeBtn.textContent=theme==='dark'?'☀ Modo claro':'☾ Modo escuro';try{localStorage.setItem('chamagarcom-theme',theme)}catch{}}
let savedTheme='light';try{savedTheme=localStorage.getItem('chamagarcom-theme')==='dark'?'dark':'light'}catch{}
setTheme(savedTheme);
themeBtn.onclick=()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
const msg=document.querySelector('#message');
const params=new URLSearchParams(location.search);
const suppliedToken=params.get('mesa');
if(params.get('demo')==='mesa1' && !suppliedToken){
 document.querySelector('#mesa').textContent='Teste real da Mesa 1';
 document.querySelector('#salao').textContent='Para testar o envio ao painel, abra o link exclusivo da Mesa 1 gerado em Cadastrar → Mesas cadastradas → Abrir página.';
 msg.className='notice';msg.textContent='Este endereço de demonstração não envia chamados. Cadastre a Mesa 1, Salão 1 e abra seu link exclusivo pela central.';
 document.querySelector('.client-actions').classList.add('hidden');
}else if(!suppliedToken){
 document.querySelector('#mesa').textContent='Bem-vindo ao atendimento';
 document.querySelector('#salao').textContent='Para solicitar atendimento, aproxime o celular do adesivo NFC ou leia o QR Code da sua mesa.';
 msg.textContent='Cada mesa possui um link exclusivo. Esta é a página geral do sistema.';
 document.querySelector('.client-actions').classList.add('hidden');
}else try {
 const {db,auth}=await import('./firebase.js');
 const {doc,getDoc,collection,addDoc,serverTimestamp,writeBatch,onSnapshot}=await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js');
 const {signInAnonymously}=await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js');
 const token=suppliedToken;
 if(!token || !/^[a-zA-Z0-9_-]{12,80}$/.test(token)) throw Error('Link da mesa inválido. Utilize o QR Code ou NFC da mesa.');
 await signInAnonymously(auth);
 const snap=await getDoc(doc(db,'mesas',token));
 if(!snap.exists()||!snap.data().ativa) throw Error('Mesa não cadastrada ou desativada.');
 const mesa=snap.data();document.querySelector('#mesa').textContent='Mesa '+mesa.numero;document.querySelector('#salao').textContent='Salão '+mesa.salao+' · Como podemos ajudar?';
 const contaBtn=document.getElementById('conta');
 // Escuta o bloqueio compartilhado da mesa, inclusive em celulares diferentes.
 onSnapshot(doc(db,'contasPendentes',token), snapshot=>{
   contaBtn.dataset.bloqueada=snapshot.exists()?'1':'0';
   contaBtn.disabled=snapshot.exists();
   if(snapshot.exists()){
     contaBtn.setAttribute('aria-label','Conta já solicitada. Aguarde o atendimento.');
     msg.className='notice';msg.textContent='A conta desta mesa já foi solicitada. Aguarde o atendimento.';
   }else{
     contaBtn.removeAttribute('aria-label');
     if(msg.textContent.includes('conta desta mesa já foi solicitada'))msg.textContent='Você já pode solicitar a conta novamente.';
   }
 },e=>{contaBtn.disabled=true;msg.textContent='Não foi possível verificar a solicitação da conta: '+e.code;});
 const buttons=[['garcom','garcom'],['conta','conta']];
 for(const [id,tipo] of buttons){const btn=document.getElementById(id);btn.disabled=false;btn.onclick=async()=>{
  if(tipo==='conta' && btn.dataset.bloqueada==='1')return;
  btn.disabled=true;msg.className='notice';msg.textContent='Enviando sua solicitação...';
  try{if(tipo==='conta'){
    // Duas gravações atômicas: a segunda chamada falha enquanto existir o bloqueio.
    const batch=writeBatch(db);
    const callRef=doc(collection(db,'chamados'));
    batch.set(doc(db,'contasPendentes',token),{mesaId:token,solicitante:auth.currentUser.uid,criadoEm:serverTimestamp()});
    batch.set(callRef,{mesaId:token,numero:mesa.numero,salao:mesa.salao,tipo,status:'pendente',criadoEm:serverTimestamp(),solicitante:auth.currentUser.uid});
    await batch.commit();
   }else{
    await addDoc(collection(db,'chamados'),{mesaId:token,numero:mesa.numero,salao:mesa.salao,tipo,status:'pendente',criadoEm:serverTimestamp(),solicitante:auth.currentUser.uid});
   }msg.className='success';msg.textContent=tipo==='garcom'?'Garçom solicitado! Nossa equipe foi avisada.':'Conta solicitada! Nossa equipe foi avisada.';}
  catch(e){msg.className='notice';msg.textContent=tipo==='conta'&&e.code==='permission-denied'?'A conta desta mesa já foi solicitada. Aguarde o atendimento.':'Não foi possível enviar. Verifique a conexão e tente novamente.';console.error(e)}finally{btn.disabled=tipo==='conta'&&btn.dataset.bloqueada==='1';}
 };}
 msg.textContent='Escolha uma das opções acima.';
}catch(e){document.querySelector('#mesa').textContent='Não foi possível identificar a mesa';document.querySelector('#salao').textContent='Confira se o adesivo corresponde a uma mesa cadastrada e ativa.';msg.textContent=e.message;console.error(e)}
