import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import Mentions from '../src/Mentions';

const Demo = () => {
  const [value, setValue] = useState('');
  const mentionsRef = useRef(null);
  const handleChange = (newValue) => {
    setValue(newValue);
  };

  // 获取文本内容
  const handleGetText = () => {
    console.log('文本内容', mentionsRef.current.getAllTextContent());
  };
  // 获取HTML所有内容
  const handleHTMLText = () => {
    console.log('HTML内容', mentionsRef.current.getAllHTMLContent());
  };
  // 清空输入框内容
  const handleClearText = () => {
    mentionsRef.current.clearContainerContent();
  };
  const handleSelect = (option) => {
    console.log('tagClick-selected', option);
  };
  const handleErrors = (error) => {
    console.log('error', error);
  };
  // 模拟用户数据
  const users = [
    {
      id: '1',
      name: '张三',
      email: 'zhangsan@example.com',
      role: '前端开发',
      department: '技术部',
    },
    {
      id: '2',
      name: '李四',
      email: 'lisi@example.com',
      role: '后端开发',
      department: '技术部',
    },
    {
      id: '3',
      name: '王五',
      email: 'wangwu@example.com',
      role: '产品经理',
      department: '产品部',
    },
    {
      id: '4',
      name: '赵六',
      email: 'zhaoliu@example.com',
      role: 'UI设计师',
      department: '设计部',
    },
  ];
  return (
    <div style={{ padding: '20px' }}>
      <h1>Mentions Demo</h1>
      <div>
        <Mentions
          ref={mentionsRef}
          maxLength={20000}
          maxMentions={100}
          defaultMentions={['@张三', '@李四', '@王五', '@赵六']}
          placeholder={{ text: '输入@来触发提及', color: '#666' }}
          tagClick={handleSelect}
          style={{ width: '100%', height: 'auto' }}
          value={value}
          selectOptions={users}
          onChange={handleChange}
          onSelect={handleSelect}
          onErrors={handleErrors}
        ></Mentions>
      </div>
      <div>
        <h3>当前输入内容：</h3>
        <pre>{value}</pre>
      </div>
      <button onClick={handleGetText}>获取文本内容</button>
      <button onClick={handleHTMLText}>获取HTML所有内容</button>
      <button onClick={handleClearText}>清空内容</button>
    </div>
  );
};

ReactDOM.render(<Demo />, document.getElementById('root'));
