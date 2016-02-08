define(function(require, exports, module) {
    main.consumes = ["Plugin", "commands", "tabManager", "ace", "ui", "fs"];
    main.provides = ["c9.ide.pigments"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var commands = imports.commands;
        var aceHandle = imports.ace;
        var tabManager = imports.tabManager;
        var fs = imports.fs;
        var ui = imports.ui;
        var tinycolor = require("./tinycolor-min.js");
        var markerlist = [];
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
        }, plugin);
        
        commands.addCommand({
            name: "generate_report",
            bindKey: {
                mac: "Command-Shift-Alt-G",
                win: "Ctrl-Shift-Alt-G"
            },
            exec: function(e){
                
                ////////////////////////////////////////////////////////////////
                /////////////// Template Header  ///////////////////////////////
                ////////////////////////////////////////////////////////////////
                
                var reporthtml = `<!DOCTYPE html>
<html>
    <head>
        <title>Pigment Report for c9</title>
        <style>
            body {
                font-family: Sans-serif;
                background: #222;
                color: #fff;
            }
            table {
                width: 100%;
                text-align:left;
            }
            table, th, td {
                border: 1px solid #111;
                border-collapse: collapse;
                padding: 15px;
            }
            .palette {
                border: 1px solid #fff;
                width: 50px;
                height: 50px;
            }
            .palette2 {
                border: 1px solid #fff;
                width: 50px;
                height: 50px;
                margin-right: 5px;
                display: inline-block;
            }
            .details {
                color: #DACEA9;
            }
            .header {
                margin-right:5px;
            }
        </style>
    <head>
    <body>
        <h1>Pigment Report for cloud9</h1>
        <p>The following information has been pulled from the file of xxx on cloud9 for use as a reference of all colors used in the referenced file.</p>
        <p>A sample palatte looks like this:</p>
        <table>
            <tr>
                <th>Palette</th>
                <th>Color Codes</th>
            </tr>
            <tr>
                <td><div class="palette" style="background:#123456"></div></td>
                <td>
                    <strong class="header">HEX: </strong> <span class="details">#123456</span> <br>
                    <strong class="header">RGB: </strong> <span class="details">rgb(18, 52, 86)</span> <br>
                    <strong class="header">RGBA: </strong> <span class="details">rgba(18, 52, 86, 1)</span> <br>
                    <strong class="header">HSL: </strong> <span class="details">hsl(120, 79%, 76%)</span>
                </td>
            </tr>
        </table>
        <hr>
        <p>Begin Pigment Report: </p>
        <table>
            <tr>
                <th>Palette</th>
                <th>Color Codes</th>
            </tr>
                `;
                
                
                var color;
                var ace = e.ace;
                var hex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
                var rgb = /rgb\(\s*(?:(\d{1,3})\s*,?){3}\)/g;
                var rgba = /rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d*(?:\.\d+)?)\)/g;
                var range;
                var colorcode;
                var colortrim;
                var cssString;
                var marker;
                ////////////////////////////////////////////////////////////////
                /////////////// Add All Hex      ///////////////////////////////
                ////////////////////////////////////////////////////////////////
                // get hex colors and highlight them
                var ranges = ace.findAll(hex,{
                    regExp: true
                });
                for (var i = 0; i < ranges; i++){
                    range = ace.find(hex, {regExp: true});
                    colorcode = ace.session.getTextRange(range);
                    color = generate_template(colorcode);
                    reporthtml += color;
                }
                
                
                ////////////////////////////////////////////////////////////////
                /////////////// Add All RGB      ///////////////////////////////
                ////////////////////////////////////////////////////////////////
                // get hex colors and highlight them
                var ranges = ace.findAll(rgb,{
                    regExp: true
                });
                for (var i = 0; i < ranges; i++){
                    range = ace.find(rgb, {regExp: true});
                    colorcode = ace.session.getTextRange(range);
                    color = generate_template(colorcode);
                    reporthtml += color;
                }
                
                
                ////////////////////////////////////////////////////////////////
                /////////////// Add All RGBA     ///////////////////////////////
                ////////////////////////////////////////////////////////////////
                // get hex colors and highlight them
                var ranges = ace.findAll(rgba,{
                    regExp: true
                });
                for (var i = 0; i < ranges; i++){
                    range = ace.find(rgba, {regExp: true});
                    colorcode = ace.session.getTextRange(range);
                    color = generate_template(colorcode);
                    reporthtml += color;
                }
                
                ////////////////////////////////////////////////////////////////
                /////////////// Template Footer  ///////////////////////////////
                ////////////////////////////////////////////////////////////////
                
                reporthtml += `        </table>
    </body>
</html>`;
                
                ////////////////////////////////////////////////////////////////
                ////////////////////// File option /////////////////////////////
                ////////////////////////////////////////////////////////////////
                var d = new Date();
                var filename = d.toJSON().toString();
                var filepath = "/" + filename + ".html";
                fs.writeFile(filepath, reporthtml, function(err){
                    if(err)return console.error(err);
                    console.log("File written");
                })
                tabManager.open({
                    path: filepath,
                    editorType: "preview",
                    focus: true,
                    active: true
                }, function(err, tab){
                    if(err)return console.error(err);
                })
                
                ////////////////////////////////////////////////////////////////
                ////////////////////// Blob option /////////////////////////////
                ////////////////////////////////////////////////////////////////
                // var blob = new Blob([reporthtml], {"type": "text/html"});
                // var blobURL = URL.createObjectURL(blob);
                // var options = {
                //     editorType: "preview",
                //     active: true,
                //     title: "Pigments Report",
                //     url: blobURL
                // };
                
                // tabManager.open(options);
            }
        }, plugin);
        
        function deletePigments(e){
            for (var i = 0; i < markerlist.length; i++) {
                e.ace.session.removeMarker(markerlist[i]);
            }
            markerlist = [];
        }
        
        function generate_template(color){
            var col = tinycolor(color);
            var temp;
            var html = `<tr>
                <td><div class="palette" style="background:` + col.toString() + `"></div></td>
                <td>
                    <strong class="header">Original Value: </strong> <span class="details">` + col.toString() + `</span> <br>
                    <br>
                    <strong class="header">HEX: </strong> <span class="details">` + col.toHexString() + `</span> <br>
                    <strong class="header">RGB: </strong> <span class="details">` + col.toRgbString() + `</span> <br>
                    <strong class="header">HSL: </strong> <span class="details">` + col.toHslString() + `</span> <br>
                    <strong class="header">HSV: </strong> <span class="details">` + col.toHsvString() + `</span>
                    <br>
                    <br>
                    <br>
                    <h3>Color Combinations</h3>
                    <h4>Analogous</h4>`;
            
            temp = col.analogous();                    
            for (var i = 0; i < temp.length; i++){
                html += '<div class="palette2" style="background:' + temp[i] + '"></div>';
            }
            
            html += "<h4>Monochromatic</h4>"
            temp = col.monochromatic();
            for (var i = 0; i < temp.length; i++){
                html += '<div class="palette2" style="background:' + temp[i] + '"></div>';
            }
            
            html += "<h4p>Split Complement</h4>"
            temp = col.splitcomplement();
            for (var i = 0; i < temp.length; i++){
                html += '<div class="palette2" style="background:' + temp[i] + '"></div>';
            }
            
            html += "<h4>Triad</h4>"
            temp = col.triad();
            for (var i = 0; i < temp.length; i++){
                html += '<div class="palette2" style="background:' + temp[i] + '"></div>';
            }
            
            html += "<h4>Tetrad</h4>"
            temp = col.tetrad();
            for (var i = 0; i < temp.length; i++){
                html += '<div class="palette2" style="background:' + temp[i] + '"></div>';
            }
            
            html += "<h4>Complement</h4>"
            html += '<div class="palette2" style="background:' + col.complement() + '"></div>';
            
            html += `</td>
            </tr>
            `;
            
            return html;
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
            "c9.ide.pigments": plugin
        });
    }
});