define(function(require, exports, module) {
    main.consumes = ["Plugin", "commands", "tabManager", "ace", "ui"];
    main.provides = ["pigments"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var commands = imports.commands;
        var aceHandle = imports.ace;
        var markerlist = [];
        var ui = imports.ui;
        var flag = false;
        /***** Initialization *****/
        
        var plugin = new Plugin("Shannon Duncan", main.consumes);
        var emit = plugin.getEmitter();
        
        function load() {
            
        }
        
        /***** Methods *****/
        commands.addCommand({
            name: "run_pigment",
            bindKey: { 
                mac: "Command-Shift-alt-J", 
                win: "Ctrl-Shift-alt-J" 
            },
            exec: function(e){ 
                //alert(e.ace.mode);
                var ace = e.ace;
                var hex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
                var rgb = /rgb\(\s*(?:(\d{1,3})\s*,?){3}\)/g;
                var rgba = /rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d*(?:\.\d+)?)\)/g;
                var range;
                var colorcode;
                var colortrim;
                var cssString;
                var marker;
                
                deletePigments(e);
                
                // get hex colors and highlight them
                var ranges = ace.findAll(hex,{
                    regExp: true
                });
                for (var i = 0; i < ranges; i++){
                    range = ace.find(hex, {regExp: true});
                    colorcode = ace.session.getTextRange(range);
                    colortrim = "hex" + colorcode.substring(1, colorcode.length);
                    cssString = "." + colortrim + " { background-color: " + colorcode + "; position: absolute; }";
                    ui.insertCss(cssString, options.staticPrefix, plugin);
                    marker = ace.session.addMarker(range, colortrim.toString(), "Line", false);
                    markerlist.push(marker);
                }
                
                // get rgb colors and highlight them
                ranges = ace.findAll(rgb, {regExp: true});
                for (var i = 0; i < ranges; i++){
                    range = ace.find(rgb, {regExp: true});
                    colorcode = ace.session.getTextRange(range);
                    colortrim = colorcode.split(" ").join("").split(",").join("").split(")").join("").split("(").join("").split(".").join("");
                    cssString = "." + colortrim + " { background-color: " + colorcode + "; position: absolute; }";
                    ui.insertCss(cssString, options.staticPrefix, plugin);
                    marker = ace.session.addMarker(range, colortrim.toString(), "Line", false);
                    markerlist.push(marker);
                }
                
                // get rgba colors and highlight them
                ranges = ace.findAll(rgba, {regExp: true});
                for (var i = 0; i < ranges; i++){
                    range = ace.find(rgba, {regExp: true});
                    colorcode = ace.session.getTextRange(range);
                    colortrim = colorcode.split(" ").join("").split(",").join("").split(")").join("").split("(").join("").split(".").join("");
                    cssString = "." + colortrim + " { background-color: " + colorcode + "; position: absolute; }";
                    ui.insertCss(cssString, options.staticPrefix, plugin);
                    marker = ace.session.addMarker(range, colortrim.toString(), "Line", false);
                    markerlist.push(marker);
                }
            }
        }, plugin);
        
        commands.addCommand({
            name: "remove_pigments",
            bindKey: {
                mac: "Command-Shift-Alt-C",
                win: "Ctrl-Shift-Alt-C"
            },
            exec: function(e){
                deletePigments(e);
            }
        }, plugin)
        
        function deletePigments(e){
            for (var i = 0; i < markerlist.length; i++) {
                e.ace.session.removeMarker(markerlist[i]);
            }
            markerlist = [];
        }
        
        /***** Lifecycle *****/
        
        plugin.on("load", function() {
            load();
        });
        plugin.on("unload", function() {
        
        });
        
        /***** Register and define API *****/
        
        plugin.freezePublicAPI({
            
        });
        
        register(null, {
            "pigments": plugin
        });
    }
});