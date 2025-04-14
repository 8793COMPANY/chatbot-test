import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatRef = useRef(null);

  const botImageUrl = 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png';

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (date) => date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date) => date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  const sendMessage = async () => {
    if (!input.trim()) return;

    const now = new Date();
    const userMessage = { from: 'user', text: input, time: formatTime(now), date: formatDate(now) };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    try {
      const res = await fetch('https://wfhj3qetk5.execute-api.ap-northeast-2.amazonaws.com/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userRequest: {
            user: { id: 'webtest' },  // 원하는 유저 ID
            utterance: input
          }
        }),
      });

      const data = await res.json();
      const botReply = data.template.outputs[0].simpleText.text;
      const botMessage = { from: 'bot', text: botReply, time: formatTime(new Date()), date: formatDate(new Date()) };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const failMessage = { from: 'bot', text: '응답 실패 😢', time: formatTime(new Date()), date: formatDate(new Date()) };
      setMessages((prev) => [...prev, failMessage]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  // 날짜가 바뀌는 메시지마다 날짜 태그 표시
  const renderMessages = () => {
    let lastDate = null;

    return messages.map((msg, i) => {
      const showDate = msg.date !== lastDate;
      lastDate = msg.date;

      return (
        <React.Fragment key={i}>
          {showDate && <div className="date-separator">{msg.date}</div>}
          <div className={`bubble-row ${msg.from}`}>
            {msg.from === 'bot' && <img src={botImageUrl} alt="bot" className="bubble-profile" />}
            <div className="bubble-group">
              <div className={`bubble ${msg.from}`}>{msg.text}</div>
              <div className="timestamp">{msg.time}</div>
            </div>
          </div>
        </React.Fragment>
      );
    });
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-header">
        <img src={botImageUrl} alt="감성 코딩 친구" className="bot-profile" />
        <div className="bot-info">
          <div className="bot-name">감성 코딩 친구</div>
          <div className="bot-status">언제든 네 얘기 기다리는 중 😊</div>
        </div>
      </div>
      <div className="chat-box" ref={chatRef}>
        {renderMessages()}
      </div>
      <div className="input-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요"
        />
        <button onClick={sendMessage}>전송</button>
      </div>
    </div>
  );
}

export default App;