const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const app = express();
const client = new line.Client(config);

// 謎データ（仮）
const riddles = [
  { q: "口があっても話せない。目があっても見えない。なーんだ？", a: "かわ" },
  { q: "足はあるのに歩けない。なーんだ？", a: "いす" },
];
const userProgress = {};

app.post('/webhook', line.middleware(config), (req, res) => {
  const events = req.body.events;
  events.forEach(async (event) => {
    if (event.type === 'message' && event.message.type === 'text') {
      const userId = event.source.userId;
      const userAns = event.message.text.trim();
      const index = userProgress[userId] || 0;
      const current = riddles[index];

      if (userAns === current.a) {
        userProgress[userId] = index + 1;
        const next = riddles[userProgress[userId]];
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: next ? `正解！次の問題：${next.q}` : "すべての謎を解いた！🎉",
        });
      } else {
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: `ちがうよ！もう一度：${current.q}`,
        });
      }
    }
  });
  res.sendStatus(200);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Bot is running");
});
