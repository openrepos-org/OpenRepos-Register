# <img src="./assets/logo.svg" width="28" height="28" alt="OpenRepos logo" /> OpenRepos Register

[English](./README.md) · [简体中文](./README.zh-CN.md) · [日本語](./README.ja.md) · [العربية](./README.ar.md) · [Español](./README.es.md) · **Português**

Garanta um **subdomínio gratuito para o seu projeto de código aberto** em um dos domínios da
OpenRepos. Gratuito para sempre, com gestão cuidadosa de longo prazo.

- Site: **https://openrepos.org/** (também em `openrepos.io`, `openrepos.sh`, `repos.one`,
  `sourcepage.io`, `sourcepage.org`, `sourcepage.sh`)
- Todos os pedidos ficam em um único arquivo: [`register.json`](./register.json)
- Exemplo: `awesome-project.openrepos.org` → o site do seu projeto

## Domínios

| Domínio          | Site                        |
| ---------------- | --------------------------- |
| `openrepos.io`   | https://openrepos.io/       |
| `openrepos.org`  | https://openrepos.org/      |
| `openrepos.sh`   | https://openrepos.sh/       |
| `repos.one`      | https://repos.one/          |
| `sourcepage.io`  | https://sourcepage.io/      |
| `sourcepage.org` | https://sourcepage.org/     |
| `sourcepage.sh`  | https://sourcepage.sh/      |

## Regras

1. **Gratuito para sempre**, apenas para projetos de código aberto (repositório público no GitHub
   com LICENSE).
2. **Você deve ser o dono do repositório do projeto** ou membro da organização que o possui.
   O CI verifica isso pelo autor do pull request.
3. **Um subdomínio por projeto, em apenas um domínio** — um projeto não pode ser reivindicado em
   mais de um domínio da OpenRepos.
4. Nomes de subdomínio: 3–63 caracteres, apenas `a-z`, `0-9`, `-` em minúsculas; não pode começar
   nem terminar com `-`.
5. Nomes reservados não podem ser reivindicados — veja [`reserved.json`](./reserved.json).
6. O destino deve ser um dos provedores de hospedagem permitidos (veja abaixo); destinos
   personalizados precisam de aprovação do mantenedor.
