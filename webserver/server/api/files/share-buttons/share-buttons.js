function share_buttons_facebook(elementId, ...parameters){
    var element = document.getElementById(elementId);
    element.style.cursor = "pointer";

    var current = parameters[0];
    var link = parameters[1];
    var shareLink = `https://www.facebook.com/sharer.php?u=${encodeURIComponent(link)}`;
    
    element.addEventListener("click",()=>{
        AnalyticUse("share");
        if(current == "false") return window.open(shareLink);
        
        sendMessage({event: "widgetEvent", data: {
            app: "facebook",
        }}, "share_buttons")
    })
}

function share_buttons_reddit(elementId, ...parameters){
    var element = document.getElementById(elementId);
    element.style.cursor = "pointer";
    var title = parameters[0];

    var current = parameters[1];
    var link = parameters[2];
    var shareLink = `https://reddit.com/submit?url=${encodeURIComponent(link)}&title=${encodeURIComponent(title)}`;
    
    element.addEventListener("click",()=>{
        AnalyticUse("share");
        if(current == "false") return window.open(shareLink);
        
        sendMessage({event: "widgetEvent", data: {
            app: "reddit",
            title
        }}, "share_buttons")
    })
}

function share_buttons_twitter(elementId, ...parameters){
    var element = document.getElementById(elementId);
    element.style.cursor = "pointer";
    var title = parameters[0];
    var hashtags = parameters[1];

    var current = parameters[2];
    var link = parameters[3];
    var shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(link)}&text=${encodeURIComponent(title)}&hashtags=${encodeURIComponent(hashtags)}`
    
    element.addEventListener("click",()=>{
        AnalyticUse("share");
        if(current == "false") return window.open(shareLink);
        
        sendMessage({event: "widgetEvent", data: {
            app: "reddit",
            title,
            hashtags
        }}, "share_buttons")
    })
}

function share_buttons_linkedin(elementId, ...parameters){
    var element = document.getElementById(elementId);
    element.style.cursor = "pointer";

    var current = parameters[0];
    var link = parameters[1];
    var shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`

    element.addEventListener("click",()=>{
        AnalyticUse("share");
        if(current == "false") return window.open(shareLink);

        sendMessage({event: "widgetEvent", data: {
            app: "linkedin"
        }}, "share_buttons")
    })
}

function share_buttons_whatsapp(elementId, ...parameters){
    var element = document.getElementById(elementId);
    element.style.cursor = "pointer";
    var title = parameters[0];

    var current = parameters[1];
    var link = parameters[2];
    var shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(title)}%20${encodeURIComponent(link)}`

    element.addEventListener("click",()=>{
        AnalyticUse("share");
        if(current == "false") return window.open(shareLink);

        sendMessage({event: "widgetEvent", data: {
            app: "whatsapp",
            title
        }}, "share_buttons")
    })
}