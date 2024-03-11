import { useEffect, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './index.css'

import { IoMdArrowDropupCircle } from "react-icons/io";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { MdDelete, MdDeleteOutline , MdContentCopy } from "react-icons/md";
import { BiSolidImageAdd } from "react-icons/bi";
import { RxCross2 } from "react-icons/rx";

import {FileUploader} from "react-drag-drop-files"

import Md from 'react-markdown'
import axios from 'axios'

function App() {
  const [loading, setLoading] = useState(false)
  const textAreaRef =  useRef(0)
  const ChatSnippetRef = useRef(null)
  const [textAreaValue, setTextAreaValue] = useState('')
  const [Click, setClick] = useState(false)
  const [Chain, setChain] = useState("default_chain")
  const [Chat, setChat] = useState( [] )
  const [DeleteHover, setDeleteHover] = useState(false)
  const fileTypes = ["JPG", "PNG"]
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null)
 
  


 

  const handleChange = (file) => {
    setFile(file);

    if(file){
      const reader = new FileReader()

      reader.onload =()=>{
          const imageUrl = reader.result
          setImage(imageUrl)

      }
      reader.readAsDataURL(file)
    }


   
  };

  const resizeTextArea = () =>{
    if(!textAreaRef.current){
      return
    }
    textAreaRef.current.style.height = "auto"
    textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`
  }

  
  const GenerateResponse = async() =>{

    setLoading(true)
    if(/^\s*$/.test(textAreaValue)){
      
    }
    if(Chain == "default_chain"){
      const res = await axios.post(`http://localhost:8000/default_chain`, {request: textAreaValue})
      const regex = /```([\s\S]*?)```/g;
      const matches = res.data.response.match(regex);
      const ChatSnapShot = {query: textAreaValue, response: res.data.response,  codes: matches || [], searchType: "default_chain"}
      console.log(ChatSnapShot)  
      setChat(Chat => [ChatSnapShot, ...Chat])
    }
    if(Chain == "rag_chain"){
      const res = await axios.post(`http://localhost:8000/rag_chain`, {request: textAreaValue})
      const regex = /```([\s\S]*?)```/g;
      const matches = res.data.response.match(regex);
      const ChatSnapShot = {query: textAreaValue, response: res.data.response,  codes: matches || [], searchType: "rag_chain"}
      console.log(ChatSnapShot)    
      setChat(Chat => [ChatSnapShot, ...Chat])
    }
    if(Chain == "web_chain"){
      const res = await axios.post(`http://localhost:8000/web_chain`, {request: textAreaValue})
      const regex = /```([\s\S]*?)```/g;
    
      const ChatSnapShot = {query: textAreaValue, response: res.data.response}
     
      setChat(Chat => [ChatSnapShot, ...Chat])
    }
    if(Chain == "vision_chain"){
        const formData = new FormData()
        formData.append("image", file)
        formData.append("request", textAreaValue)

        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };

        const res = await axios.post("http://localhost:8000/vision_chain", formData, config)
       
        const ChatSnapShot = {query: textAreaValue, response: res.data.response, searchType:"vision", imageUrl:image}
        setChat(Chat => [ChatSnapShot, ...Chat])
    }
    
    setLoading(false)
    setTextAreaValue("")
  }

 
  useEffect(()=>{
    resizeTextArea()
    window.addEventListener("resize", resizeTextArea)

    return()=>{
      window.removeEventListener("resize", resizeTextArea)
    }
  })

  return (
    <div className='flex flex-col justify-center align-middle'>
      

    {/* response container */}
    <div className='h-40rem mt-12 lg:w-4/5 w-full self-center overflow-y-scroll p-20 '>
    {image != null ? (<div className='flex justify-center align-middle'><div className='self-center w-96 h-72 bg-cover bg-center rounded-lg relative' style={{backgroundImage:`url(${image})`}}>  <RxCross2 onClick={()=>{setImage(null)}} className='absolute top-2 right-2  cursor-pointer z-40 text-white bg-black/50 rounded-full p-1 h-25px w-25px '></RxCross2> </div></div>) : "" }
      
      {(loading) ? (<div className='flex flex-col w-full'>
                    <div className='p-4 w-24 skeleton'></div>
                    <div className='mt-6 p-2 w-full skeleton'></div>
                    <div className='mt-1  p-2 w-5/6 skeleton'></div>
                    <div className='mt-1 p-2 w-4/6 skeleton'></div>
                    <div className='mt-1 p-2 w-3/6 skeleton'></div>
                    <div className='mt-1 p-2 w-3/6 skeleton'></div>
      </div>) : Chat.map((context, idx) => {
              
              return (<><div  ref={(Chat.length - 1 == idx) ? ChatSnippetRef : null} className={`flex flex-col text-left mt-5 relative ${(Chat.length != 1 && idx != Chat.length-1) ? ` `:``} `} key={idx}>
                    <div className='flex flex-row justify-center align-middle absolute top-0 right-0 p-1'>
                      <div className='p-1' onMouseEnter={()=>{setDeleteHover(true)}} onMouseLeave={()=>{setDeleteHover(false)}}> 
                      { DeleteHover ? <MdDelete className='cursor-pointer' onClick={()=>{const updatedChat = Chat.filter((c,uidx)=> uidx != idx); setChat(updatedChat)}} ></MdDelete> :   <MdDeleteOutline className='cursor-pointer' ></MdDeleteOutline> } </div>
                    
                    </div>
                    <span className='bg-emerald-300 font-bold w-16 flex justify-center align-middle rounded-full text-black/80'>{(context.searchType == "rag_chain") ? "RAG" : ""}{(context.searchType == "vision_chain") ? "VISION" : ""}</span>
                  <div className=' text-white/80  flex flex-row  mt-2'>
                    <div className='w-5px h-5px p-1'>
                      <div className='p-2  bg-gradient-to-r from-pink-400 to-purple-600 rounded-full mr-2'></div>
                      </div> <div className='whitespace-pre-wrap font-bold'>{context.query}</div></div>
                      {(context.imageUrl) ? (<div className='w-full mt-5 flex justify-center align-middle'><div className='self-center w-56 h-36 bg-cover bg-center rounded-lg relative' style={{backgroundImage:`url(${context.imageUrl})`}}></div></div>):''}
                  <div className='whitespace-pre-wrap mt-2 font-normal p-10'> 
                 
                    <Md>{context.response}</Md>
               
                  </div>
                  <br />

                  {/* {context.codes.map((code, id)=>{
                          return (<pre className=' p-3 mb-5 rounded-md bg-black  relative' key={id}>
                            <MdContentCopy className=' absolute top-3 right-3 hover:text-white cursor-pointer rounded-full'></MdContentCopy>
                            {code}</pre>)
                      })} */}
              </div>
                      
                      
                      
              </>)
          })}
   
    </div>


      {/* footer */}
      <div  className='absolute backdrop-blur-xl  bottom-0 w-full p-3 flex flex-col justify-center align-middle'>
        
         
         <div className='flex flex-row w-full justify-center align-middle'>
         <button  className='flex justify-center align-middle p-2'>
         <FileUploader type={fileTypes} handleChange={handleChange} name="file" className='self-center'>
            <BiSolidImageAdd className={`text-emerald-300 font-thin ml-1 self-center h-8 w-8 ${Click ? `` : ``} `}>
              
            </BiSolidImageAdd>
            </FileUploader>
         </button>
         <button className='flex justify-center align-middle p-2'>
          <div className="dropdown dropdown-top self-center">
              <div tabIndex={0} role="button" className="btn "><PiDotsThreeOutlineVerticalFill className='self-center font-semibold'></PiDotsThreeOutlineVerticalFill></div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu  shadow bg-base-100 w-36 rounded-box ">
                <li><a className={`${Chain == 'default_chain' ? `text-emerald-300`: ``}`} onClick={()=>{setChain("default_chain")}}>Default</a></li>
                <li><a className={`${Chain == 'rag_chain' ? `text-emerald-300`: ``}`} onClick={()=>{setChain("rag_chain")}}>RAG</a></li>
                <li><a className={`${Chain == 'vision_chain' ? `text-emerald-300`: ``}`} onClick={()=>{setChain("vision_chain")}}>Vision chain</a></li>
                </ul>
                </div>
         </button>
        <div className='flex w-5/6 lg:w-3/5  p-2 flex-row justify-center align-middle border border-white/50 rounded-full'>
        
          <textarea className='w-full text-white/70 bg-transparent    focus:outline-none focus:border-none   resize-none overflow-hidden' value={textAreaValue} ref={textAreaRef} onChange={(e)=>{setTextAreaValue(e.target.value); resizeTextArea()}} >
          </textarea>
         
         <button className='flex justify-center align-middle p-2' onClick={()=>{GenerateResponse()}}>
            <IoMdArrowDropupCircle className={`${ /^\s*$/.test(textAreaValue) ? `text-white`: `text-emerald-300`} font-thin self-center h-8 w-8 ${Click ? `` : ``} `}></IoMdArrowDropupCircle>
         </button>
         
        </div>
        </div>
      </div>
    </div>
  )
}

export default App

