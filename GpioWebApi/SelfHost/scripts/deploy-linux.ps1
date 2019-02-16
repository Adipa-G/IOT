param ([string]$ip, [string]$destination, [string]$username)

& ".\scripts\publish-linux.ps1"

& pscp.exe -r .\bin\Debug\netcoreapp2.0\linux-arm\publish\* ${username}@${ip}:${destination}

& plink.exe -v -ssh ${username}@${ip} chmod u+x,o+x ${destination}/*