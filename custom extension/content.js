var inProgessItems;
var queueResult;
// construct headers
var myHeaders = new Headers();
var requestOptions = {
  mode: 'no-cors',
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow',
};

function findTimeDiff(time){
  var timeDiff=(new Date().getTime()-time)/1000;
  if (timeDiff>60){
      return Math.round(timeDiff/60)+"mins"+ Math.round(timeDiff%60)
  }else{
    return Math.round(timeDiff)+"secs"
  };               
};
// change row color based on in progress process time
function colorChange(element, time, avgTime){
  if(time!=0){
    var timeDiff=(new Date().getTime()-time)/1000;
    if(timeDiff<=avgTime){
      element.style.backgroundColor="rgb(178, 255, 102)"
    }else if(Math.round(timeDiff/avgTime)<=2){
      element.style.backgroundColor="rgb(255, 153, 51)"
    }else{
      element.style.backgroundColor="rgb(255, 51, 51)"
    }
  }else{
    element.style.backgroundColor=""
  }
};

function renderFunc(element, queueDict, processingDict){
  var inProcessTime=0;
  var queueNameEle=element.children[1].children[0];
  var genEle=element.children[1].children[1];
  if(queueDict[queueNameEle.innerText][0] in processingDict){
    var inProcessTime=processingDict[queueDict[queueNameEle.innerText][0]]
    if(genEle===undefined){
      //create new element if no element was created
      var newEle =document.createElement("div");
      newEle.classList.add("extension-generated-element");
      var newText=document.createTextNode("🏃‍♂️"+findTimeDiff(inProcessTime));
      newEle.appendChild(newText);
      queueNameEle.after(newEle);
    }else{
      //update data if the element is already created.
      genEle.innerText="🏃‍♂️"+findTimeDiff(inProcessTime);
    }
  }else if(genEle!=undefined){
    //delete the element if no in progress item left
    genEle.remove()
  }
  //add coloring to the row
  colorChange(element, inProcessTime, queueDict[queueNameEle.innerText][1]);
};

function timeElapsedGen(){
  // retrive all inprogress items
  fetch("https://virwsapp393.cua.com.au/odata/QueueItems?$filter=Status%20eq%20'InProgress'", requestOptions)
    .then(response => response.json())
    .then((result)=>{
      inProgessItems=result;
      //console.log(inProgessItems);
      // retrive all queue definitions
      fetch("https://virwsapp393.cua.com.au/odata/QueueProcessingRecords/UiPathODataSvc.RetrieveQueuesProcessingStatus()", requestOptions)
        .then(response => response.json())
        .then(result =>{ 
          queueResult=result;
          // Construct a hashMap of queue name-> queue id, processingMeantime`
          var dict ={};
          queueResult.value.forEach(element => {
          dict[element['QueueDefinitionName']]=[element['Id'],element['ProcessingMeanTime']] ;
          });
          // construct hashMap queue id-> oldest elapsed time
          var timeDict={};
          inProgessItems.value.forEach(element=>{
            var startTime=new Date(element.StartProcessing).getTime();
            if(element.QueueDefinitionId in timeDict){
              if(timeDict[element.QueueDefinitionId]> startTime){
                timeDict[element.QueueDefinitionId]= startTime
              }
            }else{
              timeDict[element.QueueDefinitionId]= startTime
            }
          });
          // loop through all queue rows in the table and append data
          var queueRows=document.getElementsByClassName("ui-grid-row ng-star-inserted");
          Array.from(queueRows).forEach(row => {
            renderFunc(row, dict, timeDict);
          })        
        })
        .catch(error => console.log('error', error));
      
    })
    .catch(error => console.log('error', error));
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.Success){
      setTimeout(()=>{
        console.log("content function invoked");
        timeElapsedGen();
        /*Array.from(document.getElementsByClassName("grid-refresh-button mat-icon-button")).forEach(element=>element.addEventListener("click",
        timeElapsedGen
      ))*/}, 1000)
    };
  }
);