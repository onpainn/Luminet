Luminet 
Next x Nest

        Dim updateDate As Variant
updateDate = data(i, 30)  ' колонка с датой

If IsDate(updateDate) Then
    If Int(updateDate) = Date Then  ' только сегодня

        ' --- Ушло ---
        If dictOld.exists(id) Then
            oldStatus = LCase(dictOld(id))
            If dictOut.exists(oldStatus) Then
                dictOut(oldStatus) = dictOut(oldStatus) + 1
            Else
                dictOut.Add oldStatus, 1
            End If
        End If

        ' --- Пришло ---
        newStatus = LCase(status)
        If dictIn.exists(newStatus) Then
            dictIn(newStatus) = dictIn(newStatus) + 1
        Else
            dictIn.Add newStatus, 1
        End If

    End If
End If