/// <reference types="node" />
import { Given, When, Then, Before } from '@cucumber/cucumber';
import { expect } from 'chai';
import axios, { AxiosResponse } from 'axios';

// The base URL would typically come from environment variables.
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';

// Shared state for the scenario
let response: AxiosResponse;
let errorResponse: any;

Before(function () {
  response = undefined as any;
  errorResponse = undefined;
});

Given('the Activity Ranking API is configured and running', async function () {
  // In a real suite, this might run a health check endpoint.
  // For now, we assume the API context is ready.
});

Given('the Open-Meteo dependency is mocked to return a {int} error', async function (statusCode: number) {
  // Setup a mock state for the API dependency. 
  // Depending on the infrastructure, this could trigger a WireMock state change
  // or set a specific test header (e.g., 'X-Mock-OpenMeteo: 500') that the API intercepts.
  this.mockHeaders = { 'X-Mock-OpenMeteo-Status': statusCode.toString() };
});

When('I request the activity ranking for the city {string}', async function (cityName: string) {
  try {
    response = await axios.get(`${API_BASE_URL}/activities/ranking`, {
      params: { location: cityName },
      headers: this.mockHeaders || {}
    });
  } catch (error: any) {
    errorResponse = error.response;
  }
});

When('I request the activity ranking for the partial city name {string}', async function (partialCityName: string) {
  try {
    response = await axios.get(`${API_BASE_URL}/activities/ranking`, {
      params: { location: partialCityName }
    });
  } catch (error: any) {
    errorResponse = error.response;
  }
});

Then('the API should respond with a {int} {word} {word} status', function (statusCode: number, statusWord1: string, statusWord2: string) {
  const actualResponse = response || errorResponse;
  expect(actualResponse).to.not.be.undefined;
  expect(actualResponse.status).to.equal(statusCode);
});

Then('the API should respond with a {int} OK status', function (statusCode: number) {
  expect(response).to.not.be.undefined;
  expect(response.status).to.equal(statusCode);
});

Then('the response should contain exactly {int} days of forecast data', function (days: number) {
  expect(response.data).to.have.property('forecast');
  expect(response.data.forecast).to.be.an('array').with.lengthOf(days);
});

Then('each day should contain the following activities ranked by suitability:', function (dataTable) {
  const expectedActivities = dataTable.raw().map((row: string[]) => row[0]);
  
  response.data.forecast.forEach((day: any) => {
    const activityNames = day.activities.map((a: any) => a.name);
    
    // Check that all expected activities are present
    expectedActivities.forEach((expected: string) => {
      expect(activityNames).to.include(expected);
    });

    // Verify they are ranked (sorted) by suitability score in descending order
    const scores = day.activities.map((a: any) => a.suitability);
    const sortedScores = [...scores].sort((a, b) => b - a);
    expect(scores).to.deep.equal(sortedScores, 'Activities are not ranked by suitability');
  });
});

Then('each activity must include a suitability score and a textual reasoning', function () {
  response.data.forecast.forEach((day: any) => {
    day.activities.forEach((activity: any) => {
      expect(activity).to.have.property('suitability').that.is.a('number');
      // Assuming a scale of 0 to 10
      expect(activity.suitability).to.be.within(0, 10); 
      expect(activity).to.have.property('reasoning').that.is.a('string').and.is.not.empty;
      expect(activity).to.have.property('date').that.is.a('string');
    });
  });
});

Then('the response should contain a list of suggested city matches', function () {
  const actualResponse = response || errorResponse;
  expect(actualResponse.data).to.have.property('matches');
  expect(actualResponse.data.matches).to.be.an('array');
});

Then('the list of matches should include {string}', function (expectedCity: string) {
  const actualResponse = response || errorResponse;
  const matchNames = actualResponse.data.matches.map((m: any) => m.name);
  expect(matchNames).to.include(expectedCity);
});

Then('the response should contain a clear error message', function () {
  expect(errorResponse.data).to.have.property('error').that.is.a('string').and.is.not.empty;
});

Then('the response should indicate that the upstream weather service is temporarily unavailable', function () {
  expect(errorResponse.data.error).to.include('weather service');
});