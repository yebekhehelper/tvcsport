<?php
$todayMatches = json_decode(file_get_contents("https://web-api.varzesh3.com/v1.0/livescore/today"), true);
$todayMatchesOutput = [
  "timeStamp" => time(),
  "todayMatches" => $todayMatches
];
file_put_contents("todayMatches.json", json_encode($todayMatchesOutput, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE)) ;
