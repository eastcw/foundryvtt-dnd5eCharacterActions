export const MODULE_ID = 'character-actions-list-5e';

export const MODULE_ABBREV = 'CAL5E';

export let MySettings = /*#__PURE__*/ (function (MySettings) {
  MySettings['includeConsumables'] = 'include-consumables';
  MySettings['includeOneMinuteSpells'] = 'include-one-minute-spells';
  MySettings['includeSpellsWithEffects'] = 'include-spells-with-effects';
  MySettings['injectCharacters'] = 'inject-characters';
  MySettings['injectNPCs'] = 'inject-npcs';
  MySettings['injectVehicles'] = 'inject-vehicles';
  MySettings['limitActionsToCantrips'] = 'limit-actions-to-cantrips';
  return MySettings;
})({});

export let MyFlags = /*#__PURE__*/ (function (MyFlags) {
  MyFlags['filterOverride'] = 'filter-override';
  return MyFlags;
})({});

export const TEMPLATES = {
  actionList: `modules/${MODULE_ID}/templates/actor-actions-list.hbs`,
};

export const damageTypeIconMap = {
  acid: '<i class="fas fa-hand-holding-water"></i>',
  bludgeoning: '<i class="fas fa-gavel"></i>',
  cold: '<i class="fas fa-snowflake"></i>',
  fire: '<i class="fas fa-fire-alt"></i>',
  force: '<i class="fas fa-hat-wizard"></i>',
  lightning: '<i class="fas fa-bolt"></i>',
  necrotic: '<i class="fas fa-skull"></i>',
  piercing: '<i class="fas fa-thumbtack"></i>',
  poison: '<i class="fas fa-skull-crossbones"></i>',
  psychic: '<i class="fas fa-brain"></i>',
  radiant: '<i class="fas fa-sun"></i>',
  slashing: '<i class="fas fa-cut"></i>',
  thunder: '<i class="fas fa-wind"></i>',
  healing: '<i class="fas fa-heart"></i>',
  temphp: '<i class="fas fa-shield-alt"></i>',
};

export var ItemTypeSortValues = /*#__PURE__*/ (function (ItemTypeSortValues) {
  ItemTypeSortValues[(ItemTypeSortValues['weapon'] = 1)] = 'weapon';
  ItemTypeSortValues[(ItemTypeSortValues['equipment'] = 2)] = 'equipment';
  ItemTypeSortValues[(ItemTypeSortValues['feat'] = 3)] = 'feat';
  ItemTypeSortValues[(ItemTypeSortValues['spell'] = 4)] = 'spell';
  ItemTypeSortValues[(ItemTypeSortValues['consumable'] = 5)] = 'consumable';
  ItemTypeSortValues[(ItemTypeSortValues['tool'] = 6)] = 'tool';
  ItemTypeSortValues[(ItemTypeSortValues['backpack'] = 7)] = 'backpack';
  ItemTypeSortValues[(ItemTypeSortValues['class'] = 8)] = 'class';
  ItemTypeSortValues[(ItemTypeSortValues['loot'] = 9)] = 'loot';
  return ItemTypeSortValues;
})(ItemTypeSortValues || {});
