import { Components } from 'formiojs';
const SelectComponent = Components.components.select;
console.log(Formio.Components.components);

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
      group: 'basic',  // Adjust if you want it in a different section
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

// Register the component globally
Components.addComponent('customDropdown', CustomDropdown);
