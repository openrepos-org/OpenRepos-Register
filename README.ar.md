# <img src="./assets/logo.svg" width="28" height="28" alt="OpenRepos logo" /> OpenRepos Register

[English](./README.md) · [简体中文](./README.zh-CN.md) · [日本語](./README.ja.md) · **العربية** · [Español](./README.es.md) · [Português](./README.pt.md)

احصل على **نطاق فرعي مجاني لمشروعك مفتوح المصدر** على أحد نطاقات OpenRepos.
مجاني للأبد، وتُدار النطاقات على المدى الطويل بعناية.

- الموقع: **https://openrepos.org/** — تُعيد النطاقات الستة الأخرى التوجيه إلى هذا الموقع
- جميع الطلبات في ملف واحد: [`register.json`](./register.json)
- مثال: `awesome-project.openrepos.org` ← موقع مشروعك

## النطاقات

| النطاق           | الموقع                     |
| ---------------- | -------------------------- |
| `openrepos.io`   | https://openrepos.io/      |
| `openrepos.org`  | https://openrepos.org/     |
| `openrepos.sh`   | https://openrepos.sh/      |
| `repos.one`      | https://repos.one/         |
| `sourcepage.io`  | https://sourcepage.io/     |
| `sourcepage.org` | https://sourcepage.org/    |
| `sourcepage.sh`  | https://sourcepage.sh/     |

## القواعد

1. **مجاني للأبد**، لمشاريع مفتوحة المصدر فقط (مستودع GitHub عام يتضمن LICENSE).
2. **يجب أن تملك مستودع المشروع** أو أن تكون عضوًا في المنظمة المالكة له. يتحقق CI من ذلك
   عبر مؤلف طلب السحب (Pull Request).
3. **نطاق فرعي واحد لكل مشروع، على نطاق واحد فقط** — لا يمكن حجز المشروع على أكثر من نطاق.
4. أسماء النطاقات الفرعية: 3–63 حرفًا، أحرف صغيرة `a-z` والأرقام `0-9` والشرطة `-` فقط،
   دون بدء أو انتهاء بشرطة.
