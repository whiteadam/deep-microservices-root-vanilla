(function(framework) {
  'use strict';

  var kernel = framework.Kernel;

  kernel.container.register('router', Router);
  kernel.container.register('templating', function() {
    var viewElement = document.querySelector('[ui-view]');

    this.render = function (htmlString, viewObject, callback) {
      viewElement.innerHTML = Mustache.render(htmlString, viewObject || {});

      if (typeof callback === 'function') {
        callback(viewElement);
      }
    };

    this.renderView = function (viewPath, viewObject, callback) {
      var xhttp = new XMLHttpRequest();
      var realPath = kernel.get('asset').locate(viewPath);

      xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
          this.render(xhttp.responseText, viewObject, callback);
        }
      }.bind(this);

      xhttp.open('GET', realPath, true);
      xhttp.send();
    };
  });

  function moduleInit(module) {
    var router = kernel.get('router');
    var moduleRoutes = module.routes || [];
    
    for (var routePath in moduleRoutes) {
      if (moduleRoutes.hasOwnProperty(routePath)) {
        router.on(routePath, moduleRoutes[routePath]);
      }
    }
  }

  kernel.bootstrap(function () {
    var bootstrapScripts = kernel.get('deep_frontend_bootstrap_vector');
    var bootstrapPromises = bootstrapScripts.map(function(m) {
      return System.import(m).then(moduleInit);
    });

    Promise.all(bootstrapPromises).then(function() {
      kernel.get('router').init();
    });
  });
})(DeepFramework);
