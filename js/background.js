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
		return "ERROR";
	}
};

async function onRequest(request, sender, callback)
{
	if (request.action == "GET")
	{
		Get(request.url)
		.then(function(response)
		{
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
			{
				chrome.tabs.sendMessage(tabs[0].id, { "action": "ResponseReceived", "url":request.url, "response": response }, function(response) {});
			});
		});
	}
};

chrome.runtime.onMessage.addListener(onRequest);
