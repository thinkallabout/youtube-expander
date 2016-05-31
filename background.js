/**
 * Current YouTube page paremeters. 
 */
var watchParams = {
    url: null,
    isEmbed: null,  // true = fullscreen
    watchUrl: null,
    listUrl: null,
}

/**
 * Build a YouTube embed URL with the video and playlist id.
 * 
 * @param {string} watchUrl - YouTube watch page URL.
 * @param {string} listUrl - YouTube list URL.
 * @returns {string} listUrl - YouTube embed URL.
 */
function buildYouTubeEmbedUrl(watchUrl, listUrl) {
    var finalUrl = "https://www.youtube.com/embed/";
    finalUrl += watchUrl
    finalUrl += "?autoplay=1"
    if(listUrl != null) {
        finalUrl += "&list="
        finalUrl += listUrl
    }
    return finalUrl;
}

/**
 * Build a YouTube watch page URL with the video and playlist id.
 * 
 * @param {string} watchUrl - YouTube watch page URL.
 * @param {boolean} listUrl - YouTube list URL.
 * @returns {string} listUrl - YouTube watch page URL.
 */
function buildYouTubeWatchPageUrl(watchUrl, listUrl) {
    var finalUrl = "https://www.youtube.com/watch";
    finalUrl += "?v="
    finalUrl += watchUrl
    if(listUrl != null) {
        finalUrl += "&list="
        finalUrl += listUrl
    }
    return finalUrl;
}

/**
 * Get the watchUrl parameter (w=) from the url.
 * 
 * @param {string} url - YouTube watch page URL.
 * @param {boolean} isEmbed - Is this an embed page or a watch page.
 */
function getWatchParam(url, isEmbed) {
    var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[2].length == 11) {
        return match[2];
    }
    return null;
}

/**
 * Get the playlistUrl parameter (list=) from the url.
 * 
 * @param {string} url - YouTube watch page URL.
 * @param {boolean} isEmbed - Is this an embed page or a watch page.
 */
function getPlaylistParam(url, isEmbed) {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed|list=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[2]){
        return match[2];
    }
    return null;
}

// function getVideoTime() {
//     var player;
//     if(watchParams.isEmbed) {
//         player = document.getElementById("player");
//     } else {
//         player = document.getElementById("movie_player");
//     }
//     return player.getCurrentTime();
// }
//
// https://developer.chrome.com/extensions/messaging
// https://developer.chrome.com/extensions/content_scripts

/**
 * Called when the user clicks the fullscreen button.
 */
function onFullscreenButtonClicked(tab) {
    if(watchParams == null || watchParams.isEmbed == null
        || watchParams.url == null || watchParams.watchUrl == null) {
        return;
    }
    
    var newUrl;
    if(watchParams.isEmbed) {
        newUrl = buildYouTubeWatchPageUrl(watchParams.watchUrl, watchParams.listUrl);
    } else {
        newUrl = buildYouTubeEmbedUrl(watchParams.watchUrl, watchParams.listUrl);
    }
    chrome.tabs.update(tab.id, {url: newUrl});
}

chrome.pageAction.onClicked.addListener(onFullscreenButtonClicked);

/**
 * Called when a tab"s state changes.
 * 
 * @param {integer} tabId - The ID of the changed tab.
 * @param {object} changeInfo - Lists the changes to the state of the tab that was updated.
 * @param {Tab} tab - Gives the state of the tab that was updated. 
 */
function onTabStateChanged(tabId, changeInfo, tab) {
    if(tab.url == undefined) {
        chrome.pageAction.hide(tabId);
        watchParams.url = null;
        watchParams.isEmbed = null;
        watchParams.watchUrl = null;
        watchParams.listUrl = null;
    } else {
        if ((tab.url.indexOf("https://www.youtube.com/watch") == 0)
            || (tab.url.indexOf("http://www.youtube.com/watch") == 0)) {
            chrome.pageAction.show(tabId);
            chrome.pageAction.setTitle({
                tabId: tabId, 
                title: "Maximise YouTube video"
            });
            chrome.pageAction.setIcon({
                tabId: tabId, 
                path: "icons/icon_38_fullscreen.png"
            }, null);
            watchParams.isEmbed = false;
        } else if((tab.url.indexOf("https://www.youtube.com/embed") == 0)
            || (tab.url.indexOf("http://www.youtube.com/embed") == 0)) {
            chrome.pageAction.show(tabId);
            chrome.pageAction.setTitle({
                tabId: tabId, 
                title: "Minimise YouTube video"
            });
            chrome.pageAction.setIcon({
                tabId: tabId, 
                path: "icons/icon_38_minimise.png"
            }, null);
            watchParams.isEmbed = true;
        }
        watchParams.url = tab.url;
        watchParams.watchUrl = getWatchParam(tab.url, watchParams.isEmbed);
        watchParams.listUrl = getPlaylistParam(tab.url, watchParams.isEmbed);
    }
}

chrome.tabs.onUpdated.addListener(onTabStateChanged);