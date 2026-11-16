---
name: gatsby-scenarios
description: Write and run webship-js scenarios for a Gatsby site of the Webship Workspace with the Gatsby step pack (`@webship-js/gatsby-steps`) — the phrases of the pack by area (the production build and hydration, page data and the 404 page, client-side routing and the route announcer, images, the web app manifest), what a site from the default starter does, and the workspace command that runs them in the site's container against the build. Use when asked to "write a scenario for this Gatsby site", "test the links of the site", "which step is there for the 404 page", "check that the page is hydrated", or when a `.feature` file of a Gatsby project is being written or fixed.
argument-hint: '<site> [what to cover]'
---

# gatsby-scenarios

Scenarios for a Gatsby site of a Webship Workspace (`~/workspace`, container-based, DDEV by
default), written from the steps of [`@webship-js/gatsby-steps`](https://github.com/webship/gatsby-steps)
and of [webship-js](https://github.com/webship/webship-js) itself, and run in the site's container
by the workspace's own command. It comes with the Gatsby plugin (`@webship.co/workspace-gatsby`),
like the builder (`cmd-gatsby-project.sh`), the Gatsby CLI tool (`cmd-tools-gatsby-cli.sh`) and the
agents `gatsby-site-builder` and `gatsby-tester`.

## Where everything is

| What | Where |
| --- | --- |
| The site | `~/workspace/<folder>/<site>`, at `https://<site>.ddev.site` (`<folder>` is a sites folder: `dev`, `test`, `sandboxes`, `demos`) |
| The source of the site | `<site>/site/` (its own `package.json`, `gatsby-config.js`, `src/`) |
| What the address serves | The production build, `<site>/site/public` |
| The suite's configuration | `<site>/cucumber.js`: the step definitions it loads. There is no users registry: the site has no accounts |
| The features | `<site>/tests/features/*.feature` (`site.feature` is the first one the setup wrote) |
| The pack's steps | `<site>/node_modules/@webship-js/gatsby-steps/tests/step-definitions/*.steps.js` |
| webship-js's steps | `<site>/node_modules/webship-js/tests/step-definitions/*.js` |
| The reports | `<site>/tests/reports/` |

## The order of work

1. **Make sure the testing stack is there.** From the sites folder:
   ```bash
   cd ~/workspace/<folder>
   bash cmd-tools-testing.sh <site>
   ```
   It adds webship-js, the step pack and `tests/features/site.feature`. It is safe to run again:
   it adds what is missing and keeps what was changed.
2. **Make sure the build is the one you mean to test.** The suite tests the build, not the
   source:
   ```bash
   bash cmd-tools-gatsby-cli.sh <site>            # the version, the build and when it was made, the server
   bash cmd-tools-gatsby-cli.sh <site> --build    # after a change to the source
   ```
3. **Read the installed steps before writing a phrase.** They are the source of truth: the pack
   moves, and a phrase from memory is a guess.
   ```bash
   cd ~/workspace/<folder>/<site>
   grep -hE "^(Given|When|Then)\(" node_modules/@webship-js/gatsby-steps/tests/step-definitions/*.steps.js
   ```
   Every step carries a comment block with five examples above it; open the file when a phrase
   is not obvious.
4. **Look at the page first** (the Playwright MCP browser, a tab of your own): the titles, the
   link texts and the addresses are the site's own.
5. **Write the feature** in `<site>/tests/features/`, from phrases that exist (the lists below).
6. **Match every step without a browser**, then run the feature, then the suite:
   ```bash
   cd ~/workspace/<folder>
   bash cmd-tools-testing.sh <site> --dry-run --path tests/features/<name>.feature
   bash cmd-tools-testing.sh <site> --run --path tests/features/<name>.feature
   bash cmd-tools-testing.sh <site> --run --tags "@critical"
   bash cmd-tools-testing.sh <site> --run
   ```
   A dry run says `Undefined` for a phrase no definition matches: fix the phrase, do not write a
   step for it.

## No accounts

An Gatsby site is static: nobody logs in, and a scenario starts as a visitor
(`Given I am an anonymous user`, or straight at a page).

## The phrases, by area

Each line is a phrase the pack defines, and each one passed on a site built with
`bash cmd-gatsby-project.sh <site> --install` (the default starter; the titles and the addresses
in quotes are that starter's). Most `should` steps also take the negative.

### The build and hydration

```gherkin
Given I am on the homepage
Then the site should be a production build
Then the page should be from the current build
Then I should see a hydrated page
Then there should be no hydration errors
Then the page title should be "Home | Gatsby Default Starter"
Then the page head should be set by the Head API
Then I should see "Welcome to" without JavaScript
```

### Page data and the 404 page

```gherkin
Then the page-data for "/" should be available
Then the page-data for "/no-such-page/" should not be available
Then the 404 page should be available
Then I should not be on a 404 page
When I go to "/this-page-does-not-exist/"
Then I should be on a 404 page
Then I should be on the default 404 page
```

### Client-side routing

```gherkin
When I click the link "Page 2" without a full page reload
Then the page should have a route announcer
Then the route announcer should announce "Hi from the second page"
When I go back without a full page reload
Then the page "/page-2/" should be prefetched
```

### Images and the manifest

```gherkin
Then I should see an optimized image
Then the optimized image should be loaded
Then the optimized image should offer the "webp" format
Then the optimized image should have a placeholder
Then the manifest should be valid
```

`I am an anonymous user`, `I am on the homepage`, `I go to "/page-2/"`, `I should see "<text>"`
and `the response status code should be 200` are webship-js's own steps; its status codes, links,
landmarks and accessibility audits are used as they are and never redefined for this platform.

## Traps found on a real site

- **The route announcer step adds the first words itself.** The announcer of the site says
  `Navigated to Hi from the second page`; the step is written with what follows `Navigated to`,
  and that is the first heading of the page, not its title:
  `Then the route announcer should announce "Hi from the second page"`. Written with the whole
  sentence, or with the title `Page two`, it fails.
- **The 404 page of the default starter is the default 404 page.** `Then I should not be on the
  default 404 page` fails until the site has a 404 page of its own; `Then I should be on a 404
  page` is the step for both.
- **A title is the page's and the site's**: `Home | Gatsby Default Starter`,
  `Page two | Gatsby Default Starter`. The step compares the whole title.
- **`Then the scroll position should be restored` was not proven on the default starter.** After
  `When I scroll down 300`, a click on the link `Page 2` and a step back, the step said the page
  was not scrolled when the link was clicked. Run it on a page whose link is further down before
  relying on it.
- **A stale build passes or fails for the wrong reason.** After a change to `site/src`, nothing
  changes at the address until `bash cmd-tools-gatsby-cli.sh <site> --build`.
- **The front page links to other sites.** The suite depends on this site only: assert the links
  of the site (`Page 2`), and follow none that leaves it.

## Rules

- **No platform name in a step phrase.** A step says what a person does or sees: `the site should
  be a production build`, `I should see a hydrated page`. The name of the generator is a value of a
  step, never a part of its phrase: `the page generator should start with "Gatsby"`,
  `the page generator version should start with "<version>"`. A custom step never names the
  product.
- **No account, no password, no secret in a feature file.** The site has no accounts, and a
  service it talks to is tested with its own pack on its own project.
- **No selector when a step says it**: `I should see an optimized image`, not a selector of the
  image.
- **The suite depends on this site only**, and changes nothing: a scenario reads the build, never
  writes into `site/`, and never builds.
- **A custom step is the last resort**: look in the pack and in webship-js first, write it in
  `<site>/tests/step-definitions/` with a comment block and examples, and say it may belong in
  the pack.
- **Everything runs in the container**, through `cmd-tools-testing.sh`. Never `npx cucumber-js`
  or `npx playwright` on the host.
- **A failing scenario is a result.** No `@wip`, no longer timeout, no looser assertion to turn a
  run green: say what the site did.

## Examples that run

`examples/` holds three features that pass on a site built with
`bash cmd-gatsby-project.sh <site> --install`. Copy one into the suite and run it:

```bash
cp ~/workspace/ai-skills/gatsby-scenarios/examples/built-pages.feature ~/workspace/<folder>/<site>/tests/features/
cd ~/workspace/<folder>
bash cmd-tools-testing.sh <site> --run --path tests/features/built-pages.feature
```

| Feature | What it shows |
| --- | --- |
| `examples/built-pages.feature` | The front page as a hydrated page of the current build, the page data the build wrote, an address with no page |
| `examples/routing.feature` | A link that changes the page without a full page reload, the route announcer, a prefetched page |
| `examples/images-and-manifest.feature` | The optimized image of the front page, the web app manifest, the text of the page without scripts |

## The book

For any automated functional testing in this work (a Gherkin feature, a step definition, choosing a
step, a test run and its failures), read the book *Automated Functional Testing Recipes* first.

- **Where.** Use the first that exists: `.claude/automated-functional-testing-recipes/` in the project,
  `~/.claude/automated-functional-testing-recipes/` (installed by webship/webship-js-ai-agent,
  webship/webship-js-skills or webship/ai-agents), or
  https://github.com/webship/webship-js-ai-agent/tree/2.0.x/automated-functional-testing-recipes
- **How.** Its `README.md` first, then the chapter that matches the task (one file per chapter,
  named by its subject), not the single complete file.
- **Which wins.** The installed webship-js package and the step pack are the source of truth for
  step phrasing. When they differ from the book, follow them and say so.
- **For Gatsby.** Start with `ch27-testing-spa.md` (hydration and client-side routing),
  `ch05-navigation-recipes.md` (pages, links and menus),
  `ch33-complete-step-definition-reference.md` (every built-in step) and `ch21-when-tests-go-bad.md`
  (flaky, brittle and slow scenarios).
