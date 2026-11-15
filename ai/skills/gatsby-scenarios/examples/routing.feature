Feature: A visitor moves between the pages without a full page reload
  As the owner of the site
  I want the links of the site to change the page on the client, and to say so to a screen reader
  So that a link that started to reload the whole page is caught by the suite

  Scenario: A link changes the page on the client and the page is announced
    Given I am on the homepage
    When I click the link "Page 2" without a full page reload
    Then the page title should be "Page two | Gatsby Default Starter"
    And the page should have a route announcer
    And the route announcer should announce "Hi from the second page"
    When I go back without a full page reload
    Then the page title should be "Home | Gatsby Default Starter"

  Scenario: The front page prefetches the page its link leads to
    Given I am on the homepage
    Then the page "/page-2/" should be prefetched
