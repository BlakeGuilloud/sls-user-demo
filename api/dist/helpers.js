'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var generatePolicy = exports.generatePolicy = function generatePolicy(principalId, effect, resource) {
    var authResponse = {};

    authResponse.principalId = principalId;

    if (effect && resource) {
        var policyDocument = {};
        policyDocument.Version = '2012-10-17';
        policyDocument.Statement = [];

        var statementOne = {};
        statementOne.Action = 'execute-api:Invoke';
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }

    return authResponse;
};