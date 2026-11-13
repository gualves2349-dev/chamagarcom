# Chama Garçom — protótipo inicial

## 1. Criar o projeto
Crie projeto Firebase e aplicativo Web em Configurações do projeto > Seus apps. Copie as propriedades `apiKey`, `authDomain`, `projectId`, `appId` para `firebase-config.js`.

## 2. Autenticação
Em Authentication > Sign-in method habilite **Anônimo** (para clientes) e **E-mail/senha** (para funcionários). Em Authentication > Users crie os usuários de administrador e funcionário. Copie seus UIDs.

## 3. Firestore
Crie Firestore Database (modo produção). Na aba Regras, cole `firestore.rules` e substitua `SUBSTITUA_UID_ADMIN` e `SUBSTITUA_UID_FUNCIONARIO` pelos UIDs de usuários autorizados. Publique as regras. Não deixe as regras de teste abertas.

## 4. GitHub Pages
Crie repositório público `chama-garcom`. Envie TODOS os arquivos desta pasta na raiz. Vá a Settings > Pages > Deploy from a branch > main > /(root) > Save. Se a branch não aparecer, primeiro faça o commit dos arquivos e atualize a página. Aguarde a URL de publicação.

## 5. Teste
Abra `admin.html`, faça login como administrador, cadastre a mesa e copie o link exclusivo. Abra o link em um navegador anônimo ou outro aparelho. Em `painel.html`, faça login como funcionário, clique Ativar som e faça o chamado no aparelho do cliente.

## Avisos importantes
- Protótipo, não indicado para uso comercial sem reforço de segurança, testes de carga e prevenção de abuso.
- O Firebase Anonymous Auth cria uma identidade temporária por navegador. O sistema NÃO impede que alguém com o link público envie chamadas repetidas usando identidades diferentes; o limite de frequência precisa de validação no servidor para produção.
- O cliente consulta somente os próprios chamados (mesma identidade anônima). Funcionários autorizados consultam todos.
- A autenticação de funcionário depende das regras de segurança com UIDs corretos.
- A consulta de chamados pendentes pode solicitar a criação de um índice composto no Firestore; siga o link apresentado no console se ocorrer esse erro.
- O áudio só funciona depois da interação do funcionário com o botão Ativar som e enquanto a página estiver aberta e permitida pelo navegador.
- Para isolamento de múltiplos restaurantes, evoluir para projeto multiestabelecimento com regras específicas.
- A configuração Web do Firebase não é senha secreta, mas jamais coloque senhas privadas ou credenciais administrativas no repositório.


## Correção GitHub Pages
O arquivo firebase-config.js exporta firebaseConfig e firebaseReady; firebase.js importa o SDK diretamente da CDN do Google. Não substitua firebase-config.js pelo exemplo do console Firebase com import de firebase/app.

## Segurança antes de uso real
As regras firestore.rules fornecidas são um protótipo. Elas não implementam limite de frequência robusto por mesa, e permitem a usuários autenticados consultar IDs conhecidos de mesas. Não implante em operação comercial sem proteção contra abuso no servidor. Configure UIDs autorizados em firestore.rules e publique no console Firestore > Regras.
