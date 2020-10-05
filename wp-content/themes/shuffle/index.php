<?php get_header();?>
<main class="p-main-content">
  <?php while (have_posts()) : the_post(); ?>
    <div class="container">
      <h1><?php the_title(); ?></h1>
      <?php the_post_thumbnail(); ?>
      <?php the_content(); ?>
    </div>
    </div>
  <?php endwhile; ?>
</main>
<?php get_footer(); ?>