var app = angular.module("ChatApp", ["firebase", "ngCookies", "linkify"]);

app.filter("moment",function(){
	function f(jstimestamp){
		return moment(parseInt(jstimestamp)).fromNow();
	}
	f.$stateful = true; //http://stackoverflow.com/a/34559665/1181387
	return f;
});

app.factory("ChatRoom", function($firebaseArray) { return function(room) {
	var ref = new Firebase("https://vocative.firebaseio.com/" + room + "/messages");
	return $firebaseArray(ref);
}});

app.controller("ChatCtrl", function($scope, ChatRoom, $cookies, $firebaseObject, $interval) {
	if(QueryString.room !== undefined && QueryString.room)
		$scope.room = QueryString.room;
	else
		window.location.replace("index.html");
	
	$firebaseObject(new Firebase("https://vocative.firebaseio.com/" + $scope.room + "/style"))
		.$bindTo($scope,"style").then(function(){
			if(!$scope.style.bgcolor)$scope.style.bgcolor = "gray";
			if(!$scope.style.altcolor)$scope.style.altcolor = "black";
			if(!$scope.style.textcolor)$scope.style.textcolor = "white";
			if(!$scope.style.title)$scope.title =  $scope.room;
		});
	
	//http://stackoverflow.com/a/34559665/1181387
	var intervalPromise = $interval(function() {}, 1000);
	$scope.$on('$destroy', function() {
	   $interval.cancel(intervalPromise);
	});
	
	$scope.messages = ChatRoom($scope.room);
	//$scope.roomnbsp = $scope.room.replace(" ","\u00A0"); //unicode for nbsp https://stackoverflow.com/questions/12431125/angular-js-return-a-string-with-html-characters-like-nbsp
	$scope.admin = (QueryString.admin !== undefined);
	
	if($cookies.get("username")){
		$scope.username = $cookies.get("username");
		$("#newmsg").focus();
	}else
		$("#username").focus();
	
	$scope.$watch("username",function(newval){
		var exp = new Date();
		exp.setTime(exp.getTime() + 3600 * 1000); //http://stackoverflow.com/a/3795002
		$cookies.put("username",newval,{expiry:exp});
	});
	
	$scope.messages.$loaded(function(){$scope.loaded = true;});
	$scope.messages.$loaded(scrollNewMsg);
	$scope.messages.$watch(scrollNewMsg);
	$scope.addMessage = function(){
		if(!$scope.username){
			smoothAlert("You need a username!",-1);
			document.getElementById("username").focus();
		}
		else if(!$scope.newmsg){
			smoothAlert("No message",-1);
			document.getElementById("newmsg").focus();
		}else{
			$scope.messages.$add({
				from:$scope.username.toUpperCase(),
				content:$scope.newmsg,
				timestamp: (new Date()).getTime()
			});
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

function getScrollMax(){
	var totalHeight = $("ul#messages").prop("scrollHeight") //Get scroll height
		- $("ul#messages").height(); //Account for not scrolling down all the way to the bottom edge, missing by height
	return totalHeight;
}

function scrollToBottom(smoothly){
	if(smoothly)setTimeout(function(){$("#messages").animate({scrollTop: getScrollMax()},400);},10);
	else setTimeout(function(){$("#messages").scrollTop(getScrollMax());},10);
}
function scrollNewMsg(){
	if($("#messages").scrollTop() + 10 > getScrollMax())scrollToBottom();
	else $("main").addClass("unread");
}
$(function(){
	$("ul#messages").css({opacity:1}).scroll(function(){
		if($("#messages").scrollTop() + 10 > getScrollMax()) //same as in scrollNewMsg()
			$("main").removeClass("unread");
	});
	
	scrollToBottom();
	$("#newmsgalert").click(function(){scrollToBottom(true);});
	
	$(window).focus(function(){
		if(!$("#username").val())
			$("#username").focus();
		else
			$("#newmsg").focus();
	});
	
	$(window).click(function(){
		$("#admin-drawer").removeClass("slidout");
	});
	$(".admin-drawer-icon").click(function(e){
		$("#admin-drawer").addClass("slidout");
		e.stopPropagation();
	});
	$("#admin-drawer").click(function(e){
		e.stopPropagation();
	});
	$("#admin-drawer .x-out").click(function(e){
		$("#admin-drawer").removeClass("slidout");
	});
});
