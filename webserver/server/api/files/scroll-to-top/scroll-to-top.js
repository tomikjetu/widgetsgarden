function scroll_to_top_scroll(elementId, ...parameters){
    var element = document.getElementById(elementId);
    element.addEventListener("click",()=>{
        AnalyticUse("scroll");
        sendMessage({event: "widgetEvent", data: {}}, "scroll_to_top")
    })
}