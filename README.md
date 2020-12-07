# jotto-2020-api
The game of Jotto recreated as a web API implemented with the Mule 4 integration platform.


In src/main/resources/web/jotto-2020.js (around line 615) is where the endpoint URLs for the Mule APIs are configured.  
The "url" field for "newGameWebService" and "newGuessWebService" must be set appropriately for the web client to function.

```
    {
      kind: WebService,
      name: "newGameWebService",
...
      //url: "http://localhost:8081/api/game/jotto",
      url: "http://jotto2020.us-e2.cloudhub.io/api/game/jotto",
      method: "POST",
...
    },
    {
      kind: WebService,
      name: "newGuessWebService",
...
      //url: "http://localhost:8081/api/game/jotto/guess/",
      url: "http://jotto2020.us-e2.cloudhub.io/api/game/jotto/guess/",
      method: "PUT",
...
    },
```
