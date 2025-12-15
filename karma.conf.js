// Karma configuration file, see link for more information
// https://karma-runner.github.io/6.4/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],

    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],

    client: {
      jasmine: {},
      clearContext: false // deja visible los resultados en el navegador
    },

    jasmineHtmlReporter: {
      suppressAll: true // quita mensajes duplicados
    },

    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/clinica-frontend'),
      subdir: '.',
      reporters: [
        { type: 'html' },   // Reporte visual
        { type: 'text-summary' }, // Resumen en consola
        { type: 'lcov' } // Para herramientas de integración continua
      ]
    },

    reporters: ['progress', 'kjhtml', 'coverage'],
    browsers: ['Chrome',],


    // port: 9876,
    // colors: true,
    // logLevel: config.LOG_INFO,
    
    
    singleRun: false,
    autoWatch: true,
    restartOnFileChange: true
  });
};