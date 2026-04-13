const express = require('express');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

const WELCOME_MESSAGE = `Welcome to D48. How can we help you?

1. Reserve a table
2. Address or business hours
3. Menu
4. VIP Rules
5. Artists bookings
6. Job listing
7. Other`;

const responses = {
  "1": `For us to secure your reservation, may you please send us the following details:\n\nName:\nWhatsApp number:\nNumber of people:\nDate:\nTime of arrival:`,
  "2": `Our address is 563 Old Pretoria Road, Halfway House, Midrand.\n\nOperating Friday to Sunday, 12pm till 3am.`,
  "3": `🍔 Food Menu:\nhttps://d48.co.za/wp-content/uploads/2024/02/D48-Drinks-Food.pdf\n\n🍹 Drinks Menu:\nhttps://d48.co.za/wp-content/uploads/2024/02/D48-Drinks-Menu.pdf\n\nBeers & Ciders: R45\nIce Tropez: R150\nHubbly: R350 (R200 refill)`,
  "4": `Our VIP is bottle service only.\n\n🖤 Main VIP (Black couches): Minimum 2 premium bottles at R2000+ each.\n\n🤍 Mini VIP (White couches): Minimum 1 bottle at R1000+ each.\n\nIn general seating, you can drink anything.`,
  "5": `Our artist bookings are outsourced to an independent company. The booking agent does not permit us to share their contact details. Unfortunately we are not able to assist with this.`,
  "6": `We are currently not hiring. When we do, we will advertise through our social media @D48Midrand.\n\nIf you are seeking to be a bottle girl, you can send us your pictures and we will forward them to the relevant manager.`,
  "7": `Kindly type your query and we will get back to you within 24 hours. Please be patient as we deal with a lot of queries.`
};

// Track which customers have already received the welcome message
const welcomed = new Set();

function getReply(from, message) {
  const msg = message.trim();

  // If first time messaging, send welcome regardless of what they typed
  if (!welcomed.has(from)) {
    welcomed.add(from);
    return WELCOME_MESSAGE;
  }

  // If they pick a number 1-7, send that response
  if (responses[msg]) {
    return responses[msg];
  }

  // If they type something else, remind them to pick an option
  return `Please reply with a number from 1 to 7 to select an option.\n\n${WELCOME_MESSAGE}`;
}

// Webhook verification
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
      const reply = getReply(from, msg);

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
