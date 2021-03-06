// chrome.alarms.onAlarm.addListener(function(alarm){
// 	chrome.tabs.query({currentWindow: true}, function(tabs) {
// 	  chrome.tabs.sendMessage(tabs[0].id, {command: "check"}, function(response) {
// 	    console.log(response.commandResponse);
// 	  });
// 	});
// });
	

var paused;
var stream = new Audio();		
var counter = 0;
var songs = [];


SC.initialize({
	client_id: "672dd37d370de6fc46011a19cd62660d",
});



function songsGetter(){
	return songs;
}

function nextSong(){
	console.log("next song called");
	if (counter != (songs.length-1) ){
      counter ++;
      resolveAndPlayUrl();
  	}
}

function previousSong(){
	console.log("previous song called");
	if (counter != 0){
        counter --;
        resolveAndPlayUrl();
    }
}

function resolveAndPlayUrl(){
	if(!paused){
		SC.get("https://api.soundcloud.com/resolve/?url=" + songs[counter].url, {limit: 1}, function(result){
		    var xhr = new XMLHttpRequest();

		    client_id = '?client_id=d4ab52d80ed2e7790c3a243495b30093';
			xhr.open('GET', result.uri + client_id);
			xhr.onload = function(){
		  		var track = JSON.parse(xhr.responseText);
		  		stream.src = track.stream_url + client_id;
		  		stream.play();
			}; 
			xhr.send()
			paused = false;

		});
	} else {
		stream.play()
		paused = false;
	}
}

function pauseStream(){
	if (!paused){
		stream.pause();
		paused = true;
	} 
}

function pushSong(url){
	
	console.log(songs);

}

var port = chrome.runtime.connect({name: "extensionRequests"});
port.onMessage.addListener(function(req) {
  if (req.command == "getSongs"){
  	var songs = songsGetter();
    port.postMessage({songs: songs});
  }
});




chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.command == "play") {
      resolveAndPlayUrl();
      sendResponse({commandResponse: "playing"});
    } else if (request.command == "pause"){
      pauseStream(paused);
      sendResponse({commandResponse: "paused"});
    }  else if (request.command == "nextSong"){
      nextSong();
      sendResponse({commandResponse: "next song command processed"});
    } else if (request.command == "previousSong"){
      
      previousSong();
      sendResponse({commandResponse: "previous song command processed"});

    } else if (request.command == "addSong"){

    	var newObj = {
			"url" : "",
			"name" : "tempName",
			"artist": "tempArtistName"
		};

		newObj['url'] = request.url;
		songs.push(newObj);
    	sendResponse({commandResponse: "song added", songs:songs});

    }

    else if (request.command == "check"){
    	if(stream.ended){
			nextSong();
			sendResponse({commandResponse: "nextCalled"});
		} else {
			console.log("song playing");
			sendResponse({commandResponse: "stillPlaying"});
		}
    } 

    else if (request.command == "getSongs"){
    	console.log("getSongs called")
    	sendResponse({songs: songs});
    } 
    else if (request.command == "addSongContentScript"){

    	songs.push(request.song);
    	console.log(songs);
    	sendResponse({commandResponse: "payload received!"});
    }

});
