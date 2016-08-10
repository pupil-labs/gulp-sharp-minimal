'use strict';

var Transform = require('readable-stream/transform');
var PluginError = require('gulp-util').PluginError;
var sharp = require('sharp');
var through = require('through2');

var PLUGIN_NAME = 'gulp-sharp-test';

module.exports = function(options){
  return through.obj(function(file, encoding, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }

    if (!options){
      this.emit('error', new PluginError(PLUGIN_NAME, "You need to pass options to this plugin. See docs..."));
    }

    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, "Received a stream..."));
    } else if (file.isBuffer()) {
      // this.emit('error', new PluginError(PLUGIN_NAME, "Received a buffer..."));
      var image = sharp(file.contents);
      image
        .metadata()
        .then(function(metadata){
          return image
            .resize((!options.resize ? metadata.width : Math.round(metadata.width * options.resize)))
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
  });

};