# Sample NodeJS Webclient

Sample web client implementation written in NodeJS. Connecting to Sandpit by default.

## Building the app

```bash
make init
```

## Running the app
```bash
make start
```

Running the app will start a nodeJS webserver, hosting on port 2000. Open `http://localhost:2000` in your favourite browser. Enjoy!

### Integrating with the sandpit

Once you have generated your public/private key pair and received your client ID for the NHS login sandpit:

* Add your client ID in the `app.js` file
* copy your own private key into `keys/private_key.pem`
