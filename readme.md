# Activity Ranking API - Specification-First Test Suite

This repository contains the Behavior-Driven Development (BDD) test suite for the upcoming **Activity Ranking API**. The tests are written using Gherkin, Cucumber, and TypeScript.

Because this is a specification-first (TDD) approach, these tests currently fail (red state). They serve as the executable contract for the development team to build against.

## 📌 Proposed API Contract

Since no implementation exists, I have designed the following assumed API contract that the tests validate:

**Endpoint:** `GET /api/v1/activities/ranking?location={city_name}`

**1. Success Response (Exact Match) - `200 OK`**
\`\`\`json
{
  "location": "Innsbruck",
  "forecast": [
    {
      "date": "2026-07-08",
      "activities": [
        { "name": "Skiing", "suitability": 9, "reasoning": "High snowfall expected and -2°C" },
        { "name": "Indoor Sightseeing", "suitability": 7, "reasoning": "Cold temperatures make indoor activities favorable" },
        { "name": "Outdoor Sightseeing", "suitability": 4, "reasoning": "Heavy snow reduces visibility" },
        { "name": "Surfing", "suitability": 0, "reasoning": "No coastal access and freezing temperatures" }
      ]
    }
    // ... 6 more days
  ]
}
\`\`\`

**2. Multiple Matches Response (Partial Match) - `300 Multiple Choices`**
\`\`\`json
{
  "matches": [
    { "name": "Springfield, IL, USA" },
    { "name": "Springfield, MO, USA" }
  ]
}
\`\`\`

## 🛠 Approach & Assumptions

* **Location Resolution:** Open-Meteo requires latitude and longitude. I am assuming the API handles the geocoding (translating "Innsbruck" to coordinates) before querying Open-Meteo, either via Open-Meteo's geocoding API or another service. The partial match scenario tests this geocoding step.
* **Suitability Scoring:** I assumed a normalized suitability score from `0` to `10`. This makes front-end integration simpler (e.g., mapping to UI progress bars or star ratings).
* **Dependency Management (Open-Meteo):** * Live third-party APIs introduce flakiness (network issues, rate limiting) into CI/CD pipelines.
  * *Trade-off chosen:* In this automated suite, I assume the deployment under test utilizes a mocking tool (like WireMock) or accepts a test header (`X-Mock-OpenMeteo-Status`) to simulate downstream failures without actually hitting Open-Meteo.
  * In a fully mature state, we would have Contract Tests (e.g., using Pact) specifically for the Open-Meteo integration, leaving these tests to focus purely on business logic.

## 🚀 Running the Tests

1. Install dependencies:
   \`npm install\`
2. Run the Cucumber test suite:
   \`npm run test\` (Maps to `cucumber-js -p default`)