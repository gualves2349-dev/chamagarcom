const msg=document.querySelector('#message');
try{
 const {db,auth}=await import('./firebase.js');
 const {signInWithEmailAndPassword,onAuthStateChanged,signOut}=await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js');
 const {doc,setDoc,serverTimestamp}=await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js');
 document.querySelector('#entrar').onclick=async()=>{try{await signInWithEmailAndPassword(auth,document.querySelector('#email').value,document.querySelector('#senha').value)}catch(e){msg.textContent='Falha no login.'}};
 document.querySelector('#sair').onclick=()=>signOut(auth);
 onAuthStateChanged(auth,u=>document.querySelector('#form').classList.toggle('hidden',!u));
 document.querySelector('#criar').onclick=async()=>{
  const numero=document.querySelector('#numero').value.trim(),salao=Number(document.querySelector('#salao').value);
  if(!/^[0-9]{1,4}$/.test(numero)||!Number.isInteger(salao)||salao<1||salao>99){msg.textContent='Informe número de mesa e salão válidos.';return}
  const bytes=new Uint8Array(18);crypto.getRandomValues(bytes);const token=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  try{await setDoc(doc(db,'mesas',token),{numero,salao,ativa:true,criadaEm:serverTimestamp()});const url=new URL('index.html',location.href);url.searchParams.set('mesa',token);const a=document.createElement('a');a.href=url.href;a.textContent=url.href;a.target='_blank';a.rel='noopener';const r=document.querySelector('#resultado');r.replaceChildren(document.createTextNode('Link exclusivo da mesa: '),a);msg.textContent='Mesa cadastrada. Copie este link para o NFC e o QR Code.'}catch(e){msg.textContent='Sem permissão para cadastrar. Verifique o UID do administrador nas regras.';console.error(e)}
 };
}catch(e){msg.textContent=e.message;console.error(e)}
