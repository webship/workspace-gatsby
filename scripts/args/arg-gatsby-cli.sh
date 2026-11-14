#!/usr/bin/env bash

argparse "$@" <<ARGEOF || exit 1
parser.add_argument('PROJECT_NAME',
                    help='The Gatsby project in this workspace.')
parser.add_argument('-r', '--run',
                    default="_none_",
                    help='A Gatsby CLI command to run in the site, without the leading gatsby. Example: --run "info"')
parser.add_argument('-b', '--build',
                    action='store_true',
                    default=False,
                    help='Build the site to a production build again, and serve the new build.')
parser.add_argument('-u', '--update',
                    action='store_true',
                    default=False,
                    help='Update the packages of the site within the ranges its package.json allows, then build and serve it again.')
parser.add_argument('-s', '--restart',
                    action='store_true',
                    default=False,
                    help='Start the server of the built site again, and wait until it answers.')
ARGEOF
