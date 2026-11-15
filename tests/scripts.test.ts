import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

// Compiled, these tests run from dist/tests, so the package root is one folder further up.
const PKG = fs.existsSync(path.join(__dirname, '..', 'package.json')) ? path.join(__dirname, '..') : path.join(__dirname, '..', '..');
const FUNCTIONS = path.join(PKG, 'scripts', 'functions', 'fun-gatsby.sh');

// The cucumber.js webship-js scaffolds, as far as the testing hook reads it.
const SCAFFOLD = `module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: [
      'node_modules/webship-js/tests/step-definitions/**/*.js',          // Webship-js core step definitions.
      'tests/step-definitions/**/*.js',                                  // Your custom step definitions.
    ],
    paths: ['tests/features/**/*.feature'],
    worldParameters: {
      launchUrl: process.env.LAUNCH_URL || 'http://localhost:8080',
    },
  },
};
`;

/** A project folder with the testing stack scaffolded, and the tooling folder the installer would have filled. */
function project(type: string, built = true) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gatsby-plugin-'));
  const dir = path.join(root, 'dev', 'site1');
  fs.mkdirSync(path.join(dir, '.ddev'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.ddev', 'config.yaml'), `name: site1\ntype: ${type === 'gatsby' ? 'generic' : type}\ndocroot: ""\n`);
  if (type === 'gatsby') {
    // What the builder leaves: the file a Gatsby project is recognised by, and the site with its build.
    fs.writeFileSync(path.join(dir, '.ddev', 'config.gatsby.yaml'), 'web_extra_daemons: []\n');
    fs.mkdirSync(path.join(dir, 'site', 'public'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'site', 'package.json'), '{"name":"the-site","private":true}\n');
    if (built) fs.writeFileSync(path.join(dir, 'site', 'public', 'index.html'), '<html></html>\n');
  }
  fs.writeFileSync(path.join(dir, 'cucumber.js'), SCAFFOLD);
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'site1', devDependencies: { 'webship-js': '^2.0.6' } }, null, 2));
  const scripts = path.join(root, 'core', 'scripts');
  fs.mkdirSync(path.join(scripts, 'plugins', 'gatsby'), { recursive: true });
  fs.copyFileSync(path.join(PKG, 'testing', 'site.feature'), path.join(scripts, 'plugins', 'gatsby', 'site.feature'));
  return { root, dir, scripts };
}

/** Run bash with the plugin's functions sourced and `ddev` replaced by a recorder. */
function bash(script: string, env: Record<string, string> = {}) {
  const r = spawnSync('bash', ['-c', `ddev() { echo "ddev $*" >> "\${DDEV_LOG:-/dev/null}" ; return 0 ; }\nsleep() { :; }\nsource ${FUNCTIONS}\n${script}`],
    { encoding: 'utf8', env: { ...process.env, ...env } });
  return r;
}

test('a static site has no accounts: the list is empty, and the tools say so', () => {
  const r = bash('set_gatsby_users ; echo "count=${#users[@]}" ; add_gatsby_users ; cancel_gatsby_users');
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(r.stdout, /^count=0$/m);
  assert.match(r.stdout, /it has no accounts, so there are none to add/);
  assert.match(r.stdout, /it has no accounts, so there are none to remove/);
});

test('the builder\'s files serve the production build through the router, with Node.js in the image', () => {
  const p = project('drupal11');
  const r = bash(`gatsby_write_ddev_config ${p.dir} 24`);
  assert.strictEqual(r.status, 0, r.stderr);
  const ddev = fs.readFileSync(path.join(p.dir, '.ddev', 'config.gatsby.yaml'), 'utf8');
  assert.match(ddev, /web_extra_exposed_ports:\n  - name: gatsby\n    container_port: 8000\n    http_port: 80\n    https_port: 443/);
  assert.match(ddev, /web_extra_daemons:\n  - name: gatsby\n    command: "bash -c 'while \[ ! -f \/var\/www\/html\/site\/public\/index\.html \]; do sleep 2; done; cd \/var\/www\/html\/site && exec npx gatsby serve -p 8000 -H 0\.0\.0\.0'"/, 'the server waits for a build, then serves it');
  assert.match(ddev, /web_environment:\n  - GATSBY_TELEMETRY_DISABLED=1/);
  assert.match(fs.readFileSync(path.join(p.dir, '.ddev', 'web-build', 'Dockerfile.gatsby'), 'utf8'), /^RUN N_PREFIX=\/usr\/local n install 24 /m);
});

