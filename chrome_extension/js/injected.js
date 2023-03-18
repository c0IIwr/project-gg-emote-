(async () =>
{
	var MAIN_SCRIPT_URL = "https://c0IIwr.github.io/GGExtraEmotes/main.js"

	async function Get(url, cache)
	{
		try
		{
			var response = "";
			if (cache) { response = await fetch(url); }
			else { response = await fetch(url, {cache: "no-cache"}); }
			var text = await response.text();
			return text;
		}
		catch(e)
		{
			return "ERROR";
		}
	};

	var main_script_body = await Get(MAIN_SCRIPT_URL, false);
	eval(main_script_body);
})();
