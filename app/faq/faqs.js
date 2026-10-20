// FAQ content. Every answer describes how the app actually works; update it
// when the product changes (limits live in utils/interview.js RATE_LIMITS,
// plans in utils/planData.jsx).

export const CATEGORIES = [
  { id: "start", label: "Getting started" },
  { id: "interviews", label: "Interviews" },
  { id: "feedback", label: "Feedback & scores" },
  { id: "privacy", label: "Privacy & data" },
  { id: "plans", label: "Plans" },
];

export const FAQS = [
  {
    id: "what-is-it",
    category: "start",
    q: "What is AI Interview Mocker?",
    a: "A place to practise job interviews out loud. You describe the job, the AI writes five questions for it, you answer each one by speaking, and every answer gets a rating out of 10 with feedback and a model answer.",
  },
  {
    id: "account",
    category: "start",
    q: "Do I need an account?",
    a: "Yes. Creating an account is free, and it keeps your interviews, answers and scores together so you can see your progress over time.",
  },
  {
    id: "browser",
    category: "start",
    q: "Which browser works best?",
    a: "Google Chrome. Your spoken answers are turned into text by the browser's own speech recognition, which Chrome supports best. Allow the microphone when the browser asks.",
  },
  {
    id: "webcam",
    category: "start",
    q: "Do I need a webcam?",
    a: "No. The camera is optional and only shows you to yourself, like a mirror, so you can practise eye contact. Nothing from the camera is recorded or uploaded.",
  },
  {
    id: "questions",
    category: "interviews",
    q: "How are the questions written?",
    a: "From what you enter: the job role, a short job description or tech stack, your years of experience, the interview type and the difficulty. The AI writes five questions for that exact combination, each with a model answer.",
  },
  {
    id: "types",
    category: "interviews",
    q: "What kinds of interviews can I practise?",
    a: "Technical, behavioral, system design, or a mix of technical and behavioral, at easy, medium or hard difficulty, for any role you type in.",
  },
  {
    id: "read-aloud",
    category: "interviews",
    q: "Can the questions be read out to me?",
    a: "Yes. Every question has a \"Read the question aloud\" button, so you can hear it the way an interviewer would ask it.",
  },
  {
    id: "order",
    category: "interviews",
    q: "Do I have to answer the questions in order?",
    a: "No. Jump to any question, come back later, or end the interview early. Questions you didn't answer still show their model answer on the feedback page.",
  },
  {
    id: "pauses",
    category: "interviews",
    q: "What if I pause to think while answering?",
    a: "Take your time. Pauses don't end your answer: it keeps listening until you press Stop, up to three minutes per answer.",
  },
  {
    id: "misheard",
    category: "interviews",
    q: "What if a word is heard wrong, like a technical term?",
    a: "After you press Stop you see your answer as text and can fix any misheard words before submitting it. The rating also focuses on what you meant, not on transcription mistakes. Choosing your English (India, US or UK) helps recognition too.",
  },
  {
    id: "type",
    category: "interviews",
    q: "Can I type my answer instead of speaking?",
    a: "Yes. Choose \"Type your answer instead\". It also works in browsers without speech recognition.",
  },
  {
    id: "retake",
    category: "interviews",
    q: "Can I retake a question?",
    a: "Yes, as often as you like. Record again and the new answer replaces the old one, along with its rating and feedback.",
  },
  {
    id: "rating",
    category: "feedback",
    q: "How is an answer rated?",
    a: "Out of 10, as soon as you submit your answer. You get three to five lines on what to improve and a strong answer to compare with what you said.",
  },
  {
    id: "too-short",
    category: "feedback",
    q: "Why did it say my answer was too short?",
    a: "An answer needs at least a sentence or two to be rated. If nothing was heard, check that the microphone is allowed and that you're using Chrome, or type your answer instead.",
  },
  {
    id: "progress",
    category: "feedback",
    q: "Where can I see my progress?",
    a: "On your dashboard: your average score, the average of your last three interviews, a chart of your score per interview, and your lowest-rated answers so you know what to practise next.",
  },
  {
    id: "recorded",
    category: "privacy",
    q: "Is my voice or video recorded?",
    a: "No audio or video is ever saved. Your browser turns your speech into text (in Chrome, using Google's speech service), and only that text is stored with your interview. The camera stays on your device.",
  },
  {
    id: "ai",
    category: "privacy",
    q: "Who sees my answers?",
    a: "Only you can see your interviews. To write questions and rate answers, the text you enter and the text of your answers are sent to Google's Gemini AI.",
  },
  {
    id: "delete",
    category: "privacy",
    q: "Can I delete an interview?",
    a: "Yes. Delete any interview from your dashboard and its questions, answers and feedback are removed for good.",
  },
  {
    id: "free",
    category: "plans",
    q: "Is it free?",
    a: "Yes, to start. The Free plan includes 10 mock interviews, unlimited retakes and practice questions.",
  },
  {
    id: "monthly",
    category: "plans",
    q: "What does the Monthly plan include?",
    a: "50 mock interviews, unlimited retakes, practice questions, live doubt access and chat support, for $5.99 a month. Checkout currently runs in Stripe test mode, so no real payment is taken.",
  },
  {
    id: "limits",
    category: "plans",
    q: "Is there a limit on how much I can practise in one go?",
    a: "To keep the AI responsive for everyone, each account can create up to 10 interviews and have up to 60 answers rated per hour.",
  },
];
