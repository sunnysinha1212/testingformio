// Ensure Formio is available globally
console.log("Registering Custom Components...");
console.log("Available Components: ", window.Formio.Components.components);

// -----------------------------------------
// ✅ Custom Dropdown Component
// ----------------------------------------

const SelectComponent = window.Formio.Components.components.select;

class CustomDropdown extends SelectComponent {
  static schema(...extend) {
    return SelectComponent.schema({
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

const FieldComponent = window.Formio.Components.components.field;

class AcceptableToggle extends FieldComponent {
  static schema(...extend) {
    return FieldComponent.schema({
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
    
    // Find the checkbox input
    const input = element.querySelector('input[type="checkbox"]');
    if (!input) return;

    // Add event listener for toggle change
    input.addEventListener('change', (event) => this.handleToggle(event));
  }

  handleToggle(event) {
    const isChecked = event.target.checked;
    console.log(`Toggle is now: ${isChecked ? 'ON' : 'OFF'}`);

    // Get the container element
    const container = this.root.element;
    if (!container) return;

    // Find all radio components inside the form
    const radioComponents = this.root.components.filter(comp => comp.type === 'radio');

    radioComponents.forEach(radio => {
      const acceptableOption = radio.component.values.find(option => 
        option.label.toLowerCase() === 'acceptable' || option.value.toLowerCase() === 'acceptable'
      );

      if (acceptableOption) {
        radio.setValue(isChecked ? acceptableOption.value : ''); // Select "Acceptable" or reset
        console.log(`Setting "${radio.component.label}" to "Acceptable"`);
      }
    });
  }
}

// ----------------------------------------
// ✅ Register Components in Form.io
// ----------------------------------------

window.Formio.Components.addComponent('customDropdown', CustomDropdown);
window.Formio.Components.addComponent('acceptableToggle', AcceptableToggle);

console.log("Custom Components Registered Successfully!");
