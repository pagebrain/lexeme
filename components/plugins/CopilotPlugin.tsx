
import { ChatHistory, Message, TasksMap, TaskType, Tasks, Setting, ActionIconMap } from "@/types/data";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import {
    $getRoot,
  $getSelection,
  SELECTION_CHANGE_COMMAND,
  $isRangeSelection,
  $setSelection,
  $createRangeSelection,
  $createParagraphNode,
  $createTextNode
} from "lexical";


import {
  $convertFromMarkdownString,
  TRANSFORMERS
} from "@lexical/markdown";

import {useEffect, useRef, useState} from 'react';
import ReactMarkdown from 'react-markdown'
import {HiSparkles, HiUser} from 'react-icons/hi2';
import {FiMoreHorizontal, FiSend} from 'react-icons/fi';


import Markdown from "../Markdown/Markdown";


function ChatMessage({msg, addText}){
  let className = "p-2 my-2 rounded flex"
  if(msg.role == 'assistant'){
    className += " hover:bg-gray-200 cursor-pointer"
  }
  return <div key={msg.key} 
      className={className} onClick={msg.role == 'assistant' ? () => addText(msg.content) : undefined }>
      <div className="mr-2">
        {msg.role == 'assistant' && <HiSparkles size="1.2rem" className=" text-gray-400"/>}
        {msg.role == 'user' && <HiUser size="1.2rem" className=" text-gray-400"/>}
      </div>
      <Markdown content={msg.content}/>
  </div>
}


// {
  // if(msg.role == 'user'){
  //   return <div key={j} className="p-2 my-2 rounded flex">
  //     <div className="mr-2">
  //       <HiUser size="1.2rem" className=" text-gray-400"/>
  //     </div><ReactMarkdown className="markdown">{msg.content}</ReactMarkdown></div>
  // }else{
  //   return <div key={j} className="p-2 my-2 rounded flex hover:bg-gray-200 cursor-pointer" onClick={()=>addText(msg.content)}>
  //     <div className="mr-2">
  //       <HiSparkles size="1.2rem" className=" text-gray-400"/>
  //     </div>
  //     <ReactMarkdown className="markdown">{msg.content}</ReactMarkdown>
  //     </div>
  // }

function Conversation ({item, index, onChatUpdate, addText, setting}){
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<String>("");
  const [started, setStarted] = useState<boolean>(false);

  const stopConversationRef = useRef<boolean>(false);

  const firstRunRef = useRef<boolean>(false);

  const [chat, setChat] = useState<ChatHistory>(item);

  const [initial, setInitial] = useState<boolean>(false);
  const [reply, setReply] = useState<string>('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

    // console.log("Conversation", item.id, item.task, item.messages)
    async function inference(task, selection){
      if(loading){
        return
      }
      setLoading(true);

  
      // const prompt = question
      const controller = new AbortController();
      const response = await fetch("/lexeme/api/writer2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({...item, apiKey: setting.apiKey}),
      });
  
      if (!response.ok) {
        setLoading(false);
        // setMessageError(true);
        alert(response.statusText);
      }
  
      const data = response.body;
      if (!data) {
        setLoading(false);
        // setMessageError(true);
        return;
      }
      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let text = '';

      console.log(item.messages)
  
      while (!done) {
        console.log("stopConversation", stopConversationRef.current)
        if (stopConversationRef.current === true) {
          console.log("Aborting")
          controller.abort();
          done = true;
          break;
        }
  
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        text += chunkValue;
        setAnswer(text);
      }
      onChatUpdate(item.id, "assistant", text)
      setLoading(false);
      setAnswer("");
    };

    useEffect(() => {
      console.log("Copilot useEffect", item.id, firstRunRef.current)
      // automatically run on creation of new chat
      async function infer(){
        console.log("infer", item.id, item.messages, item.selection)
        if(item.messages.length == 2 && item.selection.trim() !== ""){
          firstRunRef.current = true;
          await inference(item.task, item.selection)
      }
    }
    console.log("firstRunRef.current", firstRunRef.current)
    if(firstRunRef.current === false){
      infer()
      console.log("RAN", firstRunRef.current)
    }

    }, []);



    // const renderIcon = () => {
    //   const Icon = task.icon;
    //   return (<div className="flex p-2"><Icon size="1.2rem" className="mr-2 text-gray-400" />{task.description}</div>);
    // };

    const renderIcon = (task_id) => {
      let task;
      for (let i = 0; i < setting.actionPrompts.length; i++) {
        const t = setting.actionPrompts[i];
        if(t.id == task_id){
          task = t
          break
        }
      }
      
      let icon = task.id
      if(!ActionIconMap.hasOwnProperty(task.id)){
        icon = 'custom'
      }
      const Icon = ActionIconMap[icon];
      return (<div className="flex p-2"><Icon size="1.2rem" className="mr-2 text-gray-400" />{task.name}</div>);
    };


  const isMobile = () => {
    const userAgent =
      typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
    const mobileRegex =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
    return mobileRegex.test(userAgent);
  };


    useEffect(() => {
      if (textAreaRef && textAreaRef.current) {
        if(reply == ""){
          return
        }
        // We need to reset the height momentarily to get the correct scrollHeight for the textarea
        textAreaRef.current.style.height = "0px";
        const scrollHeight = textAreaRef.current.scrollHeight;
  
        // We then set the height directly, outside of the render loop
        // Trying to set this with state or a ref will product an incorrect value.
        textAreaRef.current.style.height = scrollHeight + "px";
      }
    }, [textAreaRef.current, reply]);

  return (<div key={index} className="p-2 mb-4 hover:bg-gray-100 text-gray-500 hover:text-gray-900 bg-gray-50 rounded">
      
      {renderIcon(item.task)}
      
      <div className="p-2 mb-2 border-b-0"><Markdown content={item.selection}/></div>
      {item.messages.slice(2).map((msg: Message, j) => <ChatMessage key={j} msg={msg} addText={addText}/>)}
      {((loading && answer == "") || answer) && <div className="p-2 my-2 rounded flex">
        <div className="mr-2">
          <HiSparkles size="1.2rem" className="text-gray-400"/>
        </div>
        {answer && <Markdown content={answer}/>}
        {loading && answer == "" && <FiMoreHorizontal size="1.2rem" className='animate-pulse'/>}
      </div>}

      <div className="relative flex w-full flex-grow flex-col rounded-md  bg-white">


      <textarea className="rounded outline-none p-2 w-full" 
      placeholder="Type message..."
      ref={textAreaRef}
      rows={1}
      value={reply} 
      onChange={(e) => setReply(e.target.value)} 
      onKeyDown={async (e) => {
        if (e.key === 'Enter' && !isMobile() && !e.shiftKey) {
          e.preventDefault();
          console.log('do validate');
          onChatUpdate(item.id, "user", reply)
          setReply('')
          const txt = await inference(item.task, reply)
          return;
        }
  }}/>
          <button
            className="absolute right-2 top-2 rounded-sm p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-900 opacity-60"
           onClick={async (e) => {
            onChatUpdate(item.id, "user", reply)
            setReply('')
            const txt = await inference(item.task, reply)
            return;
           }}
          >
            <FiSend  size="1.2rem" />
          </button>
            </div>
    </div>
  )
}

