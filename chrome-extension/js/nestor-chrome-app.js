
function randLink(){
    var links=$("a");

    
    
    /*
    if(isValidLink(link)){
	performsLink(link);
        return;
    }
    */
   
    //save links
    var link;
    for(var i=0;i<links.length;i++){
        link=$(links[i]).attr("href");
        if(isValidLink(link)){
	   saveLink(link);  
	}
    }
    performsLink(getRandomSavedLink());
    
    return;
    /*
    var links=$("a");
    for(var i=0;i<links.length;i++){
        link=$(links[i]).attr("href");
        if(isValidLink(link)){
            performsLink(link);
            return;
        }
    }
    stopIt();
    //history.back();
    */
}
function isValidLink(link){

    if(!link){
	return false;
    }
    /*
    if(isVisited(link)){
	return false;
    }
    */
    /*
    if(chrome.extension.getBackgroundPage().yetVisited(link)){
        return false;
    }
    */
    if(link.indexOf("mailto:")==-1
	&&
    link.indexOf("#")==-1 
        && 
    link.indexOf("javascript:")==-1 
        &&
        (
        link.indexOf("http")==-1 
        || 
        link.indexOf("http://"+window.location.hostname)==0
        )
        ){
          return true;
    }else{
        return false;
    }
}

function saveLink(link){
    if(!sessionStorage["allLinks"]){
	var links={}
	sessionStorage["allLinks"]=JSON.stringify(links);
    }
    links=JSON.parse(sessionStorage["allLinks"]);
    if(!links[link]){
	links[link]="noVisited";
    }
    sessionStorage["allLinks"]=JSON.stringify(links);
    
}



function getRandomSavedLink(){
    var links=JSON.parse(sessionStorage["allLinks"]); 
    console.log(links);
    for(key in links){
	if(links[key]=="noVisited"){
	   return  key;
	}
    }
    return false;
}
function isVisited(link){
    var links=JSON.parse(sessionStorage["allLinks"]); 
    if(links[link]=="yetVisited"){
	return true;
    }else{
	return false;
    }

}
function setAsVisited(link){
    var links=JSON.parse(sessionStorage["allLinks"]); 
    links[link]="yetVisited";
    sessionStorage["allLinks"]=JSON.stringify(links);
}



function performsLink(url){
    
    console.log("-------go------"+url);
    if(!url || url==false || url=="false"){
	return;
    }
    setAsVisited(url);
    //return;
    stopIt();
    sessionStorage[url] = true;
    tablinkdocument.location=url;
}
function autoScroll(){
   var b=$("body");
   var old=b.scrollTop();
   b.scrollTop(b.scrollTop()+5); 
   
   if(b.scrollTop()==old){
       stopIt();
       randLink();
   }
}
//var timer;
var timer2;
function startIt(){
    stopIt();
    //timer=setInterval("randLink()", 2000);
    timer2=setInterval("autoScroll()", 2);
}
function stopIt(){
    //clearInterval(timer)
    clearInterval(timer2)
}







