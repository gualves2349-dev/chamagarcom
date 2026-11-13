const msg=document.querySelector('#message');
try {
 const {db,auth}=await import('./firebase.js');
 const {doc,getDoc,collection,addDoc,serverTimestamp}=await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js');
 const {signInAnonymously}=await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js');
 const token=new URLSearchParams(location.search).get('mesa');
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
}catch(e){msg.textContent=e.message;console.error(e)}
