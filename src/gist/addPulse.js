export default function(target) {
    if (target) {
        if (target.tagName == "I") target=target.parentNode;
        target.classList.add('pulse');
        return new Promise((res) => {
            setTimeout(()=>{target.classList.remove('pulse');return res()}, 500);
        });
      }
}