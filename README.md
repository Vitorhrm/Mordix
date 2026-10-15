# Mordix

Aplicativo acadêmico em React Native e TypeScript. A interface foi adaptada do protótipo do Figma para componentes nativos Android.

## Funcionamento atual

- Cadastro e login reais pelo Supabase Auth, com e-mail e senha.
- Cadastro com nome, sobrenome, CPF, e-mail, senha e confirmação.
- Validação de campos, formato do e-mail, dígitos do CPF e confirmação de senha.
- Sessão armazenada no armazenamento seguro do aparelho; saída da conta.
- Catálogo, carrinho, endereços, frete e cupons são demonstrações locais. Pedidos ainda não são enviados a lojas.
- Confirmação de e-mail desativada no projeto acadêmico do Supabase.

## Organização

`src/features` separa autenticação, catálogo, carrinho e perfil. `src/services` concentra Supabase e armazenamento seguro. `src/components` reúne componentes de interface; `src/navigation`, as rotas; `src/theme`, as cores; e `src/utils`, os formatadores.

## Desenvolvimento

Instale Node.js e pnpm. Execute `pnpm install`, `pnpm run typecheck` e `pnpm test` na raiz do projeto. `pnpm run android` compila a versão de desenvolvimento e inicia o Metro. `pnpm run build:android` compila e instala a versão release.

Abra a pasta completa `MordixMobile` no Android Studio. O Gradle da subpasta `android` está vinculado à IDE e a configuração de execução se chama `Mordix`. Use a visualização `Project` para ver o código React. Em `Build Variants`, a variante `release` permite compilar e executar sem Metro; para desenvolvimento com `debug`, execute `pnpm start` antes.

O Node.js precisa estar no PATH do processo da IDE. Neste computador ele está no runtime do Codex; se a IDE informar que não encontra `node`, abra-a a partir de um ambiente que tenha Node no PATH ou instale Node.js normalmente.

Copie `.env.example` para `.env` e preencha a URL e a chave pública do seu projeto Supabase antes de executar ou compilar. O `.env` real fica fora do Git.

O arquivo `.env` contém somente a URL e a chave pública do Supabase. Nunca coloque senha do banco, chave secreta ou service role no aplicativo. A senha do usuário é enviada ao Supabase Auth e não é salva pelo aplicativo.

O APK acadêmico utiliza a chave de assinatura de desenvolvimento. Uma publicação futura exigirá chave própria e configuração de distribuição.
