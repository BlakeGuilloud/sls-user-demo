import mongoose from 'mongoose';
import bluebird from 'bluebird';
mongoose.Promise = bluebird;

import jwt from 'jsonwebtoken';
import { handleSuccess, handleError, tryParse } from 'serverless-helpers';

import User from './schema';
import { generatePolicy } from './helpers';

export const register = (event, context, callback) => {
  mongoose.connect(process.env.MONGODB_URI);

  const payload = tryParse(event.body);

  User.create(payload)
    .then((data) => {
      const response = {
        statusCode: 200,
        body: data,
      };

      callback(null, handleSuccess(response));
    })
    .finally(() => {
      mongoose.connection.close();
    });
};

export const login = (event, context, callback) => {
  mongoose.connect(process.env.MONGODB_URI);

  const { username, password } = tryParse(event.body);

  User.findOne({ username })
    .then((data) => {
      //  TODO: Hash this password and do cool things with it.
      if (data && data.password === password) {
        delete data.password;

        const response = {
          statusCode: 200,
          body: data,
          token: jwt.sign({ data }, process.env.JWT_SECRET),
        };

        callback(null, handleSuccess(response));
      } else {
        const response = {
          statusCode: 404,
          err: 'Incorrect username or password',
        };

        callback(null, response);
      }
    })
    .finally(() => {
      mongoose.connection.close();
    });

};

export const secureRoute = (event, context, callback) => {
  callback(null, handleSuccess('This is a secret route..'));
};

export const authorizerFunc = (event, context, callback) => {
  // TODO- look into a more reliable way of parsing JWT.
  const token = event.authorizationToken.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    callback(null, generatePolicy('user', 'Allow', event.methodArn));
  } catch (err) {
    callback('Unauthorized');
  }
};