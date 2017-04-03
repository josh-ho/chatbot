var express = require( "express" );
var app = express();
var port = process.env.YOUR_PORT || process.env.PORT || 80;

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === "this_is_a_prototype" ) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

app.listen(port, function () {
  console.log('Example app listening on port 3000!')
})
