console.log("Registering Custom Dropdown Component...");

Formio.Components.addComponent('customDropdown', {
  schema: {
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
  },

  builderInfo: {
    title: 'Dynamic API Select',
    group: 'custom',
    icon: 'list',
    weight: 70,
    documentation: '',
    schema: {}
  },

  attach: function(element) {
    console.log("Custom Dropdown Component Attached");
    this.loadOptions();
  },

  loadOptions: async function() {
    if (!this.component.apiConfig || !this.component.apiConfig.url) {
      console.error('API URL is missing');
      return;
    }

    let apiUrl = this.component.apiConfig.url;
    const queryParams = this.component.apiConfig.queryParams || {};
    const urlParams = new URLSearchParams(queryParams).toString();
    if (urlParams) {
      apiUrl += `?${urlParams}`;
    }

    try {
      const response = await fetch(apiUrl, {
        method: this.component.apiConfig.method || 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          ...this.component.apiConfig.headers
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
});

console.log("Custom Dropdown Component Registered Successfully!");
