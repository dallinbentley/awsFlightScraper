@echo off
:start
cls
pause

for %%x in (domABQ-BGR,domBUF-CLE,domCLT-DCA,domDEN-HOU,domIAD-JFK,domKOA-MCI,domMCO-MOT,domMSP-OKC,domOMA-PHX,domPIT-SAN,domSAT-SLC,intAKL-BDA,intBGI-BSB,intBUD-CPH,intCPT-DPS,intDUB-FRA,intGCM-HKG,intHKT-LIM,intLIS-MNL,intMVD-OAX,intOPO-POS,intPRG-RTB,intSCL-STX,intSXF-UIO,int1,int2,int3,int4) do cd C:/Users/dallin/Documents/RightFlight/%%x & serverless deploy function -f scrape
