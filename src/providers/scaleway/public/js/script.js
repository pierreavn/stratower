class ResourceTypeRenderer {
    init(params) {
      this.eGui = document.createElement('div');
  
      if (!params.value) {
        this.eGui.innerHTML = params.isFilterRenderer ? '(Blanks)' : '';
      } else if (params.value === '(Select All)') {
        this.eGui.innerHTML = params.value;
      } else {
        const url = `provider-public/scaleway/img/resources/${params.value.toLowerCase()}.svg`;
        const resourceImage = `<img class="resource" src="${url}" alt="${params.value}" width="28">`;

        this.eGui.innerHTML = `${resourceImage}&nbsp;&nbsp;&nbsp;${params.value}`;
      }
    }
  
    getGui() {
      return this.eGui;
    }
  
    refresh() {
      return false;
    }
}

class ResourceNameRenderer {
    init(params) {
      this.eGui = document.createElement('div');
  
      if (!params.value) {
        this.eGui.innerHTML = params.isFilterRenderer ? '(Blanks)' : '';
      } else if (params.value === '(Select All)') {
        this.eGui.innerHTML = params.value;
      } else {
        const parts = params.value.split('|', 2);
        this.eGui.innerHTML = `${parts[0]}&nbsp;&nbsp;&nbsp;<small class="text-muted">${parts[1]}</small>`;
      }
    }
  
    getGui() {
      return this.eGui;
    }
  
    refresh() {
      return false;
    }
}

class ResourceZoneRenderer {
    init(params) {
      this.eGui = document.createElement('div');
  
      if (!params.value) {
        this.eGui.innerHTML = params.isFilterRenderer ? '(Blanks)' : '';
      } else if (params.value === '(Select All)') {
        this.eGui.innerHTML = params.value;
      } else {
        const url = `provider-public/scaleway/img/zones/${params.value.split('-')[0]}.svg`;
        const zoneImage = `<img class="zone" src="${url}" alt="${params.value}" width="20">`;
  
        this.eGui.innerHTML = `${zoneImage}&nbsp;&nbsp;&nbsp;<span class="text-muted">${params.value}</span>`;
      }
    }
  
    getGui() {
      return this.eGui;
    }
  
    refresh() {
      return false;
    }
}

class ResourceQuantityRenderer {
    init(params) {
      this.eGui = document.createElement('div');
  
      if (!params.value) {
        this.eGui.innerHTML = params.isFilterRenderer ? '(Blanks)' : '';
      } else if (params.value === '(Select All)') {
        this.eGui.innerHTML = params.value;
      } else if (params.value === 'ON') {
        this.eGui.innerHTML = `<span class="badge bg-success me-1"></span> ON`;
      } else if (params.value === 'OFF') {
        this.eGui.innerHTML = `<span class="badge bg-secondary me-1"></span> OFF`;
      } else {
        this.eGui.innerHTML = params.value;
      }

      this.eGui.innerHTML = `<span class="text-muted">${this.eGui.innerHTML}</span>`;
    }
  
    getGui() {
      return this.eGui;
    }
  
    refresh() {
      return false;
    }
}

context.renderers['scaleway'] = (data) => {
    const projects = {};
    data.projects.forEach(project => projects[project.id] = project);

    return {
        columnDefs: [
            { headerName: 'Project', field: 'project', filter: 'agSetColumnFilter', rowGroup: true, hide: true },
            { headerName: 'Type', field: 'type', filter: 'agSetColumnFilter', cellRenderer: ResourceTypeRenderer },
            { headerName: 'Name', field: 'name', width: 350, cellRenderer: ResourceNameRenderer },
            { headerName: 'Zone', field: 'zone', filter: 'agSetColumnFilter', cellRenderer: ResourceZoneRenderer, width: 160 },
            { headerName: 'Quantity', field: 'quantity', width: 160, cellRenderer: ResourceQuantityRenderer },
            { headerName: `Price (€ / ${context.prices.unit})`, field: 'price', filter: 'agNumberColumnFilter', width: 160 },
        ],
        rowData: data.resources.map(resource => ({
            type: resource.type,
            name: `${resource.name}|${resource.description ?? ''}`,
            project: projects[resource.projectId]?.name ?? '-',
            zone: resource.zone,
            quantity: (() => {
                if (resource.quantity === null) {
                    return '';
                } else if (typeof resource.quantity === 'boolean') {
                    return resource.quantity ? 'ON' : 'OFF';
                } else {
                    return `${resource.quantity} ${resource.unit ?? ''}`;
                }
            })(),
            price: (() => {
                if (resource.totalPricePerHour > 1 / Math.pow(10, context.prices.precision)) {
                    const pricePerHour = (Math.round(Math.pow(10, context.prices.precision) * resource.totalPricePerHour) / Math.pow(10, context.prices.precision));

                    if (context.prices.unit === 'hour') {
                        return pricePerHour.toFixed(context.prices.precision);
                    } else if (context.prices.unit === 'day') {
                        return (pricePerHour * 24).toFixed(context.prices.precision);
                    } else if (context.prices.unit === 'month') {
                        return (pricePerHour * 730).toFixed(context.prices.precision);
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            })(),
        })),

        groupDisplayType: 'multipleColumns',
        groupDefaultExpanded: 1,

        // default ColDef, gets applied to every column
        defaultColDef: {
            // make every column use 'text' filter by default
            filter: 'agTextColumnFilter',
            // enable floating filters by default
            floatingFilter: true,
            // make columns resizable
            resizable: true,

            sortable: true,
            rowHeight: 50,
        },
    };
}