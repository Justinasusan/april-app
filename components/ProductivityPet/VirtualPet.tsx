'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles, Coffee, Moon, Sun, Zap } from 'lucide-react'

// ---------- PET STATES ----------
type PetState = 'idle' | 'sleeping' | 'happy' | 'working' | 'sad' | 'celebrating' | 'playing'

interface PetProps {
  level: number
  xp: number
  happiness: number
  streak: number
  studyHours: number
  tasksCompleted: number
  onPet?: () => void
}

// ---------- CAT COMPONENT ----------
export function VirtualPet({
  level,
  xp,
  happiness,
  streak,
  studyHours,
  tasksCompleted,
  onPet,
}: PetProps) {
  const [state, setState] = useState<PetState>('idle')
  const [isPetting, setIsPetting] = useState(false)
  const [showHearts, setShowHearts] = useState(false)
  const [showSparkles, setShowSparkles] = useState(false)
  const [eyeState, setEyeState] = useState<'open' | 'closed'>('open')
  const [tailPosition, setTailPosition] = useState(0)
  const [earPosition, setEarPosition] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  const [pawPrints, setPawPrints] = useState<{ x: number; y: number; id: number }[]>([])
  const [event, setEvent] = useState<string | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const eventTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // ----- ANIMATION STATE MACHINE -----
  const updateState = useCallback(() => {
    if (happiness < 30) {
      setState('sad')
    } else if (tasksCompleted > 0 && tasksCompleted % 5 === 0) {
      setState('celebrating')
      setTimeout(() => setState('idle'), 3000)
    } else if (studyHours > 0 && studyHours % 1 === 0) {
      setState('working')
    } else if (streak > 0 && streak % 7 === 0) {
      setState('happy')
    } else {
      setState('idle')
    }
  }, [happiness, tasksCompleted, studyHours, streak])

  // ----- RANDOM BEHAVIORS -----
  const randomBehavior = useCallback(() => {
    if (state === 'sleeping') return
    
    const behaviors = [
      'blink',
      'look',
      'stretch',
      'groom',
      'tailSwipe',
      'earTwitch',
    ]
    
    const behavior = behaviors[Math.floor(Math.random() * behaviors.length)]
    
    switch (behavior) {
      case 'blink':
        setEyeState('closed')
        setTimeout(() => setEyeState('open'), 200)
        break
      case 'look':
        setTailPosition(1)
        setTimeout(() => setTailPosition(0), 500)
        break
      case 'stretch':
        setEarPosition(1)
        setTimeout(() => setEarPosition(0), 600)
        break
      case 'tailSwipe':
        setTailPosition(-1)
        setTimeout(() => setTailPosition(0), 300)
        break
      case 'groom':
        setEarPosition(0.5)
        setTimeout(() => setEarPosition(0), 800)
        break
      case 'earTwitch':
        setEarPosition(0.3)
        setTimeout(() => setEarPosition(0), 200)
        break
    }
  }, [state])

  // ----- RANDOM EVENTS -----
  const triggerRandomEvent = useCallback(() => {
    const events = [
      'butterfly',
      'bird',
      'feather',
      'box',
      'laser',
      'tailChase',
      'roll',
      'nap'
    ]
    
    const eventType = events[Math.floor(Math.random() * events.length)]
    setEvent(eventType)
    
    setTimeout(() => {
      setEvent(null)
    }, 4000)
  }, [])

  // ----- EFFECTS -----
  useEffect(() => {
    updateState()
  }, [updateState])

  useEffect(() => {
    // Random behavior interval
    const behaviorInterval = setInterval(randomBehavior, 3000 + Math.random() * 4000)
    
    // Random event interval
    const eventInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        triggerRandomEvent()
      }
    }, 10000 + Math.random() * 10000)
    
    return () => {
      clearInterval(behaviorInterval)
      clearInterval(eventInterval)
    }
  }, [randomBehavior, triggerRandomEvent])

  // ----- MOUSE TRACKING -----
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100 - 50
      const y = ((e.clientY - rect.top) / rect.height) * 100 - 50
      setMouseX(x)
      setMouseY(y)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // ----- INTERACTIONS -----
  const handlePet = () => {
    setIsPetting(true)
    setShowHearts(true)
    if (onPet) onPet()
    
    setTimeout(() => {
      setIsPetting(false)
      setShowHearts(false)
    }, 1000)
  }

  const handleClick = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setPawPrints(prev => [...prev, { x, y, id: Date.now() }])
    setTimeout(() => {
      setPawPrints(prev => prev.filter(p => p.id !== Date.now()))
    }, 1000)
    
    handlePet()
  }

  // ----- RENDER FUNCTIONS -----
  const getCatPose = () => {
    switch (state) {
      case 'sleeping':
        return 'sleeping'
      case 'happy':
        return 'happy'
      case 'working':
        return 'sitting'
      case 'sad':
        return 'sad'
      case 'celebrating':
        return 'jumping'
      case 'playing':
        return 'playing'
      default:
        return 'idle'
    }
  }

  const getEyeExpression = () => {
    if (eyeState === 'closed') return 'closed'
    if (state === 'sleeping') return 'sleeping'
    if (state === 'happy') return 'happy'
    if (state === 'sad') return 'sad'
    return 'open'
  }

  // ----- ANIMATION VARIANTS -----
  const catVariants = {
    idle: {
      y: [0, -2, 0],
      rotate: [0, 0.5, -0.5, 0],
      transition: {
        y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
      },
    },
    sleeping: {
      y: [0, 1, 0],
      scale: [1, 1.02, 1],
      transition: {
        y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
      },
    },
    happy: {
      y: [0, -10, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        y: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
      },
    },
    working: {
      y: [0, -1, 0],
      rotate: [0, 1, 0],
      transition: {
        y: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
      },
    },
    sad: {
      y: [0, 1, 0],
      scale: [1, 0.98, 1],
      transition: {
        y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
      },
    },
    celebrating: {
      y: [0, -20, 0, -15, 0],
      rotate: [0, 10, -10, 10, 0],
      transition: {
        y: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
      },
    },
    playing: {
      y: [0, -15, 0, -10, 0],
      rotate: [0, 15, -15, 10, 0],
      transition: {
        y: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' },
      },
    },
  }

  const tailVariants = {
    idle: {
      rotate: [0, 10, -10, 0],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
    happy: {
      rotate: [0, 20, -20, 0],
      transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
    },
    sad: {
      rotate: [0, -5, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
    sleeping: {
      rotate: [0, 2, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
  }

  const earVariants = {
    idle: {
      rotate: [0, 2, -2, 0],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
    happy: {
      rotate: [0, 5, -5, 0],
      transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
    },
    sad: {
      rotate: [0, -3, 0],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
    listening: {
      rotate: [0, 10, -10, 0],
      transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' },
    },
  }

  // ----- MAIN RENDER -----
  return (
    <div
      ref={containerRef}
      className="relative w-full h-48 bg-gradient-to-b from-[#F8EEF1] to-white rounded-xl overflow-hidden cursor-pointer"
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F8EEF1] to-white" />
      
      {/* Event Overlays */}
      <AnimatePresence>
        {event === 'butterfly' && (
          <motion.div
            initial={{ x: -50, y: -20, opacity: 0 }}
            animate={{ x: 200, y: -40, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3 }}
            className="absolute top-10 left-0 text-3xl"
          >
            🦋
          </motion.div>
        )}
        {event === 'bird' && (
          <motion.div
            initial={{ x: 200, y: -30, opacity: 0 }}
            animate={{ x: -50, y: -50, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5 }}
            className="absolute top-5 right-0 text-3xl"
          >
            🐦
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cat Container */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        variants={catVariants}
        animate={getCatPose()}
        style={{
          cursor: isPetting ? 'pointer' : 'default',
        }}
      >
        {/* Cat SVG */}
        <div className="relative w-32 h-32">
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full"
            style={{
              filter: isHovering ? 'drop-shadow(0 0 20px rgba(109,15,43,0.2))' : 'none',
            }}
          >
            {/* Body */}
            <motion.ellipse
              cx="60"
              cy="80"
              rx="35"
              ry="30"
              fill="#1a1a2e"
              className="transition-colors duration-500"
              style={{
                opacity: state === 'sleeping' ? 0.9 : 1,
              }}
            />
            
            {/* Head */}
            <motion.circle
              cx="60"
              cy="50"
              r="28"
              fill="#2d2d44"
              className="transition-colors duration-500"
            />
            
            {/* Ears */}
            <motion.g variants={earVariants} animate={state === 'sleeping' ? 'idle' : 'idle'}>
              <path d="M38 35 L32 15 L48 28 Z" fill="#2d2d44" />
              <path d="M82 35 L88 15 L72 28 Z" fill="#2d2d44" />
              <ellipse cx="38" cy="25" rx="4" ry="8" fill="#ffb7c5" />
              <ellipse cx="82" cy="25" rx="4" ry="8" fill="#ffb7c5" />
            </motion.g>
            
            {/* Eyes */}
            <motion.g>
              {getEyeExpression() === 'sleeping' ? (
                <>
                  <path d="M48 50 Q53 55 58 50" stroke="#ffb7c5" strokeWidth="2" fill="none" />
                  <path d="M62 50 Q67 55 72 50" stroke="#ffb7c5" strokeWidth="2" fill="none" />
                </>
              ) : getEyeExpression() === 'closed' ? (
                <>
                  <line x1="48" y1="52" x2="58" y2="52" stroke="#ffb7c5" strokeWidth="2" />
                  <line x1="62" y1="52" x2="72" y2="52" stroke="#ffb7c5" strokeWidth="2" />
                </>
              ) : (
                <>
                  <motion.circle
                    cx="53"
                    cy="50"
                    r="6"
                    fill="#ffb7c5"
                    animate={isHovering ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.circle
                    cx="67"
                    cy="50"
                    r="6"
                    fill="#ffb7c5"
                    animate={isHovering ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  />
                  <circle cx="55" cy="48" r="2" fill="#1a1a2e" />
                  <circle cx="69" cy="48" r="2" fill="#1a1a2e" />
                  <circle cx="56" cy="47" r="1" fill="white" />
                  <circle cx="70" cy="47" r="1" fill="white" />
                </>
              )}
            </motion.g>
            
            {/* Nose */}
            <path d="M60 56 L57 60 L63 60 Z" fill="#ffb7c5" />
            
            {/* Mouth */}
            <path d="M57 62 Q60 66 63 62" stroke="#ffb7c5" strokeWidth="1.5" fill="none" />
            
            {/* Whiskers */}
            <line x1="35" y1="55" x2="48" y2="58" stroke="#ffb7c5" strokeWidth="1" opacity="0.5" />
            <line x1="35" y1="60" x2="48" y2="60" stroke="#ffb7c5" strokeWidth="1" opacity="0.5" />
            <line x1="85" y1="55" x2="72" y2="58" stroke="#ffb7c5" strokeWidth="1" opacity="0.5" />
            <line x1="85" y1="60" x2="72" y2="60" stroke="#ffb7c5" strokeWidth="1" opacity="0.5" />
            
            {/* Tail */}
            <motion.path
              d="M95 85 Q110 70 105 50"
              stroke="#1a1a2e"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              variants={tailVariants}
              animate={state === 'sleeping' ? 'sleeping' : state === 'happy' ? 'happy' : state === 'sad' ? 'sad' : 'idle'}
            />
            
            {/* Paws */}
            <ellipse cx="45" cy="95" rx="8" ry="5" fill="#1a1a2e" />
            <ellipse cx="75" cy="95" rx="8" ry="5" fill="#1a1a2e" />
            
            {/* Zzz when sleeping */}
            {state === 'sleeping' && (
              <motion.g
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: -20 }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <text x="75" y="20" fontSize="14" fill="#6D0F2B" opacity="0.6">Z</text>
                <text x="85" y="10" fontSize="12" fill="#6D0F2B" opacity="0.4">z</text>
                <text x="92" y="2" fontSize="10" fill="#6D0F2B" opacity="0.2">z</text>
              </motion.g>
            )}
            
            {/* Hearts when happy */}
            {state === 'happy' && (
              <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <text x="30" y="20" fontSize="16">❤️</text>
                <text x="50" y="10" fontSize="14">❤️</text>
                <text x="70" y="18" fontSize="12">❤️</text>
              </motion.g>
            )}
            
            {/* Coffee when working */}
            {state === 'working' && (
              <motion.g
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <text x="10" y="70" fontSize="20">☕</text>
              </motion.g>
            )}
          </svg>
        </div>
      </motion.div>

      {/* Paw Prints */}
      <AnimatePresence>
        {pawPrints.map((paw) => (
          <motion.div
            key={paw.id}
            initial={{ opacity: 0.6, scale: 0.5, x: paw.x - 10, y: paw.y - 10 }}
            animate={{ opacity: 0, scale: 1.5, x: paw.x - 20, y: paw.y - 30 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute text-2xl"
            style={{ left: paw.x, top: paw.y }}
          >
            🐾
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Floating Particles */}
      <div className="absolute top-2 right-2 text-xs text-gray-400">
        <motion.div
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✨
        </motion.div>
      </div>

      {/* Level Badge */}
      <div className="absolute top-3 left-3">
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-medium text-[#6D0F2B] shadow-sm"
          whileHover={{ scale: 1.05 }}
        >
          Lv.{level}
        </motion.div>
      </div>

      {/* Status Icon */}
      <div className="absolute bottom-2 right-3 text-xs">
        {state === 'sleeping' && <Moon className="h-3 w-3 text-gray-400" />}
        {state === 'happy' && <Sparkles className="h-3 w-3 text-[#6D0F2B]" />}
        {state === 'working' && <Coffee className="h-3 w-3 text-amber-600" />}
        {state === 'sad' && <Sun className="h-3 w-3 text-gray-400" />}
        {state === 'celebrating' && <Zap className="h-3 w-3 text-yellow-500" />}
      </div>

      {/* Interaction Hint */}
      {isHovering && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-[10px] text-gray-400 bg-white/80 px-2 py-0.5 rounded-full"
        >
          Pet me! 🐱
        </motion.div>
      )}

      {/* Floating Hearts */}
      <AnimatePresence>
        {showHearts && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, y: 0, x: (i - 2) * 20, scale: 0.5 }}
                animate={{ opacity: 0, y: -80, x: (i - 2) * 30, scale: 1.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className="absolute text-xl"
                style={{ left: `calc(50% + ${(i - 2) * 15}px)`, top: '40%' }}
              >
                ❤️
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}