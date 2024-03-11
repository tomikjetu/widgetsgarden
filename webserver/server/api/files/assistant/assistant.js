async function startChat(prompt, init) {
  return new Promise((resolve) => {
    fetch(`/api/widgetapi/assistant/start?prompt=${prompt}&init=${init}`)
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

async function assistant_sendMessage(id, message) {
  if (message.length == 0) return;
  return new Promise((resolve) => {
    fetch(`/api/widgetapi/assistant/chat?id=${id}&message=${message}`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        resolve();
      });
  });
}

async function assistant_render(element, id, messages, ColorBot, ColorUser){
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
}

async function assistant_chat(elementId, ...parameters) {
  var element = document.getElementById(elementId);
  element.classList.add("assistant");
  element.innerHTML = `
        <div class='assistant-messages'></div>
        <div class='assistant-input'>
            <input placeholder='Type your message...'>
            <button>Send</button>
        </div>
  `;
  
  var prompt = parameters[0];
  var firstMessage = parameters[1]
  var ColorBot = parameters[2]
  var ColorUser = parameters[3]
  var messages = [];
  var { id } = await startChat(prompt, firstMessage);
  await assistant_render(element, id, messages, ColorBot, ColorUser);



  var input = element.querySelector("input");
  input.onkeyup = async (e) => {
    if (e.key == "Enter") {
      var message = input.value;
      input.value = "";
      assistant_render(element, id, messages, ColorBot, ColorUser);
      await assistant_sendMessage(id, message);
      await assistant_render(element, id, messages, ColorBot, ColorUser);
    }
  };

  var button = element.querySelector("button");
  button.onclick = async (e) => {
    var message = input.value;
    input.value = "";
    assistant_render(element, id, messages, ColorBot, ColorUser);
    await assistant_sendMessage(id, message);
    await assistant_render(element, id, messages, ColorBot, ColorUser);
  };
}

//https://codepen.io/sajadhsm/pen/odaBdd
