# Suy Mentions Editor

一个功能强大的 React 提及编辑器组件，支持用户提及、实时搜索、键盘导航等功能。

## 功能特性

- 🎯 智能用户提及功能
- 🔍 实时搜索和过滤
- ⌨️ 键盘导航支持
- 📱 响应式设计
- 🎨 高度可定制
- 🔧 TypeScript 支持
- 📝 富文本编辑支持

## 安装

```bash
npm install suy-mentions
# 或
yarn add suy-mentions
```

## 基本使用

```tsx
import MentionsEditor from 'suy-mentions';

const users = [
  { id: '1', name: '张三', email: 'zhangsan@example.com', role: '开发', department: '技术部' },
  { id: '2', name: '李四', email: 'lisi@example.com', role: '设计', department: '设计部' },
];

function App() {
  const handleMention = (user) => {
    console.log('提及用户:', user);
  };

  const handleTagClick = (userId) => {
    console.log('点击用户标签:', userId);
  };

  return (
    <MentionsEditor
      selectOptions={users}
      onMention={handleMention}
      tagClick={handleTagClick}
    />
  );
}
```

## API 文档

### Props

| 参数 | 类型 | 默认值 | 必填 | 描述 |
|------|------|--------|------|------|
| `value` | `string` | - | 否 | 输入框的初始内容 |
| `UserKey` | `keyof User` | `'id'` | 否 | 用户对象的唯一标识字段 |
| `maxLength` | `number` | `200` | 否 | 文本最大输入长度 |
| `maxMentions` | `number` | `10` | 否 | 最大提及数量 |
| `selectOptions` | `User[]` | `[]` | 否 | 用户选择列表 |
| `defaultMentions` | `string[]` | - | 否 | 默认提及列表，用于返显标签 |
| `placeholder` | `PlaceholderConfig` | `{ text: '请输入内容', color: '#666' }` | 否 | 占位符配置 |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | 否 | 提及列表显示位置 |
| `style` | `React.CSSProperties` | `{}` | 否 | 自定义样式 |
| `onErrors` | `(error: number) => void` | - | 否 | 错误回调函数 |
| `onMention` | `(user: User) => void` | - | 否 | 提及用户回调函数 |
| `tagClick` | `(id: string) => void` | - | 否 | 点击用户标签回调函数 |

### 类型定义

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface PlaceholderConfig {
  text: string;
  color: string;
}

interface MentionsEditorProps {
  value?: string;
  UserKey?: keyof User;
  maxLength?: number;
  maxMentions?: number;
  selectOptions?: User[];
  defaultMentions?: string[];
  placeholder?: PlaceholderConfig;
  position?: 'top' | 'bottom' | 'left' | 'right';
  style?: React.CSSProperties;
  onErrors?: (error: number) => void;
  onMention?: (user: User) => void;
  tagClick?: (id: string) => void;
}
```

### Ref 方法

通过 `useRef` 可以访问以下方法：

```typescript
export type MentionsRefType = {
  getAllTextContent: () => string;        // 获取所有文本内容
  getAllHTMLContent: () => string;        // 获取所有HTML内容
  clearContainerContent: () => void;      // 清空容器内容
  getTextAndCursorPosition: () => { text: string; cursorPosition: number }; // 获取文本和光标位置
};
```

使用示例：

```tsx
import { useRef } from 'react';
import MentionsEditor, { MentionsRefType } from 'suy-mentions';

function App() {
  const editorRef = useRef<MentionsRefType>(null);

  const handleSubmit = () => {
    const textContent = editorRef.current?.getAllTextContent();
    const htmlContent = editorRef.current?.getAllHTMLContent();
    console.log('文本内容:', textContent);
    console.log('HTML内容:', htmlContent);
  };

  return (
    <div>
      <MentionsEditor ref={editorRef} selectOptions={users} />
      <button onClick={handleSubmit}>提交</button>
    </div>
  );
}
```

## 错误处理

`onErrors` 回调函数会接收以下错误代码：

- `1`: 超过最大长度限制
- `2`: 超过最大提及数量

```tsx
const handleErrors = (errorCode: number) => {
  switch (errorCode) {
    case 1:
      alert('文本长度超过限制');
      break;
    case 2:
      alert('提及数量超过限制');
      break;
  }
};
```

## 键盘操作

- `@`: 触发提及列表
- `↑/↓`: 在提及列表中上下选择
- `Enter`: 选择当前用户
- `Escape`: 关闭提及列表

## 样式定制

### 默认样式类名

- `.suy-mentions-container`: 主容器
- `.mention-editor`: 编辑器
- `.mentions-list`: 提及列表
- `.mention-item`: 提及项
- `.mention-item.selected`: 选中的提及项
- `.mention-avatar`: 用户头像
- `.mention-info`: 用户信息
- `.mention-name`: 用户姓名
- `.mention-email`: 用户邮箱
- `.mention-tag`: 提及标签
- `.mention-empty`: 空状态

### 自定义样式示例

```css
.suy-mentions-container {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
}

.mention-editor {
  min-height: 100px;
  outline: none;
}

.mentions-list {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mention-item {
  padding: 8px 12px;
  cursor: pointer;
}

.mention-item:hover {
  background-color: #f5f5f5;
}

.mention-item.selected {
  background-color: #e3f2fd;
}

.mention-tag {
  color: #1976d2;
  text-decoration: none;
  background-color: #e3f2fd;
  padding: 2px 4px;
  border-radius: 2px;
}
```

## 完整示例

```tsx
import React, { useRef } from 'react';
import MentionsEditor, { MentionsRefType } from 'suy-mentions';

const users = [
  { id: '1', name: '张三', email: 'zhangsan@example.com', role: '开发', department: '技术部' },
  { id: '2', name: '李四', email: 'lisi@example.com', role: '设计', department: '设计部' },
  { id: '3', name: '王五', email: 'wangwu@example.com', role: '产品', department: '产品部' },
];

function App() {
  const editorRef = useRef<MentionsRefType>(null);

  const handleMention = (user) => {
    console.log('提及用户:', user);
  };

  const handleTagClick = (userId) => {
    console.log('点击用户标签:', userId);
  };

  const handleErrors = (errorCode) => {
    switch (errorCode) {
      case 1:
        alert('文本长度超过限制');
        break;
      case 2:
        alert('提及数量超过限制');
        break;
    }
  };

  const handleSubmit = () => {
    const textContent = editorRef.current?.getAllTextContent();
    const htmlContent = editorRef.current?.getAllHTMLContent();
    console.log('提交内容:', { textContent, htmlContent });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>提及编辑器示例</h2>
      <MentionsEditor
        ref={editorRef}
        selectOptions={users}
        maxLength={500}
        maxMentions={5}
        position="bottom"
        placeholder={{ text: '请输入内容，使用 @ 提及用户', color: '#999' }}
        onMention={handleMention}
        tagClick={handleTagClick}
        onErrors={handleErrors}
        style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '8px' }}
      />
      <button onClick={handleSubmit} style={{ marginTop: '10px' }}>
        提交
      </button>
    </div>
  );
}

export default App;
```

## 注意事项

1. 确保 `selectOptions` 中的用户数据包含必要的字段（id, name, email, role, department）
2. 提及列表的位置会自动调整以避免超出视口
3. 组件会自动处理 HTML 内容中的提及标签
4. 支持在提及标签内外的不同行为

## 许可证

MIT License



### 2025-06-12
 作者近期暂时没时间扩展，欢迎有兴趣的同学一起加入一起开发。后续会不断优化功能，大家可以下载自行添加功能
 感谢