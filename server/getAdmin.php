<?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");
	
	$users = file_get_contents('./files/users.json');
	$circles = file_get_contents('./files/circles.json');
	$events = file_get_contents('./files/events.json');
	$jsonu = json_decode($users, true);
	$jsonc = json_decode($circles, true);
	$jsone = json_decode($events, true);
	
	foreach($jsonu["admins"] as $username => $obj){
		if(hash('sha256', $username . $obj["password"], false) === $_GET["token"]){
			$resStr = '{ "status" : "ok", "circles" : ';
			$resStr .= $circles;
			$resStr .= ', "events" : ';
			$resStr .= $events;
			$resStr .= ', "users" : ';
			$resStr .= $users;
			$resStr .= ' }';
			echo $resStr;
			return;
		}
	}
	echo '{ "status" : "nok", "message" : "Log in to proceed", "referral" : "./index.html" }';

?>