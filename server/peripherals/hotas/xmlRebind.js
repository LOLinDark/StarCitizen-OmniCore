function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function upsertDeviceRebind(xml, actionName, inputToken) {
  const actionPattern = new RegExp(
    `(<action\\s+name="${escapeRegExp(actionName)}"\\s*>)([\\s\\S]*?)(</action>)`,
    'ig'
  );

  let deviceRebindPattern;
  if (/^js\d+_/i.test(inputToken)) {
    deviceRebindPattern = /<rebind\s+input="js\d+_[^"]*"\s*\/>/i;
  } else if (/^kb\d+_/i.test(inputToken)) {
    deviceRebindPattern = /<rebind\s+input="kb\d+_[^"]*"\s*\/>/i;
  } else if (/^mouse\d+/i.test(inputToken)) {
    deviceRebindPattern = /<rebind\s+input="mouse\d+[^"]*"\s*\/>/i;
  } else {
    return { xml, updated: false, found: false };
  }

  let matchCount = 0;
  const updatedXml = xml.replace(actionPattern, (full, openTag, actionBody, closeTag) => {
    matchCount += 1;

    if (deviceRebindPattern.test(actionBody)) {
      const replacedBody = actionBody.replace(deviceRebindPattern, `<rebind input="${inputToken}"/>`);
      return `${openTag}${replacedBody}${closeTag}`;
    }

    // Preserve existing action content and append device-specific rebind.
    const separator = actionBody.endsWith('\n') ? '' : '\n';
    const appendedBody = `${actionBody}${separator}   <rebind input="${inputToken}"/>\n`;
    return `${openTag}${appendedBody}${closeTag}`;
  });

  if (matchCount === 0) {
    return { xml, updated: false, found: false };
  }

  return { xml: updatedXml, updated: true, found: true };
}
