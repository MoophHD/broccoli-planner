export default  function regLastMatched(str, regex, startpos) {
    regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
    if(typeof (startpos) == "undefined") {
        startpos = str.length;
    } else if(startpos < 0) {
        startpos = 0;
    }
    var stringToWorkWith = str.substring(0, startpos + 1);
    var lastIndexOf = 0;
    var nextStop = 0;
    let result;
    let val = '';
    while((result = regex.exec(stringToWorkWith)) != null) {
        val = result[0];
        lastIndexOf = result.index;
        regex.lastIndex = ++nextStop;
    }
    return {index: lastIndexOf, value:val} ;
}