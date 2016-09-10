#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var UglifyJS = require('uglify-js');
var CleanCSS = require('clean-css');
var ngAnnotate = require('ng-annotate');
var Imagemin = require('imagemin');
var cssMinifier = new CleanCSS({
    noAdvanced: true, // disable advanced optimizations - selector & property merging, reduction, etc.
    keepSpecialComments: 0 // remove all css comments ('*' to keep all, 1 to keep first comment only)
});
var minifyImage = new MinifyImage({
   jpeg: {
            progressive: true,
            arithmetic: false
        },
        png: {
            optimizationLevel: 2
        },
        gif: {
            interlaced: false
        },
        svg: {
            pretty: false
        }
});
var rootDir = process.argv[2];
var platformPath = path.join(rootDir, 'platforms');
var platform = process.env.CORDOVA_PLATFORMS;
var cliCommand = process.env.CORDOVA_CMDLINE;

// hook configuration
var isRelease = true; // by default this hook is always enabled, see the line below on how to execute it only for release
//var isRelease = (cliCommand.indexOf('--release') > -1);
var recursiveFolderSearch = true; // set this to false to manually indicate the folders to process
var foldersToProcess = [ // add other www folders in here if needed (ex. js/controllers)
    'dist_js',
    'dist_css',
    'img'
];

if (!isRelease) {
    return;
}

console.log('cordova-uglify will always run by default, uncomment the line checking for the release flag otherwise');

switch (platform) {
    case 'android':
        platformPath = path.join(platformPath, platform, 'assets', 'www');
        break;
    case 'ios':
        platformPath = path.join(platformPath, platform, 'www');
        break;
    default:
        console.log('this hook only supports android and ios currently');
        return;
}

foldersToProcess.forEach(function(folder) {
    processFiles(path.join(platformPath, folder));
});

function processFiles(dir) {
    fs.readdir(dir, function (err, list) {
        if (err) {
            console.log('processFiles err: ' + err);
            return;
        }
        list.forEach(function(file) {
            file = path.join(dir, file);
            fs.stat(file, function(err, stat) {
                if (recursiveFolderSearch && stat.isDirectory()) {
                    processFiles(file);
                } else{
                    compress(file);
                }
            });
        });
    });
}

function compress(file) {
    var ext = path.extname(file);
    switch(ext) {
        case '.js':
            console.log('uglifying js file ' + file);
            var res = ngAnnotate(String(fs.readFileSync(file)), { add: true });
            var result = UglifyJS.minify(res.src, {
                compress: { // pass false here if you only want to minify (no obfuscate)
                    drop_console: true // remove console.* statements (log, warn, etc.)
                },
                fromString: true,
                mangle: true
            });
            fs.writeFileSync(file, result.code, 'utf8'); // overwrite the original unminified file
            break;
        case '.css':
            console.log('minifying css file ' + file);
            var source = fs.readFileSync(file, 'utf8');
            var result = cssMinifier.minify(source);
            fs.writeFileSync(file, result.styles, 'utf8'); // overwrite the original unminified file
            break;
             case '.jpeg':
    case '.jpg':
      console.log('minifying image(JPEG format) ' + file);

      minifyImage.minify(file, minifyImage.JPEG);
      break;

    case '.png':
      console.log('minifying image(PNG format) ' + file);

      minifyImage.minify(file, minifyImage.PNG);
      break;

    case '.gif':
      console.log('minifying image(GIF format) ' + file);

      minifyImage.minify(file, minifyImage.GIF);
      break;

    case '.svg':
      console.log('minifying image(SVG format) ' + file);

      minifyImage.minify(file, minifyImage.SVG);
      break;

        default:
            console.log('encountered a ' + ext + ' file, not compressing it');
            break;
    }
}

/**
 * Constructor
 * @param {object} config - The hook config of image
 * @return {object} - MinifyImage instance
 */
function MinifyImage(config) {
  this.config = config || {};
  this.JPEG = 'JPEG';
  this.PNG = 'PNG';
  this.GIF = 'GIF';
  this.SVG = 'SVG';
  this.minify = minify;

  var that = this;

  /**
   * @param {string} file   - File path
   * @param {string} format - Image format
   * @return {undefined}
   * {@link https://github.com/imagemin/imagemin imagemin}
   */
  function minify(file, format) {
    switch (format) {
      case that.JPEG:
        new Imagemin()
          .src(file)
          .dest(path.dirname(file))
          .use(Imagemin.jpegtran(that.config.jpeg))
          .run(errorHandler);
        break;

      case that.PNG:
        new Imagemin()
          .src(file)
          .dest(path.dirname(file))
          .use(Imagemin.optipng(that.config.png))
          .run(errorHandler);
        break;

      case that.GIF:
        new Imagemin()
          .src(file)
          .dest(path.dirname(file))
          .use(Imagemin.gifsicle(that.config.gif))
          .run(errorHandler);
        break;

      case that.SVG:
        new Imagemin()
          .src(file)
          .dest(path.dirname(file))
          .use(Imagemin.svgo(that.config.svg))
          .run(errorHandler);
        break;

      default:
        console.log('encountered a ' + format + ' image, not compressing it');
        break;
    }

    // Error handler
    function errorHandler(err) {
      if (!err) {
        return;
      }

      console.error('Fail to minify image ' + file + ': ' + err);
    }
  }
}
