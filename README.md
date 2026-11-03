# No Worktrees: an Orca plugin

This plugin stops Orca from creating Git worktrees. You work in each project's main checkout (the
**Default branch** row in the sidebar) and open as many terminal or agent tabs there as you like.
It is a workaround for [stablyai/orca#13846](https://github.com/stablyai/orca/issues/13846) until
Orca ships a setting of its own.

## How it works

Orca calls the `workspace.create.before` plugin hook before it creates any workspace
(`src/main/plugins/hooks/workspace-create-plugin-hook.ts`). For Git worktrees, this plugin returns
`{ deny }`. Orca then refuses the request, shows the reason, and creates nothing on disk. The hook
covers every way a worktree gets made: the sidebar, the composer, the CLI, automations and
orchestration. Folder workspaces still pass, because they never create a checkout.

## Install

Requires Orca **1.4.248 or later** (the first version with plugin hooks). First turn on
plugins: Settings → Plugins → **Turn on plugins**.

- **From the plugin directory:** search for "No Worktrees" in Settings → Plugins. It installs as
  `rolottr.no-worktrees`.
- **From a Git URL:** Settings → Plugins → **Add plugin → From a Git URL…** →
  `https://github.com/rolottr/orca-no-worktrees`.
- **For development:** **⋯ → Development folders…** → add your clone, or run
  `orca plugin dev load <dir>`. It loads as `local.no-worktrees` and reloads on every save.

Review the plugin and enable it. It asks for one capability, `settings:own`, so it can read its
own settings. To see its logs, run `orca plugin logs rolottr.no-worktrees`.

## Settings (Settings → Plugins → No Worktrees)

| Setting | Default | Meaning |
| --- | --- | --- |
| Worktree creation | Block | `Off` turns the plugin off without uninstalling it. |
| Projects that may still create worktrees | empty | Project ids (from `orca repo list --json`), separated by commas or new lines. |

## Daily workflow

- Add or create the project as usual. Neither step makes a worktree. Orca registers the repo
  (for a new project it runs `git init` plus an empty first commit), then opens its main checkout.
- If you add the project from inside the **New workspace** composer, close the composer afterwards.
  Submitting it asks for a worktree, which this plugin refuses.
- Open new terminals or agents with **new tab** inside that workspace. Do not use "New workspace".
- Make sure the sidebar filter **Hide default branch** is off. If it is on, the main checkout row
  is hidden.
- Agents in one checkout share a working tree, so give them separate files or tasks.

## Alternative without a plugin: add the repo as a folder

`orca repo add --path /abs/path/to/repo --kind folder` registers any directory, a Git repo
included, as a **folder project**. That gives you one workspace at the repo root and never any
worktrees. The trade-off is that Orca turns off its Git features for that project: the source
control panel, diffs, commit and push, and PR status. If the repo is already registered as a Git
project, remove it first; otherwise Orca reuses the existing registration. (The **Open as Folder**
button exists only in the remote/server add-project flow. Adding a Git repo locally always registers
it as Git.)
