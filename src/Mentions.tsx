import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import UserModal from './UserModal'; // 用户详情弹窗组件
import './index.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface MentionsEditorProps {
  value?: string; // 输入框内容
  UserKey?: keyof User; // 用户对象的key
  maxLength?: number; // 文本最大输入长度
  maxMentions?: number; // 最大提及数量
  selectOptions?: User[]; // 用户选择列表
  defaultMentions?: string[]; // 默认提及 用于返显 tag
  placeholder?: {
    text: string;
    color: string;
  }; // 提示文字
  position?: 'top' | 'bottom' | 'left' | 'right'; // 提及列表位置
  style?: React.CSSProperties; // 样式
  onErrors?: (error: number) => void; // 错误回调 用于提示错误 {1: 超过最大长度, 2: 超过最大提及数量}
  onMention?: (user: User) => void; // 提及回调 用于获取用户信息
  tagClick?: (id: string) => void; // 点击回调 用于点击用户
}

export type MentionsRefType = {
  getAllTextContent: () => string;
  getAllHTMLContent: () => string;
  clearContainerContent: () => void;
  getTextAndCursorPosition: () => { text: string; cursorPosition: number };
};

const MentionsEditor = forwardRef<MentionsRefType, MentionsEditorProps>(
  (
    {
      value,
      defaultMentions,
      UserKey = 'id',
      maxMentions = 10,
      maxLength = 200,
      selectOptions = [],
      position = 'bottom',
      placeholder = { text: '请输入内容', color: '#666' },
      style = {},
      tagClick,
      onErrors,
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [mentions, setMentions] = useState(defaultMentions);
    const mentionsListRef = useRef<HTMLDivElement>(null);
    const [showMentions, setShowMentions] = useState(false);
    const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
    const [mentionSearch, setMentionSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [textContent, setTextContent] = useState('');
    const [currentPosition, setCurrentPosition] = useState(0);
    const [options, setOptions] = useState<User[]>(selectOptions || []);
    const [isFocused, setIsFocused] = useState(false);

    let filteredUsers = options.filter((user) =>
      user.name.toLowerCase().includes(mentionSearch.toLowerCase())
    );

    // 获取所有文本的光标位置
    const getAllTextCursorPosition = () => {
      const editor = editorRef.current;
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      return range.startOffset;
    };
    const getLengthAfterLastAt = (str: string, cursorPosition: number) => {
      // 只考虑光标位置之前的文本
      const textBeforeCursor = str.substring(0, cursorPosition);
      const lastIndex = textBeforeCursor.lastIndexOf('@');
      if (lastIndex === -1) return 0; // 如果没有@符号，返回0
      return cursorPosition - lastIndex; // 计算最后一个@到光标位置的长度
    };
    useEffect(() => {
      const editor = editorRef.current;
      if (editor && placeholder && textContent === '') {
        editor.innerText = placeholder.text;
        editor.style.color = placeholder.color;
      }
    }, [placeholder, textContent]);
    // 处理获取焦点
    const handleFocus = () => {
      setIsFocused(true);
      const editor = editorRef.current;
      if (editor && editor.innerText === placeholder.text) {
        editor.innerText = '';
        editor.style.color = placeholder.color;
      }
    };

    // 处理失去焦点
    const handleBlur = () => {
      setIsFocused(false);
      const editor = editorRef.current;
      if (editor && editor.innerText === '') {
        editor.innerText = placeholder.text;
        editor.style.color = placeholder.color;
      }
    };

    const getSearchKey = (text: string, cursorPosition: number) => {
      const editor = editorRef.current;
      if (!editor) return '';

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return '';

      const range = selection.getRangeAt(0);
      const cursorNode = range.startContainer;
      const cursorOffset = range.startOffset;

      // 从光标位置向前遍历
      let currentNode = cursorNode;
      let currentOffset = cursorOffset;
      let atPosition = -1;
      let foundATag = false;

      // 遍历函数
      const traverseBackward = (node: Node, offset: number): boolean => {
        // 如果已经找到a标签，停止遍历
        if (foundATag) return false;

        // 如果是元素节点
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          // 如果是a标签，标记找到并停止遍历
          if (element.tagName.toLowerCase() === 'a') {
            foundATag = true;
            return true;
          }
        }

        // 如果是文本节点
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || '';
          // 从当前偏移量向前查找@符号
          for (let i = offset - 1; i >= 0; i--) {
            if (text[i] === '@') {
              atPosition = i;
              return true;
            }
          }
        }

        // 继续向前遍历
        if (node.previousSibling) {
          return traverseBackward(
            node.previousSibling,
            node.previousSibling.textContent?.length || 0
          );
        } else if (node.parentNode && node.parentNode !== editor) {
          return traverseBackward(node.parentNode, 0);
        }

        return false;
      };

      // 开始遍历
      traverseBackward(currentNode, currentOffset);

      // 如果找到了@符号
      if (atPosition !== -1) {
        // 计算从@到光标位置的文本
        let result = '';
        let foundAt = false;
        let currentPos = 0;

        const traverseForward = (node: Node): void => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent || '';
            for (let i = 0; i < text.length; i++) {
              if (currentPos === atPosition) {
                foundAt = true;
              }
              if (foundAt) {
                result += text[i];
              }
              currentPos++;
              if (currentPos === cursorPosition) {
                return;
              }
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            for (let i = 0; i < node.childNodes.length; i++) {
              traverseForward(node.childNodes[i]);
              if (currentPos === cursorPosition) {
                return;
              }
            }
          }
        };

        traverseForward(editor);
        return result;
      }

      return '';
    };
    // 处理编辑器输入
    const handleInput = () => {
      const editor = editorRef.current;
      if (!editor) return;

      const text = editor.innerText || '';

      // 如果内容为空且没有焦点，显示placeholder
      if (text === '' && !isFocused) {
        editor.innerText = placeholder.text;
        editor.style.color = placeholder.color;
        return;
      }

      // 如果内容不为空且等于placeholder，清空placeholder
      if (text === placeholder.text) {
        editor.innerText = '';
        editor.style.color = placeholder.color;
      }

      const selection = window.getSelection();
      if (!selection) return;
      const range = selection.getRangeAt(0);
      const { text: text2, cursorPosition: cursorPosition2 } =
        getTextAndCursorPosition();
      console.log('text2', text2);
      console.log('cursorPosition2', cursorPosition2);
      setCurrentPosition(cursorPosition2);

      // 检查文本长度是否超过最大限制
      if (text2.length > maxLength) {
        alert(`超过最大长度限制 ${maxLength} 个字符`);
        // 截取到最大长度
        const truncatedText = text2.substring(0, maxLength);
        editor.innerText = truncatedText;
        setTextContent(truncatedText);
        return;
      }

      setTextContent(text2);
      // 计算真实的光标位置
      let cursorPosition = 0;
      let node = editor.firstChild;
      while (node) {
        if (node === range.startContainer) {
          cursorPosition += range.startOffset;
          break;
        }
        if (node.nodeType === Node.TEXT_NODE) {
          cursorPosition += node.textContent?.length || 0;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // 如果是a标签，计算其文本长度
          if ((node as HTMLElement).tagName.toLowerCase() === 'a') {
            cursorPosition += node.textContent?.length || 0;
          }
        }
        node = node.nextSibling;
      }

      console.log('handleInput=text', text);
      console.log('cursorPosition', cursorPosition);
      // 检查光标是否在a标签内
      let isInsideATag = false;
      let currentNode = range.startContainer;
      while (currentNode && currentNode !== editor) {
        if (currentNode.nodeName === 'A') {
          isInsideATag = true;
          break;
        }
        currentNode = currentNode.parentNode;
      }

      // 如果光标在a标签内，不显示提及列表
      if (isInsideATag) {
        setShowMentions(false);
        return;
      }

      // 检查光标前一个字符是否为@，且不在a标签内
      if (cursorPosition > 0 && text[cursorPosition - 1] === '@') {
        console.log('cursorPosition', cursorPosition);
        // 检查@符号是否在a标签内
        let atNode = range.startContainer;
        let atOffset = cursorPosition - 1;
        let isAtInsideATag = false;

        // 如果@在文本节点内
        if (atNode.nodeType === Node.TEXT_NODE) {
          let parent = atNode.parentNode;
          while (parent && parent !== editor) {
            if (parent.nodeName === 'A') {
              isAtInsideATag = true;
              break;
            }
            parent = parent.parentNode;
          }
        }

        if (!isAtInsideATag) {
          const rect = range.getBoundingClientRect();
          const editorRect = editor.getBoundingClientRect();
          let top = 0;
          let left = 0;

          switch (position) {
            case 'top':
              top = rect.top + window.scrollY - 5 - 200; // 减去列表高度
              left = rect.left + window.scrollX;
              break;
            case 'bottom':
              top = rect.top + window.scrollY + 20;
              left = rect.left + window.scrollX;
              break;
            case 'left':
              top = rect.top + window.scrollY;
              left = rect.left + window.scrollX - 260; // 减去列表宽度
              break;
            case 'right':
              top = rect.top + window.scrollY;
              left = rect.left + window.scrollX + 20;
              break;
            default:
              top = rect.top + window.scrollY + 20;
              left = rect.left + window.scrollX;
          }

          // 确保列表不会超出视口
          const listWidth = 250;
          const listHeight = 200;
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;

          // 水平方向调整
          if (left + listWidth > viewportWidth) {
            left = viewportWidth - listWidth - 10;
          }
          if (left < 0) {
            left = 10;
          }

          // 垂直方向调整
          if (top + listHeight > viewportHeight + window.scrollY) {
            top = viewportHeight + window.scrollY - listHeight - 10;
          }
          if (top < window.scrollY) {
            top = window.scrollY + 10;
          }

          setMentionPosition({ top, left });
          setShowMentions(true);
          setMentionSearch('');
          setSelectedIndex(0);
          return;
        }
      }
      // 检测是否正在输入@后的内容
      console.log('handleInput-text', text);
      console.log(
        'getLengthAfterLastAt:',
        getLengthAfterLastAt(text, cursorPosition)
      );
      const atIndex = text.lastIndexOf('@');
      console.log('cursorPosition', cursorPosition);
      console.log('atIndex', atIndex);
      const searchKey = getSearchKey(text, cursorPosition);
      console.log('searchKey', searchKey);
      if (searchKey) {
        setMentionSearch(searchKey);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    };
    useEffect(() => {
      if (defaultMentions) {
        setMentions(defaultMentions);
        replaceMentionsWithSpans(textContent);
      }
    }, [defaultMentions]);
    const toDetail = (id: string) => {
      console.log('id', id);
      tagClick?.(id);
      // setSelectedUser(users.find((u) => u.id === id));
    };

    // 将toDetail函数暴露到window对象
    useEffect(() => {
      window.toDetail = (element: HTMLElement) => {
        const userId = element.dataset.userId;
        if (userId) {
          toDetail(userId);
        }
      };
      return () => {
        delete window.toDetail;
      };
    }, []);

    const replaceMentionsWithSpans = (input: string) => {
      // 创建一个正则表达式，匹配所有需要替换的提及
      const regex = new RegExp(
        `(${(mentions || []).map((m) => `\\${m}`).join('|')})`,
        'g'
      );
      // 替换匹配的提及为a标签
      return input.replace(regex, (match: string) => {
        // 从匹配的文本中提取用户名
        const userName = match.substring(1); // 移除@符号
        // 查找对应的用户对象
        const user = options.find((u) => u.name === userName);

        if (user) {
          return `<a 
          contenteditable="false" 
          class="mention-tag" 
          data-user-id="${user[UserKey]}"
          onclick="window.toDetail(this)"
        >${match}</a>`;
        }
        return match;
      });
    };

    // 获取当前提及数量
    const getCurrentMentionsCount = () => {
      const editor = editorRef.current;
      if (!editor) return 0;
      return editor.querySelectorAll('.mention-tag').length;
    };

    // 插入提及
    const insertMention = (user: User) => {
      console.log('insertMention-user', user);
      const editor = editorRef.current;
      if (!editor) return;

      // 检查是否超过最大提及数量
      const currentMentionsCount = getCurrentMentionsCount();
      if (currentMentionsCount >= maxMentions) {
        onErrors?.(2);
        setShowMentions(false);
        return;
      }

      const text = editor.innerText || '';
      console.log('insertMention', text);
      console.log(
        'getLengthAfterLastAt.length',
        getLengthAfterLastAt(text, currentPosition)
      );
      // 检查插入提及后的文本长度是否超过最大限制
      const mentionText = `@${user.name}`;
      const AtTextLength = getLengthAfterLastAt(text, currentPosition);
      console.log('bb', text.substring(0, currentPosition - AtTextLength));
      const newText =
        text.substring(0, currentPosition - AtTextLength) +
        mentionText +
        text.substring(currentPosition) +
        ' ';
      console.log('newText', newText);

      console.log('currentPosition', currentPosition);
      console.log('前', text.substring(0, currentPosition - AtTextLength));
      console.log('mentionText', mentionText);
      console.log('后', text.substring(currentPosition));
      if (newText.length > maxLength) {
        onErrors?.(1);
        return;
      }
      setTextContent(text);
      // 123@
      // const atIndex = text.lastIndexOf('@');
      // console.log('insertMention-atIndex', atIndex);
      let atIndex = -1;
      for (let i = text.length - 1; i >= 0; i--) {
        if (text[i] === '@') {
          // 检查@是否在a标签内
          let isAtInsideATag = false;
          let node = editor.firstChild;
          if (!node) return;
          let currentPos = 0;

          while (node) {
            if (node.nodeType === Node.TEXT_NODE) {
              if (currentPos <= i && i < currentPos + node.textContent.length) {
                let parent = node.parentNode;
                while (parent && parent !== editor) {
                  if (parent.nodeName === 'A') {
                    isAtInsideATag = true;
                    break;
                  }
                  parent = parent.parentNode;
                }
                break;
              }
              currentPos += node.textContent.length;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName.toLowerCase() === 'a') {
                currentPos += node.textContent.length;
              }
            }
            node = node.nextSibling;
          }

          if (!isAtInsideATag) {
            atIndex = i;
            break;
          }
        }
      }
      console.log('insertMention-atIndex-光标位置', atIndex);
      if (atIndex !== -1) {
        // 保存选区
        const selection = window.getSelection();
        if (!selection) return;
        const range = selection.getRangeAt(0);
        // 创建不可编辑的提及标签
        const mention = document.createElement('a');
        mention.contentEditable = 'false';
        mention.className = 'mention-tag';
        mention.dataset.userId = user[UserKey];
        mention.textContent = `@${user.name}`;

        const cursorPosition = range.startOffset;
        console.log('cursorPosition', cursorPosition);
        // 替换@及其后内容
        console.log(
          'getLengthAfterLastAt(text)',
          getLengthAfterLastAt(text, cursorPosition)
        );
        console.log('text', text);
        console.log('atIndex', atIndex);
        const beforeText = text.substring(0, currentPosition - AtTextLength);
        console.log('beforeText', beforeText);
        const afterText = text.substring(currentPosition);
        console.log('afterText', afterText);
        // 重新设置内容
        editor.innerHTML = '';
        editor.appendChild(document.createTextNode(beforeText));
        editor.appendChild(mention);
        editor.appendChild(document.createTextNode(afterText + ' '));

        // 更新评论内容
        console.log('editor.innerText', editor.innerText);
        const result = replaceMentionsWithSpans(editor.innerText);
        editor.innerHTML = result;
        const { text: text2, cursorPosition: cursorPosition2 } =
          getTextAndCursorPosition();
        setCurrentPosition(cursorPosition2);
        setTextContent(text2);
        // 恢复光标位置
        const newRange = document.createRange();
        newRange.setStartAfter(editor.lastChild);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }

      setShowMentions(false);
    };
    const handleKeyDown = (e) => {
      if (!showMentions) return;
      // 上箭头
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(0, prev - 1));
        scrollToSelected();
        return;
      }
      // 下箭头
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          Math.min(filteredUsers.length - 1, prev + 1)
        );
        scrollToSelected();
        return;
      }

      // 回车选择
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredUsers[selectedIndex]) {
          insertMention(filteredUsers[selectedIndex]);
        }
        return;
      }
      // ESC关闭
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentions(false);
        return;
      }
    };

    // 滚动到选中的用户
    const scrollToSelected = () => {
      if (mentionsListRef.current && filteredUsers.length > 0) {
        const selectedItem = mentionsListRef.current.children[selectedIndex];
        if (selectedItem) {
          selectedItem.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      }
    };

    // 点击外部关闭
    useEffect(() => {
      const handleClickOutside = (e) => {
        if (
          editorRef.current &&
          !editorRef.current.contains(e.target) &&
          mentionsListRef.current &&
          !mentionsListRef.current.contains(e.target)
        ) {
          setShowMentions(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 获取所有文本内容
    const getAllTextContent = () => {
      return textContent;
    };
    const getTextAndCursorPosition = () => {
      const editor = editorRef.current;
      if (!editor) return { text: '', cursorPosition: 0 };

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0)
        return { text: '', cursorPosition: 0 };

      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editor);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      const cursorPosition = preCaretRange.toString().length;
      const text = editor.textContent || '';

      return { text, cursorPosition };
    };

    // 清空内容方法
    const clearContainerContent = () => {
      // 清空编辑器内容
      const editor = editorRef.current;
      if (editor) {
        editor.innerText = placeholder.text;
        editor.style.color = placeholder.color;
      }
      // 关闭提及列表
      setShowMentions(false);
    };
    const getAllHTMLContent = () => {
      return editorRef.current?.innerHTML || '';
    };

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      getAllTextContent,
      getAllHTMLContent,
      clearContainerContent,
      getTextAndCursorPosition,
    }));

    return (
      <div className="suy-mentions-container" style={style}>
        <div
          ref={editorRef}
          className="mention-editor"
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          data-placeholder={placeholder.text}
        ></div>
        {showMentions && (
          <div
            ref={mentionsListRef}
            className="mentions-list"
            style={{
              top: `${mentionPosition.top}px`,
              left: `${mentionPosition.left}px`,
            }}
          >
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <div
                  key={user.id}
                  className={`mention-item ${
                    index === selectedIndex ? 'selected' : ''
                  }`}
                  onClick={() => insertMention(user)}
                >
                  <div className="mention-avatar">{user.name.charAt(0)}</div>
                  <div className="mention-info">
                    <div className="mention-name">{user.name}</div>
                    <div className="mention-email">{user.email}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="mention-empty">没有匹配的用户</div>
            )}
          </div>
        )}
        {/* <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} /> */}
      </div>
    );
  }
);

MentionsEditor.displayName = 'MentionsEditor';

export default MentionsEditor;
