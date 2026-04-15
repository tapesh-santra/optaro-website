// ═══════════════════════════════════════════════
//  USE CASE POPUP MODAL — Standalone
// ═══════════════════════════════════════════════

(function initUseCaseModal() {
  var useCaseData = [
    {
      title: 'Transportation Lead Time Recommendation',
      icon: 'fa-route',
      color: '#00d4ff',
      rgb: '0,212,255',
      value: '8\u201312% fewer late deliveries',
      deploy: '7 days',
      agents: '3 agents',
      desc: 'Optaro continuously analyzes transport lane performance across your carrier network \u2014 tracking actual vs. planned lead times, identifying high-variability lanes, and detecting patterns in missed delivery windows. The system surfaces root causes like seasonal congestion, carrier underperformance, or routing inefficiencies, then autonomously recommends lane-level adjustments including carrier reallocation, buffer time updates, and alternative routing strategies.',
      features: [
        'Real-time carrier performance scoring across all lanes',
        'Variability detection with seasonal and trend decomposition',
        'Automated lead-time buffer recommendations per lane',
        'Carrier reallocation suggestions based on reliability data',
        'Integration with TMS for direct parameter updates'
      ]
    },
    {
      title: 'Projected Inventory Positions',
      icon: 'fa-chart-line',
      color: '#a855f7',
      rgb: '168,85,247',
      value: '15\u201320% reduction in stockouts',
      deploy: '5 days',
      agents: '4 agents',
      desc: 'Build a complete forward-looking view of your inventory across every SKU and location. Optaro\u2019s agents synthesize current on-hand stock, confirmed inbound shipments, open purchase orders, demand forecasts, and planned production schedules to project day-by-day inventory positions weeks into the future \u2014 giving planners the foundation for proactive decision-making rather than reactive firefighting.',
      features: [
        'Multi-horizon projections: daily, weekly, and monthly roll-ups',
        'Automatic reconciliation of supply, demand, and WIP data',
        'Configurable projection parameters per SKU-location',
        'Exception alerts when projected positions breach safety thresholds',
        'Seamless data ingestion from ERP, WMS, and planning tools'
      ]
    },
    {
      title: 'Inventory Shortage & Excess Detection',
      icon: 'fa-triangle-exclamation',
      color: '#f43f5e',
      rgb: '244,63,94',
      value: '$2\u20135M working capital released',
      deploy: '10 days',
      agents: '4 agents',
      desc: 'Optaro\u2019s agents continuously compare projected inventory positions against demand requirements and safety stock thresholds to detect upcoming shortages and excess before they impact your business. Each alert includes a root-cause analysis, projected magnitude, and a prioritized set of recommended actions \u2014 from expediting inbound orders to launching markdown campaigns for aging excess stock.',
      features: [
        'Proactive detection 2\u20138 weeks ahead of impact',
        'Shortage severity scoring with revenue-at-risk quantification',
        'Excess aging analysis with holding cost projections',
        'Automated action recommendations: expedite, defer, rebalance, markdown',
        'Configurable alert thresholds per product segment'
      ]
    },
    {
      title: 'Expedite Management',
      icon: 'fa-truck-fast',
      color: '#00ff87',
      rgb: '0,255,135',
      value: '$1.5\u20133M in prevented lost sales',
      deploy: '14 days',
      agents: '5 agents',
      desc: 'When shortages are imminent, Optaro identifies every order and shipment that could be expedited and evaluates each one against projected impact, priority tiers, and cost-benefit thresholds. The system autonomously triggers procurement actions \u2014 booking air freight, splitting orders across backup suppliers, or accelerating internal transfers \u2014 while tracking the cost delta and maintaining full auditability for finance teams.',
      features: [
        'Priority-based expedite queue with cost-benefit scoring',
        'Automated carrier selection for fastest available route',
        'Supplier backup activation with pre-negotiated terms',
        'Real-time ETA tracking and proactive stakeholder alerts',
        'Full cost tracking with PO writeback to ERP'
      ]
    },
    {
      title: 'Production Rescheduling',
      icon: 'fa-industry',
      color: '#6366f1',
      rgb: '99,102,241',
      value: '25\u201340% fewer schedule disruptions',
      deploy: '12 days',
      agents: '5 agents',
      desc: 'When supply disruptions hit or demand shifts unexpectedly, Optaro\u2019s production rescheduling agents analyze your current manufacturing schedule, available capacity, material availability, and downstream commitments to generate optimized reschedule recommendations. The system validates minimum order quantities, checks capacity across lines, and confirms material availability before proposing changes.',
      features: [
        'Multi-constraint rescheduling: capacity, materials, MOQs',
        'What-if scenario modeling for schedule change options',
        'Downstream impact analysis across dependent orders',
        'Direct writeback to MES and production planning systems',
        'Zero-cost-first optimization: use available capacity before overtime'
      ]
    },
    {
      title: 'Stock Rebalancing',
      icon: 'fa-arrows-rotate',
      color: '#f59e0b',
      rgb: '245,158,11',
      value: '$3\u20136M in prevented lost sales',
      deploy: '10 days',
      agents: '5 agents',
      desc: 'Optaro identifies inventory imbalances across your distribution network \u2014 surplus building at one location while another faces a shortage of the same SKU. The system evaluates transfer costs, transit times, minimum shipment thresholds, and demand forecasts at both origin and destination to generate optimal rebalancing plans that maximize network-wide fill rates while minimizing logistics cost.',
      features: [
        'Network-wide surplus and deficit mapping in real time',
        'Cost-optimized transfer recommendations with ROI scoring',
        'Multi-modal logistics evaluation: ground, rail, air',
        'Minimum shipment and pallet-quantity validation',
        'Transfer order creation with direct WMS writeback'
      ]
    },
    {
      title: 'Dynamic Safety Stock Optimization',
      icon: 'fa-shield-halved',
      color: '#22d3ee',
      rgb: '34,211,238',
      value: '10\u201315% inventory reduction',
      deploy: '7 days',
      agents: '4 agents',
      desc: 'Static safety stock settings decay the moment demand patterns shift. Optaro dynamically recalculates optimal safety stock levels by continuously analyzing demand variability, supplier lead-time uncertainty, and your target service levels \u2014 then writes the updated parameters directly back into your planning system. The result: lower inventory investment with the same or better fill rates.',
      features: [
        'Continuous recalculation based on live demand and lead-time signals',
        'Service-level-aware optimization: set targets per SKU segment',
        'Lead-time variability decomposition by supplier and lane',
        'Automated parameter writeback to SAP, Oracle, or NetSuite',
        'Before/after impact analysis for every recommended change'
      ]
    }
  ];

  var overlay = document.getElementById('ucModalOverlay');
  var modal = document.getElementById('ucModal');
  var closeBtn = document.getElementById('ucModalClose');
  if (!overlay || !modal || !closeBtn) return;

  function openModal(index) {
    var d = useCaseData[index];
    if (!d) return;

    modal.style.setProperty('--modal-color', d.color);
    modal.style.setProperty('--modal-rgb', d.rgb);

    document.getElementById('ucModalIcon').innerHTML = '<i class="fas ' + d.icon + '"></i>';
    document.getElementById('ucModalTitle').textContent = d.title;
    document.getElementById('ucModalDesc').textContent = d.desc;
    document.getElementById('ucMetricValue').textContent = d.value;
    document.getElementById('ucMetricDeploy').textContent = d.deploy;
    document.getElementById('ucMetricAgents').textContent = d.agents;

    var featHtml = '';
    for (var i = 0; i < d.features.length; i++) {
      featHtml += '<li>' + d.features[i] + '</li>';
    }
    document.getElementById('ucModalFeatures').innerHTML = featHtml;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Event delegation on grid
  var grid = document.querySelector('.usecase-cards-grid');
  if (grid) {
    grid.addEventListener('click', function(e) {
      var card = e.target.closest('.usecase-card');
      if (!card) return;
      var allCards = grid.querySelectorAll('.usecase-card');
      for (var i = 0; i < allCards.length; i++) {
        if (allCards[i] === card) {
          openModal(i);
          break;
        }
      }
    });
  }

  // Close button
  closeBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  });

  // Click overlay backdrop
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeModal();
  });

  // Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
  });

  // CTA close
  var ctaBtn = document.getElementById('ucModalCta');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', function() {
      closeModal();
    });
  }
})();
