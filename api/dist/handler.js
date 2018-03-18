'use strict';

module.exports.register = function (event, context, callback) {
  var response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Register',
      input: event
    })
  };

  callback(null, response);
};

module.exports.login = function (event, context, callback) {
  var response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Login',
      input: event
    })
  };

  callback(null, response);
};

module.exports.secureRoute = function (event, context, callback) {
  var response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Secure!',
      input: event
    })
  };

  callback(null, response);
};