// Dependencies
var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var sass = require('gulp-sass');
var notifier = require('node-notifier');
var path = require('path');
var canCall = true;

// Task
gulp.task('default', function() {

   gulp.watch('css/*.scss', ['compile-sass']);

   gulp.task('compile-sass', function() {
      return gulp.src('css/*.scss')
         .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
         .pipe(gulp.dest('css/'));
   });

   // configure nodemon
   nodemon({
      // the script to run the app
      script: 'server.js',
      ext: 'js,html,css',
      ignore: ['css/styles.scss', 'Gulpfile.js']
   }).on('restart', function() {
      if (!canCall) { return; }
      notifier.notify({ title: 'Node server', message: 'Server restarted', icon: path.join(__dirname, 'favicon.png') });
      canCall = false;
      setTimeout(function() {
            canCall = true;
      }, 3000);   
});
});