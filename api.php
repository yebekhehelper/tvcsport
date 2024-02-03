<?php

$baseUrl = "https://streambtw.com/";
$urlData = file_get_contents($baseUrl);


$level1Pattern = '/<ul class="list-group list-group-flush"><center>Football \/ Soccer<\/center>([\s\S]*?)<\/ul>/';
preg_match_all($level1Pattern, $urlData, $level1Matches);

$level2Data = $level1Matches[1][0];
$level2Pattern = '/<a href="(.*?)".*?>(.*?)<\/a>/';
preg_match_all($level2Pattern, $level2Data, $level2Matches);

$output = [
    [
        "streamUrl" => "https://at.ayas.ir/hls2/persiana.m3u8",
        "streamName" => "PERSIANA SPORT",
        "timeStamp" => time()
    ],
    [
        "streamUrl" => "https://live.aionet.ir/hls/aiosport/aiosport.m3u8",
        "streamName" => "AIO SPORT",
        "timeStamp" => time()
    ]
];

foreach ($level2Matches[1] as $key => $streamPage) {
    $streamPageData = file_get_contents($streamPage);
    $streamUrlPattern = '/var player = new Clappr\.Player\({source: "(.*?)",/';
    $extractStreamUrl = preg_match_all($streamUrlPattern, $streamPageData, $streamUrlMatches);

    $output[] = [
        "streamUrl" => $streamUrlMatches[1][0],
        "streamName" => $level2Matches[2][$key],
        "timeStamp" => time()
    ];
}

file_put_contents("todayMatches.json", json_encode($output, JSON_PRETTY_PRINT));
