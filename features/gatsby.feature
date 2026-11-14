Feature: The Gatsby plugin on the dashboard
  Once the plugin is activated and installed, the sites folders offer the Gatsby builder, the
  AI Agents folder lists the Gatsby agents, and the Plugins page lists the plugin with its steps.

  Scenario: The plugin is listed on the Plugins page
    Given I am on "/settings/plugins"
     Then I should see "Gatsby"
      And I should see "@webship.co/workspace-gatsby"

  Scenario: A sites folder offers the Gatsby builder
    Given I am on "/dev"
     Then "option[value='cmd-gatsby-project.sh']" should be attached

  Scenario: The AI Agents folder lists the agents the plugin ships
    Given I am on "/ai-agents"
     Then I should see "gatsby-site-builder"
      And I should see "gatsby-tester"
