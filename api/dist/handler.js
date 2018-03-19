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

var _bcryptNodejs = require('bcrypt-nodejs');

var _bcryptNodejs2 = _interopRequireDefault(_bcryptNodejs);

var _serverlessHelpers = require('serverless-helpers');

var _schema = require('./schema');

var _schema2 = _interopRequireDefault(_schema);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = _bluebird2.default;

const register = exports.register = (event, context, callback) => {
  const payload = (0, _serverlessHelpers.tryParse)(event.body);

  if (!payload.password || !payload.username) {
    const response = {
      statusCode: 400,
      body: JSON.stringify({ err: 'Username and Password are required' }),
      headers: {
        'Content-Type': 'application/json' // Might need to include additional headers when interacting w/ a browser.
      }
    };

    return callback(null, response); // Annoying that you have to return out of the function or else it proceeds to the User.create()..
  }

  _mongoose2.default.connect(process.env.MONGODB_URI);

  _schema2.default.findOne({ username: payload.username }).then(existingUser => {
    if (existingUser) {
      const response = {
        statusCode: 400,
        body: JSON.stringify({ err: 'Username is already in use' }),
        headers: {
          'Content-Type': 'application/json' // Might need to include additional headers when interacting w/ a browser.
        }
      };

      _mongoose2.default.connection.close();

      return callback(null, response);
    }

    payload.password = _bcryptNodejs2.default.hashSync(payload.password);

    _schema2.default.create(payload).then(data => {
      delete data.password;

      const response = {
        statusCode: 200,
        body: data
      };

      callback(null, (0, _serverlessHelpers.handleSuccess)(response));
    }).finally(() => {
      _mongoose2.default.connection.close();
    });
  });
};

const login = exports.login = (event, context, callback) => {
  _mongoose2.default.connect(process.env.MONGODB_URI);

  const { username, password } = (0, _serverlessHelpers.tryParse)(event.body);

  _schema2.default.findOne({ username }).then(data => {
    if (data) {
      delete data.password;

      const response = {
        user: data,
        token: _jsonwebtoken2.default.sign({ data }, process.env.JWT_SECRET)
      };

      callback(null, (0, _serverlessHelpers.handleSuccess)(response));
    } else {
      const response = {
        statusCode: 400,
        body: JSON.stringify({ err: 'Incorrect username or password' }),
        headers: {
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      };

      callback(null, response);
    }
  }).finally(() => {
    _mongoose2.default.connection.close();
  });
};

const secureRoute = exports.secureRoute = (event, context, callback) => {
  callback(null, (0, _serverlessHelpers.handleSuccess)({ message: 'this is secret', context }));
};

const authorizerFunc = exports.authorizerFunc = (event, context, callback) => {
  // TODO- look into a more reliable way of parsing JWT.
  const token = event.authorizationToken.split(' ')[1];

  try {
    const decoded = _jsonwebtoken2.default.verify(token, process.env.JWT_SECRET);

    callback(null, (0, _helpers.generatePolicy)('user', 'Allow', event.methodArn));
  } catch (err) {
    callback('Unauthorized');
  }
};