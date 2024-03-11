import Groq from "groq-sdk";

const groq = new Groq();
var Chats = [];

function generateChatID() {
  var d = new Date().getTime();

  var uuid = "chxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });

  return uuid;
}

export default function AiWidgetEndpoint(app) {
  app.get("/api/widgetapi/assistant/start", (req, res) => {
    var prompt = req.query.prompt;
    var init = req.query.init;
    var id = generateChatID();
    var messages = [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "assistant",
        content: init,
      },
    ];
    Chats.push({
      id,
      messages,
      session: req.session.sessionId,
    });

    res.send({
      id,
      messages,
    });
  });

  app.get("/api/widgetapi/assistant/chat", (req, res) => {
    var { id } = req.query;

    var chat = Chats.find((chat) => chat.id === id);
    if (!chat)
      return res.json({
        done: false,
        error: "Chat not found",
      });

    res.json({
      done: true,
      messages: chat.messages,
    });
  });

  app.post("/api/widgetapi/assistant/chat", async (req, res) => {
    var { id, message } = req.query;

    var chat = Chats.find((chat) => chat.id === id);
    if (!chat)
      return res.json({
        done: false,
        error: "Chat not found",
      });

    chat.messages.push({
      role: "user",
      content: message,
    });

    const chatCompletion = await groq.chat.completions.create({
      messages: chat.messages,
      model: "mixtral-8x7b-32768",
      temperature: 0.5,
      max_tokens: 1024,
      top_p: 1,
      stop: null,
    });

    chat.messages.push({
      role: "assistant",
      content: chatCompletion.choices[0].message.content,
    });

    res.json({ done: true, chat: chat.messages, chatCompletion });
  });
}
