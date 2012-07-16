var PageQuery, queryString;
PageQuery = (function() {
  function PageQuery(q) {
    var i, _ref;
    this.q = q.length > 1 ? q.slice(1) : null;
    this.keyValuePairs = new Array();
    if (this.q) {
      for (i = 0, _ref = this.q.split("&").length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
        this.keyValuePairs[i] = this.q.split("&")[i];
      }
    }
  }
  PageQuery.prototype.getKeyValuePairs = function() {
    return this.keyValuePairs;
  };
  PageQuery.prototype.getValue = function(s) {
    var j, _ref;
    for (j = 0, _ref = this.keyValuePairs.length; 0 <= _ref ? j < _ref : j > _ref; 0 <= _ref ? j++ : j--) {
      if (this.keyValuePairs[j].split("=")[0] === s) {
        return this.keyValuePairs[j].split("=")[1];
      }
    }
    return false;
  };
  PageQuery.prototype.getParameters = function() {
    var a, j, _ref;
    a = new Array(this.getLength());
    for (j = 0, _ref = this.keyValuePairs.length; 0 <= _ref ? j < _ref : j > _ref; 0 <= _ref ? j++ : j--) {
      a[j] = this.keyValuePairs[j].split("=")[0];
    }
    return a;
  };
  PageQuery.prototype.getLength = function() {
    return this.keyValuePairs.length;
  };
  return PageQuery;
})();
queryString = function(key) {
  var page;
  page = new PageQuery(window.location.search);
  return unescape(page.getValue(key));
};