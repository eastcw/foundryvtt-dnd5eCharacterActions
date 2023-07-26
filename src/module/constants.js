export const MODULE_ID = 'character-actions-list-5e';
export const MODULE_ABBREV = 'CAL5E';
export let MySettings = /*#__PURE__*/function (MySettings) {
  MySettings["includeConsumables"] = "include-consumables";
  MySettings["includeOneMinuteSpells"] = "include-one-minute-spells";
  MySettings["includeSpellsWithEffects"] = "include-spells-with-effects";
  MySettings["injectCharacters"] = "inject-characters";
  MySettings["injectNPCs"] = "inject-npcs";
  MySettings["injectVehicles"] = "inject-vehicles";
  MySettings["limitActionsToCantrips"] = "limit-actions-to-cantrips";
  return MySettings;
}({});
export let MyFlags = /*#__PURE__*/function (MyFlags) {
  MyFlags["filterOverride"] = "filter-override";
  return MyFlags;
}({});
export const TEMPLATES = {
  actionList: `modules/${MODULE_ID}/templates/actor-actions-list.hbs`
};