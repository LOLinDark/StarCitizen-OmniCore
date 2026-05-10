import { useMemo, useState } from 'react';
import { Badge, Group, Select, SegmentedControl, Text } from '@mantine/core';
import { X52_BUTTONS, X52_AXES, X52_MODES, X52_POV_DIRECTIONS } from '../libraries/hotas';

function buildInputList(modes) {
  const inputs = [];
  const modeList = modes.includes('all')
    ? Object.entries(X52_MODES)
    : modes.map((m) => [m, X52_MODES[m]]).filter(([, v]) => v);

  for (const [modeIdx, mode] of modeList) {
    for (const [idx, meta] of Object.entries(X52_BUTTONS)) {
      inputs.push({
        id: `m${modeIdx}-btn-${idx}`,
        mode, modeIdx: Number(modeIdx),
        type: 'Button', index: Number(idx),
        name: meta.name, group: meta.group,
        xmlToken: `js1_button${meta.windowsIndex ?? Number(idx) + 1}`,
      });
    }
    for (const [idx, meta] of Object.entries(X52_AXES)) {
      if (meta.type === 'hat') continue;
      inputs.push({
        id: `m${modeIdx}-axis-${idx}`,
        mode, modeIdx: Number(modeIdx),
        type: 'Axis', index: Number(idx),
        name: meta.name, group: meta.group,
        xmlToken: `js1_axis${idx}`,
      });
    }
    for (const dir of X52_POV_DIRECTIONS) {
      inputs.push({
        id: `m${modeIdx}-pov-${dir.dir}`,
        mode, modeIdx: Number(modeIdx),
        type: 'POV', index: dir.dir,
        name: `POV ${dir.label}`, group: 'POV HAT',
        xmlToken: `js1_pov_${dir.dir}`,
      });
    }
  }
  return inputs;
}

function findAssignedFeature(input, bindings, hotasOverrides) {
  if (!bindings?.length) return null;
  const token = input.xmlToken.toLowerCase();
  const buttonNum = input.type === 'Button' ? (X52_BUTTONS[input.index]?.windowsIndex ?? input.index + 1) : null;

  for (const binding of bindings) {
    const hotasVal = (hotasOverrides[binding.id] || binding.hotasBinding || '').toLowerCase();
    if (!hotasVal) continue;
    if (hotasVal === token) return binding;
    if (input.type === 'Button' && buttonNum !== null) {
      if (hotasVal === `button ${buttonNum}`) return binding;
      if (hotasVal.includes(`button ${buttonNum}`) && !hotasVal.includes(`button ${buttonNum}0`)) return binding;
    }
    if (input.type === 'Axis') {
      const axisName = (X52_AXES[input.index]?.name || '').toLowerCase();
      if (axisName && hotasVal.includes(axisName.split('(')[0].trim())) return binding;
    }
    if (input.type === 'POV') {
      if (hotasVal.includes('hat') && hotasVal.includes(input.index)) return binding;
      if (hotasVal.includes('pov') && hotasVal.includes(input.index)) return binding;
    }
  }
  return null;
}

function readAxisValue(axisValues, axisIndex) {
  if (Array.isArray(axisValues)) return Number(axisValues[axisIndex]);
  if (axisValues && typeof axisValues === 'object') return Number(axisValues[axisIndex]);
  return NaN;
}

function isInputActive(input, activeInputs, axisValues, lastHotasInput) {
  if (!input) return false;

  if (input.type === 'Button') {
    const effectiveIndex = input.index;

    if (activeInputs?.has?.(`button-${effectiveIndex}`)) return true;
    if (Number.isInteger(lastHotasInput?.index) && lastHotasInput.index === effectiveIndex) return true;
    const displayIndex = X52_BUTTONS[effectiveIndex]?.windowsIndex ?? effectiveIndex + 1;
    if (Number.isInteger(lastHotasInput?.displayIndex) && lastHotasInput.displayIndex === displayIndex) return true;
    return false;
  }

  if (input.type === 'Axis') {
    const axisValue = readAxisValue(axisValues, input.index);
    if (Number.isFinite(axisValue) && Math.abs(axisValue) >= 0.12) return true;
    if (Number.isInteger(lastHotasInput?.index) && lastHotasInput.index === input.index) {
      const liveValue = Number(lastHotasInput?.value);
      return Number.isFinite(liveValue) && Math.abs(liveValue) >= 0.12;
    }
    return false;
  }

  if (input.type === 'POV' && typeof lastHotasInput?.index === 'string') {
    return lastHotasInput.index.includes(`hat-${input.index}`);
  }

  return false;
}

const MODE_COLORS = Object.fromEntries(
  Object.entries(X52_MODES).map(([modeIdx, mode]) => [modeIdx, mode.color])
);

const MODE_SEGMENTS = [
  { value: 'none', label: 'No Modes' },
  ...Object.entries(X52_MODES).map(([modeIdx, mode]) => ({
    value: String(modeIdx),
    label: `${mode.indicator} ${mode.name.replace(/ Mode$/, '')}`,
  })),
  { value: 'all', label: 'All Modes' },
];

