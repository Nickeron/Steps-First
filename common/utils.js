import { minuteHistory, today as todayActivity } from 'user-activity';
import { locale, preferences } from "user-settings";
import { battery } from "power";
import { localStorage } from "local-storage";
import * as fs from "fs";
import document from "document";

// Add zero in front of numbers < 10
export function zeroPad(i) {
  return (i < 10) ? "0" + i : i;
}

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

const FILE_TYPE = "cbor";
const SETTINGS_FILE = "settings.cbor";

let hourSteps = 0;

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
const weekDaysGreek = ["Κυρ","Δευ", "Τρί", "Τετ", "Πέμ","Παρ","Σάβ"];
const weekDaysDutch = ["Zon", "Maa", "Din", "Woe", "Don", "Vri", "Zat"];
const weekDaysFrench = ["Dim","Lun", "Mar","Mer","Jeu","Ven","Sam"];
const weekDaysItalian = ["Dom", "Lun", "Mar","Mer","Gio","Ven","Sab"];
const weekDaysSpanish = ["Dom", "Lun", "Mar","Mié","Jue","Vie","Sáb"];
const weekDaysGerman = ["So", "Mo","Di","Mi","Do","Fr","Sa"];

export function getWeekDay(i, locale)
{
  switch(locale.language)
  {
    case "gr-gr": return weekDaysGreek[i];
    case "es-es": return weekDaysSpanish[i];
    case "fr-fr": return weekDaysFrench[i];
    case "it-it": return weekDaysItalian[i];
    case "de-de": return weekDaysGerman[i];
    case "nl-nl": return weekDaysDutch[i];
    default: return weekDaysEnglish[i];
  }
}

function setCommaOnThousands(number)
{
  let numString = "";
  if(number > 1000)
  {
    let thousands = Math.floor(number / 1000);
    numString += thousands;
    numString += ",";
    number = number - 1000 * thousands;
    if (number < 10)
    {
      numString += "0";
    }
    if (number < 100)
    {
      numString += "0";
    }
  }
  numString += number;
  return numString;
}

export function setStepsUI()
{
  
  let stepsTillThisHour = loadSteps();
  
  document.getElementById("totStepsText").text = "";
  
  if (todayActivity.adjusted != null)
  {
    let steps = todayActivity.adjusted.steps;
    
    if(steps - stepsTillThisHour.hourSteps < 250)
    {
      document.getElementById("stepsText").text = steps - stepsTillThisHour.hourSteps;
      document.getElementById("totStepsText").text = "/250";
    }
    else
    {
      document.getElementById("stepsText").text = setCommaOnThousands(steps);
    }
  }
  else
  {
    document.getElementById("stepsText").text = "--";
  }
}

export function loadSteps() 
{
  try {
    return fs.readFileSync(SETTINGS_FILE, FILE_TYPE);
  } catch (ex) {
    return {
      hourSteps: 0,
      hourSave: -1
    }
  }
}

export function saveSteps(currentHour, minutes = 0)
{
  let stepsSoFar = todayActivity.adjusted.steps;
  if(minutes > 0) 
  {     
    const minuteRecords = minuteHistory.query({ limit: minutes });
    minuteRecords.forEach((minute, index) => stepsSoFar -= (minute.steps || 0));
  }
  fs.writeFileSync(SETTINGS_FILE, 
                   {
    hourSteps: stepsSoFar,
    hourSave: currentHour
  }, FILE_TYPE);
}

export function setMinutes(minutes)
{
	document.getElementById("minutesText").text = monoDigits(minutes);
}

export function setHourFormat(hours)
{
	// 12h vs 24h format
	document.getElementById("hoursText").text =  monoDigits(preferences.clockDisplay === "12h" ? hours % 12 || 12 : hours);
}

export function setCalorieUI()
{
	document.getElementById("caloriesText").text = setCommaOnThousands(todayActivity.adjusted.calories);
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