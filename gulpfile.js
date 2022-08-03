const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");
const gulp = require("gulp");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const tsify = require("tsify");
const watchify = require("watchify");
const gutil = require("gulp-util");
const uglify = require("gulp-uglify");
const sourcemaps = require("gulp-sourcemaps");
const buffer = require("vinyl-buffer");
const clean = require("gulp-clean"); //清理文件或文件夹
const standalonify = require("standalonify");
var merge = require("merge2");
gulp.task("clean", function () {
  return gulp.src("dist/*", { read: false }).pipe(clean());
});

gulp.task("tsc", function () {
  var tsResult = tsProject.src().pipe(tsProject());
  return merge([
    tsResult.dts.pipe(gulp.dest("dist")),
    tsResult.js.pipe(gulp.dest("dist")),
  ]);
});
gulp.task("copy_file", function () {
  return gulp
    .src(["./src/**/*.js", "./src/**/*.json", "./src/**/*.d.ts"], {
      base: "./src",
    })
    .pipe(gulp.dest("dist"));
});
gulp.task("browserify", function () {
  tsProject.config.exclude = "";
  return browserify({
    basedir: ".",
    debug: true,
    entries: ["src/index.browser.ts"],
    cache: {},
    packageCache: {},
    // fullPaths: true,
  })
    .plugin(tsify, tsProject.config)
    .plugin(standalonify, { name: "sensible" })
    .bundle()
    .pipe(source("metaContract.browser.min.js"))
    .pipe(buffer())
    .pipe(
      sourcemaps.init({
        loadMaps: true,
      })
    )
    .pipe(uglify())
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("dist"));
});

function dev() {
  gulp.watch(["src/**/*.ts", "src/**/*.d.ts"], gulp.series("tsc"));
  gulp.watch(["src/**/*.js"], gulp.series("tsc"));
}

gulp.task("default", gulp.series("clean", "tsc", "copy_file", "browserify"));
gulp.task("dev", gulp.series("clean", "tsc", "copy_file", "browserify", dev));
