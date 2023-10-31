
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import OnChangePlugin from '@lexical/react/LexicalOnChangePlugin'
import {useEffect, useState} from 'react';
export default function RestorePlugin({state}) {
    const [editor] = useLexicalComposerContext()
   
    if(state !== null){
        const editorState = editor.parseEditorState(state);
        editor.setEditorState(editorState);
    }

    // return <button onClick={update}>Add a node</button>;
    return <></>;
    
  }