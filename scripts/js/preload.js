const fs = require('fs');
const os = require("os");
const {shell} = require('electron') 
const INDEV = true; // change this to false when you want to do a production build

const INNTUNEINSTALLSCRIPTKEY = "INNTUNEINSTALLSCRIPTKEY";
const INNTUNEUNINSTALLSCRIPTKEY = "INNTUNEUNINSTALLSCRIPTKEY";
const INNTUNEDETECTIONSCRIPTKEY = "INNTUNEDETECTIONSCRIPTKEY";
const INTUNEINSTALLCOMMANDKEY = "INTUNEINSTALLCOMMANDKEY";
const INTUNEUNINSTALLCOMMANDKEY = "INTUNEUNINSTALLCOMMANDKEY";
const DISPLAYHELPONLAUNCHKEY = "DISPLAYHELPONLAUNCHKEY";

let shouldDisplayHelpOnStartUP = true;

let wingetSearchInputRef;
let notificationWrapperRef;
let errorTextRef;
let notificationTextRef;
let LoadingBarRef;
let TableBodyRef;
let operationsRef;
let installModalRef;
let installModalTextRef;
let installCloseModalRef;
let inntuneModalRef;
let inntuneCloseModalRef;
let helpModalRef;
let helpCloseModalRef;
let intuneInstallScriptRef;
let intuneUninstallScriptRef;
let intuneDetectionScriptRef;
let inntuneInstallProcedureModalRef;
let inntuneInstallProcedureloseModalRef;
let installprocedurescriptRef;
let uninstallprocedurescriptRef;
let detectionprocedurescriptRef;
let copyinstallscriptRef;
let copyuninstallscriptRef;
let copydetectionscriptRef;
let generateInntunePackRef
let inntuneScriptGeneratorTextRef;
let exportAppListBtnRef;
let inntuneInstallCommandRef;
let inntuneUninstallCommandRef;
let intuneinstallcommandgenRef;
let intuneuninstallcommandgenRef;
let copyintuneinstallcommandRef;
let copyintuneuninstallcommandRef;

// Contains a raw string table of all the installed apps on the client
// this can later be used to look up IDs to present uninstall button
let currentAppsInstalledRAW = "";

