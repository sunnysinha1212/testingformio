// Ensure Formio is available globally
console.log("Registering Custom Components...");
console.log("Available Components: ", window.Formio.Components.components);

// ----------------------------------------
// ✅ Get Form.io Component References (Declared Only If Not Already Defined)
// ----------------------------------------
if (typeof window.SelectComponent === "undefined") {
  window.SelectComponent = window.Formio.Components.components.select;
}

if (typeof window.FieldComponent === "undefined") {
  window.FieldComponent = window.Formio.Components.components.field;
}

// ----------------------------------------
// ✅ Custom Dropdown Component
// ----------------------------------------

class CustomDropdown extends window.SelectComponent {
  static schema(...extend) {
    return window.SelectComponent.schema({
      type: 'customDropdown',
      label: 'Dynamic API Select',
      key: 'customDropdown',
      dataSrc: 'custom',
      apiConfig: {
        url: '',
        method: 'GET',
        headers: {},
        queryParams: {}
      }
    });
  }

  static get builderInfo() {
    return {
      title: 'Dynamic API Select',
      group: 'basic',
      icon: 'list',
      weight: 70,
      documentation: 'https://help.form.io/developers/form-development/custom-components',
      schema: CustomDropdown.schema()
    };
  }

  constructor(component, options, data) {
    super(component, options, data);
    this.apiConfig = component.apiConfig || {};
  }

  async attach(element) {
    await super.attach(element);
    this.loadOptions();
  }

  async loadOptions() {
    if (!this.apiConfig.url) {
      console.error('API URL is missing');
      return;
    }

    let apiUrl = this.apiConfig.url;
    const queryParams = this.apiConfig.queryParams || {};
    const urlParams = new URLSearchParams(queryParams).toString();
    if (urlParams) {
      apiUrl += `?${urlParams}`;
    }

    try {
      const response = await fetch(apiUrl, {
        method: this.apiConfig.method || 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          ...this.apiConfig.headers
        }
      });

      const data = await response.json();
      console.log("API Response: ", data);

      if (data && data.options) {
        this.component.data.values = data.options.map(item => ({
          label: item.name,
          value: item.id
        }));
        this.redraw();
      }
    } catch (error) {
      console.error('Error loading dropdown options:', error);
    }
  }
}

// ----------------------------------------
// ✅ Acceptable Toggle Component
// ----------------------------------------

class AcceptableToggle extends window.FieldComponent {
  static schema(...extend) {
    return window.FieldComponent.schema({
      type: 'acceptableToggle',
      label: 'Acceptable Toggle',
      key: 'acceptableToggle',
      inputType: 'checkbox',
      input: true
    });
  }

  static get builderInfo() {
    return {
      title: 'Acceptable Toggle',
      group: 'basic',
      icon: 'toggle-on',
      weight: 80,
      documentation: 'https://help.form.io/developers/form-development/custom-components',
      schema: AcceptableToggle.schema()
    };
  }

  constructor(component, options, data) {
    super(component, options, data);
  }

  async attach(element) {
    await super.attach(element);

    // ✅ Create a checkbox input dynamically
    const container = document.createElement('div');
    container.classList.add('custom-toggle-container');

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.classList.add('custom-toggle-input');
    input.checked = this.dataValue || false;

    const label = document.createElement('label');
    label.classList.add('custom-toggle-label');
    label.innerText = " Acceptable Toggle";

    container.appendChild(input);
    container.appendChild(label);
    element.appendChild(container);

    // ✅ Add event listener for toggle change
    input.addEventListener('change', (event) => this.handleToggle(event));
  }

  handleToggle(event) {
    const isChecked = event.target.checked;
    console.log(`Toggle is now: ${isChecked ? 'ON' : 'OFF'}`);

    // ✅ Get all radio components in the form
    const radioComponents = this.root.components.filter(comp => comp.type === 'radio');

    radioComponents.forEach(radio => {
      const acceptableOption = radio.component.values.find(option => 
        option.label.toLowerCase() === 'acceptable' || option.value.toLowerCase() === 'acceptable'
      );

      if (acceptableOption) {
        console.log(`Setting "${radio.component.label}" to "Acceptable"`);

        // ✅ Use Form.io API to update the value properly
        this.root.setValue({ [radio.component.key]: isChecked ? acceptableOption.value : '' });

        // ✅ Manually trigger UI update
        radio.redraw();
      }
    });
  }
}

// ----------------------------------------
// ✅ Register Components in Form.io (Avoid Duplicate Declarations)
// ----------------------------------------

if (!window.Formio.Components.components.customDropdown) {
  window.Formio.Components.addComponent('customDropdown', CustomDropdown);
}

if (!window.Formio.Components.components.acceptableToggle) {
  window.Formio.Components.addComponent('acceptableToggle', AcceptableToggle);
}

console.log("Custom Components Registered Successfully!");
