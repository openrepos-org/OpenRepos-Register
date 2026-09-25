# <img src="./assets/logo.svg" width="28" height="28" alt="OpenRepos logo" /> OpenRepos Register

[English](./README.md) · [简体中文](./README.zh-CN.md) · [日本語](./README.ja.md) · [العربية](./README.ar.md) · **Español** · [Português](./README.pt.md)

Consigue un **subdominio gratuito para tu proyecto de código abierto** en uno de los dominios
de OpenRepos. Gratis para siempre y con una gestión cuidadosa a largo plazo.

- Sitio web: **https://openrepos.org/** — los otros seis dominios redirigen aquí
- Todas las solicitudes viven en un solo archivo: [`register.json`](./register.json)
- Ejemplo: `awesome-project.openrepos.org` → el sitio de tu proyecto

## Dominios

| Dominio          | Sitio web                   |
| ---------------- | --------------------------- |
| `openrepos.io`   | https://openrepos.io/       |
| `openrepos.org`  | https://openrepos.org/      |
| `openrepos.sh`   | https://openrepos.sh/       |
| `repos.one`      | https://repos.one/          |
| `sourcepage.io`  | https://sourcepage.io/      |
| `sourcepage.org` | https://sourcepage.org/     |
| `sourcepage.sh`  | https://sourcepage.sh/      |

## Reglas

1. **Gratis para siempre**, solo para proyectos de código abierto (repositorio público de GitHub
   con LICENSE).
2. **Debes ser el propietario del repositorio** o miembro de la organización que lo posee.
   CI lo verifica a partir del autor del pull request.
3. **Un subdominio por proyecto, en un solo dominio**: un proyecto no puede reclamarse en más de
   un dominio de OpenRepos.
4. Nombres de subdominio: 3–63 caracteres, solo `a-z`, `0-9`, `-` en minúsculas; no puede empezar
   ni terminar con `-`.
5. Los nombres reservados no se pueden reclamar — consulta [`reserved.json`](./reserved.json).
6. El destino debe ser uno de los proveedores de hosting permitidos (ver abajo); los destinos
   personalizados requieren aprobación del mantenedor.
