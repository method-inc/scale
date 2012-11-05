
(function(exports) {

  // since we're sharing code client/server and on the client _ is global,
  // we were making it undefined because of variable hoisting on the client

  var _ = exports._ || ('undefined' !== typeof require) && require('underscore');

  // String based helpers

  // I apologize for my really nasty `simple_format` markdown generator
  function _makeListItems(str) {
    var formatted = [];

    // break at the start of list items
    str = str.split(/\n\n\*\s/g);
    formatted.push(str.shift());

    _.each(str, function(s) {
      var list;

      // this is kind of awkward. Breaking at the double lines,
      // because only the first set is really the list item we want
      // and then reserve those (normalized) line feeds for making paragraphs
      s = s.split(/\n\n/);
      list = s.shift();
      s = '\n\n' + s.join('\n\n');

      // break apart into individual list items and join back together properly
      list = list.split(/\n\*\s/g);
      list = '<ul class="bullets"><li>' + (list.length > 0 ? list.join('</li><li>') : list[0]) + '</li></ul>';

      formatted.push(list + s);
    });

    return formatted.join('');
  }

  /*
   * Takes a string. Transforms double line feeds.
   * Returns string.
   */
  function _makeParagraphs(str) {
    str = str.split(/\n\n/mg);
    return '<p>' + (str.length > 1 ? str.join('</p><p>') : str[0]) + '</p>';
  }

  // break tags, quots, apostrophes
  function _simpleFormatting(str) {
    return str.replace(/\n/g, '<br>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
  }

  var string = {
    trimRight: function(str) {
      return str.replace(/\s+$/g, '');
    },

    simple_format: function(text, length) {
      if (!text) return text;

      if (length) text = text.slice(0, length) + '...';

      // data from the import is already escaped so we want to transform things in our white list to
      // safe entities that we can parse back into something formatted nicely
      text = text.replace(/(\&lt;br\&gt;|\r|\n|\r\n)/g, '\n').replace(/\&quot;/g, '"').replace(/\&apos;/g, "'");

      text = _makeListItems(text);
      text = _simpleFormatting(text);
      text = _makeParagraphs(text);

      return text;
    },

    camelcase: function camelcase(str) {
      // Camelcase steps:
      // 1. replace all spaces with hyphens
      // 2. Uppercase all characters following a hyphen and remove hyphen
      // 3. Lowercase the first letter
      // 4. Sanitize of all other non-alphanumeric characters
      str = str.replace(/\s+/g, '-').replace(/(\-[a-z])/g, function ($1) { return $1.toUpperCase().replace('-',''); });
      str = str.replace(/\W+/g, '');
      return str.charAt(0).toLowerCase() + str.slice(1);
    },

    capitalize: function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },

    titleCase: function(string) {
      var words = string.split(' '),
          result = [],
          i = 0;

      for (i; i<words.length; i++) {
        result.push(string.capitalize(words[i]));
      }

      return result.join(' ');
    },

    excerpt: function (text, numWords) {
      if (typeof text === 'undefined') return '';

      var words = text.split(' ', numWords || 100);
      return words.join(' ') + '...';
    },

    commatize: function(num) {
      num += ''; // add an empty string to the num to make it a string
      // use a reg expression to separate the parts of the number by commas
      var regEx = /(\d+)(\d{3})/;
      while (regEx.test(num)) {
        num = num.replace(regEx, "$1,$2");
      }
      return num;
    },

    generateMatchName: function(name, location, age) {
      return name + (age ? ' ('+age+')' : '' ) + (location ? ' from ' + location : '' );
    },

    escape_html: function(s) {
      var MAP = {
         '&': '&amp;',
         '"': '&quot;',
         "'": '&apos;',
         '<': '&lt;',
         '>': '&gt;'
      };
      var repl = function(c) { return MAP[c]; };
      // return s.replace(/[&<>'"]/g, repl);
      return s.replace("<script>", "").replace("</script>", "").replace(/[<>'"]/g, repl);
    }
  };


  // Date based helpers

  var date = {
    create_date: function(text) {

      if ('undefined' === typeof text || !text.replace) return new Date().getTime();

      // remove characters some browsers don't like
      text = text.replace("T", " ").replace(/\.\d\d\d\w$/, "");

      // split into pieces
      text = text.split(/[\- :]/);

      return Date.UTC(text[0], text[1]-1, text[2], text[3], text[4], text[5]);
    },

    date_string: function(d, format) {
      format = format || "MMM d, yyyy h:mm a (EE)";

      if (this.isValidDate(d)) return d.format(format);
      else return "Invalid Date.";

    },

    isValidDate: function(d) {
      return ("[object Date]" !== Object.prototype.toString.call(d)) ? false : !isNaN(d.getTime());
    },

    relative_date: function(olderDate) {
      if (typeof olderDate == "string") olderDate = date.create_date(olderDate);
      var newerDate = new Date(),
          milliseconds = newerDate - olderDate, conversions = [
            ["years", 31518720000],
            ["months", 2626560000 /* assumes there are 30.4 days in a month */],
            ["days", 86400000],
            ["hours", 3600000],
            ["minutes", 60000],
            ["seconds", 1000]
          ],
          i = 0, result;

      for (; i < conversions.length; i++) {
        result = Math.floor(milliseconds / conversions[i][1]);
        if (result >= 2) return result + " " + conversions[i][0] + " ago";
      }

      return "Just now";
    },

    date_ago: function (currentDate, timePassed) {
      // timePassed = { years : 6, months : 5, days : 4, hours : 3, minutes : 2, seconds : 1}

      var conversions = {
            "years" : 31518720000,
            "months" : 2626560000, /* assumes there are 30.4 days in a month */
            "days" : 86400000,
            "hours" : 3600000,
            "minutes" : 60000,
            "seconds" : 1000
          },
          totalTimePassed = 0;

      _.each(timePassed, function (val, key) {
        totalTimePassed += val * conversions[key];
      });

      return new Date(currentDate - totalTimePassed);
    },

    simple_date: function(text) {
      var d = new Date(text);

      return d.getMonth()+1+'/'+d.getDate()+'/'+d.getFullYear();
    },

    simple_time: function(text) {
      var d = new Date(text),
          hh = d.getHours(),
          tod = 'am',
          mm = d.getMinutes();

      if (hh > 12) { hh -= 12; tod = 'pm'; }
      if (mm < 10) { mm = '0' + mm; }

      return hh+':'+mm+tod;
    },

    long_time: function(text) {
      var d = new Date(text),
          hh = d.getHours(),
          tod = 'am',
          mm = d.getMinutes();
          sec = d.getSeconds();

      if (hh > 12) { hh -= 12; tod = 'pm'; }
      if (mm < 10) { mm = '0' + mm; }

      return hh+':'+mm+':'+sec+' '+tod;

    },

    long_date: function(text) {
      var months = [
          'January','February','March','April',
          'May','June','July','August','September',
          'October','November','December'
          ],
          days = [
            'Sunday','Monday','Tuesday',
            'Wednesday','Thursday','Friday','Saturday'
          ],
          d = new Date(text);

      return days[d.getDay()] +', '+ months[d.getMonth()] +' '+ d.getDate;
    }

  };


  // Conversion helpers

  var conversions = {
    height_string: function (cm) {
      var inches = cm / 2.54,
          ft = Math.floor(inches / 12);

      return ft + "'" + Math.round(inches - 12*ft) + '" (' + cm + ' cm)';
    },

    convert_height: function (heightCM, wantsItInFt) {
      var heightString = conversions.height_string(heightCM),
          heightFtIndex = heightString.indexOf('(');

      return wantsItInFt ? heightString.slice(0, heightFtIndex) : heightString.slice(heightFtIndex+1, -1);
    },

    calc_age: function (bd) {
      var birthday = new Date(bd),
          today = new Date(),
          millisecondsPerYear = 1000 * 60 * 60 * 24 * 365;
      if( isNaN(birthday) ) return 'Private';
      return birthday ? Math.floor(Math.abs(today - birthday) / millisecondsPerYear) : undefined;
    }


  };


  // Date helpers

  exports.create_date = date.create_date;
  exports.date_string = date.date_string;
  exports.isValidDate = date.isValidDate;
  exports.relative_date = date.relative_date;
  exports.date_ago = date.date_ago;
  exports.simple_date = date.simple_date;
  exports.simple_time = date.simple_time;
  exports.long_time = date.long_time;
  exports.long_date = date.long_date;


  // String Helpers

  exports.simple_format = string.simple_format;
  exports.camelcase = string.camelcase;
  exports.capitalizeWords = string.titleCase;
  exports.excerpt = string.excerpt;
  exports.commatize = string.commatize;
  exports.generateMatchName = string.generateMatchName;
  exports.escape_html = string.escape_html;


  // Conversion helpers

  exports.height_string = conversions.height_string;
  exports.convert_height = conversions.convert_height;
  exports.calc_age = conversions.calc_age;

}('undefined' === typeof exports ? this : exports));


