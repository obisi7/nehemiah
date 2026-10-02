// scripts/autobuilder.js
// Runtime scene construction for a level, using only the GDevelop runtime
// (gdjs) API. Add this file as an "Additional source file" in Project
// Properties, then call it from an "At the beginning of the scene"
// JavaScript Code event, e.g.: gdjs.AutoBuilder.setupLevel(runtimeScene, 1);
//
// Requires: the "scriptures.json" resource (data/scriptures.json) and the
// WallFoundation, StoneBlock, and VerseTile objects to already exist in the
// project.

gdjs.AutoBuilder = gdjs.AutoBuilder || {};

gdjs.AutoBuilder.setupLevel = function (runtimeScene, levelNumber) {
  const scriptures = runtimeScene
    .getGame()
    .getJsonManager()
    .getLoadedJson("scriptures.json");

  if (!scriptures || !Array.isArray(scriptures.levels)) {
    console.warn("AutoBuilder: scriptures.json is not loaded yet.");
    return;
  }

  const levelData = scriptures.levels.find(function (level) {
    return level.levelId === levelNumber;
  });

  if (!levelData) {
    console.warn("AutoBuilder: no level data found for level " + levelNumber);
    return;
  }

  // 1. Foundation
  const foundation = runtimeScene.createObject("WallFoundation");
  if (foundation) {
    foundation.setX(0);
    foundation.setY(520);
    foundation.setWidth(800);
    foundation.setHeight(80);
  }

  // 2. Stone blocks, stacked vertically above the foundation.
  const stoneBlockPositions = [
    { x: 360, y: 400 },
    { x: 360, y: 330 },
    { x: 360, y: 260 },
  ];
  stoneBlockPositions.forEach(function (position) {
    const stoneBlock = runtimeScene.createObject("StoneBlock");
    if (stoneBlock) {
      stoneBlock.setX(position.x);
      stoneBlock.setY(position.y);
    }
  });

  // 3-4. Verse tiles along the bottom UI row, populated from this level's
  // phrase tokens.
  const tileSlots = [
    { x: 80, y: 550 },
    { x: 320, y: 550 },
    { x: 560, y: 550 },
  ];
  const tokens = levelData.phraseTokens || [];

  tileSlots.forEach(function (slot, index) {
    const token = tokens[index];
    if (!token) {
      return;
    }

    const verseTile = runtimeScene.createObject("VerseTile");
    if (!verseTile) {
      return;
    }

    verseTile.setX(slot.x);
    verseTile.setY(slot.y);
    verseTile.setString(token.text);
    verseTile.getVariables().get("TileID").setNumber(index + 1);
  });
};
