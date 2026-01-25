@echo off
setlocal

set "NODE_EXE=%npm_node_execpath%"
if not exist "%NODE_EXE%" (
  set "NODE_EXE=node"
)

"%NODE_EXE%" "%~dp0postinstall.js"
