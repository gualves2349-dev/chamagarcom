const $=id=>document.getElementById(id);const err=$('erro');
let unsubscribe=()=>{}, unsubscribeMesas=()=>{},unsubscribeFuncs=()=>{}, audioCtx=null,seen=null,allCalls=[],filter='todos',isAdmin=false;
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const switchPage=page=>{ $('home').classList.toggle('hidden',page!=='home');$('cadastro').classList.toggle('hidden',page!=='cadastro');$('navHome').classList.toggle('active',page==='home');$('navCadastro').classList.toggle('active',page==='cadastro');};
$('navHome').onclick=()=>switchPage('home');$('navCadastro').onclick=()=>switchPage('cadastro');
for(const b of document.querySelectorAll('#filtros button'))b.onclick=()=>{filter=b.dataset.salao;document.querySelectorAll('#filtros button').forEach(x=>x.classList.toggle('active',x===b));renderCalls()};
// O navegador pode bloquear áudio até uma interação explícita do usuário.
let soundEnabled=false;
const soundButton=$('som');
function showSoundState(){soundButton.textContent=soundEnabled?'● Som ativo':'● Som desativado';soundButton.className=soundEnabled?'sound-on':'sound-off';soundButton.setAttribute('aria-pressed',String(soundEnabled));soundButton.title=soundEnabled?'Clique para silenciar os avisos':'Clique para ativar os avisos';}
async function enableSound(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)throw Error('Áudio não disponível');audioCtx ||=new C();await audioCtx.resume();soundEnabled=audioCtx.state==='running';showSoundState();return soundEnabled}catch(e){soundEnabled=false;showSoundState();return false}}
// Alertas diferentes por tipo: metais para garçom; caixa registradora para conta.
function playTone(frequency, start, duration, type='sine', volume=.12) {
 const oscillator=audioCtx.createOscillator(), envelope=audioCtx.createGain();
 oscillator.type=type; oscillator.frequency.setValueAtTime(frequency,start);
 envelope.gain.setValueAtTime(.0001,start);
 envelope.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),start+.015);
 envelope.gain.exponentialRampToValueAtTime(.0001,start+duration);
 oscillator.connect(envelope);envelope.connect(audioCtx.destination);
 oscillator.start(start);oscillator.stop(start+duration+.015);
}
function beep(tipo='garcom') {
 if(!soundEnabled||!audioCtx||audioCtx.state!=='running')return;
 try {
  const t=audioCtx.currentTime+.025;
  if(tipo==='conta') {
   // Caixa registradora: clique de abertura e três notas metálicas ascendentes.
   playTone(240,t,.065,'square',.055);
   playTone(880,t+.095,.19,'sine',.14);
   playTone(1174.66,t+.205,.24,'sine',.15);
   playTone(1567.98,t+.325,.42,'sine',.13);
   playTone(3135.96,t+.33,.25,'sine',.035);
  } else {
   // Duas notas de chamada, com timbre de metais.
   for(const [offset,freq] of [[0,392],[.32,523.25]]) {
    playTone(freq,t+offset,.37,'sawtooth',.11);
    playTone(freq*2,t+offset,.30,'triangle',.045);
   }
  }
 }catch(e){console.warn('Falha no áudio',e)}
}
soundButton.onclick=async()=>{if(soundEnabled){soundEnabled=false;showSoundState();}else{const ok=await enableSound();if(ok)beep();else err.textContent='O navegador bloqueou o áudio. Clique novamente para ativar.'}};
// Alternância de tema, com preferência salva apenas neste navegador.
const applyTheme=theme=>{document.documentElement.dataset.theme=theme;try{localStorage.setItem('chamagarcom-theme',theme)}catch{};for(const id of ['tema','temaLogin']){const b=$(id);if(b)b.textContent=theme==='dark'?'☀ Modo claro':'☾ Modo escuro'}};
applyTheme((()=>{try{return localStorage.getItem('chamagarcom-theme')==='dark'?'dark':'light'}catch{return 'light'}})());
for(const id of ['tema','temaLogin'])$(id).onclick=()=>applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
showSoundState();
function renderCalls(){const pending=allCalls.filter(x=>x.data.status==='pendente');$('total').textContent=pending.length;$('totalGarcom').textContent=pending.filter(x=>x.data.tipo==='garcom').length;$('totalConta').textContent=pending.filter(x=>x.data.tipo==='conta').length;const list=$('lista');list.replaceChildren();const selected=pending.filter(x=>filter==='todos'||String(x.data.salao)===filter);if(!selected.length){list.innerHTML='<div class="card muted">Nenhuma solicitação pendente neste salão.</div>';return;}for(const c of selected){const d=c.data;const el=document.createElement('article');el.className='card call';const when=d.criadoEm?.toDate?.();el.innerHTML=`<div class="call-head"><div><div class="eyebrow">Salão ${escapeHTML(d.salao)}</div><h2>Mesa ${escapeHTML(d.numero)}</h2></div><span class="pill">Pendente</span></div><p>${d.tipo==='conta'?'🧾 Solicitar Conta':'🔔 Solicitar Garçom'}</p><p class="muted small">${when?when.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):'Agora'}</p>`;const btn=document.createElement('button');btn.className='secondary';btn.textContent='✓ Marcar como atendido';btn.onclick=async()=>{btn.disabled=true;try{await updateDoc(doc(db,'chamados',c.id),{status:'atendido'})}catch(e){err.textContent='Não foi possível concluir: '+e.code;btn.disabled=false}};el.append(btn);list.append(el)}}
let db,auth,doc,updateDoc,collection,query,where,onSnapshot,setDoc,getDoc,serverTimestamp,deleteDoc;
try{
 ({db,auth}=await import('./firebase.js'));
 ({doc,updateDoc,collection,query,where,onSnapshot,setDoc,getDoc,serverTimestamp,deleteDoc}=await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js'));
 const {signInWithEmailAndPassword,onAuthStateChanged,signOut}=await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js');
 $('loginForm').onsubmit=async e=>{e.preventDefault();await enableSound();$('loginErro').textContent='';try{await signInWithEmailAndPassword(auth,$('email').value,$('senha').value)}catch(e){$('loginErro').textContent='Não foi possível entrar. Confira e-mail e senha.'}};
 $('sair').onclick=()=>signOut(auth);
 $('mesaForm').onsubmit=async e=>{e.preventDefault();const numero=$('numero').value.trim(),salao=Number($('salao').value),msg=$('mesaMsg');if(!/^\d{1,4}$/.test(numero)||!Number.isInteger(salao)||salao<1||salao>99){msg.textContent='Informe número e salão válidos.';return;}const bytes=new Uint8Array(18);crypto.getRandomValues(bytes);const token=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');try{await setDoc(doc(db,'mesas',token),{numero,salao,ativa:true,criadaEm:serverTimestamp()});const url=new URL('./index.html',location.href);url.searchParams.set('mesa',token);const result=$('resultado');result.replaceChildren();const p=document.createElement('p');p.textContent='Link exclusivo da mesa:';const a=document.createElement('a');a.href=url.href;a.textContent=url.href;a.target='_blank';a.rel='noopener';const box=document.createElement('div');box.className='linkbox';box.append(a);const copy=document.createElement('button');copy.className='secondary';copy.style.marginTop='10px';copy.textContent='Copiar link';copy.onclick=async()=>{await navigator.clipboard.writeText(url.href);copy.textContent='Copiado!'};result.append(p,box,copy);msg.className='notice ok';msg.textContent='Mesa cadastrada com sucesso.';$('mesaForm').reset()}catch(e){msg.className='notice';msg.textContent='Falha ao cadastrar: '+e.code;console.error(e)}};
 $('funcForm').onsubmit=async e=>{e.preventDefault();const nome=$('funcNome').value.trim(),uid=$('funcUid').value.trim(),msg=$('funcMsg');if(!nome||!/^[A-Za-z0-9_-]{15,128}$/.test(uid)){msg.textContent='Informe nome e UID válido.';return;}try{await setDoc(doc(db,'funcionarios',uid),{nome,papel:'garcom',ativo:true,criadoEm:serverTimestamp()});msg.className='notice ok';msg.textContent='Funcionário autorizado. Ele já pode entrar com seu e-mail e senha do Firebase.';$('funcForm').reset()}catch(e){msg.className='notice';msg.textContent='Falha ao autorizar: '+e.code;console.error(e)}};
 onAuthStateChanged(auth,async user=>{unsubscribe();unsubscribeMesas();unsubscribeFuncs();seen=null;allCalls=[];err.textContent='';$('login').classList.toggle('hidden',!!user);$('workspace').classList.toggle('hidden',!user);if(!user){soundEnabled=false;showSoundState();return;}switchPage('home');if(!soundEnabled)enableSound();
  const adminRef=doc(db,'funcionarios',user.uid);try{const s=await getDoc(adminRef);isAdmin=s.exists()&&s.data().papel==='admin'&&s.data().ativo===true}catch(e){isAdmin=false}
  $('adminOnly').classList.toggle('hidden',!isAdmin);$('notAdmin').classList.toggle('hidden',isAdmin);
  const q=query(collection(db,'chamados'),where('status','==','pendente'));
  unsubscribe=onSnapshot(q,s=>{const ids=new Set(s.docs.map(d=>d.id));if(seen){const novos=s.docs.filter(d=>!seen.has(d.id));for(const d of novos)beep(d.data().tipo==='conta'?'conta':'garcom');}seen=ids;allCalls=s.docs.map(d=>({id:d.id,data:d.data()})).sort((a,b)=>(a.data.criadoEm?.seconds||0)-(b.data.criadoEm?.seconds||0));$('conexao').textContent='● Atualizado em tempo real';renderCalls()},e=>{err.textContent='Sem permissão para visualizar chamados: '+e.code;$('conexao').textContent='Sem conexão com os chamados'});
  if(isAdmin){
   unsubscribeMesas=onSnapshot(collection(db,'mesas'),s=>{
    const box=$('mesasLista');box.replaceChildren();
    if(s.empty){box.textContent='Nenhuma mesa cadastrada.';return;}
    const entries=s.docs.sort((a,b)=>Number(a.data().numero)-Number(b.data().numero));
    for(const d of entries){const v=d.data(),row=document.createElement('div');row.className='item management-item';
     const info=document.createElement('div');info.className='item-detail';const title=document.createElement('strong');title.textContent=`Mesa ${v.numero} · Salão ${v.salao}`;const status=document.createElement('span');status.className=v.ativa?'status-active':'status-inactive';status.textContent=v.ativa?'Ativa':'Desativada';info.append(title,status);
     const actions=document.createElement('div');actions.className='item-actions';
     const link=document.createElement('button');link.className='secondary tiny';link.textContent='Copiar link';link.onclick=async()=>{const u=new URL('./index.html',location.href);u.searchParams.set('mesa',d.id);try{await navigator.clipboard.writeText(u.href);link.textContent='Copiado!'}catch{prompt('Copie o link da mesa:',u.href)}};
     const edit=document.createElement('button');edit.className='secondary tiny';edit.textContent='Editar';edit.onclick=async()=>{const n=prompt('Número da mesa:',v.numero);if(n===null)return;const sal=prompt('Número do salão:',v.salao);if(sal===null)return;if(!/^\d{1,4}$/.test(n.trim())||!Number.isInteger(Number(sal))||Number(sal)<1||Number(sal)>99){alert('Informe número de mesa (1 a 4 dígitos) e salão de 1 a 99.');return;}try{await updateDoc(doc(db,'mesas',d.id),{numero:n.trim(),salao:Number(sal)});}catch(e){alert('Não foi possível editar: '+e.code)}};
     const toggle=document.createElement('button');toggle.className='secondary tiny';toggle.textContent=v.ativa?'Desativar':'Ativar';toggle.onclick=async()=>{if(!confirm(`${v.ativa?'Desativar':'Ativar'} a mesa ${v.numero}?`))return;try{await updateDoc(doc(db,'mesas',d.id),{ativa:!v.ativa})}catch(e){alert('Falha ao alterar mesa: '+e.code)}};
     const open=document.createElement('button');open.className='secondary tiny';open.textContent='Abrir página';open.title='Abrir a página real desta mesa para testar chamados';open.onclick=()=>{const u=new URL('./index.html',location.href);u.searchParams.set('mesa',d.id);window.open(u.href,'_blank','noopener')};
     const remove=document.createElement('button');
     remove.className='secondary tiny danger-action';
     remove.textContent='Excluir mesa';
     remove.title='Excluir definitivamente esta mesa';
     remove.onclick=async()=>{
       if(allCalls.some(c=>c.data.mesaId===d.id&&c.data.status==='pendente')){
         alert('Esta mesa possui chamados pendentes. Marque-os como atendidos antes de excluir.');return;
       }
       if(!confirm(`Excluir definitivamente a Mesa ${v.numero} do Salão ${v.salao}?\n\nO QR Code e NFC desta mesa deixarão de funcionar. Esta ação não pode ser desfeita.`))return;
       remove.disabled=true;
       remove.textContent='Excluindo...';
       try{
         await deleteDoc(doc(db,'mesas',d.id));
       }catch(e){
         alert('Não foi possível excluir a mesa: '+(e.code||e.message));
         remove.disabled=false;
         remove.textContent='Excluir mesa';
       }
     };
     actions.append(open,link,edit,toggle,remove);row.append(info,actions);box.append(row);
    }
   },e=>$('mesasLista').textContent='Erro ao listar mesas: '+e.code);
   unsubscribeFuncs=onSnapshot(collection(db,'funcionarios'),s=>{
    const box=$('funcLista');box.replaceChildren();if(s.empty){box.textContent='Nenhum funcionário cadastrado.';return;}
    for(const d of s.docs){const v=d.data(),row=document.createElement('div');row.className='item management-item';const info=document.createElement('div');info.className='item-detail';const title=document.createElement('strong');title.textContent=v.nome||'Sem nome';const status=document.createElement('span');status.className=v.ativo?'status-active':'status-inactive';status.textContent=`${v.papel||'garcom'} · ${v.ativo?'Ativo':'Desativado'}`;info.append(title,status);
     const actions=document.createElement('div');actions.className='item-actions';const edit=document.createElement('button');edit.className='secondary tiny';edit.textContent='Editar';edit.onclick=async()=>{const nome=prompt('Nome do funcionário:',v.nome||'');if(nome===null)return;if(!nome.trim()){alert('Informe o nome.');return;}try{await updateDoc(doc(db,'funcionarios',d.id),{nome:nome.trim()})}catch(e){alert('Falha ao editar: '+e.code)}};actions.append(edit);
     if(d.id!==auth.currentUser?.uid&&v.papel!=='admin'){const toggle=document.createElement('button');toggle.className='secondary tiny';toggle.textContent=v.ativo?'Desativar':'Ativar';toggle.onclick=async()=>{if(!confirm(`${v.ativo?'Desativar':'Ativar'} o acesso de ${v.nome||'este funcionário'}?`))return;try{await updateDoc(doc(db,'funcionarios',d.id),{ativo:!v.ativo})}catch(e){alert('Falha ao alterar acesso: '+e.code)}};actions.append(toggle)}
     row.append(info,actions);box.append(row);
    }
   },e=>$('funcLista').textContent='Erro ao listar funcionários: '+e.code);
  }
 });
}catch(e){$('loginErro').textContent=e.message;console.error(e)}

// Reorganização de widgets: armazenamento local, sem modificar dados do Firebase.
(function setupWidgets(){
 const board=document.getElementById('widgetBoard');if(!board)return;
 const storageKey='chamagarcom-widgets-v1';
 try{const order=JSON.parse(localStorage.getItem(storageKey)||'[]');for(const key of order){const el=[...board.children].find(x=>x.dataset.widget===key);if(el)board.append(el)}}catch{}
 const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify([...board.children].map(x=>x.dataset.widget)))}catch{}};
 board.addEventListener('click',e=>{const btn=e.target.closest('.move-widget');if(!btn)return;const card=btn.closest('.widget-card');if(btn.dataset.direction==='up'&&card.previousElementSibling)board.insertBefore(card,card.previousElementSibling);if(btn.dataset.direction==='down'&&card.nextElementSibling)board.insertBefore(card.nextElementSibling,card);save()});
 let dragging=null;
 board.querySelectorAll('.drag-handle').forEach(handle=>{
  handle.addEventListener('dragstart',e=>{dragging=handle.closest('.widget-card');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',dragging.dataset.widget);dragging.classList.add('dragging')});
  handle.addEventListener('dragend',()=>{dragging?.classList.remove('dragging');dragging=null;save()});
 });
 board.addEventListener('dragover',e=>{if(!dragging)return;e.preventDefault();const target=e.target.closest('.widget-card');if(!target||target===dragging)return;const r=target.getBoundingClientRect();board.insertBefore(dragging,e.clientY<r.top+r.height/2?target:target.nextSibling)});
 board.addEventListener('drop',e=>{if(dragging){e.preventDefault();save()}});
})();
