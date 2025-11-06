"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"

interface DiffViewerProps {
  original: string
  modified: string
}

export function DiffViewer({ original, modified }: DiffViewerProps) {
  const diff = useMemo(() => {
    // Simple word-level diff implementation
    const originalWords = original.split(" ")
    const modifiedWords = modified.split(" ")

    const result: Array<{ type: "added" | "removed" | "unchanged"; text: string }> = []

    let i = 0,
      j = 0

    while (i < originalWords.length || j < modifiedWords.length) {
      if (i >= originalWords.length) {
        // Only modified words left
        result.push({ type: "added", text: modifiedWords[j] })
        j++
      } else if (j >= modifiedWords.length) {
        // Only original words left
        result.push({ type: "removed", text: originalWords[i] })
        i++
      } else if (originalWords[i] === modifiedWords[j]) {
        // Words match
        result.push({ type: "unchanged", text: originalWords[i] })
        i++
        j++
      } else {
        // Words don't match - simple heuristic
        const nextOriginalIndex = originalWords.indexOf(modifiedWords[j], i)
        const nextModifiedIndex = modifiedWords.indexOf(originalWords[i], j)

        if (nextOriginalIndex !== -1 && (nextModifiedIndex === -1 || nextOriginalIndex - i < nextModifiedIndex - j)) {
          // Word was removed
          result.push({ type: "removed", text: originalWords[i] })
          i++
        } else if (nextModifiedIndex !== -1) {
          // Word was added
          result.push({ type: "added", text: modifiedWords[j] })
          j++
        } else {
          // Word was changed
          result.push({ type: "removed", text: originalWords[i] })
          result.push({ type: "added", text: modifiedWords[j] })
          i++
          j++
        }
      }
    }

    return result
  }, [original, modified])

  return (
    <Card className="p-4 bg-muted/30">
      <div className="text-sm leading-relaxed">
        {diff.map((item, index) => (
          <span
            key={index}
            className={`
              ${item.type === "added" ? "bg-green-100 text-green-800 px-1 rounded" : ""}
              ${item.type === "removed" ? "bg-red-100 text-red-800 px-1 rounded line-through" : ""}
              ${item.type === "unchanged" ? "" : ""}
            `}
          >
            {item.text}{" "}
          </span>
        ))}
      </div>
    </Card>
  )
}