export default function HOTASInputView({ bindings, hotasOverrides, bindingFilter, deviceFilter, searchQuery, onAssign, activeInputs, axisValues, lastHotasInput }) {
  const [modeFilter, setModeFilter] = useState('none');
  const [editingRowId, setEditingRowId] = useState(null);

  const visibleModes = useMemo(() => {
    if (modeFilter === 'none') return ['0'];
    if (modeFilter === 'all') return ['all'];
    return [modeFilter];
  }, [modeFilter]);

  const inputList = useMemo(() => buildInputList(visibleModes), [visibleModes]);

  const rows = useMemo(() => {
    return inputList.map((input) => ({
      ...input,
      assignedBinding: findAssignedFeature(input, bindings, hotasOverrides),
      isActive: isInputActive(input, activeInputs, axisValues, lastHotasInput),
    }));
  }, [inputList, bindings, hotasOverrides, activeInputs, axisValues, lastHotasInput]);

  const filteredRows = useMemo(() => {
    let result = rows;

    // Profile-based filtering (ignores game defaults)
    if (bindingFilter === 'hotas-assigned' || deviceFilter === 'hotas-assigned') {
      result = result.filter((r) => r.assignedBinding);
    } else if (bindingFilter === 'hotas-empty' || deviceFilter === 'hotas-empty') {
      result = result.filter((r) => !r.assignedBinding);
    } else if (bindingFilter === 'fully-unbound' || deviceFilter === 'fully-unbound') {
      result = result.filter((r) => !r.assignedBinding);
    }
    // kb-assigned and kb-empty don't apply to the HOTAS input view

    // Search
    if (searchQuery?.trim()) {
      const term = searchQuery.toLowerCase();
      result = result.filter((r) =>
        r.name.toLowerCase().includes(term) ||
        r.group.toLowerCase().includes(term) ||
        (r.assignedBinding?.feature || '').toLowerCase().includes(term)
      );
    }
    return result;
  }, [rows, bindingFilter, deviceFilter, searchQuery]);

  // Build feature options for the Select dropdown
  const featureOptions = useMemo(() => {
    if (!bindings?.length) return [];
    const seen = new Set();
    return bindings
      .filter((b) => {
        if (seen.has(b.id)) return false;
        seen.add(b.id);
        return true;
      })
      .map((b) => ({
        value: b.id,
        label: `${b.feature}${b.category ? ` (${b.category})` : ''}`,
      }));
  }, [bindings]);

  function handleFeatureSelect(row, bindingId) {
    setEditingRowId(null);
    if (!bindingId || !onAssign) return;
    onAssign(bindingId, row.xmlToken);
  }

  const boundCount = filteredRows.filter((r) => r.assignedBinding).length;

  return (
    <>
      <Group gap="md" mb="md" align="center">
        <Text size="sm" fw={600}>Modes:</Text>
        <SegmentedControl
          value={modeFilter}
          onChange={setModeFilter}
          data={MODE_SEGMENTS}
          size="xs"
        />
        <Badge color="cyan" variant="light" size="sm">
          {boundCount}/{filteredRows.length} assigned
        </Badge>
      </Group>

      <div
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(0, 217, 255, 0.15)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: 'rgba(0, 217, 255, 0.08)', borderBottom: '1px solid rgba(0, 217, 255, 0.2)' }}>
              {modeFilter !== 'none' && <th style={thStyle}>Mode</th>}
              <th style={thStyle}>Input</th>
              <th style={thStyle}>Group</th>
              <th style={thStyle}>Type</th>
              <th style={{ ...thStyle, textAlign: 'left' }}>Assigned Feature</th>
              <th style={thStyle}>Category</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={modeFilter !== 'none' ? 6 : 5} style={{ padding: '2rem', textAlign: 'center', color: '#3a5060' }}>
                  No inputs match your filters
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: row.assignedBinding ? 'rgba(34, 209, 123, 0.04)' : 'transparent',
                  }}
                >
                  {modeFilter !== 'none' && (
                    <td style={tdStyle}>
                      <Badge size="xs" color={MODE_COLORS[row.modeIdx]} variant="filled">
                        {row.mode.indicator}
                      </Badge>
                    </td>
                  )}
                  <td style={{ ...tdStyle, color: row.isActive ? '#ff9500' : '#e0eaf4', fontWeight: 600 }}>{row.name}</td>
                  <td style={{ ...tdStyle, color: '#6a8898' }}>{row.group}</td>
                  <td style={tdStyle}>
                    <Badge size="xs" variant="light" color={row.type === 'Button' ? 'cyan' : row.type === 'Axis' ? 'orange' : 'green'}>
                      {row.type}
                    </Badge>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'left', minWidth: 260 }}>
                    {editingRowId === row.id ? (
                      <Select
                        data={featureOptions}
                        placeholder="Search features..."
                        searchable
                        clearable
                        size="xs"
                        autoFocus
                        value={row.assignedBinding?.id || null}
                        onChange={(val) => handleFeatureSelect(row, val)}
                        onBlur={() => setEditingRowId(null)}
                        styles={{ input: { background: 'rgba(0,0,0,0.6)', borderColor: 'rgba(0,217,255,0.3)', color: '#e0eaf4' } }}
                        maxDropdownHeight={200}
                      />
                    ) : (
                      <div
                        onClick={() => setEditingRowId(row.id)}
                        style={{ cursor: 'pointer', padding: '2px 4px', borderRadius: 4, transition: 'background 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,217,255,0.08)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        {row.assignedBinding ? (
                          <Text size="sm" fw={500} style={{ color: '#81c784' }}>
                            {row.assignedBinding.feature}
                          </Text>
                        ) : (
                          <Text size="sm" style={{ color: '#555', fontStyle: 'italic' }}>Click to assign Star Citizen feature...</Text>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ ...tdStyle, color: '#6a8898' }}>
                    {row.assignedBinding?.category || ''}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

const thStyle = {
  padding: '10px 14px',
  textAlign: 'left',
  color: '#6a8898',
  fontWeight: 700,
  letterSpacing: '0.07em',
  fontSize: '0.7rem',
  whiteSpace: 'nowrap',
  textTransform: 'uppercase',
};

const tdStyle = {
  padding: '8px 14px',
  whiteSpace: 'nowrap',
};
