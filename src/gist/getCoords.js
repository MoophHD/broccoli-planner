/**
 * 
 * @param {HTML element} el 
 */
export default function getCoords(el) {
    var box = el.getBoundingClientRect();
    
    return {
        top: box.top + pageYOffset,
        left: box.left + pageXOffset
    };
    
}