// Wait until the DOM is Loaded
window.addEventListener('DOMContentLoaded', () => {
  updateCurrentlyInstalledApps();

  // get references
  wingetSearchInputRef = document.getElementById('WingetSearchContent');
  notificationWrapperRef = document.getElementById('NotificationWrapper');
  errorTextRef = document.getElementById('ErrorText');
  notificationTextRef = document.getElementById('NotificationText');
  LoadingBarRef = document.getElementById('LoadingBar');
  TableBodyRef = document.getElementById('TableBody');
  operationsRef = document.getElementById('operationsTemplate');
  installModalRef = document.getElementById('installModal');
  installModalTextRef = document.getElementById('installModalText');
  installCloseModalRef = document.getElementById('installCloseModal');
  inntuneModalRef = document.getElementById('inntuneModal');
  inntuneCloseModalRef = document.getElementById('inntuneCloseModal');
  helpModalRef = document.getElementById('helpModal');
  helpCloseModalRef = document.getElementById('helpCloseModal');
  intuneInstallScriptRef = document.getElementById('inntune-installscript');
  intuneUninstallScriptRef = document.getElementById('inntune-uninstallscript');
  intuneDetectionScriptRef = document.getElementById('inntune-detectionscript');
  inntuneInstallProcedureModalRef = document.getElementById('inntuneInstallProcedureModal');
  inntuneInstallProcedureloseModalRef = document.getElementById('inntuneInstallProcedureloseModal');
  installprocedurescriptRef = document.getElementById('installprocedurescript');
  uninstallprocedurescriptRef = document.getElementById('uninstallprocedurescript');
  detectionprocedurescriptRef = document.getElementById('detectionprocedurescript');
  copyinstallscriptRef = document.getElementById('copyinstallscript');
  copyuninstallscriptRef = document.getElementById('copyuninstallscript');
  copydetectionscriptRef = document.getElementById('copydetectionscript');
  generateInntunePackRef = document.getElementById('generateInntunePack');
  inntuneScriptGeneratorTextRef = document.getElementById('inntuneScriptGeneratorText');
  exportAppListBtnRef = document.getElementById('exportAppListBtn');
  inntuneInstallCommandRef  = document.getElementById('inntune-installCommand');
  inntuneUninstallCommandRef  = document.getElementById('inntune-uninstallCommand');
  intuneinstallcommandgenRef = document.getElementById('intuneinstallcommand');
  intuneuninstallcommandgenRef = document.getElementById('intuneuninstallcommand');
  copyintuneinstallcommandRef =document.getElementById('copyintuneinstallcommand');
  copyintuneuninstallcommandRef =document.getElementById('copyintuneuninstallcommand');
  // Add the listeners
  
  shouldDisplayHelpOnStartUP = localStorage.getItem(DISPLAYHELPONLAUNCHKEY);
  if(shouldDisplayHelpOnStartUP === null)
  {
    shouldDisplayHelpOnStartUP = false;
  }
  else
  {
    shouldDisplayHelpOnStartUP = true;
  }

  if(shouldDisplayHelpOnStartUP === false)
  {
    helpModalRef.style.display = "block"; 
  }

  window.onclick = function (event) {
    if (event.target == installModalRef) {
      installModalRef.style.display = "none";
    }
    else if (event.target === inntuneModalRef) {
      inntuneModalRef.style.display = "none";
    }
    else if (event.target === helpModalRef) {
      helpModalRef.style.display = "none";
    }
    else if (event.target === inntuneInstallProcedureModalRef) {
      inntuneInstallProcedureModalRef.style.display = "none";
    }
  }
 
  copyintuneinstallcommandRef.onclick = function()
  {
    navigator.clipboard.writeText(intuneinstallcommandgenRef.value);
  }

  copyintuneuninstallcommandRef.onclick = function()
  {
    navigator.clipboard.writeText(intuneuninstallcommandgenRef.value);
  }
  
  exportAppListBtnRef.onclick = function()
  {
    exportAppList();
  }

  generateInntunePackRef.onclick = function()
  {
    createInntuneInstaller();
  }

  copyinstallscriptRef.onclick = function()
  {
    navigator.clipboard.writeText(installprocedurescriptRef.value);
  }

  copyuninstallscriptRef.onclick = function()
  {
    navigator.clipboard.writeText(uninstallprocedurescriptRef.value);
  }

  copydetectionscriptRef.onclick = function()
  {
    navigator.clipboard.writeText(detectionprocedurescriptRef.value);
  }

  intuneInstallScriptRef.onchange = function () {
    localStorage.setItem(INNTUNEINSTALLSCRIPTKEY, intuneInstallScriptRef.value);
  }

  inntuneInstallCommandRef.onchange = function () {
    localStorage.setItem(INTUNEINSTALLCOMMANDKEY, inntuneInstallCommandRef.value);
  }

  inntuneUninstallCommandRef.onchange = function () {
    localStorage.setItem(INTUNEUNINSTALLCOMMANDKEY, inntuneUninstallCommandRef.value);
  }

  intuneUninstallScriptRef.onchange = function () {
    localStorage.setItem(INNTUNEUNINSTALLSCRIPTKEY, intuneUninstallScriptRef.value);
  }

  intuneDetectionScriptRef.onchange = function () {
    localStorage.setItem(INNTUNEDETECTIONSCRIPTKEY, intuneDetectionScriptRef.value);
  }

  helpCloseModalRef.onclick = function()
  {
    helpModalRef.style.display = "none";
    localStorage.setItem(DISPLAYHELPONLAUNCHKEY,true);
  }

  installCloseModalRef.onclick = function () {
    installModalRef.style.display = "none";
  }

  inntuneCloseModalRef.onclick = function () {
    inntuneModalRef.style.display = "none";
  }

  inntuneInstallProcedureloseModalRef.onclick = function () {
    inntuneInstallProcedureModalRef.style.display = "none";
  }

  wingetSearchInputRef.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      startWingetSearch(wingetSearchInputRef.value);
    }
  });

  // when user pushes on input then it will select all, for faster deletion
  wingetSearchInputRef.addEventListener('focus', function (e) {
    wingetSearchInputRef.select();
  });

  document.getElementById('configureInntuneBtn').onclick = function () {
    let installScript = localStorage.getItem(INNTUNEINSTALLSCRIPTKEY);
    let uninstallScript = localStorage.getItem(INNTUNEUNINSTALLSCRIPTKEY);
    let detectopmScript = localStorage.getItem(INNTUNEDETECTIONSCRIPTKEY);
    let intuneInstallCommand = localStorage.getItem(INTUNEINSTALLCOMMANDKEY);
    let intuneUninstallCommand = localStorage.getItem(INTUNEUNINSTALLCOMMANDKEY);

    if (installScript !== null) {
      intuneInstallScriptRef.textContent = installScript;
    }
    if (uninstallScript !== null) {
      intuneUninstallScriptRef.textContent = uninstallScript;
    }
    if (detectopmScript !== null) {
      intuneDetectionScriptRef.textContent = detectopmScript;
    }
    if(intuneInstallCommand !== null)
    {
      inntuneInstallCommandRef.value = intuneInstallCommand;
    }
    if(intuneUninstallCommand !== null)
    {
      inntuneUninstallCommandRef.value = intuneUninstallCommand;
    }
    inntuneModalRef.style.display = "block";
  }

  document.getElementById('helpBtn').onclick = function () {
    helpModalRef.style.display = "block";
  }

});

