import ExampleTheme from "../components/plugins/Theme";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import ToolbarPlugin from "../components/plugins/ToolbarPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import ActionsPlugin from "../components/plugins/ActionsPlugin";
import CodeHighlightPlugin from "../components/plugins/CodeHighlightPlugin";
import prepopulatedText from "../components/plugins/SampleText";
import CopilotPlugin from "../components/plugins/CopilotPlugin";
import DraggableBlockPlugin from '../components/plugins/DraggableBlockPlugin';
import {useEffect, useRef, useState} from 'react';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { Role, ChatHistory, Message, Doc, DefaultSetting, Setting, Action, DefaultActions } from "@/types/data";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import type {EditorState, LexicalEditor} from 'lexical';
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import RestorePlugin from "../components/plugins/RestorePlugin";
import {FiBook, FiDownload, FiMenu, FiMessageSquare, FiSettings, FiUpload, FiX} from 'react-icons/fi'

import { useMediaQuery } from 'react-responsive'
import Link from "next/link";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Prompts from "@/components/prompts";
import Settings from "@/components/settings";
import Modal from "@/components/modal";
import { nanoid } from 'nanoid'


export function getSavedSettings() : Setting {
    let prevSettings: Setting = DefaultSetting;
    let _setting = localStorage.getItem('settings')
    if(_setting){
        prevSettings = JSON.parse(_setting) as Setting;
        // if(prevSettings.actionPrompts === undefined){
        //     prevSettings.actionPrompts = DefaultActions
        // }
    }
    console.log("GET SETTING", prevSettings)
    return prevSettings;
}


function Placeholder() {
  return (
    <div className="editor-placeholder">
      Type something...
    </div>
  );
}

interface DocIndex {
  id: string;
  title:  string;
}


function toggleClass(condition:boolean, mobileClass:string, desktopClass:string){
  if(condition){
    return mobileClass
  }else{
    return desktopClass
  }
}



function Editor({editorState, onCreateChat, onChange, dtitle, history, onChatUpdate, onTitleChange, isChatOpen, setIsChatOpen, isMobile, setIsPromptsOpen, setting}) {

  const [title, setTitle] = useState<string>(dtitle)
  const [floatingAnchorElem, setFloatingAnchorElem] =useState<HTMLDivElement | null>(null);

  // console.log("REINITIALIZED", editorConfig)

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
      if (_floatingAnchorElem !== null) {
        setFloatingAnchorElem(_floatingAnchorElem);
      }
    };

  const editorConfig = {
    editorState: editorState,
    theme: ExampleTheme,
    // Handling of errors during update
    onError(error) {
      throw error;
    },
    // Any custom nodes go here
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode
    ]
  };
 
  return (
    <div className="w-full flex">
    <LexicalComposer initialConfig={editorConfig}>
    <PanelGroup direction="horizontal">
       <Panel className="editor-inner w-full lg:w-3/5 p-4">

      <div className="editor-container  min-h-full">
        
        <ToolbarPlugin setting={setting} onCreateChat={onCreateChat} setIsChatOpen={setIsChatOpen} isMobile={isMobile} setIsPromptsOpen={setIsPromptsOpen}/>
        <input className="flex px-4 w-full text-4xl outline-none" contentEditable="true" placeholder="Untitled" value={title} onChange={e => {setTitle(e.target.value); onTitleChange(e.target.value);}}></input>
        <div className="">
       
        <RichTextPlugin
              contentEditable={
                <div className="editor-scroller">
                  <div className="editor" ref={onRef}>
                    <ContentEditable className="editor-contenteditable min-h-full" />
                  </div>
                </div>
              }
              placeholder={<Placeholder/>}
              ErrorBoundary={LexicalErrorBoundary}
            />
          <AutoFocusPlugin />
          <ListPlugin />
          <LinkPlugin />
          <HistoryPlugin />
          {/* <DraggableBlockPlugin anchorElem={floatingAnchorElem} /> */}
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <CodeHighlightPlugin />
          <OnChangePlugin onChange={onChange} ignoreSelectionChange={true}/>
          {/* <RestorePlugin state={currentDoc.data}/> */}
        </div>
        <ActionsPlugin />
        </div>
      </Panel>
      <PanelResizeHandle className="w-1 bg-gray-50" />
      <Panel className={isChatOpen ? "p-4 bg-white h-screen z-1 absolute w-full" : "hidden lg:block lg:p-4 lg:w-2/5 lg:overflow-scroll lg:h-screen"} style={{overflow: 'auto'}}>
      <CopilotPlugin setting={setting} history={history} onChatUpdate={onChatUpdate}/>
      </Panel>
      </PanelGroup>
    </LexicalComposer>
    </div>
  );
}

