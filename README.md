Luminet 
Next x Nest

' Берём ID и старый статус (dictOld)
If dictOld.exists(id) Then
    Dim oldStatus As String, newStatus As String
    oldStatus = LCase(dictOld(id))
    newStatus = LCase(status) ' новый статус из базы

    ' Берём updateDate для статистики
    Dim updateDate As Variant
    updateDate = data(i, 30)

    If IsDate(updateDate) Then
        If Int(updateDate) = Date Then
            ' считаем пришло/ушло
            If dictOut.exists(oldStatus) Then
                dictOut(oldStatus) = dictOut(oldStatus) + 1
            Else
                dictOut.Add oldStatus, 1
            End If

            If dictIn.exists(newStatus) Then
                dictIn(newStatus) = dictIn(newStatus) + 1
            Else
                dictIn.Add newStatus, 1
            End If
        End If
    End If
End If