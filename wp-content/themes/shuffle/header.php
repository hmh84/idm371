
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php wp_title(''); ?></title>
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<header class="header">
    <a href="<?php echo get_site_url(); ?>"  class="header__icon-link"> 
        <img src="<?php bloginfo('template_directory'); ?>/dist/images/shuffle_icon.png" alt="Shuffle" class="header__icon">
    </a>
    <?php wp_nav_menu(['theme_location' => 'primary_menu', 'container' => false]); ?>
</header>