test('a build with --install clones the starter without its history, installs, builds and serves; --add-users adds nothing', () => {
  const p = project('drupal11');
  fs.rmSync(p.dir, { recursive: true });
  const log = path.join(p.root, 'ddev.log');
  // The recorder stands in for the container: it leaves what the clone and the build would.
  const stubs = `trim_project_name() { :; } ; drop_database() { :; } ; ddev_up() { ddev "$@" ; } ; ddev_nodejs_version() { echo 24 ; } ;
    ddev() { echo "ddev $*" >> "$DDEV_LOG" ; case "$*" in *"git clone"*) mkdir -p site/.git ;; *"npm run build"*) mkdir -p site/public && touch site/public/index.html ;; esac ; return 0 ; } ; `;
  const r = bash(`${stubs} PROJECT_NAME=site1 ; site_starter=https://example.org/starter.git ; REF=v1 ; INSTALL=yes ; ADD_USERS=yes ; gatsby_build`,
    { WORKSPACE_ROOT: p.root, WORKSPACE_SCRIPTS: p.scripts, doc_name: 'dev', DDEV_LOG: log });
  assert.strictEqual(r.status, 0, r.stderr + r.stdout);
  const ran = fs.readFileSync(log, 'utf8').split('\n');
  assert.ok(ran.includes('ddev config --project-type=generic --webserver-type=generic --docroot= --project-name=site1 --omit-containers=db --nodejs-version=24'));
  const order = ["ddev exec git clone --quiet 'https://example.org/starter.git' site", "ddev exec -d /var/www/html/site git checkout --quiet 'v1'",
    'ddev exec -d /var/www/html/site npm install --no-audit --no-fund', 'ddev exec -d /var/www/html/site npm run build', 'ddev exec supervisorctl restart webextradaemons:gatsby'].map((l) => ran.indexOf(l));
  assert.ok(order.every((i) => i >= 0), JSON.stringify(ran));
  assert.deepStrictEqual(order, [...order].sort((a, b) => a - b), 'clone, checkout, install, build, serve');
  assert.ok(!fs.existsSync(path.join(p.dir, 'site', '.git')), 'the site starts without the history of the starter');
  assert.match(r.stdout, /--add-users: a Gatsby site is static and has no accounts; nothing is added\./);
  assert.match(r.stdout, /has been built and is served/);
});

