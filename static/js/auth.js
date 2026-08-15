/* Life Link authentication + session-aware fetch. */
(function(){
 document.documentElement.classList.add('ll-auth-pending');
 const originalFetch=window.fetch.bind(window);
 window.fetch=function(input,init){const options=init?{...init}:{};if(!options.credentials)options.credentials='same-origin';return originalFetch(input,options).then(response=>{if(response.status===401&&!window.location.pathname.startsWith('/login'))window.location.href='/login';return response;});};
 window.lifeLinkFetch=window.fetch;
 window.checkAuth=async function(requiredRoles){try{const response=await window.fetch('/api/me');if(!response.ok){window.location.href='/login';return null;}const user=await response.json();window.lifeLinkUser=user;document.documentElement.dataset.userRole=user.role;const greeting=document.getElementById('userGreeting');if(greeting)greeting.textContent=`Hello, ${user.name}`;if(requiredRoles&&!requiredRoles.includes(user.role)){window.location.href=user.role==='Hospital'?'/hospital-dashboard':`/${user.role.toLowerCase()}-dashboard`;return null;}document.documentElement.classList.remove('ll-auth-pending');return user;}catch(error){console.error('Authentication check failed:',error);window.location.href='/login';return null;}};
})();