function inflateTable(tableData) {
  tableData["Results"].forEach(result => {
    let newTableRow = document.createElement("tr");

    let newtableDataName = document.createElement("td");
    newtableDataName.textContent = result["Name"];

    let newtableDataID = document.createElement("td");
    newtableDataID.textContent = result["Id"];

    let newtableDataVersion = document.createElement("td");
    newtableDataVersion.textContent = result["Version"];

    let newtableDataSource = document.createElement("td");
    newtableDataSource.textContent = result["Source"];

    let newtableDataOps = document.createElement("td");
    let operationsToAdd = operationsRef.cloneNode(true);
    operationsToAdd.classList.remove("HideMe");
    operationsToAdd.removeAttribute("id");

    // if this application is installed then we need to show the uninstall button as well
    if(currentAppsInstalledRAW.includes(result["Id"]))
    {
      operationsToAdd.children[2].classList.remove("HideMe");
    }

    newtableDataOps.appendChild(operationsToAdd);

    newTableRow.appendChild(newtableDataName);
    newTableRow.appendChild(newtableDataID);
    newTableRow.appendChild(newtableDataVersion);
    newTableRow.appendChild(newtableDataSource);
    newTableRow.appendChild(newtableDataOps);
    TableBodyRef.appendChild(newTableRow);

    // need to apply listener to all the genered operations
    Array.from(document.getElementsByClassName("localInstaller")).forEach((element) => {
      element.addEventListener('click', FindMyIDAndInstallPackageLocally);
    });
    Array.from(document.getElementsByClassName("inntuneInstallProcedure")).forEach((element) => {
      element.addEventListener('click', GenerateInntuneInstallProcedure);
    });
    Array.from(document.getElementsByClassName("uninstallLocal")).forEach((element) => {
      element.addEventListener('click', FindMyIDAndUninstallPackageLocally);
    });
  });
}

function FindMyIDAndInstallPackageLocally(event) {
  let tableRow = getTableRowFromOperationsBtn(event.srcElement.parentNode);

  if (tableRow === null) {
    return;
  }
  let idOfPackage = tableRow.children[1].textContent;

  installPackageLocally(idOfPackage);
}

