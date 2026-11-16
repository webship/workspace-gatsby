Feature: The Gatsby plugin on the dashboard
  Once the plugin is activated and installed, the sites folders offer the Gatsby builder, each
  AI folder lists the items of its kind the plugin ships, and the Plugins page lists the plugin
  with its steps.

  # The Plugins page names each plugin; the package is on the plugin's own page (the row shows it on hover only).
  Scenario: The plugin is listed on the Plugins page, and its own page names its package
    Given I am on "/settings/plugins"
     Then I should see "Gatsby"
     When I go to "/settings/plugin/gatsby"
     Then I should see "@webship.co/workspace-gatsby"

  Scenario: A sites folder offers the Gatsby builder
    Given I am on "/dev"
     Then "option[value='cmd-gatsby-project.sh']" should be attached

  # The AI folders are searched by name: with every plugin on, a folder lists more than one page of items.
  Scenario: The AI Agents folder lists the agents the plugin ships
    Given I am on "/ai-agents?q=gatsby-"
     Then I should see "gatsby-site-builder"
      And I should see "gatsby-tester"

  Scenario: The AI Skills folder lists the skill the plugin ships
    Given I am on "/ai-skills?q=gatsby-scenarios"
     Then I should see "gatsby-scenarios"

  Scenario: The AI Commands folder lists the command the plugin ships
    Given I am on "/ai-commands?q=gatsby-test"
     Then I should see "gatsby-test"

  Scenario: The AI Prompts folder lists the prompt the plugin ships
    Given I am on "/ai-prompts?q=gatsby-build-and-test"
     Then I should see "gatsby-build-and-test"
