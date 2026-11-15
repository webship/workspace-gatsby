Feature: The pages of the production build
  As the owner of the site
  I want every page to be served from the production build, rendered and hydrated
  So that a build that came out broken is caught by the suite

  # The titles and the addresses are the ones of the starter the builder uses by default:
  # change them to the pages of the site.

  Scenario: The front page is a hydrated page of the current build
    Given I am an anonymous user
    And I am on the homepage
    Then the response status code should be 200
    And the site should be a production build
    And the page should be from the current build
    And I should see a hydrated page
    And there should be no hydration errors
    And the page title should be "Home | Gatsby Default Starter"
    And the page head should be set by the Head API

  Scenario: The build wrote the data of each page
    Given I am on the homepage
    Then the page-data for "/" should be available
    And the page-data for "/page-2/" should be available
    And the page-data for "/no-such-page/" should not be available

  Scenario: An address with no page answers 404 with the 404 page of the site
    Given I am on the homepage
    Then the 404 page should be available
    And I should not be on a 404 page
    When I go to "/this-page-does-not-exist/"
    Then I should be on a 404 page
    And the response status code should be 404
