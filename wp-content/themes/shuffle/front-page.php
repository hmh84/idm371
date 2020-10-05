<?php get_header();?>
<main class="fp-main-content">
  <?php while (have_posts()) : the_post(); ?>

  <?php
      $fp_logo = get_field('fp_logo');
      $fp_roles = get_field('fp_roles');
   ?>
    <div class="fp-container">
        <?php if($fp_logo) : ?>
            <img src="<?php echo $fp_logo['url']; ?>" alt="<?php echo $fp_logo['alt']; ?>">
        <?php endif; ?>
    </div>
    </div>
  <?php endwhile; ?>
</main>
<?php get_footer(); ?>