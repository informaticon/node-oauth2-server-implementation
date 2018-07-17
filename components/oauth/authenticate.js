/**
 * Created by Manjesh on 14-05-2016.
 */
const oauthServer = require('oauth2-server');
const Request = oauthServer.Request;
const Response = oauthServer.Response;
let db = require('./sqldb');
const config = require('../../config');
if(config.db === 'mongo'){
  db = require('./mongodb')
}
const oauth = require('./oauth');

module.exports = function(opt){
    const options = opt || {};
    return function(req, res, next) {
        const request = new Request({
            headers: {authorization: req.headers.authorization},
            method: req.method,
            query: req.query,
            body: req.body
        });
        const response = new Response(res);

        oauth.authenticate(request, response,options)
      .then(function (token) {
        // Request is authorized.
        req.user = token;
        next()
      })
      .catch(function (err) {
        // Request is not authorized.
        res.status(err.code || 500).json(err)
      });
  }
};
