<?php
/**
 *
 *  Register Custom Status Report Post Type
 *
 * @link https://developer.wordpress.org/reference/functions/register_post_type/
 * @return void
 */

function register_reports_post_type() {
    // MUSIC
    $singular = 'Status Report';
    $plural = 'Status Reports';

    $labels = [
    'name'                  => $plural,
    'singular_name'         => $singular,
    'archives'              => '' . $singular . ' Archives',
    'attributes'            => '' . $singular . ' Attributes',
    'all_items'             => 'All ' . $plural . '',
    'add_new_item'          => 'Add New ' . $plural . '',
    'add_new'               => 'Add New',
    'featured_image'        => 'Featured Image',
    'set_featured_image'    => 'Set featured image',
    'remove_featured_image' => 'Remove featured image',
    'use_featured_image'    => 'Use as featured image',
    'insert_into_item'      => 'Insert into ' . $singular . '',
    'uploaded_to_this_item' => 'Uploaded to this ' . $singular . '',
    'items_list'            => '' . $plural . ' list',
    'items_list_navigation' => '' . $plural . ' list navigation',
    'filter_items_list'     => 'Filter ' . $singular . ' list',
    ];

    $args = [
    'label'                 => $plural,
    'labels'                => $labels,
    'supports'              => [
        'title',
        'editor',
        'author',
        'thumbnail',
        'excerpt',
        'trackbacks',
        'custom-fields',
        'comments',
        'revisions',
        'page-attributes',
        'post-formats'
    ],
    'taxonomies'            => ['post_tag'],
    'hierarchical'          => false,
    'public'                => true,
    'show_ui'               => true,
    'show_in_menu'          => true,
    'menu_position'         => 5,
    'show_in_admin_bar'     => true,
    'show_in_nav_menus'     => true,
    'can_export'            => true,
    'has_archive'           => true,
    'exclude_from_search'   => false,
    'publicly_queryable'    => true,
    'show_in_rest'          => true,
    // Dash Icons https://developer.wordpress.org/resource/dashicons/#clipboard
    'menu_icon'             => 'dashicons-clipboard'
    // 'menu_icon'             => get_stylesheet_directory_uri() . '/static/images/icons/industries.png'
];

    register_post_type('report', $args);
}

add_action('init', 'register_reports_post_type', 0);