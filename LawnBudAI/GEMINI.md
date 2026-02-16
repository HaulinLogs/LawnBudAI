# GEMINI.md

This document provides an overview of the LawnBudAI project for Gemini.

## Project Overview

LawnBudAI is a mobile application built with React Native and Expo. It is designed to help users care for their lawns by providing features for tracking and managing mowing, watering, and fertilizing schedules. The app also integrates with a weather service to provide relevant weather information.

## Key Technologies

*   **React Native:** A JavaScript framework for building native mobile apps.
*   **Expo:** A platform for making universal React applications.
*   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
*   **Expo Router:** A file-based router for React Native and web applications.
*   **Expo SQLite:** A library for using SQLite databases in Expo apps.
*   **Axios:** A promise-based HTTP client for the browser and node.js.

## Project Structure

The project is organized into the following directories:

*   `app/`: Contains the screens and navigation logic for the app.
*   `assets/`: Contains static assets such as images and fonts.
*   `components/`: Contains reusable UI components.
*   `constants/`: Contains constant values such as colors.
*   `database/`: Contains the database initialization code.
*   `hooks/`: Contains custom React hooks.
*   `models/`: Contains the data models for the app.
*   `screens/`: Contains the main screens of the app.
*   `services/`: Contains services for interacting with external APIs.

## Available Scripts

The following scripts are available in the `package.json` file:

*   `npm start`: Starts the Expo development server.
*   `yarn android`: Starts the app on an Android emulator or device.
*   `yarn ios`: Starts the app on an iOS simulator or device.
*   `yarn web`: Starts the app in a web browser.
*   `yarn lint`: Lints the project files using ESLint.
*   `yarn reset-project`: Resets the project to a fresh state.

## Getting Started

To get the project running locally, follow these steps:

1.  Install the dependencies:
    ```bash
    npm install
    ```
2.  Start the Expo development server:
    ```bash
    npx expo start
    ```
3.  Follow the instructions in the terminal to open the app in a simulator, emulator, or on a physical device.
