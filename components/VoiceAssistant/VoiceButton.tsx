'use client'

import { useVoiceAssistant } from '@/hooks/useVoiceAssistant'
import { Mic, MicOff, Volume2 } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function VoiceButton() {
  const { 
    isListening, 
    isSpeaking, 
    transcript, 
    response,
    isActivated,
    isSupported,
    debug,
    toggleListening
  } = useVoiceAssistant()
  
  if (!isSupported) {
    return null
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleListening}
          className={`relative p-4 rounded-full shadow-lg transition-all duration-300 ${
            isListening ? 'bg-red-500 animate-pulse' :
            isSpeaking ? 'bg-blue-500' :
            'bg-purple-500 hover:bg-purple-600'
          }`}
          aria-label="Voice Assistant"
        >
          {isSpeaking ? (
            <Volume2 className="w-6 h-6 text-white" />
          ) : isListening ? (
            <Mic className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {isActivated && (
        <Card className="fixed bottom-24 right-6 z-50 max-w-sm p-4 shadow-xl bg-white dark:bg-gray-800 border-2 border-purple-500/30 min-w-[280px]">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                isListening ? 'bg-red-500' :
                isSpeaking ? 'bg-blue-500' :
                'bg-purple-500'
              }`} />
              <span className="text-sm font-medium">
                {isListening ? '🔴 Listening...' :
                 isSpeaking ? '🔊 Speaking...' :
                 '💤 Click mic to start'}
              </span>
            </div>

            {transcript && (
              <div className="text-sm text-gray-600 dark:text-gray-300 font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
                📝 "{transcript}"
              </div>
            )}

            {response && (
              <div className="text-sm text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                💬 {response}
              </div>
            )}

            <div className="text-xs font-mono text-gray-400 bg-gray-50 dark:bg-gray-800 p-1 rounded">
              {debug}
            </div>

            <div className="text-xs text-gray-400 space-y-1">
              <p>🎤 Press the mic button and say a command</p>
              <div className="flex gap-1 flex-wrap">
                <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px]">Dashboard</span>
                <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px]">Academic</span>
                <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px]">Placement</span>
                <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px]">Internship</span>
                <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px]">Finance</span>
                <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px]">Help</span>
              </div>
            </div>

            {isListening && (
              <div className="flex items-center justify-center gap-1 h-6">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-red-500 rounded-full animate-voice-wave"
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      height: `${Math.random() * 16 + 8}px`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      <style jsx>{`
        @keyframes voice-wave {
          0%, 100% { height: 8px; }
          50% { height: 24px; }
        }
        .animate-voice-wave {
          animation: voice-wave 0.8s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}