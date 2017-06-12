
function getSite(){

  var site = $("#url").val();
  $("#url").val("");

  if (!site || site === "" ){
    console.log('No website entered');
  }

  else if (site.length > 0){
    chrome.extension.getBackgroundPage().checkEmpty(site);
  }

  chrome.runtime.onMessage.addListener(

  function(request, sender, sendResponse) {
    if (request.updated == "done"){
      sendResponse({status: "updated"});
      loadSites();
    }
  });

}

function reset(){
  chrome.extension.getBackgroundPage().reset();

  chrome.runtime.onMessage.addListener(

  function(request, sender, sendResponse) {
    if (request.reset == "done"){
      loadSites();
      sendResponse({status: "updated"});
    }
  });

}

function loadSites(){

  chrome.storage.sync.get('blocked_sites', function (blockedSites){

    $('.blocked-list').html("");

    if (blockedSites.blocked_sites.length > 0){

      $.each(blockedSites.blocked_sites, function(index, site){

        var addHtml = "<tr><td class = 'site'>"+blockedSites.blocked_sites[index]+"</td>";
        addHtml += "<td class = 'unblock_button'><button class = 'btn btn-default unblock'>Unblock</button</td></tr>"
        $('.blocked-list').append(addHtml);
      })
    }
  });
}

function unblockSite(){

  var index = $('.unblock').index(this);

  chrome.storage.sync.get(['blocked_sites', 'blocked_patterns'], function(blockedSites){

    if (blockedSites.blocked_sites.length === 1){
      reset();
    }

    else if (blockedSites.blocked_sites.length > 1){
      blockedSites.blocked_sites.splice(index, 1);
      blockedSites.blocked_patterns.splice(index, 1);

      chrome.storage.sync.set(blockedSites, function(){

        console.log('Unblocked website #' + index);
        chrome.extension.getBackgroundPage().blockSites();
        loadSites();
      });

    }

  })
}

$(document).ready(function(){
  loadSites();
  $("#block").click(getSite);
  $("#url").keyup(function(event){
    if(event.keyCode == 13){
        $("#block").click();
    }
  });
  $("#reset").click(reset);
  $( ".blocked-list" ).on( "click", ".unblock", unblockSite);
});
