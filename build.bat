@echo off
call del /s /q project\scripts\*
call del /s /q project\styles\*
call npm run build-win