function GenerateInntuneInstallProcedure(event) {
  inntuneScriptGeneratorTextRef.textContent = "";
  let tableRow = getTableRowFromOperationsBtn(event.srcElement.parentNode);
  if (tableRow === null) {
    return;
  }
  let nameOfPackage = tableRow.children[0].textContent;
  let idOfPackage = tableRow.children[1].textContent;
  let sourceOfPackage = tableRow.children[3].textContent;
  nameOfPackage = nameOfPackage.trimStart().trimEnd();
  idOfPackage = idOfPackage.trimStart().trimEnd();
  sourceOfPackage = sourceOfPackage.trimStart().trimEnd();

  let installScript = localStorage.getItem(INNTUNEINSTALLSCRIPTKEY);
  let uninstallScript = localStorage.getItem(INNTUNEUNINSTALLSCRIPTKEY);
  let detectopmScript = localStorage.getItem(INNTUNEDETECTIONSCRIPTKEY);
  let intuneInstallCommand =localStorage.getItem(INTUNEINSTALLCOMMANDKEY);
  let intuneUninstallCommand=localStorage.getItem(INTUNEUNINSTALLCOMMANDKEY);

  if (installScript !== null) {
    installScript = installScript.replaceAll('${{name}}', nameOfPackage);
    installScript = installScript.replaceAll('${{id}}', idOfPackage);
    installScript = installScript.replaceAll('${{source}}', sourceOfPackage);
    installprocedurescriptRef.value = installScript;

  }
  else {
    installprocedurescriptRef.value = "No Script found, Please check 'Configure Inntune section'";
  }

  if (uninstallScript !== null) {
    uninstallScript = uninstallScript.replaceAll('${{name}}', nameOfPackage);
    uninstallScript = uninstallScript.replaceAll('${{id}}', idOfPackage);
    uninstallScript = uninstallScript.replaceAll('${{source}}', sourceOfPackage);
    uninstallprocedurescriptRef.value = uninstallScript;
  }
  else {
    uninstallprocedurescriptRef.value = "No Script found, Please check 'Configure Inntune section'";
  }

  if (detectopmScript !== null) {
    detectopmScript = detectopmScript.replaceAll('${{name}}', nameOfPackage);
    detectopmScript = detectopmScript.replaceAll('${{id}}', idOfPackage);
    detectopmScript = detectopmScript.replaceAll('${{source}}', sourceOfPackage);
    detectionprocedurescriptRef.value = detectopmScript;
  }
  else {
    detectionprocedurescriptRef.value = "No Script found, Please check 'Configure Inntune section'";
  }

  if(intuneInstallCommand !== null)
  {
    intuneinstallcommandgenRef.value = intuneInstallCommand;
  }

  if(intuneUninstallCommand !== null)
  {
    intuneuninstallcommandgenRef.value = intuneUninstallCommand;
  }

  inntuneInstallProcedureModalRef.style.display = "block";
}

function FindMyIDAndUninstallPackageLocally(event)
{
  let tableRow = getTableRowFromOperationsBtn(event.srcElement.parentNode);

  if (tableRow === null) {
    return;
  }
  let idOfPackage = tableRow.children[1].textContent;

  uninstallPackageLocally(idOfPackage);
}

//----------------------------------------------------------------------------------------------------
//------------------------------------------- HELPER FUNCTIONS ---------------------------------------
//----------------------------------------------------------------------------------------------------

// A helper function that takes an HTML element and proccedes to go up the DOM tree
// until it find the first TR element.
function getTableRowFromOperationsBtn(srcElement) {
  let maxDept = 0;
  let tableRow = srcElement;
  do {
    tableRow = tableRow.parentNode;
    maxDept++;
  } while ((tableRow.tagName !== "TR" || maxDept > 10))

  if (typeof (tableRow) === "undefined") {
    displayMessage("Could not perform operation", true);
    return null;
  }

  return tableRow;
}

