Luminet 
Next x Nest

       ' Статистика изменений только за сегодня
        If dictOld.exists(id) Then
            oldStatus = LCase(dictOld(id))
            newStatus = LCase(status)
            
            If IsDate(updateDate) Then
                If Int(updateDate) = Date Then
                    ' Ушло
                    If dictOut.exists(oldStatus) Then
                        dictOut(oldStatus) = dictOut(oldStatus) + 1
                    Else
                        dictOut.Add oldStatus, 1
                    End If
                    
                    ' Пришло
                    If dictIn.exists(newStatus) Then
                        dictIn(newStatus) = dictIn(newStatus) + 1
                    Else
                        dictIn.Add newStatus, 1
                    End If
                End If
            End If
        End