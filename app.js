var express = require( "express" );
var app = express();
var port = process.env.YOUR_PORT || process.env.PORT || 80;

const PAGE_ACCESS_TOKEN = "EAACnvqZA7eqwBAPKOGmCDAZAD9QN7nUAp3bA6mDQDZBsl78MKq6uVRi05p0cL0z1DgU3K1yHqwZBqeDNebgSoMgQVWCW0RRKSYJRuB19UM6r7fdcx7EZCOSvKndOS1cGkChtYPYKQCpLdzwdbr5maWoNMVCEdHtT4OqcsDVPc0AZDZD"; //page used: Rrydjdjytjdtyyyyyy

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function sendGenericMessage(recipientId, messageText) {
  var messageData = {
   recipient: {
     id: recipientId
   },
   message: {
     attachment: {
       type: "template",
       payload: {
         template_type: "generic",
         elements: [{
           title: "rift",
           subtitle: "Next-generation virtual reality",
           item_url: "https://www.oculus.com/en-us/rift/",
           image_url: "http://messengerdemo.parseapp.com/img/rift.png",
           buttons: [{
             type: "web_url",
             url: "https://www.oculus.com/en-us/rift/",
             title: "Open Web URL"
           }, {
             type: "postback",
             title: "Call Postback",
             payload: "Payload for first bubble",
           }],
         }, {
           title: "touch",
           subtitle: "Your Hands, Now in VR",
           item_url: "https://www.oculus.com/en-us/touch/",
           image_url: "http://messengerdemo.parseapp.com/img/touch.png",
           buttons: [{
             type: "web_url",
             url: "https://www.oculus.com/en-us/touch/",
             title: "Open Web URL"
           }, {
             type: "postback",
             title: "Call Postback",
             payload: "Payload for second bubble",
           }]
         }]
       }
     }
   }
 };

 callSendAPI(messageData);
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " +
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to
  // let them know it was successful
  sendTextMessage(senderID, "Postback called");
}

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.get('/webhook', function(req, res) {
  console.log( req );
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === "this_is_a_prototype" ) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);

    var data = req.body;
    if( data.object === "page" ){
      data.entry.forEach( function( entry ) {
        var pageID = entry.id;
        var timeOfEvent = entry.time;

        // Iterate over each messaging event
        entry.messaging.forEach(function(event) {
          if (event.message) {
            receivedMessage(event);
          } else if (event.postback) {
            receivedPostback(event);
          } else {
            console.log("Webhook received unknown event: ", event);
          }
        });
      })
      res.status(200);
    }
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

app.listen(port, function () {
  console.log('Example app listening on port 3000!')
})