function displayMessage(message, error) {
  hideNotifications();
  notificationWrapperRef.removeAttribute("hidden");
  if (error === true) {
    errorTextRef.removeAttribute("hidden");
    errorTextRef.innerHTML = message;
  }
  else {
    notificationTextRef.removeAttribute("hidden");
    notificationTextRef.innerHTML = message;
  }
}

function hideNotifications() {
  notificationWrapperRef.setAttribute("hidden", "true");
  errorTextRef.setAttribute("hidden", "true");
  notificationTextRef.setAttribute("hidden", "true");
}

//----------------------------------------------------------------------------------------------------
//------------------------------------------- POWERSHELL CALLS ---------------------------------------
//----------------------------------------------------------------------------------------------------

function startWingetSearch(searchValue) {
  wingetSearchInputRef.setAttribute("disabled", "true");
  LoadingBarRef.removeAttribute('hidden');
  TableBodyRef.innerHTML = "";

  hideNotifications();

  var spawn = require("child_process").spawn, child;

  let commandToRun = ".\\scripts\\ps\\searchWingetRepo.ps1 \"" + searchValue + "\"";
  if(INDEV === false)
  {
    commandToRun = ".\\resources\\app"+commandToRun.substring(0);
  }
  child = spawn("powershell.exe", [commandToRun]);

  child.stdout.on("data", function (data) {
    LoadingBarRef.setAttribute('hidden', 'true');
    wingetSearchInputRef.removeAttribute('disabled');

    try 
    {
      let parsedData = JSON.parse("" + data);
      if (parsedData["Results"].length === 0) {
        displayMessage("No results found for winget package '" + searchValue + "'", false);
      }
      else {
        inflateTable(parsedData);
      }
    } 
    catch (e) 
    {
      displayMessage("Could not parse winget search results for: '" + searchValue + "'", true);
    }
  
  });

  child.stderr.on("data", function (data) {
    LoadingBarRef.setAttribute('hidden', 'true');
    wingetSearchInputRef.removeAttribute('disabled');
    displayMessage("Winget search encountered an error : " + data, true);
  });

  child.stdin.end();
}

function installPackageLocally(id) {
  installModalTextRef.textContent = "";
  installModalRef.style.display = "block";
  var spawn = require("child_process").spawn, child;
  child = spawn("powershell.exe", ["winget install --id " + id + " --accept-source-agreements --accept-package-agreements"]);
  installModalTextRef.textContent = "Running command 'winget install --id " + id + " --accept-source-agreements --accept-package-agreements'\n";

  child.stdout.on("data", function (data) {
    installModalTextRef.textContent += data + "\n";
    if(data.includes("Successfully installed"))
    {
      updateCurrentlyInstalledApps();
      setTimeout(() => {
        startWingetSearch(wingetSearchInputRef.value);
      }, 1000);
    }
  });

  child.stderr.on("data", function (data) {
    installModalTextRef.textContent += data + "\n";
  });

  child.stdin.end();
}

function uninstallPackageLocally(id)
{
  installModalTextRef.textContent = "";
  installModalRef.style.display = "block";
  var spawn = require("child_process").spawn, child;
  child = spawn("powershell.exe", ["winget uninstall  --id " + id + " --accept-source-agreements"]);
  installModalTextRef.textContent = "Running command 'winget uninstall  --id " + id + " --accept-source-agreements\n";

  child.stdout.on("data", function (data) {
    installModalTextRef.textContent += data + "\n";

    if(data.includes("Successfully uninstalled"))
    {
      updateCurrentlyInstalledApps();
      setTimeout(() => {
        startWingetSearch(wingetSearchInputRef.value);
      }, 1000);
    }
  });

  child.stderr.on("data", function (data) {
    installModalTextRef.textContent += data + "\n";
  });

  child.stdin.end();
}

