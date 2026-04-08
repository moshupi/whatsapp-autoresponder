const express = require('express');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// Your 20 auto-responses go here
const responses = {
  "hello": "Hi. This is D48 MIDRAND! How can we assist? For artists, DJs and job seekers, kindly visit D48 in person to make enquiries there. Strictly. Lastly, please be patient with replies. We will get to your messege. No calls on this number",
  "Hi": "Hi. This is D48 MIDRAND! How can we assist? For artists, DJs and job seekers, kindly visit D48 in person to make enquiries there. Strictly. Lastly, please be patient with replies. We will get to your messege. No calls on this number",
  "hours": "We're open Friday - Sunday, 12pm to 3am",
  "open": "We're open Friday - Sunday, 12pm to 3am",
  "price": "Food https://d48.co.za/wp-content/uploads/2024/02/D48-Drinks-Food.pdf Drinks https://d48.co.za/wp-content/uploads/2024/02/D48-Drinks-Menu.pdf . Beers and ciders R45. Ice tropez R150. Hubbly is R350",
  "menu": "Food https://d48.co.za/wp-content/uploads/2024/02/D48-Drinks-Food.pdf Drinks https://d48.co.za/wp-content/uploads/2024/02/D48-Drinks-Menu.pdf . Beers and ciders R45. Ice tropez R150. Hubbly is R350",
   "reservation": "For us to secure your reservation, may you please send us the following details in this format:\n\nName:\nWhatsApp number:\nNumber of people:\nDate:\nTime of arrival:",
  "book": "For us to secure your reservation, may you please send us the following details in this format:\n\nName:\nWhatsApp number:\nNumber of people:\nDate:\nTime of arrival:",
  "table": "For us to secure your reservation, may you please send us the following details in this format:\n\nName:\nWhatsApp number:\nNumber of people:\nDate:\nTime of arrival:",
  "reserve": "For us to secure your reservation, may you please send us the following details in this format:\n\nName:\nWhatsApp number:\nNumber of people:\nDate:\nTime of arrival:",
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
