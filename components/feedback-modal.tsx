"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop/Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-slate-50">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">💬 Feedback geben</h2>
              <p className="text-sm text-slate-600 mt-1">
                Teile uns deine Meinung mit und hilf uns, das Dashboard zu verbessern!
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 rounded-full hover:bg-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Google Form iframe */}
          <div className="overflow-auto max-h-[calc(90vh-120px)]">
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSc71JeHbbawzMNRMVIcNncZxrItRyNKFb9L-XRNFiL7QFa4oQ/viewform?embedded=true"
              width="100%"
              height="700"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              className="w-full"
            >
              Wird geladen…
            </iframe>
          </div>
        </div>
      </div>
    </>
  )
}

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Action Button - positioned to left of chatbot */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-24 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-medium z-40 group"
        aria-label="Feedback geben"
      >
        <span className="text-xl">💬</span>
        <span className="hidden sm:inline">Feedback geben</span>
        <span className="inline sm:hidden">Feedback</span>
      </button>

      {/* Modal */}
      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

