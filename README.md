# miniCRM 
[![Build status](https://circleci.com/gh/MiniCRM-Group/MiniCRM.svg?style=svg)](https://circleci.com/gh/MiniCRM-Group/MiniCRM)

This repository is a clone of the original miniCRM Repository found at [https://github.com/MiniCRM-Group/MiniCRM](https://github.com/MiniCRM-Group/MiniCRM)\
This is the repository for [miniCRM](http://form-ads-leads.appspot.com/), a simple, lightweight CRM designed for SMBs using Google Form Ads!

![miniCRM Landing Page](screenshots/landingpagescreenshot.png?raw=true "miniCRM Landing Page")

## Getting Started

Install the following tools:
- Java *8*
- [npm](https://nodejs.org/en/)

To run our project locally, you should run the frontend and backend separately,

To run the frontend, you want to do the following
```
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Run frontend
npm run start
```
To run the backend, you want to do the following
```
# Navigate to backend folder
cd backend

# Populate `webapp` with necessary files to run local server.
# Only needs to be done ONCE.
cp -R ./src/main/WEB-INF ./src/main/webapp

# Run backend (works only with Java 8)
mvn package appengine:run
```


To deploy our project onto GCP, you should run the production build of our frontend (which builds inside of the webapp folder)
and then run the production build of our backend (which also deploys). You will need to specify a GCP project id in `backend/pom.xml`.

```
# First, run prod build of frontend in the frontend folder
npm run build
# Then, deploy to Google App Engine in the backend folder
mvn package appengine:deploy
```

## Dev Workflow

1. The dev workflow starts off by creating a branch for a specific issue.
Use the following name convention for branch naming:
`<nickname>/<issue-name>`

2. Create pull request for your issue and fill out the PR template as you see fit.
3. Merge any conflicts.
4. Ensure your PR successfully passes all applicable CI pipelines. You can test and debug this locally by running the following commands:

    ```
    #Navigate to the front end folder
    # Installs npm dependencies
    npm install

    # Lints your Typescript files
    npm run lint

    # Builds the app
    npm run build

    # Runs front end unit tests
    npm run test

    #Navgate to the backend folder
    #Run back end unit tests
    mvn test
    ```
5. Get at least one intern (Roddy, Alex, Amanuel) to review and approve your PR and at least one host (Rodrigo and Anthoney) to review and approve your PR. (Note: This can be done concurrently with step 3)
6. Once at least one intern and at least one host has approved your PR, you can merge into `master`.

## Javadocs
Backend Javadocs can be found at backend/javadocs/index.html

## Contributors
STEP Interns: Alex, Amanuel, Roddy\
Hosts: Rodrigo, Anthoney\
Developed during Summer 2020