export default function App(){
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const defaultData: string = '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}'
  const [editorState, setEditorState] = useState<string>(defaultData)
  const [docs, setDocs] = useState<DocIndex[]>([]);

  let [isSettingsOpen, setIsSettingsOpen] = useState(false)
  let [isPromptsOpen, setIsPromptsOpen] = useState(false)

  const [isNavOpen, setIsNavOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  // const [isMobile, setIsMobile] = useState<boolean>(true);

  const isMobile = useMediaQuery({ query: '(max-width: 1024px)' })

  const [docPrompt, setDocPrompt] = useState<string>("");
  const [setting, setSetting] = useState<Setting>(DefaultSetting);
  const [currentDoc, setCurrentDoc] = useState<Doc | null>(null);
  
  useEffect(() => {
      if(currentDoc === null){
        const docId = localStorage.getItem("selectedDocId")
        if(docId === undefined || docId === null){
          onCreateDoc()
          console.log("Creating new doc")
        }else{
          onSelectDoc(docId)
          console.log("Loading doc", docId, currentDoc)
          // setSerializedEditorState(doc.data)
        }
  
        const _docs = localStorage.getItem("docs")
        if(_docs){
          setDocs(JSON.parse(_docs))
        }
      }

    }, [])


  const onChatUpdate = (id:string, role:Role, response:string) => {
    let _history = []
    for (let i = 0; i < history.length; i++) {
      const chat = history[i];
      if(chat.id == id){
        let c : ChatHistory = {...chat}
        console.log("OLD CHAT:", chat)
        c.messages.push({role: role, content: response} as Message)
        console.log("NEW CHAT:", c)
        _history.push(c)
      }else{
        _history.push(chat)
      }
    }
    setHistory(_history);
    saveDoc(editorState, _history)
    console.log("Saving history..", _history)
  };




  async function onCreateChat(task, content){
    // const setting = getSettings();
    let actionPrompt: Action;
    for (let i = 0; i < setting.actionPrompts.length; i++) {
      const ap : Action = setting.actionPrompts[i];
      if(ap.id == task){
        actionPrompt = ap
        break
      }
    }
    const messages = [
      {
        role: 'system',
        content: setting.globalPrompt + currentDoc.prompt + actionPrompt.prompt,
      },
      {
          role: "user",
          content: content
      }
    ]

    let chat: ChatHistory = {id: nanoid(), task, selection: content, messages: messages, modelId: setting.modelId, temperature: setting.temperature}
    console.log("NEW", task, content, chat)
    const _history = [chat, ...history]
    setHistory(_history);
    saveDoc(editorState, _history)
    console.log("onCreateChat saving", _history)
    // onChatUpdate(id)
  };


  const onChange = (editorState: EditorState) => {
      if(currentDoc){
        // localStorage.setItem("doc-"+currentDoc.id, JSON.stringify({...currentDoc, data: JSON.stringify(editorState.toJSON())}))
        // console.log("saved", "doc-"+currentDoc.id)
        const _editorState = JSON.stringify(editorState.toJSON())
        // const title = editorState.toJSON().root.children.filter(e => e.tag == "h1")[0]?.children[0]?.text
        setEditorState(_editorState)
        saveDoc(_editorState, history)
        console.log("Saving changes...", history)
      }
  }
  // const docToJson = (doc: Doc) => {
  //   return {id: doc.id, title: doc.title, data: doc.data, history: doc.history}
  // }
  const onCreateDoc = () => {
    const doc: Doc = {id: nanoid(), title: "Untitled", prompt: "", data: defaultData, history: [], createdAt: +new Date, updatedAt: +new Date}
    const _docs: DocIndex[] = [{id: "doc-"+doc.id, title: doc.title} as DocIndex, ...docs]
    setDocs(_docs);
    localStorage.setItem("docs", JSON.stringify(_docs))
    localStorage.setItem("doc-"+doc.id, JSON.stringify(doc))
    localStorage.setItem("selectedDocId", "doc-"+doc.id)
    setCurrentDoc(doc)
    setEditorState(doc.data)
    setHistory(doc.history)
    console.log("created", doc.id)
  }


  // useEffect(() => {
  //   localStorage.setItem("docs", JSON.stringify(docs))
  //   console.log("saving docs..")
  // }, [docs]);




  // useEffect(() => {
  //   if(currentDoc){
  //   }
  // }, [history]);


  const onSelectDoc = (docId: string) => {
    const prevSettings: Setting = getSavedSettings();
    setSetting(prevSettings)
    console.log("selectedDoc", docId)
    const doc = JSON.parse(localStorage.getItem(docId)) as Doc
    setCurrentDoc(doc)
    setEditorState(doc.data)
    setHistory(doc.history)
    setDocPrompt(doc.prompt)
    localStorage.setItem("selectedDocId", "doc-"+doc.id)
    setIsNavOpen(false)
  }

  const saveDoc = (_editorState, _history) => {
    const doc: Doc = {...currentDoc, data: _editorState, history: _history, updatedAt: +new Date}
    localStorage.setItem("doc-"+currentDoc.id, JSON.stringify(doc))
    console.log("saved", "doc-"+currentDoc.id)
  }


  const onSaveDocPrompt = (prompt) => {
    const doc: Doc = {...currentDoc, prompt}
    setCurrentDoc(doc)
    localStorage.setItem("doc-"+currentDoc.id, JSON.stringify(doc))
    console.log("saved", "doc-"+currentDoc.id)
  }


  const onTitleChange = (title) =>{
    console.log("TITLE",title)
    const doc: Doc = {...currentDoc, title}
    localStorage.setItem("doc-"+currentDoc.id, JSON.stringify(doc))
    console.log("saved", "doc-"+currentDoc.id)
    const _docs = docs.map(obj => {
      if(obj.id == "doc-"+currentDoc.id){
        return {...obj, title}
      }
      return obj
    })
    setDocs(_docs)
    localStorage.setItem("docs", JSON.stringify(_docs))
  }

  // Lifted from https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
  function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
  const onExport = (e) => {
    downloadObjectAsJson(localStorage, "lexeme-"+new Date().toISOString().replaceAll(':', '.'))
  }

  const onImport = (data) => {
    Object.keys(data).forEach(function (k) {
      localStorage.setItem(k, data[k]);
    });
    window.location.reload();
  }

  const onImportChange = (e) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      let json = JSON.parse(e.target?.result as string);
      onImport(json);
    };
    reader.readAsText(file);
  }

  const onMobileRightClick = (e) => {
    if(isNavOpen){
      setIsNavOpen(false);
    }else{
      setIsNavOpen(true);
    }
    console.log("Right CLICK", "isNavOpen:",isNavOpen, "isChatOpen:",isChatOpen)
  }

  const onMobileLeftClick = (e) => {
    if(isNavOpen){
      setIsNavOpen(false);
    }else if(isChatOpen){
      setIsChatOpen(false);
    }else{
      setIsChatOpen(true);
    }
    console.log("LEFT CLICK", "isNavOpen:",isNavOpen, "isChatOpen:",isChatOpen)
  }
    return (<div>
      <Modal title="Prompts" isOpen={isPromptsOpen} setIsOpen={setIsPromptsOpen}>
        <Prompts setIsOpen={setIsPromptsOpen} docPrompt={docPrompt} setDocPrompt={setDocPrompt} setting={setting} setSetting={setSetting} onSaveDocPrompt={onSaveDocPrompt}/>
      </Modal>
    <div className="sticky top-0 z-10 flex items-center border-b border-gray-200 pl-1 pt-1 bg-white text-gray-900 lg:pl-3 lg:hidden">
      <button type="button"  onClick={onMobileRightClick} className="-ml-0.5 -mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-md hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
        <span className="sr-only">Open sidebar</span>
        {(!isNavOpen && !isChatOpen) && <FiMenu size="1rem" className="h-6 w-6"/>}
      </button>
      <h1 className="flex-1 text-center text-base font-normal">Lexeme</h1>
      <button type="button" className="px-3" onClick={onMobileLeftClick}>
        {(isNavOpen || isChatOpen) && <FiX size="1rem" className="h-6 w-6"/>}
        {(!isNavOpen && !isChatOpen) && <FiMessageSquare size="1rem" className="h-6 w-6"/>}
      </button>
    </div>

    <div className="flex">
      <Modal title="Settings" isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen}>
        <Settings setIsOpen={setIsSettingsOpen} setting={setting} setSetting={setSetting}/>
      </Modal>

      {/* */}
    <div className={isNavOpen ? "w-full z-1 p-4 border-r border-gray-200" : "hidden lg:p-4 lg:flex lg:flex-col lg:w-1/5"}>
        <Link href="/"><h1 className="text-4xl font-semibold pb-2">Lexeme</h1></Link>
        {/* <p>SQL Workbench like editor for AI. Tired of starting new conversation for each thing you're writing?</p> */}
        <div className="pb-4">Workbench for ChatGPT</div>
        <a onClick={onCreateDoc} className="flex p-3 items-center gap-3 transition-colors duration-200 cursor-pointer rounded-md border border-gray-200 hover:bg-gray-200 mb-1 flex-shrink-0">
        New doc
        </a>
        <ol className="">
        {docs.map((item, i) => (
      <li key={item.id}>
        <a onClick={() => onSelectDoc(item.id)} className="flex p-3 gap-3 items-center relative group rounded-md cursor-pointer break-all text-gray-900 hover:bg-gray-100 ">
        {item.title}
            </a>
      </li>
    ))}
        </ol>

        <div className="flex-col flex-1 border-t border-white/2 pt-2 mt-2">
        <a onClick={onExport} className="flex p-3 gap-3 items-center relative group rounded-md cursor-pointer break-all text-gray-900 hover:bg-gray-100 ">
        <FiDownload/> Export
        </a>
        <input id="import-file" className="sr-only" tabindex="-1" type="file" accept=".json" onChange={onImportChange}/>
        <a onClick={() => {
          const importFile = document.querySelector(
            '#import-file',
          ) as HTMLInputElement;
          if (importFile) {
            importFile.click();
          }
        }} className="flex p-3 gap-3 items-center relative group rounded-md cursor-pointer break-all text-gray-900 hover:bg-gray-100 ">
        <FiUpload/> Import
        </a>
        <a onClick={(e) => setIsSettingsOpen(true)} className="flex p-3 gap-3 items-center relative group rounded-md cursor-pointer break-all text-gray-900 hover:bg-gray-100 ">
        <FiSettings/> Settings
        </a>
        
        </div>
    </div>

  {(currentDoc !== null && !isNavOpen) && 
  <Editor key={currentDoc.id} editorState={editorState} onCreateChat={onCreateChat} onChange={onChange} history={history} onChatUpdate={onChatUpdate} onTitleChange={onTitleChange} dtitle={currentDoc.title} isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} isMobile={isMobile} setIsPromptsOpen={setIsPromptsOpen} setting={setting}/>
  }

    </div>
  </div>);
}