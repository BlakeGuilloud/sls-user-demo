'use strict';

module.exports.register = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Register',
      input: event,
    }),
  };

  callback(null, response);
};

module.exports.login = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Login',
      input: event,
    }),
  };

  callback(null, response);
};

module.exports.secureRoute = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Secure!',
      input: event,
    }),
  };

  callback(null, response);
};
