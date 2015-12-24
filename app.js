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
	
	$scope.style={};
	$scope.style.bgcolor="#2196F3";
	/*
	$mdl-red: #F44336;
	$mdl-pink: #E91E63;
	$mdl-purple: #9C27B0;
	$mdl-deep-purple: #673AB7;
	$mdl-indigo: #3F51B5;
	$mdl-blue: #2196F3;
	*/
	
	function scrollToBottom(){
		setTimeout(function(){
			$("#messages").scrollTop(getTotalHeight() - getScrollBufferHeight());
			//updateStretchyScroll();
		},10);
	}
	$(scrollToBottom);
	function scrollToBottomIfAtBottom(){
		if($("#messages").scrollTop() + 10 > getTotalHeight() - getScrollBufferHeight())
			scrollToBottom();
	}
	$scope.messages.$loaded(scrollToBottomIfAtBottom);
	$scope.messages.$watch(scrollToBottomIfAtBottom);
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

function getScrollBufferHeight(){
	//should correspond with ul#messages padding-top and padding-bottom.
	var heightPx = 0;
	return heightPx;
}
function getTotalHeight(){
	var heightPx = getScrollBufferHeight();
	var totalHeight = $("ul#messages").prop("scrollHeight") //Get scroll height
		- $("ul#messages").height() //Account for not scrolling down all the way to the bottom edge, missing by height
		- 2 * heightPx; //Account for jQuery not counting padding
	return totalHeight;
}

/*var st;
function updateStretchyScroll(){
	var heightPx = getScrollBufferHeight();
	
	var totalHeight = getTotalHeight();
	
	if(st <= heightPx){
		
		st = $("ul#messages").scrollTop();
		if(st < 0) st = 0;
		
		st = st * 0.8 + heightPx * 0.2;
		$("ul#messages").scrollTop(st);
	}else if(st >= totalHeight - heightPx){
		var totalHeight = getTotalHeight();
		
		st = $("ul#messages").scrollTop();
		if(st > totalHeight) st = totalHeight;
		
		st = st * 0.8 + (totalHeight - heightPx) * 0.2;
		$("ul#messages").scrollTop(st);
	}else{
		st = $("ul#messages").scrollTop();
	}
}*/

$(function(){
	$("#username").focus();
	$("ul#messages").css({opacity:1});
	//$("ul#messages").scroll(updateStretchyScroll);
	//setInterval(updateStretchyScroll,100);
});
