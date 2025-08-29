// SPA-style router for sections
const Router = {
  go(page){ 
    document.querySelectorAll('.route').forEach(s => s.classList.remove('active'));
    const target = document.querySelector(`[data-page="${page}"]`);
    if(target){
      target.classList.add('active');
      history.replaceState({}, '', `#${page}`);
      window.scrollTo({ top: 0, behavior:'smooth' });
    }
  },
  init(){
    const start = location.hash?.replace('#','') || 'home';
    this.go(start);
    document.querySelectorAll('[data-route]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        this.go(a.getAttribute('data-route'));
      });
    });
  }
};
window.Router = Router;

// Simple canvas particles (soft floating dots) for aesthetic bg
function particles(){
  const c = document.getElementById('bg');
  if(!c) return;
  const ctx = c.getContext('2d');
  const DPR = window.devicePixelRatio || 1;
  let W, H;
  function resize(){
    W = c.width = innerWidth*DPR;
    H = c.height = innerHeight*DPR;
    ctx.scale(DPR,DPR);
  }
  resize();
  addEventListener('resize', resize);
  const P = Array.from({length: 80}, () => ({
    x: Math.random()*innerWidth,
    y: Math.random()*innerHeight,
    r: Math.random()*2.2+0.8,
    dx: (Math.random()-0.5)*0.2,
    dy: (Math.random()-0.5)*0.2
  }));
  function tick(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    for(const p of P){
      p.x+=p.dx; p.y+=p.dy;
      if(p.x<0||p.x>innerWidth) p.dx*=-1;
      if(p.y<0||p.y>innerHeight) p.dy*=-1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(89,255,167,0.14)';
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  tick();
}

// Mock catalog data
const PLANTS = [
  {id:1, name:'Snake Plant', price:399, img:'https://images.unsplash.com/photo-1614594859263-9fb39a2b805d?q=80&w=800&auto=format&fit=crop'},
  {id:2, name:'Monstera', price:799, img:'https://images.unsplash.com/photo-1593697820900-227b9b2acda8?q=80&w=800&auto=format&fit=crop'},
  {id:3, name:'Areca Palm', price:699, img:'https://images.unsplash.com/photo-1612155746301-c5448cc34f97?q=80&w=800&auto=format&fit=crop'},
  {id:4, name:'Aloe Vera', price:299, img:'https://images.unsplash.com/photo-1587502536263-843af37f0638?q=80&w=800&auto=format&fit=crop'},
  {id:5, name:'ZZ Plant', price:599, img:'https://images.unsplash.com/photo-1609945214708-9d3f753cf0df?q=80&w=800&auto=format&fit=crop'},
  {id:6, name:'Peace Lily', price:549, img:'https://images.unsplash.com/photo-1545249390-6bdfa286032f?q=80&w=800&auto=format&fit=crop'},
];

function renderCatalog(){
  const grid = document.getElementById('plantGrid');
  if(!grid) return;
  grid.innerHTML = PLANTS.map(p => `
    <div class="card glass plant" data-id="${p.id}">
      <img src="${p.img}" alt="${p.name}">
      <div class="meta">
        <div>
          <strong>${p.name}</strong>
          <div class="price">₹${p.price}</div>
        </div>
        <button class="btn ghost add-btn" onclick="addToCart(${p.id})">Add</button>
      </div>
    </div>
  `).join('');
}

const CART = JSON.parse(localStorage.getItem('pm:cart')||'[]');
function addToCart(id){
  const item = PLANTS.find(x=>x.id===id);
  CART.push(item);
  localStorage.setItem('pm:cart', JSON.stringify(CART));
  toast(`${item.name} added to cart 🧺`);
}

// Forms -> save to localStorage as MVP demo
function setupForms(){
  const byId = id => document.getElementById(id);

  // LOGIN
  if(byId('loginForm')){
    byId('loginForm').addEventListener('submit', e => {
      e.preventDefault();
      const email = e.target.email.value;
      const pass = e.target.password.value;
      const users = JSON.parse(localStorage.getItem('pm:users')||'[]');
      const ok = users.find(u=>u.email===email && u.password===pass);
      if(ok){
        toast('Welcome back! Logged in ✅');
        localStorage.setItem('pm:currentUser', JSON.stringify({...ok, type:'user'}));
        updateNavbar();
        loadProfile();
        Router.go('profile');
      }else{
        toast('Invalid credentials. Try signing up.', true);
      }
    });
  }

  // SIGNUP
  if(byId('signupForm')){
    byId('signupForm').addEventListener('submit', e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target).entries());
      const users = JSON.parse(localStorage.getItem('pm:users')||'[]');
      users.push(data);
      localStorage.setItem('pm:users', JSON.stringify(users));

      localStorage.setItem('pm:currentUser', JSON.stringify({...data, type:'user'}));
      toast('Account created 🎉 Welcome!');
      updateNavbar();
      loadProfile();
      Router.go('profile');
    });
  }

  // DELIVERY REGISTER
  if(byId('deliveryForm')){
    byId('deliveryForm').addEventListener('submit', e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target).entries());
      const list = JSON.parse(localStorage.getItem('pm:delivery')||'[]');
      list.push({...data, createdAt: Date.now()});
      localStorage.setItem('pm:delivery', JSON.stringify(list));

      localStorage.setItem('pm:currentUser', JSON.stringify({...data, type:'delivery'}));
      toast('Delivery partner registered 🚴');
      updateNavbar();
      loadProfile();
      Router.go('profile');
    });
  }

  // STORE REGISTER
  if(byId('storeForm')){
    byId('storeForm').addEventListener('submit', e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target).entries());
      const list = JSON.parse(localStorage.getItem('pm:stores')||'[]');
      list.push({...data, createdAt: Date.now()});
      localStorage.setItem('pm:stores', JSON.stringify(list));

      localStorage.setItem('pm:currentUser', JSON.stringify({...data, type:'store'}));
      toast('Store registered 🏪');
      updateNavbar();
      loadProfile();
      Router.go('profile');
    });
  }
}

