Feature: Activity Ranking API - City-Based Weather Forecast Integration
  As an application frontend or user
  I want to submit a city or town name to the API
  So that I can receive a 7-day ranked list of activities based on weather conditions

  Background:
    Given the Activity Ranking API is configured and running

  Scenario: Exact city match provides a 7-day ranked activity forecast
    When I request the activity ranking for the city "Innsbruck"
    Then the API should respond with a 200 OK status
    And the response should contain exactly 7 days of forecast data
    And each day should contain the following activities ranked by suitability:
      | Skiing |
      | Surfing |
      | Outdoor Sightseeing |
      | Indoor Sightseeing |
    And each activity must include a suitability score and a textual reasoning

  Scenario: Partial city name returns a list of possible matches
    When I request the activity ranking for the partial city name "Spring"
    Then the API should respond with a 300 Multiple Choices status
    And the response should contain a list of suggested city matches
    And the list of matches should include "Springfield"

  Scenario: Invalid or completely unknown city name
    When I request the activity ranking for the city "FakeCityThatDoesNotExist123"
    Then the API should respond with a 404 Not Found status
    And the response should contain a clear error message

  Scenario: Downstream weather provider (Open-Meteo) is unavailable
    Given the Open-Meteo dependency is mocked to return a 500 error
    When I request the activity ranking for the city "London"
    Then the API should respond with a 502 Bad Gateway status
    And the response should indicate that the upstream weather service is temporarily unavailable