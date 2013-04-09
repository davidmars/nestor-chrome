/**
 * The current active tab url
 * @type {String}
 */
var currentUrl="";
/**
 * Updates the current tab url
 */
function refreshCurrentUrl(){
    chrome.tabs.getSelected(null,function(tab) {
        currentUrl = tab.url;
    });
}
//on click popin button
chrome.browserAction.onClicked.addListener(function() {
    console.log("click popin");
});
//on tab change
chrome.tabs.onActiveChanged.addListener(function(tabId, removeInfo) {
    refreshCurrentUrl();
});
//on url change
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    refreshCurrentUrl();
});
/**
 *
 * @param details
 */
function onReceivePage(details){
    if(details.responseHeaders){
        var headers = details.responseHeaders;
        for (var i = 0; i < headers.length; ++i) {
            if(headers[i].name=="x-nestor"){
                //great !
                var log=new NestorLog(details);
                nestorLogs.push(log);


                updateStatus();
                return;
            }
        }
    }
}


/**
 * Object that represents a log line.
 * @constructor
 */
var NestorLog=function(details){
    console.log(details);
    var me=this;
    /**
     * Will be true if the current tab url is same as this log url (or the log displayed)
     * @return {Boolean}
     */
    this.isCurrentPage=function(){
        return ((currentUrl == me.url) || (currentUrl==me.nestorUrl));
    };
    /**
     * When did we received this request.
     * @type {Number}
     */
    this.receivedAt=new Date().getTime();

    /**
     * how many seconds ago?
     * @return {Number}
     */
    this.timeAgo=function(){
        var d=new Date();
        return d.getTime()-me.receivedAt;
    }
    /**
     *
     * @type {String}
     */
    this.url=details.url;
    /**
     *
     * @type {String}
     */
    this.method=details.method;
    /**
     *
     * @type {String}
     */
    this.type=details.type;


    //-----------------headers-------------------

    /**
     *
     * @type {String}
     */
    this.nestorUrl="http://";
    /**
     * The time the script takes to execute (calculated by your Nestor script on server side). This data is loaded in ajax later.
     * @type {String}
     */
    this.nestorTime=0;


    /**
     *
     * @type {String}
     */
    this.cacheExpires="toto";
    /**
     *
     * @type {String}
     */
    this.cacheControl="toto";

    //parse headers
    var headers = details.responseHeaders;
    for (var j = 0; j < headers.length; ++j) {
        switch(headers[j].name){
            case "x-nestor":
                me.nestorUrl=headers[j].value;
                console.log("nestor log :"+headers[j].value );

                break;
            case "Expires":
                me.cacheExpires=headers[j].value;
                break;
            case "Cache-Control":
                me.cacheControl=headers[j].value;
                break;
        }

    }

    this.json={};

    $.ajax({
        url: me.nestorUrl+"-info.json",
        dataType:"json",
        success:
            function (json){

                me.nestorTime=json.score;
                updateStatus();
            }
    })


}

/**
 * From a time returns a score text identifier
 * @param {Number} time Time in s
 * @return {String} something like good-time
 */
NestorLog.getScore=function(time){
    time=Number(time);
    if(time==0){
        return "unknow-time";
    }else if(time<0.5){
        return "good-time";
    }else if(time<1){
        return "medium-time";
    }else{
        return "bad-time";
    }
}
/**
 *
 * @param {String} score something like good-time
 * @return {String} something like #adff48
 */
NestorLog.scoreToColor=function(score){
    switch (score){
        case "good-time":
            return "#adff48";
        case "medium-time":
            return "#ff8e00";
        case "bad-time":
            return "#ff0016";
        default:
            return "#666666";
    }
}
/**
 * From a time returns a score color
 * @param {Number} time Time in ms
 * @return {String} something like #adff48
 */
NestorLog.getScoreColor=function(time){
    return NestorLog.scoreToColor(NestorLog.getScore(time));
}

/**
 * updates the status icon according nestorlogs list.
 */
function updateStatus(){
    var maxTime=0;
    //limit number of logs
    while(nestorLogs.length>100){
        nestorLogs.shift();
    }
    for(var i=0;i<nestorLogs.length;i++){
        maxTime=Math.max(maxTime,nestorLogs[i].nestorTime)
    }
    if(nestorLogs.length>0){
        chrome.browserAction.setBadgeBackgroundColor({color:NestorLog.getScoreColor(maxTime)})
        //chrome.browserAction.setIcon({path :"img/nestor-happy.png"});
        chrome.browserAction.setBadgeText({text:String(nestorLogs.length)});
    }else{
        //chrome.browserAction.setIcon({path :"img/nestor-happy.png"});
        chrome.browserAction.setBadgeText({text:""});
    }

}


/**
 * Here are the nestor logs lines
 * @type {NestorLog[]}
 */
var nestorLogs=[];
/**
 * Clear the logs
 */
function clearLogs(){
    nestorLogs=[];
    //chrome.browserAction.setIcon({path :"img/nestor-happy.png"})
    updateStatus();
}

function onSendPage(details){
    if(details.url.indexOf("-info.json") == -1){ //prevent recursive logs
    details.requestHeaders.push({name:"X-Nestor-Is-Inspecting",value:"true"});
    }

    /*for (var i = 0; i < details.requestHeaders.length; ++i) {
        if (details.requestHeaders[i].name === 'User-Agent') {
            details.requestHeaders.splice(i, 1);
            break;
        }
    }*/

    return {requestHeaders: details.requestHeaders};
}

function setActive(active){
    localStorage.setItem("nestorActive",active?"true":"false");
    updateActiveStatus();
    if(isActive()){
        //listen for header send to add the nestor sended header
        chrome.webRequest.onBeforeSendHeaders.addListener(onSendPage,{urls: ["<all_urls>"]},["blocking", "requestHeaders"]);
        //listen for header reception.....
        chrome.webRequest.onHeadersReceived.addListener(onReceivePage,{urls: ["<all_urls>"]},["responseHeaders"]);
    }else{
        //remove the listeners
        chrome.webRequest.onBeforeSendHeaders.removeListener(onSendPage);
        chrome.webRequest.onHeadersReceived.removeListener(onReceivePage);
        //clear logs
        clearLogs();
    }
}
function isActive(){

    console.log("is active?");
    console.log(localStorage.getItem("nestorActive"));
    console.log(localStorage.getItem("nestorActive") && localStorage.getItem("nestorActive")==true);

    if(localStorage.getItem("nestorActive")=="false"){ //so undefined is true for initial setup
        return false;
    }else{
        return true;
    }
}

function updateActiveStatus(){
    if(isActive()){
        chrome.browserAction.setIcon({path :"img/nestor19.png"});
        chrome.browserAction.setTitle({title:"Nestor the inspector is inspecting"});
    }else{
        chrome.browserAction.setIcon({path :"img/nestor-sleeping19.png"});
        chrome.browserAction.setTitle({title:"Nestor the inspector is sleeping. Click to wake up."});
    }
}


//boot
setActive(isActive());




