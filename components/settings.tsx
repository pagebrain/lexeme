import { Setting, DefaultSetting } from '@/types/data';
import {getSettings} from '@/components/utils/settings';

import { useEffect, useContext, useState } from 'react';
export default function Settings({setIsOpen, setting, setSetting}) {

    const [models, setModels] = useState<string[]>();
    const [error, setError] = useState(null);

    useEffect(() => {
        changeAvailableModels()
      }, [])

    async function changeAvailableModels(){
        const response = await fetch("/lexeme/api/models", {
        method: 'POST',
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({key: setting.apiKey})
        })

        if (!response.ok) {
            // try {
            //   const data = await response.json();
            //   Object.assign(error, {
            //     code: data.code,
            //     messageLines: [data.message],
            //   });
            // } catch (e) {}
            // setModelError(error);
            setError("Invalid API Key")
            setModels(null)
            return;
        }else{
            setError(null)
        }
        setModels(await response.json())
    }

    function handleChange(e){
        // console.log(e.target.name, e.target.value)
        setSetting((setting) => ({
          ...setting,
          [e.target.name]: e.target.value
        }))
    }      

    const onSave = (e) => {
        localStorage.setItem("settings", JSON.stringify(setting))
        console.log("Saved Settings")
        setIsOpen(false)
    };
    return <div>
        <div className="flex flex-col">
            <label for="apiKey" className="text-left text-gray-700">OpenAI API Key</label>
            <input id="apiKey" name="apiKey" className='input' type='password' value={setting.apiKey} onChange={handleChange} onBlur={changeAvailableModels} placeholder='Leave empty to use environment variable' />
            <span className='text-sm text-gray-500'>If you don&apos;t have one, you can create it at <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noreferrer" className="hover:text-blue-500">openai.com</a></span>
        </div>
        {error && <div className='text-red-700 py-4'>{error}</div>}
        {models && <div className="flex flex-col mt-4">
            <label for="modelId" className=" text-gray-700">Model</label>
            <div className="w-full rounded-lg border border-gray-200 bg-transparent pr-2 text-gray-900">
                <select id="modelId" name="modelId" className="w-full bg-transparent p-2" placeholder="Select a model"
                value={setting.modelId}
                onChange={handleChange}>
                {models.map((m) => (<option key={m} value={m}>{m}</option>))}
                </select>
            </div>
            <div className="mt-3 flex w-full items-center text-left text-gray-700 text-sm">
                <a href="https://platform.openai.com/account/usage" target="_blank" className="hover:text-blue-500">View Account Usage</a>
            </div>
        </div>}
        <div className="flex flex-col mt-4">
            <label for="temperature" className=" text-gray-700">Temperature</label>
            <span className="text-sm text-gray-500">Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.</span><span className="mb-1 mt-2 text-center text-gray-900">{setting.temperature}</span>
            <input id="temperature" name="temperature" className="cursor-pointer" type="range" min="0" max="1" step="0.1" value={setting.temperature} onChange={handleChange} />
            <ul className="w mt-2 flex justify-between px-[24px] pb-8 text-gray-900">
                <li className="flex justify-center"><span className="absolute">Precise</span></li>
                <li className="flex justify-center"><span className="absolute">Neutral</span></li>
                <li className="flex justify-center"><span className="absolute">Creative</span></li>
            </ul>
        </div>
        <button
                    onClick={onSave}
                      className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      disabled={error != null}
                    >
                    Save
                    </button>
    </div>
}