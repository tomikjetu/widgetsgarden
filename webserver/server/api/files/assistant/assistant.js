async function startChat(prompt) {
  return new Promise((resolve) => {
    fetch(`/api/widgetapi/assistant/start?prompt=${prompt}`)
      .then((res) => res.json())
      .then((res) => {
        resolve({ id: res.id, messages: res.messages });
      });
  });
}

async function getMessages(id) {
  return new Promise((resolve) => {
    fetch(`/api/widgetapi/assistant/chat?id=${id}`)
      .then((res) => res.json())
      .then((res) => {
        resolve(res.messages);
      });
  });
}

async function sendMessage(id, message) {
  if (message.length == 0) return;
  return new Promise((resolve) => {
    fetch(`/api/widgetapi/assistant/chat?id=${id}&message=${message}`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then((res) => {
        resolve();
      });
  });
}

async function assistant_chat(elementId, ...parameters) {
  var element = document.getElementById(elementId);
  var prompt = parameters[0];
  var firstMessage = parameters[1]
  var ColorBot = parameters[2]
  var ColorUser = parameters[3]
  var messages = [];
  var { id } = await startChat(prompt);

  setInterval(async () => {
    var msg = await getMessages(id);
    if (msg.length > messages.length) {
      element.getElementsByClassName("assistant-messages")[0].innerHTML = "";

      msg.forEach((message) => {
        if (message.role != "system") {
          var div = document.createElement("div");
          div.classList.add("assistant-message");
          div.innerText = message.content;
          if (message.role == "assistant") {
            div.classList.add("assistant-message--assistant");
            div.style.background = ColorBot;
          }
          if (message.role == "user") {
            div.classList.add("assistant-message--user");
            div.style.background = ColorUser;
          }
          element.getElementsByClassName("assistant-messages")[0].append(div);
        }
      });

      if(msg[msg.length-1].role == "user"){
        var div = document.createElement("div");
        div.classList.add("assistant-message");
        div.classList.add("assistant-message--assistant");
        div.innerText = "Typing...";
        div.style.background = ColorBot;
        element.getElementsByClassName("assistant-messages")[0].append(div);
      }
            
      element.getElementsByClassName("assistant-messages")[0].scrollTop = element.getElementsByClassName("assistant-messages")[0].scrollHeight;
      messages = msg;
    }
  }, 1000);

  element.classList.add("assistant");
  element.innerHTML = `
        <div class='assistant-messages'></div>
        <div class='assistant-input'>
            <input placeholder='Type your message...'>
            <button>Send</button>
        </div>
  `;

  var input = element.querySelector("input");
  input.onkeyup = async (e) => {
    if (e.key == "Enter") {
      var message = input.value;
      input.value = "";
      await sendMessage(id, message);
    }
  };

  var button = element.querySelector("button");
  button.onclick = async (e) => {
    var message = input.value;
    await sendMessage(id, message);
  };
}

//https://codepen.io/sajadhsm/pen/odaBdd
