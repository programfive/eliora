import { getCurrentChatId, hasSatisfactionRating } from "@/actions/chat-actions";
import Chat from "@/components/chat"

export default async function ChatPage (){
  const chatId = await getCurrentChatId();
  const isSatisfactionRating = await hasSatisfactionRating(chatId || '');
  return (
    <Chat chatId={chatId || ''}  isSatisfactionRating={isSatisfactionRating}/>
  )
}