window.addEventListener('widgetEvent', function (event) {
    var { headers, body } = event.detail;
    if (headers.plugin != "scroll_to_top") return;
    window.scrollTo(window.scrollX, 0);
})