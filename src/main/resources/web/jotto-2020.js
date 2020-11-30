(function (scope, bundled) {
	
	var   enyo     = scope.enyo || (scope.enyo = {})
		, manifest = enyo.__manifest__ || (defineProperty(enyo, '__manifest__', {value: {}}) && enyo.__manifest__)
		, exported = enyo.__exported__ || (defineProperty(enyo, '__exported__', {value: {}}) && enyo.__exported__)
		, require  = enyo.require || (defineProperty(enyo, 'require', {value: enyoRequire}) && enyo.require)
		, local    = bundled()
		, entries;

	// below is where the generated entries list will be assigned if there is one
	entries = ['index'];


	if (local) {
		Object.keys(local).forEach(function (name) {
			var value = local[name];
			if (manifest.hasOwnProperty(name)) {
				if (!value || !(value instanceof Array)) return;
			}
			manifest[name] = value;
		});
	}

	function defineProperty (o, p, d) {
		if (Object.defineProperty) return Object.defineProperty(o, p, d);
		o[p] = d.value;
		return o;
	}
	
	function enyoRequire (target) {
		if (!target || typeof target != 'string') return undefined;
		if (exported.hasOwnProperty(target))      return exported[target];
		var   request = enyo.request
			, entry   = manifest[target]
			, exec
			, map
			, ctx
			, reqs
			, reqr;
		if (!entry) throw new Error('Could not find module "' + target + '"');
		if (!(entry instanceof Array)) {
			if (typeof entry == 'object' && (entry.source || entry.style)) {
				throw new Error('Attempt to require an asynchronous module "' + target + '"');
			} else if (typeof entry == 'string') {
				throw new Error('Attempt to require a bundle entry "' + target + '"');
			} else {
				throw new Error('The shared module manifest has been corrupted, the module is invalid "' + target + '"');
			}
		}
		exec = entry[0];
		map  = entry[1];
		if (typeof exec != 'function') throw new Error('The shared module manifest has been corrupted, the module is invalid "' + target + '"');
		ctx  = {exports: {}};
		if (request) {
			if (map) {
				reqs = function (name) {
					return request(map.hasOwnProperty(name) ? map[name] : name);
				};
				defineProperty(reqs, 'isRequest', {value: request.isRequest});
			} else reqs = request;
		}
		reqr = !map ? require : function (name) {
			return require(map.hasOwnProperty(name) ? map[name] : name);
		};
		exec(
			ctx,
			ctx.exports,
			scope,
			reqr,
			reqs
		);
		return exported[target] = ctx.exports;
	}

	// in occassions where requests api are being used, below this comment that implementation will
	// be injected
	

	// if there are entries go ahead and execute them
	if (entries && entries.forEach) entries.forEach(function (name) { require(name); });
})(this, function () {
	// this allows us to protect the scope of the modules from the wrapper/env code
	return {'src/components/Cell':[function (module,exports,global,require,request){
var
  kind = require("enyo/kind"),
  Control = require("enyo/Control");

var Unicode = {
  nbsp: "\u00A0",
  mdash: "\u2014",
  leftwardArrow: "\u2190",
  upwardArrow: "\u2191",
  rightwardArrow: "\u2192",
  downwardArrow: "\u2193"
};

module.exports = kind({
 allowHtml: true,
 //classes: "letter",
 name: "Cell",
 kind: Control,
 published: {
    status: "",
    text: ""
 },
 components: [
    {
      tag: "span",
      content: Unicode.nbsp,
      name: "cell"
    }
 ],
 style: "border-radius: 50%; color: black; display: inline-block; font-family: monospace; font-size: 30px; line-height: 100%; text-align: center; text-transform: uppercase; width: 32px; height: 32px;",
 create: function() {
    this.inherited(arguments);
    this.textChanged();
    this.statusChanged();
 },
 textChanged: function(oldValue) {
    // start by forcing uppercase and trimming white space
    this.text = this.text.toUpperCase();
    this.text = this.text.replace(/^\s+|\s+$/g, "");
    this.text = this.text.replace(/\s+/g, Unicode.nbsp);
    this.$.cell.setContent(this.text || Unicode.nbsp);
 },
 statusChanged: function(oldValue) {
   var color = "#ff0000";
   var fontStyle = "normal";
   var fontWeight = "normal";
   var mappedStatus = this.mapStatus(this.status);
   switch (mappedStatus) {
     case "present":
       color = "#ffff00";
       fontStyle = "oblique";
       break;
     case "perfect":
       color = "#00ff00";
       fontWeight = "bold";
       break;
     case "absent":
      color = "#ff0000";
      break;
     default:
      color = "orange";
   }
   //this.addRemoveClass("letter", this.encrypted);
   this.applyStyle("background-color", color);
   this.applyStyle("font-style", fontStyle);
   this.applyStyle("font-weight", fontWeight);
 },
 mapStatus: function(status) {
    var retVal = status;
    switch (status) {
      case "o":
        retVal = "present";
        break;
      case "+":
      case "*":
        retVal = "perfect";
        break;
      case "-":
      case ".":
        retVal = "absent";
        break;
    }
    return retVal;    
  }
});
}],'src/components/JottoResult':[function (module,exports,global,require,request){
var
  kind = require("enyo/kind");

var
  Repeater = require("enyo/Repeater"),
  Cell = require("./Cell"),
  Control = require("enyo/Control");

module.exports = kind({
  name: "JottoResult",
  kind: Control,
  components: [
    { 
      name: "cells", 
      kind: Repeater,
      onSetupItem: "setupCell",
      components: [ 
        { 
          kind: Cell
        }
      ]
    }
  ],
  published: {
    guess: "",
    result: ""
  },
  create: function() {
    this.inherited(arguments);
    this.data = [];
  },
  rendered: function() {
    this.statusChanged();
  },
  destroy: function() {
    this.inherited(arguments);
  },
  statusChanged: function(oldValue) {
    this.data = [];
    var guess = this.guess;
    var result = this.result;
    var length = result.length;
    var i;
    for (i = 0; i < length; ++i) {
      var letter = guess.charAt(i);
      var statusChar = result.charAt(i);
      this.data.push({"text": letter, "status": statusChar});
    }
    this.$.cells.setCount(this.data.length);
  },
  setupCell: function(inSender, inEvent) {
    var index = inEvent.index;
    var item = inEvent.item;
    var datum = this.data[index];
    item.$.cell.set("text", datum.text);
    item.$.cell.set("status", datum.status);

    /* stop propagation */
    return true;
  },
});
},{'./Cell':'src/components/Cell'}],'src/components/JottoWord':[function (module,exports,global,require,request){
var
  kind = require("enyo/kind");

var
  Repeater = require("enyo/Repeater"),
  Cell = require("./Cell"),
  Control = require("enyo/Control");

module.exports = kind({
  name: "JottoWord",
  kind: Control,
  components: [
    { 
      name: "cells", 
      kind: Repeater,
      onSetupItem: "setupCell",
      components: [ 
        { 
          kind: Cell
        }
      ]
    }
  ],
  //bindings: [
  //  {
  //    from: "updateWord", 
  //    to: "$.gameStatusLabel.content"
  //  }
  //],
  computed: [
    { 
      method: "updateWord", 
      path: [ "word" ] 
    }
  ],
  published: {
    word: ""
  },
  create: function() {
    this.inherited(arguments);
    this.data = [];
  },
  rendered: function() {
    this.inherited(arguments);
    this.updateWord();
  },
  destroy: function() {
    this.inherited(arguments);
  },
  updateWord: function() {
    this.data = [];
    var length = this.word.length || 0;
    for (var i = 0; i < length; ++i) {
      var letter = this.word.charAt(i);
      var statusChar = " ";
      this.data.push({"text": letter, "status": statusChar});
    }
    this.$.cells.setCount(this.data.length);
  },
  setupCell: function(inSender, inEvent) {
    var index = inEvent.index;
    var item = inEvent.item;
    var datum = this.data[index];
    item.$.cell.set("text", datum.text);
    item.$.cell.set("status", datum.status);

    /* stop propagation */
    return true;
  },
});
},{'./Cell':'src/components/Cell'}],'src/components/UIKeyboard':[function (module,exports,global,require,request){
var
  kind = require("enyo/kind"),
  job = require("enyo/job"),
  utils = require("enyo/utils"),
  Repeater = require("enyo/Repeater"),
  Signals = require("enyo/Signals"),
  Control = require("enyo/Control"),
  FittableColumns = require("layout/FittableColumns"),
  FittableRows = require("layout/FittableRows"),
  onyx = require("onyx"),
  Button = require("onyx/Button");

var Unicode = {
  nbsp: "\u00A0",
  mdash: "\u2014",
  leftwardArrow: "\u2190",
  upwardArrow: "\u2191",
  rightwardArrow: "\u2192",
  downwardArrow: "\u2193"
};

var backgroundColor = "#053120";

module.exports = kind({
  name: "UIKeyboard",
  style: "background-color: " + backgroundColor,
  components: [
    { 
      kind: Signals,
      onkeypress: "handleKeyPress",
      onkeydown: "handleKeyDown"
    },
    {
      kind: Control,
      name: "gameStatusLabel",
      content: "Use on-screen keypad or computer keyboard"
    },
    { 
      name: "prompt", 
      style: "font-size: 30px; padding-bottom: 6px; text-align: center;",
      content: Unicode.nbsp
    },
    { 
      name: "keyboard", 
      components: [
        {kind: FittableColumns, classes: "enyo-center", components: [
          {kind: Button, name: "A", content: "A", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"},
          {kind: Button, name: "B", content: "B", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"},
          {kind: Button, name: "C", content: "C", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"},
          {kind: Button, name: "D", content: "D", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"},
          {kind: Button, name: "E", content: "E", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"},
          {kind: Button, name: "F", content: "F", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"}
        ]},
        {kind: FittableColumns, classes: "enyo-center", components: [
          {kind: Button, name: "G", content: "G", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"},
          {kind: Button, name: "H", content: "H", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"},
          {kind: Button, name: "I", content: "I", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"},
          {kind: Button, name: "J", content: "J", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"},
          {kind: Button, name: "K", content: "K", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"},
          {kind: Button, name: "L", content: "L", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"}
        ]},
        {kind: FittableColumns, classes: "enyo-center", components: [
          {kind: Button, name: "M", content: "M", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"},
          {kind: Button, name: "N", content: "N", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"},
          {kind: Button, name: "O", content: "O", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"},
          {kind: Button, name: "P", content: "P", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"},
          {kind: Button, name: "Q", content: "Q", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"},
          {kind: Button, name: "R", content: "R", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"}
        ]},
        {kind: FittableColumns, classes: "enyo-center", components: [
          {kind: Button, name: "S", content: "S", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"},
          {kind: Button, name: "T", content: "T", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"},
          {kind: Button, name: "U", content: "U", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"},
          {kind: Button, name: "V", content: "V", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"},
          {kind: Button, name: "W", content: "W", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"},
          {kind: Button, name: "X", content: "X", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"}
        ]},
        {kind: FittableColumns, classes: "enyo-center", components: [
          {kind: Button, name: "Y", content: "Y", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"},
          {kind: Button, name: "Z", content: "Z", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"},
          {kind: Button, name: "Backspace", content: Unicode.leftwardArrow, ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"},
          {kind: Button, name: "Enter", content: Unicode.rightwardArrow, ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"},
          {kind: Button, name: "Escape",content: "!", ontap: "tappedKeys", style: "margin: 3px 3px; width: 36px; font-size: 14px; padding: 6px 10px;"}
        ]}
      ]
    }
  ],
  published: {
    guessLength: null
  },
  create: function() {
    this.inherited(arguments);
    this.guessData = [];
    this.guessLength = 0;
  },
  destroy: function() {
    this.inherited(arguments);
  },
  rendered: function() {
    this.inherited(arguments);
    this.refresh();
  },
  processKeypress(key) {
    var ch = key;
    if (ch == Unicode.leftwardArrow || ch == "Backspace") {
      // allow backspace to clear a cell
      if (this.guessData.length > 0) {
        this.guessData.splice(this.guessData.length - 1, 1);
        this.guess(null);
      }
    }
    else if (ch == Unicode.rightwardArrow || ch == "Enter") {
      // Enter key submits the guess
      if (this.guessData.length > 0 && this.guessData.length == this.guessLength) {
        var guessText = this.guessData.join("");
        this.submitGuess(guessText);
      }
    }
    else if (ch == "!" || ch == "Escape") {
      // Clear the guess data
      this.clear();
    }
    else {
      ch = ch.toUpperCase();
      if (ch >= "A" && ch <= "Z") {
        if (this.guessData.length < this.guessLength) {
          this.guess(ch);
        }
      }
    }
  },
  highlightKey: function(key) {
    var k = this.$[key];
    if (k) {
      var originalColor = "#555656";
      k.addStyles("background-color: orange");
      job("resetColor", utils.bindSafely(k, "applyStyle", "background-color", originalColor), 25);
    }
  },
  clear: function() {
    // Clear the guess data
    if (this.guessData.length > 0) {
      this.guessData = [];
      this.$.prompt.setContent(Unicode.nbsp);
      this.refresh();
    }
  },
  setPrompt: function(guess) {
    this.$.prompt.setContent(guess);
    
    var textColor = (guess.length == this.guessLength) ? "orange" : "white";
    this.$.prompt.applyStyle("color", textColor);
  },
  guess: function(key) {
    if (null != key) {
      this.guessData.push(key);
    }
    this.setPrompt(this.guessData.join(""));
  },
  submitGuess: function(guessText) {
    // Enter key submits the guess
    Signals.send("onFinishGuess", {
      guess: guessText
    });
    this.clear();
  },
  handleKeyDown: function(inSender, inEvent) {
    var doKeypress = false;
    var ch = inEvent.key;
    switch (inEvent.keyCode) {
      case 8:
      case 27:
        doKeypress = true;
        break;
      default:
        ch = ch.toUpperCase();
    }

    this.highlightKey(ch);
    if (doKeypress) {
      this.processKeypress(ch);
    }

    /* stop propagation */
    return true;
  },
  handleKeyPress: function(inSender, inEvent) {
    var ch = inEvent.key;
    this.processKeypress(ch);

    /* stop propagation */
    return true;
  },
  tappedKeys: function(inSender, inEvent) {
    var ch = inEvent.originator.content;
    this.processKeypress(ch);

    /* stop propagation */
    return true;
  }
});
}],'src/components/HowToPlayPopup':[function (module,exports,global,require,request){
var
  kind = require("enyo/kind"),
  EnyoImage = require("enyo/Image"),
  Control = require("enyo/Control"),
  FittableColumns = require("layout/FittableColumns"),
  FittableRows = require("layout/FittableRows"),
  Toolbar = require("onyx/Toolbar"),
  Button = require("onyx/Button"),
  Popup = require("onyx/Popup");

var Unicode = {
  nbsp: "\u00A0",
  mdash: "\u2014",
  leftwardArrow: "\u2190",
  upwardArrow: "\u2191",
  rightwardArrow: "\u2192",
  downwardArrow: "\u2193"
};

module.exports = kind({
  kind: Popup,
  components: [
    {
      kind: FittableRows,
      components: [
        {
          kind: Button,
          content: "Dismiss",
          ontap: "dismissPopup"
        },
        {
          kind: Toolbar,
          components: [
            {
              kind: EnyoImage,
              /*style: "width:165px; height:55px",*/
              src: "assets/QuickHowTo.png",
              placeholder: EnyoImage.placeholder,
              alt: "Quick How To"
            }
          ]
        }      
      ]
    }
  ],
  create: function() {
    this.inherited(arguments);
  },
  destroy: function() {
    this.inherited(arguments);
  },
  rendered: function() {
    this.inherited(arguments);
  },
  dismissPopup: function(inSender, inEvent) {
    this.hide();
    return true;
  }
});
}],'src/views/MainView':[function (module,exports,global,require,request){
/**
  For simple applications, you might define all of your views in this file.
  For more complex applications, you might choose to separate these kind of
  definitions into multiple files under this folder and require() as needed.
*/

var
  kind = require("enyo/kind"),
  job = require("enyo/job"),
  Signals = require("enyo/Signals"),
  Repeater = require("enyo/Repeater"),
  WebService = require("enyo/WebService"),
  Scroller = require("enyo/Scroller"),
  EnyoImage = require("enyo/Image"),
  Control = require("enyo/Control"),
  FittableColumns = require("layout/FittableColumns"),
  FittableRows = require("layout/FittableRows"),
  Toolbar = require("onyx/Toolbar"),
  Button = require("onyx/Button"),
  ContextualPopup = require("onyx/ContextualPopup"),
  Popup = require("onyx/Popup"),
  Spinner = require("onyx/Spinner"),
  IntegerPicker = require("onyx/IntegerPicker"),
  PickerDecorator = require("onyx/PickerDecorator"),
  Tooltip = require("onyx/Tooltip"),
  TooltipDecorator = require("onyx/TooltipDecorator");

var
  JottoResult = require("../components/JottoResult"),
  JottoWord = require("../components/JottoWord"),
  UIKeyboard = require("../components/UIKeyboard"),
  HowToPlayPopup = require("../components/HowToPlayPopup");

var Unicode = {
  nbsp: "\u00A0",
  mdash: "\u2014",
  leftwardArrow: "\u2190",
  upwardArrow: "\u2191",
  rightwardArrow: "\u2192",
  downwardArrow: "\u2193"
};

var backgroundColor = "#053120";

module.exports = kind({
  kind: FittableRows,
  components: [
    {
      kind: Signals,
      onFinishGuess: "finishGuess"
    },
    {
      kind: WebService,
      name: "newGameWebService",
      callbackName: "callback",
      handleAs: "json",
      onResponse: "processGameServerResponse",
      onError: "processError",
      //url: "http://localhost:8081/api/game/jotto",
      url: "http://jotto2020.us-e2.cloudhub.io/api/game/jotto",
      method: "POST",
      sync: false
    },
    {
      kind: WebService,
      name: "newGuessWebService",
      callbackName: "callback",
      handleAs: "json",
      onResponse: "processGameServerResponse",
      onError: "processError",
      //url: "http://localhost:8081/api/game/jotto/guess/",
      url: "http://jotto2020.us-e2.cloudhub.io/api/game/jotto/guess/",
      method: "PUT",
      sync: false
    },
    {
      kind: Toolbar,
      style: "background-color: " + backgroundColor,
      components: [
        {
          kind: EnyoImage,
          /** style: "width:165px; height:55px", */
          src: "assets/jotto_logo_small.png",
          placeholder: EnyoImage.placeholder,
          alt: "Jotto Logo"
        },
        {
          kind: TooltipDecorator, 
          components: [
            {
              kind: PickerDecorator,
              components: [
                {
                  style: "min-width: 60px; background-color: " + backgroundColor
                },
                {
                  kind: IntegerPicker,
                  name: "puzzleSizePicker",
                  style: "color: white; background-color: " + backgroundColor,
                  min: 2,
                  max: 12,
                  value: 5
                }
              ]
            },
            {
              kind: Tooltip, 
              content: "Select length of mystery word"
            }
          ]
        },
        {
          kind: Button,
          name: "newGameButton",
          content: "New Game",
          style: "background-color: orange; color: black",
          ontap: "newGame"
        },
        {
          kind: Button,
          content: "?",
          style: "background-color: " + backgroundColor,
          ontap: "showHowToPlayPopup"
        }
      ]
    },
    {
      kind: Toolbar,
      style: "background-color: " + backgroundColor,
      components: [
        {
          kind: Control,
          name: "gameStatusLabel"
        }
      ]
    },
    {
      kind: Scroller,
      fit: true,
      components: [
        {
          name: "jottoWordItem",
          kind: FittableColumns,
          components: [
            {
              name: "jottoWordPadding",
              content: null,
              style: "padding: 5px 0"
            },
            {
              kind: JottoWord,
              name: "jottoWord",
              fit: true
            }
          ]
        },
        {
          kind: Repeater,
          name: "guesses",
          count: 0,
          onSetupItem: "setupGuess",
          components: [
            {
              name: "item",
              kind: FittableColumns,
              components: [
                {
                  name: "index",
                  content: null,
                  style: "padding: 5px 0"
                },
                {
                  kind: JottoResult,
                  fit: true,
                  result: "***o.",
                  guess: "jotox"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      kind: Toolbar,
      style: "background-color: " + backgroundColor,
      components: [
        {
          kind: UIKeyboard,
          name: "keyboardControl"
        },
        {
          kind: Popup,
          name: "popupGuessWarning",
          classes: "popup",
          content: "This guess has already been submitted!",
          style: "background-color: red"
        }
      ]
    },
    {
      name: "spinnerPopup",
      classes: "onyx-sample-popup",
      kind: Popup,
      centered: true,
      modal: true,
      floating: true,
      onHide: "popupHidden",
      scrim: true,
      components: [
        {
          kind: Spinner
        },
        {
          content: "Contacting server..."
        }
      ]
    },
    {
      kind: ContextualPopup, 
      name: "abortCurrentGamePopup",
      style: "width:250px", 
      title: "Abort current game?", 
      centered: true,
      modal: true,
      floating: true, 
      actionButtons: [
        {
          content: "Yes", 
          classes: "onyx-button-warning",
          ontap: "dismissConfirmationPopup"
        },
        {
          content: "No", 
          ontap: "dismissConfirmationPopup"
        }
      ]
    },
    {
      kind: HowToPlayPopup,
      classes: "onyx-sample-popup",
      name: "howToPlayPopup",
      floating: true,
      modal: true,
      centered: false
    }
  ],
  bindings: [
    {
      from: "updateGameStatus",
      to: "$.gameStatusLabel.content"
    }
  ],
  computed: [
    {
      method: "updateGameStatus",
      path: [ "gameStatus", "guessesRemaining" ]
    },
    {
      method: "updatePuzzleSolution",
      path: [ "numLetters", "solution" ]
    }
  ],
  create: function() {
    this.log("MainView::create()");
    this.inherited(arguments);
    this.data = [];
    this.guessHistory = null;
    this.sessionToken = null;
    this.guessesRemaining = 0;
    this.numLetters = 0;
    this.gameStatus = 0;
    this.solution = "";
  },
  destroy: function() {
    this.log("MainView::destroy()");
    this.inherited(arguments);
  },
  rendered: function() {
    this.log("MainView::rendered()");
    this.inherited(arguments);
    this.$.guesses.setCount((this.data || []).length);
  },
  clearGuessHistory: function() {
    this.guessHistory = {};
  },
  updateGameStatus: function() {
    var statusDescription = "";
    switch (this.gameStatus) {
      case 0:
        statusDescription = ">>> Click [New Game] to start <<<";
        break;
      case 1:
        statusDescription = "Guesses remaining: " + this.guessesRemaining;
        break;
      case 2:
        statusDescription = "*** Kudos! You won in " + this.data.length + " guesses. ***";
        break;
      case 3:
        statusDescription = "*** Sorry! You lost. ***";
        break;
    }
    return statusDescription;
  },
  updatePuzzleSolution: function() {
    var length = (String.valueOf(this.data.length)).length;
    var newContent = ">".repeat(length + 1) + Unicode.nbsp;
    this.$.jottoWordPadding.set("content", newContent);
    this.$.jottoWord.set("word", this.solution);
  },
  hideSpinnerPopup: function() {
    var p = this.$.spinnerPopup;
    if (p) {
      p.hide();
    }
  },
  popupHidden: function() {
    //document.activeElement.blur();
  },
  showSpinnerPopup: function() {
    var p = this.$.spinnerPopup;
    if (p) {
      p.show();
    }
  },
  showHowToPlayPopup: function() {
    var p = this.$.howToPlayPopup;
    if (p) {
      p.show();
    }
  },
  dismissConfirmationPopup: function(inSender, inEvent) {
    inSender.popup.hide();
    
    var abortCurrentGame = (inSender.content == "Yes");
    if (abortCurrentGame) {
      this.startNewGame();
    }

    /* stop propagation */
    return true;
  },
  showAbortCurrentGamePopup: function() {
    var p = this.$.abortCurrentGamePopup;
    if (p) {
      p.show();
    }
  },
  invokeNewGameWebService: function(numLetters) {
    this.log("invokeNewGameWebService: " + numLetters);
    var indexOfQuote = this.$.newGameWebService.url.lastIndexOf("?");
    var url = (indexOfQuote >= 0) ? this.$.newGameWebService.url.substring(0, indexOfQuote) : this.$.newGameWebService.url;
    url = url + "?letters=" + numLetters;
    this.$.newGameWebService.url = url;
    this.$.newGameWebService.send({});
    this.showSpinnerPopup();
  },
  invokeNewGuessWebService: function(guessText) {
    this.log("invokeNewGuessWebService: " + guessText);
    var indexOfSlash = this.$.newGuessWebService.url.lastIndexOf("/");
    var url = (indexOfSlash >= 0) ? this.$.newGuessWebService.url.substring(0, indexOfSlash) : this.$.newGuessWebService.url;
    this.$.newGuessWebService.url = url + "/" + guessText;
    this.$.newGuessWebService.set("headers", {"x-session": this.sessionToken});
    this.$.newGuessWebService.send({});
    this.guessHistory[guessText] = guessText;
    this.showSpinnerPopup();
  },
  finishGuess: function(inSender, inEvent) {
    var guessText = inEvent.guess;
    this.log("finishGuess: " + guessText);
    if (null == this.guessHistory[guessText]) {
      this.invokeNewGuessWebService(guessText);
    }
    else {
      this.showPopupGuessWarning();
    }

    /* stop propagation */
    return true;
  },
  startNewGame: function() {
    var numLetters = this.$.puzzleSizePicker.selected.content;
    this.invokeNewGameWebService(numLetters);
  },
  setupGuess: function(inSender, inEvent) {
    this.log("setupGuess...");
    var index = inEvent.index;
    var item = inEvent.item;
    var datum = this.data[index];
    item.$.jottoResult.set("guess", datum.guess);
    item.$.jottoResult.set("result", datum.result);

    var newIndex = "" + (this.data.length - index);
    var newContent = Unicode.nbsp.repeat(2 - newIndex.length) + newIndex + ":" + Unicode.nbsp;
    item.$.index.setContent(newContent);

    /* stop propagation */
    return true;
  },
  newGame: function(inSender, inEvent) {
    this.log("newGame click...");
    
    var gameStatus = this.get("gameStatus");
    if (gameStatus != 1) {
      this.startNewGame();
    }
    else {
      this.showAbortCurrentGamePopup();
    }

    inSender.blur();

    /* stop propagation */
    return true;
  },
  processGameServerResponse: function(inSender, inEvent) {
    this.hideSpinnerPopup();
    //this.sessionToken = inEvent.ajax.xhrResponse.headers["x-session"];

    // do something with it
    //var data = JSON.stringify(inEvent.data[0], null, 2);
    var data = inEvent.data;
    var stats = data.stats || {};
    var turnsTakenList = data["turnsTaken"];
    var turnCount = turnsTakenList.length;

    this.set("sessionToken", data["token"]);
    this.set("guessesRemaining", stats.turnsRemaining || 0);
    this.set("numLetters", stats.puzzleLength);
    this.set("gameStatus", 1);
    this.set("solution", "?".repeat(this.numLetters));
    this.set("data", []);

    if (turnCount < 1) {
      // New game
      this.clearGuessHistory();
      this.$.keyboardControl.set("guessLength", this.numLetters);
    }

    for (var i = 0; i < turnCount; ++i) {
      var item = turnsTakenList[i];
      var guess = item.guess;
      var result = item.result;
      var entry = {guess: guess, result: result};
      this.data.splice(0, 0, entry); // prepend a new entry
    }

    this.$.guesses.setCount(this.data.length);

    var isGameOver = stats.gameOver || false;
    var isVictory = stats.victory || false;
    if (isGameOver) {
      var puzzleWord = stats.puzzleWord;
      var gameStatus = (isVictory) ? 2 : 3;
      this.set("solution", puzzleWord);
      this.set("gameStatus", gameStatus);
      this.$.keyboardControl.clear();
      this.$.keyboardControl.set("guessLength", 0);
    }

    /* stop propagation */
    return true;
  },
  processError: function(inSender, inEvent) {
    this.hideSpinnerPopup();
    var errorResponse = JSON.stringify(inEvent.ajax.xhrResponse, null, 2);
    var xhrBody = (inEvent.ajax.xhrResponse.body.length > 0) ? (JSON.parse(inEvent.ajax.xhrResponse.body)) : null;
    var code = (xhrBody) ? xhrBody.code : 500;
    var errorDescription = (xhrBody) ? xhrBody.detailedMessage : "";
    var errorLog = "Error (" + code + "): " + inEvent.data + "! " + errorDescription;
    this.log(errorLog);
  },
  showPopupGuessWarning: function(inSender, inEvent) {
    var p = this.$.popupGuessWarning;
    if (p) {
      p.setShowing(true);
      job("autoHidePopup", function() {
        p.hide();
      }, 2000);
    }

    /* stop propagation */
    return true;
  }
});

},{'../components/JottoResult':'src/components/JottoResult','../components/JottoWord':'src/components/JottoWord','../components/UIKeyboard':'src/components/UIKeyboard','../components/HowToPlayPopup':'src/components/HowToPlayPopup'}],'src/App':[function (module,exports,global,require,request){
/**
  Define your enyo/Application kind in this file.
*/

var
  kind = require('enyo/kind'),
  Application = require('enyo/Application'),
  MainView = require('./views/MainView');

module.exports = kind({
  kind: Application,
  view: MainView
});

},{'./views/MainView':'src/views/MainView'}],'index':[function (module,exports,global,require,request){
/**
  Instantiate your enyo/Application kind in this file.  Note, application
  rendering should be deferred until the DOM is ready by wrapping it in a
  call to ready().
*/

var
  ready = require('enyo/ready'),
  App = require('./src/App');

ready(function () {
  new App();
});

},{'./src/App':'src/App'}]
	};

});
//# sourceMappingURL=jotto-2020.js.map