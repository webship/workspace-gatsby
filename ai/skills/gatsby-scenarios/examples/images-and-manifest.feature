Feature: The images, the manifest and the page without scripts
  As the owner of the site
  I want the images to be optimized, the manifest to be valid and the text to be in the page itself
  So that the site loads well and reads without scripts

  Scenario: The front page shows an optimized image
    Given I am on the homepage
    Then I should see an optimized image
    And the optimized image should be loaded
    And the optimized image should offer the "webp" format
    And the optimized image should have a placeholder

  Scenario: The site has a valid web app manifest
    Given I am on the homepage
    Then the manifest should be valid

  Scenario: The text of the front page is in the page before any script runs
    Given I am on the homepage
    Then I should see "Welcome to" without JavaScript
