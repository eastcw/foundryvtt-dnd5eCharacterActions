import { getActivationType, getGame, isItemInActionList, log } from './helpers.mjs';

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
        //@ts-expect-error
        item.labels.type = getGame().i18n.localize(`ITEM.Type${item.type.titleCase()}`);
      }

      // removes any in-formula flavor text from the formula in the label
      //@ts-expect-error
      if (item.labels?.derivedDamage?.length) {
        //@ts-expect-error
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

        //@ts-ignore
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
    },
  );

  return actionsData;
}
