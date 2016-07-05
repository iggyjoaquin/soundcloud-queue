chrome.alarms.onAlarm.addListener(function(alarm){
	chrome.tabs.query({currentWindow: true}, function(tabs) {
	  chrome.tabs.sendMessage(tabs[0].id, {command: "check"}, function(response) {
	    console.log(response.commandResponse);
	  });
	});
});