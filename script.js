:root {
  --bg: #f7f7f7;
  --card: #ffffff;
  --primary: #111;
  --accent: #1f8feb;
  --muted: #666;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: "Poppins", sans-serif;
  background: var(--bg);
  color: var(--primary);
}

/* HEADER */
header {
  text-align: center;
  padding: 18px 12px;
  background: #111;
  color: #fff;
}
h1 { margin: 0; font-size: 28px; }
.tagline { opacity: 0.85; }

/* PAGE */
.page { padding: 20px; }
.center-wrap { display: flex; justify-content: center; }
.card {
  width: 380px;
  background: var(--card);
  padding: 22px;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(14,20,30,0.06);
}
label { font-size: 13px; color: var(--muted); }
input, select {
  width: 100%;
  padding: 10px 12px;
  margin: 8px 0 14px;
  border-radius: 8px;
  border: 1px solid #ccc;
}
button[type="submit"] {
  padding: 12px;
  background: #111;
  color: #fff;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}
button[type="submit"]:hover {
  background: #222;
}

/* FLOATING CHAT ICON */
#chatIcon {
  position: fixed;
  right: 18px;
  bottom: 18px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: #fff;
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
  cursor: pointer;
  font-size: 20px;
}

/* OVERLAY */
#chatOverlay {
  position: fixed;
  inset: 0;
  background: transparent;
  display: none;
  z-index: 1500;
}
#chatOverlay.visible { display: block; }

/* CHAT POPUP */
#chatModal {
  position: fixed;
  bottom: 80px;
  right: 18px;
  width: 340px;
  background: var(--card);
  border-radius: 12px;
  display: none;
  box-shadow: 0 18px 50px rgba(0,0,0,0.25);
  flex-direction: column;
  overflow: hidden;
  opacity: 0;
  transform: translateY(8px);
  z-index: 1600;
  transition: opacity .18s, transform .18s;
}
#chatModal.visible {
  display: flex;
  opacity: 1;
  transform: translateY(0);
}

/* HEADER */
.modal-header {
  position: relative;
  padding: 10px 12px;
  border-bottom: 1px solid #eee;
}
.close-btn {
  position: absolute;
  right: 10px;
  top: 8px;
  font-size: 18px;
  border: none;
  background: none;
  cursor: pointer;
}

/* MESSAGES */
.chat-messages {
  height: 300px;
  padding: 12px;
  overflow-y: auto;
  background: #fbfbfd;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.msg {
  max-width: 85%;
  padding: 10px 12px;
  border-radius: 10px;
}
.msg.you {
  align-self: flex-end;
  background: #111;
  color: #fff;
}
.msg.bot {
  background: #eef6ff;
  color: #003366;
}

/* CHAT INPUT + SMALL SEND BUTTON */
.chat-form {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-top: 1px solid #eee;
}
.chat-form input {
  flex: 1;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
}
.chat-form button {
  padding: 6px 10px;
  min-width: 40px;
  max-width: 45px;
  height: 38px;
  font-size: 16px;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  border: none;
  cursor: pointer;
}

/* UTILITY */
.hidden { display: none !important; }
