import { getActivationType, getGame, log, isActiveItem } from './helpers';
import { MODULE_ID, MyFlags, MySettings } from './constants';

const damageTypeIconMap = {
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

var ItemTypeSortValues = /*#__PURE__*/ (function (ItemTypeSortValues) {
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

export function getActorActionsData(actor) {
  const filteredItems = actor.items
    .filter(isItemInActionList)
    .sort((a, b) => {
      if (a.type !== b.type) {
        return ItemTypeSortValues[a.type] - ItemTypeSortValues[b.type];
      }
      if (a.type === 'spell' && b.type === 'spell') {
        return a.system.level - b.system.level;
      }
      return (a.sort || 0) - (b.sort || 0);
    })
    .map((item) => {
      if (item.labels) {
        item.labels.type = getGame().i18n.localize(`ITEM.Type${item.type.titleCase()}`);
      }

      // removes any in-formula flavor text from the formula in the label
      if (item.labels?.derivedDamage?.length) {
        item.labels.derivedDamage = item.labels.derivedDamage.map(({ formula, ...rest }) => ({
          formula: formula?.replace(/\[.+?\]/, '') || '0',
          ...rest,
        }));
      }
      return item;
    });
  const actionsData = filteredItems.reduce(
    (acc, item) => {
      try {
        log(false, 'digesting item', {
          item,
        });
        if (['backpack', 'tool'].includes(item.type)) {
          return acc;
        }

        const activationType = getActivationType(item.system.activation?.type);
        acc[activationType].add(item);
        return acc;
      } catch (e) {
        log(true, 'error trying to digest item', item.name, e);
        return acc;
      }
    },
    {
      action: new Set(),
      bonus: new Set(),
      crew: new Set(),
      lair: new Set(),
      legendary: new Set(),
      reaction: new Set(),
      other: new Set(),
    }
  );
  return actionsData;
}

export function isItemInActionList(item) {
  // log(false, 'filtering item', {
  //   item,
  // });

  // check our override
  const override = item.getFlag(MODULE_ID, MyFlags.filterOverride);
  if (override !== undefined) {
    return override;
  }

  // check the old flags
  const isFavourite = item.flags?.favtab?.isFavourite; // favourite items tab
  const isFavorite = item.flags?.favtab?.isFavorite; // tidy 5e sheet

  if (isFavourite || isFavorite) {
    return true;
  }

  // perform normal filtering logic
  switch (item.type) {
    case 'weapon': {
      return item.system.equipped;
    }
    case 'equipment': {
      return item.system.equipped && isActiveItem(item.system.activation?.type);
    }
    case 'consumable': {
      return (
        !!getGame().settings.get(MODULE_ID, MySettings.includeConsumables) && isActiveItem(item.system.activation?.type)
      );
    }
    case 'spell': {
      const limitToCantrips = getGame().settings.get(MODULE_ID, MySettings.limitActionsToCantrips);

      // only exclude spells which need to be prepared but aren't
      const notPrepared = item.system.preparation?.mode === 'prepared' && !item.system.preparation?.prepared;
      const isCantrip = item.system.level === 0;
      if (!isCantrip && (limitToCantrips || notPrepared)) {
        return false;
      }
      const isReaction = item.system.activation?.type === 'reaction';
      const isBonusAction = item.system.activation?.type === 'bonus';

      //ASSUMPTION: If the spell causes damage, it will have damageParts
      const isDamageDealer = item.system.damage?.parts?.length > 0;
      let shouldInclude = isReaction || isBonusAction || isDamageDealer;
      if (getGame().settings.get(MODULE_ID, MySettings.includeOneMinuteSpells)) {
        const isOneMinuter = item.system?.duration?.units === 'minute' && item.system?.duration?.value === 1;
        const isOneRounder = item.system?.duration?.units === 'round' && item.system?.duration?.value === 1;
        shouldInclude = shouldInclude || isOneMinuter || isOneRounder;
      }
      if (getGame().settings.get(MODULE_ID, MySettings.includeSpellsWithEffects)) {
        const hasEffects = !!item.effects.size;
        shouldInclude = shouldInclude || hasEffects;
      }
      return shouldInclude;
    }
    case 'feat': {
      return !!item.system.activation?.type;
    }
    default: {
      return false;
    }
  }
}

/**
 * Renders the html of the actions list for the provided actor data
 */
export function renderActionsList(actorData, options) {
  const actionData = getActorActionsData(actorData);
  log(false, 'renderActionsList', {
    actorData,
    data: actionData,
  });
  return renderTemplate(`modules/${MODULE_ID}/templates/actor-actions-list.hbs`, {
    actionData,
    abilities: getGame().dnd5e.config.abilityAbbreviations,
    activationTypes: {
      ...getGame().dnd5e.config.abilityActivationTypes,
      other: getGame().i18n.localize(`DND5E.ActionOther`),
    },
    damageTypes: {
      ...getGame().dnd5e.config.damageTypes,
      ...getGame().dnd5e.config.healingTypes,
    },
    damageTypeIconMap,
    rollIcon: options?.rollIcon,
    isOwner: actorData.isOwner,
  });
}
