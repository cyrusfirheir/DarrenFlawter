call tweego --head=src\head-content.html --module=src\modules --output=_export\index.html --format=sugarcube-2 src\scripts src\styles src\twee
call cd _export
call electron .
