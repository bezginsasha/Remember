console.log(123);

var words = document.querySelectorAll('.main-word');
for (var i = 0; i < words.length; i++) {
    words[i].oncontextmenu = (event) => {
        event.preventDefault();
        console.log(123);
    }
}