<?php get_header();?>
<?php if (have_posts()): ?>
<main class="main-content">
<h1 class="archive-page-title">Weekly Status Reports</h1>
<?php while (have_posts()) : the_post(); ?>
    <?php
      $week = get_field('sr_week_number');
    ?>
    <div class="archive-grid">
    
    <a href="<?php the_permalink(); ?>">
    <div class="archive-grid-item">
        <h2><?php the_title(); ?></h2>
        <pre>Week <?php echo $week; ?> Status Report</pre>
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