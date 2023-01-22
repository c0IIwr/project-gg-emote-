chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	if (request.action == "MainScriptRecieved")
	{
		eval(request.script);
	}
});

chrome.runtime.sendMessage({ "action":"GetMainScript", "url":"https://s1ye.github.io/GGExtraEmotes/js/main.js" });