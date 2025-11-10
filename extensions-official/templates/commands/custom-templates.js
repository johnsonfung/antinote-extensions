// ===============================
// templates: Custom Template Commands (Generated Dynamically)
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["templates"];
  const extensionRoot = ctx.root;
  const extensionName = "templates";

  // Generate 10 custom template commands dynamically
  for (let i = 1; i <= 10; i++) {
    const cmd = new Command({
      name: `custom_template_${i}`,
      parameters: [],
      type: "insert",
      helpText: `Insert custom template ${i} (user-configurable in preferences)`,
      tutorials: [new TutorialCommand({command: `custom_template_${i}()`, description: `Insert your custom template ${i}`})],
      extension: extensionRoot
    });

    cmd.execute = function(payload) {
      const template = getExtensionPreference(extensionName, `custom_template_${i}`) || "";

      if (!template?.trim()) {
        return new ReturnObject({status: "error", message: `Custom template ${i} is not configured. Please set it in extension preferences.`});
      }

      return new ReturnObject({status: "success", message: `Custom template ${i} inserted`, payload: template});
    };
  }
})();