// Navbar toggle
function updateNavbar(){
  const user = JSON.parse(localStorage.getItem('pm:currentUser'));
  document.querySelectorAll('.guestOnly').forEach(el => {
    el.style.display = user ? 'none' : 'inline-block';
  });
  document.querySelectorAll('.authOnly').forEach(el => {
    el.style.display = user ? 'inline-block' : 'none';
  });
}

// Profile loader
function loadProfile(){
  const user = JSON.parse(localStorage.getItem('pm:currentUser'));
  const box = document.getElementById('profileDetails');
  if(!box) return;

  if(user){
    let html = `<p><strong>Name:</strong> ${user.name || user.storeName}</p>`;
    if(user.type === 'store'){
      html += `<p><strong>Owner:</strong> ${user.owner}</p>`;
      html += `<p><strong>Phone:</strong> ${user.phone}</p>`;
      html += `<p><strong>Address:</strong> ${user.address}</p>`;
    }else if(user.type === 'delivery'){
      html += `<p><strong>Phone:</strong> ${user.phone}</p>`;
      html += `<p><strong>City:</strong> ${user.city}</p>`;
      html += `<p><strong>Vehicle:</strong> ${user.vehicle}</p>`;
    }else{
      html += `<p><strong>Email:</strong> ${user.email}</p>`;
      html += `<p><strong>Phone:</strong> ${user.phone}</p>`;
    }
    box.innerHTML = html;
  }else{
    box.innerHTML = `<p>No profile data.</p>`;
  }
}

// Logout
document.addEventListener('DOMContentLoaded', ()=>{
  const logoutBtn = document.getElementById('logoutBtn');
  if(logoutBtn){
    logoutBtn.addEventListener('click', ()=>{
      localStorage.removeItem('pm:currentUser');
      toast("Logged out 👋");
      updateNavbar();
      Router.go('home');
    });
  }
});

// Toast helper
function toast(msg, danger=false){
  const wrap = document.getElementById('toast');
  if(!wrap) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  if(danger) el.style.borderColor = 'rgba(255,99,99,0.6)';
  wrap.appendChild(el);
  setTimeout(()=>{
    el.style.opacity='0';
    setTimeout(()=>el.remove(), 300);
  }, 2300);
}

document.getElementById('year').textContent = new Date().getFullYear();

// OpenAI API Integration
async function setupOpenAIChat() {
  const OPENAI_API_KEY = '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'; 
  if (!OPENAI_API_KEY) {
    console.error("OpenAI API key is not set. Please update the OPENAI_API_KEY variable in app.js.");
    return;
  }

  const chatForm = document.getElementById('geminiChatForm');
  const chatBox = document.getElementById('geminiChatBox');

  const addMessageToChat = (text, sender) => {
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${sender}`;
    messageEl.textContent = text;
    chatBox.appendChild(messageEl);
    chatBox.scrollTop = chatBox.scrollHeight;
  };
  
  const showTypingIndicator = () => {
    const indicator = document.createElement('div');
    indicator.className = 'chat-message gemini typing-indicator';
    indicator.textContent = 'OpenAI is thinking...';
    chatBox.appendChild(indicator);
    chatBox.scrollTop = chatBox.scrollHeight;
    return indicator;
  };

  if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const promptInput = e.target.prompt;
      const prompt = promptInput.value.trim();

      if (!prompt) return;

      addMessageToChat(prompt, 'user');
      promptInput.value = '';

      const typingIndicator = showTypingIndicator();

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }]
          })
        });

        const data = await response.json();
        
        typingIndicator.remove();

        if (response.ok) {
          const aiResponse = data.choices[0].message.content;
          addMessageToChat(aiResponse, 'gemini');
        } else {
          console.error("Error from OpenAI API:", data);
          addMessageToChat("Sorry, I'm having trouble connecting to OpenAI. Please check your API key or try again later.", 'gemini');
        }

      } catch (error) {
        typingIndicator.remove();
        console.error("Error connecting to OpenAI:", error);
        addMessageToChat("An unexpected error occurred. Please try again later.", 'gemini');
      }
    });
  }
}

Router.init();
renderCatalog();
setupForms();
particles();
updateNavbar();
loadProfile();
setupOpenAIChat(); 
// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('menuToggle');
  const links = document.querySelector('#navbar .links');
  if(toggle && links){
    toggle.addEventListener('click', () => {
      links.classList.toggle('show');
    });
  }
});
