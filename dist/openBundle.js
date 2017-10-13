let script = document.createElement("script")
script.type = "text/javascript";
let scrUrl;
if (window.location.href.indexOf('localhost') != -1) {
    scrUrl = 'static/bundle.js';
} else {
    scrUrl = 'dist/bundle.js'
}

if (script.readyState){  //IE
    script.onreadystatechange = function(){
        if (script.readyState == "loaded" ||
                script.readyState == "complete"){
            script.onreadystatechange = null;
            // callback();
        }
    };
} else {  //Others
    script.onload = function(){
        // callback();
    };
}

script.src = scrUrl;
document.getElementsByTagName("body")[0].appendChild(script);