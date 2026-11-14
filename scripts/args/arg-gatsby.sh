#!/usr/bin/env bash

argparse "$@" <<ARGEOF || exit 1
parser.add_argument('PROJECT_NAME',
                    help='The name of the project: its folder, its DDEV project and its host name.')
parser.add_argument('-s', '--starter',
                    default="${site_starter}",
                    help='The starter the site is made from: the address of a git repository. [default %(default)s]')
parser.add_argument('-r', '--ref',
                    default="${site_starter_ref}",
                    help='A commit, a branch or a tag of the starter; empty means its default branch. Example: --ref e75499f')
parser.add_argument('-i', '--install',
                    action='store_true',
                    default=False,
                    help='Build the site to a production build and serve it at the address of the project.')
parser.add_argument('-a', '--add-users',
                    action='store_true',
                    default=False,
                    help='Taken so that every builder accepts the same flags: a static site has no accounts, and nothing is added.')
parser.add_argument('-l', '--launch',
                    action='store_true',
                    default=False,
                    help='Open the site in a browser when it is ready.')
ARGEOF