test('the testing hook adds the step pack and a first feature to a Gatsby project, once, and no users registry', () => {
  const p = project('gatsby');
  const run = () => bash(`cd ${p.dir} && testing_configure_gatsby ${p.dir}`, { WORKSPACE_ROOT: p.root, WORKSPACE_SCRIPTS: p.scripts, doc_name: 'dev', PROJECT_NAME: 'site1' });
  const r = run();
  assert.strictEqual(r.status, 0, r.stderr + r.stdout);
  const pkg = JSON.parse(fs.readFileSync(path.join(p.dir, 'package.json'), 'utf8'));
  assert.strictEqual(pkg.devDependencies['@webship-js/gatsby-steps'], '^2.1.0');
  assert.strictEqual(pkg.devDependencies['webship-js'], '^2.0.6', 'what was there stays');
  assert.strictEqual(fs.readFileSync(path.join(p.dir, 'site', 'package.json'), 'utf8'), '{"name":"the-site","private":true}\n', 'the package.json of the site is not the suite\'s: it is left alone');
  const cucumber = fs.readFileSync(path.join(p.dir, 'cucumber.js'), 'utf8');
  const lines = cucumber.split('\n');
  const core = lines.findIndex((l) => l.includes('node_modules/webship-js/tests/step-definitions'));
  assert.strictEqual(lines[core + 1], "      'node_modules/@webship-js/gatsby-steps/tests/step-definitions/**/*.js',", 'the pack is listed right after webship-js');
  assert.doesNotMatch(cucumber, /users:/, 'no users registry: the site has no accounts');
  const loaded = spawnSync(process.execPath, ['-e', `const c = require(${JSON.stringify(path.join(p.dir, 'cucumber.js'))}).default; console.log(JSON.stringify(c.require))`], { encoding: 'utf8' });
  assert.strictEqual(loaded.status, 0, loaded.stderr);
  assert.strictEqual(JSON.parse(loaded.stdout).length, 3);
  assert.ok(fs.existsSync(path.join(p.dir, 'tests', 'features', 'site.feature')));
  assert.doesNotMatch(r.stdout, /no production build yet/);
  // Again, after a person changed the feature: nothing is doubled, nothing is reset.
  fs.writeFileSync(path.join(p.dir, 'tests', 'features', 'site.feature'), 'Feature: mine\n');
  assert.strictEqual(run().status, 0);
  assert.strictEqual(fs.readFileSync(path.join(p.dir, 'cucumber.js'), 'utf8'), cucumber);
  assert.strictEqual(fs.readFileSync(path.join(p.dir, 'tests', 'features', 'site.feature'), 'utf8'), 'Feature: mine\n');
});

test('the testing hook says when the site has no build to test yet', () => {
  const p = project('gatsby', false);
  const r = bash(`cd ${p.dir} && testing_configure_gatsby ${p.dir}`, { WORKSPACE_ROOT: p.root, WORKSPACE_SCRIPTS: p.scripts, doc_name: 'dev', PROJECT_NAME: 'site1' });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(r.stdout, /the site has no production build yet: build it \(cmd-tools-gatsby-cli\.sh site1 --build\)/);
});

test('the testing hook leaves a project of another platform alone', () => {
  const p = project('drupal11');
  const r = bash(`cd ${p.dir} && testing_configure_gatsby ${p.dir}`, { WORKSPACE_ROOT: p.root, WORKSPACE_SCRIPTS: p.scripts, doc_name: 'dev', PROJECT_NAME: 'site1' });
  assert.strictEqual(r.status, 0);
  assert.strictEqual(r.stdout, '');
  assert.strictEqual(fs.readFileSync(path.join(p.dir, 'cucumber.js'), 'utf8'), SCAFFOLD);
  assert.ok(!fs.existsSync(path.join(p.dir, 'tests')));
});

test('the CLI tool refuses a project that is not Gatsby, and will not serve a site that has no build', () => {
  const other = project('drupal11');
  const r = bash('PROJECT_NAME=site1 ; RUN="info" ; trim_project_name() { :; } ; gatsby_cli_tool', { WORKSPACE_ROOT: other.root, doc_name: 'dev' });
  assert.strictEqual(r.status, 1);
  assert.match(r.stdout, /is not a Gatsby project/);
  const unbuilt = project('gatsby', false);
  const s = bash('PROJECT_NAME=site1 ; RUN=_none_ ; RESTART=yes ; trim_project_name() { :; } ; ddev() { [ "$1" == describe ] && echo \'"status":"running"\' ; return 0 ; } ; gatsby_cli_tool', { WORKSPACE_ROOT: unbuilt.root, doc_name: 'dev' });
  assert.strictEqual(s.status, 1);
  assert.match(s.stdout, /has no production build yet/);
});

test('the first feature names no platform in a step, logs nobody in, and carries no content of a starter', () => {
  const feature = fs.readFileSync(path.join(PKG, 'testing', 'site.feature'), 'utf8');
  const steps = feature.split('\n').filter((l) => /^\s*(Given|When|Then|And|But) /.test(l));
  assert.ok(steps.length >= 10);
  for (const s of steps) assert.doesNotMatch(s, /gatsby/i, s);
  assert.doesNotMatch(feature, /password|logged in|log in/i, 'a static site has no accounts');
  assert.doesNotMatch(feature, /should see "/, 'no copy of a starter: the feature holds for any site the builder makes');
});
