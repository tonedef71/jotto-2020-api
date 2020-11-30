%dw 2.0

//
// Constants
//

var charAbsent = Mule::p('settings.results.charAbsent')
var charInvalid = Mule::p('settings.results.charInvalid')
var charPerfect = Mule::p('settings.results.charPerfect')
var charPresent = Mule::p('settings.results.charPresent')
var rotationLength = Mule::p('settings.crypto.rotationLength')
var minAllowedGuesses = 5