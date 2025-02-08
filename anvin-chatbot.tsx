"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: number
}

const MotionButton = motion(Button)

export default function Anvin() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "### 🤖 Welcome to Anvin! \n\nI'm here to assist you with **any questions you have**. \n\nHow can I help you today?",
      role: "assistant",
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [isOpen]) // Removed unnecessary dependency: messages

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: input }),
      })

      const data = await response.json()

      // Extract AI "thinking" process and actual response separately
      const thinkingMatch = data.response.match(/<think>(.*?)<\/think>/)
      const aiResponse = data.response.replace(/<think>(.*?)<\/think>/, "").trim()

      const thinkingText = thinkingMatch ? `🧠 **AI is Thinking:**\n\n> *${thinkingMatch[1].trim()}*` : ""

      // Add AI "thinking" process message first
      if (thinkingText) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), content: thinkingText, role: "assistant", timestamp: Date.now() },
        ])
      }

      // Add AI final response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: "assistant",
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error communicating with backend:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: "**⚠ Error:** Unable to fetch response. Please try again later.",
          role: "assistant",
          timestamp: Date.now(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <>
      {/* Chatbot Trigger Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg bg-primary text-white flex items-center justify-center"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>

      {/* Chatbot Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chatbot"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%", transition: { duration: 0.3 } }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-gray-900 shadow-xl rounded-l-lg"
          >
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Anvin AI Assistant</CardTitle>
                <MotionButton
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5" />
                </MotionButton>
              </CardHeader>

              <CardContent className="flex-1 p-4 overflow-hidden min-h-0">
                <ScrollArea className="h-full pr-4">
                  <div className="flex flex-col gap-4">
                    <AnimatePresence>
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <motion.div
                            initial={{
                              opacity: 0,
                              x: message.role === "user" ? 50 : -50,
                            }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{
                              opacity: 0,
                              x: message.role === "user" ? 50 : -50,
                            }}
                            transition={{ duration: 0.3 }}
                            className={cn(
                              "inline-block max-w-[80%] flex-col gap-2 rounded-lg px-4 py-2 shadow-sm",
                              message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                            )}
                          >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                            <span className="text-xs opacity-50">{formatTime(message.timestamp)}</span>
                          </motion.div>
                        </div>
                      ))}
                    </AnimatePresence>
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Chat Input Section */}
              <CardFooter className="p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend()
                  }}
                  className="flex w-full gap-2"
                >
                  <Input placeholder="Type your message..." value={input} onChange={(e) => setInput(e.target.value)} />
                  <motion.button
                    type="submit"
                    className="p-2 rounded-lg bg-primary text-white"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="h-4 w-4" />
                  </motion.button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

