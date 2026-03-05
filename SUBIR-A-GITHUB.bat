@echo off
echo ========================================
echo  SUBIENDO GESTOR A GITHUB...
echo ========================================
echo.

:: Ir a la carpeta del proyecto (cambia esto si está en otro lugar)
cd /d "%~dp0"

:: Iniciar git si no está iniciado
git init

:: Configurar el repositorio remoto
git remote remove origin 2>nul
git remote add origin https://github.com/nutrivibebienestarnatural-eng/nadargentina.git

:: Agregar todos los archivos
git add .

:: Hacer el commit
git commit -m "Gestor Tienda Nube PRO V5 - Sistema completo"

:: Subir a GitHub
git branch -M main
git push -u origin main --force

echo.
echo ========================================
echo  LISTO! Todo subido a GitHub.
echo  Ahora podés conectar Vercel.
echo ========================================
echo.
pause
