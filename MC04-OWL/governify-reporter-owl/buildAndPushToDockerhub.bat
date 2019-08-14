@ECHO OFF
docker build -t  isagroup/governify-project-gauss-reporter:dev .
docker push isagroup/governify-project-gauss-reporter:dev
exit