export default function CopilotPlugin({setting, history, onChatUpdate}) {
    const [editor] = useLexicalComposerContext();
    console.log("CopilotPlugin", history)
    /*function update() {
        editor.update(() => {
          const root = $getRoot();
          // const p = $createParagraphNode();
          // p.append($createTextNode("new node"));
          // root.append(p);
    
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;
          if (selection) {
            console.log(selection.getTextContent());
          //   const txt = "SAMPLE";
            const txt = await copilot("expand", selection.getTextContent())
            selection.insertText(txt);
            // selection.getNodes()[0].setTextContent("HELLO")
            console.log(selection.getNodes());
            console.log("START", selection.anchor.key, selection.anchor.offset);
            console.log("END", selection.focus.key, selection.focus.offset);
            const rangeSelection = $createRangeSelection();
            const startKey = selection.anchor;
            const endKey = selection.focus;
            rangeSelection.focus.set(
              startKey.key,
              startKey.offset - txt.length,
              "text"
            );
            rangeSelection.anchor.set(endKey.key, endKey.offset, "text");
            $setSelection(rangeSelection);
          }
        });
      }*/


    // async function copilot(task, selection){
    //     const response = await fetch(`/api/writer`, {
    //         headers: {
    //         'Content-Type': 'application/json',
    //         },
    //         method: 'POST',
    //         body: JSON.stringify({task, selection, before:"", after:""}),
    //     });
    //     console.log(response.body)
    //     const data = await response.json();
    //     console.log("INPUT:", selection)
    //     console.log("OUTPUT:", data.message.content)
    //     return data.message.content;
    // };

    //https://stackoverflow.com/questions/75177766/is-there-a-way-to-make-an-async-request-inside-a-lexical-editor-update-in-react
    // async function update(task: TaskType) {
    //     const textContent = editor.getEditorState().read(() => $getSelection()?.getTextContent());
    //     if(textContent === ""){
    //         return;
    //     }
    //     const txt = await copilot(task, textContent)
    //   editor.update(() => {
    //     const selection = $getSelection()
    //     if (!$isRangeSelection(selection)) return;
    //     if(selection){
    //       selection.insertText(txt);
    //       console.log(selection.getNodes());
    //       console.log("START", selection.anchor.key, selection.anchor.offset);
    //       console.log("END", selection.focus.key, selection.focus.offset);
    //       const rangeSelection = $createRangeSelection();
    //       const startKey = selection.anchor;
    //       const endKey = selection.focus;
    //       rangeSelection.focus.set(
    //         startKey.key,
    //         startKey.offset - txt.length,
    //         "text"
    //       );
    //       rangeSelection.anchor.set(endKey.key, endKey.offset, "text");
    //       $setSelection(rangeSelection);
    //     }
    //   });
    // }
  
    // SELECTION_CHANGE_COMMAND fires when selection changes within a Lexical editor.
    // editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
    //   const selection = $getSelection();
    // });
  
    // return <button onClick={update}>Add a node</button>;


    const addText = (text:string) => {
      editor.update(() => {
        const root = $getRoot();
        const paragraphNode = $createParagraphNode();
        // const textNode = $createTextNode(text);
        // paragraphNode.append(textNode);
        root.append(paragraphNode);
        $convertFromMarkdownString(text, TRANSFORMERS, paragraphNode);
        root.append($createParagraphNode());
        console.log("UPDATING")
      });

    }

    // const _handleKeyDown = (e) => {
    //   if (e.key === 'Enter') {
    //     console.log('do validate');

    //   }
    // }


    return <>
    {history.map((item: ChatHistory, index) => (
    <Conversation setting={setting} key={item.id} item={item} addText={addText} onChatUpdate={onChatUpdate}/>
    ))}
  </>;
    
  }