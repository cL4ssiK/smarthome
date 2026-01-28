import { validateDevices } from './DeviceContext';

describe('validateDevices Unit Tests', () => {
  
  test('returns an empty array if input is not an array', () => {
    expect(validateDevices(null)).toEqual([]);
    expect(validateDevices("broken data")).toEqual([]);
    expect(validateDevices({})).toEqual([]);
  });

  test('filters out devices missing or malformed id, name, functions or active', () => {
    const input = [{  
        name: "thermostate", 
        functions: [{name: "turn on", code: 1, active: "on"},{name: "increase temp", code: 2, active: "off"}],
        active: true
    },
    {  
        id: "device123",
        name: "thermostate", 
        functions: [{name: "turn on", code: 1, active: "on"},{name: "increase temp", code: 2, active: "off"}],
        active: "hello"
    },
    {  
        id: "device1",
        functions: [{name: "turn on", code: 1, active: true},{name: "increase temp", code: 2, active: "off"}],
        active: true
    },
    {  
        id: "device2",
        name: "coffeemaker",
        active: true
    },];

    const result = validateDevices(input);

    expect(result).toHaveLength(0);
  });

  test('returns the same array if all data is valid', () => {
    const input = [{  
        id: "device123",
        name: "thermostate", 
        functions: [{name: "turn on", code: 1, active: "on"},{name: "increase temp", code: 2, active: "off"}],
        active: true
    },
    {  
        id: "device12345",
        name: "coffeemaker", 
        functions: [{name: "turn on", code: 1, active: "on"}],
        active: true
    },];
    expect(validateDevices(input)).toEqual(input);
  });

  test('removes broken functions', () => {
    const input = [{  
        id: "device123",
        name: "thermostate", 
        functions: [{ code: 1, active: "on"},{name: "increase temp", code: 2, active: "off"}],
        active: true
    },
    {  
        id: "device12345",
        name: "coffeemaker", 
        functions: [{name: "turn on", active: "on"}],
        active: true
    },];

    const result = validateDevices(input);

    expect(result[0].functions).toHaveLength(1);
    expect(result[1].functions).toHaveLength(0);
    expect(result[0].functions[0].code).toEqual(2);
  });

  test('Change active code to error if it is wrong', () => {
    const input = [{  
        id: "device123",
        name: "thermostate", 
        functions: [{name: "turn on", code: 1, active: true},{name: "increase temp", code: 2, active: "off"}],
        active: true
    },
    {  
        id: "device12345",
        name: "coffeemaker", 
        functions: [{name: "turn on", code: 1, active: "helloworld"}],
        active: true
    },];

    const result = validateDevices(input);

    expect(result[0].functions[0].active).toEqual('err');
    expect(result[1].functions[0].active).toEqual('err');
  });

});