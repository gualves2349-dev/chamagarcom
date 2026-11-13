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