5. الأسماء المحجوزة غير متاحة — انظر [`reserved.json`](./reserved.json).
6. يجب أن يشير الهدف إلى مزوّد استضافة مسموح (انظر أدناه)؛ الأهداف المخصّصة تحتاج موافقة المشرف.
7. **أضف شارة OpenRepos إلى ملف README لمشروعك** — يتحقق منها CI تلقائيًا لكل طلب جديد
   (انظر [إضافة الشارة](#إضافة-الشارة)).
8. أنت مسؤول عن المحتوى المنشور على نطاقك الفرعي. قواعد المحتوى: محتوى متعلق بالمشروع فقط،
   لا إعادة توجيه تلقائية، ولا محتوى NSFW/للبالغين. قد تُزال النطاقات المسيئة.

## كيفية الحجز

1. اختر نطاقًا ونطاقًا فرعيًا متاحًا، مثل `awesome-project.openrepos.org`.
2. عدّل [`register.json`](./register.json) وأضف المدخل تحت النطاق المختار:

   ```json
   "openrepos.org": {
     "awesome-project": {
       "repo": "https://github.com/octocat/awesome-project",
       "target": "octocat.github.io"
     }
   }
   ```

3. أضف شارة OpenRepos إلى README المشروع ([إضافة الشارة](#إضافة-الشارة)).
4. افتح طلب سحب (Pull Request). يتحقق CI من التسمية والأسماء المحجوزة والتكرار وقائمة
   المزوّدين المسموحين والملكية والشارة.
5. يراجع المشرف الطلب ويدمجه. بعد الدمج يُهيّأ DNS تلقائيًا دون أي إجراء إضافي منك.

> نصيحة: استخدم زر **التحرير** (القلم) على `register.json` في GitHub؛ سيقوم GitHub بعمل fork
> وفتح طلب سحب نيابةً عنك.

## الحقول

النطاق الفرعي هو المفتاح، وكل مدخل يحتاج حقلين فقط:

| الحقل    | مطلوب | الوصف                                                |
| -------- | ----- | ---------------------------------------------------- |
| `repo`   | نعم   | مستودع GitHub العام لمشروعك مفتوح المصدر             |
| `target` | نعم   | مضيف CNAME الهدف، مثل `octocat.github.io`            |

تُتحقق الملكية من مؤلف طلب السحب، لذا لا يوجد حقل `owner`. السجلات DNS-only، ويتولى مزوّد
الاستضافة شهادة TLS.

## إضافة الشارة

يجب أن يتضمن كل طلب جديد شارة OpenRepos في README المشروع. الشارة ديناميكية: تظهر `pending`
أثناء المراجعة وتتحول تلقائيًا إلى `live` بعد الدمج، دون تعديل README لاحقًا.

اختر أي نمط من [shields.io](https://shields.io) (`flat`، `flat-square`، `plastic`،
`for-the-badge`، `social`):

```markdown
[![OpenRepos](https://img.shields.io/endpoint?url=https://openrepos.org/status/awesome-project.openrepos.org.json&style=flat-square)](https://awesome-project.openrepos.org/)
```

يستخدم رابط الحالة دائمًا `openrepos.org`؛ استبدل `awesome-project` بنطاقك الفرعي، واستخدم النطاق الذي حجزته في الرابط.

بديل ثابت (بدون طلب ديناميكي؛ لاحظ أن shields يرمّز `-` كـ `--`):

```markdown
[![OpenRepos](https://img.shields.io/badge/openrepos.org-awesome-project.openrepos.org-blue?style=flat-square)](https://awesome-project.openrepos.org/)
```

يجب أن يتضمن رابط الشارة نطاقك الفرعي بالضبط — يتحقق CI من ذلك ويرفض الطلبات بدونه.

## الأهداف المسموح بها

يمكن توجيه النطاقات الفرعية إلى مزوّدي الاستضافة التاليين فقط:

| النمط                              | المزوّد          |
| ---------------------------------- | ---------------- |
| `*.github.io`                      | GitHub Pages     |
| `*.gitlab.io`                      | GitLab Pages     |
| `*.pages.dev`                      | Cloudflare Pages |
| `*.netlify.app`                    | Netlify          |
| `*.vercel.app`, `*.vercel-dns.com` | Vercel           |
| `*.surge.sh`                       | Surge            |
| `*.gitbook.io`, `*.gitbook.com`    | GitBook          |
| `*.alwaysdata.net`                 | Alwaysdata       |

إذا احتاج مشروعك هدفًا مختلفًا، أضف اسم المضيف بالضبط إلى مصفوفة `custom` في
[`targets.json`](./targets.json) في نفس طلب السحب مع ذكر السبب، وسيراجعه المشرف.

## قواعد المحتوى

- محتوى متعلق بالمشروع مفتوح المصدر المحجوز فقط — لا محتوى غير ذي صلة.
- لا إعادة توجيه تلقائية بعيدًا عن النطاق الفرعي؛ يجب أن تتطلب إعادة التوجيه تفاعل المستخدم.
- لا محتوى NSFW/للبالغين، ولا تصيّد، ولا برمجيات خبيثة، ولا أي إساءة أخرى.

## ما يحدث بعد الدمج

- ينشئ GitHub Action سجل CNAME أو يحدّثه: `<subdomain>.<domain> → <target>`
  (بوسم `openrepos-register`).
- تنتشر التغييرات عادةً خلال دقيقة. السجل DNS-only، لذا يقدّم مزوّد الاستضافة HTTPS.
- **اضبط النطاق المخصّص لدى مزوّد الاستضافة** وإلا سيظهر خطأ:
  - **GitHub Pages**: إعدادات المستودع → Pages → Custom domain → أضف النطاق الفرعي ثم فعّل **Enforce HTTPS**
  - **Cloudflare Pages**: المشروع → Custom domains → أضف النطاق الفرعي (أو عبر API `POST /accounts/{account_id}/pages/projects/{project}/domains`)؛ سيعيد `522` حتى إضافته
  - **Vercel / Netlify**: أضف النطاق في إعدادات المشروع؛ قد يطلبان سجل TXT للتحقق، وهو غير مدعوم حاليًا
  - **GitLab Pages**: أضف النطاق في إعدادات Pages، لكن GitLab يتطلب سجل TXT للتحقق (غير مدعوم حاليًا)، لذا لا يمكن النشر عليه الآن
  - **Surge / GitBook / Alwaysdata**: أضف النطاق المخصّص من لوحة المزوّد؛ لا حاجة لسجلات إضافية
- خطأ TLS أو الرمز `522` يعني عادةً أن النطاق المخصّص لم يُضف لدى المزوّد بعد.

## الإزالة والإساءة

قد تُزال السجلات عندما يتوقف المشروع عن كونه مفتوح المصدر، أو يُهمل، أو يُستخدم في الإساءة.
للإبلاغ عن إساءة أو طلب الإزالة، افتح issue في هذا المستودع.

## بنية المستودع

```
.
├── register.json                    # جميع الطلبات (النطاق → النطاق الفرعي → المدخل)
├── domains.json                     # النطاقات السبعة المدعومة
├── targets.json                     # مزوّدو الاستضافة المسموحون + الأهداف المخصّصة المعتمدة
├── reserved.json                    # الأسماء المحجوزة
├── schema/register.schema.json      # مخطط JSON لـ register.json
├── scripts/validate.mjs             # تحقق PR (التسمية، التكرار، القائمة، الملكية، الشارة)
├── scripts/sync-dns.mjs             # مزامنة Cloudflare DNS (متكررة آمنة، سجلات wildcard، --prune)
└── .github/workflows/               # validate.yml / dns.yml
```

## الترخيص

[MIT](./LICENSE)
