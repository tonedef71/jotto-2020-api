%dw 2.0

import * from modules::shared_constants

//
// Shared functions
//

fun qshuffle(data) = data orderBy(random()) 

fun factorial(value: Number) =
(value to 1) reduce (val, acc = 1) -> val * acc

fun fibonacci(value: Number) =
(2 to value reduce (val, acc = [0, 1]) -> flatten([acc, acc[(val - 2)] + acc[(val - 1)]]))[value]

fun computeMaximumTurns(numLetters: Number) =
//floor(26 * sqrt(numLetters)) - 26
//floor(numLetters * 2.5)
//max([minAllowedGuesses, numLetters])
max([minAllowedGuesses, floor(numLetters * 0.85)])

fun replaceChar(text, pos, char) = 
using (
    length = sizeOf(text default "")
)
0 to max([length - 1, 0]) reduce (val, acc = "") -> (acc ++ (if (val == pos) char else if (val < length) text[val] else ""))

fun rotateTextBackward(text, count = 13) =
using (
    a = dw::core::Strings::charCodeAt("a", 0)
)
0 to sizeOf(text) - 1 reduce (val, acc = "") -> acc ++ 
dw::core::Strings::fromCharCode(
    mod(dw::core::Strings::charCodeAt(text, val) - a + 26 - count, 26) + a
)

fun rotateTextForward(text, count = 13) =
using (
    a = dw::core::Strings::charCodeAt("a", 0)
)
0 to sizeOf(text) - 1 reduce (val, acc = "") -> acc ++ 
dw::core::Strings::fromCharCode(
    mod(dw::core::Strings::charCodeAt(text, val) - a + 26 + count, 26) + a
)

fun obfuscatePuzzleWord(text) =
rotateTextForward(text, rotationLength)

fun deobfuscatePuzzleWord(text) =
rotateTextBackward(text, rotationLength)

fun deriveInitialAccumulator(sourceText, targetText) = 
using (
    length = sizeOf(sourceText),
    mask = deriveDefaultMaskText(sourceText)
)
0 to (length - 1) reduce (val, acc = {"seed": sourceText, "mask": mask, "test": targetText})
->
using (
    currentChar = (sourceText[val] default "?"),
    testChar = (acc.test[val] default "?")
)
(if (currentChar == testChar)
        {
            "seed": sourceText,
            "mask": replaceChar(acc.mask, val, "*"), 
            "test": replaceChar(acc.test, val, upper(testChar))
        }
else
        {
            "seed": sourceText,
            "mask": acc.mask, 
            "test": acc.test
        }
)

fun computeResults(sourceText, targetText) =
using (
    length = sizeOf(sourceText),
    initialAccumulator = deriveInitialAccumulator(sourceText, targetText)
)
(0 to (length - 1) reduce (val, acc = initialAccumulator) -> 
using (
    currentChar = (sourceText[val] default "?"),
    testChar = (acc.test[val] default "?"),
    indices = find(acc.test, currentChar)
)
(
    if (currentChar == testChar or currentChar == lower(testChar)) 
        {
            "seed": sourceText,
            "mask": replaceChar(acc.mask, val, "*"), 
            "test": replaceChar(acc.test, val, upper(testChar))
        }
    else if (contains(acc.test, currentChar)) 
        {
            "seed": sourceText,
            "mask": replaceChar(acc.mask, val, "o"), 
            "test": if (sizeOf(indices) > 0) 
                    replaceChar(acc.test, indices[0], upper(acc.test[indices[0]])) 
                else 
                    acc.test
        }
    else 
        {
            "seed": sourceText,
            "mask": acc.mask, 
            "test": acc.test
        }
))

fun retrievePuzzleWord(puzzleLength = 5, puzzleIndex = 0) =
using (
	sourceFile = joinBy(["classpath://data", joinBy([puzzleLength as String, "_letter_words_enc.txt"], "")], "/"),
	puzzleWords = readUrl(sourceFile, "application/csv", {"header": false}),
	puzzleWord = puzzleWords[puzzleIndex]."column_0"
)
deobfuscatePuzzleWord(puzzleWord)

fun getCountOfPuzzleWords(puzzleLength: Number): Number =
using (
	sourceFile = joinBy(["classpath://data", joinBy([puzzleLength as String, "_letter_words_enc.txt"], "")], "/"),
	puzzleWords = readUrl(sourceFile, "application/csv", {"header": false})
)
sizeOf(puzzleWords)

fun deriveDefaultMaskText(word) = 
dw::core::Strings::repeat(charAbsent, sizeOf(word))

fun determineIfVictory(result: String): Boolean =
(dw::core::Strings::repeat(charPerfect, sizeOf(result)) == result)

fun computeGameStats(inGameState, inPuzzleWord, inGuess) = 
using (
gameState = inGameState default {},
puzzleWord = inPuzzleWord default "",
guess = inGuess default "",
defaultMaskText = deriveDefaultMaskText(puzzleWord),
results = (if (!isBlank(guess)) computeResults(guess, puzzleWord) else null) default {},
result = results.mask default defaultMaskText,
turnsTaken = gameState.turnsTaken default [],
maxTurnsAvailable = (gameState.stats default {}).maximumTurns default sizeOf(puzzleWord),
turnsTakenCount = sizeOf(turnsTaken) + (if (!isBlank(guess)) 1 else 0),
turnsRemaining = maxTurnsAvailable - turnsTakenCount,
isVictory = if (turnsTakenCount > 0) determineIfVictory(result) else false,
gameOver = (turnsRemaining < 1) or isVictory,
gameStats = dw::core::Objects::mergeWith(gameState.stats default {}, {
	"gameOver": gameOver,
	"turnsRemaining": turnsRemaining,
  	"victory": isVictory,
  	("puzzleWord": puzzleWord) if (gameOver)
}))
gameStats

fun isGameOver(gameStats = {}) =
(gameStats.victory default false) as Boolean or (gameStats.turnsRemaining default 0) as Number <= 0

fun formatErrorResponse(err, varz) =
using (
theError = (((varz default {}).'__error') default err) default {},
errorType = theError.errorType default {},
errorTypeNamespace = errorType.namespace default "",
errorTypeId = errorType.identifier,
errorQType = if (!isBlank(errorTypeId)) null else (if (!isBlank(errorTypeNamespace)) (errorTypeNamespace ++ ":") else "") ++ (errorTypeId default ""),
errorData = (theError.errorMessage default {}),
errorDataAttrib = errorData.attributes default {},
errorDataPayload = errorData.payload,
errorReasonPhrase = (((errorDataAttrib.reasonPhrase default varz['httpReason']) default errorTypeId) default theError.description) default "UNKNOWN",
detailedErrorReasonPhrase = theError.detailedDescription,
errorStatusCode = (errorDataAttrib.statusCode default varz['httpStatus']),
errorExtraData = errorDataPayload default (theError.cause default {}).info)
{
  "timestamp": now(),
  "status": "error",
  "message": errorReasonPhrase,
  ("detailedMessage": detailedErrorReasonPhrase) if null != detailedErrorReasonPhrase,
  ("code": errorStatusCode) if null != errorStatusCode,
  ("data": (errorExtraData)) if null != errorExtraData
}