7. **Adicione o badge da OpenRepos ao README do projeto** — ele é verificado automaticamente em
   cada novo pedido (veja [Adicionar o badge](#adicionar-o-badge)).
8. Você é responsável pelo conteúdo servido no seu subdomínio. Regras de conteúdo: apenas conteúdo
   sobre o projeto de código aberto, sem redirecionamentos automáticos, sem conteúdo NSFW/adulto.
   Subdomínios abusivos podem ser removidos.

## Como reivindicar

1. Escolha um domínio e um subdomínio livre, por exemplo `awesome-project.openrepos.org`.
2. Edite o [`register.json`](./register.json) e adicione sua entrada sob o domínio escolhido:

   ```json
   "openrepos.org": {
     "awesome-project": {
       "repo": "https://github.com/octocat/awesome-project",
       "target": "octocat.github.io"
     }
   }
   ```

3. Adicione o badge da OpenRepos ao README do projeto ([Adicionar o badge](#adicionar-o-badge)).
4. Abra um pull request. O CI valida nome, nomes reservados, duplicatas, a lista de destinos
   permitidos, a propriedade e o badge.
5. Um mantenedor revisa e faz o merge. Depois do merge, o DNS é provisionado automaticamente —
   nenhuma ação adicional sua.

> Dica: use o botão **editar** (lápis) do GitHub no `register.json`; o GitHub faz um fork e abre
> um pull request para você.

## Campos

O subdomínio é a chave — cada entrada precisa apenas de dois campos:

| Campo    | Obrigatório | Descrição                                                   |
| -------- | ----------- | ----------------------------------------------------------- |
| `repo`   | sim         | Repositório público no GitHub do seu projeto de código aberto |
| `target` | sim         | Host de destino do CNAME, ex. `octocat.github.io`           |

A propriedade é verificada pelo autor do pull request, então não existe campo `owner`.
Os registros são DNS-only, e o provedor de hospedagem fornece o TLS.

## Adicionar o badge

Novos pedidos devem incluir um badge da OpenRepos no README do projeto. O badge é dinâmico:
mostra `pending` durante a revisão e muda automaticamente para `live` após o merge — sem editar o
README depois.

Escolha qualquer [estilo do shields.io](https://shields.io) (`flat`, `flat-square`, `plastic`,
`for-the-badge`, `social`):

```markdown
[![OpenRepos](https://img.shields.io/endpoint?url=https://openrepos.org/status/awesome-project.openrepos.org.json&style=flat-square)](https://awesome-project.openrepos.org/)
```

Substitua `openrepos.org` pelo domínio reivindicado e `awesome-project` pelo seu subdomínio.

Alternativa estática (sem requisição dinâmica; observe que o shields codifica `-` como `--`):

```markdown
[![OpenRepos](https://img.shields.io/badge/openrepos.org-awesome-project.openrepos.org-blue?style=flat-square)](https://awesome-project.openrepos.org/)
```

A URL do badge deve conter o seu subdomínio exato — o CI verifica e rejeita pedidos sem ele.

## Destinos permitidos

Os subdomínios só podem apontar para provedores de hospedagem estabelecidos:

| Padrão                             | Provedor         |
| ---------------------------------- | ---------------- |
| `*.github.io`                      | GitHub Pages     |
| `*.gitlab.io`                      | GitLab Pages     |
| `*.pages.dev`                      | Cloudflare Pages |
| `*.netlify.app`                    | Netlify          |
| `*.vercel.app`, `*.vercel-dns.com` | Vercel           |
| `*.surge.sh`                       | Surge            |
| `*.gitbook.io`, `*.gitbook.com`    | GitBook          |
| `*.alwaysdata.net`                 | Alwaysdata       |

Se o seu projeto precisa de outro destino, adicione o host exato ao array `custom` do
[`targets.json`](./targets.json) no mesmo pull request e explique o motivo. Um mantenedor vai
revisar.

## Regras de conteúdo

- Sirva conteúdo sobre o projeto de código aberto reivindicado — nada de conteúdo não relacionado.
- Sem redirecionamentos automáticos para fora do subdomínio; redirecionamentos exigem interação do
  usuário.
- Sem conteúdo NSFW/adulto, phishing, malware ou outros abusos.

## O que acontece após o merge

- Um GitHub Action cria ou atualiza o registro CNAME `<subdomain>.<domain> → <target>`
  (com o comentário `openrepos-register`).
- As mudanças geralmente propagam em um minuto. O registro é DNS-only, então o seu provedor
  fornece o HTTPS.
- **Configure o domínio personalizado no provedor**, senão o subdomínio mostrará erro:
  - **GitHub Pages**: Settings do repositório → Pages → Custom domain → adicione o subdomínio
  - **Cloudflare Pages**: projeto → Custom domains → adicione o subdomínio
  - **Vercel / Netlify**: adicione o domínio ao projeto
- Um erro de TLS ou `522` geralmente significa que o domínio personalizado ainda não foi
  adicionado no provedor.

## Remoção e abuso

Registros podem ser removidos quando um projeto deixa de ser de código aberto, é abandonado ou é
usado para abuso. Para reportar abuso ou pedir remoção, abra uma issue neste repositório.

## Estrutura do repositório

```
.
├── register.json                    # todos os pedidos (domínio → subdomínio → entrada)
├── domains.json                     # os sete domínios suportados
├── targets.json                     # provedores permitidos + destinos personalizados aprovados
├── reserved.json                    # nomes de subdomínio reservados
├── schema/register.schema.json      # JSON Schema do register.json
├── scripts/validate.mjs             # validação de PR (nome, duplicatas, lista, propriedade, badge)
├── scripts/sync-dns.mjs             # sincronização do Cloudflare DNS (idempotente, wildcard, --prune)
└── .github/workflows/               # validate.yml / dns.yml
```

## Licença

[MIT](./LICENSE)
