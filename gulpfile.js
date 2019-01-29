const { src, dest,series,watch} = require('gulp');
const concat = require("gulp-concat");
const livereload = require('gulp-livereload');
const uglify = require('gulp-uglify');
const changed = require('gulp-changed');
const inject = require('gulp-inject');
const image = require('gulp-image');

const paths = {
  dev: "dev",
  dist : "dist",
  src:"src"
}

var FROM = paths.src;
var TO = paths.dev;
var MODE = "dev";

function development(cb){
  FROM = paths.src;
  TO = paths.dev;
  MODE = "dev";
  cb()
}

function production(cb){
  FROM = paths.src;
  TO = paths.dist;
  MODE = "prod"
  cb();
}

function htmlInject(cb){

  var sources = src([TO+'/js/**/*.js', TO+'/css/**/*.css'], {read: false});
  return src(TO + "/index.html")
  .pipe(inject(sources,{relative:true}))
  .pipe(dest(TO));

  cb();
}

function html(cb){

    return src(FROM + "/index.html")
    .pipe(dest(TO+"/"));
    cb();

}

function img(cb){
    return src(FROM+"/img/**/*")
    .pipe(image())
    .pipe(dest(TO));
    cb();
}

function js(cb) {
  // place code for your default task here
  var obj = src(FROM + "/js/**/*.js")

  if(MODE == "prod"){
    obj=obj.pipe(concat("index.min.js"))
    .pipe(uglify());
  }else{
    // only check changes if in dev mode
    obj = obj.pipe(changed(TO));
  }

  return obj.pipe(dest(TO+"/js"));

  cb();
}

function css(cb){
  var obj  = src(FROM + "/css/**/*.css")

  if(MODE == "prod"){
    obj=obj.pipe(concat("styles.css"));

  }else{
    // only check changes if in dev mode
    obj = obj.pipe(changed(TO));
  }


  return obj.pipe(dest(TO+"/css"));
  cb();
}


var watchTimer;
var _renderQueue = [];

function startWatch(cb){

  watch(['src/js/*.js',"src/css/*.css","src/*.html"], function(cb) {
    addToRenderQueue(css);
    cb();
  });

}

function renderQueue(){

  // remove duplicates in render queue
  _renderQueue = [...new Set(_renderQueue)];
  console.log("render queue",_renderQueue);
  _renderQueue = [];
}

function addToRenderQueue(callback){

  _renderQueue.push(callback);

  if(watchTimer){
    clearTimeout(watchTimer);
    watchTimer = null;
  }
  watchTimer = setTimeout(renderQueue,4000);

}



const render = series(js,css,html,htmlInject);
exports.default = series(development,render,startWatch);
exports.build = series(production,render);
