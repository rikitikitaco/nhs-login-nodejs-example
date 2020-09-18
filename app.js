// External dependencies
const express = require('express');
const querystring = require('querystring');
const request = require('request');
const requestPromise = require('request-promise');
const ejs = require('ejs');
const {Issuer} = require('openid-client');
const token_helper = require('./token_helper');
const app = express();
const port = 2000;

// OIDC parameters
const clientId = 'your_client_id_here';
const ENV_URI = 'https://auth.sandpit.signin.nhs.uk';
const TOKEN_URI = ENV_URI + '/token';
const CALLBACK_URI = 'https://localhost:2000/callback';

// set the view engine to ejs
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/test', (req, res) => {
    res.render('userinfo', { user: sampleUser });
})

const sampleUser = {"sub":"6cde2fa0-5728-4467-a888-66cbd04d0a9e","iss":"https://auth.sandpit.signin.nhs.uk","aud":"nhslogin_testclient","nhs_number":"9658220150","birthdate":"1964-02-13","family_name":"CURRIE","im1_token":"6f425d0f-031a-40e1-83d9-4c0545af8d2c","gp_integration_credentials":{"gp_user_id":"1294029928","gp_ods_code":"A20047","gp_linkage_key":"YCRPyPSEUARu9"}}

// Callback happens as a 302 client-side redirect request from NHSLogin
// The callback contains the authorization code
app.get('/callback', (req, res) => {

    Issuer.discover(ENV_URI)
        .then(function (nhsLoginIssuer) {

            const client = new nhsLoginIssuer.Client({
                client_id: clientId,
                redirect_uris: [CALLBACK_URI],
                response_types: ['code'],
                token_endpoint_auth_method: 'private_key_jwt'
            });

            var post_data = querystring.stringify({
                'grant_type': 'authorization_code',
                'code': client.callbackParams(req).code,
                'redirect_uri': CALLBACK_URI,
                'client_assertion_type': 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
                'client_assertion': token_helper.GenerateAssertionJwt(TOKEN_URI, clientId)
            });

            // Requesting an access token from the "/token" endpoint using our authorization code
            requestPromise({
                headers: { 'Content-Length': post_data.length, 'Content-Type': 'application/x-www-form-urlencoded' },
                uri: TOKEN_URI,
                body: post_data,
                method: 'POST'
            }).then(function (err, res2, body) {
                // Query userinfo endpoint to retreive profile info - using our access token
                // NOTE: the access token is only valid for 5 minutes!
                // You can use a refresh token to request a new access token without having to sign in again.
                client.userinfo(JSON.parse(body).access_token)
                    .then(function (userinfo) {
                        console.log(JSON.stringify(userinfo));
                        res.render('userinfo', { user: userinfo });
                    });
            }).catch(function(error){
                console.log(error);
            });

        });
})

app.use(express.static('public'));
app.listen(port, () => console.log(`Test web-app is listening on port ${port}!`));