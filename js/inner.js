chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	if (request.action == "ResponseReceived")
	{
		if (request.url == "https://s1ye.github.io/GGExtraEmotes/list.txt")
		{
			var tmp = request.response.split("\n");
			for (var i = 0; i < tmp.length; i++)
			{
				tmp[i] = "https://s1ye.github.io/GGExtraEmotes/emotes/" + tmp[i];
				tmp[i] = Replace(tmp[i], "\n", "");
				tmp[i] = Replace(tmp[i], "\r", "");
				tmp[i] = Replace(tmp[i], "\t", "");
			}
			window.ggextraemotes_urls = tmp;
			console.log("[GGExtraEmotes] Получены ggextraemotes_urls: " + window.ggextraemotes_urls);	
			Main();
		}
	}
});

chrome.runtime.sendMessage({ "action":"GET", "url":"https://s1ye.github.io/GGExtraEmotes/list.txt" });

async function Main()
{
	AsyncAddNickClickEvent();
	AsyncAddCustomInput();
	AsyncAddEmojis();
}

async function AddNickClickEvent()
{
	await WaitElementByXPath('//div[@class="tse-content"]//chat-user');
	var chat_section = await WaitElementByXPath('//div[@class="tse-content"]');
	var chat_users = chat_section.getElementsByTagName("chat-user");
	for (var i = 0; i < chat_users.length; i++)
	{
		if (!chat_users[i].getAttribute("ggextraemotes_has_event"))
		{
			chat_users[i].setAttribute("ggextraemotes_has_event", true);
			var nickname = Replace(chat_users[i].innerText, " ", "");
			chat_users[i].onclick = function()
			{
				var custom_input = document.getElementById("ggextraemotes_msg_input");
				custom_input.innerHTML += "&nbsp;" + this + ',&nbsp;';
			}.bind(nickname);
		}
	}
}

async function AsyncAddNickClickEvent()
{
	await AddNickClickEvent();
	setTimeout(AsyncAddNickClickEvent, 500);
}

async function AsyncAddCustomInput()
{
	await AddCustomInput();
	setTimeout(AsyncAddCustomInput, 500);
}

async function AsyncAddEmojis()
{
	await AddEmojis();
	setTimeout(AsyncAddEmojis, 500);
}

async function AddCustomInput()
{
	if (!document.getElementById("ggextraemotes_msg_input"))
	{
		var text_block = await WaitElementByXPath('//div[@class="chat-control-block"]//div[@class="text-block ng-scope"]');
		var textarea = await WaitElementByXPath('//div[@class="chat-control-block"]//div[@class="textarea"]');
		textarea.style = "display: none";
		var ggextraemotes_msg_input = document.createElement("div");
		ggextraemotes_msg_input.id = "ggextraemotes_msg_input";
		ggextraemotes_msg_input.className = "textarea";
		ggextraemotes_msg_input.setAttribute("contenteditable", true);
		ggextraemotes_msg_input.setAttribute("placeholder", "Написать сообщение...");
		ggextraemotes_msg_input.onkeyup = function(event)
		{
			if (event.keyCode == 13)
			{
				var msg = ggextraemotes_msg_input.innerHTML;
				msg = Replace(msg, "<div>", "");
				msg = Replace(msg, "</div>", "");
				msg = Replace(msg, "<br>", "");
				msg = Replace(msg, "&nbsp;", "");
				msg = Replace(msg, "\n", "");
				msg = Replace(msg, "\r", "");
				msg = Replace(msg, "\t", "");
				for (var i = 0; i < ggextraemotes_urls.length; i++)
				{
					var replace = '<img class="ggextraemote_in_input" src="' + ggextraemotes_urls[i] + '">';
					msg = Replace(msg, replace, ' ' + ggextraemotes_urls[i] + ' ');
				}
				var emotes = msg.split("<divforemote");
				for (var i = 1; i < emotes.length; i++)
				{
					var inner_emote = emotes[i].split("</divforemote>")[0];
					try
					{
						var name = inner_emote.split('tooltip="')[1].split('"')[0];
						msg = Replace(msg, "<divforemote" + inner_emote + "</divforemote>", " " + name + " ");
					}
					catch(e)
					{
						msg = Replace(msg, "<divforemote" + inner_emote + "</divforemote>", "");
					}
				}
				console.log(msg);
				textarea.innerText = msg;
				var event = new KeyboardEvent("keypress",
				{
					keyCode: 13,
					bubbles: false,
					cancelable: false
				});
				textarea.dispatchEvent(event);
				ggextraemotes_msg_input.innerHTML = "";
				setTimeout(function() { ggextraemotes_msg_input.innerHTML = "" }, 100);
			}
		}
		text_block.prepend(ggextraemotes_msg_input);


		var observer = new MutationObserver(function(mutations)
		{
			for (var i = 0; i < mutations.length; i++)
			{
				var smile_div = document.createElement("divforemote");
				smile_div.setAttribute("contenteditable", false);
				var element = mutations[i].addedNodes[0];
				if (!element) { continue; }
				if (!IsElement(element)) { continue; }
				smile_div.append(element);
				ggextraemotes_msg_input.append(smile_div);
			}
		});
		observer.observe(textarea, { childList: true, subtree: true });
	}
}

async function AddEmojis()
{
	var smile_list = await WaitElementByXPath('//*[@id="smiles"]//div[@class="smile-list"]');
	var ggextraemotes = smile_list.getElementsByClassName("ggextraemote")[0];
	if (!ggextraemotes)
	{
		for (var i = 0; i < window.ggextraemotes_urls.length; i++)
		{
			var emoji = document.createElement("img");
			emoji.src = window.ggextraemotes_urls[i];
			emoji.className = "ggextraemote";
			emoji.onclick = function()
			{
				var custom_input = document.getElementById("ggextraemotes_msg_input");
				custom_input.innerHTML += '<img class="ggextraemote_in_input" src="' + this + '">';
			}.bind(window.ggextraemotes_urls[i]);
			smile_list.prepend(emoji);
		}
	}
}

async function WaitElementByXPath(xpath)
{
	var promise = await new Promise(function(resolve, reject)
	{
		var interval = setInterval(function()
		{
			var element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			if (element)
			{
				clearInterval(interval);
				resolve(element);
			}
		}, 50);
	});
	return promise;
}

function Replace(str, a, b)
{
	var ret = str;
	while (ret.indexOf(a) > -1)
	{
		ret = ret.replace(a, b);
	}
	return ret;
}

function IsElement(obj)
{
	try
	{
		return obj instanceof HTMLElement;
	}
	catch(e)
	{
		return false;
	}
}

/*function AddEmojisButton()
{
	var chat_control_block = document.getElementsByClassName("chat-control-block")[0];
	var control_wrapper = chat_control_block.getElementsByClassName("control__wrapper")[0];

	var emoji_btn = document.createElement("div");

	emoji_btn.id = "emoji_btn_84256"
	emoji_btn.className = "vertical_align";
	emoji_btn.innerText = "😉"
	emoji_btn.addEventListener("click", function()
	{
		alert("click");
	});
	control_wrapper.append(emoji_btn);
}*/
