var MainUi={
    /**
     *
     * @param {NestorLog} nestorLog A nestor log line
     */
    addLine:function(nestorLog){





        var line=Templates.getLine(
            Convert.type(nestorLog.type),
            nestorLog.url,
            nestorLog.nestorUrl,
            nestorLog.method,
            Convert.time(nestorLog.nestorTime),
            nestorLog.cacheControl,
            nestorLog.cacheExpires,
            Convert.timeAgo(nestorLog.timeAgo())
        );
        if(nestorLog.isCurrentPage()){
            line.addClass("current-page");
        }
        $("#lines").prepend(line);
    },
    /**
     * Clear the lines
     */
    clear:function(){
        $("#lines").empty();
    },
    /**
     * Update the active/inactive display
     */
    updateActive:function(){
        bg=chrome.extension.getBackgroundPage();
        if(bg.isActive()){
            $("body").addClass("nestor-active");
        }else{
            MainUi.setWaiting(false);
            $("body").removeClass("nestor-active");
        }
    },
    setWaiting:function(state){
        if(state){
            $("body").addClass("waiting")
        }else{
            $("body").removeClass("waiting")
        }
    }


}
var ajaxes={}



/**
 * Convert values to html entities for the UI
 * @type {Object}
 */
var Convert={
    type:function(str){
        switch (str){
            case "main_frame":
                return "Document";
            case "xmlhttprequest":
                return "Ajax";
            default:
                return str;
        }
    },
    time:function(str){
        bg=chrome.extension.getBackgroundPage();
        var css =bg.NestorLog.getScore(str);
        var rounded=Math.round(str*1000)/1000;
        if(str==0){
            rounded="...";
        }
        return '<span class="'+css+'">'+String(rounded)+' sec</span>';
    },
    timeAgo:function(ms){
        function zero(num){
            if(num<10){
                return "0"+String(num);
            }else{
                return String(num);
            }
        }
        if(ms<5000){
            return "just now";
        }else{
            var d=new Date();
            d.setTime(ms);
            return zero(d.getUTCHours()*60+d.getUTCMinutes())+":"+ zero(d.getUTCSeconds())+" ago";
        }
    }
}


var Datas={
    getLines:function(){
        bg=chrome.extension.getBackgroundPage();
        for(var i=0;i<bg.nestorLogs.length;i++){
            MainUi.addLine(bg.nestorLogs[i]);
        }
        if(bg.nestorLogs.length==0 && bg.isActive()){
            MainUi.setWaiting(true);
        }else{
            MainUi.setWaiting(false);
        }
    }

}

var Templates={
    getLine:function(type,url,logsUrl,method,time,cacheControl,cacheExpires,timeAgo){
        var el=$($("#templates [data-template='line']").html());
        el.find(".line-type").html(type);
        el.find(".line-url").html(url);
        el.find(".line-method").html(method);
        el.find(".line-time").html(time);

        el.find(".logs-url").text(logsUrl);
        el.find(".logs-url").attr("href",logsUrl);
        el.find(".time-ago").html(timeAgo);

        if(cacheControl){
            el.find(".cache-control-value").html(cacheControl)
        }else{
            el.find(".cache-control").remove();
            el.find(".cache-control-value").remove();
        }

        if(cacheExpires){
            el.find(".cache-expires-value").html(cacheExpires)
        }else{
            el.find(".cache-expires").remove();
            el.find(".cache-expires-value").remove();
        }
        return el;
    },
    getTabContent:function(url,id){
        var el=$($("#templates [data-template='tab-content']").html());
        el.attr("id",id);
        //el.text(id+"::::"+url);
        el.find("iframe").attr("src",url);
        return el;
    }
}




//clear logs

$("body").on("click","#clear-logs",function(e){
    e.preventDefault();
    bg=chrome.extension.getBackgroundPage();
    bg.clearLogs();
    MainUi.clear();
});

//activate deactivate
$("body").on("click","#activate",function(e){
    e.preventDefault();
    bg=chrome.extension.getBackgroundPage();
    bg.setActive(true);
    Datas.getLines();
    MainUi.updateActive();
});
$("body").on("click","#deactivate",function(e){
    e.preventDefault();
    bg=chrome.extension.getBackgroundPage();
    bg.setActive(false);
    MainUi.updateActive();
});

function refresh(){
    MainUi.clear();
    Datas.getLines();
}

Datas.getLines();
MainUi.updateActive();

setInterval(refresh,1000);


/*
$("body").on("click","#tabs [data-toggle='tab']",function(e){
    e.preventDefault();
    e.stopPropagation();
    //$("#tabs").find(".active").removeClass("active");
    $("#contents").find(".active").removeClass("active");
    var toActivate=$("#contents").find($(this).attr("href"));
    console.log(toActivate);
    $(toActivate).addClass("active");

})
*/








