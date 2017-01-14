<?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");

	$users = file_get_contents('./files/users.json');
	//$circles = file_get_contents('./files/circles.json');
	//$events = file_get_contents('./files/events.json');
	$jsonu = json_decode($users, true);
	if(array_key_exists($_POST["username"], $jsonu["users"]))
		echo '{ "status" : "nok", "message" : "User with username ' . $_POST["username"] . ' already exists" }';
	elseif(array_key_exists($_POST["username"], $jsonu["admins"]))
		echo '{ "status" : "nok", "message" : "User with username ' . $_POST["username"] . ' already exists" }';
	else
		echo '{ "status" : "ok", "referal" : "calendar.html", "cookie" : "' . hash('sha256', $_POST["username"] . $_POST["password"], false) . '" }';
	
?>