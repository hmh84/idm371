<?php
/**
 * Set Custom WP Login Logo
 *
 * @link https://www.wpexplorer.com/limit-wordpress-search/
 * @return void
 */
function my_login_logo() { ?>
    <style type="text/css">
        #login h1 a, .login h1 a {
            background-image: url(<?php echo get_stylesheet_directory_uri(); ?>/dist/images/shuffle_icon.png);
        margin: auto;
        height: 150px;
        width: 150px;
        background-size: 150px 150px;
		background-repeat: no-repeat;
        border-radius: 100px;
        }
    </style>
<?php }
add_action( 'login_enqueue_scripts', 'my_login_logo' );

/*
 * Enable support for Post Thumbnails on posts and pages.
 * @link https://developer.wordpress.org/themes/functionality/featured-images-post-thumbnails/
*/
function add_post_thumbnails_support() {
    add_theme_support('post-thumbnails');
}
add_action('after_setup_theme', 'add_post_thumbnails_support');

/*
 * Enable support for Page excerpts.
 * @link https://www.wpbeginner.com/plugins/add-excerpts-to-your-pages-in-wordpress/
*/
add_post_type_support( 'page', 'excerpt' );

/*
 * Remove support for Posts.
 * @link https://wordpress.stackexchange.com/questions/36123/how-to-disable-posts-and-use-pages-only
*/
function remove_posts_menu() {
    remove_menu_page('edit.php');
}
add_action('admin_menu', 'remove_posts_menu');

/**
 * Include any styles into the site the proper way
 *
 * @link https://developer.wordpress.org/reference/functions/wp_enqueue_style/
 */
function include_css_files() {
    // Example of including a style local to your theme root
    wp_enqueue_style('normalize-cs', get_template_directory_uri() . '/node_modules/normalize.css/normalize.css');
    wp_enqueue_style('shuffle-css', get_template_directory_uri() . '/dist/css/style.css');
}

// When WP performs this action, call our function
add_action('wp_enqueue_scripts', 'include_css_files');


/**
 * Include any scripts into the site the proper way
 *
 * @link https://developer.wordpress.org/reference/functions/wp_enqueue_script/
 */
function include_js_files() {
    // wp_deregister_script('jquery');
	// wp_enqueue_script('jquery', 'https://code.jquery.com/jquery-3.5.1.min.js', [], null, true);
    
    // Font Awesome icons
    // wp_enqueue_script('font-awesome', 'https://kit.fontawesome.com/080c06f1d6.js');

    // CUSTOM JS
    // wp_enqueue_script('shuffle-js', get_template_directory_uri() . '/dist/scripts/scripts.js', ['jquery'], null, true);
}

// When WP performs this action, call our function
add_action('wp_enqueue_scripts', 'include_js_files');

/**
 * Register the menus on my site
 *
 * @link https://developer.wordpress.org/reference/functions/register_nav_menus/
 * @return void
 */
function register_theme_navigation() {
    register_nav_menus([
        'primary_menu' => 'Primary Menu',
    ]);
}

add_action('after_setup_theme', 'register_theme_navigation');