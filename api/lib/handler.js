import mongoose from 'mongoose';
import bluebird from 'bluebird';
mongoose.Promise = bluebird;

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt-nodejs';
import { handleSuccess, tryParse } from 'serverless-helpers';

import User from './schema';
import { generatePolicy } from './helpers';

export const register = (event, context, callback) => {
  const payload = tryParse(event.body);

  if (!payload.password || !payload.username) {
    const response = {
      statusCode: 400,
      body: JSON.stringify({ err: 'Username and Password are required' }),
      headers: {
        'Content-Type': 'application/json', // Might need to include additional headers when interacting w/ a browser.
      },
    };

    return callback(null, response); // Annoying that you have to return out of the function or else it proceeds to the User.create()..
  }

  mongoose.connect(process.env.MONGODB_URI);

  User.findOne({ username: payload.username })
    .then((existingUser) => {
      if (existingUser) {
        const response = {
          statusCode: 400,
          body: JSON.stringify({ err: 'Username is already in use' }),
          headers: {
            'Content-Type': 'application/json', // Might need to include additional headers when interacting w/ a browser.
          },
        };

        mongoose.connection.close();

        return callback(null, response);
      }

      payload.password = bcrypt.hashSync(payload.password);

      User.create(payload)
        .then((data) => {
          delete data.password;

          const response = {
            statusCode: 200,
            body: data,
          };

          callback(null, handleSuccess(response));
        })
        .finally(() => {
          mongoose.connection.close();
        });
    });

};

export const login = (event, context, callback) => {
  mongoose.connect(process.env.MONGODB_URI);

  const { username, password } = tryParse(event.body);

  User.findOne({ username })
    .then((data) => {
      if (data && bcrypt.compareSync(password, data.password)) {
        delete data.password;

        const response = {
          user: data,
          token: jwt.sign({ data }, process.env.JWT_SECRET),
        };

        callback(null, handleSuccess(response));
      } else {
        const response = {
          statusCode: 400,
          body: JSON.stringify({ err: 'Incorrect username or password' }),
          headers: {
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
        };

        callback(null, response);
      }
    })
    .finally(() => {
      mongoose.connection.close();
    });

};

export const secureRoute = (event, context, callback) => {
  callback(null, handleSuccess({ message: 'this is secret', context }));
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