async function Get(url)
{
	try
	{
		var response = await fetch(url);
		var text = await response.text();
		return text;
	}
	catch(e)
	{
		return "Error";
	}
};

async function onRequest(request, sender, callback)
{
	if (request.action == "GET")
	{
		var server_response = await Get(request.url);
		var tabs = await chrome.tabs.query({active: true, lastFocusedWindow: true});
		chrome.tabs.sendMessage(tabs[0].id, { "action": "ServerResponse", "response": server_response }, function(response) {});
		var response = await chrome.tabs.sendMessage(tab.id,
		{
			"action": "ServerResponse",
			"response":server_response
		}, function() {});
	}
	else if (request.action == "GetMainScript")
	{
		var server_response = await Get(request.url);
		var tabs = await chrome.tabs.query({active: true, lastFocusedWindow: true});
		chrome.tabs.sendMessage(tabs[0].id, { "action": "ServerResponse", "response": server_response }, function(response) {});
		var response = await chrome.tabs.sendMessage(tab.id,
		{
			"action": "MainScriptRecieved",
			"response":server_response
		}, function() {});
	}
};

chrome.runtime.onMessage.addListener(onRequest);
