// Client-side mapping for ticket types
(function(){
  // Helper to read query params
  function getQueryParam(name){
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  // Prefix map for ticket types
  const prefix = {
    'caja':'CJ',
    'consultas':'CS',
    'bancamovil':'BM',
    // Negocios debe ser NE
    'creditos':'NE',
    // Comercio Exterior debe ser CE
    'comercio':'CE'
  };

  // Navigation map: types that open another page instead of producing a ticket
  const navMap = {
    'plataforma': 'plataforma.html',
    'bancaelectronica': 'banca-electronica.html'
  };

  // Add prefixes for the new ticket types
  Object.assign(prefix, {
    'sarc': 'SR',
    'atenc': 'AC',
    'cajero': 'CA',
    'servelectronico': 'SE',
    'crypto': 'CR'
  });

  function pad(num, size){
    let s = String(num);
    while(s.length < size) s = '0' + s;
    return s;
  }

  // Generate next ticket code for a given type and store in localStorage
  function nextTicket(type){
    const key = 'bn_ticket_' + type;
    let current = parseInt(localStorage.getItem(key) || '0', 10);
    current = isNaN(current) ? 0 : current;
    current += 1;
    localStorage.setItem(key, String(current));
    return (prefix[type] || '??') + '-' + pad(current, 3);
  }

  // Attach behavior if index contains ticket buttons
  document.addEventListener('DOMContentLoaded', function(){
    const btns = document.querySelectorAll('.ticket-btn[data-type]');
    if(btns && btns.length){
      btns.forEach(btn => {
        btn.addEventListener('click', function(){
          const type = (btn.getAttribute('data-type') || '').toLowerCase();
          if(!type) return;

          // If this type should navigate to another page, do that
          if(navMap[type]){
            window.location.href = navMap[type];
            return;
          }

          // Otherwise generate a ticket
          const code = nextTicket(type);
          // navigate to ticket page with code
          window.location.href = 'ticket.html?code=' + encodeURIComponent(code);
        });
      });
      return; 
    }

    // If not index, maybe ticket page
    const ticketEl = document.getElementById('ticketCode');
    if(ticketEl){
      const code = getQueryParam('code') || '--';
      ticketEl.textContent = code;

      const printBtn = document.getElementById('printBtn');
      if(printBtn){
        printBtn.addEventListener('click', function(){
          window.print();
        });
      }
    }
  });

})();
