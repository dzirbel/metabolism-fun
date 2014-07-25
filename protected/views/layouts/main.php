<!DOCTYPE html>
<html lang="en">

<head>

<link rel="stylesheet" href="/lib/font-awesome-4.1.0/css/font-awesome.min.css">

<script src="/lib/jquery-1.11.0.min.js"></script>
<script src="/lib/jquery.animate-colors-min.js"></script>
<script src="/lib/jquery.animate-shadow.js"></script>
<script src="/lib/jquery.mousewheel.js"></script>

<?php foreach (glob("css/*.css") as $css): ?>
    <link type='text/css' rel='stylesheet' href='/<?= $css ?>'>
<?php endforeach;
foreach (glob("css/themes/*/*.css") as $css): ?>
    <link type='text/css' rel='stylesheet' href='/<?= $css ?>'>
<?php endforeach;
foreach (glob("js/*.js") as $js): ?>
    <script src='/<?= $js ?>'></script>
<?php endforeach; ?>

<meta name="description" content="<?= Yii::app()->name ?>">
<meta name="language" content="en">

<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

<script>
$(document).ready(function() {
    setWorking(false);
    $('.accordian-header').first().addClass('active');
    onResize();
    selectOrgan($('.accordian-header.active').organ());
    setTurn(0, -1);
    setPoints(0);
    $('.theme[theme=<?= User::getCurrentTheme()["theme"] ?>]').find('.select').click();
    log('Welcome to <?= Yii::app()->name ?>!');
});
</script>

<title><?= Yii::app()->name ?></title>
</head>

<body> <?= $content; ?> </body>

</html>
