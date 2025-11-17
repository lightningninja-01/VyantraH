:root{
  --bg:#f7f7f7;
  --card:#ffffff;
  --primary:#111;
  --accent:#1f8feb;
  --muted:#666;
}
*{box-sizing:border-box}
body{
  margin:0;
  font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,"Poppins",sans-serif;
  background:var(--bg);
  color:var(--primary);
  -webkit-font-smoothing:antialiased;
}
header{
  text-align:center;
  padding:18px 12px;
  background:#111;
  color:#fff;
}
h1{ margin:0; font-size:28px; letter-spacing:1px; }
.tagline{ margin:6px 0 0; opacity:.85; font-size:13px; }

.page{ padding:28px 16px 80px; min-height:calc(100vh - 120px); }
.center-wrap{ display:flex; justify-content:center; align-items:flex-start; }
.card{
  width:380px;
  background:var(--card);
  padding:22px;
  border-radius:12px;
  box-shadow:0 6px 18px rgba(14,20,30,0.06);
}
label{ display:block; font-size:13px; color:var(--muted); margin-top:6px; }
input[type="number"], select, input[type="text"]{
  width:100%;
  padding:10px 12px;
  margin-top:8px;
  border-radius:8px;
  border:1px solid #d0d5db;
  font-size:14px;
}
button[type="submit"], button{
  display:inline-block;
  padding:11px 14px;
  margin-top:14px;
  border-radius:10px;
  background:#111;
  color:#fff;
  border:none;
  cursor:pointer;
  font-weight:600;
  width:100%;
}
button[type="submit"]:hover{ background:#222; }

#result{ margin-top:14px; font-size:14px; color:#222; }

/* floating chat icon */
#chatIcon{
  position:fixed;
  right:18px;
  bottom:18px;
  width:44px;
  height:44px;
  border-radius:50%;
  border:none;
  background:#fff;
  box-shadow:0 6px 18px rgba(16,24,40,0.12);
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  font-size:18px;
  z-index:1400;
  transition:transform .12s ease, box-shadow .12s;
}
#chatIcon:hover{ transform:translateY(-4px); box-shadow:0 10px 30px rgba(16,24,40,0.18); }
.bot-emoji{ font-size:20px; }

/* overlay - transparent but catches clicks */
#chatOverlay{
  position:fixed;
  inset:0;
  background:transparent;
  z-index:1500;
  display:none;
}
#chatOverlay.visible{ display:block; }

/* chat modal anchored bottom-right */
#chatModal{
  position:fixed;
  bottom:80px;   /* distance above icon */
  right:18px;
  width:340px;
  max-height:70vh;
  background:var(--card);
  border-radius:12px;
  box-shadow:0 18px 50px rgba(11,22,40,0.25);
  z-index:1600;
  display:none;
  flex-direction:column;
  overflow:hidden;
  opacity:0;
  transform:translateY(8px);
  transition:opacity .18s ease, transform .18s ease;
}
#chatModal.visible{
  display:flex;
  opacity:1;
  transform:translateY(0);
}

/* modal header: relative for absolute close button */
.modal-header{
  position:relative;           /* important for absolute child */
  display:flex;
  align-items:center;
  padding:10px 12px;
  border-bottom:1px solid #f1f3f5;
}
.modal-header h3{ margin:0; font-size:15px; color:var(--primary); }

/* PLACE close button at top-right corner inside modal */
.close-btn{
  position:absolute;
  right:10px;
  top:8px;
  background:transparent;
  border:none;
  font-size:18px;
  cursor:pointer;
  color:var(--muted);
  padding:6px;
  line-height:1;
  border-radius:6px;
}
.close-btn:hover{ background:rgba(0,0,0,0.04); color:#111; }

/* messages area */
.chat-messages{
  padding:12px;
  display:flex;
  flex-direction:column;
  gap:10px;
  height:320px;
  overflow:auto;
  background:#fbfbfd;
}
.msg{ max-width:84%; padding:10px 12px; border-radius:10px; font-size:14px; line-height:1.3; }
.msg.you{ align-self:flex-end; background:#111; color:#fff; border-bottom-right-radius:6px; }
.msg.bot{ align-self:flex-start; background:#eef6ff; color:#00284d; border-bottom-left-radius:6px; }

/* input row */
.chat-form{
  display:flex;
  gap:8px;
  padding:10px 12px;
  border-top:1px solid #f1f3f5;
}
.chat-form input{
  flex:1;
  padding:10px 12px;
  border-radius:8px;
  border:1px solid #e0e3e7;
  font-size:14px;
}
.chat-form button{
  padding:10px 14px;
  border-radius:8px;
  background:var(--accent);
  color:#fff;
  border:none;
  cursor:pointer;
}

/* utility classes */
.hidden{ display:none !important; }

/* responsive */
@media (max-width:480px){
  .card{ width:92%; padding:16px; }
  #chatModal{ width:92%; right:4%; bottom:70px; }
  #chatIcon{ right:12px; bottom:12px; width:44px; height:44px; }
}
