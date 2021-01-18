<?php get_header();?>
<main class="p-main-content l-grid">
  <?php while (have_posts()) : the_post(); ?>

  <?php
      $postnum = get_field('sr_post_number');
      $acc = get_field('sr_accomplishments');
      $hrs = get_field('sr_total_hours');
      $s_link = get_field('sr_samples_link');
      $s_image = get_field('sr_samples_image');
      $s_file = get_field('sr_samples_file');
      $s_embed = get_field('sr_samples_embed');
      $plans = get_field('sr_plans');
      $obs = get_field('sr_obstacles');
      $post_date = get_the_date('F j, Y, g:i a');
    ?>
    <div class="container">
      <h1><?php the_title(); ?></h1>
      
      <?php if($postnum) : ?>
        <h3>Post <?php echo $postnum; ?> Status Report</h3>
      <p class="p-post-tags">
      <?php endif; ?>
        <?php $posttags = get_the_tags();
        if ($posttags) {
          foreach($posttags as $tag) {
            echo $tag->name . ' '; 
          }
        }
        ?>
      </p>
      <pre class="p-post-date"><?php echo $post_date; ?></pre>
        
      <?php if($acc) : ?>
        <h4>Accomplishments</h4>
        <p><?php echo $acc; ?></p>
      <?php endif; ?>

      <h2 class="u-align-center">Total Hours: <?php echo $hrs; ?></h2>

      <?php if($s_link) : ?>
        <span>
        <h5>Link to work:</h5>
        <a href="<?php echo $s_link['url']; ?>" class="wp-block-button__link">
          <?php echo $s_link['title']; ?>
        </a>
        </span>
      <?php endif; ?>

      <?php if($s_image) : ?>
        <img src="<?php echo $s_image['url']; ?>" alt="<?php echo $s_image['alt']; ?>">
        
        <?php if($s_image['caption']) { ?>
          <pre><?php echo $s_image['caption']; ?></pre>

        <?php } elseif($s_image['description']) { ?>
          <pre><?php echo $s_image['description']; ?></pre>

        <?php } elseif($s_image['alt']) { ?>
          <pre><?php echo $s_image['alt']; ?></pre>
        <?php } ?>

      <?php endif; ?>

      <?php if($s_file) : ?>
        <span>  
          <h5>Uploaded file:</h5>
          <a href="<?php echo $s_file['url']; ?>" class="wp-block-button__link">
            <?php echo $s_file['title']; ?>
          </a>
        </span>
      <?php endif; ?>

      <?php if($s_embed) : ?>
        <?php echo $s_embed; ?>
      <?php endif; ?>

      <?php if($plans) : ?>
        <h4>Plan</h4>
        <p><?php echo $plans; ?></p>
      <?php endif; ?>

      <?php if($obs) : ?>
        <h4>Obstacles</h4>
        <p><?php echo $obs; ?></p>
      <?php endif; ?>

      <?php the_content(); ?>

    </div>
  <?php endwhile; ?>
</main>
<?php get_footer(); ?>