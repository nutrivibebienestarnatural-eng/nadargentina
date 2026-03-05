@echo off
echo ========================================
echo  SUBIENDO ARCHIVOS SRC A GITHUB...
echo ========================================
echo.

:: Ir a la carpeta del proyecto
cd /d "%~dp0"

:: Crear estructura de carpetas si no existe
if not exist "src\app" mkdir "src\app"
if not exist "src\components" mkdir "src\components"
if not exist "src\lib" mkdir "src\lib"

echo Carpetas creadas OK

:: Agregar todos los archivos nuevos
git add src/
git add -A

:: Commit
git commit -m "Agregar carpetas src con componentes"

:: Push
git push origin main --force

echo.
echo ========================================
echo  LISTO! Archivos src subidos.
echo ========================================
echo.
pause
