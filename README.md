Luminet 
Next x Nest

Set dictOld = CreateObject("Scripting.Dictionary")
    Set dictIn = CreateObject("Scripting.Dictionary")
    Set dictOut = CreateObject("Scripting.Dictionary")
    
    For i = 2 To wsAcc.Cells(wsAcc.Rows.Count, 1).End(xlUp).Row
        If wsAcc.Cells(i, 1).Value <> "" Then
            dictOld(wsAcc.Cells(i, 1).Value) = wsAcc.Cells(i, 3).Value
        End If
    Next i