function createInntuneInstaller()
{
  let installScript = installprocedurescriptRef.value;
  let uninstallScript = uninstallprocedurescriptRef.value;
  let detectopmScript =  detectionprocedurescriptRef.value;

  if(installScript === null || uninstallScript === null ||  detectopmScript === null)
  {
    inntuneScriptGeneratorTextRef.textContent += "ERROR: Cannot create inntune innstaller because you have not defined your scripts.";
    return;
  }
  const tempDir = os.tmpdir(); // /tmp
  var dir = tempDir+"/InntuneManager";

  // Create InntuneManager Folder if does not exist
  if (!fs.existsSync(tempDir+"/InntuneManager"))
  {
    inntuneScriptGeneratorTextRef.textContent += "INFO: Attempting to create a directory inside the current users temp directory";
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFile(dir+"\\install.ps1", installScript, function(err) 
  {
    if(err) {
      inntuneScriptGeneratorTextRef.textContent += "ERROR: Could not create install script reason :"+err;
      return console.log(err);
    }

    fs.writeFile(dir+"\\uninstall.ps1", uninstallScript, function(err2) 
    {
      if(err2) {
        inntuneScriptGeneratorTextRef.textContent += "ERROR:Could not create uninstall script reason :"+err2;
        return console.log(err2);
      }

      fs.writeFile(dir+"\\check.ps1", detectopmScript, function(err3) 
      {
        if(err3) {
          inntuneScriptGeneratorTextRef.textContent += "ERROR: Could not create detection script reason :"+err3;
          return console.log(err3);
        }

        let commandToRun = ".\\scripts\\executables\\IntuneWinAppUtil.exe -c "+ tempDir+ "\\InntuneManager -s "+tempDir+"\\InntuneManager\\install.ps1 -o " + tempDir + "\\InntuneManager -q";

        if(INDEV === false)
        {
          commandToRun = ".\\resources\\app"+commandToRun.substring(0);
        }
        var spawn = require("child_process").spawn, child;
        child = spawn("powershell.exe", [commandToRun]);
       
        child.stdout.on("data", function (data) {
          inntuneScriptGeneratorTextRef.textContent += "Info: "+data;
        });
      
        child.stderr.on("data", function (data) {
          inntuneScriptGeneratorTextRef.textContent += "ERROR: "+data;
        });

        shell.openPath( tempDir + "\\InntuneManager"); 
        child.stdin.end();
        
      }); 
    }); 
  }); 
}

function exportAppList()
{
  installModalTextRef.textContent = "";
  installModalRef.style.display = "block";

  const tempDir = os.tmpdir(); // /tmp
  var dir = tempDir+"/InntuneManager";

  // Create InntuneManager Folder if does not exist
  if (!fs.existsSync(tempDir+"/InntuneManager"))
  {
    inntuneScriptGeneratorTextRef.textContent += "INFO: Attempting to create a directory inside the current users temp directory";
    fs.mkdirSync(dir, { recursive: true });
  }

  var spawn = require("child_process").spawn, child;
  child = spawn("powershell.exe", ["winget export --accept-source-agreements -o " + dir+"/applist.json"]);
  installModalTextRef.textContent = "Running command 'winget export --accept-source-agreements -o " + dir+"/applist.json'\n";

  child.stdout.on("data", function (data) {
    installModalTextRef.textContent += data + "\n";
  });

  child.stderr.on("data", function (data) {
    installModalTextRef.textContent += data + "\n";
  });

  shell.openPath( tempDir + "\\InntuneManager"); 
  child.stdin.end();
}

function updateCurrentlyInstalledApps()
{
  currentAppsInstalledRAW = "";
  var spawn = require("child_process").spawn, child;
  child = spawn("powershell.exe", ["winget list --accept-source-agreements"]);

  child.stdout.on("data", function (data) { currentAppsInstalledRAW += data + "\n"; });

  child.stderr.on("data", function (data) { /** Don´t know should i even notify here? */});

  child.stdin.end();
}