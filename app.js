const msg=document.querySelector('#message');
try {
 const {db,auth}=await import('./firebase.js');
 const {doc,getDoc,collection,addDoc,serverTimestamp}=await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js');
 const {signInAnonymously}=await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js');
 const token=new URLSearchParams(location.search).get('mesa');
 if(!token || !/^[a-zA-Z0-9_-]{12,80}$/.test(token)) throw Error('Link da mesa inválido. Use o link exclusivo gerado pelo administrador.');
 await signInAnonymously(auth);
 const ref=doc(db,'mesas',token), snap=await getDoc(ref);
 if(!snap.exists() || !snap.data().ativa) throw Error('Mesa não cadastrada ou desativada.');
 const mesa=snap.data();
 document.querySelector('#mesa').textContent='Mesa '+mesa.numero;
 document.querySelector('#salao').textContent='Salão '+mesa.salao;
 for(const [id,tipo] of [['garcom','garcom'],['conta','conta']]){
   const btn=document.getElementById(id);btn.disabled=false;
   btn.onclick=async()=>{
     btn.disabled=true;msg.textContent='Enviando solicitação...';
     try{
       await addDoc(collection(db,'chamados'),{mesaId:token,numero:mesa.numero,salao:mesa.salao,tipo,status:'pendente',criadoEm:serverTimestamp(),solicitante:auth.currentUser.uid});
       msg.textContent='Solicitação enviada! Aguarde o atendimento.';
     }catch(e){msg.textContent='Não foi possível enviar. Verifique a conexão e tente novamente.';console.error(e)}
     finally{btn.disabled=false;}
   };
 }
 msg.textContent='Selecione o atendimento desejado.';
}catch(e){msg.textContent=e.message;console.error(e)}