7. **Añade el badge de OpenRepos al README de tu proyecto**: se comprueba automáticamente en cada
   solicitud nueva (ver [Añadir el badge](#añadir-el-badge)).
8. Eres responsable del contenido servido en tu subdominio. Reglas de contenido: solo contenido
   sobre tu proyecto de código abierto, sin redirecciones automáticas, sin contenido NSFW/para
   adultos. Los subdominios abusivos pueden eliminarse.

## Cómo reclamar

1. Elige un dominio y un subdominio libre, por ejemplo `awesome-project.openrepos.org`.
2. Edita [`register.json`](./register.json) y añade tu entrada bajo el dominio elegido:

   ```json
   "openrepos.org": {
     "awesome-project": {
       "repo": "https://github.com/octocat/awesome-project",
       "target": "octocat.github.io"
     }
   }
   ```

3. Añade el badge de OpenRepos al README de tu proyecto ([Añadir el badge](#añadir-el-badge)).
4. Abre un pull request. CI valida el nombre, los nombres reservados, los duplicados, la lista de
   destinos permitidos, la propiedad y el badge.
5. Un mantenedor revisa y fusiona el pull request. Después del merge, el DNS se configura
   automáticamente: no tienes que hacer nada más.

> Consejo: usa el botón **editar** (lápiz) de GitHub sobre `register.json`; GitHub hará un fork
> y abrirá un pull request por ti.

## Campos

El subdominio es la clave: cada entrada solo necesita dos campos:

| Campo    | Obligatorio | Descripción                                                |
| -------- | ----------- | ---------------------------------------------------------- |
| `repo`   | sí          | Repositorio público de GitHub de tu proyecto de código abierto |
| `target` | sí          | Host de destino del CNAME, p. ej. `octocat.github.io`      |

La propiedad se verifica a partir del autor del pull request, así que no hay campo `owner`.
Los registros son DNS-only, de modo que tu proveedor sirve el TLS.

## Añadir el badge

Las solicitudes nuevas deben incluir un badge de OpenRepos en el README del proyecto. El badge es
dinámico: muestra `pending` mientras se revisa y cambia automáticamente a `live` tras el merge,
sin editar el README de nuevo.

Elige cualquier [estilo de shields.io](https://shields.io) (`flat`, `flat-square`, `plastic`,
`for-the-badge`, `social`):

```markdown
[![OpenRepos](https://img.shields.io/endpoint?url=https://openrepos.org/status/awesome-project.openrepos.org.json&style=flat-square)](https://awesome-project.openrepos.org/)
```

La URL de estado siempre usa `openrepos.org`; sustituye `awesome-project` por tu subdominio y usa el dominio que reclamaste en el enlace.

Alternativa estática (sin petición dinámica; ten en cuenta que shields codifica `-` como `--`):

```markdown
[![OpenRepos](https://img.shields.io/badge/openrepos.org-awesome-project.openrepos.org-blue?style=flat-square)](https://awesome-project.openrepos.org/)
```

La URL del badge debe incluir tu subdominio exacto: CI lo comprueba y rechaza las solicitudes que
no lo tengan.

## Destinos permitidos

Los subdominios solo pueden apuntar a proveedores de hosting establecidos:

| Patrón                             | Proveedor        |
| ---------------------------------- | ---------------- |
| `*.github.io`                      | GitHub Pages     |
| `*.gitlab.io`                      | GitLab Pages     |
| `*.pages.dev`                      | Cloudflare Pages |
| `*.netlify.app`                    | Netlify          |
| `*.vercel.app`, `*.vercel-dns.com` | Vercel           |
| `*.surge.sh`                       | Surge            |
| `*.gitbook.io`, `*.gitbook.com`    | GitBook          |
| `*.alwaysdata.net`                 | Alwaysdata       |

Si tu proyecto necesita otro destino, añade el host exacto al array `custom` de
[`targets.json`](./targets.json) en el mismo pull request y explica por qué. Un mantenedor lo
revisará.

## Reglas de contenido

- Sirve contenido sobre el proyecto de código abierto reclamado; nada de contenido no relacionado.
- Sin redirecciones automáticas fuera del subdominio; las redirecciones deben requerir interacción
  del usuario.
- Sin contenido NSFW/para adultos, phishing, malware ni otros abusos.

## Qué ocurre después del merge

- Un GitHub Action crea o actualiza el registro CNAME `<subdomain>.<domain> → <target>`
  (con el comentario `openrepos-register`).
- Los cambios suelen propagarse en un minuto. El registro es DNS-only, así que tu proveedor
  sirve el HTTPS.
- **Configura el dominio personalizado en tu proveedor** o el subdominio mostrará un error:
  - **GitHub Pages**: Settings del repositorio → Pages → Custom domain → añade el subdominio y activa **Enforce HTTPS**
  - **Cloudflare Pages**: proyecto → Custom domains → añade el subdominio (o usa `POST /accounts/{account_id}/pages/projects/{project}/domains`); Pages responde `522` hasta añadirlo
  - **Vercel / Netlify**: añade el dominio en los ajustes del proyecto; pueden pedir un registro TXT de verificación, que este servicio aún no admite
  - **GitLab Pages**: añade el dominio en los ajustes de Pages, pero GitLab exige un registro TXT de verificación (no admitido aún), así que hoy no puede publicarse
  - **Surge / GitBook / Alwaysdata**: añade el dominio personalizado en el panel del proveedor; no hacen falta registros extra
- Un error de TLS o un `522` suele significar que el dominio personalizado aún no está añadido en
  el proveedor.

## Eliminación y abuso

Los registros pueden eliminarse cuando un proyecto deja de ser de código abierto, queda abandonado
o se usa para abuso. Para reportar abuso o pedir una eliminación, abre un issue en este repositorio.

## Estructura del repositorio

```
.
├── register.json                    # todas las solicitudes (dominio → subdominio → entrada)
├── domains.json                     # los siete dominios compatibles
├── targets.json                     # proveedores permitidos + destinos personalizados aprobados
├── reserved.json                    # nombres de subdominio reservados
├── schema/register.schema.json      # JSON Schema de register.json
├── scripts/validate.mjs             # validación de PR (nombre, duplicados, lista, propiedad, badge)
├── scripts/sync-dns.mjs             # sincronización de Cloudflare DNS (idempotente, wildcard, --prune)
└── .github/workflows/               # validate.yml / dns.yml
```

## Licencia

[MIT](./LICENSE)
