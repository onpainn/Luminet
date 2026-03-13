Luminet 
Next x Nest

If Int(updateDate) = Date Then  ' только сегодняшние
        If dictOld.exists(id) Then
            If dictOld(id) <> status Then
                Dim oldStatus As String, newStatus As String
                oldStatus = LCase(dictOld(id))
                newStatus = LCase(status)

                ' считаем ушло
                If dictOut.exists(oldStatus) Then
                    dictOut(oldStatus) = dictOut(oldStatus) + 1
                Else
                    dictOut.Add oldStatus, 1
                End If

                ' считаем пришло
                If dictIn.exists(newStatus) Then
                    dictIn(newStatus) = dictIn(newStatus) + 1
                Else
                    dictIn.Add newStatus, 1
                End If
            End If
        End If
    End If