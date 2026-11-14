#!/usr/bin/env bash

# Installed by the Gatsby plugin (plugins.sh --install gatsby); __WORKSPACE__ is the workspace it was installed into.
#
# The Gatsby CLI for one Gatsby project of this workspace, in its container: say what the site
# is, run a Gatsby CLI command, build the site again, update its packages, start the server
# again. Nothing here runs on the host.

# Bootstrap.
# Find the workspace tooling from this script, so a fresh clone needs no setup.
WORKSPACE_SCRIPTS="${WORKSPACE_SCRIPTS:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../core/scripts" && pwd)}";
source ${WORKSPACE_SCRIPTS}/bootstrap.sh || exit 1 ;

# Load workspace settings.
eval $(parse_yaml ${WORKSPACE_CONFIG}/workspace.__WORKSPACE__.settings.yml);

# Distribution.
distribution_name="gatsby";

ARGPARSE_DESCRIPTION="Run the Gatsby CLI on a Gatsby project of __WORKSPACE__: status, a command, a build, an update, a restart"
# The args file comes with the plugin: core/scripts/plugins/gatsby/ is where plugins.sh --install puts it.
source ${WORKSPACE_SCRIPTS}/plugins/gatsby/args/arg-gatsby-cli.sh || exit 1 ;

shift $#;

gatsby_cli_tool ;
