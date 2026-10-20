"use client"
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Panel, ratingTone } from '@/components/app/ui'

// The question being asked, with a navigator whose cells show each
// question's state: open, or its rating once answered.
const QuestionsSection = ({mockInterviewQuestion,activeQuestionIndex,setActiveQuestionIndex,ratings = {}}) => {
  const [speaking, setSpeaking] = useState(false)
  const total = mockInterviewQuestion.length

  // Stop reading the old question when switching questions or leaving the page.
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
      setSpeaking(false)
    }
  }, [activeQuestionIndex])

  const toggleSpeech = (text) => {
    if (!('speechSynthesis' in window)) {
      toast("Sorry, your browser does not support text to speech")
      return
    }
    window.speechSynthesis.cancel()
    if (speaking) {
      setSpeaking(false)
      return
    }
    const speech = new SpeechSynthesisUtterance(text)
    speech.onend = () => setSpeaking(false)
    speech.onerror = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(speech)
  }

  return (
    <Panel className="col-span-12 flex flex-col lg:col-span-7">
      <div className="grid grid-cols-5 gap-2 sm:flex sm:flex-wrap" role="tablist" aria-label="Questions">
        {mockInterviewQuestion.map((question,index)=>{
          const active = activeQuestionIndex === index
          const rating = ratings[index]
          return (
            <button
              key={index}
              role="tab"
              aria-selected={active}
              aria-label={`Question ${index + 1}${rating != null ? `, rated ${rating} out of 10` : ', not answered'}`}
              onClick={()=>setActiveQuestionIndex(index)}
              className={`flex h-12 flex-col items-center justify-center rounded-md text-[14px] transition-colors sm:w-16
                ${active ? 'bg-brand text-white' : 'bg-raised text-ink hover:bg-[#e4e4ee]'}`}
            >
              <span className="num leading-none">{index + 1}</span>
              <span className={`num mt-1 text-[12px] leading-none ${active ? 'text-white/80' : rating != null ? ratingTone(rating) : 'text-faint'}`}>
                {rating != null ? `${rating}/10` : 'open'}
              </span>
            </button>
          )
        })}
      </div>

      <h2 className="mt-8 text-[14px] text-faint">Current question</h2>
      <p className="mt-2 text-[20px] leading-snug text-ink sm:text-[24px]" aria-live="polite">
        {mockInterviewQuestion[activeQuestionIndex]?.question}
      </p>
      <button
        onClick={()=>toggleSpeech(mockInterviewQuestion[activeQuestionIndex]?.question)}
        className="mt-4 inline-flex items-center gap-2 self-start rounded-md px-2 py-1.5 -ml-2 text-[14px] text-muted-foreground transition-colors hover:bg-raised hover:text-ink"
      >
        {speaking ? <VolumeX className="size-4" strokeWidth={1.5} /> : <Volume2 className="size-4" strokeWidth={1.5} />}
        {speaking ? 'Stop reading' : 'Read the question aloud'}
      </button>

      <p className="mt-6 text-[14px] leading-relaxed text-muted-foreground sm:mt-8">
        Answer the way you would in the room: out loud, in full sentences. Each answer is rated as soon as you stop.
      </p>

      <div className="mt-auto flex items-center justify-between pt-8">
        <button
          disabled={activeQuestionIndex === 0}
          onClick={()=>setActiveQuestionIndex(activeQuestionIndex-1)}
          className="inline-flex items-center gap-1 text-[14px] text-ink disabled:text-faint"
        >
          <ChevronLeft className="size-4" /> Previous
        </button>
        <button
          disabled={activeQuestionIndex === total - 1}
          onClick={()=>setActiveQuestionIndex(activeQuestionIndex+1)}
          className="inline-flex items-center gap-1 text-[14px] text-ink disabled:text-faint"
        >
          Next question <ChevronRight className="size-4" />
        </button>
      </div>
    </Panel>
  )
}

export default QuestionsSection
