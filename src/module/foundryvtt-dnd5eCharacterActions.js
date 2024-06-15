/* eslint-disable no-case-declarations */
import { registerSettings } from './scripts/settings';
import { MODULE_ID, MODULE_ABBREV, MySettings, TEMPLATES } from './scripts/constants';
import { getGame, log } from './scripts/helpers';
import { getActorActionsData, renderActionsList, isItemInActionList } from './scripts/api';
import { addFavoriteControls } from './scripts/handleFavoriteControls';

Handlebars.registerHelper(`${MODULE_ABBREV}-isEmpty`, (input) => {
  if (input instanceof Array) {
    return input.length < 1;
  }
  if (input instanceof Set) {
    return input.size < 1;
  }
  return isObjectEmpty(input);
});
Handlebars.registerHelper(`${MODULE_ABBREV}-isItemInActionList`, isItemInActionList);

/**
 * Add the Actions Tab to Sheet HTML. Returns early if the character-actions-dnd5e element already exists
 */
async function addActionsTab(app, html, data) {
  if (data instanceof Promise) {
    log(true, 'data was unexpectedly a Promise, you might be using an unsupported sheet');
    return;
  }
  const existingActionsList = $(html).find('.character-actions-dnd5e');

  // check if what is rendering this is an Application and if our Actions List exists within it already
  if ((!!app.appId && !!existingActionsList.length) || app.options.blockActionsTab) {
    return;
  }

  if ($(html).closest('.sheet').is('.dnd5e2')) {
    // New 5e 3.0 Character sheets
    // Update the nav menu
    const actionsTabButton = $(
      '<a class="item control" data-group="primary" data-tab="actions" data-tooltip="DND5E.ActionPl" aria-label="DND5E.ActionPl"> \n <i class="fas fa-fist-raised"></i> \n </a>'
    );
    const tabs = html.find('.tabs[data-group="primary"]');
    tabs.prepend(actionsTabButton);

    // Create the tab
    const tabBody = html.find('.tab-body');
    const actionsTab = $(`<div class="tab actions flexcol" data-group="primary" data-tab="actions"></div>`);
    tabBody.prepend(actionsTab);

    // add the list to the tab
    const actionsTabHtml = $(await renderActionsList(app.actor, { sheetVersion: 'actor-actions-list-v2' }));
    actionsTab.append(actionsTabHtml);

    actionsTabHtml.find('.item .item-name.rollable h4').click((event) => app._onItemSummary(event));

    // owner only listeners
    if (data.owner) {
      actionsTabHtml.find('.item .item-image').click((event) => app._onItemUse(event));
      actionsTabHtml.find('.item .item-recharge').click((event) => app._onItemRecharge(event));
    } else {
      actionsTabHtml.find('.rollable').each((i, el) => el.classList.remove('rollable'));
    }
  } else {
    // Update the nav menu
    const actionsTabButton = $(
      '<a class="item" data-tab="actions">' + getGame().i18n.localize(`DND5E.ActionPl`) + '</a>'
    );
    const tabs = html.find('.tabs[data-group="primary"]');
    tabs.prepend(actionsTabButton);

    // Create the tab
    const sheetBody = html.find('.sheet-body');
    const actionsTab = $(`<div class="tab actions flexcol" data-group="primary" data-tab="actions"></div>`);
    sheetBody.prepend(actionsTab);

    // add the list to the tab
    const actionsTabHtml = $(await renderActionsList(app.actor));
    actionsTab.append(actionsTabHtml);

    actionsTabHtml.find('.item .item-name.rollable h4').click((event) => app._onItemSummary(event));

    // owner only listeners
    if (data.owner) {
      actionsTabHtml.find('.item .item-image').click((event) => app._onItemUse(event));
      actionsTabHtml.find('.item .item-recharge').click((event) => app._onItemRecharge(event));
    } else {
      actionsTabHtml.find('.rollable').each((i, el) => el.classList.remove('rollable'));
    }
  }
}

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
  log(true, `Initializing ${MODULE_ID}`);

  // Register custom module settings
  registerSettings();

  // Preload Handlebars templates
  await loadTemplates(Object.values(foundry.utils.flattenObject(TEMPLATES)));
  const characterActionsModuleData = getGame().modules.get(MODULE_ID);
  if (characterActionsModuleData) {
    characterActionsModuleData.api = {
      getActorActionsData,
      isItemInActionList,
      renderActionsList,
    };
  }
  // eslint-disable-next-line no-undef
  globalThis[MODULE_ABBREV] = {
    renderActionsList: async function (...args) {
      log(false, {
        api: characterActionsModuleData?.api,
      });
      console.warn(
        MODULE_ID,
        '|',
        'accessing the module api on globalThis is deprecated and will be removed in a future update, check if there is an update to your sheet module'
      );
      return characterActionsModuleData?.api?.renderActionsList(...args);
    },
    isItemInActionList: function (...args) {
      console.warn(
        MODULE_ID,
        '|',
        'accessing the module api on globalThis is deprecated and will be removed in a future update, check if there is an update to your sheet module'
      );
      return characterActionsModuleData?.api?.isItemInActionList(...args);
    },
  };
  Hooks.call(`CharacterActions5eReady`, characterActionsModuleData?.api);
});

// default sheet injection if this hasn't yet been injected
Hooks.on('renderActorSheet5e', async (app, html, data) => {
  // short circut if the user has overwritten these settings
  switch (app.actor.type) {
    case 'npc':
      const injectNPCSheet = getGame().settings.get(MODULE_ID, MySettings.injectNPCs);
      if (!injectNPCSheet) return;
    //falls through
    case 'vehicle':
      const injectVehicleSheet = getGame().settings.get(MODULE_ID, MySettings.injectVehicles);
      if (!injectVehicleSheet) return;
    //falls through
    case 'character':
      const injectCharacterSheet = getGame().settings.get(MODULE_ID, MySettings.injectCharacters);
      if (!injectCharacterSheet) return;
  }
  log(false, 'default sheet open hook firing', {
    app,
    html,
    data,
  });
  const actionsList = $(html).find('.character-actions-dnd5e');
  log(false, 'actionsListExists', {
    actionsListExists: actionsList.length,
  });
  if (!actionsList.length) {
    await addActionsTab(app, html, data);
  }
  addFavoriteControls(app, html);
});
Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(MODULE_ID);
});
