"use client"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'
import { Panel, ratingTone } from '@/components/app/ui'

// The question being asked, with a navigator whose cells show each
// question's state: open, or its rating once answered. `interviewer` is
// the speaking interviewer, shown above the question.
const QuestionsSection = ({mockInterviewQuestion,activeQuestionIndex,setActiveQuestionIndex,ratings = {},interviewer}) => {
  const total = mockInterviewQuestion.length

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

      <div className="mt-6">{interviewer}</div>

      <h2 className="mt-6 text-[14px] text-faint">Current question</h2>
      <p className="mt-2 text-[20px] leading-snug text-ink sm:text-[24px]" aria-live="polite">
        {mockInterviewQuestion[activeQuestionIndex]?.question}
      </p>
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
