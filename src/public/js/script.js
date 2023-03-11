window.addEventListener('hashchange', () => loadCluster());

// Load clusters
fetch('/_config')
  .then(res => res.json())
  .then((config) => {
    context.config = config;

    if (!context.config.isValid) {
      document.querySelector('#page-main').style.display = "none";
      document.querySelector('#page-error').style.display = "block";
      document.querySelector('#config-error-message').innerText = context.config.error;
      return;
    }
  
    context.config.clusters.forEach(cluster => {
      const tbody = document.querySelector("ul.navbar-nav");
      const template = document.querySelector('#template-cluster');

      const clone = template.content.cloneNode(true);
      clone.querySelector("li.nav-item").dataset.cluster = cluster.key;
      clone.querySelector("a.nav-link").href = `#${encodeURIComponent(cluster.key)}`;
      if (cluster.icon) {
        clone.querySelector(".nav-link-icon").style.display = "block";
        clone.querySelector("img.icon").src = `https://cdn.jsdelivr.net/npm/@tabler/icons@2.10.0/icons/${cluster.icon}.svg`;
      }
      clone.querySelector(".nav-link-title").textContent = cluster.name;

      tbody.appendChild(clone);
    });

    loadCluster();
  });

function loadCluster() {
  setLoader(true);

  if (!window.location.hash) {
    window.location.hash = `#${context.config.clusters[0].key}`;
    return;
  }

  const clusterKey = window.location.hash.slice(1);
  context.cluster = context.config.clusters.find(cluster => cluster.key === clusterKey);

  // Set page title
  document.title = `Stratower - ${context.cluster.name}`;

  // Set active menu item
  document.querySelectorAll('li.nav-item').forEach(e => e.classList.remove("active"));
  document.querySelector(`li.nav-item[data-cluster="${context.cluster.key}"]`).classList.add("active");

  fetch(`/_cluster/${encodeURIComponent(clusterKey)}`)
    .then(res => res.json())
    .then((data) => {
      const eGridDiv = document.querySelector('#datatable');
      eGridDiv.innerHTML = "";
      
      context.gridOptions = context.renderers[context.cluster.provider.key](data);
      new agGrid.Grid(eGridDiv, context.gridOptions);

      setLoader(false);
    });
}

function setPriceUnit(unit) {
  context.prices.unit = unit;
  document.getElementById('priceUnitLabel').innerText = `€ / ${unit}`;
  renderData();
}

function exportDataAsExcel() {
  context.gridOptions.api.exportDataAsExcel();
}

function exportDataAsCsv() {
  context.gridOptions.api.exportDataAsCsv();
}

function setLoader(isLoading) {
  document.querySelector('#datatable').style.display = isLoading ? "none" : "block";
  document.querySelector('#loader').style.display = isLoading ? "block" : "none";
}
