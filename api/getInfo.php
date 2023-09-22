<?php
function sj($a, $b, $c)
{
    if ($b == null) {
        $j1 = 0;
        $j2 = 0;
    } else {
        $j1 = strpos($a, $b);
        $j2 = strlen($b);
    }
    $j3 = strlen($a);
    $j4 = ($j1 + $j2);
    $j5 = ($j3 - $j4);
    $j6 = substr($a, $j4, $j5);
    if ($c == null) {
        $j7 = $j5;
    } else {
        $j7 = strpos($j6, $c);
    }
    $j8 = substr($j6, 0, $j7);
    return $j8;
}
$url = 'https://pc.qq.com' . $_GET['detail'];
$ym = file_get_contents($url);
if (strpos($ym, '<div class="part1"')) {
    $imgu = sj($ym, '<div class="part1" style="background-image: url(', ')');
    $newdata = array(
        'type' => 1,
        'imgu' => $imgu
    );
} else {
    $time = sj($ym, '<li class="first">发布时间：', '</li>');
    $filesize = sj($ym, '<li>大小：', '</li>');
    $version = sj($ym, '<li>版本：', '</li>');
    $sup = sj($ym, '<li class="first">支持系统：', '</li>');
    $wei = sj($ym, '<li>位数：', '</li>');
    $msg = sj($ym, '<div class="cont-content">', '</div>');
    $ym = sj($ym, '<div class="slider" id="J_slider">', null);
    $ym = sj($ym, '<div class="slide">', null);
    $list = explode('<div class="slide">', $ym);
    $newdata = array(
        'type' => 0,
        'time' => $time,
        'filesize' => $filesize,
        'version' => $version,
        'sup' => $sup,
        'wei' => $wei,
        'msg' => $msg,
        'imgu' => array()
    );
    for ($x = 0; $x < count($list); $x++) {
        $newdata['imgu'][$x] = 'http:' . sj($list[$x], 'src="', '"');
    }
}
echo json_encode($newdata, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
