var app = angular.module("sampleApp", ["firebase"]);

app.factory("ChatRoom", function($firebaseArray) { return function(room) {
	var ref = new Firebase("https://socsem.firebaseio.com/" + room);
	return $firebaseArray(ref);
}});



app.controller("ChatCtrl", function($scope, ChatRoom) {
	if(QueryString.room !== undefined)
		$scope.room = QueryString.room;
	else
		window.location.replace("index.html");
	$scope.messages = ChatRoom($scope.room);
	function scrollToBottom(){
		if($("#messages").scrollTop()+$("#messages").height()+10>$("#messages").prop("scrollHeight"))
			setTimeout(function(){
				$("#messages").scrollTop($("#messages").prop("scrollHeight"));
			},10);
	}
	$scope.messages.$loaded(scrollToBottom);
	$scope.messages.$watch(scrollToBottom);
	$scope.addMessage = function(){
		if(!$scope.username){
			smoothAlert("You need a username!",-1);
			document.getElementById("username").focus();
		}
		else if(!$scope.newmsg){
			smoothAlert("No message",-1);
			document.getElementById("newmsg").focus();
		}else{
			$scope.messages.$add({from:$scope.username.toUpperCase(),content:$scope.newmsg});
			$scope.newmsg = "";
			document.getElementById("newmsg").focus();
		}
	};
});

//http://stackoverflow.com/a/979995/1181387
var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
    return query_string;
}();

function smoothAlert(message, disposition){
	var alertElem = $(document.createElement("div"))
		.text(message)
		.addClass((disposition > 0)?"alert pos":(disposition < 0)?"alert neg":"alert neut")
		.appendTo($("#smoothalerts"));
	setTimeout(function(){alertElem.css({opacity:0});}, 3000);
	setTimeout(function(){alertElem.remove();}, 5000);
}

$(function() {
	document.getElementById("username").focus();
});
