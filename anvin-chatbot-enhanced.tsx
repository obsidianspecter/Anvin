"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Loader2 } from "lucide-react"
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

const MotionCard = motion(Card)
const MotionInput = motion(Input)
const MotionButton = motion(Button)

export default function AnvinEnhanced() {
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
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatEndRef]) // Corrected dependency

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-screen bg-gradient-to-br from-background to-secondary"
    >
      <motion.header
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-primary text-primary-foreground py-4 px-6 shadow-lg"
      >
        <motion.h1
          className="text-2xl font-bold"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          Anvin AI Assistant
        </motion.h1>
      </motion.header>
      <main className="flex-grow overflow-hidden p-4">
        <MotionCard
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="h-full flex flex-col rounded-xl border-2 border-primary/20 shadow-xl backdrop-blur-sm bg-background/80"
        >
          <CardContent className="flex-1 p-4 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="flex flex-col gap-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={cn(
                          "inline-block max-w-[80%] rounded-lg px-4 py-2 shadow-md",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground",
                        )}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                        <span className="text-xs opacity-50 block mt-1">{formatTime(message.timestamp)}</span>
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-4 border-t border-primary/20">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex w-full gap-2"
            >
              <MotionInput
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-grow shadow-inner"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
              <MotionButton type="submit" disabled={loading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </>
                )}
              </MotionButton>
            </form>
          </CardFooter>
        </MotionCard>
      </main>
    </motion.div>
  )
}

