'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var _ = require('lodash');
var interactionsHelper = require('../utils/interactionsHelper.js');

module.exports = yeoman.generators.Base.extend({
    constructor: function () {
        yeoman.generators.Base.apply(this, arguments);

        this.argument('directiveName', {
            type: String,
            required: false
        });
    },
    prompting: function () {
        var done = this.async();

        // Have Yeoman greet the user.
        if (!this.options.isSubCall) {
            this.log(yosay(
                'Welcome to the solid ' + chalk.red('generator-requionic:view') +
                ' generator!'
            ));
        }

        var prompts = [];

        if (!this.options.moduleType) {
            prompts.push(interactionsHelper.promptModuleType());
        }

        if (!this.directiveName) {
            var prompt = {
                type: 'input',
                name: 'directiveName',
                message: 'DirectiveName'
            };
            prompts.push(prompt);
        }

        if (!this.options.moduleName) {
            var prompt = {
                type: 'input',
                name: 'moduleName',
                message: 'Module name: '
            };
            prompts.push(prompt);
        }

        if (!this.options.author) {
            var prompt = {
                type: 'input',
                name: 'author',
                message: 'Author name: ',
                store: true
            };
            prompts.push(prompt);
        }

        if (prompts.length) {
            this.prompt(prompts, function (props) {
                this.options.moduleType = this.options.moduleType || answers.moduleType;

                this.DirectiveName = this.directiveName || answers.directiveName;
                //Normalize directive intput name.
                this.DirectiveName = _.kebabCase(this.directiveName);

                this.options.moduleName = this.options.moduleName || answers.moduleName;
                //Normalize module intput name.
                this.options.moduleName = _.kebabCase(this.options.moduleName);

                this.options.author = this.options.author || answers.author;

                done();
            }.bind(this));
        } else {
            done();
        }

    },
    writing: {

        preprocessModule: function () {
            this.modulePath = 'www/js/' + this.options.moduleType + '/' + this.options.moduleName;
        },

        createDirective: function () {
            this.log(chalk.yellow('### Creating directive ###'));
            var destinationPath = this.modulePath + '/directive/' + _.toLower(this.options.moduleName) + '.directive.js';
            this.fs.copyTpl(
                this.templatePath('_directive.js'),
                this.destinationPath(destinationPath), {
                    author: this.options.author,
                    moduleName: _.toLower(this.options.moduleName),
                    date: (new Date()).toDateString()
                }
            );
        },
        modifyMain: function () {
            this.log(chalk.yellow('### Adding files to main ###'));
            var self = this;
            var destinationPath = this.modulePath + '/main.js';
            this.fs.copy(
                this.destinationPath(destinationPath),
                this.destinationPath(destinationPath),
                {
                    process: function (content) {
                        var hook = '\/\/ Yeoman hook. Define section. Do not remove this comment.';
                        var regEx = new RegExp(hook, 'g');
                        var substitutionString = "'./directives/" + _.toLower(self.options.moduleName) + ".directive.js',\n";
                        return content.toString().replace(regEx, substitutionString + hook);
                    }
                }
            );
        }
    },
    install: function () {
        this.installDependencies();
    }
});
