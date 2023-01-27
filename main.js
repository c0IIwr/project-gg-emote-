(async () =>
{
	document.addEventListener('copy', function(e)
	{
		var text = window.getSelection().toString();
		e.clipboardData.setData('text/plain', text);
		e.preventDefault();
	});

	window.extraemotes_urls = await GetEmotesUrls();
	InfinityAddNickClickEvent();
	InfinityAddCustomInput();
	InfinityAddEmojis();

	async function InfinityAddNickClickEvent()
	{
		await AddNickClickEvent();
		setTimeout(InfinityAddNickClickEvent, 500);
	}

	async function InfinityAddCustomInput()
	{
		await AddCustomInput();
		setTimeout(InfinityAddCustomInput, 500);
	}

	async function InfinityAddEmojis()
	{
		await AddEmojis();
		setTimeout(InfinityAddEmojis, 500);
	}

	async function AddNickClickEvent()
	{
		await GetElementByXPath('//div[@class="tse-content"]//chat-user');
		var chat_section = await GetElementByXPath('//div[@class="tse-content"]');
		var chat_users = chat_section.getElementsByTagName("chat-user");
		for (var i = 0; i < chat_users.length; i++)
		{
			if (chat_users[i].getAttribute("ggextraemotes_has_event")) { continue; }
			chat_users[i].setAttribute("ggextraemotes_has_event", true);
			var nickname = Replace(chat_users[i].innerText, " ", "");
			chat_users[i].onclick = function()
			{
				var custom_input = document.getElementById("ggextraemotes_msg_input");
				custom_input.innerHTML += "&nbsp;" + this + ',&nbsp;';
			}.bind(nickname);
		}
	}

	async function AddCustomInput()
	{
		if (document.getElementById("ggextraemotes_msg_input")) { return; }
		var text_block = await GetElementByXPath('//div[@class="chat-control-block"]//div[@class="text-block ng-scope"]');
		var textarea = await GetElementByXPath('//div[@class="chat-control-block"]//div[@class="textarea"]');
		textarea.style = "display: none";
		var ggextraemotes_msg_input = document.createElement("div");
		ggextraemotes_msg_input.id = "ggextraemotes_msg_input";
		ggextraemotes_msg_input.className = "textarea";
		ggextraemotes_msg_input.setAttribute("contenteditable", true);
		ggextraemotes_msg_input.setAttribute("placeholder", "Написать сообщение...");

		/*ggextraemotes_msg_input.onpaste = async function(event)
		{
			//event.preventDefault();
			var clipboard_data = (event.clipboardData || window.clipboardData);
			const clipboardItems = clipboard_data.items;
		    for (const clipboardItem of clipboardItems)
		    {
		    	console.log(clipboardItem);
		    }
			clipboard_data.clearData('text/plain');
			clipboard_data.clearData('text/html');
			//var text = clipboard_data.getData('text');
			//return false;
		}*/
		ggextraemotes_msg_input.onkeyup = function(event)
		{
			if (event.keyCode != 13) { return; }
			var msg = ggextraemotes_msg_input.innerHTML;
			msg = Replace(msg, "<div>", "");
			msg = Replace(msg, "</div>", "");
			msg = Replace(msg, "<br>", "");
			msg = Replace(msg, "&nbsp;", " ");
			msg = Replace(msg, "\n", "");
			msg = Replace(msg, "\r", "");
			msg = Replace(msg, "\t", "");
			for (var i = 0; i < window.extraemotes_urls.length; i++)
			{
				var replace = '<img class="ggextraemote_in_input" src="' + window.extraemotes_urls[i] + '">';
				msg = Replace(msg, replace, ' ' + window.extraemotes_urls[i] + ' ');
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
			console.log("Отправлено: '" + msg + "'");
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

	async function AddEmojis()
	{
		var smile_list = await GetElementByXPath('//*[@id="smiles"]//div[@class="smile-list"]');
		if (smile_list.getElementsByClassName("ggextraemote")[0]) { return; }
		for (var i = 0; i < window.extraemotes_urls.length; i++)
		{
			var emoji = document.createElement("img");
			emoji.src = window.extraemotes_urls[i];
			emoji.className = "ggextraemote";
			emoji.onclick = function()
			{
				var custom_input = document.getElementById("ggextraemotes_msg_input");
				custom_input.innerHTML += '<img class="ggextraemote_in_input" src="' + this + '">';
			}.bind(window.extraemotes_urls[i]);
			smile_list.prepend(emoji);
		}
	}

	async function GetElementByXPath(xpath)
	{
		return await new Promise(function(resolve, reject)
		{
			var interval = setInterval(function()
			{
				var element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
				if (!element) { return; }
				clearInterval(interval);
				resolve(element);
			}, 50);
		});
	}

	async function GetEmotesUrls()
	{
		var EMOTES_LIST_URL = "https://s1ye.github.io/GGExtraEmotes/list.txt";
		var EMOTES_URL = "https://s1ye.github.io/GGExtraEmotes/emotes/";
		return await new Promise(async function(resolve, reject)
		{
			async function InnerGetEmotesUrls()
			{
				try
				{
					var emotes_urls = await Get(EMOTES_LIST_URL, false);
					if (emotes_urls.length < 150) { return setTimeout(InnerGetEmotesUrls, 500); }
					if (emotes_urls == "ERROR") { return setTimeout(InnerGetEmotesUrls, 500); }
					var tmp = emotes_urls.split("\n");
					for (var i = 0; i < tmp.length; i++)
					{
						tmp[i] = EMOTES_URL + tmp[i];
						tmp[i] = Replace(tmp[i], "\n", "");
						tmp[i] = Replace(tmp[i], "\r", "");
						tmp[i] = Replace(tmp[i], "\t", "");
					}
					resolve(tmp);
				}
				catch(e) { }
			}
			await InnerGetEmotesUrls();
		});
	}

	async function Get(url, cache)
	{
		try
		{
			var response = "";
			if (cache) { response = await fetch(url); }
			else { response = await fetch(url, {cache: "no-cache"}); }
			return await response.text();
		}
		catch(e) { return "ERROR"; }
	};

	function Replace(str, a, b)
	{
		while (str.indexOf(a) > -1) { str = str.replace(a, b); }
		return str;
	}

	function IsElement(obj)
	{
		try { return obj instanceof HTMLElement; }
		catch(e) { return false; }
	}
})();
