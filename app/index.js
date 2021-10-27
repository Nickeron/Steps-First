import clock from "clock";
import document from "document";
import { HeartRateSensor } from "heart-rate";
import { display } from "display";
import { BodyPresenceSensor } from "body-presence";
import * as util from "../common/utils";

// Update the clock every second
clock.granularity = "seconds";
let lastSaveHour;

//HeartRateSensor
if (HeartRateSensor) 
{
  const hrs = new HeartRateSensor();
  hrs.start();
}

// Disable HRS when watch is not on wrist
if (BodyPresenceSensor && hrs) 
{
  const body = new BodyPresenceSensor();
  body.addEventListener("reading", () => 
  {
    if (body.present) hrs.start(); 
	  else hrs.stop();
  });
  body.start();
}

// Disable HRS when screen is off
if (display && hrs) 
{
  display.addEventListener("change", () => {
    if (hrs != null)
    {
      if (display.on) hrs.start();
      else hrs.stop();
    }
  });
}

// Update the <text> element every tick with the current time
clock.ontick = event => 
{
  lastSaveHour = util.loadSteps().hourSave;
  
  // On the first second of every hour we save the past steps
  if(event.date.getSeconds() === 0 && event.date.getMinutes() === 0)
  {
    lastSaveHour = event.date.getHours();
    util.saveSteps(lastSaveHour);
  }
  // Or if we miss that chance, we save on the first chance we get.
  else if(lastSaveHour !== event.date.getHours())
  {
    lastSaveHour = event.date.getHours();
    util.saveSteps(lastSaveHour, event.date.getMinutes());
  }
  
  // For debugging purposes
  //console.log(`"Last save: ${util.loadSteps().hourSteps} steps, at: ${util.loadSteps().hourSave}`);
  
  util.setMinutes(event.date.getMinutes());
  util.setHourFormat(event.date.getHours());
    
  // Elements on the right side
  util.setStepsUI();
  setHeartRateUI();  
  util.setCalorieUI();
  util.setDateUI(event.date);
  util.setBatteryUI();
}

function setHeartRateUI()
{
	document.getElementById("heartRateText").text = hrs.heartRate == null? "--" : hrs.heartRate;
}