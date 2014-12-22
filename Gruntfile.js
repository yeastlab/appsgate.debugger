'use strict';

var path = require('path');

var LIVERELOAD_PORT = 35729;
var SERVER_PORT = 9000;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
    return connect.static(path.resolve(dir));
};

module.exports = function (grunt) {

    // Time how long tasks take.
    require('time-grunt')(grunt);

    // Setup template
    grunt.template.addDelimiters('debugger-delimiters', '{%', '%}');

    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            version: '<%= pkg.version %>',
            debugger_banner: '//     AppsGate.Debugger v<%= pkg.version %>\n' +
                '\n' +
                '//\n' +
                '//     Copyright (c)<%= grunt.template.today("yyyy") %> Rémi Barraquand.\n' +
                '//     Distributed under ISC license\n' +
                '\n'
        },

        clean: {
            lib: ['.tmp', 'lib'],
            server: '.tmp'
        },

        bower: {
            install: {
                options: {
                    copy: false
                }
            }
        },

        docco: {
            debugger: {
                src: ['lib/appsgate.debugger.js'],
                options: {
                    output: 'docs/'
                }
            }
        },

        svgmerge: {
            debugger: {
                src: ['src/themes/basic/images/pictograms/*.svg'],
                dest: '.tmp/gen/themes/basic/base.svg'
            }
        },

        variablize: {
            debugger: {
                files: [
                    {
                        src: '<%= svgmerge.debugger.dest %>',
                        dest: '.tmp/gen/themes/basic/base.svg.js',
                        variable: 'BASE_SVG'
                    },
                    {
                        src: 'src/templates/decorations.html',
                        dest: '.tmp/gen/templates/decorations.html.tpl.js',
                        variable: 'DECORATIONS_TO_HTML_TPL'
                    },
                    {
                        src: 'src/templates/decorations.txt',
                        dest: '.tmp/gen/templates/decorations.txt.tpl.js',
                        variable: 'DECORATIONS_TO_TXT_TPL'
                    }
                ]
            }
        },

        grunticon: {
            debugger: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/themes/basic/images/pictograms',
                        src: ['*.svg', '*.png'],
                        dest: '.tmp/gen/themes/basic/grunticon'
                    }
                ],
                options: {
                    datasvgcss: 'pictograms.data.svg.css',
                    datapngcss: 'pictograms.data.png.css',
                    urlpngcss: 'pictograms.fallback.css',
                    cssprefix: '.picto-',
                    pngfolder: '../pictograms',
                    pngpath: 'pictograms',
                    defaultWidth: '128px',
                    defaultHeight: '128px'
                }
            }
        },

        preprocess: {
            debugger: {
                src: 'src/appsgate.debugger.js',
                dest: '.tmp/appsgate.debugger.js'
            },
            developers: {
                src: 'src/appsgate.debugger.js',
                dest: '.tmp/appsgate.debugger.dev.js',
                options: {
                    context: {
                        DEVTOOLS: true
                    }
                }
            }
        },

        shared_config: {
            basic: {
                options: {
                    name: 'THEMES_BASIC',
                    cssFormat: 'underscore',
                    jsFormat: 'underscore'
                },
                files: [
                    {
                        name: 'basic',
                        src: 'src/themes/basic/config.json',
                        dest: [
                            '.tmp/gen/themes/basic/theme.config.scss',
                            '.tmp/gen/themes/basic/theme.config.js'
                        ]
                    }
                ]
            }
        },

        copy: {
            cssToScss: {
                files: [
                    {
                        expand: true,
                        cwd: '.tmp/gen/themes/basic/grunticon',
                        src: ['**/*.css', '!**/*.min.css'],
                        dest: '.tmp/gen/themes/basic/grunticon/',
                        filter: 'isFile',
                        ext: ".scss"
                    }
                ]
            },
            iconsForServer: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/themes/basic/images/icons',
                        src: ['*.gif', '*.png', '*.jpg'],
                        dest: '.tmp/gen/themes/basic/icons/'
                    }
                ]
            },
            themes: {
                files: [
                    {
                        expand: true,
                        cwd: '.tmp/gen/themes/basic/pictograms',
                        src: ['*.png'],
                        dest: 'lib/themes/basic/pictograms/'
                    },
                    {
                        expand: true,
                        cwd: 'src/themes/basic/images/icons',
                        src: ['*.gif', '*.png', '*.jpg'],
                        dest: 'lib/themes/basic/icons/'
                    },
                    {
                        expand: true,
                        cwd: '.tmp/gen/themes/basic/',
                        src: ['theme.css'],
                        dest: 'lib/themes/basic/'
                    }
                ]
            }
        },

        template: {
            options: {
                data: {
                    version: '<%= pkg.version %>'
                },
                'delimiters': 'debugger-delimiters'
            },
            debugger: {
                src: '<%= preprocess.debugger.dest %>',
                dest: '<%= preprocess.debugger.dest %>'
            },
            developers: {
                src: '<%= preprocess.developers.dest %>',
                dest: '<%= preprocess.developers.dest %>'
            }
        },

        compass: {
            options: {
                sassDir: 'src/themes/basic',
                cssDir: '.tmp/gen/themes/basic',
                imagesDir: 'src/themes/basic/images',
                javascriptsDir: '.tmp',
                importPath: 'bower/components',
                relativeAssets: true
            },
            debugger: {},
            developers: {},
            server: {
                options: {
                    debugInfo: true
                }
            }
        },

        concat: {
            options: {
                banner: '<%= meta.debugger_banner %>'
            },
            debugger: {
                src: '<%= preprocess.debugger.dest %>',
                dest: 'lib/appsgate.debugger.js'
            },
            developers: {
                src: '<%= preprocess.developers.dest %>',
                dest: 'lib/appsgate.debugger.dev.js'
            }
        },

        uglify: {
            debugger: {
                src: '<%= concat.debugger.dest %>',
                dest: 'lib/appsgate.debugger.min.js',
                options: {
                    banner: '<%= meta.debugger_banner %>',
                    sourceMap: 'lib/appsgate.debugger.map',
                    sourceMappingURL: 'appsgate.debugger.map',
                    sourceMapPrefix: 1
                }
            }
        },

        connect: {
            options: {
                port: grunt.option('port') || SERVER_PORT,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, '.tmp/gen'),
                            mountFolder(connect, 'bower'),
                            mountFolder(connect, 'examples/basic')
                        ];
                    }
                }
            }
        },

        open: {
            server: {
                path: 'http://<%= connect.options.hostname %>:<%= connect.options.port %>'
            }
        },

        watch: {
            gruntfile: {
                files: ['Gruntfile.js']
            },
            debugger : {
                files : ['Gruntfile.js', 'src/*.js', 'src/**/*.js', 'src/templates/*'],
                tasks : ['build']
            },
            compass: {
                files: ['<%= compass.options.sassDir %>/{,**/}*.{scss,sass}', '<%= compass.options.cssDir %>/{,**/}*.{scss,sass}'],
                tasks: ['compass']
            },
            docco: {
                files: ['lib/appsgate.debugger.js'],
                tasks: ['docco']
            },
            config: {
                files: ['src/themes/basic/config.json'],
                tasks: ['shared_config']
            },
            livereload: {
                options: {
                    livereload: grunt.option('livereloadport') || LIVERELOAD_PORT
                },
                files: [
                    'examples/*/*.html',
                    '{.tmp,examples}/**/{,*/}*.js',
                    '{.tmp,examples}/**/{,*/}*.css'
                ]
            }
        }
    });

    // Load grunt tasks from NPM packages
    require('load-grunt-tasks')(grunt);

    // Load grunt tasks from tasks directory
    grunt.loadTasks( "tasks" );

    grunt.registerTask('build', 'Build the AppsGate debugger.',
        [
            'clean:lib',
            'bower:install',
            'svgmerge',
            'variablize',
            'grunticon',
            'shared_config',
            'copy:cssToScss',
            'preprocess',
            'template',
            'compass',
            'concat',
            'uglify',
            'copy:themes'
        ]
    );

    grunt.registerTask('serve', 'Preview AppsGate debugger samples.', function () {
            grunt.task.run([
                'clean:server',
                'bower:install',
                'svgmerge',
                'variablize',
                'grunticon',
                'shared_config',
                'copy:cssToScss',
                'copy:iconsForServer',
                'preprocess',
                'template',
                'compass:server',
                'connect:livereload',
                'open:server',
                'watch'
            ]);
        }
    );
};