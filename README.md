# @webship.co/workspace-gatsby

Gatsby for the [Webship Workspace](https://github.com/webship/workspace) dashboard: a builder that
makes a real Gatsby site from a starter in a container, builds it to a production build and serves
it, a Gatsby CLI tool for the sites it built, the
[Gatsby step pack](https://github.com/webship/gatsby-steps) wired into the workspace's testing
setup, and two AI agents that know all of it.

The workspace is container-based (DDEV by default): a Gatsby project is a row like any other, so
the row menus the core draws (start, stop, launch, backup, clone, remove, tests) work on it; what
does not apply to a static site is listed under
[What is different from a PHP platform](#what-is-different-from-a-php-platform).

The plugin is made from the reference platform plugin,
[`@webship.co/workspace-wordpress`](https://github.com/webship/workspace-wordpress).

## Use it

```bash
cd ~/workspace
bash core/scripts/plugins.sh --require github:webship/workspace-gatsby   # npm install into the dashboard
bash core/scripts/plugins.sh --activate gatsby                            # plugins.gatsby in settings.yml
bash core/scripts/plugins.sh --install gatsby                             # commands, functions, args, agents
bash core/scripts/plugins.sh --configure gatsby                           # nothing to configure: it has no settings file
```

The same four steps are buttons on the dashboard's **Settings → Plugins** page. `--install` is
idempotent. `--uninstall` removes what it placed; an agent you edited stays.

The commands land in the sites folders that are in the workspace (`dev`, `test`, `sandboxes`,
`demos`); the agents land in the AI Agents folder (`ai-agents/`) when the workspace has one, and are
installed into `~/.claude/agents` from there like any other agent.

The agents, the builder's flags in the Build form and the step pack in the testing setup need a
Webship Workspace after 1.0.6.

## What it needs

A workspace starts empty, so the manifest says what else this plugin needs (`needs`):

- one sites folder, for the builder and the tool: `dev`, `test`, `sandboxes`, `demos` (`dev` is the one added when none is there). The folder also carries `cmd-tools-testing.sh` and the Users tools this plugin's hooks answer to.
- `ai-agents`, the AI Agents folder its two agents are placed in.

`--require` says so, `--activate` and `--install` stop until the workspace has them, and `--with-needs` adds what is missing first:

```bash
bash core/scripts/plugins.sh --activate gatsby --with-needs   # dev and ai-agents are required, activated and installed first
bash core/scripts/plugins.sh --install gatsby
```

Everything the builder runs for a site runs in the site's own container, through the container tool the workspace already needs; the plugin asks for no command of its own on the machine.

A workspace that knows none of this (Webship Workspace 1.0.8 and older) ignores the keys: add a sites folder and the AI Agents folder yourself, then `--install gatsby` again.

## What the package holds

| Path | What it is |
| --- | --- |
| `commands/cmd-gatsby-project.sh` | The builder, in the Build list as **Gatsby (starter, production build)**, installed into every sites folder |
| `commands/cmd-tools-gatsby-cli.sh` | The Gatsby CLI for one project: what the site is, a command, a build, an update, a restart |
| `scripts/functions/fun-gatsby.sh` | The bash functions behind both, sourced by bootstrap once installed; the names the core's tools look for (`set_gatsby_users`, `add_gatsby_users`, `cancel_gatsby_users`, `testing_configure_gatsby`) |
| `scripts/args/arg-gatsby.sh`, `arg-gatsby-cli.sh` | Their argparse; the Build form draws the builder's flags from the first |
| `testing/site.feature` | The first feature a Gatsby project gets when testing is set up |
| `agents/gatsby-site-builder.md` | The agent that builds and maintains Gatsby sites with these commands |
| `agents/gatsby-tester.md` | The agent that writes and runs scenarios with the Gatsby step pack |
| `src/index.ts` | `register(api)`: what the assistant is told about Gatsby here |
| `features/gatsby.feature` | Scenarios for the dashboard's own browser suite |

The `workspacePlugin` block in `package.json` is the manifest the installer reads.

## What is different from a PHP platform

Gatsby is a static site generator and DDEV has no project type for it. The plugin keeps the shape
of the reference and changes only this:

| | WordPress (the reference) | Gatsby |
| --- | --- | --- |
| Project | `--project-type=wordpress`, nginx and PHP | `--project-type=generic --webserver-type=generic`: no web server; the router sends the project's address to `gatsby serve`, which the web container runs as a daemon (`.ddev/config.gatsby.yaml`) |
| Recognised by | The DDEV project type | The file `.ddev/config.gatsby.yaml` |
| The site | The project folder | The Node.js project in the project's `site/` folder; the test suite is next to it, with a `package.json` of its own |
| Node.js | The workspace's (24), for the front-end tools | The workspace's (24), and baked into the web image (`.ddev/web-build/Dockerfile.gatsby`) so the server has it before the daemons start |
| Database | The container tool's default | None (`--omit-containers=db`) |
| Getting the code | `wp core download` | `git clone` of a starter, without its history, then `npm install` |
| Install | `wp core install` | `gatsby build` (the production build in `site/public`), then `gatsby serve` |
| Accounts | One per role | None: `set_gatsby_users` is an empty list, and the add and cancel functions say so |

What that means for the row menus of a Gatsby project:

| Menu | On a Gatsby project |
| --- | --- |
| Start, stop, restart, launch | Work: the server of the build starts with the container |
| Tests | Work: set up, run, reports |
| Remove, clone | Work |
| Back up this project | Archives the folder; the database export it also tries has nothing to export and says so |
| Export the database, import a database, snapshots | Do not apply: there is no database |
| Users (add or cancel the test users) | Does not apply: there are no accounts |

## The commands

Run them from a sites folder. `--help` is safe on both.

### Build a site

```bash
cd ~/workspace/dev
bash cmd-gatsby-project.sh mysite --install
```

| Flag | What it does |
| --- | --- |
| `--starter <url>` | The starter the site is made from: the address of a git repository (the default: `gatsby-starter-default`) |
| `--ref <x>` | A commit, a branch or a tag of the starter; empty means its default branch |
| `--install` | Build the site to a production build and serve it |
| `--add-users` | Taken and ignored: a static site has no accounts |
| `--launch` | Open the site when it is ready |

The site answers at `https://mysite.ddev.site`. It is the Node.js project in `mysite/site`, and
what the address serves is its production build (`site/public`): a change to the source shows after
the next build. A project of the same name is deleted first.

### Work on a site

```bash
bash cmd-tools-gatsby-cli.sh mysite                  # version, address, the build, the server
bash cmd-tools-gatsby-cli.sh mysite --build          # build again, and serve the new build
bash cmd-tools-gatsby-cli.sh mysite --update         # npm update in the site, then build and serve again
bash cmd-tools-gatsby-cli.sh mysite --run "info"     # any Gatsby CLI command
bash cmd-tools-gatsby-cli.sh mysite --restart        # start the server of the build again
```

### Test a site

```bash
bash cmd-tools-testing.sh mysite                 # webship-js, the step pack, a first feature
bash cmd-tools-testing.sh mysite --run           # run the suite in the container
bash cmd-tools-testing.sh mysite --run --path tests/features/site.feature
```

`cmd-tools-testing.sh` is the workspace's own. For a Gatsby project it also adds
`@webship-js/gatsby-steps` to `package.json`, lists its step definitions in `cucumber.js` after
webship-js's own, and places `tests/features/site.feature` when the project has none: the front
page as a production build, rendered and hydrated, its page data and its 404 page. There is no
users registry. Run it again and it adds what is missing and keeps what you changed.

## The agents

| Agent | Use it to |
| --- | --- |
| `gatsby-site-builder` | Make a site from a starter, build it again, update, maintain or remove it with the commands above, in containers only |
| `gatsby-tester` | Set the testing stack up, look at the built site in the Playwright MCP browser first, write scenarios from the pack's steps and run them; it never creates an account in a suite and never writes a platform name into a step phrase |

After `--install` they are in the AI Agents folder of the dashboard; **Install** there puts one into
`~/.claude/agents`, or from the command line:

```bash
cd ~/workspace/ai-agents
bash cmd-tools-ai-items.sh gatsby-tester --install
```

## Develop it

```bash
npm install     # builds dist/ (TypeScript)
npm run lint
npm test        # the manifest, the commands, the agents, the functions against a scaffolded project
```
