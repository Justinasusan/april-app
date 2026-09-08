'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const ACTIVATION_LINES = [
  "Yes Susan? I'm listening!",
  "Right here, Susan! What do you need?",
  "At your service, Susan!",
  "I'm ready, Susan!",
  "Listening, Susan. How can I help?",
]

export function useVoiceAssistant() {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [isActivated, setIsActivated] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const [debug, setDebug] = useState('Press the mic button')
  
  const recognitionRef = useRef<any>(null)
  const isMountedRef = useRef(true)

  // Check for browser support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSupport = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
      setIsSupported(hasSupport)
      setDebug(hasSupport ? 'Press the mic button to start' : 'Not supported')
    }
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported) return

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    if (!SpeechRecognition) return

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch (e) {}
        recognitionRef.current = null
      }

      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onstart = () => {
        console.log('🎤 Started')
        setIsListening(true)
        setDebug('Listening...')
        setIsActivated(true)
      }

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript.toLowerCase()
          if (event.results[i].isFinal) {
            finalTranscript += text
          } else {
            interimTranscript += text
          }
        }

        const fullText = finalTranscript || interimTranscript
        if (!fullText) return

        console.log('🎤 Heard:', fullText)
        setTranscript(fullText)
        setDebug(`Heard: "${fullText}"`)

        // Process command directly
        if (fullText) {
          processCommand(fullText)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.log('🎤 Error:', event.error)
        if (event.error === 'not-allowed') {
          setDebug('Please allow microphone')
        } else if (event.error === 'no-speech') {
          setDebug('No speech detected')
        } else {
          setDebug(`Error: ${event.error}`)
        }
        setIsListening(false)
        setIsActivated(false)
      }

      recognitionRef.current.onend = () => {
        console.log('🎤 Ended')
        setIsListening(false)
        setIsActivated(false)
        setDebug('Press the mic button to start')
      }

      recognitionRef.current.start()
      setDebug('Listening...')

    } catch (error) {
      console.error('Start error:', error)
      setDebug(`Error: ${error}`)
    }
  }, [isSupported])

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
        setIsListening(false)
        setIsActivated(false)
        setDebug('Press the mic button to start')
      } catch (error) {
        console.log('Stop error:', error)
      }
    }
  }, [])

  const processCommand = useCallback((text: string) => {
    console.log('🔊 Processing:', text)
    const lower = text.toLowerCase().trim()
    
    let commandResponse = ''

    // Navigation
    if (lower.includes('dashboard') || lower.includes('home')) {
      commandResponse = 'Opening dashboard'
      setTimeout(() => { window.location.href = '/dashboard' }, 500)
    } else if (lower.includes('academic') || lower.includes('study')) {
      commandResponse = 'Opening academic tracker'
      setTimeout(() => { window.location.href = '/dashboard/academic' }, 500)
    } else if (lower.includes('placement') || lower.includes('dsa') || lower.includes('coding')) {
      commandResponse = 'Opening placement coach'
      setTimeout(() => { window.location.href = '/dashboard/placement' }, 500)
    } else if (lower.includes('internship') || lower.includes('work')) {
      commandResponse = 'Opening internship manager'
      setTimeout(() => { window.location.href = '/dashboard/internship' }, 500)
    } else if (lower.includes('finance') || lower.includes('money') || lower.includes('budget')) {
      commandResponse = 'Opening finance tracker'
      setTimeout(() => { window.location.href = '/dashboard/finance' }, 500)
    }
    // Help
    else if (lower.includes('help') || lower.includes('what can you do') || lower.includes('commands')) {
      commandResponse = 'Commands: Dashboard, Academic, Placement, Internship, Finance, Hello, Good Morning, Good Night, Thank You, Stop.'
    }
    // Greetings
    else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      commandResponse = `Hello Susan! ${ACTIVATION_LINES[Math.floor(Math.random() * ACTIVATION_LINES.length)]}`
    } else if (lower.includes('good morning') || lower.includes('morning')) {
      commandResponse = 'Good morning Susan! Ready to be productive?'
    } else if (lower.includes('good night') || lower.includes('night')) {
      commandResponse = 'Good night Susan! Rest well.'
    }
    // Thank you
    else if (lower.includes('thank you') || lower.includes('thanks')) {
      commandResponse = `You're welcome Susan!`
    }
    // Stop
    else if (lower.includes('stop') || lower.includes('exit') || lower.includes('cancel')) {
      commandResponse = 'Stopping voice assistant'
      setTimeout(() => stopListening(), 1000)
    }
    // Default
    else {
      commandResponse = `You said: "${text}". Try saying "Help" for commands.`
    }

    setResponse(commandResponse)
    if (commandResponse) {
      speak(commandResponse)
    }
  }, [stopListening])

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    
    setIsSpeaking(true)
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    } catch (error) {
      console.error('Speak error:', error)
      setIsSpeaking(false)
    }
  }, [])

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, stopListening, startListening])

  return {
    isListening,
    isSpeaking,
    transcript,
    response,
    isActivated,
    isSupported,
    debug,
    toggleListening,
    speak,
    processCommand,
  }
}