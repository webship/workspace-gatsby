Make a Gatsby site from a starter in a sites folder, serve its production build and prove it with its first webship-js feature.

`claude` is the default launcher; the text between the triple quotes is plain and can be given to another AI CLI as it is.

```
claude --permission-mode bypassPermissions """
Build a Gatsby site named <name> in this sites folder and test it with webship-js
# ~/workspace/<dev|test|sandboxes|demos> · https://<name>.ddev.site · container-based (DDEV by default)
# the builder deletes a project of the same name first: stop if <name> is a site somebody still needs
# nothing on the host: no gatsby, node, npm or npx outside the site's container
# a static site: no database and no accounts, and none is added to make a tool happy
# a feature to write or a run to read: the book Automated Functional Testing Recipes first (its README.md, then the matching chapter), from .claude/automated-functional-testing-recipes/ in the project, ~/.claude/automated-functional-testing-recipes/ or https://github.com/webship/webship-js-ai-agent/tree/2.0.x/automated-functional-testing-recipes

1. bash cmd-gatsby-project.sh <name> --install
   (add --starter <url> for a starter other than the default one, and --ref <x> for a commit, a branch or a tag of it)
2. bash cmd-tools-gatsby-cli.sh <name>
   tell me the version, the address, how many pages the production build has and whether the server runs
3. bash cmd-tools-testing.sh <name>
   webship-js, the step pack and tests/features/site.feature
4. bash cmd-tools-testing.sh <name> --dry-run --path tests/features/site.feature
5. bash cmd-tools-testing.sh <name> --run --path tests/features/site.feature

If a command fails, show the line that failed and stop. Do not retry with other flags.
When the feature is green: the address, the version, how many scenarios and steps passed.
Then ask me whether to keep the site or remove it with: bash cmd-tools-remove.sh <name>
"""
```
