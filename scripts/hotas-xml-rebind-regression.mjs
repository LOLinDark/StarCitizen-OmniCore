import { upsertDeviceRebind } from '../server/peripherals/hotas/xmlRebind.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function countOccurrences(source, token) {
  return (source.match(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
}

const sampleXml = `<ActionMaps>
  <actionmap name="map_one">
    <action name="v_toggle_salvage_mode">
      <rebind input="js1_button1"/>
    </action>
  </actionmap>
  <actionmap name="map_two">
    <action name="v_toggle_salvage_mode">
      <rebind input="kb1_s"/>
    </action>
  </actionmap>
  <actionmap name="map_three">
    <action name="v_toggle_salvage_mode">
      <activationMode mode="toggle"/>
    </action>
  </actionmap>
</ActionMaps>`;

const updated = upsertDeviceRebind(sampleXml, 'v_toggle_salvage_mode', 'js1_button14');
assert(updated.found, 'Expected action to be found in XML');
assert(updated.updated, 'Expected XML update to be reported');
assert(countOccurrences(updated.xml, 'js1_button14') === 3, 'Expected all matching action blocks to update');
assert(!updated.xml.includes('js1_button1"/>'), 'Expected old joystick rebind to be replaced');

const noMatch = upsertDeviceRebind(sampleXml, 'v_non_existent_action', 'js1_button9');
assert(!noMatch.found, 'Expected non-existent action to report not found');
assert(!noMatch.updated, 'Expected non-existent action to report not updated');

const invalidToken = upsertDeviceRebind(sampleXml, 'v_toggle_salvage_mode', 'invalid_token');
assert(!invalidToken.found, 'Expected invalid token to fail early');
assert(!invalidToken.updated, 'Expected invalid token to fail early');

console.log('HOTAS XML rebind regression checks passed.');
