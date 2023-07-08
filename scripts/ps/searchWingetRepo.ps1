#      Author: Róman
# Description: F*** you winget search command i did not think this would be this hard....
#              This script allows you to run winget search and get back a json object
#              with the results of the search.
#              
#              Note: this script has been mainly tested with winget and msstore sources

# Create an object which will contain the list of this users Winget Sources
$startProcesingSourceList = $false;
$mySourceList = New-Object System.Collections.Generic.List[string];
ForEach($currentSource in (winget source list))
{
    if($startProcesingSourceList -eq $true)
    {
        #Winget source list returns a string in the form of a table where the values are name and url
        #So my idea is to match the occurance of the url and then use its index to get the name
        $urlOfSource = $currentSource -match 'https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)';

        $mySourceList.Add($currentSource.Substring(0, $currentSource.IndexOf($Matches[0])).TrimEnd())
    }

    if ($startProcesingSourceList -eq $false -and $currentSource -match '^-+$') 
    { 
        $startProcesingSourceList = $true;
    }
}


$searchValue=$args[0]
$resultsArray = @();
$searchResults = (winget search $searchValue)  
$startAddingToArray = $false;
$header = ""; 

if($searchResults.Contains('No package found matching input criteria.'))
{
    $resultToReturn = New-Object PSObject;
    $resultToReturn | Add-Member -type NoteProperty -Name 'Results' -Value  $resultsArray;
    $resultToReturn | Add-Member -type NoteProperty -Name 'Header' -Value  "";
    return ($resultToReturn | ConvertTo-Json)
}

