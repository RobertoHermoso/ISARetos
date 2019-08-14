# How to setup the Registry test environment

* **Prerequisites**:

  * `docker`, `docker-compose` must be installed and working.

  * An internet connection is needed, at least, at first execution.

  * In a Windows scenario you will need to share your C drive in order to be able to use volumes in `Docker>Settings>SharedDrives`,  `C` should be checked, and then click on `apply`

  * Have a `logs` folder in the root folder

  * Install dependencies `npm install`.

  * Install grunt globally `npm install grunt -g`.

  * Install grunt globally `npm install grunt-cli -g`.

* Make `logs` point to `127.0.0.1` in your host file.
  * In windows: "C:\Windows\System32\drivers\etc\hosts"

* Ensure you have no problem with exposing an unsecured MongoDB container. Otherwise you will need to attach the docker compose link to your local interface (local refers to Hyper-V IP in a Windows scenario). Example: `- 127.0.0.01:27017:27017`


* The tests require you have a syntax-error-free code by using `jshint`. In case you want to force the execution, you need to change the grunt task in this way: `grunt.registerTask('test', ['mochaTest']);`

* At the first tests execution you may experience some timeouts caused by the Docker image download process. To bypass this issue, simply run `docker-compose pull` inside test directory to initiate a manual download.

* Execute `grunt test`