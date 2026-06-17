"use strict";
function initOverlay() {
  //Will keep track of whether overlay is up.
  //I'd prefer something more robust, but this is a mockup.
  var bToggleOverlay = false;
  var bToggleLegend = false;
  var bToggleKeyboard = false;
  var bIsMozTabUp = false;
  var bIsTabHeld = false;
  var bIsTrashUp = false;
  
  var bFfMenuInDom = false;
  var bHThumb = false;
  var bHThumbStuffUp = false;

  //This array will store all interaction zones
  //((Mouseclick-for-keyLegend doesn't count))
  //R. Shift will loop through and boxshadow glow.
  //The purpose is so users will know what parts of
  //the demo can be interacted with.
  //
  //The second array works with mouseover and mouseouts to keep track
  //of what the user is trying to interact with.
  //[0] -> Firefox Button
  //[1] -> Virtual Keyboard H-key
  //[2] -> Firefox Drop Down Menu
  //[3] -> H-key RightHand Thumb
  //[4] -> H-key LeftHand Thumb
  //[5] -> Mozilla Tab
  //[6] -> New Tab Tab
  
  var aActZones = new Array();
  var aActZoneActive = new Array();
  aActZoneActive[0] = false;
  aActZoneActive[1] = false;
  aActZoneActive[2] = false;
  aActZoneActive[3] = false;
  aActZoneActive[4] = false;  
  aActZoneActive[5] = false;
  aActZoneActive[6] = false;
  
  //Going to prefix all of the action zones with act.
  var actFfButton = document.createElement('div');
  actFfButton.setAttribute('id','actFfButton');
  aActZones[0] = actFfButton;
  aActZones[2] = actFfButton; //Because I don't want the menu to glow
                              //but still want it to be [2]. So, I'll make
                              //another object get its css set twice.
  actFfButton.onmouseover = function() {
    aActZoneActive[0] = true;
  }
  actFfButton.onmouseout = function() {
    aActZoneActive[0] = false;
  }
  
  var actKeyboardH = document.createElement('div');
  actKeyboardH.setAttribute('id','actKeyboardH');
  aActZones[1] = actKeyboardH;  
  actKeyboardH.onmouseover = function() {
    aActZoneActive[1] = true;
  }  
  actKeyboardH.onmouseout = function() {
    aActZoneActive[1] = false;
  }
  
  var trashCan;
  var actTabNew = document.createElement('div');
  actTabNew.setAttribute('id', 'actTabNew');
  var actTabMozilla = document.createElement('div');
  actTabMozilla.setAttribute('id', 'actTabMozilla');
  aActZones[5] = actTabMozilla;
  aActZones[6] = actTabNew;
  
  actTabMozilla.onmouseover = function() {
    aActZoneActive[5] = true;
  }
  actTabMozilla.onmouseout = function() {
    aActZoneActive[5] = false;
    if (bIsTabHeld) {
      trashCan = document.createElement('div');
      trashCan.style.width = '200px';
      trashCan.style.background = 'rgba(45,45,65,0.6)';
      trashCan.align = 'center';
      trashCan.style.position = 'absolute';
      trashCan.style.left = '0';
      trashCan.style.right = '0';
      trashCan.style.top = '35%';
      trashCan.style.marginLeft = 'auto';
      trashCan.style.marginRight = 'auto';
      trashCan.style.borderRadius = '10px';
      trashCan.innerHTML = '<img src="artAssets/Trash-1a.png">';
      divOverlay.appendChild(trashCan);
      bIsTrashUp = true;
    }
  }
  actTabNew.onmouseover = function() {
    aActZoneActive[6] = true;
  }
  actTabNew.onmouseout = function() {
    aActZoneActive[6] = false;
    if (bIsTabHeld) {
      trashCan = document.createElement('div');
      trashCan.style.width = '200px';
      trashCan.style.background = 'rgba(45,45,65,0.6)';
      trashCan.align = 'center';
      trashCan.style.position = 'absolute';
      trashCan.style.left = '0';
      trashCan.style.right = '0';
      trashCan.style.top = '35%';
      trashCan.style.marginLeft = 'auto';
      trashCan.style.marginRight = 'auto';
      trashCan.style.borderRadius = '10px';
      trashCan.innerHTML = '<img src="artAssets/Trash-1a.png">';
      divOverlay.appendChild(trashCan);
      bIsTrashUp = true;
    }
  }
    
  var divKeyLegend = document.createElement('div');
  divKeyLegend.setAttribute('id', 'keyLegend');
  var divKeyboard = document.createElement('div');
  divKeyboard.setAttribute('id', 'divKeyboard');
  //Create the div for the overlay so we have access to it.
  var divOverlay = document.createElement('div');
  var domBody = document.getElementsByTagName('body')[0];
  divOverlay.setAttribute('id', 'divOverlay');
  var divTopBar = document.createElement('div');
  divTopBar.setAttribute('id', 'divOverlayTopBar');
  var firefoxButton = document.createElement('div');
  firefoxButton.setAttribute('id', 'firefoxButton');
  var FfMenu = document.createElement('div');
  FfMenu.setAttribute('id', 'FfMenu');
  
  FfMenu.onmouseover = function() {
    aActZoneActive[2] = true;
  }
  FfMenu.onmouseout = function() {
    aActZoneActive[2] = false;
  }
  
  var divDate = document.createElement('div');
  
  var tabMozilla = document.createElement('div');
  var tabNew = document.createElement('div');
  tabMozilla.className = 'tabInactive';
  tabNew.className = 'tabActive';
  tabMozilla.setAttribute('id', 'divTabMozilla');
  tabNew.setAttribute('id', 'divTabNew');
  tabNew.innerHTML = 'New Tab';
  tabMozilla.innerHTML = 'Mozilla - Home of the Mozilla Pro...'
  
  var thumbHLeft = document.createElement('div');
  var thumbHRight = document.createElement('div');
  thumbHLeft.className = 'thumbSpot';
  thumbHRight.className = 'thumbSpot';
  
  aActZones[3] = thumbHRight;
  aActZones[4] = thumbHLeft;
  
  var divHa = document.createElement('div');
  var divHe = document.createElement('div');
  var divHi = document.createElement('div');
  divHa.className = 'bubble';
  divHe.className = 'bubble';
  divHi.className = 'bubble';
  
  document.onclick = toggleLegend;
  
  var mozTabContents = document.createElement('IFRAME');
  //Better to check on resize but it's a demo.
  mozTabContents.style.position = 'fixed';
  mozTabContents.style.width = '100%';
  mozTabContents.style.height = '100%';
	
  //TODO: Prevent this from tripping the scrollbar.
  //Currently just disabled scrollbar.
  function toggleLegend() {
    if (!bToggleLegend) {
      domBody.appendChild(divKeyLegend);
      window.setTimeout(slideLegend, 50);  //CSS3 bug, transition will not 
                                           //fire too close to initial 
                                           //keyframe (.appendChild here)
      bToggleLegend = !bToggleLegend;
    }
    else {
      divKeyLegend.style.right = '-575px';
      window.setTimeout(hideLegend, 350);  //Same bug as above. The fix just
                                           //needs implementing in reverse.
      bToggleLegend = !bToggleLegend;
    }
  }
	
  function hideLegend() {
    domBody.removeChild(divKeyLegend);
  }

  function slideLegend() {
    divKeyLegend.style.right='25px';
  }

  //Install event listeners. Down then up then press.
  //Most of these will not do anything. I expect I'll need to install listeners
  //for each interaction element. I can cull unused framework later.
  document.addEventListener('keydown', function(event) {
    if (event.keyCode == 40) {
      homeDown();
    }
    else if (event.keyCode == 38) {
      touchDown();
    }
    else if (event.keyCode == 37) {
      rightThumbDown();
    }
    else if (event.keyCode == 39) {
      leftThumbDown();
    }
    else if (event.keyCode == 16) {
      rShiftDown();
    }
    else if (event.keyCode == 17) {
      rCtrlDown();
    }		
  });
	
  document.addEventListener('keyup', function(event) {
    if (event.keyCode == 40) {
      homeUp();
    }
    else if (event.keyCode == 38) {
      touchUp();
    }
    else if (event.keyCode == 37) {
      rightThumbUp();
    }
    else if (event.keyCode == 39) {
      leftThumbUp();
    }
    else if (event.keyCode == 16) {
      rShiftUp();
    }
    else if (event.keyCode == 17) {
      rCtrlUp();
    }
  });

  function homeDown() {
    toggleOverlay();
  }
  
  function homeUp() {
    //nothing yet, or really ever for the demo.
  }
  
  //**********************************************************************
  //Important!
  //Everything touch related is called from this function.
  //Yes I know, ugh.
  //**********************************************************************
  function touchDown() {    
    checkRaiseMenu();
    checkLowerMenu();
    checkTouchH();
    checkTabMozilla();
    checkTabNew();
    checkIsTabBeingHeld();
  }
  
  function checkIsTabBeingHeld() {
    if (aActZoneActive[5] || aActZoneActive[6])
    {
      bIsTabHeld = true;
    }
  }
  
  function checkTabMozilla() {
    if (aActZoneActive[5] && !bIsMozTabUp) {
      document.getElementById('Firefox Aurora').appendChild(mozTabContents);
      mozTabContents.src = 'Snapshot/Mozilla — Home of the Mozilla Project — mozilla.org.htm';
      tabMozilla.className = 'tabActive';
      tabNew.className = 'tabInactive';
      bIsMozTabUp = true;
    }
  }
  
  function checkTabNew() {
    if (aActZoneActive[6] && bIsMozTabUp) {
      document.getElementById('Firefox Aurora').removeChild(mozTabContents);
      tabNew.className = 'tabActive';
      tabMozilla.className = 'tabInactive';
      bIsMozTabUp = false;
    }
  }
  
  function checkTouchH() {
    if (aActZoneActive[1]) {
      divKeyboard.appendChild(thumbHLeft);
      divKeyboard.appendChild(thumbHRight);
      thumbHLeft.style.bottom = '192px';
      thumbHLeft.style.left = '765px';
      thumbHRight.style.bottom = '192px';
      thumbHRight.style.left = '565px';
      bHThumb = true;
    }  
  }
  
  function checkRaiseMenu() {
    if (aActZoneActive[0]) {
      divTopBar.appendChild(FfMenu);
      bFfMenuInDom = true;
    }
  }
  
  function checkLowerMenu() {
    if (!aActZoneActive[0] && !aActZoneActive[2] && bFfMenuInDom) {
      divTopBar.removeChild(FfMenu);
      bFfMenuInDom = false;     
    }    
  }
  
  function touchUp() {
    checkCancelThumbH();
    bIsTabHeld = false;
    if (bIsTrashUp) {
      divOverlay.removeChild(trashCan);
    }
  }
  
  function checkCancelThumbH() {
    //If we add thumbpoints below H, remove them.
    if (bHThumb) {
      divKeyboard.removeChild(thumbHLeft);
      divKeyboard.removeChild(thumbHRight);
      bHThumb = false;
    }
  }
  
  function rightThumbDown() {
    if (bHThumb) {
      var offsetLeft = 640;
      var offsetBottom = 292;
      divKeyboard.appendChild(divHa);
      divKeyboard.appendChild(divHe);
      divKeyboard.appendChild(divHi);
      divHa.innerHTML = 'ha';
      divHe.innerHTML = 'he';
      divHi.innerHTML = 'hi';
      divHa.style.left = offsetLeft + 'px';
      divHe.style.left = offsetLeft + 200 + 'px';
      divHi.style.left = offsetLeft + 300 + 'px';
      divHa.style.bottom = offsetBottom + 300 + 'px';
      divHe.style.bottom = offsetBottom + 200 + 'px';
      divHi.style.bottom = offsetBottom + 'px';
      bHThumbStuffUp = true;
    }
  }
  
  function rightThumbUp() {
    if (bHThumbStuffUp) {
      divKeyboard.removeChild(divHa);
      divKeyboard.removeChild(divHe);
      divKeyboard.removeChild(divHi);
    }
  }
  
  function leftThumbDown() {
    if (bHThumb) {
      var offsetLeft = 640;
      var offsetBottom = 292;
      divKeyboard.appendChild(divHa);
      divKeyboard.appendChild(divHe);
      divKeyboard.appendChild(divHi);
      divHa.innerHTML = 'ha';
      divHe.innerHTML = 'he';
      divHi.innerHTML = 'hi';
      divHa.style.left = offsetLeft + 'px';
      divHe.style.left = offsetLeft - 200 + 'px';
      divHi.style.left = offsetLeft - 300 + 'px';
      divHa.style.bottom = offsetBottom + 300 + 'px';
      divHe.style.bottom = offsetBottom + 200 + 'px';
      divHi.style.bottom = offsetBottom + 'px';
      bHThumbStuffUp = true;
    }
  }
  
  function leftThumbUp() {
    if (bHThumbStuffUp) {
      divKeyboard.removeChild(divHa);
      divKeyboard.removeChild(divHe);
      divKeyboard.removeChild(divHi);
    }
  }
  
  function rShiftDown() {
    for (var i=0; i < aActZones.length; i++) {
      aActZones[i].style.boxShadow='0px 0px 12px #0f0';
    }
    actTabNew.style.boxShadow='0px 0px 12px #0f0';
    actTabMozilla.style.boxShadow='0px 0px 12px #0f0';
  }
  
  function rShiftUp() {
    for (var i=0; i < aActZones.length; i++) {
      aActZones[i].style.boxShadow='0px 0px 0px #0f0';
    }
  }
  
  function rCtrlDown() {
    //toggle keyboard
    if (!bToggleKeyboard) {
      domBody.appendChild(divKeyboard);
      divKeyboard.style.left=(window.innerWidth - 1259)/2 + 'px';
      divKeyboard.appendChild(actKeyboardH);
      window.setTimeout(wipeInKeyboard, 50); //Same css3 workaround.
      bToggleKeyboard = !bToggleKeyboard;
    }
    else {
      window.setTimeout(wipeOutKeyboard, 360);
      divKeyboard.style.bottom = '-552px';
      bToggleKeyboard = !bToggleKeyboard;
    }
  }
  
  function wipeInKeyboard() {
    divKeyboard.style.bottom = '0px';
  }
  
  function wipeOutKeyboard() {
    divKeyboard.removeChild(actKeyboardH);
    domBody.removeChild(divKeyboard);
  }
  
  function rCtrlUp() {
    //nothing yet, or really ever for the demo.
  }
	
  function fadeInOverlay() {
    divOverlay.style.background = 'rgba(34,34,51,0.6)';
    divTopBar.style.top = '0px';
  }
	
  function unpopulateOverlay() {
    while (divOverlay.hasChildNodes()) {
      divOverlay.removeChild(divOverlay.lastChild);
    }
    domBody.removeChild(divOverlay);
  }

  function populateOverlay() {
    divOverlay.appendChild(divTopBar);
    divTopBar.appendChild(firefoxButton);
    firefoxButton.innerHTML = '<strong>Firefox </strong> &#x25BC';
    divTopBar.appendChild(actFfButton);
    divTopBar.appendChild(tabMozilla);
    divTopBar.appendChild(tabNew);
    divTopBar.appendChild(actTabNew);
    divTopBar.appendChild(actTabMozilla);
    divDate.setAttribute('id', 'divDate');
    divDate.style.left = window.innerWidth/2 - 75 + 'px';
    divOverlay.appendChild(divDate);  
    function tickClock() {
      var datea = new Date();
      var seconds = datea.getSeconds();      
      if (seconds < 10) {
        seconds = '0' + seconds;
      }
      
      var minutes = datea.getMinutes();      
      if (minutes < 10) {
        minutes = '0' + minutes;
      }
            
      divDate.innerHTML = 'The current time is ' + datea.getHours() + ':' + 
      minutes + ':' + seconds;
    }
    tickClock();
    window.setInterval(tickClock, 200); //A little more precise time.
    
    var divDidYouKnow = document.createElement('div');
    divDidYouKnow.style.backgroundColor = 'rgba(100,130,170,0.5)';
    divDidYouKnow.style.position = 'absolute';
    divDidYouKnow.style.top = '70px';
    divDidYouKnow.style.right = '2%';
    divDidYouKnow.style.padding = '0px 10px 10px 10px';
    divDidYouKnow.style.textIndent = '5px';
    divDidYouKnow.style.width ='450px';
    divDidYouKnow.style.font = 'Arial';
    divDidYouKnow.style.color = '#fff';
    divDidYouKnow.style.textShadow = '1px 0px #000, -1px 0px #000, 0px 1px #000, 0px -1px #000';
    divDidYouKnow.innerHTML = '<h2>Did You Know?</h2><img src="artAssets/Settings-1a.png" align="left"><p style="line-height:1.2em;"><br>Do Not Track is a setting which allows websites to voluntarily decide how to treat your personal information. For websites which want to respect their users wishes you are able to tell them how you would like to be treated. <strong>See a video to find out more.</strong></p>';
    divOverlay.appendChild(divDidYouKnow);
  }
	
  function fadeOutOverlay() {
    divOverlay.removeChild(divDate);
    divTopBar.style.top='-50px';
  }
	
  function toggleOverlay() {
    if (!bToggleOverlay){
      domBody.appendChild(divOverlay);
      populateOverlay();
      window.setTimeout(fadeInOverlay, 50);  //CSS3 bug, talked about above.
      bToggleOverlay = !bToggleOverlay;			
    }
    else {			
      divOverlay.style.background='rgba(34,34,51,0)';
      fadeOutOverlay();
      window.setTimeout(unpopulateOverlay, 250);  //Same bug as above.
                                                  //Just in reverse.
      bToggleOverlay = !bToggleOverlay;
    }
  }
}