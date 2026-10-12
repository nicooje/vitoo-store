' Arranca el agente de Vito Store sin abrir ninguna ventana.
' Lo usa el acceso que deja "Instalar agente (boton del panel).bat" en el Inicio de Windows.
Set fso = CreateObject("Scripting.FileSystemObject")
Set sh = CreateObject("WScript.Shell")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
sh.CurrentDirectory = dir
If Not fso.FolderExists(dir & "\datos") Then fso.CreateFolder(dir & "\datos")
sh.Run "cmd /c node --import tsx src\agente.ts >> datos\agente.log 2>&1", 0, False
