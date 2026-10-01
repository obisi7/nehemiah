// VerseBuilder.js
// Pure JavaScript logic for the Scripture Tile Snapping mechanic.
// Add this file to the project as an "Include file" / source file dependency
// (Project Manager > right-click project > Show project properties > Additional source files,
// or attach it as a Dependency on a GDevelop Extension) so gdjs.evtTools.verseBuilder.*
// becomes callable from "JavaScript Code" events.

gdjs.evtTools = gdjs.evtTools || {};
gdjs.evtTools.verseBuilder = {};

(function () {
  /**
   * Fisher-Yates shuffle. Does not mutate the input array.
   */
  function shuffleArray(array) {
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = result[i];
      result[i] = result[j];
      result[j] = tmp;
    }
    return result;
  }
  gdjs.evtTools.verseBuilder.shuffleArray = shuffleArray;

  /**
   * Reads a level's phraseTokens from a scene/global structure variable
   * (loaded from data/verses.json into e.g. a "LevelData" JSON variable),
   * tags each token with its correct index, and writes a shuffled tile
   * list into outputVariableName for the Event Sheet to spawn objects from.
   *
   * Expected input variable shape (as a GDevelop structure/array variable):
   * { phraseTokens: [ { tokenId, text, audioTriggerId }, ... ] }
   */
  gdjs.evtTools.verseBuilder.generateLevelTiles = function (
    runtimeScene,
    levelDataVariableName,
    outputVariableName
  ) {
    const variables = runtimeScene.getVariables();
    const levelData = variables.get(levelDataVariableName).toJSObject();
    const tokens = levelData.phraseTokens || [];

    const tiles = tokens.map(function (token, index) {
      return {
        tokenId: token.tokenId,
        text: token.text,
        audioTriggerId: token.audioTriggerId,
        correctIndex: index,
      };
    });

    const shuffled = shuffleArray(tiles);

    const outputVariable = variables.get(outputVariableName);
    outputVariable.fromJSObject(shuffled);
  };

  /**
   * Reads the player's current tile order (an array of tokenIds, built by
   * the Event Sheet from the on-screen drop-bar objects sorted left-to-right)
   * and the level's correct order, compares them, and writes the result to
   * a scene variable. GDevelop event conditions then read that variable each
   * frame -- this is the "custom event signal" since plain JS code actions
   * cannot directly satisfy an event condition.
   *
   * currentOrderVariableName / correctOrderVariableName: array-type scene
   * variables of tokenId strings.
   * resultVariableName: boolean-type scene variable, e.g. "Signal_IsCorrect".
   */
  gdjs.evtTools.verseBuilder.validateSequence = function (
    runtimeScene,
    currentOrderVariableName,
    correctOrderVariableName,
    resultVariableName
  ) {
    const variables = runtimeScene.getVariables();
    const currentOrder = variables.get(currentOrderVariableName).toJSObject();
    const correctOrder = variables.get(correctOrderVariableName).toJSObject();

    let isCorrectSequence =
      Array.isArray(currentOrder) &&
      Array.isArray(correctOrder) &&
      currentOrder.length === correctOrder.length;

    if (isCorrectSequence) {
      for (let i = 0; i < correctOrder.length; i++) {
        if (currentOrder[i] !== correctOrder[i]) {
          isCorrectSequence = false;
          break;
        }
      }
    }

    variables.get(resultVariableName).setBoolean(isCorrectSequence);
    return isCorrectSequence;
  };

  /**
   * Applies a brief, randomized force to every object in tileObjectsName
   * that is still "un-solidified" (i.e. has not been locked to Static).
   * Intended to be called on a repeating Timer from the Event Sheet to
   * drive the Hazard System (wind/distraction).
   */
  gdjs.evtTools.verseBuilder.applyWindGust = function (
    runtimeScene,
    tileObjectsName,
    maxForceX,
    maxForceY
  ) {
    const objects = runtimeScene.getObjects(tileObjectsName);
    for (let i = 0; i < objects.length; i++) {
      const object = objects[i];
      const physics = object.getBehavior("Physics2");
      if (!physics || object.getVariables().get("IsSolid").getAsBoolean()) {
        continue;
      }
      const forceX = (Math.random() * 2 - 1) * maxForceX;
      const forceY = (Math.random() * 2 - 1) * maxForceY;
      physics.applyForce(forceX, forceY, object.getCenterXInScene(), object.getCenterYInScene());
    }
  };
})();
