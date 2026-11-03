// No Worktrees: refuses `workspace.create.before` for Git worktrees, so new work happens in the
// project's main checkout (the "Default branch" row), where you can open as many tabs as you need.

const DENY_REASON =
  'Worktree creation is off (No Worktrees plugin). Open a new tab in the project\'s main checkout instead, ' +
  'or allow this project in Settings → Plugins → No Worktrees.'

function parseAllowed(value) {
  if (typeof value !== 'string') return new Set()
  return new Set(
    value
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
  )
}

export default function activate(orca) {
  orca.hooks.on('workspace.create.before', async (event, next) => {
    // Folder workspaces never create a worktree, so they cost no extra checkout.
    if (event.kind !== 'worktree') return next(event)

    // Settings are a local read. If it fails, keep blocking: that is the plugin's default.
    let settings = {}
    try {
      settings = (await orca.host.call('settings.get', {})).settings ?? {}
    } catch (error) {
      orca.log(`settings.get failed, using defaults: ${error?.message ?? error}`)
    }

    if (settings.mode === 'off') return next(event)
    if (parseAllowed(settings.allowedProjects).has(event.projectId)) return next(event)

    orca.log(`denied worktree "${event.name}" in project ${event.projectId}`)
    return { deny: DENY_REASON }
  })
}
