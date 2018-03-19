# sls-user-demo
Serverless Authentication with JWT

### Routes
baseUrl = https://odhhm58dnl.execute-api.us-east-1.amazonaws.com/dev

- /register
  - Method: POST
  - JSON Body: { username, password }

- /login
  - Method: POST
  - JSON Body: { username, password }

- /secureRoute
  - Method: GET
  - Bearer: token
