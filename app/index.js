import clock from "clock";
import document from "document";
import { HeartRateSensor } from "heart-rate";
import { me as appbit } from "appbit";
import { minuteHistory, dayHistory } from "user-activity";
import { display } from "display";
import { BodyPresenceSensor } from "body-presence";
import * as util from "../common/utils";
import * as messaging from "messaging";
import * as fs from "fs";

const SETTINGS_TYPE = "cbor";
const SETTINGS_FILE = "settings.cbor";

// Update the clock every second
clock.granularity = "seconds";

const caloriesUI = document.getElementById("caloriesText");

//HeartRateSensor
if (HeartRateSensor) 
{
  const hrs = new HeartRateSensor();
  hrs.start();
}

// Disable HRS when watch is not on wrist
if (BodyPresenceSensor && hrs) {
  const body = new BodyPresenceSensor();
  body.addEventListener("reading", () => 
  {
    if (body.present) hrs.start(); 
	  else hrs.stop();
  });
  body.start();
}

// Disable HRS when screen is off
if (display && hrs) {
  display.addEventListener("change", () => {
    if (hrs != null) 
    {
      if (display.on) hrs.start();
      else hrs.stop();
    }
  });
}

// Get steps walked since this hour began
function SetHourlySteps(minutes)
{
  if (appbit.permissions.granted("access_activity")) 
  {
    let stepsTillNow = 0;
    // query the previous minutes step data
    const minuteRecords = minuteHistory.query({ limit: minutes });
    
    minuteRecords.forEach((minute, index) => stepsTillNow += (minute.steps || 0));

    return stepsTillNow;
  }
  return -1;
}

let settings = loadSettings();
applySettings();

// Update the <text> element every tick with the current time
clock.ontick = event => 
{ 
  util.setMinutes(event.date.getMinutes());
  util.setHourFormat(event.date.getHours());
    
  // Elements on the right side
  util.setStepsUI(SetHourlySteps(event.date.getMinutes()));
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

appbit.onunload = saveSettings;

function loadSettings() 
  {
  try {
    return fs.readFileSync(SETTINGS_FILE, SETTINGS_TYPE);
  } catch (ex) {
    return {
      primaryColor: "lightcoral",
      secondaryColor: "lightskyblue",
    }
  }
}

function saveSettings() 
  {
  fs.writeFileSync(SETTINGS_FILE, settings, SETTINGS_TYPE);
}