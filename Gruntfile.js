module.exports = function(grunt) {

  grunt.initConfig({

    // Import package manifest
    pkg: grunt.file.readJSON("stickycolumn.jquery.json"),

    // Banner definitions
    meta: {
      banner: "/*\n" +
        " *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n" +
        " *  <%= pkg.description %>\n" +
        " *  <%= pkg.homepage %>\n" +
        " *\n" +
        " *  Made by <%= pkg.author.name %>\n" +
        " *  Under <%= pkg.licenses[0].type %> License\n" +
        " */\n"
    },

    // Concat definitions
    concat: {
      dist: {
        src: ["src/jquery.stickycolumn.js"],
        dest: "dist/jquery.stickycolumn.js"
      },
      options: {
        banner: "<%= meta.banner %>"
      }
    },

    // Lint definitions
    jshint: {
      files: ["src/jquery.stickycolumn.js"],
      options: {
        jshintrc: ".jshintrc"
      }
    },

    // SASS definitions
    sass: {
      dist: {
        files: {
          "dist/jquery.stickycolumn.css" : "src/jquery.stickycolumn.css.scss"
        }
      }
    },

    // Minify definitions
    uglify: {
      my_target: {
        src: ["dist/jquery.stickycolumn.js"],
        dest: "dist/jquery.stickycolumn.min.js"
      },
      options: {
        banner: "<%= meta.banner %>"
      }
    }

  });

  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-sass");

  grunt.registerTask("default", ["jshint", "concat", "sass", "uglify"]);
  grunt.registerTask("travis", ["jshint"]);

};
