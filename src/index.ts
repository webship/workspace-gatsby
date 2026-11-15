/**
 * Gatsby for Webship Workspace: a platform plugin.
 *
 * What the package carries is placed by the installer from the manifest: the builder and the
 * Gatsby CLI tool in the sites folders, their functions and argparse under
 * core/scripts/plugins/gatsby/, its AI items (ai/) in the AI folders. The dashboard needs nothing
 * drawn for it: the builder is in the Build list because it is a cmd-*-project.sh, the row menus
 * are the core's, the AI items are listed like any other. What register() adds is what the
 * assistant is told.
 *
 * Everything the dashboard is asked for goes through `api`; this package requires nothing from the
 * dashboard's own files, so it can be installed from npm and removed without a trace.
 */

import type { PluginApi } from '@webship.co/workspace-plugin-api';

/** The plugin's name, which its functions are named after. */
export const PLATFORM = 'gatsby';

/** The commands the installer places in every sites folder. */
export const COMMANDS = ['cmd-gatsby-project.sh', 'cmd-tools-gatsby-cli.sh'];

/** The agents the installer places in the AI Agents folder. */
export const AGENTS = ['gatsby-site-builder', 'gatsby-tester'];

/** The skill the installer places in the AI Skills folder (a folder each, with its SKILL.md). */
export const SKILLS = ['gatsby-scenarios'];

/** The slash command the installer places in the AI Commands folder. */
export const AI_COMMANDS = ['gatsby-test'];

/** The prompt the installer places in the AI Prompts folder: a whole launch command for a new session. */
export const PROMPTS = ['gatsby-build-and-test'];

/** What the assistant is told about Gatsby in this workspace. */
export function assistantContext(): string {
  return [
    'Gatsby (a plugin, @webship.co/workspace-gatsby): a Gatsby site is made from a starter with',
    '`bash cmd-gatsby-project.sh <name> --install` from a sites folder (dev, test, sandboxes, demos),',
    'in a container like every other project: the site is the Node.js project in <name>/site, built to a production build',
    'and served at https://<name>.ddev.site. It is static: there is no database and there are no accounts.',
    '`bash cmd-tools-gatsby-cli.sh <name>` says what the site is; `--run "<gatsby command>"` runs the Gatsby CLI in it,',
    '`--build` builds and serves it again after a change, `--update` updates its packages, `--restart` starts its server again.',
    '`bash cmd-tools-testing.sh <name>` sets up webship-js with the Gatsby step pack; `--run` runs the suite against the build.',
    `For Gatsby work, hand over to the agents ${AGENTS.map((a) => `\`${a}\``).join(' and ')}.`,
    `The plugin also places the skill ${SKILLS.map((a) => `\`${a}\``).join(', ')} (the step pack's phrases, by area) in ai-skills/,`,
    `the command ${AI_COMMANDS.map((a) => `\`/${a} <site>\``).join(', ')} in ai-commands/ and the prompt ${PROMPTS.map((a) => `\`${a}\``).join(' and ')} in ai-prompts/.`,
    'Never run gatsby, node or npm on the host for a project.',
  ].join(' ');
}

export function register(api: PluginApi): void {
  api.addAssistantContext(assistantContext);
}
