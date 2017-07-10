
var checkEmpty = function(website){
  chrome.storage.sync.getBytesInUse('blocked_patterns', function(bytes){
    console.log(bytes + " bytes in use.");
    var empty;
    if (parseInt(bytes) === 0){
      empty = true;
      storeSite(website, empty);
    }
    else if (parseInt(bytes) > 0){
      empty = false;
      storeSite(website, empty);
    }
  });
};

var storeSite = function(website, empty){

  if (empty){
    var sites = [];
    var patterns = [];
    sites.push(website);
    patterns.push("*://*."+website+"/*");
    var blockedSites = {
      blocked_sites: sites,
      blocked_patterns: patterns
    };
    chrome.storage.sync.set(blockedSites, function(){
      blockSites();
    });
  }
  else if (!empty){
    getBlockedSites(website);
  }
}

var getBlockedSites = function(website){
  chrome.storage.sync.get(['blocked_sites', 'blocked_patterns'], function (blockedSites){

    blockedSites.blocked_sites.push(website);
    blockedSites.blocked_patterns.push("*://*."+website+"/*")

    chrome.storage.sync.set(blockedSites, function(){
        blockSites();
    });
  });
}

var blockSites = function(){

  chrome.storage.sync.get('blocked_patterns', function(blockedSites){

    console.log("blocking " + blockedSites.blocked_patterns);

    chrome.webRequest.onBeforeRequest.removeListener(blockRequest);
    chrome.webRequest.onBeforeRequest.addListener(blockRequest, {
                urls: blockedSites.blocked_patterns
            }, ['blocking']);
  });

  chrome.runtime.sendMessage({updated: "done"}, function(response) {
    console.log(response.status);
  });
}

function blockRequest(details) {
    return {
        cancel: true
    };
}

var reset = function(){

  chrome.webRequest.onBeforeRequest.removeListener(blockRequest);

  var blockedSites = {
    blocked_sites: [],
    blocked_patterns: []
  };

  chrome.storage.sync.set(blockedSites, function(){
    console.log("Reset");

    chrome.runtime.sendMessage({reset: "done"}, function(response) {
      console.log(response.status);
    });

  });
}

var onStart = function(){
    
    chrome.storage.sync.get('blocked_patterns', function(blockedSites){

        if(blockedSites.blocked_patterns.length > 0){
            chrome.webRequest.onBeforeRequest.addListener(blockRequest, {
                    urls: blockedSites.blocked_patterns
                }, ['blocking']);
        }
    
    });
}

onStart();

