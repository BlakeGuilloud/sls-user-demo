'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authorizerFunc = exports.secureRoute = exports.login = exports.register = undefined;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _serverlessHelpers = require('serverless-helpers');

var _schema = require('./schema');

var _schema2 = _interopRequireDefault(_schema);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = _bluebird2.default;

var register = exports.register = function register(event, context, callback) {
  _mongoose2.default.connect(process.env.MONGODB_URI);

  var payload = (0, _serverlessHelpers.tryParse)(event.body);

  _schema2.default.create(payload).then(function (data) {
    var response = {
      statusCode: 200,
      body: data
    };

    callback(null, (0, _serverlessHelpers.handleSuccess)(response));
  }).finally(function () {
    _mongoose2.default.connection.close();
  });
};

var login = exports.login = function login(event, context, callback) {
  _mongoose2.default.connect(process.env.MONGODB_URI);

  var _tryParse = (0, _serverlessHelpers.tryParse)(event.body),
      username = _tryParse.username,
      password = _tryParse.password;

  _schema2.default.findOne({ username: username }).then(function (data) {
    //  TODO: Hash this password and do cool things with it.
    if (data && data.password === password) {
      delete data.password;

      var response = {
        statusCode: 200,
        body: data,
        token: _jsonwebtoken2.default.sign({ data: data }, process.env.JWT_SECRET)
      };

      callback(null, (0, _serverlessHelpers.handleSuccess)(response));
    } else {
      var _response = {
        statusCode: 404,
        err: 'Incorrect username or password'
      };

      callback(null, _response);
    }
  }).finally(function () {
    _mongoose2.default.connection.close();
  });
};

var secureRoute = exports.secureRoute = function secureRoute(event, context, callback) {
  callback(null, (0, _serverlessHelpers.handleSuccess)('This is a secret route..'));
};

var authorizerFunc = exports.authorizerFunc = function authorizerFunc(event, context, callback) {
  // TODO- look into a more reliable way of parsing JWT.
  var token = event.authorizationToken.split(' ')[1];

  try {
    var decoded = _jsonwebtoken2.default.verify(token, process.env.JWT_SECRET);

    callback(null, (0, _helpers.generatePolicy)('user', 'Allow', event.methodArn));
  } catch (err) {
    callback('Unauthorized');
  }
};