/**
 * Created by Manjesh on 14-05-2016.
 */
const oauthServer = require('oauth2-server');
const Request = oauthServer.Request;
const Response = oauthServer.Response;
const config = require('../../config');
const db = config.db === 'mongo' ? require('./mongodb') : require('./sqldb');

const oauth = require('./oauth');
oauth.allowExtendedTokenAttributes = true;


getIdToken = function(token, nonce){
    try {
        const jwt = require('jsonwebtoken');
        return jwt.sign({
            iss: 'http://localhost:1212',
            aud: token.client.client_id,
            sub: token.user.id,
            // jti: nonce,
            nonce: nonce
        }, '-----BEGIN RSA PRIVATE KEY-----\n' +
            'MIIEowIBAAKCAQEAsphx6KhpetKXk/oR8vrDxwN8aaLsiBsYNvrWCA9oDcubuDD/\n' +
            'YLnXH65QnNoRdlOW0+dCAStZVB3VtHR9qyUbqCvS443xC59nDrEHEpTO8+zeHzkk\n' +
            'Ip4zVU0vvowZlkVqZZA032dCEaB4LSIzZoxWa1OHSfmQgR90zMVDCI98YCNvTGrd\n' +
            'J66GrYRVdjnd5Jg5ebZVtfa9VMN1WBro02pLJ8K/cux/i7KO0zovDYhID90wNU/q\n' +
            '8F1nzlDcs5TiPPBBTNWfGLMRVec2xbIpQ9T3Ou0Yn4xPUimwVRSrvkcCF1MTbm55\n' +
            '/Jv9EdRbrVk46n3qZMbx0cHDGCUjaAcKbkVkcQIDAQABAoIBAAHUG751Evdl9pVW\n' +
            'Rx7EwIJmH7z5JRDTrjDJ6q0Uc01I22RMZCD6ZiB16W9hsDIU8wNiZ8OZTQXWdFyv\n' +
            'oKXC8ICNSlB4IJKs5CI7X8Yp7eCDeVa6gAs2sXHbI3UA/DYUqd02V8Q9y2hgyzoz\n' +
            'EnGnWC8rIMR6IKehydFa56/LwEs/rT/qyB3BwI8BC0pfQu/WONR9ufGeZ2RdGIte\n' +
            'SBWZ+59pIhVIRTvw04hpFiE78gxy/w3SSn0lESNODNorP3H5xsv8Fm10ZLVGWGHq\n' +
            'o/Y+8J+7DVvYesGzY/qcvodyKp80CIGu+kfRah/ELosI1O4RPpRREXJ/e/NweIAM\n' +
            'wc7WnAECgYEA2i0SugRnjWSzde7P0WoSApIg2CxkIMNNezAgp8P8lDre+x5W+lml\n' +
            '4BYdNlOUQFtD9IkdlH0NW+J+lK1Z2WJ3hoqUd71iKOHDYcsCspVI0vVewAUjQdn9\n' +
            'E2GjKbzRAEC5pT9z8QZVQeNFoi+5bec+PyUm6vFPsSqzyL8tI3BvkbECgYEA0Y68\n' +
            'dt3kCioQeYEZbhw6a0hHHOGSOdfbHXXfwa1aK+bg6GqTzBPi6owK1YET+EtIKKqJ\n' +
            '+Ax4wuiyjiPzdL0Ci4qYvv6sytJa5s+Qm1njLY3JcpXk0R7XqAOSpWodFkye4eRl\n' +
            'wYFEFSbPdwYQvI2siXXveR3lf9Wgr4o7PoOW7sECgYApbT2NDKEM+/4Hep0DSny4\n' +
            '+D48TdGFVxAzP+QzdsdS7grA6/Xf+32/mvNZCW2w+qNgn1h6hXQv6kXWvUO+PzAq\n' +
            '381pHxCwao3K191fQ3FcfTLMiy0yp82iDHwKxMt6nM+jTPUa4vT1Wc4zCZTQBYSQ\n' +
            'QOGu4rsbDNyuVX6gqAzHQQKBgB/YJ+2MRIYC5GQCaUHhSkNZRW0vHhBqK+LrMah1\n' +
            '1lkLiavn3jPJ5dasl0zgg49cqUd8uuCVzJgZ0mBlOC7KNiPMWO/VNZ7Qnn2qlxf0\n' +
            'beBTRoSCILZikHT4rgUy/d6QoChFk+z23si0EBzPMCXnBYwR/uUR1Pk7FmL2h5A1\n' +
            'YO9BAoGBAJFE2g4unWFbJHi+XEXl7MHfrx4nEVrD6NKWSxLOoS4YEmJmdnmVQ8qy\n' +
            'YWz+7C0Jxb7m2c+TWWvsmMDfSXiVammCke2kf6FYp+7ZmGo/eFStaSuZ/VY05uQ1\n' +
            'xunvG66XSKQwIIU61jf35Ltj+RLhsBkOgYxdwa4ADQ6/znXI7JzU\n' +
            '-----END RSA PRIVATE KEY-----', {algorithm: 'RS256', keyid: '4129db2ea1860d2e871ee48506287fb05b04ca3f'});
    } catch (ex) {
        console.error(ex.toString());
    }
};

module.exports = function(app){
  app.post('/oauth/token', function(req,res /*,next*/){
      const request = new Request(req);
      const response = new Response(res);

      oauth
      .token(request,response)
      .then(function(token) {
        // Todo: remove unnecessary values in response
          token.id_token = getIdToken(token, request.body.nonce);
          return res.json(token)
      }).catch(function(err){
        return res.status(500).json(err)
      })
  });

  app.post('/authorise', function(req, res){
      const request = new Request(req);
      const response = new Response(res);

      return oauth.authorize(request, response).then(function(success) {
      //  if (req.body.allow !== 'true') return callback(null, false);
      //  return callback(null, true, req.user);
        res.json(success)
    }).catch(function(err){
      res.status(err.code || 500).json(err)
    })
  });

  app.get('/authorise', function(req, res) {
    return db.OAuthClient.findOne({
        where: {
          client_id: req.query.client_id,
          redirect_uri: req.query.redirect_uri,
        },
        attributes: ['id', 'name'],
      })
      .then(function(model) {
        if (!model) return res.status(404).json({ error: 'Invalid Client' });
        return res.json(model);
      }).catch(function(err){
        return res.status(err.code || 500).json(err)
      });
  });
};
