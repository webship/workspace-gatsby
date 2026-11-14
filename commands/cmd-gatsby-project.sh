#!/usr/bin/env bash

# workspace-name: Gatsby (starter, production build)

# Installed by the Gatsby plugin (plugins.sh --install gatsby); __WORKSPACE__ is the workspace it was installed into.
#
# Build a Gatsby site in a container: a starter, cloned into the project, at
# https://<name>.ddev.site. With --install the site is built to a production build and served
# there. A Gatsby site is static: it has no accounts.

# Bootstrap.
# Find the workspace tooling from this script, so a fresh clone needs no setup.
WORKSPACE_SCRIPTS="${WORKSPACE_SCRIPTS:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../core/scripts" && pwd)}";
source ${WORKSPACE_SCRIPTS}/bootstrap.sh || exit 1 ;

# Load workspace settings.
eval $(parse_yaml ${WORKSPACE_CONFIG}/workspace.__WORKSPACE__.settings.yml);

# The starter the site is made from, and the commit, branch or tag of it (empty: its default branch).
site_starter="https://github.com/gatsbyjs/gatsby-starter-default.git";
site_starter_ref="";

# Distribution.
distribution_name="gatsby";
distribution_title="Gatsby";
distribution_webroot="";

ARGPARSE_DESCRIPTION="Build a ${distribution_title} project in __WORKSPACE__"
# The args file comes with the plugin: core/scripts/plugins/gatsby/ is where plugins.sh --install puts it.
source ${WORKSPACE_SCRIPTS}/plugins/gatsby/args/arg-gatsby.sh || exit 1 ;

shift $#;

gatsby_build ;
