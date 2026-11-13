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
 const {doc,getDoc,collection,addDoc,serverTimestamp,runTransaction,onSnapshot}=await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js');
 const {signInAnonymously}=await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js');
 const token=suppliedToken;
 if(!token || !/^[a-zA-Z0-9_-]{12,80}$/.test(token)) throw Error('Link da mesa inválido. Utilize o QR Code ou NFC da mesa.');
 await signInAnonymously(auth);
 const snap=await getDoc(doc(db,'mesas',token));
 if(!snap.exists()||!snap.data().ativa) throw Error('Mesa não cadastrada ou desativada.');
 const mesa=snap.data();document.querySelector('#mesa').textContent='Mesa '+mesa.numero;document.querySelector('#salao').textContent='Salão '+mesa.salao+' · Como podemos ajudar?';
 const contaBtn=document.getElementById('conta');
 const garcomBtn=document.getElementById('garcom');
 const lockRef=doc(db,'contasPendentes',token);
 let contaPendente=true; // Bloqueado até confirmar o estado no servidor.
 let enviandoConta=false;
 let enviandoGarcom=false;
 const atualizarConta=()=>{contaBtn.disabled=contaPendente||enviandoConta};
 contaBtn.disabled=true;
 garcomBtn.disabled=false;
 onSnapshot(lockRef,{includeMetadataChanges:true},snapshot=>{
   // Não liberar com estado provisório vindo do cache.
   if(snapshot.metadata.fromCache)return;
   contaPendente=snapshot.exists();
   atualizarConta();
   if(contaPendente && !enviandoConta){
     msg.className='notice';msg.textContent='A conta desta mesa já foi solicitada. Aguarde o atendimento.';
   }else if(!contaPendente && msg.textContent.includes('conta desta mesa já foi solicitada')){
     msg.className='notice';msg.textContent='Você já pode solicitar a conta novamente.';
   }
 },e=>{contaPendente=true;atualizarConta();msg.className='notice';msg.textContent='Não foi possível verificar a solicitação da conta: '+(e.code||e.message)});
 contaBtn.onclick=async()=>{
   if(contaPendente||enviandoConta)return;
   enviandoConta=true;atualizarConta();
   msg.className='notice';msg.textContent='Enviando solicitação de conta...';
   try{
     // Uma transação impede que dois celulares criem a mesma solicitação ao mesmo tempo.
     // Primeiro lê o bloqueio, depois grava o chamado e o bloqueio na mesma operação.
     await runTransaction(db,async tx=>{
       const bloqueio=await tx.get(lockRef);
       if(bloqueio.exists())throw Object.assign(new Error('Conta já solicitada'),{code:'conta-ja-solicitada'});
       const callRef=doc(collection(db,'chamados'));
       tx.set(lockRef,{mesaId:token,solicitante:auth.currentUser.uid,criadoEm:serverTimestamp()});
       tx.set(callRef,{mesaId:token,numero:mesa.numero,salao:mesa.salao,tipo:'conta',status:'pendente',criadoEm:serverTimestamp(),solicitante:auth.currentUser.uid});
     });
     contaPendente=true;
     msg.className='success';msg.textContent='Conta solicitada! Nossa equipe foi avisada.';
   }catch(e){
     console.error('Falha ao solicitar conta:',e);
     msg.className='notice';
     if(e.code==='conta-ja-solicitada'){contaPendente=true;msg.textContent='A conta desta mesa já foi solicitada. Aguarde o atendimento.'}
     else msg.textContent='Não foi possível enviar a conta ('+(e.code||'erro de conexão')+'). Tente novamente.';
   }finally{enviandoConta=false;atualizarConta()}
 };
 garcomBtn.onclick=async()=>{
   if(enviandoGarcom)return;
   enviandoGarcom=true;garcomBtn.disabled=true;
   msg.className='notice';msg.textContent='Enviando solicitação de garçom...';
   try{
     await addDoc(collection(db,'chamados'),{mesaId:token,numero:mesa.numero,salao:mesa.salao,tipo:'garcom',status:'pendente',criadoEm:serverTimestamp(),solicitante:auth.currentUser.uid});
     msg.className='success';msg.textContent='Garçom solicitado! Nossa equipe foi avisada.';
   }catch(e){console.error('Falha ao chamar garçom:',e);msg.className='notice';msg.textContent='Não foi possível chamar o garçom ('+(e.code||'erro de conexão')+'). Tente novamente.'}
   finally{enviandoGarcom=false;garcomBtn.disabled=false}
 };
 msg.textContent='Escolha uma das opções acima.';
}catch(e){document.querySelector('#mesa').textContent='Não foi possível identificar a mesa';document.querySelector('#salao').textContent='Confira se o adesivo corresponde a uma mesa cadastrada e ativa.';msg.textContent=e.message;console.error(e)}
