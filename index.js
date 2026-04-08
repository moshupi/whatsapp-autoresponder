const express = require('express');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// Your 20 auto-responses go here
const responses = {
  "hello": "Hi there! Thanks for reaching out. How can we help you today?",
  "hours": "We're open Monday–Friday, 8am to 5pm.",
  "price": "Please visit our website for pricing, or reply with your specific question.",
  "default": "Thanks for your message! We'll get back to you shortly."
};

function getReply(message) {
  const msg = message.toLowerCase().trim();
  for (const keyword in responses) {
    if (keyword !== "default" && msg.includes(keyword)) {
      return responses[keyword];
    }
  }
  return responses["default"];
}

// Webhook verification (Meta requires this)
app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

// Receive and reply to messages
app.post('/webhook', async (req, res) => {
  const body = req.body;
  if (body.object === 'whatsapp_business_account') {
    const messages = body.entry?.[0]?.changes?.[0]?.value?.messages;
    if (messages && messages[0]) {
      const msg = messages[0].text?.body;
      const from = messages[0].from;
      const reply = getReply(msg);

      await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: from,
          text: { body: reply }
        })
      });
    }
  }
  res.sendStatus(200);
});

app.listen(process.env.PORT || 3000, () => console.log('Running'));
