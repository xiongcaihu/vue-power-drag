var cssmin = require('gulp-minify-css');
uglify = require('gulp-uglify');
var gulp = require("gulp");
var gutil = require("gulp-util");
var del = require("del");
var rename = require('gulp-rename');
var less = require('gulp-less');
var autoprefixer = require('autoprefixer');
var cached = require('gulp-cached');
var remember = require('gulp-remember');
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');
var minifyHTML = require('gulp-minify-html');
var babel = require('gulp-babel');
var cssgrace = require('cssgrace');
var cssnext = require('cssnext');
var postcss = require('gulp-postcss');
var browserSync = require('browser-sync');
var Q = require("q");

var mode = "dev"; //build 开发模式，dev是开发模式,build是生产模式

var src = {
    root: "src/",
    // html 文件
    html: "src/html/**/*.html",
    //js文件
    js: "src/js/*.js",
    //modules
    modules: "src/modules/**/*",
    //框架
    vendor: "src/vendor/**/*",
    // css
    css: "src/css/**/*",
    // 图片
    assets: "src/assets/**/*"
};

var dist = {
    root: "public/**/*",
    html: "public/html",
    js: "public/js",
    css: "public/css",
    modules: "public/modules",
    vendor: "public/vendor",
    assets: "public/assets"
};

var revPath = {
    js: "rev/js",
    css: "rev/css",
    assets: "rev/assets",
    json: "rev/**/*.json"
}

function watch() {
    gulp.watch(src.js, dealJs);
    gulp.watch(src.html, dealHtml);
    gulp.watch(src.css, dealCss);
}

/**
 * 复制modules里的所有文件
 * @return {[type]} [description]
 */
function dealModuls() {
    console.log("复制modules");
    delFile(dist.modules);
    return gulp.src(src.modules)
        .pipe(gulp.dest(dist.modules));
}

/**
 * 清除指定路径下的所有文件
 * @return {[type]}          [description]
 */
function delFile(path) {
    if(!/\*\*\/\*/ig.test(path)){
        path+="/**/*";
        console.log("path=" +path);
    }
    del.sync(path);
    console.log("路径" + path + "清除完成");
}

/**
 * 处理样式文件
 * @return {[type]}         [description]
 */
function dealCss() {
    console.log("处理css..");
    delFile(dist.css);
    var processors = [
        autoprefixer({
            browsers: ['last 3 version']
        }),
        cssnext,
        cssgrace
    ];
    if (mode == "build") {
        return gulp.src(src.css)
            .pipe(less())
            .pipe(postcss(processors))
            .pipe(cssmin({
                advanced: false, //类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
                compatibility: 'ie7', //保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
                keepBreaks: true, //类型：Boolean 默认：false [是否保留换行]
                keepSpecialComments: '*'
                    //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
            }))
            .pipe(rev())
            .pipe(gulp.dest(dist.css))
            .pipe(rev.manifest())
            .pipe(gulp.dest(revPath.css));
    } else {
        return gulp.src(src.css)
            .pipe(less())
            .pipe(postcss(processors))
            .pipe(cssmin({
                advanced: false, //类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
                compatibility: 'ie7', //保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
                keepBreaks: true, //类型：Boolean 默认：false [是否保留换行]
                keepSpecialComments: '*'
                    //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
            }))
            .pipe(gulp.dest(dist.css))
    }
}

/**
 * 处理js文件
 * @return {[type]}         [description]
 */
function dealJs() {
    console.log("处理js..");
    delFile(dist.js);
    if (mode == "build") {
        return gulp.src(src.js)
            // .pipe(rename(function(path) {
            //     // path.dirname += "/ciao";
            //     path.basename += ".min";
            //     path.extname = ".js"
            // }))
            .pipe(babel({
                presets: ['es2015']
            }))
            .pipe(uglify({
                mangle: true, //类型：Boolean 默认：true 是否修改变量名
                compress: true, //类型：Boolean 默认：true 是否完全压缩
                // preserveComments: 'all' //保留所有注释
            }))
            .pipe(rev())
            .pipe(gulp.dest(dist.js))
            .pipe(rev.manifest())
            .pipe(gulp.dest(revPath.js));
    } else {
        return gulp.src(src.js)
            .pipe(babel({
                presets: ['es2015']
            }))
            .pipe(uglify({
                mangle: true, //类型：Boolean 默认：true 是否修改变量名
                compress: true, //类型：Boolean 默认：true 是否完全压缩
                // preserveComments: 'all' //保留所有注释
            }))
            .pipe(gulp.dest(dist.js))
    }

}

function dealHtml() {
    console.log("处理html..");
    delFile(dist.html);
    if (mode == "build") {
        return gulp.src([revPath.json, src.html])
            .pipe(revCollector({
                replaceReved: true,
            }))
            .pipe(minifyHTML({
                empty: true,
                spare: true
            }))
            .pipe(gulp.dest(dist.html));
    } else {
        return gulp.src(src.html)
            .pipe(minifyHTML({
                empty: true,
                spare: true
            }))
            .pipe(gulp.dest(dist.html));
    }

}

/**
 * 拷贝框架
 * @return {[type]} [description]
 */
function dealVendor() {
    console.log("处理vendor..");
    return gulp.src(src.vendor)
        .pipe(gulp.dest(dist.vendor));
}

/**
 * 拷贝图片等资源
 * @return {[type]} [description]
 */
function dealAssets() {
    console.log("处理assets..");
    delFile(dist.assets);
    if (mode == "build") {
        return gulp.src(src.assets)
            // .pipe(rev())
            .pipe(gulp.dest(dist.assets))
            // .pipe(rev.manifest())
            // .pipe(gulp.dest(revPath.assets));
    } else {
        return gulp.src(src.assets)
            .pipe(gulp.dest(dist.assets))
    }

}

gulp.task("default", function() {
    console.log("----------------------------------welcome to cy code envir----------------------------------------");
    console.log("| here is command:                                                                               |");
    console.log("|                                                                                                |");
    console.log("|                                                                                                |");
    console.log("|                                                                                                |");
    console.log("| gulp dev     : mode for coder                                                                  |");
    console.log("| gulp build   : build project                                                                   |");
    console.log("|                                                                                                |");
    console.log("|                                                                                                |");
    console.log("|                                                                                                |");
    console.log("|                                                                                                |");
    console.log("-------------------------------------------------------------------------------------------------|");
});

gulp.task("build", function() {
    mode = "build";
    doBuild().then(function(){
        browserSync.init({
            //指定服务器启动根目录  
            server: "./public"
        });
    });
});

function doBuild() {
    var defer = Q.defer();

    delFile(dist.root);
    dealJs();
    dealModuls();
    dealCss();
    dealAssets();
    dealVendor();
    dealHtml().on("end", function() {
        // watch();
        defer.resolve();
    });
    return defer.promise;
}

gulp.task('dev', function() {
    mode = "dev";
    doBuild().then(function() {
        console.log("服务器启动中，请稍候.....");
        // watch();
        browserSync.init({
            //指定服务器启动根目录  
            server: "./public"
        });
        //监听任何文件变化，实时刷新页面  
        gulp.watch("./public/**/*.*").on('change', function() {
            browserSync.reload();
        });
        gulp.watch(src.js, function() {
            dealJs().on("end", function() {
                browserSync.reload();
            });
        });
        gulp.watch(src.html, function() {
            dealHtml().on("end", function() {
                browserSync.reload();
            });
        });
        gulp.watch(src.css, function() {
            dealCss().on("end", function() {
                browserSync.reload();
            });
        });
    })
});
