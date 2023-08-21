import { getActivationType, getGame, log, isActiveItem } from './helpers';
import { MODULE_ID, MyFlags, MySettings, damageTypeIconMap, ItemTypeSortValues } from './constants';

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
    abilities: getGame().dnd5e.config.abilities.label,
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
