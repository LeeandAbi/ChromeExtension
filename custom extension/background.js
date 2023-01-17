chrome.webRequest.onCompleted.addListener(function(details){
    chrome.tabs.query({active: true, currentWindow: true}, 
    (tabs)=>{
      console.log("backgroud js invoked");
      chrome.tabs.sendMessage(tabs[0].id, {Success: true})
     });
  },{urls: [ "https://virwsapp393.cua.com.au/odata/QueueProcessingRecords/UiPathODataSvc.RetrieveQueuesProcessing*"]});