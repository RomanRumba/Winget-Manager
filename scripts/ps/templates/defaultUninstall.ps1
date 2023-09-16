# Define your Variables here 
$ProgramID = "${{id}}";
$ProgramSource = "${{source}}";
$Path_local = "$Env:Programfiles\WingetInstalls";

# Create a log file to monitor the installation
Start-Transcript -Path "$Path_local\Log\$ProgramID-install.log" -Force -Append

# resolve winget_exe
$winget_exe = Resolve-Path "C:\Program Files\WindowsApps\Microsoft.DesktopAppInstaller_*_x64__8wekyb3d8bbwe\winget.exe"
if ($winget_exe.count -gt 1){
        $winget_exe = $winget_exe[-1].Path
}

if (!$winget_exe){Write-Error "Winget not installed"}

& $winget_exe uninstall --exact --id $ProgramID --silent --accept-source-agreements --source=$ProgramSource

Stop-Transcript