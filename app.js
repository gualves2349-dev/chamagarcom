const themeBtn=document.getElementById('temaCliente');
function setTheme(theme){document.documentElement.dataset.theme=theme;themeBtn.textContent=theme==='dark'?'☀ Modo claro':'☾ Modo escuro';try{localStorage.setItem('chamagarcom-theme',theme)}catch{}}
let savedTheme='light';try{savedTheme=localStorage.getItem('chamagarcom-theme')==='dark'?'dark':'light'}catch{}
setTheme(savedTheme);
themeBtn.onclick=()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
const msg=document.querySelector('#message');
const params=new URLSearchParams(location.search);
const suppliedToken=params.get('mesa');
if(params.get('demo')==='mesa1'){
 document.querySelector('#mesa').textContent='Mesa 1';
 document.querySelector('#salao').textContent='Salão 1 · Exemplo para testes';
 msg.className='notice ok';msg.textContent='Modo demonstração: nenhuma solicitação será enviada à central.';
 for(const id of ['garcom','conta']){const btn=document.getElementById(id);btn.disabled=false;btn.onclick=()=>{msg.className='success';msg.textContent=id==='garcom'?'Demonstração: garçom solicitado pela Mesa 1.':'Demonstração: conta solicitada pela Mesa 1.';};}
}else if(!suppliedToken){
 document.querySelector('#mesa').textContent='Bem-vindo ao atendimento';
 document.querySelector('#salao').textContent='Para solicitar atendimento, aproxime o celular do adesivo NFC ou leia o QR Code da sua mesa.';
 msg.textContent='Cada mesa possui um link exclusivo. Esta é a página geral do sistema.';
 document.querySelector('.client-actions').classList.add('hidden');
}else try {
 const {db,auth}=await import('./firebase.js');
 const {doc,getDoc,collection,addDoc,serverTimestamp}=await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js');
 const {signInAnonymously}=await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js');
 const token=suppliedToken;
 if(!token || !/^[a-zA-Z0-9_-]{12,80}$/.test(token)) throw Error('Link da mesa inválido. Utilize o QR Code ou NFC da mesa.');
 await signInAnonymously(auth);
 const snap=await getDoc(doc(db,'mesas',token));
 if(!snap.exists()||!snap.data().ativa) throw Error('Mesa não cadastrada ou desativada.');
 const mesa=snap.data();document.querySelector('#mesa').textContent='Mesa '+mesa.numero;document.querySelector('#salao').textContent='Salão '+mesa.salao+' · Como podemos ajudar?';
 const buttons=[['garcom','garcom'],['conta','conta']];
 for(const [id,tipo] of buttons){const btn=document.getElementById(id);btn.disabled=false;btn.onclick=async()=>{
  btn.disabled=true;msg.className='notice';msg.textContent='Enviando sua solicitação...';
  try{await addDoc(collection(db,'chamados'),{mesaId:token,numero:mesa.numero,salao:mesa.salao,tipo,status:'pendente',criadoEm:serverTimestamp(),solicitante:auth.currentUser.uid});msg.className='success';msg.textContent=tipo==='garcom'?'Garçom solicitado! Nossa equipe foi avisada.':'Conta solicitada! Nossa equipe foi avisada.';}
  catch(e){msg.className='notice';msg.textContent='Não foi possível enviar. Verifique a conexão e tente novamente.';console.error(e)}finally{btn.disabled=false;}
 };}
 msg.textContent='Escolha uma das opções acima.';
}catch(e){document.querySelector('#mesa').textContent='Não foi possível identificar a mesa';document.querySelector('#salao').textContent='Confira se o adesivo corresponde a uma mesa cadastrada e ativa.';msg.textContent=e.message;console.error(e)}
