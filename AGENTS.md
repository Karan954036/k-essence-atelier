<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- Storefront catalog resolves ordered product media into short-lived signed URLs; private storage allows visitors to read only images referenced by active products, preserving draft privacy.
- Finance features live in a dedicated module and use the authenticated RLS client with server-side admin verification; this keeps financial records isolated from privileged catalog operations.
