// helper functions for things I'd normally use jquery for.

var $_ = function (id) {
  return document.getElementById(id);
};

$_.getValueOf = function (x) {
  return $_(x).value;
};

$_.setValueOf = function (id, value) {
  $_(id).value = value;
  return true;
};

$_.ajax = function (paramsObj) {
  var httpRequest = new XMLHttpRequest();

  if (!httpRequest) { alert('can\'t make request!'); return false; }

  httpRequest.open(paramsObj.method, paramsObj.url, true);
  httpRequest.onload = function () {
    paramsObj.success(this.responseText);
  };
  httpRequest.setRequestHeader('Content-Type', paramsObj.contentType);
  httpRequest.send(paramsObj.data);
};