ForEach ($searchResult in $searchResults)
{
    if($startAddingToArray -eq $true)
    {
        $newEntry = New-Object PSObject;

        # My idea is to try to find the ID field using regex since it has a set of rules and from that field try to get the name
        # then get the end of the string which is the source and that leaves basically verion and tag left which can be the same field
        $potentialIdMatch =  [regex]::Matches($searchResult,'([0-9]|[a-zA-Z]|\+|-|_)+\.(\.?([0-9]|[a-zA-Z]|\+|-|_)+)+').Value

        # if we found more than two matches it is safe to say that the first occurance must be the ID field and the second version third could be tag?
        if($potentialIdMatch.Count -ge 2)
        {
            $newEntry | Add-Member -type NoteProperty -Name 'Name' -Value $searchResult.Substring(0,$searchResult.IndexOf($potentialIdMatch[0])).TrimEnd();
            $newEntry | Add-Member -type NoteProperty -Name 'Id' -Value $potentialIdMatch[0];
            $newEntry | Add-Member -type NoteProperty -Name 'Version' -Value $potentialIdMatch[1];
           
        }
        # if we have exacly one match then we know we its ether id or version
        elseif($potentialIdMatch.Count -eq 1)
        {
            #okay hear me out here ......... if we take a substring starting from the begining of the string
            #and to the index of our matched occurance, we can then apply the same matching pattern on it
            #and if this pattern returns a value then it must be the current $potentialIdMatch is the version
            #and our new match is the ID (BRAIN BLOWN 100IQ) otherwise then current $potentialIdMatch is the ID itself
            $potentialSubstringWithID = $searchResult.Substring(0,$searchResult.IndexOf($potentialIdMatch[0]));
            $secondPotentialIdMatch =  [regex]::Matches($potentialSubstringWithID,'([0-9]|[a-zA-Z]|\+|-|_)+\.(\.?([0-9]|[a-zA-Z]|\+|-|_)+)+').Value
          
            if($secondPotentialIdMatch.Count -eq 0)
            {
                 $newEntry | Add-Member -type NoteProperty -Name 'Name' -Value $potentialSubstringWithID.TrimEnd();
                 $newEntry | Add-Member -type NoteProperty -Name 'Id' -Value $potentialIdMatch;

                 # Now we just need to figure out the version, we can create a new substring that will contain the version at the start of the string
                 $potentialSubstringWithVersion = $searchResult.Substring(($searchResult.IndexOf($potentialIdMatch)+($potentialIdMatch.Length))).TrimStart();
                 # TBH i am too lazy to try to remove the matching portion of the string if there is any so we will only remove the source
                 ForEach($currentSourceToCheck in $mySourceList)
                 {
                    if($potentialSubstringWithVersion.Contains($currentSourceToCheck))
                    {
                       $newEntry | Add-Member -type NoteProperty -Name 'Version' -Value  $potentialSubstringWithVersion.Substring(0, $potentialSubstringWithVersion.IndexOf($currentSourceToCheck)).TrimEnd();
                    }
                 }
            }
            elseif($secondPotentialIdMatch.Count -eq 1)
            {
                $newEntry | Add-Member -type NoteProperty -Name 'Name' -Value $searchResult.Substring(0,$searchResult.IndexOf($secondPotentialIdMatch)).TrimEnd();
                $newEntry | Add-Member -type NoteProperty -Name 'Id' -Value $secondPotentialIdMatch;
                $newEntry | Add-Member -type NoteProperty -Name 'Version' -Value $potentialIdMatch;
            }
            else
            {
                $newEntry | Add-Member -type NoteProperty -Name 'Name' -Value "Could not parse";
                $newEntry | Add-Member -type NoteProperty -Name 'Id' -Value "Could not parse";
                $newEntry | Add-Member -type NoteProperty -Name 'Version' -Value "Could not parse";
            }
        }
        else
        {
            #okay so basically this here has the highest chance of failures
            #because at this point the only thing we can match is the capital letter and number IDs with versions that are unknown or latest
            # so that the only thing we can do here. This pattern looks weird why 5? well thats because i've seen some IDs 
            # be 10,12,13 characters long so i take half of that just to ensure that i dont catch anything else.
            $wierdIDMatch =  [regex]::Matches($searchResult,'\s([0-9]|[A-Z]){5}([0-9]|[A-Z])+\s').Value
            if($wierdIDMatch.Count -eq 1)
            {
                $newEntry | Add-Member -type NoteProperty -Name 'Name' -Value $searchResult.Substring(0,$searchResult.IndexOf($wierdIDMatch.TrimStart()));
                $newEntry | Add-Member -type NoteProperty -Name 'Id' -Value $wierdIDMatch.TrimStart().TrimEnd();

                $potentialSubstringWithVersion = $searchResult.Substring(($searchResult.IndexOf($wierdIDMatch)+($wierdIDMatch.Length))).TrimStart();
                
                if($potentialSubstringWithVersion.ToLower().Contains("unknown"))
                {
                    $newEntry | Add-Member -type NoteProperty -Name 'Version' -Value "Unknown";   
                }
                elseif($potentialSubstringWithVersion.ToLower().Contains("latest"))
                {
                    $newEntry | Add-Member -type NoteProperty -Name 'Version' -Value "Latest";   
                }
                else
                {
                 $newEntry | Add-Member -type NoteProperty -Name 'Version' -Value "Could not parse";   
                }
            }
            else
            {
                $newEntry | Add-Member -type NoteProperty -Name 'Name' -Value "Could not parse";
                $newEntry | Add-Member -type NoteProperty -Name 'Id' -Value "Could not parse";
                $newEntry | Add-Member -type NoteProperty -Name 'Version' -Value "Could not parse";
            }
        }

        # Now we try to find the source value
        ForEach($currentSourceToCheck in $mySourceList)
        {
            if($searchResult.Contains($currentSourceToCheck))
            {
                $newEntry | Add-Member -type NoteProperty -Name 'Source' -Value $currentSourceToCheck;
                break;
            }
        }

        $newEntry | Add-Member -type NoteProperty -Name 'FullLine' -Value $searchResult;
        $resultsArray += $newEntry;
    }

    # I might be stupid or retarded maybe a bit of both but at the time of making this winget search 
    # seems to return a string that cannot be converted to a meaningfull table and one top of that
    # it sometimes displays loading, the only thing we can be certain is that after ----------- 
    # we will get only results so thats what we do here, after this line we will start processing the data.
    if ($startAddingToArray -eq $false -and $searchResult -match '^-+$') 
    { 
        $header += $searchResults[$searchResults.IndexOf($searchResult)-1];
        $startAddingToArray = $true;
    }
}

$resultToReturn = New-Object PSObject;
$resultToReturn | Add-Member -type NoteProperty -Name 'Results' -Value  $resultsArray;
$resultToReturn | Add-Member -type NoteProperty -Name 'Header' -Value  $header;


return ($resultToReturn | ConvertTo-Json)