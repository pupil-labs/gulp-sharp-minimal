'use strict';
var through = require('through2');
var PluginError = require('gulp-util').PluginError;
var sharp = require('sharp');

const PLUGIN_NAME = 'gulp-sharp-minimal';


function gulpSharpMinimal(options){
  if (!options){
      this.emit('error', new PluginError(PLUGIN_NAME, "You need to pass options to this plugin. See docs..."));
    }

  if (!options.resize) {
    this.emit('error', new PluginError(PLUGIN_NAME, "You must pass resize as an option and it must be an array with 2 values w,h."));
  }


  var stream = through.obj(function(file, encoding, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, "Received a stream... Streams are not supported. Sorry ;("));
      return callback();
    }

    if (file.isBuffer()) {
      // this.emit('error', new PluginError(PLUGIN_NAME, "Received a buffer..."));
      var image = sharp(file.contents);
      image
        .metadata()
        .then(function(metadata){
          return image
            .resize(...options.resize)
            .max()
            .withoutEnlargement()
            .toFormat((!options.format ? metadata.format : options.format))
            .quality((!options.quality ? 80 : options.quality))
            .compressionLevel((!options.compressionLevel ? 6 : options.compressionLevel))
            .toBuffer()
        })
        .then(function(data){
          if (options.progressive){
            image.progressive()
          } 

          if (options.stripMetadata){
            // if true - then we keep all EXIF data of image
            // otherwise default behavior is to strip it all
            image.withMetadata();
          }
          return image;
        })

        .then(function(sequentialRead){
          if (options.sequentialRead){
            image.sequentialRead()
          }
          return image;

         })

        .then(function(trellisQuantisation){
          if (options.trellisQuantisation){
            image.trellisQuantisation()
          }
          return image;
        });

      // simple method for replacing file names with new format suffix
      var path = file.path;
      if (options.format){
        var split_path = file.path.split('.');
        split_path[split_path.length-1] = options.format;
        path = split_path.join('.');
      } 

      file.path = path
      file.contents = image;
      
      return callback(null, file);
    }

    // make sure the file goes through the next gulp plugin
    this.push(file);
    callback();
  });
  // returning the file sream through2
  return stream
};

module.exports = gulpSharpMinimal;