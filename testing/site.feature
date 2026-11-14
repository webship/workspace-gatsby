Feature: The built site answers
  As the owner of the site
  I want the production build to be served, rendered and complete
  So that a build that came out broken is caught before anything else is tested

  # Placed by the workspace's testing setup as a starting point: it is yours to change.
  # The site is static: it has no accounts, so no scenario logs in. The suite runs against the
  # production build that is served at the address of the project; build again after a change
  # (cmd-tools-gatsby-cli.sh <project> --build).

  @critical
  Scenario: The front page is served from the production build
    Given I am an anonymous user
    And I am on the homepage
    Then the response status code should be 200
    And the site should be a production build
    And the page should be from the current build

  @critical
  Scenario: The front page is rendered and hydrated
    Given I am on the homepage
    Then I should see a hydrated page
    And there should be no hydration errors

  Scenario: The build wrote the data of the front page
    Given I am on the homepage
    Then the page-data for "/" should be available
    And the page-data for "/no-such-page/" should not be available

  Scenario: The build wrote a 404 page
    Given I am on the homepage
    Then the 404 page should be available

  Scenario: An address with no page answers 404 with the 404 page of the site
    When I go to "/this-page-does-not-exist/"
    Then I should be on a 404 page
    And the response status code should be 404

  Scenario: A page that exists is not a 404 page
    Given I am on the homepage
    Then I should not be on a 404 page
