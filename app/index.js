import clock from "clock";
import document from "document";
import { HeartRateSensor } from "heart-rate";
import { display } from "display";
import { BodyPresenceSensor } from "body-presence";
import { today as todayActivity } from 'user-activity';
import * as util from "../common/utils";
import * as messaging from "messaging";
import * as fs from "fs";

const SETTINGS_TYPE = "cbor";
const SETTINGS_FILE = "settings.cbor";

// Update the clock every second
clock.granularity = "seconds";

let hourSteps = 0;

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
  // On the first second of every hour we save the past steps
  if(event.date.getSeconds() === 0 && event.date.getMinutes() === 0)
  {
    saveSteps();
  }
  
  util.setMinutes(event.date.getMinutes());
  util.setHourFormat(event.date.getHours());
    
  // Elements on the right side
  util.setStepsUI(loadSteps());
  setHeartRateUI();  
  util.setCalorieUI();
  util.setDateUI(event.date);
  util.setBatteryUI();
}

function setHeartRateUI()
{
	document.getElementById("heartRateText").text = hrs.heartRate == null? "--" : hrs.heartRate;
}

//Settings

function applySettings() 
{
  //hoursText.style.fill = settings.primaryColor;
  //minutesText.style.fill = settings.secondaryColor;
}

messaging.peerSocket.onmessage = (event) => {
  if (event.data.key == "primaryColor") {
    settings.primaryColor = event.data.value;
  } else if (event.data.key == "secondaryColor") {
    settings.secondaryColor = event.data.value;
  }
  applySettings()
}

//appbit.onunload = saveSettings;

function loadSteps() 
{
  try {
    return fs.readFileSync(SETTINGS_FILE, SETTINGS_TYPE);
  } catch (ex) {
    return {
      hourSteps: 0
    }
  }
}

function saveSteps()
{
    hourSteps = todayActivity.adjusted.steps;
    fs.writeFileSync(SETTINGS_FILE, hourSteps, SETTINGS_TYPE);
}