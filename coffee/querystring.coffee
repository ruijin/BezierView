class PageQuery
    constructor: (q) ->
        @q = if (q.length > 1) then q[1..] else null
        @keyValuePairs = new Array()
        if (@q)
            for i in [0...@q.split("&").length]
                @keyValuePairs[i] = @q.split("&")[i]

    getKeyValuePairs: () -> return @keyValuePairs

    getValue: (s) ->
        for j in [0...@keyValuePairs.length]
            if(@keyValuePairs[j].split("=")[0] == s)
                return @keyValuePairs[j].split("=")[1]
        return false

    getParameters: () ->
        a = new Array(@getLength())
        for j in [0...@keyValuePairs.length]
            a[j] = @keyValuePairs[j].split("=")[0]
        return a

    getLength: () -> return @keyValuePairs.length


queryString = (key) ->
    page = new PageQuery(window.location.search)
    return unescape(page.getValue(key))

