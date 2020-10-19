<?php get_header();?>
<?php if (have_posts()): ?>
<main class="main-content">
<h1 class="archive-page-title">Weekly Status Reports</h1>
<div class="archive-grid">
<?php while (have_posts()) : the_post(); ?>
    <?php
      $postnum = get_field('sr_post_number');
    ?>
    
    <a href="<?php the_permalink(); ?>">
    <div class="archive-grid-item">
        <h2><?php the_title(); ?></h2>
        <pre>Post <?php echo $postnum; ?> Status Report</pre>
    </div>
    </a>
    <?php endwhile; ?>
    
    </div>

    <div>
      <?php the_posts_pagination( [
        'mid_size'           => 2,
        'screen_reader_text' => ' ',
       ] ); 
      ?>
    </div>

  <?php else: ?>
    <h1>No Results Found!</h1>
  <?php endif; ?>
</main>
<?php get_footer(); ?>