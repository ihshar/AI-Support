import {  useState } from 'react'
import { ConversationListProps } from '@/types/chat'
import { Button } from './ui/button'
import { SaveIcon } from 'lucide-react'
import {
  MailCheckIcon,
  MoreHorizontalIcon,
  Trash2Icon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
function ConversationList({newChat,setConversations,currentConversationId,conversations,setCurrentConversationId}:ConversationListProps) {
  const [editingId,setEditingId] = useState("")
  const [updatedTitle,setUpdateTitle] = useState("")

  const handleDeleteConversation  = async(id:string) => {
    // console.log("ID:",id)
    await fetch(`/api/conversations?id=${id}`,{method:"DELETE"})
    // console.log("conversations",conversations);
    
    const filterConversation = conversations.filter((chat)=>chat.id !== id)

    // console.log("filterConversation",filterConversation);
    setConversations(filterConversation)
    if(filterConversation.length === 0){
      newChat()
      return
    }

    if(id === currentConversationId){
      setCurrentConversationId(filterConversation[0].id)
    }

  }

  const handleEditTitle = (id:string) => {
    const chat = conversations.find((chat)=>chat.id === id)
    setEditingId(id)
    setUpdateTitle(chat?.title ?? "")
  }
  
  const handleSaveTitle = async(id:string) =>{
    if(!updatedTitle.trim()) return
    const response = await fetch("/api/conversations",{
      method:"PUT",
      headers:{
        "Content-Type":"applicaton/json"
      },
      body:JSON.stringify({
        id,
        title:updatedTitle
      })
    })
    const updatedConversation = await response.json()
    setConversations(conversations.map((prev)=>prev.id === id ? updatedConversation : prev))
    setEditingId("")
    setUpdateTitle("")
  }
  return (
    <div>{
        conversations.map((chat)=>
          <div className={`${chat.id === currentConversationId ? "bg-gray-200 font-bold pl-5 flex items-center" : "pl-5 flex items-center"}`} key={chat.id} onClick={()=>setCurrentConversationId(chat.id)}>
        {chat.title}{` `}
        ({(chat.messages ?? []).length})
        <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={'link'} size="icon" aria-label="More Options">
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={(e) => {
              e.stopPropagation()
              handleEditTitle(chat.id)
            }}>
                <MailCheckIcon />
                Edit
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" onClick={(e) => {
            e.stopPropagation()
            handleDeleteConversation(chat.id)
          }}>
                <Trash2Icon />
                Trash
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
            {/* <Button variant="destructive" onClick={(e) => {
              e.stopPropagation()
              handleEditTitle(chat.id)
            }}>✏️</Button>
          <Button variant="destructive" onClick={(e) => {
            e.stopPropagation()
            handleDeleteConversation(chat.id)
          }}>Delete</Button> */}
          </>
          {
          editingId === chat.id && 
          <>
          <input value={updatedTitle} onChange={(e)=>setUpdateTitle(e.target.value)}/>
           <Button className='bg-sky-600/10 text-sky-600 hover:bg-sky-600/20 focus-visible:border-sky-600/40 focus-visible:ring-sky-600/20 dark:bg-sky-400/10 dark:text-sky-400 dark:hover:bg-sky-400/20 dark:focus-visible:border-sky-400/40 dark:focus-visible:ring-sky-400/40' onClick={(e) => {
                  e.stopPropagation()
                  handleSaveTitle(chat.id)
                }}>  <SaveIcon />Save</Button>
          </>
          }
          </div>)
        }
    </div>
  )
}

export default ConversationList



