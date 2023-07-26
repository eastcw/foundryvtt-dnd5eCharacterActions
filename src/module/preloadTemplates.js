export async function preloadTemplates() {
  const templatePaths = [
    // Add paths to "modules/foundryvtt-dnd5eCharacterActions/templates"
  ];
  return loadTemplates(templatePaths);
}