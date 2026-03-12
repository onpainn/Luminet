Luminet 
Next x Nest

Sub UpdateShopFast_Commented()

Application.ScreenUpdating = False
Application.Calculation = xlCalculationManual

Dim sourceFile As Variant
Dim wbSource As Workbook
Dim wsSource As Worksheet

Dim wsAcc As Worksheet
Dim wsMissing As Worksheet
Dim wsLog As Worksheet

Set wsAcc = ThisWorkbook.Sheets("Аксессуары")
Set wsMissing = ThisWorkbook.Sheets("Отсутствует")
Set wsLog = ThisWorkbook.Sheets("Изменения")

' словарь для старых статусов
Dim dictOld As Object
Set dictOld = CreateObject("Scripting.Dictionary")

' словари для статистики
Dim dictIn As Object
Dim dictOut As Object

Set dictIn = CreateObject("Scripting.Dictionary")
Set dictOut = CreateObject("Scripting.Dictionary")

Dim i As Long

' читаем старые статусы из листа Аксессуары
For i = 2 To wsAcc.Cells(wsAcc.Rows.Count, 1).End(xlUp).Row
    dictOld(wsAcc.Cells(i, 1).Value) = wsAcc.Cells(i, 3).Value
Next i

' выбираем главный файл
sourceFile = Application.GetOpenFilename("Excel Files (*.xlsx), *.xlsx")

If sourceFile = False Then Exit Sub

Set wbSource = Workbooks.Open(sourceFile)
Set wsSource = wbSource.Sheets(1)

' находим последнюю строку
Dim lastRow As Long
lastRow = wsSource.Cells(wsSource.Rows.Count, "B").End(xlUp).Row

' читаем таблицу в массив
Dim data
data = wsSource.Range("B2:G" & lastRow).Value

' массивы результатов
Dim acc()
Dim miss()

ReDim acc(1 To UBound(data), 1 To 3)
ReDim miss(1 To UBound(data), 1 To 3)

Dim rAcc As Long
Dim rMiss As Long

Dim id
Dim name
Dim status
Dim category

For i = 1 To UBound(data)

    id = data(i, 1)
    name = data(i, 2)
    status = data(i, 4)
    category = data(i, 6)

    If LCase(category) = "аксессуары" Then
    
        rAcc = rAcc + 1
        
        acc(rAcc, 1) = id
        acc(rAcc, 2) = name
        acc(rAcc, 3) = status
        
        If LCase(status) = "отсутствует" Then
        
            rMiss = rMiss + 1
            
            miss(rMiss, 1) = id
            miss(rMiss, 2) = name
            miss(rMiss, 3) = status
            
        End If
        
        If dictOld.exists(id) Then
        
            If dictOld(id) <> status Then
            
                Dim oldStatus As String
                Dim newStatus As String
                
                oldStatus = LCase(dictOld(id))
                newStatus = LCase(status)
                
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

Next i

wbSource.Close False

' очищаем листы
wsAcc.Cells.Clear
wsMissing.Cells.Clear

' записываем результаты
wsAcc.Range("A2").Resize(rAcc, 3).Value = acc
wsMissing.Range("A2").Resize(rMiss, 3).Value = miss

' статистика
Dim statRow As Long
Dim key
Dim col As Long

statRow = wsLog.Cells(wsLog.Rows.Count, 1).End(xlUp).Row + 3

wsLog.Cells(statRow, 1) = "Статистика статусов"

col = 2

For Each key In dictIn.keys

    wsLog.Cells(statRow + 1, col) = key
    col = col + 1

Next key

wsLog.Cells(statRow + 2, 1) = "пришло"

col = 2
For Each key In dictIn.keys

    wsLog.Cells(statRow + 2, col) = dictIn(key)
    col = col + 1

Next key

wsLog.Cells(statRow + 3, 1) = "ушло"

col = 2
For Each key In dictIn.keys

    If dictOut.exists(key) Then
        wsLog.Cells(statRow + 3, col) = dictOut(key)
    Else
        wsLog.Cells(statRow + 3, col) = 0
    End If
    
    col = col + 1

Next key

Application.ScreenUpdating = True
Application.Calculation = xlCalculationAutomatic

MsgBox "Обновление завершено"

End Sub