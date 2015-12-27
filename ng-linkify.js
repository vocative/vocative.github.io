angular.module("linkify", ["ngSanitize"])
.filter('linkify', ['$sanitize', function($sanitize) {
  return function(text, target, attributes) {
    if (!text) return text;
    var html = [];
	var matches = linkify.find(text);
	var prevEnd = 0;
	for(var i = 0; i < matches.length; i++){
		var startLink = text.indexOf(matches[i].value, prevEnd);
		
		addText(text.substr(prevEnd, startLink - prevEnd));
		addLink(matches[i].href, matches[i].value);
		
		prevEnd = startLink + matches[i].value.length;
	}
	addText(text.substr(prevEnd, text.length - prevEnd));
    return $sanitize(html.join(''));

    function addText(text) {
      if (!text) {
        return;
      }
      html.push(sanitizeText(text));
    }

    function addLink(url, text) {
      var key;
      html.push('<a ');
      if (angular.isFunction(attributes)) {
        attributes = attributes(url);
      }
      if (angular.isObject(attributes)) {
        for (key in attributes) {
          html.push(key + '="' + attributes[key] + '" ');
        }
      } else {
        attributes = {};
      }
      if (angular.isDefined(target) && !('target' in attributes)) {
        html.push('target="',
                  target,
                  '" ');
      }
      html.push('href="',
                url.replace(/"/g, '&quot;'),
                '">');
      addText(text);
      html.push('</a>');
    }
  };
}]);
