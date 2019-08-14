@echo off

SET NEWLINE=^& echo.
SET HOSTS_PATH=%windir%\System32\drivers\etc\hosts

FIND /C /I "logs" %WINDIR%\system32\drivers\etc\hosts
IF %ERRORLEVEL% NEQ 0 ECHO %NEWLINE%%NEWLINE%127.0.0.1 logs>>%HOSTS_PATH%

exit