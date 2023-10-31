import { Setting, DefaultSetting, DefaultActions, Action} from '@/types/data';
import { getSettings } from '@/components/utils/settings';

import { useEffect, useContext, useState } from 'react';
import { FiFile, FiGlobe, FiZap } from 'react-icons/fi';
import { nanoid } from 'nanoid'

export default function Prompts({ setIsOpen, docPrompt, setDocPrompt, setting, setSetting, onSaveDocPrompt }) {
    const [error, setError] = useState(null);

    const [tab, setTab] = useState("doc")
    console.log("actionRPTMT", setting.actionPrompts)
    // if(!setting.actionPrompts){
    //     setSetting((setting) => ({
    //         ...setting,
    //         actionPrompts: DefaultActions
    //     }))
    // }

    const [actionIndex, setActionIndex] = useState(0);
    // const [actionPrompt, setActionPrompt] = useState<Action>(setting.actionPrompts[actionIndex]);


    function handleChange(e) {
        console.log(e.target.name, e.target.value)
        setSetting((setting) => ({
            ...setting,
            [e.target.name]: e.target.value
        }))
    }

    function handleAPChange(e) {
        // console.log(actionPrompt, e.target.name, e.target.value)
        // setActionPrompt((actionPrompt) => ({
        //     ...actionPrompt,
        //     [e.target.name]: e.target.value
        // }))
        const aps : Action[] = [...setting.actionPrompts]
        aps[actionIndex][e.target.name] = e.target.value
        console.log("a[s", aps)
        setSetting((setting) => ({
            ...setting,
            actionPrompts: aps
        }))
        // let newValue = [...this.props[item].slice(0, index), value, ...this.props[item].slice(index + 1)];
    }

    const onSave = (e) => {
        if(tab === 'doc'){
            onSaveDocPrompt(docPrompt)
        }else{
            if(tab === 'action'){

            }
            localStorage.setItem("settings", JSON.stringify(setting))
        }
        console.log("Saved Settings")
        setIsOpen(false)
    };


    const onCreateAction = () => {
        const ap: Action = {id: nanoid(), name: "", prompt: ""}
        const _aps: Action[] = [...setting.actionPrompts, ap]
        setSetting({...setting, actionPrompts: _aps})
        setActionIndex(_aps.length-1)
        console.log("created", ap.id)
      }

    function tabClass(current, active){
        let c = 'px-3 py-2 flex cursor-pointer items-center rounded-md group-hover:bg-gray-200 after:absolute after:bottom-0 after:right-3 after:left-3 after:h-0.5 after:bg-blue-600'
        if(current == active){
            c += ' text-blue-600 after:visible'
        }else{
            c += ' text-gray-600 group-hover:text-gray-800 after:invisible'
        }
    
        return c
    }
    
    function menuClass(current, active){
        let className = 'px-4 py-2 p-3 rounded-md cursor-pointer break-all '
        if(current == active){
            className += 'text-blue-900 bg-blue-100'
        }else{
            className += 'text-gray-900 hover:bg-gray-100'
        }
        return className
    }

    // function menuClass(current, active){
    //     let c = 'px-3 py-2 flex items-center rounded-md group-hover:bg-gray-200 after:absolute after:bottom-0 after:right-3 after:left-3 after:h-0.5 after:bg-blue-600'
    //     if(current == active){
    //         c += ' text-blue-600 after:visible'
    //     }else{
    //         c += ' text-gray-600 group-hover:text-gray-800 after:invisible'
    //     }
    
    //     return c
    // }

    return <div className=''>
        {error && <div className='text-red-700 py-4'>{error}</div>}
        


        <div className="navigation flex items-center overflow-auto left-1 relative container mb-4">
            <div className="whitespace-nowrap py-2 group relative">
                <div className={tabClass('global', tab)} onClick={(e) => setTab('global')}>
                    <FiGlobe width="1.125em" height="1.125em" className='mr-2 hidden sm:inline-block'/>
                    <div className="navigation-link">Global</div>
                </div>
            </div>
            <div className="whitespace-nowrap py-2 group relative">
                <div className={tabClass('doc', tab)} onClick={(e) => setTab('doc')}>
                    <FiFile width="1.125em" height="1.125em" className='mr-2 hidden sm:inline-block'/>
                    <div className="navigation-link">Document</div>
                </div>
            </div>
            <div className="whitespace-nowrap py-2 group relative">
                <div className={tabClass('action', tab)} onClick={(e) => setTab('action')}>
                    <FiZap width="1.125em" height="1.125em" className='mr-2 hidden sm:inline-block'/>
                    <div className="navigation-link">Action</div>
                </div>
            </div>
        </div>

        {tab == "doc" &&
        <div className="flex flex-col">
            <textarea id="docPrompt" name="docPrompt" className='textarea' placeholder='Enter document prompt' rows="8" value={docPrompt} onChange={(e) => setDocPrompt(e.target.value)}></textarea>
        </div>
        }

        {tab == "global" &&
        <div className="flex flex-col">
            <textarea id="globalPrompt" name="globalPrompt" className='textarea' placeholder='Enter global prompt' rows="8" value={setting.globalPrompt} onChange={handleChange}></textarea>
        </div>
        }

        {tab == "action" &&
        <div className='flex mt-2'>
        <ul className='w-1/4 mr-6'>
            {setting.actionPrompts.map((v, i) => {
            return <li key={i} className={menuClass(v.id, setting.actionPrompts[actionIndex].id)} onClick={(e) => { setActionIndex(i) }}>
                {v.name}
            </li>
            })}

        <li className='rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-graylue-900 hover:bg-blue-200 hover:text-blue-900 cursor-pointer mt-6' onClick={onCreateAction}>Create custom action</li>
        </ul>
        <div className='w-3/4'>
            <label for="name" className="text-left text-gray-700">Name</label>
            <input id="name" name='name' className='input' value={setting.actionPrompts[actionIndex].name} onChange={handleAPChange}/>
            <label for="prompt" className="text-left text-gray-700 mt-2">Action Prompt</label>
            <textarea id="prompt" name='prompt' className='textarea' placeholder='Enter action prompt' rows="8" value={setting.actionPrompts[actionIndex].prompt} onChange={handleAPChange}/>
        </div>
        </div>
        }

        <button
            onClick={onSave}
            className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            disabled={error != null}
        >
            Save
        </button>
    </div>
}