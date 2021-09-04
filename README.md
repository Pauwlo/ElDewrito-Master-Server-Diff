# ElDewrito Master Server Diff

Simple tool to compare all the ElDewrito servers being announced across different master servers.

## Features

Take a list of master server /list URLs
Fetch PlebBrowser cache
Fetch their announced ED servers
Compare them all

Example output:

```console
$ npm run production http://158.69.166.144:8080/list http://eldewrito.red-m.net/list http://9.10.11.12/list http://13.14.15.16/list http://17.18.19.20/list 
PlebBrowser shows 40 servers online
Querying 5 master servers...

2 servers missing on http://158.69.166.144:8080/list:

  - 12.23.34.45:11775
  - 67.78.89.90:11775

1 server missing on http://eldewrito.red-m.net/list:

  - 12.23.34.45:11775

12.23.34.45:11775 is missing on 2 master servers:

  - http://158.69.166.144:8080/list
  - http://eldewrito.red-m.net/list

0 server missing on http://9.10.11.12/list
0 server missing on http://13.14.15.16/list
http://17.18.19.20/list didn't respond in time
```
