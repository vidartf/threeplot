define(function() {
    "use strict";

    window['requirejs'].config({
        map: {
            '*': {
                'jupyter-threeplot': 'nbextensions/jupyter-threeplot/index',
            },
        }
    });
    // Export the required load_ipython_extention
    return {
        load_ipython_extension : function() {}
    };
});
