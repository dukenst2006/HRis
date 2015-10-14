var elixir = require('laravel-elixir');

/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Sass
 | file for our application, as well as publishing vendor resources.
 |
 */

var paths = {
    'jquery': './vendor/bower_components/jquery/',
    'vue': './vendor/bower_components/vue/',
    'router': './vendor/bower_components/vue-router/',
    'bootstrap': './vendor/bower_components/bootstrap-sass/assets/',
    'fontawesome': './vendor/bower_components/font-awesome/',
    'cookies': './vendor/bower_components/cookies-js/',
    'bourbon': './vendor/bower_components/bourbon/app/assets/',
    'dropzone': './vendor/bower_components/dropzone/',
    'datepicker': './vendor/bower_components/bootstrap-datepicker/',
    'jasny': './vendor/bower_components/jasny-bootstrap/',
    'icheck': './vendor/bower_components/iCheck/',
    'chosen': './vendor/bower_components/chosen/',
    'metisMenu': './vendor/bower_components/metisMenu/',
    'slimScroll': './vendor/bower_components/slimScroll/',
    'sweetalert2': './vendor/bower_components/sweetalert2/',
    'inspinia': './resources/assets/sass/inspinia/'
}

elixir(function (mix) {
    mix.sass("*.*", 'public/css/app.css', {includePaths: [paths.bootstrap + 'stylesheets', paths.fontawesome + 'scss', paths.bourbon + 'stylesheets']});
    mix.sass("inspinia/style.sass", 'public/css/inspinia.css');
    mix.styles([
        'public/css/app.css',
        'public/css/animate.css',
        'public/css/icheck.css',
        paths.datepicker + 'dist/css/bootstrap-datepicker3.min.css',
        paths.jasny + 'dist/css/jasny-bootstrap.min.css',
        paths.metisMenu + 'dist/metisMenu.min.css',
        paths.sweetalert2 + 'dist/sweetalert2.css',
        'public/css/inspinia.css'
    ], 'public/css/all.css', './');//.version('public/css/app.css');
    mix.copy(paths.bootstrap + 'fonts/bootstrap/**', 'public/fonts/bootstrap')
        .copy(paths.fontawesome + 'fonts/**', 'public/fonts/fontawesome')
        .copy(paths.chosen + '*.png', 'public/images')
        .copy('resources/assets/tinymce/**', 'public/tinymce');
    mix.scripts([
        paths.jquery + "dist/jquery.js",
        paths.bootstrap + "javascripts/bootstrap.js",
        paths.cookies + "dist/cookies.js",
        paths.vue + "dist/vue.js",
        paths.router + "dist/vue-router.js",
        paths.dropzone + "dist/dropzone.js",
        paths.datepicker + "dist/js/bootstrap-datepicker.min.js",
        paths.jasny + "dist/js/jasny-bootstrap.min.js",
        paths.icheck + "icheck.min.js",
        paths.chosen + "chosen.jquery.min.js",
        paths.metisMenu + "dist/metisMenu.min.js",
        paths.slimScroll + "jquery.slimscroll.min.js",
        paths.sweetalert2 + "dist/sweetalert2.min.js",
        "resources/assets/js/vendor/ie10-viewport-bug-workaround.js",
        "resources/assets/js/vendor/inspinia.js",
        "resources/assets/js/vendor/custom.js",
    ], 'public/js/vendor.js', './')
        .browserify('default.js', 'public/js/default.js')
        .browserSync({proxy : 'https://hris-vue.dev'});
        /*.version([
         'js/vendor.js',
         'js/default.js',
         'js/user.js',
         'js/admin.js'
         ])*/;
});
