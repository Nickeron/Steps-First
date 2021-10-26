import { today as todayActivity } from 'user-activity';
import { preferences } from "user-settings";
import { locale } from "user-settings";
import { battery } from "power";
import document from "document";

// Add zero in front of numbers < 10
export function zeroPad(i) {
  return (i < 10) ? "0" + i : i;
}

//https://dev.fitbit.com/build/guides/user-interface/css/
//Convert a number to a special monospace number
export function monoDigits(num, pad = true) 
{
  let monoNum = '';
  if (typeof num === 'number') {
    num |= 0;
    if (pad && num < 10) {
      monoNum = c0 + monoDigit(num);
    } else {
      while (num > 0) {
        monoNum = monoDigit(num % 10) + monoNum;
        num = (num / 10) | 0;
      }
    }
  } else {
    let text = num.toString();
    let textLen = text.length;
    for (let i = 0; i < textLen; i++) {
      monoNum += monoDigit(text.charAt(i));
    }
  }
  return monoNum;
}

const c0 = String.fromCharCode(0x10);
const c1 = String.fromCharCode(0x11);
const c2 = String.fromCharCode(0x12);
const c3 = String.fromCharCode(0x13);
const c4 = String.fromCharCode(0x14);
const c5 = String.fromCharCode(0x15);
const c6 = String.fromCharCode(0x16);
const c7 = String.fromCharCode(0x17);
const c8 = String.fromCharCode(0x18);
const c9 = String.fromCharCode(0x19);

function monoDigit(digit) 
{
  switch (digit) 
  {
    case 0: return c0;
    case 1: return c1;
    case 2: return c2;
    case 3: return c3;
    case 4: return c4;
    case 5: return c5;
    case 6: return c6;
    case 7: return c7;
    case 8: return c8;
    case 9: return c9;
    case '0': return c0;
    case '1': return c1;
    case '2': return c2;
    case '3': return c3;
    case '4': return c4;
    case '5': return c5;
    case '6': return c6;
    case '7': return c7;
    case '8': return c8;
    case '9': return c9;
    default: return digit;
  }
}

const weekDaysEnglish = ["Sun","Mon", "Tue", "Wed", "Thu","Fri","Sat"];
const weekDaysDutch = ["Zon", "Maa", "Din", "Woe", "Don", "Vri", "Zat"];
const weekDaysGerman = ["So", "Mo","Di","Mi","Do","Fr","Sa"];

export function getWeekDay(i, locale)
{
  switch(locale.language)
  {
    case "de-de": return weekDaysGerman[i];
    case "nl-nl": return weekDaysDutch[i];
    default: return weekDaysEnglish[i];
  }
}

export function setStepsUI(stepsSoFar)
{
  let stepsString = "";
  
  if(stepsSoFar >= 250 || stepsSoFar === -1) 
  {
	  if (todayActivity.adjusted != null)
	  {
	  let steps = todayActivity.adjusted.steps;
	  
	  if (steps > 1000) 
	  {
		  let thousands = Math.floor(steps / 1000);
		  stepsString += thousands;
		  stepsString += ",";
		  steps = steps - 1000 * thousands;
		  if (steps < 10) 
		  {
			  stepsString += "0";
		  }
		  if (steps < 100) 
		  {
			  stepsString += "0";
		  }
	  }
	  stepsString += steps;
	  document.getElementById("stepsText").text = stepsString;
  }
  else
  {
	  document.getElementById("stepsText").text = "--";
  }
  
}else{
  document.getElementById("stepsText").text = stepsSoFar;
  document.getElementById("totStepsText").text = "/250";
}
	
}

export function setMinutes(minutes)
{
	document.getElementById("minutesText").text = monoDigits(minutes);
}

export function setHourFormat(hours)
{
	// 12h vs 24h format
	document.getElementById("hoursText").text =  monoDigits(preferences.clockDisplay === "12h" ? hours % 12 : hours);
}

export function setCalorieUI()
{
	document.getElementById("caloriesText").text = monoDigits(todayActivity.adjusted.calories);
}

export function setDateUI(today)
{
	let date = today.getDate();
	let month = today.getMonth() + 1;
	let dateString = getWeekDay(today.getDay(), locale) + " ";

  dateString += date + "/" + month;

	document.getElementById("dateText").text = dateString;
}

export function setBatteryUI()
{
  if(document.getElementById("batteryText") !== null)
  {
    document.getElementById("batteryText").text = battery.chargeLevel + "%";
    
    batteryText.style.fill = (battery.chargeLevel >= 75)? "limegreen" :
                       (battery.chargeLevel >= 35)? "gold" : "firebrick";
  }
}