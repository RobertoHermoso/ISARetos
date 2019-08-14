### v3.0.1 - 2017-09-20

- [#64](https://github.com/isa-group/governify-registry/issues/64) - Stabilize tests and remove dependencies of designer

### v3.0.0 - 2017-41-8

- [#46](https://github.com/isa-group/governify-registry/issues/46) - Addapt Node JS template for automating

- [#43](https://github.com/isa-group/governify-registry/issues/43) - Remove unused files

- [#39](https://github.com/isa-group/governify-registry/issues/39) - Update package.json old dependencies

- [#37](https://github.com/isa-group/governify-registry/pull/37) - Configurable logger path

- [#36](https://github.com/isa-group/governify-registry/issues/36) - Introduce Travis CI 

- [#35](https://github.com/isa-group/governify-registry/issues/35) - Introduce GRUNT for automating development tasks

- [#32](https://github.com/isa-group/governify-registry/issues/32) - Improve JSON schemas for Agreement and State, and unify

- [#31](https://github.com/isa-group/governify-registry/issues/31) - Update integral test for V3.

- [#29](https://github.com/isa-group/governify-registry/issues/29) - Create tests for stateManager.

- [#23](https://github.com/isa-group/governify-registry/issues/23) - Create tests for controllers of state API.

- [#16](https://github.com/isa-group/governify-registry/issues/16) - Review the models 

- [#10](https://github.com/isa-group/governify-registry/issues/10) - Change route of logger's files

### v2.2.1 2016-01-27

- fixed some bug on deploy and undeploy

- Some improvement in agreements test.

- Fixed swagger yaml file and "error_model" schema has been created.


### v2.2.0 2016-01-20

- Added deploy and undeploy function to registry

- Added logs to deploy process

- added dropDB on testUtils

- fixed bug with sequential function

- added https support.

### v2.1.0 2016-12-13

- Changes in db setup. Minor refactor.

- Minor bug fixed

- Added JSDocs support

- Added scripts to package.json 

- Separated database initialization and configuration

- Updated the way to require database

- Refactored “main.js” to “index.js”

- Added integration tests

### v2.0.0 2016-11-16

- Modularise API Controllers 

- Implemented penalties calculation

- State Manager v2.0, use db instead of memory

- State Manager is implemented with Promises

- Controllers responses using streaming

- Simple stream on guarantees and metrics

- Logger for streaming

- Added config variable for streaming

- Billing and Pricing

- Calculation Added pricing to projectionbuilder()

- Reload operation is implemented

- Mail message on calculation finish

- Billing Calculation and pricing

- StateManager v2.1: divide state by type (guarantees, metrics, …) each one in a single mongo document

- Fixed bug in delete single agreement

- Pricing calculator has been fixed

- Set node max memory in 20GB. Updated node image.

- States of agreements could be requested Period by Period.

- Added support to delete all state fragments

- Request to log state consists of several attempts

- Refactor error model and added documentation of constructor

- Guarantees controller refactoring

### v1.0.0 - 2015-12-14

- Simple agreements API

- Simple state API

- guarantees state API

- metrics state API

- All states saved in a single mongo document

- Server timeout changed

- Implement State Manager

- ENV var for async configuration

- fixed NaN bug

- added put agreement
