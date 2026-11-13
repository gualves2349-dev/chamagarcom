# Chama Garçom — interface atualizada

## Publicação
Envie todos os arquivos desta pasta para a **raiz** da branch `main` do GitHub Pages, substituindo os anteriores. `painel.html` é a central com login, Início e Cadastrar. `index.html?mesa=TOKEN` é a página da mesa.

## Firebase
O `firebase-config.js` já contém a configuração pública fornecida para o projeto `chamagarcom-fe1b1`.

1. Em Firebase Authentication habilite **E-mail/senha** e **Anônimo**.
2. Em Authentication → Usuários crie o login do administrador.
3. Em Firestore → Regras copie o conteúdo de `firestore.rules`, substitua `SUBSTITUA_UID_ADMIN` pelo UID real e publique.
4. Em Firestore → Dados crie a coleção `funcionarios` com documento ID igual ao UID do administrador e campos `nome` (string), `papel` (string, valor `admin`) e `ativo` (boolean, `true`).
5. Entre em `painel.html`. Na aba Cadastrar crie mesas e copie os links exclusivos para NFC e QR Code.
6. Para funcionários: crie as contas manualmente em Authentication → Usuários, copie o UID e use o formulário de funcionários na aba Cadastrar. O cadastro autoriza o acesso, mas **não cria o e-mail/senha automaticamente**.

## Atenção
As regras permitem chamados de usuários anônimos autenticados e não implementam limites robustos de frequência nem prevenção de spam. **Use apenas em piloto supervisionado**. Antes de produção, implemente validação/rate limit no backend, proteção contra duplicatas e monitoramento de consumo do Firebase. As regras não são proteção contra abuso de chamadas anônimas.

O painel precisa permanecer aberto e com áudio ativado para alertas sonoros. Em celulares, o navegador pode restringir áudio em segundo plano.


## Atualização v2 — Gerenciamento
- No painel, aba Cadastrar, é possível editar número/salão e ativar/desativar mesas. O identificador exclusivo do link permanece igual após edição.
- Também é possível editar o nome e ativar/desativar funcionários comuns. A conta de autenticação continua sendo criada manualmente no Firebase Authentication; desativar o cadastro não exclui a conta de autenticação.
- A URL principal sem parâmetro `?mesa=` agora mostra uma orientação, e não um erro. Para testar os botões use um link exclusivo gerado na aba Cadastrar.
- Importante: a segurança real é aplicada pelas regras publicadas no Firestore. Não substitua as regras sem preservar o UID de administrador correto. Não use em produção sem proteção adicional contra spam e abuso.


## Novidades da versão 3
- Botões de tema claro/escuro no painel, login e tela da mesa (preferência salva no navegador).
- Som com estado verde (ativo) ou vermelho (desativado) e aviso suave em dois tons. O sistema tenta habilitar o áudio no login e ao reabrir o painel, mas navegadores podem exigir um clique em **Som desativado**; não é possível garantir reprodução automática sem interação.
- Demonstração **Mesa 1 / Salão 1**: https://gualves2349-dev.github.io/chamagarcom/?demo=mesa1 . Os botões simulam respostas, sem criar chamados no Firebase.
- Para testar um chamado REAL da mesa 1, cadastre a mesa 1 no painel, copie o link exclusivo gerado e abra-o em outro dispositivo.
- Não é necessário alterar as regras do Firestore para estas mudanças de interface.


## Teste REAL da Mesa 1 (v4)
1. Entre em `painel.html` como administrador.
2. Em **Cadastrar**, cadastre **Mesa 1** no **Salão 1** (caso ainda não exista).
3. Em **Mesas cadastradas**, localize Mesa 1 e clique **Abrir página**.
4. Com `painel.html` aberto em outra aba/dispositivo, clique em **Solicitar Garçom** ou **Solicitar Conta** na página real da mesa.
5. O chamado deve aparecer no painel em tempo real. Se falhar, leia o erro no console do navegador (F12). Verifique regras Firestore, login e cadastro.

`?demo=mesa1` **não é** uma mesa cadastrada: não pode enviar chamados reais. A v4 informa isso e orienta a abrir o link exclusivo da mesa.

O botão de tema da tela de login fica oculto depois do login para não duplicar o botão do painel.

**Atenção:** as regras do Firestore contidas no ZIP têm UID de exemplo; não publique sem ajustar e revisar. O modelo de escrita anônima requer medidas adicionais contra spam para produção.
