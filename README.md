# Mordix

Protótipo acadêmico de delivery para Android, implementado com React Native, Expo e TypeScript a partir de um protótipo no Figma.

## O que funciona

- Cadastro e login por e-mail e senha com Supabase Auth.
- Validação de formulário, incluindo formato de e-mail, dígitos do CPF e confirmação de senha.
- Persistência de sessão no armazenamento seguro do aparelho e saída da conta.
- Catálogo, carrinho, endereços, frete e cupons com dados locais de demonstração. O fluxo de pedidos a lojas está fora do protótipo atual.

## Executar no Android

Instale Node.js, pnpm e configure o Android Studio com um emulador ou dispositivo físico. Na raiz do repositório, execute:

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.example .env
```

Preencha `.env` com a URL e a chave pública do seu projeto Supabase, habilite autenticação por e-mail e rode `pnpm run android`. Use dados fictícios para experimentar o cadastro. Configure a confirmação de e-mail conforme o ambiente de teste.

## Verificar mudanças

```sh
pnpm run typecheck
pnpm test
```

`src/features` reúne os fluxos do aplicativo, `src/services` concentra Supabase e armazenamento seguro, e `src/navigation` define as rotas. O projeto usa a licença [MIT](LICENSE).
