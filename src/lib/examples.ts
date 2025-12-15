export const EXAMPLES: Record<string, string> = {
  "Simple XML": `<?xml version="1.0" encoding="UTF-8"?>
<recipe>
  <title>Chocolate Mug Cake</title>
  <ingredients>
    <item>4 tbsp flour</item>
    <item>2 tbsp cocoa</item>
    <item>3 tbsp milk</item>
  </ingredients>
  <steps>
    <step>Mix dry ingredients.</step>
    <step>Add milk and stir until smooth.</step>
    <step>Microwave 60–90 seconds.</step>
  </steps>
</recipe>`,

  "DITA-ish topic": `<?xml version="1.0" encoding="UTF-8"?>
<topic id="install_app">
  <title>Install the app</title>
  <shortdesc>Learn how to install the app on your device.</shortdesc>
  <body>
    <section>
      <title>Before you begin</title>
      <ul>
        <li>Make sure you have an internet connection.</li>
        <li>Have your account email ready.</li>
      </ul>
    </section>

    <section>
      <title>Steps</title>
      <steps>
        <step>
          <cmd>Open the App Store.</cmd>
          <info>If you are on Android, open Google Play.</info>
        </step>
        <step>
          <cmd>Search for <codeblock>Acme App</codeblock>.</cmd>
        </step>
        <step>
          <cmd>Select <xref href="acme_app_download">Download</xref>.</cmd>
        </step>
      </steps>
    </section>

    <note type="warning">Do not install unofficial versions.</note>
  </body>
</topic>`
};
